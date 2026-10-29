import ExcelJS from "exceljs";
import path from "node:path";

/** One data row, keyed by the sheet's header row; every value is a trimmed string ("" when empty). */
export type SheetRow = Record<string, string>;

export interface SheetData {
  file: string;
  sheet: string;
  headers: string[];
  rows: SheetRow[];
}

/** Flattens an ExcelJS cell value: hyperlinks to their URL, dates to ISO, rich text/formulas to their text. */
function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return String(value).trim();
  if ("hyperlink" in value) return value.hyperlink;
  if ("richText" in value) return value.richText.map((r) => r.text).join("").trim();
  if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
  if ("error" in value) return "";
  return String(value).trim();
}

/**
 * Reads every worksheet of an .xlsx file, using row 1 as headers.
 * Rows with no values are dropped. ExcelJS cannot read legacy .xls files; those throw.
 */
export async function readExcelRows(file: string): Promise<SheetData[]> {
  if (path.extname(file).toLowerCase() === ".xls") throw new Error(`${file}: legacy .xls is not supported, re-save as .xlsx`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  return wb.worksheets.map((ws) => {
    const headers: string[] = [];
    ws.getRow(1).eachCell((cell, col) => (headers[col - 1] = cellText(cell.value)));
    const rows: SheetRow[] = [];
    ws.eachRow((row, n) => {
      if (n === 1) return;
      const record: SheetRow = {};
      headers.forEach((h, i) => h && (record[h] = cellText(row.getCell(i + 1).value)));
      if (Object.values(record).some(Boolean)) rows.push(record);
    });
    return { file, sheet: ws.name, headers: headers.filter(Boolean), rows };
  });
}
