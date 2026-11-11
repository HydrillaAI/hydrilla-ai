"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DESCRIPTION_WEIGHT, GEIST_FONT, SANS_FONT, SECTION_WEIGHT } from "@/lib/fonts";
import {
  BUILD_PASS_ORDER,
  QUALITY_TIERS,
  TIER_PASS_UNLOCK,
  type QualityTier,
} from "@/lib/waterSkills";

const INK = "#000c1f";
const MUTED = "rgba(0, 12, 31, 0.65)";

const FLOW = [
  {
    id: "brief",
    title: "Brief",
    body: "Describe the asset the way you would brief a teammate. Add a reference image if you have one.",
  },
  {
    id: "plan",
    title: "Plan",
    body: "Water names the pieces first. You see the plan before the build starts.",
  },
  {
    id: "build",
    title: "Build",
    body: "The build runs in passes. Fast stops at the silhouette. Studio continues through surface, light, and finish.",
  },
  {
    id: "preview",
    title: "Preview",
    body: "The result opens in the browser. Orbit it and check the form.",
  },
  {
    id: "refine",
    title: "Refine",
    body: "Ask for a change in the same thread. Water edits the scene, or rebuilds from that job.",
  },
] as const;

const PASS_NAME: Record<(typeof BUILD_PASS_ORDER)[number], string> = {
  blockout: "Blockout",
  structural: "Structure",
  form: "Form",
  material: "Material",
  surface: "Surface",
  lighting: "Lighting",
  interaction: "Interaction",
  optimization: "Optimize",
};

const CHAPTERS = [
  { id: "brief", title: "The brief", line: "A named set, written in plain language." },
  { id: "passes", title: "The passes", line: "Silhouette, then form, then materials." },
  { id: "refine", title: "The refine", line: "One change, in the same thread." },
] as const;

const FAQ = [
  {
    q: "What does Water Agent cost?",
    a: "Nothing from your Hydrilla credits. It is included on every plan. You bring your own model key, and that provider bills the usage.",
  },
  {
    q: "Who is it for?",
    a: "Artists, game developers, and studios who want to brief an asset, watch it build, and refine it in conversation.",
  },
  {
    q: "Can a brief be one object?",
    a: "Yes. One prop or one character. Water only plans what you ask for.",
  },
  {
    q: "When should I use text to 3D instead?",
    a: "When you want a Cloud mesh from a single prompt. Text to 3D and image to 3D run BlueFox. Water plans and builds with your key.",
  },
  {
    q: "How is this different from the MCP server?",
    a: "Water Agent lives inside the Hydrilla workspace. The MCP server lets an outside agent drive Hydrilla.",
  },
] as const;

const RESOURCES = [
  { href: "/docs#water", label: "Docs", line: "Getting started" },
  { href: "/text-to-3d", label: "Text to 3D", line: "BlueFox Cloud mesh" },
  { href: "/image-to-3d", label: "Image to 3D", line: "Mesh from a picture" },
  { href: "/integrations/mcp", label: "MCP", line: "Drive Hydrilla from outside" },
  { href: "/pricing", label: "Pricing", line: "Plans and credits" },
  { href: "/workspace", label: "Workspace", line: "Open Water Agent" },
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

function StepStage({ id }: { id: (typeof FLOW)[number]["id"] }) {
  if (id === "brief" || id === "preview") {
    const src = id === "brief" ? "/workflow/water-brief-before.png" : "/workflow/water-result-after.png";
    const alt =
      id === "brief"
        ? "Example brief for a lantern, a crate, and a stand."
        : "Example 3D preview of that lantern, crate, and stand.";
    return (
      <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-[1.25rem] bg-[#f4f8fe]">
        <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 36rem" className="object-contain p-6" />
      </div>
    );
  }

  if (id === "plan") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 rounded-[1.25rem] bg-[#f4f8fe] p-8">
        <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#002664]" style={{ fontFamily: SANS_FONT }}>
          Plan preview
        </p>
        <div className="grid grid-cols-3 gap-3">
          {["Lantern", "Crate", "Stand"].map((piece) => (
            <div key={piece} className="flex aspect-square items-center justify-center rounded-2xl bg-white text-[15px] text-[#000c1f]" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}>
              {piece}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "build") {
    return (
      <ol className="m-0 grid flex-1 list-none grid-cols-2 content-center gap-3 rounded-[1.25rem] bg-[#f4f8fe] p-6 sm:grid-cols-4">
        {BUILD_PASS_ORDER.map((pass, index) => (
          <li key={pass} className="rounded-2xl bg-white px-3 py-4">
            <span className="block text-[11px] tracking-[0.14em] text-[#002664]" style={{ fontFamily: SANS_FONT }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-[14px] text-[#000c1f]" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}>
              {PASS_NAME[pass]}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-3 rounded-[1.25rem] bg-[#f4f8fe] p-8">
      <p className="m-0 ml-auto max-w-[16rem] rounded-2xl rounded-br-md bg-[#000c1f] px-4 py-3 text-[15px] text-white" style={{ fontFamily: GEIST_FONT }}>
        Make the lantern taller.
      </p>
      <p className="m-0 max-w-[16rem] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[15px] text-[#000c1f]" style={{ fontFamily: GEIST_FONT }}>
        Height updated. Preview is ready.
      </p>
    </div>
  );
}

export function WaterShowcase() {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<QualityTier>("standard");
  const [chapter, setChapter] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const active = FLOW[step];
  const unlocked = new Set(TIER_PASS_UNLOCK[tier]);
  const tierDef = QUALITY_TIERS.find((item) => item.id === tier) ?? QUALITY_TIERS[1];
  const activeChapter = CHAPTERS[chapter];

  return (
    <div className="bg-white text-[#000c1f]">
      <section className="relative overflow-x-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(215,228,248,0.95),transparent_56%)]" />
          <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(0,12,31,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,12,31,0.045)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[80rem] flex-col items-center px-4 pt-28 pb-20 sm:px-6 sm:pt-32 md:pt-36 lg:px-8 lg:pt-40 lg:pb-28">
          <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#002664]" style={{ fontFamily: SANS_FONT }}>
            Water Agent
          </p>
          <Display
            as="h1"
            className="mt-6 max-w-[12ch] text-center text-balance"
            style={{ fontSize: "clamp(3.5rem, calc(2.1rem + 5vw), 6.75rem)", lineHeight: 0.9 }}
          >
            Direct the 3D.
          </Display>
          <p
            className="mt-6 max-w-2xl text-center text-pretty text-lg leading-[1.45] tracking-[-0.015em] sm:text-xl md:text-[1.65rem]"
            style={{ fontFamily: GEIST_FONT, fontWeight: DESCRIPTION_WEIGHT, color: MUTED }}
          >
            Describe the asset. Water plans the pieces, builds them in passes, and stays with you while you refine the preview.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Link
              href="/workspace"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#000c1f] px-6 text-[15px] text-white transition-colors hover:bg-[#00163b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002664] focus-visible:ring-offset-2"
              style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
            >
              Open Water Agent
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#how"
              className="text-[15px] text-[#002664] underline decoration-[#002664]/30 underline-offset-4 hover:decoration-[#002664]"
              style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
            >
              See how it builds
            </a>
          </div>

          <div className="mt-16 w-full overflow-hidden rounded-[2rem] border border-[#000c1f]/8 bg-white shadow-[0_18px_50px_rgb(1_14_36/0.08)] md:rounded-[2.75rem]">
            <div className="flex items-center justify-between gap-4 border-b border-[#000c1f]/8 px-6 py-4 sm:px-8">
              <p className="m-0 text-[13px] text-[#000c1f]/55" style={{ fontFamily: GEIST_FONT }}>
                Example · fantasy armory props
              </p>
              <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#002664]" style={{ fontFamily: SANS_FONT }}>
                Brief, then preview
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
              <figure className="m-0 bg-white">
                <figcaption className="px-6 pt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#000c1f]/40 sm:px-8" style={{ fontFamily: SANS_FONT }}>
                  Before · the brief
                </figcaption>
                <div className="relative mx-4 mb-4 aspect-[4/5] sm:mx-6">
                  <Image
                    src="/workflow/water-brief-before.png"
                    alt="A Water Agent brief for a lantern, a crate, and a stand, with those three pieces listed in the plan."
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 36rem"
                    className="object-contain"
                  />
                </div>
              </figure>
              <div className="hidden items-center px-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#7eb1e3] md:flex" style={{ fontFamily: SANS_FONT }} aria-hidden>
                to
              </div>
              <figure className="m-0 border-t border-[#000c1f]/8 bg-[#f4f8fe] md:border-t-0 md:border-l">
                <figcaption className="px-6 pt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#000c1f]/40 sm:px-8" style={{ fontFamily: SANS_FONT }}>
                  After · the preview
                </figcaption>
                <div className="relative mx-4 mb-4 aspect-[4/5] sm:mx-6">
                  <Image
                    src="/workflow/water-result-after.png"
                    alt="An illustrative 3D preview of the lantern, crate, and stand from that brief."
                    fill
                    sizes="(max-width: 768px) 100vw, 36rem"
                    className="object-contain"
                  />
                </div>
              </figure>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-center text-[13px] text-[#000c1f]/45" style={{ fontFamily: GEIST_FONT }}>
            Illustrative Water example. Not a Cloud mesh from BlueFox.
          </p>
        </div>
      </section>

      <section aria-labelledby="what-heading" className="border-y border-[#000c1f]/8 px-4 py-16 sm:px-6 lg:px-8">
        <h2 id="what-heading" className="sr-only">
          What Water Agent does
        </h2>
        <ul className="mx-auto grid w-full max-w-[80rem] list-none gap-10 p-0 md:grid-cols-3">
          {[
            ["A brief", "You write what the asset is, and how it should read."],
            ["A plan", "Water splits it into pieces before it builds."],
            ["A preview you can change", "The result stays in the thread, so the next note is a revision."],
          ].map(([title, line]) => (
            <li key={title}>
              <h3 className="m-0 text-[1.65rem] leading-tight" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT, letterSpacing: "-0.03em", color: INK }}>
                {title}
              </h3>
              <p className="mt-3 max-w-xs text-[17px] leading-relaxed" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
                {line}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" aria-labelledby="how-heading" className="bg-[#f4f8fe] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto w-full max-w-[80rem]">
          <Display as="h2" id="how-heading" className="m-0 max-w-[14ch] text-balance" style={{ fontSize: "clamp(2.5rem, 1.7rem + 2.8vw, 4.25rem)", lineHeight: 0.98 }}>
            From brief to refine.
          </Display>
          <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
            {FLOW.length} steps, in one workspace thread. Select a step.
          </p>
          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[16rem_1fr] lg:gap-8">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" role="tablist" aria-label="Water Agent workflow">
              {FLOW.map((item, index) => {
                const selected = index === step;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={`water-tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls="water-step-panel"
                    onClick={() => setStep(index)}
                    className={`shrink-0 rounded-full px-4 py-3 text-left text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002664] ${
                      selected ? "bg-[#000c1f] text-white" : "bg-white text-[#000c1f] hover:bg-white/70"
                    }`}
                    style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
                  >
                    <span className={selected ? "text-white/50" : "text-[#002664]"}>{String(index + 1).padStart(2, "0")}</span>
                    <span className="ml-2">{item.title}</span>
                  </button>
                );
              })}
            </div>
            <div
              id="water-step-panel"
              role="tabpanel"
              aria-labelledby={`water-tab-${active.id}`}
              className="flex min-h-[28rem] flex-col gap-8 rounded-[1.75rem] bg-white p-6 shadow-[0_14px_32px_rgb(1_14_36/0.05)] sm:p-8 lg:p-10"
            >
              <div>
                <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#002664]" style={{ fontFamily: SANS_FONT }}>
                  Step {String(step + 1).padStart(2, "0")}
                </p>
                <Display as="h3" className="mt-3 mb-0" style={{ fontSize: "clamp(2.2rem, 1.5rem + 2vw, 3.4rem)", lineHeight: 1.02 }}>
                  {active.title}
                </Display>
                <p className="mt-4 max-w-lg text-lg leading-relaxed" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
                  {active.body}
                </p>
              </div>
              <StepStage id={active.id} />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="passes-heading" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto w-full max-w-[80rem]">
          <Display as="h2" id="passes-heading" className="m-0 max-w-[16ch] text-balance" style={{ fontSize: "clamp(2.5rem, 1.7rem + 2.8vw, 4.25rem)", lineHeight: 0.98 }}>
            How far should it go?
          </Display>
          <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
            Fast checks the silhouette. Standard carries the materials. Studio runs every pass.
          </p>
          <div className="mt-10 inline-flex rounded-full bg-[#f4f8fe] p-1" role="tablist" aria-label="Quality tier">
            {QUALITY_TIERS.map((item) => {
              const selected = item.id === tier;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTier(item.id)}
                  className={`rounded-full px-5 py-2.5 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002664] ${
                    selected ? "bg-[#000c1f] text-white" : "text-[#000c1f]/70 hover:text-[#000c1f]"
                  }`}
                  style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-lg" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
            {tierDef.description}
          </p>
          <ol className="mt-8 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4 lg:grid-cols-8">
            {BUILD_PASS_ORDER.map((pass, index) => {
              const on = unlocked.has(pass);
              return (
                <li key={pass} className={`rounded-2xl px-3 py-5 ${on ? "bg-[#000c1f] text-white" : "bg-[#f4f8fe] text-[#000c1f]/30"}`}>
                  <span className="block text-[11px] tracking-[0.14em]" style={{ fontFamily: SANS_FONT }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-2 block text-[15px]" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}>
                    {PASS_NAME[pass]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section aria-labelledby="session-heading" className="bg-[#f4f8fe] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto w-full max-w-[80rem]">
          <Display as="h2" id="session-heading" className="m-0 max-w-[14ch] text-balance" style={{ fontSize: "clamp(2.5rem, 1.7rem + 2.8vw, 4.25rem)", lineHeight: 0.98 }}>
            A session, in {CHAPTERS.length} frames.
          </Display>
          <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
            No session video is published yet. These frames are the reel to record: brief, passes, and a refine. Nothing here autoplays.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Session frames">
            {CHAPTERS.map((item, index) => {
              const selected = index === chapter;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setChapter(index)}
                  className={`rounded-[1.25rem] px-5 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002664] ${
                    selected ? "bg-[#000c1f] text-white" : "bg-white text-[#000c1f]"
                  }`}
                >
                  <span className={`block text-[12px] tracking-[0.14em] ${selected ? "text-white/50" : "text-[#002664]"}`} style={{ fontFamily: SANS_FONT }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-3 block text-[1.25rem]" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}>
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-[1.75rem] bg-white p-8 sm:p-12" role="tabpanel">
            <Display as="h3" className="m-0" style={{ fontSize: "clamp(2rem, 1.4rem + 1.5vw, 3rem)", lineHeight: 1.05 }}>
              {activeChapter.title}
            </Display>
            <p className="mt-4 max-w-lg text-lg" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
              {activeChapter.line}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="who-heading" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto grid w-full max-w-[80rem] gap-12 md:grid-cols-3">
          <Display as="h2" id="who-heading" className="m-0 md:col-span-3" style={{ fontSize: "clamp(2.25rem, 1.5rem + 2vw, 3.25rem)", lineHeight: 1.02 }}>
            Who it is for
          </Display>
          {[
            ["Artists", "Brief the look in language, then refine the silhouette and the materials in the same thread."],
            ["Game developers", "Name the parts you need, then refine them in the same thread."],
            ["Studios", "Run volume iteration on your own model key, without spending the shared credit pool."],
          ].map(([title, line]) => (
            <div key={title} className="border-t border-[#000c1f]/10 pt-6">
              <h3 className="m-0 text-[1.5rem]" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT, color: INK, letterSpacing: "-0.03em" }}>
                {title}
              </h3>
              <p className="mt-3 text-[17px] leading-relaxed" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
                {line}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="border-t border-[#000c1f]/8 bg-[#f4f8fe] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto grid w-full max-w-[80rem] gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <Display as="h2" id="faq-heading" className="m-0" style={{ fontSize: "clamp(2.5rem, 1.7rem + 2.4vw, 3.75rem)", lineHeight: 0.98 }}>
            Questions
          </Display>
          <div>
            {FAQ.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.q} className="border-t border-[#000c1f]/10 last:border-b">
                  <h3 className="m-0">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left text-[1.2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002664]"
                      style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT, color: INK, letterSpacing: "-0.02em" }}
                    >
                      {item.q}
                      <span aria-hidden className="text-[#002664]">{open ? "–" : "+"}</span>
                    </button>
                  </h3>
                  {open ? (
                    <p className="m-0 max-w-xl pb-6 text-[17px] leading-relaxed" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="resources-heading" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto w-full max-w-[80rem]">
          <Display as="h2" id="resources-heading" className="m-0" style={{ fontSize: "clamp(2.25rem, 1.5rem + 2vw, 3.25rem)", lineHeight: 1.02 }}>
            Resources
          </Display>
          <ul className="mt-10 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-[#000c1f]/8 px-6 py-6 transition-colors hover:bg-[#f4f8fe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002664]"
                >
                  <span className="text-[1.2rem] text-[#000c1f]" style={{ fontFamily: SANS_FONT, fontWeight: SECTION_WEIGHT }}>
                    {item.label}
                  </span>
                  <span className="mt-6 flex items-center justify-between text-[15px]" style={{ fontFamily: GEIST_FONT, color: MUTED }}>
                    {item.line}
                    <ArrowRight className="h-4 w-4 text-[#002664] transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
