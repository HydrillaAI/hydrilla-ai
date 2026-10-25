"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { NAV_PRIMARY, type NavFeatured, type NavGroup } from "@/lib/nav";
import { NAVBAR } from "@/lib/nav-chrome";
import { NavIcon } from "./NavIcons";

const DISPLAY =
  "'RoobertVF', 'Roobert', var(--font-dm-sans), 'DM Sans', sans-serif";

function FeaturedVisual({ visual }: { visual: NavFeatured["visual"] }) {
  if (visual === "formats") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1.5 shadow-sm">
        {["GLB", "FBX", "OBJ", "USDZ"].map((format) => (
          <span
            key={format}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-neutral-100 px-2 text-[10px] font-bold tracking-[0.04em] text-neutral-800"
          >
            {format}
          </span>
        ))}
      </div>
    );
  }

  if (visual === "game") {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
          <rect x="6" y="16" width="36" height="20" rx="10" fill="white" />
          <path d="M16 22v8M12 26h8" stroke="#0F766E" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="30" cy="24" r="2" fill="#F43F5E" />
          <circle cx="35" cy="28" r="2" fill="#F59E0B" />
        </svg>
      </div>
    );
  }

  if (visual === "docs") {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
          <path d="M14 8h14l8 8v24H14a4 4 0 01-4-4V12a4 4 0 014-4z" fill="white" />
          <path d="M28 8v8h8" fill="#99F6E4" />
          <path d="M18 24h14M18 30h10" stroke="#0F766E" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
        <circle cx="22" cy="22" r="11" stroke="white" strokeWidth="3" />
        <path d="M30 30l8 8" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function FeaturedCard({
  featured,
  onNavigate,
  variant = "v1",
}: {
  featured: NavFeatured;
  onNavigate?: () => void;
  variant?: "v1" | "v2";
}) {
  if (variant === "v2") {
    return (
      <Link
        href={featured.href}
        onClick={onNavigate}
        className="group hidden w-[248px] shrink-0 flex-col justify-between rounded-xl bg-[linear-gradient(165deg,#000c1f_0%,#002664_62%,#1a4d9e_100%)] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141414]/30 focus-visible:ring-offset-2 xl:flex"
      >
        <FeaturedVisual visual={featured.visual} />
        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
            {featured.eyebrow}
          </p>
          <p
            className="mt-2 text-pretty text-[15px] font-semibold leading-snug tracking-[-0.02em]"
            style={{ fontFamily: DISPLAY }}
          >
            {featured.title}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-white/85 transition-transform duration-300 group-hover:translate-x-0.5">
            Explore
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={featured.href}
      onClick={onNavigate}
      className="group relative hidden min-h-55 w-60 shrink-0 flex-col justify-between overflow-hidden rounded-[22px] bg-[linear-gradient(165deg,#000c1f_0%,#002664_62%,#1a4d9e_100%)] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] xl:flex xl:w-[280px]"
    >
      <FeaturedVisual visual={featured.visual} />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
          {featured.eyebrow}
        </p>
        <p
          className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.03em]"
          style={{ fontFamily: DISPLAY }}
        >
          {featured.title}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-white/80 transition-transform duration-300 group-hover:translate-x-0.5">
          Explore
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function MegaMenuV2({
  group,
  onNavigate,
}: {
  group: NavGroup;
  onNavigate?: () => void;
}) {
  if (!group.columns?.length) return null;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white/96 shadow-[0_24px_70px_-28px_rgba(3,3,2,0.32)] backdrop-blur-xl"
      role="region"
      aria-label={`${group.label} menu`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4b5568]">
          {group.label}
        </p>
      </div>

      <div className="flex items-stretch gap-3 p-3">
        <div
          className="grid min-w-0 flex-1"
          style={{
            gridTemplateColumns: `repeat(${group.columns.length}, minmax(0, 1fr))`,
          }}
        >
          {group.columns.map((column) => (
            <section
              key={column.heading}
              className="min-w-0 border-l border-black/[0.06] px-3 py-2 first:border-l-0 first:pl-2"
            >
              <div className="mb-2 flex items-center gap-3 px-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4b5568]">
                  {column.heading}
                </p>
                <span aria-hidden className="h-px min-w-4 flex-1 bg-black/[0.08]" />
              </div>
              <ul className="space-y-0.5">
                {column.items.map((item) => (
                  <li key={`${column.heading}-${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="group flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 transition-colors duration-200 hover:bg-[#f4f6f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141414]/25"
                    >
                      {item.icon ? (
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f5f7] ring-1 ring-black/[0.05]">
                          <NavIcon name={item.icon} className="h-5 w-5" />
                        </span>
                      ) : null}
                      <span className="min-w-0 pt-0.5">
                        <span
                          className="block text-[14px] font-medium leading-5 tracking-[-0.015em] text-[#121212]"
                          style={{ fontFamily: DISPLAY }}
                        >
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="mt-0.5 block text-pretty text-[13px] leading-[1.45] text-[#3e4c5e]">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {group.featured ? (
          <FeaturedCard featured={group.featured} onNavigate={onNavigate} variant="v2" />
        ) : null}
      </div>
    </div>
  );
}

const PANEL_EASE = [0.22, 1, 0.36, 1] as const;
const FEATURED_SIZES = "260px";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: PANEL_EASE } },
};

// Warm the optimized featured images shortly after load so the card
// never pops in on first hover.
if (typeof window !== "undefined") {
  const warm = () => {
    for (const group of NAV_PRIMARY) {
      const image = group.featured?.image;
      if (!image) continue;
      const { props } = getImageProps({
        src: image,
        alt: "",
        fill: true,
        sizes: FEATURED_SIZES,
      });
      const img = new window.Image();
      img.sizes = props.sizes ?? FEATURED_SIZES;
      if (props.srcSet) img.srcset = props.srcSet;
      img.src = props.src;
    }
  };
  window.setTimeout(warm, 1500);
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MegaMenuAligned({
  group,
  onNavigate,
}: {
  group: NavGroup;
  onNavigate?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [activeRow, setActiveRow] = useState<string | null>(null);
  if (!group.columns?.length) return null;

  const featured = group.featured;
  const hidden = reduceMotion ? "show" : "hidden";

  return (
    <div
      className="flex items-stretch gap-1.5 rounded-[26px] border border-black/[0.07] bg-[#f1f2f4] p-1.5 text-[#141414]"
      role="region"
      aria-label={`${group.label} menu`}
    >
      <motion.div
        key={group.label}
        initial={hidden}
        animate="show"
        variants={listVariants}
        className="grid min-h-[312px] min-w-0 flex-1 rounded-[20px] border border-black/[0.05] bg-white px-2 pb-4 pt-5"
        style={{
          gridTemplateColumns: `repeat(${group.columns.length}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => setActiveRow(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setActiveRow(null);
        }}
      >
        {group.columns.map((column, index) => (
          <section
            key={column.heading}
            className={`relative min-w-0 px-3 ${
              index > 0
                ? "before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-black/[0.08] before:to-transparent"
                : ""
            }`}
          >
            <motion.p
              variants={rowVariants}
              className="px-2.5 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7078]"
            >
              {column.heading}
            </motion.p>
            <ul className="space-y-0.5">
              {column.items.map((item) => {
                const rowKey = `${group.label}-${column.heading}-${item.href}-${item.label}`;
                return (
                <motion.li key={rowKey} variants={rowVariants}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    onMouseEnter={() => setActiveRow(rowKey)}
                    onFocus={() => setActiveRow(rowKey)}
                    className="group relative flex cursor-pointer items-center gap-3 rounded-[14px] px-2.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141414]/20"
                  >
                    {activeRow === rowKey ? (
                      <motion.span
                        layoutId="mega-row-highlight"
                        aria-hidden
                        className="absolute inset-0 rounded-[14px] bg-[#f4f5f7]"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 520, damping: 42, mass: 0.7 }
                        }
                      />
                    ) : null}
                    {item.icon ? (
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-black/[0.05] bg-[#f3f4f6] transition-colors duration-300 group-hover:bg-white group-focus-visible:bg-white motion-reduce:transition-none">
                        <NavIcon
                          name={item.icon}
                          className="h-6 w-6 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 motion-reduce:transition-none"
                        />
                      </span>
                    ) : null}
                    <span className="relative min-w-0 flex-1">
                      <span
                        className="block text-[14.5px] font-medium leading-5 tracking-[-0.018em] text-[#141414]"
                        style={{ fontFamily: DISPLAY }}
                      >
                        {item.label}
                      </span>
                      {item.description ? (
                        <span className="mt-px block text-pretty text-[12.5px] leading-[1.35] tracking-[-0.005em] text-[#6b7078]">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                    <Arrow className="relative h-3.5 w-3.5 shrink-0 -translate-x-1 text-[#141414]/40 opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none" />
                  </Link>
                </motion.li>
                );
              })}
            </ul>
          </section>
        ))}
      </motion.div>

      {featured ? (
        <Link
          key={featured.href}
          href={featured.href}
          onClick={onNavigate}
          className="group hidden w-[272px] shrink-0 flex-col rounded-[20px] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141414]/25 xl:flex"
        >
          <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[14px] border border-black/[0.06] bg-[#e4e6ea]">
            {featured.image ? (
              <Image
                src={featured.image}
                alt={featured.imageAlt ?? ""}
                fill
                sizes={FEATURED_SIZES}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(165deg,#000c1f_0%,#002664_62%,#1a4d9e_100%)]">
                <FeaturedVisual visual={featured.visual} />
              </span>
            )}
          </span>
          <span className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#141414]/70">
              {featured.eyebrow}
            </span>
            <span
              className="mt-1.5 text-pretty text-[16px] font-medium leading-[1.25] tracking-[-0.024em]"
              style={{ fontFamily: DISPLAY }}
            >
              {featured.title}
            </span>
            <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-medium text-[#141414]/60 transition-colors duration-200 group-hover:text-[#141414]">
              Learn more
              <Arrow className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </span>
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export function MegaMenu({
  group,
  onNavigate,
}: {
  group: NavGroup;
  onNavigate?: () => void;
}) {
  if (NAVBAR === "v2") {
    return <MegaMenuAligned group={group} onNavigate={onNavigate} />;
  }

  if (NAVBAR !== "wide") {
    return <MegaMenuV2 group={group} onNavigate={onNavigate} />;
  }

  if (!group.columns?.length) return null;

  return (
    <div
      className="overflow-hidden rounded-[28px] border border-[#000c1f]/8 bg-white/95 shadow-[0_24px_70px_-28px_rgba(0,12,31,0.38)] backdrop-blur-xl"
      role="region"
      aria-label={`${group.label} menu`}
    >
      <div className="flex items-stretch gap-6 p-5 md:gap-7 md:px-7 md:py-6">
        <div className="flex min-w-0 flex-1 justify-between gap-5 md:gap-6">
          {group.columns.map((column) => (
            <div key={column.heading} className="min-w-0 flex-1">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#000c1f]/40">
                {column.heading}
              </p>
              <ul className="space-y-0.5">
                {column.items.map((item) => (
                  <li key={`${column.heading}-${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="group flex items-start gap-3 rounded-2xl px-2 py-2 transition-colors duration-200 hover:bg-[#f1f5fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000c1f]/20"
                    >
                      {item.icon ? (
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f7fb] ring-1 ring-[#000c1f]/6 transition-colors duration-200 group-hover:bg-white">
                          <NavIcon name={item.icon} className="h-6 w-6" />
                        </span>
                      ) : null}
                      <span className="min-w-0 pt-0.5">
                        <span
                          className="block text-[14px] font-medium leading-tight tracking-[-0.02em] text-[#000c1f]"
                          style={{ fontFamily: DISPLAY }}
                        >
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="mt-1 block text-[12.5px] leading-snug text-[#000c1f]/55">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {group.featured ? (
          <FeaturedCard featured={group.featured} onNavigate={onNavigate} />
        ) : null}
      </div>
    </div>
  );
}
