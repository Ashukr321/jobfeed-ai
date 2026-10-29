import assert from "node:assert/strict";
import { test } from "node:test";
import { dedupeByUrl, toJob, type Job } from "../src/jobs/normalize.ts";
import { isCandidateJob } from "../src/jobs/prefilter.ts";

test("maps both jobfeed layouts and skips non-job rows", () => {
  assert.deepEqual(toJob({ Company: "Stripe", "Job Title": "SDE", City: "Bengaluru", Posted: "2026-10-28", "Apply Link": "u1" }, "Jobs"), {
    source: "Jobs", company: "Stripe", title: "SDE", location: "Bengaluru, India", type: "", category: "", posted: "2026-10-28", salary: "", url: "u1",
  });
  assert.equal(toJob({ Platform: "Himalayas", Title: "Frontend Engineer", Location: "Worldwide", Apply: "u2" }, "Himalayas")?.source, "Himalayas");
  assert.equal(toJob({ Company: "Hinge Health", Website: "https://x" }, "Companies"), null);
});

test("dedupes by apply URL keeping the first", () => {
  const a = { title: "A", url: "u" } as Job;
  const b = { title: "B", url: "u" } as Job;
  const c = { title: "C", url: "v" } as Job;
  assert.deepEqual(dedupeByUrl([a, b, c]), [a, c]);
});

test("keeps early-career web roles open to India, drops senior/intern/other-country ones", () => {
  const job = (title: string, location = "India") => ({ title, location }) as Job;
  for (const keep of [job("React JS Developer"), job("Frontend Engineer", "Worldwide"), job("Full Stack Developer", ""), job("Software Engineer, New Grad", "Bengaluru, India")]) {
    assert.ok(isCandidateJob(keep), keep.title);
  }
  for (const drop of [job("Senior Frontend Engineer"), job("Sr. Software Engineer"), job("React Lead_Offshore"), job("SDE-III Frontend, Mobile"),
    job("Staff Software Engineer - Backend - 7+ years"), job("Web Developer Intern", "Worldwide"), job("Frontend Engineer, Ads", "USA"),
    job("Backend Engineer (Node.js / TypeScript)", "Berlin"), job("Account Executive")]) {
    assert.ok(!isCandidateJob(drop), drop.title);
  }
});
