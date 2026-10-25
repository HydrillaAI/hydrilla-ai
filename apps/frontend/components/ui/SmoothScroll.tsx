"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Slow, weighted wheel scrolling for desktop. Touch devices keep native
 * scrolling (Lenis leaves them alone), so phones stay fully responsive.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduce.matches || coarse.matches) return;

    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.85,
      smoothWheel: true,
      anchors: true,
      prevent: (node) =>
        Boolean(node.closest("[data-lenis-prevent], .cl-modalBackdrop, .cl-rootBox, [role='dialog']")),
    });

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
