import fs from "node:fs";
import path from "node:path";

/** Every .xlsx/.xls under `dir` (including jobfeed's dated sub-folders), skipping Excel's ~$ lock files. */
export function discoverExcelFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((f) => /\.xlsx?$/i.test(f) && !path.basename(f).startsWith("~$"))
    .map((f) => path.join(dir, f))
    .sort();
}
