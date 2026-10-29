/**
 * Wall-clock limits for one Water generation.
 *
 * WHY THESE NUMBERS
 * A generation runs inside the HTTP function that accepted it (`waitUntil` in
 * routes/codeSculpt.ts). On Vercel that function is killed at `maxDuration`, and a killed
 * run leaves the job in RUN until the stale check below expires it. So the harness budget
 * must always finish *inside* the function limit, with time left to persist the result.
 *
 * - The function currently runs with a 60 s `maxDuration`. 800 s is the generally-available
 *   maximum on Pro/Enterprise with Fluid compute; raise both values together if the plan
 *   allows it.
 * - Fluid compute bills Active CPU only while code runs; time spent waiting on the LLM
 *   (almost all of a Water run) is not billed as CPU, only as cheap provisioned memory.
 *   A long `maxDuration` therefore does not make a Water run expensive — CPU work does.
 *   Polling a run that is already dead does: every status request costs CPU.
 *
 * KEEP IN SYNC
 * `FUNCTION_MAX_DURATION_S` must equal `config.maxDuration` in `api/index.ts`. Vercel reads
 * that export statically, so it has to stay a literal there and cannot import this file.
 *
 * WHEN TO CHANGE THIS
 * Move the pass loop onto Vercel Workflow (`"use workflow"` / `"use step"`) once a single
 * run needs more than ~13 minutes, or when a crash mid-run must resume instead of fail.
 * Each pass then becomes a durable step with its own function budget, and these limits
 * only apply per step. That needs a build step for the Workflow SWC transform, which this
 * backend's plain `tsc` build does not have yet.
 */

export const FUNCTION_MAX_DURATION_S = 60;

/** Reserved after the harness returns: GLB checks, DB writes, thumbnail, response log. */
const PERSIST_RESERVE_S = 10;

export const HARNESS_WALL_BUDGET_MS = (FUNCTION_MAX_DURATION_S - PERSIST_RESERVE_S) * 1000;

/** Slack for clock skew and the final DB write landing after the function limit. */
const STALE_GRACE_S = 30;

/**
 * A RUN job with no progress write for this long is treated as dead. Only the function
 * that accepted the job writes to it, and Vercel kills that function at `maxDuration`, so
 * no healthy run can go longer than the function limit without a write. Tying this to the
 * limit ends the job (and the client's polling) soon after a killed run instead of
 * leaving it in RUN for many minutes.
 */
export const STALE_RUN_MS = (FUNCTION_MAX_DURATION_S + STALE_GRACE_S) * 1000;
