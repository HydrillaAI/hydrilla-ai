"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DESCRIPTION_WEIGHT, GEIST_FONT, SANS_FONT, SECTION_WEIGHT } from "@/lib/fonts";

const INK = "#000c1f";

/** DeepMind promo-card carousel — video backgrounds on every card. */
const FEATURE_CARDS = [
  {
    id: "promo-capabilities",
    title: "Capabilities",
    text: "Direct a 3D build from a brief, in real time",
    tone: "dark" as const,
    video: "/water/hydrilla-hoverbot-water-4k-15s.mp4",
    videoType: "video/mp4" as const,
    learnMoreHref: "#capabilities",
    tryHref: "/workspace",
  },
  {
    id: "promo-applications",
    title: "Applications",
    text: "For artists, game developers, and studios",
    tone: "dark" as const,
    video: "https://storage.googleapis.com/gdm-deepmind-com-prod-public/media/3cYlYfozIFs5_Ngj/home__gemini-omni__promo_P63yVkI.webm#t=0.1",
    videoType: "video/webm" as const,
    poster: "https://lh3.googleusercontent.com/ggTBCe5uQmOhiCXtVnODnHTtu-vpX1kNuPxYpbvKMwIgh6YHpf0J4znRfsvS_6f0nOtUbZrDy3PwwXyIZhepDYlF9qxB7XRDTNoCs0i66clbB3WOcw",
    learnMoreHref: "#applications",
  },
  {
    id: "promo-get-started",
    title: "Get started",
    text: "Open Water Agent in your workspace",
    tone: "light" as const,
    video: "https://storage.googleapis.com/gdm-deepmind-com-prod-public/media/XQg8T1xtrC8iTlyH/genie4__homepage__city-mirage__9X16__261027.webm#t=0.1",
    videoType: "video/webm" as const,
    poster: "https://lh3.googleusercontent.com/sKnCS_imLidSxSrvtWjLlQU-nuEqKYBazU3YRu_olGkcuT6gYYii5SHl-9JY6y7tXTv5BIj1ZDDO5vS-yHe6_YDN__ZO419EK2QZG-9bhF_6Xu-f",
    learnMoreHref: "#get-started",
    tryHref: "/workspace",
  },
  {
    id: "promo-plan",
    title: "Plan first",
    text: "See the pieces before the build starts",
    tone: "navy" as const,
    video: "https://storage.googleapis.com/gdm-deepmind-com-prod-public/media/rC8sZkug1fhkL2as/gemini-robotics-2__home__poster.webm#t=0.1",
    videoType: "video/webm" as const,
    poster: "https://lh3.googleusercontent.com/npPksYXN5W7pZ2Vos1g7tLMs04VjMSmdr1cqdLSJOD41F_hxbKuyRhXcwiNNKXfg4r7yEyCggLz96NUf77fb45XhBd9fIyZIoOrKVxk0uWtYLJNyIg",
    learnMoreHref: "#capabilities",
  },
  {
    id: "promo-limitations",
    title: "Limitations",
    text: "The edges we want you to know about",
    tone: "dark" as const,
    video: "https://storage.googleapis.com/gdm-deepmind-com-prod-public/media/5AKJMabWs1eUnNa9/gemini-audio__home__dark.webm#t=0.1",
    videoType: "video/webm" as const,
    poster: "https://lh3.googleusercontent.com/3GzdHRvcwrvTKRPV90Pn4-0DHIR6sxWxmhOxSCzUbK_U0wAkVMFQ1QI2WnC-iWxL_FRFunHrf8e6x_wLEvMXFFU5gA5WWkP_BjKdl17pNGnYjUUe",
    learnMoreHref: "#limitations",
  },
  {
    id: "promo-responsibility",
    title: "Responsibility",
    text: "Your model key. Your provider policies.",
    tone: "mist" as const,
    video: "https://storage.googleapis.com/gdm-deepmind-com-prod-public/media/M42lHs_BAsbgFhuZ/dmi_illustration_introducing_the_dmi_constant_motion.webm#t=0.1",
    videoType: "video/webm" as const,
    poster: "https://lh3.googleusercontent.com/mWKezasD2AM7dAix15wf_h4FHEkw0gAtOdtq1KIU31aNxmT3QtXzmF_A4fK7GXfBHIEzrGnmnIRzHX8LiCxMyon2NFs4w3FQMDU95mBudPd7tC6iPw",
    learnMoreHref: "#responsibility",
  },
] as const;

const PROMO_CARD_SURFACE: Record<(typeof FEATURE_CARDS)[number]["tone"], string> = {
  dark: "bg-[#0b1428]",
  navy: "bg-[#002664]",
  light: "bg-white",
  mist: "bg-[#d6e5fa]",
};

/** Genie-style section nav, adapted for Water Agent. */
const SECTION_TABS = [
  { id: "capabilities", label: "Capabilities" },
  { id: "applications", label: "Applications" },
  { id: "get-started", label: "Get started" },
  { id: "limitations", label: "Limitations" },
  { id: "responsibility", label: "Responsibility" },
] as const;

const SHOWCASE_VIDEOS = [
  { id: "video-1", label: "Video 1", src: "/water/hydrilla-hoverbot-water-4k-15s.mp4" },
  { id: "video-2", label: "Video 2" },
  { id: "video-3", label: "Video 3" },
  { id: "video-4", label: "Video 4" },
] as const;

const APPLICATIONS = [
  {
    title: "Artists",
    line: "Brief the look in language, then refine silhouette and materials in the same thread.",
  },
  {
    title: "Game developers",
    line: "Name the parts you need for a set, then iterate on each piece without leaving the preview.",
  },
  {
    title: "Studios",
    line: "Run volume iteration on your own model key, without spending the shared Hydrilla credit pool.",
  },
] as const;

const LIMITATIONS = [
  {
    title: "Plan fidelity",
    line: "Complex briefs can still miss a piece or over-split. Check the plan before you lean on the build.",
  },
  {
    title: "Pass depth",
    line: "Fast and Standard stop early on purpose. Studio is the only tier that runs every pass.",
  },
  {
    title: "Preview vs production mesh",
    line: "The browser preview is for direction. It is not a finished production asset out of the box.",
  },
  {
    title: "Provider limits",
    line: "Your model key’s rate limits, cost, and availability apply. Water does not soften those.",
  },
  {
    title: "Long threads",
    line: "Very long refine chains can drift. Starting a clean brief is sometimes faster than one more edit.",
  },
  {
    title: "Reference images",
    line: "A reference helps, but Water still interprets. Exact pixel match is not guaranteed.",
  },
] as const;

function Display({
  as: Tag,
  children,
  className,
  style,
  id,
}: {
  as: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={className}
      style={{
        fontFamily: SANS_FONT,
        fontWeight: SECTION_WEIGHT,
        color: INK,
        letterSpacing: "-0.035em",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

function SectionPillNav({
  activeId,
  onSelect,
  sticky,
}: {
  activeId: string;
  onSelect: (id: (typeof SECTION_TABS)[number]["id"]) => void;
  sticky?: boolean;
}) {
  return (
    <div
      className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0a0e16]/85 p-1 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        sticky ? "" : "mx-auto"
      }`}
      role="navigation"
      aria-label="Water Agent sections"
    >
      {SECTION_TABS.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={selected ? "true" : undefined}
            onClick={() => onSelect(tab.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb1e3] sm:px-5 sm:text-[14px] ${
              selected ? "bg-white text-[#000c1f]" : "text-white/70 hover:text-white"
            }`}
            style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function WaterShowcase() {
  const reduceMotion = useReducedMotion();
  const [markReady, setMarkReady] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [activeSection, setActiveSection] = useState<(typeof SECTION_TABS)[number]["id"]>("capabilities");
  const [sectionNavVisible, setSectionNavVisible] = useState(false);
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  const sectionStartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setMarkReady(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const track = cardsTrackRef.current;
    if (!track) return;
    track.scrollLeft = 0;
  }, []);

  useEffect(() => {
    const start = sectionStartRef.current;
    if (!start) return;

    const sync = () => {
      const show = start.getBoundingClientRect().top <= 8;
      setSectionNavVisible(show);
      document.body.dataset.waterSectionNav = show ? "true" : "false";
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      delete document.body.dataset.waterSectionNav;
    };
  }, []);

  useEffect(() => {
    const nodes = SECTION_TABS.map((tab) => document.getElementById(tab.id)).filter(
      (node): node is HTMLElement => Boolean(node)
    );
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id as (typeof SECTION_TABS)[number]["id"] | undefined;
        if (top) setActiveSection(top);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] }
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);

  const goToSection = (id: (typeof SECTION_TABS)[number]["id"]) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="bg-white text-[#000c1f]">
      <AnimatePresence>
        {sectionNavVisible ? (
          <motion.div
            className="fixed inset-x-0 top-0 z-[60] flex justify-center px-3 pt-4 sm:pt-5"
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionPillNav activeId={activeSection} onSelect={goToSection} sticky />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="relative isolate h-dvh min-h-[100svh] overflow-hidden bg-black text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,#0a1630_0%,#05070d_48%,#000000_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_62%_38%,rgba(126,177,227,0.16),transparent_68%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_30%_60%,rgba(0,38,100,0.28),transparent_70%)]" />
        </div>

        <div aria-hidden className="absolute inset-0 z-0 flex items-center justify-center">
          <motion.div
            className="relative h-[min(68vw,68dvh)] w-[min(68vw,68dvh)] cursor-default"
            initial={reduceMotion ? { opacity: 1, rotate: 0, scale: 1 } : { opacity: 0, rotate: -28, scale: 0.92 }}
            animate={
              markReady
                ? reduceMotion
                  ? { opacity: 1, rotate: 0, scale: 1 }
                  : { opacity: 1, rotate: 360, scale: 1 }
                : undefined
            }
            transition={
              reduceMotion
                ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                : { duration: 1.85, ease: [0.16, 1, 0.3, 1] }
            }
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          >
            <Image
              src="/hyd01-mark-hero.png"
              alt=""
              fill
              priority
              unoptimized
              sizes="70vw"
              className="object-contain drop-shadow-[0_20px_80px_rgba(126,177,227,0.18)]"
            />
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto flex h-full min-h-[100svh] w-full max-w-[80rem] flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6 sm:pt-32 md:pt-36 lg:px-8 lg:pb-24">
          <motion.div
            className="flex w-full flex-col items-center"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7eb1e3]" style={{ fontFamily: SANS_FONT }}>
              Water Agent
            </p>
            <Display
              as="h1"
              className="mt-6 max-w-[12ch] text-balance"
              style={{
                fontSize: "clamp(3.5rem, calc(2.1rem + 5vw), 6.75rem)",
                lineHeight: 0.9,
                color: "#ffffff",
                textShadow: "0 8px 40px rgba(0,0,0,0.55)",
              }}
            >
              Direct the 3D.
            </Display>
            <p
              className="mt-6 max-w-2xl text-pretty text-lg leading-[1.45] tracking-[-0.015em] sm:text-xl md:text-[1.65rem]"
              style={{ fontFamily: GEIST_FONT, fontWeight: DESCRIPTION_WEIGHT, color: "rgba(255,255,255,0.72)" }}
            >
              Describe the asset. Water plans the pieces, builds them in passes, and stays with you while you refine the preview.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/workspace"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] text-[#000c1f] transition-colors hover:bg-[#d6e5fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb1e3] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
              >
                Open Water Agent
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#feature-cards"
                className="inline-flex h-12 items-center rounded-full border border-white/20 bg-white/5 px-6 text-[15px] text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb1e3]"
                style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
              >
                See the cards
              </a>
            </div>
          </motion.div>

          <motion.a
            href="#feature-cards"
            className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb1e3]"
            style={{ fontFamily: SANS_FONT }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <motion.span
              className="inline-block"
              animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
              transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              Scroll
            </motion.span>
          </motion.a>
        </div>
      </section>

      <section
        id="feature-cards"
        aria-label="Feature cards"
        className="relative isolate h-dvh min-h-[100svh] overflow-hidden bg-black text-white"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,#0a1224_0%,#05070d_55%,#000000_100%)]" />
        </div>

        <div className="relative z-10 flex h-full min-h-[100svh] flex-col justify-center">
          <div
            ref={cardsTrackRef}
            className="embla flex h-[min(78dvh,46rem)] snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 pb-2 pl-4 pr-4 sm:gap-5 sm:scroll-pl-6 sm:pl-6 sm:pr-6 lg:scroll-pl-8 lg:pl-8 lg:pr-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Carousel"
            aria-roledescription="carousel"
            role="region"
          >
            {FEATURE_CARDS.map((card, index) => {
              const onMedia = card.tone === "dark" || card.tone === "navy" || Boolean(card.video);
              const tryHref = "tryHref" in card ? card.tryHref : undefined;
              const poster = "poster" in card ? card.poster : undefined;
              return (
                <motion.article
                  key={card.id}
                  data-feature-card
                  className={`relative aspect-[2/3] h-full shrink-0 snap-start overflow-hidden rounded-[1.75rem] shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:rounded-[2rem] ${PROMO_CARD_SURFACE[card.tone]}`}
                  initial={reduceMotion ? false : { opacity: 0, x: index === 0 ? 24 : 56 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="absolute inset-0">
                    <video
                      className="media-video media-video--custom h-full w-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={poster}
                      preload="metadata"
                    >
                      <source src={card.video} type={card.videoType} />
                    </video>
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/70"
                    />
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
                    <div>
                      <h3
                        className={`m-0 text-[1.35rem] leading-tight tracking-[-0.03em] sm:text-[1.55rem] ${
                          onMedia ? "text-white" : "text-[#000c1f]"
                        }`}
                        style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
                      >
                        {card.title}
                      </h3>
                      <p
                        className={`mt-2 max-w-[18ch] text-[14px] leading-snug sm:text-[15px] ${
                          onMedia ? "text-white/75" : "text-[#000c1f]/65"
                        }`}
                        style={{ fontFamily: GEIST_FONT }}
                      >
                        {card.text}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={card.learnMoreHref}
                        className={`inline-flex h-9 items-center rounded-full px-4 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb1e3] ${
                          onMedia
                            ? "bg-white text-[#000c1f] hover:bg-[#d6e5fa]"
                            : "bg-[#000c1f] text-white hover:bg-[#002664]"
                        }`}
                        style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
                        aria-label={`Learn more about ${card.title}`}
                      >
                        Learn more
                      </a>
                      {tryHref ? (
                        <Link
                          href={tryHref}
                          className={`inline-flex h-9 items-center rounded-full border px-4 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb1e3] ${
                            onMedia
                              ? "border-white/35 bg-white/10 text-white hover:bg-white/15"
                              : "border-[#000c1f]/20 bg-white/70 text-[#000c1f] hover:bg-white"
                          }`}
                          style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
                          aria-label={`Try ${card.title}`}
                        >
                          Try
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        ref={sectionStartRef}
        aria-labelledby="capabilities-heading"
        className="relative isolate scroll-mt-24 min-h-[100svh] overflow-hidden bg-[#05070d] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,#0a1630_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[80rem] flex-col">
          {!sectionNavVisible ? <SectionPillNav activeId={activeSection} onSelect={goToSection} /> : <div className="h-11" aria-hidden />}

          <motion.div
            className="mt-14 max-w-3xl sm:mt-16"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Display
              as="h2"
              id="capabilities-heading"
              className="m-0 max-w-[16ch] text-balance"
              style={{
                fontSize: "clamp(2.5rem, 1.6rem + 3vw, 4.5rem)",
                lineHeight: 0.98,
                color: "#ffffff",
              }}
            >
              Direct the build in real time.
            </Display>
            <p
              className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg"
              style={{ fontFamily: GEIST_FONT, fontWeight: DESCRIPTION_WEIGHT }}
            >
              Brief the asset, watch the plan, and refine the preview in the same thread. Pick a clip below — sources go in later.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 grid gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-[minmax(9rem,14rem)_1fr]"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0" role="tablist" aria-label="Showcase videos">
              {SHOWCASE_VIDEOS.map((item, index) => {
                const selected = index === activeVideo;
                const src = "src" in item ? item.src : undefined;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="capabilities-video-stage"
                    onClick={() => setActiveVideo(index)}
                    className={`relative aspect-[16/10] w-[9.5rem] shrink-0 overflow-hidden rounded-2xl bg-[#121826] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb1e3] sm:w-[11rem] lg:w-full ${
                      selected
                        ? "ring-2 ring-white shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
                        : "ring-1 ring-white/10 hover:ring-white/25"
                    }`}
                  >
                    <span className="sr-only">{item.label}</span>
                    <video
                      src={src}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>

            <div
              id="capabilities-video-stage"
              role="tabpanel"
              className="relative min-h-[18rem] overflow-hidden rounded-[1.5rem] bg-[#121826] ring-1 ring-white/10 sm:min-h-[24rem] sm:rounded-[1.75rem] lg:min-h-[min(52dvh,32rem)]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={SHOWCASE_VIDEOS[activeVideo].id}
                  className="absolute inset-0"
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <video
                    src={"src" in SHOWCASE_VIDEOS[activeVideo] ? SHOWCASE_VIDEOS[activeVideo].src : undefined}
                    className="h-full w-full object-cover"
                    autoPlay={"src" in SHOWCASE_VIDEOS[activeVideo]}
                    muted
                    loop={"src" in SHOWCASE_VIDEOS[activeVideo]}
                    playsInline
                    preload={"src" in SHOWCASE_VIDEOS[activeVideo] ? "auto" : "none"}
                    controls={false}
                    aria-label={SHOWCASE_VIDEOS[activeVideo].label}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="applications"
        aria-labelledby="applications-heading"
        className="scroll-mt-24 bg-[#05070d] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-32"
      >
        <div className="mx-auto w-full max-w-[80rem]">
          <Display
            as="h2"
            id="applications-heading"
            className="m-0 max-w-[14ch] text-balance"
            style={{ fontSize: "clamp(2.5rem, 1.6rem + 3vw, 4.25rem)", lineHeight: 0.98, color: "#ffffff" }}
          >
            Future applications.
          </Display>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65" style={{ fontFamily: GEIST_FONT }}>
            Water Agent is built for people who brief 3D in language and stay in the loop while the preview changes.
          </p>
          <ul className="mt-12 grid list-none gap-4 p-0 md:grid-cols-3">
            {APPLICATIONS.map((item, index) => (
              <motion.li
                key={item.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="m-0 text-[1.45rem] text-white" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT, letterSpacing: "-0.03em" }}>
                  {item.title}
                </h3>
                <p className="mt-3 text-[16px] leading-relaxed text-white/60" style={{ fontFamily: GEIST_FONT }}>
                  {item.line}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="get-started"
        aria-labelledby="get-started-heading"
        className="scroll-mt-24 border-y border-white/8 bg-[#070b14] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-32"
      >
        <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Display
              as="h2"
              id="get-started-heading"
              className="m-0 max-w-[18ch] text-balance"
              style={{ fontSize: "clamp(2.25rem, 1.5rem + 2.6vw, 3.75rem)", lineHeight: 1.02, color: "#ffffff" }}
            >
              Water Agent is ready in your workspace.
            </Display>
            <p className="mt-5 text-lg leading-relaxed text-white/65" style={{ fontFamily: GEIST_FONT }}>
              Included on every plan. Bring your own model key. No Hydrilla credits for the Water build itself.
            </p>
          </div>
          <Link
            href="/workspace"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-6 text-[15px] text-[#000c1f] transition-colors hover:bg-[#d6e5fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb1e3]"
            style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
          >
            Open Water Agent
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section
        id="limitations"
        aria-labelledby="limitations-heading"
        className="scroll-mt-24 bg-[#05070d] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-32"
      >
        <div className="mx-auto w-full max-w-[80rem]">
          <Display
            as="h2"
            id="limitations-heading"
            className="m-0"
            style={{ fontSize: "clamp(2.5rem, 1.6rem + 3vw, 4.25rem)", lineHeight: 0.98, color: "#ffffff" }}
          >
            Limitations
          </Display>
          <p className="mt-5 max-w-xl text-lg text-white/65" style={{ fontFamily: GEIST_FONT }}>
            Water is still being shaped. These are the edges we want you to know about.
          </p>
          <ul className="mt-12 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {LIMITATIONS.map((item) => (
              <li key={item.title} className="border-t border-white/12 pt-5">
                <h3 className="m-0 text-[1.15rem] text-white" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT, letterSpacing: "-0.02em" }}>
                  {item.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/55" style={{ fontFamily: GEIST_FONT }}>
                  {item.line}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="responsibility"
        aria-labelledby="responsibility-heading"
        className="scroll-mt-24 bg-[#070b14] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-32"
      >
        <div className="mx-auto grid w-full max-w-[80rem] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Display
            as="h2"
            id="responsibility-heading"
            className="m-0 max-w-[12ch]"
            style={{ fontSize: "clamp(2.5rem, 1.6rem + 3vw, 4.25rem)", lineHeight: 0.98, color: "#ffffff" }}
          >
            Responsibility
          </Display>
          <div className="space-y-6 text-[17px] leading-relaxed text-white/65" style={{ fontFamily: GEIST_FONT }}>
            <p className="m-0">
              Water Agent runs on the model key you bring. Your provider’s usage, safety policies, and billing apply to every pass.
            </p>
            <p className="m-0">
              Hydrilla does not charge workspace credits for Water builds. Keep keys private, review generated content before you ship it, and follow your studio’s asset guidelines.
            </p>
            <p className="m-0">
              When you need a one-shot Cloud mesh instead, use Text to 3D or Image to 3D. Those paths run BlueFox on Hydrilla credits.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
