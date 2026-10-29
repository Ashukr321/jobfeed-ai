import path from "node:path";

export const settings = {
  inputDir: path.resolve(process.env.JOBFEED_INPUT_DIR ?? "data/input"),
};
