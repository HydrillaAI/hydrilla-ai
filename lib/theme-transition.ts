import { flushSync } from "react-dom";

export type ThemeChoice = "light" | "dark" | "system";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function resolveChoice(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Switch theme with the new palette growing out of `origin` as a circle (View Transitions).
 * next-themes applies its class in an effect, so the class is set here first; the snapshot then
 * captures the finished theme, WebGL canvases included. Falls back to an instant switch.
 */
export function switchTheme(setTheme: (theme: string) => void, choice: ThemeChoice, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const next = resolveChoice(choice);
  const current = root.classList.contains("dark") ? "dark" : "light";
  const doc = document as ViewTransitionDocument;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (next === current || !doc.startViewTransition || reduced) {
    setTheme(choice);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  // Far enough to cover the farthest corner from the origin.
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.style.setProperty("--theme-reveal-x", `${x}px`);
  root.style.setProperty("--theme-reveal-y", `${y}px`);
  root.style.setProperty("--theme-reveal-r", `${radius}px`);
  root.classList.add("theme-reveal");

  const transition = doc.startViewTransition(() => {
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
    flushSync(() => setTheme(choice));
  });
  void transition.finished.finally(() => root.classList.remove("theme-reveal"));
}
