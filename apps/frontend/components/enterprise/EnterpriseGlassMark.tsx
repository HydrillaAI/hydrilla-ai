"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const GlassIconReveal = dynamic(
  () => import("@/components/ui/liquid-glass-logo-reveal").then((mod) => mod.GlassIconReveal),
  { ssr: false },
);

/**
 * The Hydrilla mark resolving out of liquid glass, once, on the closing band.
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
    <div ref={slotRef} className="h-[clamp(340px,56vh,620px)] w-full bg-black">
      {isNear ? (
        <GlassIconReveal
          logo="/logo-hydrilla/hydrilla-mark.png"
          label="Hydrilla AI logo"
          look="dark"
          background="#000000"
          logoColor="#ffffff"
          tileSize={340}
          loop={false}
          className="h-full w-full cursor-default"
        />
      ) : null}
    </div>
  );
}
