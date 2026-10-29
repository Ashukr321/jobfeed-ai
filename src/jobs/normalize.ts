import type { SheetRow } from "../excel/read-rows.ts";

export interface Job {
  source: string;
  company: string;
  title: string;
  location: string;
  type: string;
  category: string;
  posted: string;
  salary: string;
  url: string;
}

/**
 * Maps a row from either jobfeed layout (remote sheets: Title/Apply, India sheet: Job Title/City/Apply Link)
 * to a Job. Returns null for rows that are not jobs, e.g. the Companies sheet.
 */
export function toJob(row: SheetRow, sheet: string): Job | null {
  const title = row["Title"] ?? row["Job Title"];
  const url = row["Apply"] ?? row["Apply Link"];
  if (!title || !url) return null;
  return {
    source: row["Platform"] ?? sheet,
    company: row["Company"] ?? "",
    title,
    // jobfeed's India sheet only lists Indian cities, so its City column is tagged with the country.
    location: row["City"] ? `${row["City"]}, India` : (row["Location"] ?? ""),
    type: row["Type"] ?? "",
    category: row["Role / Category"] ?? "",
    posted: row["Posted"] ?? "",
    salary: row["Salary"] ?? "",
    url,
  };
}

/** Keeps the first job per apply URL (jobfeed repeats Himalayas jobs in the Remote Jobs sheet). */
export function dedupeByUrl(jobs: Job[]): Job[] {
  return [...new Map(jobs.toReversed().map((j) => [j.url, j])).values()].toReversed();
}
