import { waitUntil } from "@vercel/functions";

type Hold = (task: Promise<unknown>) => void;

/**
 * The Node server keeps running after the response, so the promise can finish on its own.
 * On Vercel the invocation freezes when the response is sent unless waitUntil is holding it.
 */
export function afterResponse(task: Promise<unknown>, hold: Hold = waitUntil): void {
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) {
    hold(task);
  }
}
