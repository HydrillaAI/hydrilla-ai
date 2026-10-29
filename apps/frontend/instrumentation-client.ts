import { loadPostHog } from "./lib/posthog-browser";

// PostHog starts after the page has loaded and gone idle, so it doesn't compete
// with first paint and hydration. An earlier track() call loads it sooner.
const start = () => {
  const host = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  };
  if (host.requestIdleCallback) host.requestIdleCallback(() => void loadPostHog(), { timeout: 3000 });
  else window.setTimeout(() => void loadPostHog(), 1000);
};

if (document.readyState === "complete") start();
else window.addEventListener("load", start, { once: true });
