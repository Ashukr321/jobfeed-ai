import path from "node:path";

export const settings = {
  inputDir: path.resolve(process.env.JOBFEED_INPUT_DIR ?? "data/input"),
  outputDir: path.resolve("data/output"),
  // Under private/, which .gitignore keeps out of Git (it holds login cookies).
  browserProfileDir: path.resolve(process.env.BROWSER_PROFILE_DIR ?? "private/browser-profile"),
};
