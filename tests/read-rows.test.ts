import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { readExcelRows } from "../src/excel/read-rows.ts";

test("reads every sheet keyed by header, flattening links and dates", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "jobfeed-ai-"));
  const file = path.join(dir, "jobs.xlsx");
  const wb = new ExcelJS.Workbook();
  const jobs = wb.addWorksheet("Jobs");
  jobs.addRow(["Company", "Posted", "Salary", "Apply"]);
  jobs.addRow(["Stripe ", new Date("2026-10-28T00:00:00Z"), null, { text: "Apply", hyperlink: "https://stripe.com/jobs/1" }]);
  jobs.addRow([]);
  wb.addWorksheet("Companies").addRow(["Company"]);
  await wb.xlsx.writeFile(file);

  assert.deepEqual(await readExcelRows(file), [
    {
      file,
      sheet: "Jobs",
      headers: ["Company", "Posted", "Salary", "Apply"],
      rows: [{ Company: "Stripe", Posted: "2026-10-28T00:00:00.000Z", Salary: "", Apply: "https://stripe.com/jobs/1" }],
    },
    { file, sheet: "Companies", headers: ["Company"], rows: [] },
  ]);
  await assert.rejects(readExcelRows(path.join(dir, "old.xls")), /legacy \.xls/);
  fs.rmSync(dir, { recursive: true });
});
