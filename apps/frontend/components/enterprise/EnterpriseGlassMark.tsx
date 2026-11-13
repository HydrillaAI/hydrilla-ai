"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const GlassIconReveal = dynamic(
  () => import("@/components/ui/liquid-glass-logo-reveal").then((mod) => mod.GlassIconReveal),
  { ssr: false },
);

/**
 * The hyd01 flower resolving out of liquid glass, once, on the closing band. The glass is light and
 * the flower keeps its own glossy colours, so the canvas must paint the band's exact grey.
 * Mounts only as the band approaches: the shader and the logo's distance field
 * are too heavy to spend on visitors who never scroll this far.
 */
export function EnterpriseGlassMark() {
  const slotRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={slotRef} className="h-[clamp(340px,56vh,620px)] w-full bg-[#f5f5f7]">
      {isNear ? (
        <GlassIconReveal
          logo="/hyd01.png"
          label="Hydrilla AI logo"
          look="light"
          background="#f5f5f7"
          originalColors
          tileSize={340}
          logoScale={0.68}
          finalScale={0.9}
          loop={false}
          className="h-full w-full cursor-default"
        />
      ) : null}
    </div>
  );
}
