"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { BlurReveal } from "@/components/ui/BlurReveal";
import { WHY_HYDRILLA_MEDIA } from "@/lib/cloudinary";
import { DESCRIPTION_WEIGHT, GEIST_FONT, SANS_FONT, SECTION_WEIGHT } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/* Design tokens (shared with the other landing sections) */
const INK = "#000c1f";
const OUTER = "rounded-[24px] sm:rounded-[28px]";
const INNER = "rounded-[16px] sm:rounded-[20px]";
const GAP = "gap-3 sm:gap-4";
const TEXT_SHADOW = "0 1px 2px rgba(0,0,0,0.35)";

/** Soft card surfaces with a matching kicker colour. */
const TONES = {
  stone: { surface: "#f5f5f2", kicker: "rgba(0, 12, 31, 0.55)" },
  lilac: { surface: "#f4f2fc", kicker: "#6e5cd6" },
  sky: { surface: "#eef4fc", kicker: "#2f64e8" },
  mint: { surface: "#eef6f0", kicker: "#2a8553" },
} as const;
type Tone = keyof typeof TONES;

type Media =
  | { kind: "video"; video: string; poster: string }
  | { kind: "image"; src: string; alt: string };

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function useInViewPlay(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return { ref, active };
}

function MediaVideo({
  src,
  poster,
  priority = false,
}: {
  src: string;
  poster: string;
  priority?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { ref: wrapRef, active } = useInViewPlay(!reduceMotion);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    if (active) {
      video.muted = true;
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active, reduceMotion]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Image
        src={poster}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
        className="object-cover"
        unoptimized
      />
      {!reduceMotion ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            playing ? "opacity-100" : "opacity-0"
          )}
          src={active ? src : undefined}
          poster={poster}
          muted
          loop
          playsInline
          preload={priority ? "metadata" : "none"}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : null}
    </div>
  );
}

/** Fills its (relative) parent; zooms gently when the card is hovered. */
function MediaFill({ media, priority }: { media: Media; priority?: boolean }) {
  return (
    <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] motion-reduce:transition-none">
      {media.kind === "video" ? (
        <MediaVideo src={media.video} poster={media.poster} priority={priority} />
      ) : (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover"
          unoptimized
        />
      )}
    </div>
  );
}

function Kicker({ children, color }: { children: ReactNode; color: string }) {
  return (
    <p
      className="m-0 text-[11px] font-medium uppercase leading-none tracking-[0.14em]"
      style={{ fontFamily: SANS_FONT, color }}
    >
      {children}
    </p>
  );
}

function CardTitle({
  children,
  className,
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <h3
      className={cn(
        "m-0 font-medium leading-[1.15] tracking-[-0.025em] text-balance",
        light ? "text-white" : "text-[#000c1f]",
        className
      )}
      style={{
        fontFamily: SANS_FONT,
        fontWeight: SECTION_WEIGHT,
        textShadow: light ? TEXT_SHADOW : undefined,
      }}
    >
      {children}
    </h3>
  );
}

/** Underlined text link; its ::after stretches over the card so the whole card is clickable. */
function CardLink({ href, label, light = false }: { href: string; label: string; light?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link inline-flex w-fit items-center gap-1.5 text-[14px] font-medium tracking-[-0.01em] no-underline after:absolute after:inset-0 after:z-20 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-[#2563eb]",
        light ? "text-white" : "text-[#000c1f]"
      )}
      style={{ fontFamily: SANS_FONT, textShadow: light ? TEXT_SHADOW : undefined }}
    >
      <span
        className={cn(
          "border-b pb-px transition-colors duration-300",
          light ? "border-white/45 group-hover:border-white" : "border-[#000c1f]/25 group-hover:border-[#000c1f]"
        )}
      >
        {label}
      </span>
      <ArrowRight
        size={15}
        strokeWidth={2}
        aria-hidden
        className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/** Text on a soft surface, media inset beside it (stacks on small screens). */
function SplitCard({
  kicker,
  title,
  media,
  tone,
  link,
  className,
}: {
  kicker: string;
  title: string;
  media: Media;
  tone: Tone;
  link?: { href: string; label: string };
  className?: string;
}) {
  const { surface, kicker: kickerColor } = TONES[tone];
  return (
    <article
      className={cn("group relative isolate flex flex-col gap-4 p-3 sm:flex-row sm:p-3.5", OUTER, className)}
      style={{ background: surface }}
    >
      <div className="flex flex-col justify-between gap-5 px-2.5 pb-2 pt-3 sm:w-[48%] sm:shrink-0 sm:px-3.5 sm:py-4">
        <div className="flex flex-col gap-3">
          <Kicker color={kickerColor}>{kicker}</Kicker>
          <CardTitle className="text-[clamp(1.2rem,1rem+0.6vw,1.45rem)]">{title}</CardTitle>
        </div>
        {link ? <CardLink {...link} /> : null}
      </div>
      <div className={cn("relative min-h-[180px] flex-1 overflow-hidden bg-neutral-900", INNER)}>
        <MediaFill media={media} />
      </div>
    </article>
  );
}

/** Media on top, caption below on a soft surface. */
function CaptionCard({
  kicker,
  title,
  media,
  tone,
  link,
  className,
}: {
  kicker: string;
  title: string;
  media: Media;
  tone: Tone;
  link?: { href: string; label: string };
  className?: string;
}) {
  const { surface, kicker: kickerColor } = TONES[tone];
  return (
    <article
      className={cn("group relative isolate flex flex-col p-2.5 sm:p-3", OUTER, className)}
      style={{ background: surface }}
    >
      <div className={cn("relative aspect-[4/3] w-full overflow-hidden bg-neutral-900 lg:aspect-auto lg:min-h-[200px] lg:flex-1", INNER)}>
        <MediaFill media={media} />
      </div>
      <div className="flex flex-col gap-2.5 px-2 pb-2.5 pt-4 sm:gap-3 sm:px-3 sm:pb-3 sm:pt-5">
        <Kicker color={kickerColor}>{kicker}</Kicker>
        <CardTitle className="text-[clamp(1rem,0.92rem+0.35vw,1.2rem)]">{title}</CardTitle>
        {link ? (
          <div className="pt-1.5">
            <CardLink {...link} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Full-bleed media with the title set bottom-left over a soft scrim. */
function OverlayCard({
  title,
  media,
  link,
  className,
}: {
  title: string;
  media: Media;
  link?: { href: string; label: string };
  className?: string;
}) {
  return (
    <article className={cn("group relative isolate overflow-hidden bg-neutral-900", OUTER, className)}>
      <MediaFill media={media} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2.5 p-4 sm:p-5">
        <CardTitle light className="text-[clamp(1.05rem,0.95rem+0.45vw,1.35rem)]">
          {title}
        </CardTitle>
        {link ? <CardLink {...link} light /> : null}
      </div>
    </article>
  );
}

function StatCard({ value, media, className }: { value: string; media: Media; className?: string }) {
  return (
    <article className={cn("group relative isolate overflow-hidden bg-neutral-950", OUTER, className)}>
      <MediaFill media={media} />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <p
          className="m-0 text-[clamp(2.75rem,2rem+2.4vw,4rem)] font-medium leading-none tracking-[-0.05em] text-white"
          style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT, textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}
        >
          {value}
        </p>
      </div>
    </article>
  );
}

function BlueFoxCard({ className }: { className?: string }) {
  return (
    <article className={cn("group relative isolate overflow-hidden bg-neutral-950", OUTER, className)}>
      <MediaFill
        media={{ kind: "video", video: WHY_HYDRILLA_MEDIA.bluefox.video, poster: WHY_HYDRILLA_MEDIA.bluefox.poster }}
        priority
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-5 sm:p-8">
        <Kicker color="rgba(255,255,255,0.78)">In-house model</Kicker>
        <CardTitle light className="text-[clamp(2.25rem,1.6rem+2.6vw,3.75rem)] leading-none tracking-[-0.045em]">
          BlueFox 1
        </CardTitle>
        <p
          className="m-0 max-w-[26rem] text-[14px] leading-[1.55] text-white/85 sm:text-[15px]"
          style={{ fontFamily: GEIST_FONT, fontWeight: DESCRIPTION_WEIGHT, textShadow: TEXT_SHADOW }}
        >
          BlueFox, Hydrilla&apos;s 3D model, turns a prompt or a picture into a segmented 3D model with UVs
          and PBR textures.
        </p>
        <div className="pt-1">
          <CardLink href="/bluefox" label="Meet BlueFox" light />
        </div>
      </div>
    </article>
  );
}

const M = WHY_HYDRILLA_MEDIA;
const video = (item: { video: string; poster: string }): Media => ({ kind: "video", ...item });

export default function WhyHydrilla() {
  return (
    <section
      id="why-hydrilla"
      className="relative w-full bg-white"
      style={{
        fontFamily: SANS_FONT,
        padding: "clamp(4.5rem, 3rem + 6vw, 8.5rem) 0",
        WebkitFontSmoothing: "antialiased",
      }}
      aria-labelledby="why-hydrilla-heading"
    >
      <div className="mx-auto" style={{ width: "min(100% - 2rem, 76rem)" }}>
        <header className="mb-[clamp(2.5rem,2rem+3vw,4.5rem)] flex flex-col items-center px-2 text-center">
          <BlurReveal
            as="h2"
            id="why-hydrilla-heading"
            style={{
              margin: 0,
              fontFamily: SANS_FONT,
              fontWeight: SECTION_WEIGHT,
              color: INK,
              fontSize: "clamp(2.25rem, 1.7rem + 2.4vw, 3.75rem)",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              textWrap: "balance",
            }}
          >
            Production-ready assets.
          </BlurReveal>
          <p className="sr-only">
            Hydrilla generates production-ready 3D assets like BlueFox 1 with
            clean topology, PBR materials, multi-format export, and real-time
            preview so teams ship without cleanup.
          </p>
        </header>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          className={cn("grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12", GAP)}
        >
          {/* Row 1 */}
          <motion.div variants={reveal} className="col-span-2 md:col-span-6 lg:col-span-5 lg:h-[272px]">
            <SplitCard
              kicker="Fast"
              title="From a prompt or a picture to a 3D model."
              media={video(M.fast)}
              tone="stone"
              link={{ href: "/image-to-3d", label: "Try image to 3D" }}
              className="h-full"
            />
          </motion.div>
          <motion.div variants={reveal} className="col-span-2 h-40 md:col-span-2 md:h-auto lg:col-span-2 lg:h-[272px]">
            <StatCard value="10×" media={video(M.tenX)} className="h-full" />
          </motion.div>
          <motion.div variants={reveal} className="col-span-2 md:col-span-4 lg:col-span-5 lg:h-[272px]">
            <SplitCard
              kicker="Clean Mesh"
              title="Segmented meshes with UVs and PBR textures."
              media={video(M.disc)}
              tone="lilac"
              link={{ href: "/features", label: "See features" }}
              className="h-full"
            />
          </motion.div>

          {/* Rows 2–3: BlueFox in the center, two stacks either side */}
          <motion.div
            variants={reveal}
            className={cn("col-span-2 grid grid-cols-2 md:col-span-6 lg:col-span-3 lg:grid-cols-1 lg:grid-rows-2", GAP)}
          >
            <OverlayCard title="PBR Materials" media={video(M.texture)} className="aspect-square md:aspect-[4/3] lg:aspect-auto" />
            <OverlayCard title="Quad Mesh" media={video(M.mesh)} className="aspect-square md:aspect-[4/3] lg:aspect-auto" />
          </motion.div>
          <motion.div variants={reveal} className="col-span-2 md:col-span-6 lg:col-span-6">
            <BlueFoxCard className="aspect-[4/5] md:aspect-[16/11] lg:aspect-auto lg:h-[600px]" />
          </motion.div>
          <motion.div
            variants={reveal}
            className={cn("col-span-2 grid grid-cols-2 md:col-span-6 lg:col-span-3 lg:grid-cols-1 lg:grid-rows-2", GAP)}
          >
            <OverlayCard title="3D Models" media={video(M.model)} className="aspect-square md:aspect-[4/3] lg:aspect-auto" />
            <OverlayCard
              title="Blender"
              media={video(M.blender)}
              link={{ href: "/integrations/blender", label: "Blender add-on" }}
              className="aspect-square md:aspect-[4/3] lg:aspect-auto"
            />
          </motion.div>

          {/* Row 4: caption cards */}
          <motion.div variants={reveal} className="col-span-1 md:col-span-3 lg:col-span-3 lg:h-[420px]">
            <CaptionCard
              kicker="PBR"
              title="PBR maps come with every mesh."
              media={{ kind: "image", src: M.fish, alt: "Hydrilla PBR-ready asset" }}
              tone="sky"
              link={{ href: "/features", label: "See features" }}
              className="h-full"
            />
          </motion.div>
          <motion.div variants={reveal} className="col-span-1 md:col-span-3 lg:col-span-3 lg:h-[420px]">
            <CaptionCard
              kicker="3D Pipeline"
              title="Send models to Blender, Unity, Unreal, and Godot."
              media={{ kind: "image", src: M.bike, alt: "Hydrilla pipeline-ready bike asset" }}
              tone="mint"
              link={{ href: "/integrations", label: "Integrations" }}
              className="h-full"
            />
          </motion.div>
          <motion.div variants={reveal} className="col-span-1 md:col-span-3 lg:col-span-3 lg:h-[420px]">
            <CaptionCard
              kicker="Real-Time"
              title="Check every result in the browser."
              media={video(M.rockey)}
              tone="stone"
              link={{ href: "/features", label: "See the viewer" }}
              className="h-full"
            />
          </motion.div>
          <motion.div variants={reveal} className="col-span-1 md:col-span-3 lg:col-span-3 lg:h-[420px]">
            <CaptionCard
              kicker="3D Assets"
              title="Brief whole sets with Water Agent."
              media={video(M.assets)}
              tone="lilac"
              link={{ href: "/water", label: "Water Agent" }}
              className="h-full"
            />
          </motion.div>

          {/* Row 5 */}
          <motion.div variants={reveal} className="col-span-2 h-[220px] md:col-span-6 md:h-[260px] lg:col-span-4 lg:h-[280px]">
            <OverlayCard
              title="Text-to-3D"
              media={video(M.threeD)}
              link={{ href: "/text-to-3d", label: "Start from a prompt" }}
              className="h-full"
            />
          </motion.div>
          <motion.div variants={reveal} className="col-span-1 aspect-square md:col-span-3 md:aspect-auto md:h-[260px] lg:col-span-4 lg:h-[280px]">
            <OverlayCard
              title="Multi Export"
              media={video(M.multi)}
              link={{ href: "/features#exports", label: "See exports" }}
              className="h-full"
            />
          </motion.div>
          <motion.div variants={reveal} className="col-span-1 aspect-square md:col-span-3 md:aspect-auto md:h-[260px] lg:col-span-4 lg:h-[280px]">
            <OverlayCard
              title="Studio"
              media={{ kind: "image", src: M.cta, alt: "Hydrilla studio workflow" }}
              link={{ href: "/app/studio", label: "Open Studio" }}
              className="h-full"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
