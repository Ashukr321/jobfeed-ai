import { parseArgs } from "node:util";
import path from "node:path";
import { settings } from "./config/settings.ts";
import { discoverExcelFiles } from "./excel/discover-files.ts";
import { runJobfeed, type JobfeedChoice } from "./jobfeed/runner.ts";

const USAGE = `Usage: npm start -- <command> [options]

Commands:
  fetch    Run jobfeed and save its Excel files into the input folder
  import   List the Excel files found in the input folder

Options:
  --input <dir>     Input folder (default: ${settings.inputDir})
  --choice <1|2|3>  fetch only: 1 daily jobs, 2 remote companies, 3 both (default 3)`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { input: { type: "string" }, choice: { type: "string", default: "3" } },
});
const inputDir = values.input ? path.resolve(values.input) : settings.inputDir;

function listFiles() {
  const files = discoverExcelFiles(inputDir);
  console.log(`${files.length} Excel file(s) in ${inputDir}`);
  for (const f of files) console.log(`  ${path.relative(inputDir, f)}`);
}

switch (positionals[0]) {
  case "fetch":
    if (!["1", "2", "3"].includes(values.choice)) throw new Error("--choice must be 1, 2 or 3");
    await runJobfeed(inputDir, values.choice as JobfeedChoice);
    listFiles();
    break;
  case "import":
    listFiles();
    break;
  default:
    console.log(USAGE);
}
