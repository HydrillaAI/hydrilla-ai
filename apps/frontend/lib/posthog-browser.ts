import type { PostHog } from "posthog-js";
import { getPostHogHost, getPostHogToken } from "./posthog";

/**
 * posthog-js (~230 KB) loads as its own chunk, off the critical path.
 * The first call loads and initialises it; later calls reuse that instance.
 */
let client: Promise<PostHog | null> | null = null;

export function loadPostHog(): Promise<PostHog | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  client ??= import("posthog-js")
    .then(({ default: posthog }) => {
      const token = getPostHogToken();
      if (!token) return null;
      posthog.init(token, {
        api_host: getPostHogHost(),
        defaults: "2026-01-30",
        person_profiles: "identified_only",
      });
      return posthog;
    })
    .catch(() => null);
  return client;
}

/** Runs `use` once PostHog is ready. Analytics must never break product flows. */
export function withPostHog(use: (posthog: PostHog) => void): void {
  void loadPostHog().then((posthog) => {
    if (!posthog) return;
    try {
      use(posthog);
    } catch {
      /* ignore */
    }
  });
}
