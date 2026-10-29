import { withPostHog } from "./posthog-browser";

/**
 * Product analytics helpers.
 * Capture actions only — never send prompt text, image URLs, or PII beyond plan/ids.
 */
export function track(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window === "undefined") return;
  // withPostHog swallows errors: analytics must never break product flows.
  withPostHog((posthog) => posthog.capture(event, properties));
}

/** True when an API error is an insufficient-credits / paywall response. */
export function isPaywallError(message: string | null | undefined): boolean {
  if (!message) return false;
  return /insufficient credits|subscribe or buy more credits/i.test(message);
}
