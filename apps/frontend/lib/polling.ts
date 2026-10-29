/**
 * Helpers for status polling. Every poll is a backend function call billed as
 * Active CPU, so polls pause while the tab is in the background and resume
 * when the user comes back.
 */

/** True while the page is in a background tab. */
export function isPageHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

/** Resolves once the page is visible (immediately if it already is). */
export function waitUntilVisible(): Promise<void> {
  if (!isPageHidden()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const onChange = () => {
      if (isPageHidden()) {
        return;
      }
      document.removeEventListener("visibilitychange", onChange);
      resolve();
    };
    document.addEventListener("visibilitychange", onChange);
  });
}
