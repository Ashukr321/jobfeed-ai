import fs from "node:fs";
import { parseArgs } from "node:util";
import path from "node:path";
import { settings } from "./config/settings.ts";
import { openBrowser } from "./browser/browser-manager.ts";
import { discoverExcelFiles } from "./excel/discover-files.ts";
import { readExcelRows, type SheetData } from "./excel/read-rows.ts";
import { dedupeByUrl, toJob } from "./jobs/normalize.ts";
import { isCandidateJob } from "./jobs/prefilter.ts";
import { runJobfeed, type JobfeedChoice } from "./jobfeed/runner.ts";

const USAGE = `Usage: npm start -- <command> [options]

Commands:
  fetch    Run jobfeed and save its Excel files into the input folder
  import   Read the Excel files in the input folder and show rows per sheet
  shortlist  Filter the jobs to early-career web roles open to India, save to data/output
  browser  Open the automation browser (log in to job portals once; the session is kept)

Options:
  --input <dir>     Input folder (default: ${settings.inputDir})
  --choice <1|2|3>  fetch only: 1 daily jobs, 2 remote companies, 3 both (default 3)
  --url <url>       browser only: page to open first`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { input: { type: "string" }, choice: { type: "string", default: "3" }, url: { type: "string" } },
});
const inputDir = values.input ? path.resolve(values.input) : settings.inputDir;

/** Reads every Excel file in the input folder, warning about (and skipping) files that cannot be read. */
async function readAllSheets(): Promise<SheetData[]> {
  const sheets: SheetData[] = [];
  for (const file of discoverExcelFiles(inputDir)) {
    try {
      sheets.push(...(await readExcelRows(file)));
    } catch (err) {
      console.warn(`Skipped ${path.relative(inputDir, file)}: ${(err as Error).message}`);
      process.exitCode = 1;
    }
  }
  return sheets;
}

function listFiles() {
  const files = discoverExcelFiles(inputDir);
  console.log(`${files.length} Excel file(s) in ${inputDir}`);
  for (const f of files) console.log(`  ${path.relative(inputDir, f)}`);
}

switch (positionals[0]) {
  case "fetch":
    if (!["1", "2", "3"].includes(values.choice)) throw new Error("--choice must be 1, 2 or 3");
    if (!(await runJobfeed(inputDir, values.choice as JobfeedChoice))) {
      console.warn("Warning: jobfeed reported a failed section (see ✖ above); listing whatever it saved.");
      process.exitCode = 1;
    }
    listFiles();
    break;
  case "import":
    for (const s of await readAllSheets()) {
      console.log(`${path.relative(inputDir, s.file)} [${s.sheet}]: ${s.rows.length} rows — ${s.headers.join(", ")}`);
    }
    break;
  case "shortlist": {
    const jobs = dedupeByUrl((await readAllSheets()).flatMap((s) => s.rows.map((r) => toJob(r, s.sheet)).filter((j) => j !== null)));
    const shortlist = jobs.filter(isCandidateJob);
    const out = path.join(settings.outputDir, `shortlist-${new Date().toLocaleDateString("en-CA")}.json`);
    fs.mkdirSync(settings.outputDir, { recursive: true });
    fs.writeFileSync(out, JSON.stringify(shortlist, null, 2));
    console.log(`${jobs.length} unique jobs, ${shortlist.length} kept -> ${out}`);
    break;
  }
  case "browser": {
    const context = await openBrowser();
    const page = context.pages()[0] ?? (await context.newPage());
    if (values.url) await page.goto(values.url);
    console.log(`Browser open (profile: ${settings.browserProfileDir}). Close the window when done.`);
    await new Promise((resolve) => context.once("close", resolve));
    break;
  }
  default:
    console.log(USAGE);
}
