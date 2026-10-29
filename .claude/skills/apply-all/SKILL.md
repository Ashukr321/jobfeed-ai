---
name: apply-all
description: Score today's shortlist and then apply to every "apply" job one by one in the user's own Chrome. Use when the user asks to apply to all jobs, run the whole pipeline, or runs /apply-all (started by `npm start -- run`).
---

# Apply to all shortlisted jobs

`npm start -- run` has already fetched the jobs into `data/input` and written `data/output/shortlist-<date>.json`. Don't fetch again.

1. **Score.** Follow the `analyze-jobs` skill from step 2 (the shortlist exists), and write `data/output/analysis-<date>.md`. If today's report already exists, reuse it.
2. **Queue.** Take every `apply` row in today's report **and in earlier `analysis-*.md` reports** (so jobs left over from an earlier run aren't lost; analyze-jobs never re-scores them). Drop any row already in `data/output/applications.json` with any status: compare URLs without `utm_` params against both `url` and `applyUrl`, and compare company + title ignoring case and punctuation. List the same job only once. Sort by score, highest first. Tell the user how many jobs are queued and name the first one.
3. **Apply, one at a time.** For each job, follow the `apply-job` skill end to end (fill, auto-submit, log to `applications.json`, close its tabs) before starting the next.
   - If a job needs the user (login, OTP, CAPTCHA, a missing fact, a draft to approve), ask and wait. If the user says skip, log it as `skipped` and move on.
   - If a job fails (dead link, job closed, a form you can't fill), log `failed` or `manual_action_required` with a short note and move on. Don't stop the whole run.
4. **Summary.** When the queue is empty, show a table: Company | Title | Status | Note. Give counts per status, and list the jobs the user still has to finish by hand.

All the rules in `apply-job` still apply. Never submit the same job twice, and never invent facts.
