import type { Job } from "./normalize.ts";

// Cheap title/location rules that run before any Claude scoring; they only drop obvious misses.
const ROLE = /front.?end|react|next\.?js|javascript|typescript|node|mern|full.?stack|software (engineer|developer)|web develop|\bsde\b/i;
// (?![a-z]) instead of a trailing \b so "React Lead_Offshore" still counts as a lead role.
const TOO_SENIOR_OR_INTERN = /\b(senior|sr|lead|principal|staff|manager|head|director|architect|intern|internship)(?![a-z])|\b(ii|iii|iv)\b|sde-?(2|3)|\b([3-9]|\d\d)\+ ?y(ea)?rs/i;
const LOCATION_OK = /india|worldwide|anywhere|global|^remote$|apac|asia/i;

/** True for early-career web/full-stack roles open to someone in India (or with no location given). */
export function isCandidateJob(job: Job): boolean {
  return ROLE.test(job.title) && !TOO_SENIOR_OR_INTERN.test(job.title) && (!job.location || LOCATION_OK.test(job.location));
}
