import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { discoverExcelFiles } from "../src/excel/discover-files.ts";

test("finds Excel files in nested jobfeed folders and skips lock/other files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "jobfeed-ai-"));
  const day = path.join(dir, "jobfeed_2026-10-29");
  fs.mkdirSync(day);
  for (const f of ["india_jobs.xlsx", "old.XLS", "~$india_jobs.xlsx", "notes.txt"]) fs.writeFileSync(path.join(day, f), "");

  assert.deepEqual(discoverExcelFiles(dir), [path.join(day, "india_jobs.xlsx"), path.join(day, "old.XLS")]);
  assert.deepEqual(discoverExcelFiles(path.join(dir, "missing")), []);
  fs.rmSync(dir, { recursive: true });
});
