"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { BlurReveal } from "@/components/ui/BlurReveal";
import CtaSection from "@/components/sections/CtaSection";
import { HEADING_FONT, HEADING_WEIGHT } from "@/lib/fonts";

/**
 * Below-the-fold homepage sections.
 * Text-heavy blocks SSR so crawlers and LLMs see Features, Pricing, FAQ, and How it works.
 * Video/image showcases stay client-only to keep the initial document small.
 */
const IndustrySection = dynamic(() => import("@/components/sections/IndustrySection"), {
  loading: () => <div className="min-h-[320px] w-full" aria-hidden />,
});
const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks"), {
  loading: () => <div className="min-h-[280px] w-full" aria-hidden />,
});
const Showcase = dynamic(() => import("@/components/sections/Showcase"), {
  ssr: false,
  loading: () => <div className="min-h-[480px] w-full" aria-hidden />,
});
const AppShowcase = dynamic(() => import("@/components/sections/AppShowcase"), {
  ssr: false,
  loading: () => <div className="min-h-[200px] w-full" aria-hidden />,
});
const FeaturesSection = dynamic(() => import("@/components/sections/FeaturesSection"), {
  loading: () => <div className="min-h-[320px] w-full" aria-hidden />,
});
const WhyHydrilla = dynamic(() => import("@/components/sections/WhyHydrilla"), {
  loading: () => <div className="min-h-[200px] w-full" aria-hidden />,
});
const PricingSection = dynamic(() => import("@/components/sections/PricingSection"), {
  loading: () => <div className="min-h-[400px] w-full" aria-hidden />,
});
const FAQSection = dynamic(() => import("@/components/sections/FAQSection"), {
  loading: () => <div className="min-h-[300px] w-full" aria-hidden />,
});

function MissionSection() {
  return (
    <section className="relative w-full bg-white px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 md:px-8 md:pt-14 md:pb-24">
      <div className="max-w-6xl mx-auto">
        <BlurReveal
          as="p"
          stagger={0.09}
          duration={0.8}
          blurPx={14}
          className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-tight tracking-tight text-[#111]"
          style={{ fontFamily: HEADING_FONT, fontWeight: HEADING_WEIGHT }}
        >
          Our mission is to build intelligent workflows that accelerate animation and 3D production.
        </BlurReveal>
      </div>
    </section>
  );
}

export default function HomeBelowFold() {
  return (
    <>
      <MissionSection />

      <div id="solutions">
        <Suspense fallback={<div className="min-h-[320px]" aria-hidden />}>
          <IndustrySection />
        </Suspense>
      </div>

      <Suspense fallback={<div className="min-h-[280px]" aria-hidden />}>
        <HowItWorks />
      </Suspense>

      <Showcase />

      <Suspense fallback={<div className="min-h-[200px]" aria-hidden />}>
        <AppShowcase />
      </Suspense>

      <div id="features">
        <Suspense fallback={<div className="min-h-[320px]" aria-hidden />}>
          <FeaturesSection />
        </Suspense>
      </div>

      <Suspense fallback={<div className="min-h-[200px]" aria-hidden />}>
        <WhyHydrilla />
      </Suspense>

      <div id="pricing">
        <Suspense fallback={<div className="min-h-[400px]" aria-hidden />}>
          <PricingSection />
        </Suspense>
      </div>

      <Suspense fallback={<div className="min-h-[300px]" aria-hidden />}>
        <FAQSection />
      </Suspense>

      <CtaSection />
    </>
  );
}
