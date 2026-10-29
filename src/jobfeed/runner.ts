import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import { createRequire } from "node:module";

// jobfeed has no `exports` map, so its CLI entry can be resolved from the installed dependency.
const JOBFEED_BIN = createRequire(import.meta.url).resolve("jobfeed/bin/jobfeed.js");

/** 1 = daily jobs, 2 = remote companies, 3 = both (jobfeed's own menu). */
export type JobfeedChoice = "1" | "2" | "3";

/** Runs the jobfeed CLI into `baseDir`, answering its two prompts over stdin. */
export async function runJobfeed(baseDir: string, choice: JobfeedChoice = "3"): Promise<void> {
  fs.mkdirSync(baseDir, { recursive: true });
  const child = spawn(process.execPath, [JOBFEED_BIN], { stdio: ["pipe", "inherit", "inherit"] });
  child.stdin.end(`${choice}\n${baseDir}\n`);
  const [code] = await once(child, "close");
  if (code !== 0) throw new Error(`jobfeed exited with code ${code}`);
}
