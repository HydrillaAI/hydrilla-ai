"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { savePendingHeroPrompt } from "@/lib/pendingHeroPrompt";
import { HEADING_FONT, HEADING_WEIGHT, BODY_FONT, DESCRIPTION_WEIGHT } from "@/lib/fonts";
import { PromptBox } from "../PromptBox";
import { HeroStage } from "./HeroStage";

const ROTATING_PROMPTS = [
  "Make a sword with fire",
  "A vintage camera on a wooden table",
  "A cute robot character for a game",
];

const ROTATE_INTERVAL_MS = 3800;

export default function Hero() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % ROTATING_PROMPTS.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const handleSubmit = () => {
    const value = prompt.trim();
    if (!value || !isLoaded) return;

    savePendingHeroPrompt(value);

    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=" + encodeURIComponent("/app/studio"));
      return;
    }

    router.push("/app/studio");
  };

  return (
    <section className="relative w-full overflow-x-hidden bg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(215,228,248,0.9),transparent_58%)]" />
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(0,12,31,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,12,31,0.045)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_18%,transparent_72%)]" />
        <div className="hero-drift-a absolute top-16 left-1/2 hidden h-[420px] w-[min(880px,92vw)] -translate-x-1/2 rounded-full bg-[#d5e4f8]/70 blur-3xl lg:block" />
        <div className="hero-drift-b absolute top-[42%] -left-24 hidden h-72 w-72 rounded-full bg-[#e4eefb] blur-3xl lg:block" />
        <div className="hero-drift-c absolute top-[30%] -right-20 hidden h-80 w-80 rounded-full bg-[#c9daf3]/55 blur-3xl lg:block" />
      </div>

      <div className="relative mx-auto flex h-dvh w-full flex-col items-center gap-6 overflow-hidden pt-24 pb-3 sm:gap-7 sm:pt-28 md:gap-8 md:pt-32 lg:h-auto lg:gap-9 lg:overflow-visible lg:pt-36 lg:pb-16 xl:pb-16">
        <div className="hero-rise flex w-full flex-col items-center gap-5 px-4 text-center sm:gap-6 sm:px-6 md:px-8 lg:px-10">
          <h1
            className="text-balance font-medium text-[#000c1f]"
            style={{
              fontFamily: HEADING_FONT,
              fontWeight: HEADING_WEIGHT,
              fontSize: "clamp(3.4rem, calc(2.15rem + 5vw), 6.5rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
            }}
          >
            Create 3D Assets
          </h1>

          <p
            className="max-w-xl text-pretty text-lg leading-[1.5] tracking-[-0.015em] text-[#000c1f]/68 sm:text-xl md:text-[1.65rem]"
            style={{ fontFamily: BODY_FONT, fontWeight: DESCRIPTION_WEIGHT }}
          >
            AI-powered 3D generation for creators, studios, and platforms.
          </p>
        </div>

        <div
          className="hero-rise flex w-full min-h-0 flex-1 flex-col px-0 min-[690px]:px-[clamp(0px,calc((100vw-690px)*0.32),1.5rem)] md:px-6 lg:flex-none lg:px-8 xl:px-10"
          style={{ "--hero-rise-y": "18px", animationDelay: "80ms" } as CSSProperties}
        >
          <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col md:max-w-3xl lg:block lg:h-auto lg:max-w-4xl xl:max-w-4xl">
            <HeroStage reduceMotion={reduceMotion}>
              <PromptBox
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleSubmit}
                placeholder={`Try ‘${ROTATING_PROMPTS[placeholderIndex]}’`}
                variant="hero"
                disabled={false}
              />
            </HeroStage>
          </div>
        </div>
      </div>
    </section>
  );
}
