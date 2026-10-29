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

/** An entry of data/output/applications.json, written by the apply-job skill. */
export interface Application {
  url: string;
  applyUrl?: string;
  company: string;
  title: string;
}

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** The link without utm_ tracking params or #fragment, so the same posting matches across days. */
export function normalizeUrl(link: string): string {
  const url = URL.parse(link);
  if (!url) return link;
  url.hash = "";
  for (const p of [...url.searchParams.keys()]) if (p.startsWith("utm_")) url.searchParams.delete(p);
  return url.href.replace(/\/$/, "");
}

/** Keeps the first job per apply URL (jobfeed repeats Himalayas jobs in the Remote Jobs sheet). */
export function dedupeByUrl(jobs: Job[]): Job[] {
  return [...new Map(jobs.toReversed().map((j) => [normalizeUrl(j.url), j])).values()].toReversed();
}

/** Drops jobs already in applications.json (any status), matched by job or apply URL, or by company + title. */
export function dropApplied(jobs: Job[], applications: Application[]): Job[] {
  const seen = new Set(applications.flatMap((a) => [normalizeUrl(a.url), a.applyUrl && normalizeUrl(a.applyUrl), `${words(a.company)}|${words(a.title)}`]));
  // A blank company would make every job with the same title look applied, so only URLs count then.
  return jobs.filter((j) => !seen.has(normalizeUrl(j.url)) && !(j.company && seen.has(`${words(j.company)}|${words(j.title)}`)));
}
