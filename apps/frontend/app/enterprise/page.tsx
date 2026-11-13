import Image from "next/image";
import { Check, Lock, Plus, ShieldCheck, Users } from "lucide-react";

import { EnterpriseContactForm } from "@/components/enterprise/EnterpriseContactForm";
import { EnterpriseGlassMark } from "@/components/enterprise/EnterpriseGlassMark";
import { EnterprisePipelineShowcase } from "@/components/enterprise/EnterprisePipelineShowcase";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { DEMO_URL } from "@/lib/brand";
import { cloudinaryImage, featureImage, whyHydrillaVideoPoster } from "@/lib/cloudinary";
import { ENTERPRISE_FAQ } from "@/lib/enterprise-faq";
import { getKitJsonLd } from "@/lib/kit-schema";

const ROW_TILE = "f_webp,q_auto,c_fill,g_auto,w_1200,h_675";
const HERO_ROW = [
  ...["bluefox-why", "model-why", "blender-why", "texture-why-model", "rockey-why", "multi-why", "mesh-why"].map((id) => ({
    src: whyHydrillaVideoPoster(id, `so_1,${ROW_TILE}`),
  })),
  ...["dino", "films-a", "architecture"].map((id) => ({
    src: cloudinaryImage(`hydrilla-landing/industrypower/${id}`, ROW_TILE),
  })),
].flatMap((img, i, all) => (i < 7 ? [img, all[7 + (i % 3)]] : []));

const EXPERT_FEATURES = [
  "No model training on your prompts, references, or 3D assets",
  "BlueFox and Water Agent in one private studio workspace",
  "Easy seat, role, and shared studio credit pool management",
  "Native plugins for Blender, Maya, 3ds Max, Unity, Unreal, and Godot 4",
  "Dedicated REST API concurrency, queue priority, and MCP server",
] as const;

const DCC_LOGOS: {
  name: string;
  src: string;
  wordmark?: boolean;
}[] = [
  { name: "Blender", src: "/dcc-logos/blender.svg", wordmark: true },
  { name: "Unity", src: "/dcc-logos/unity.svg", wordmark: true },
  { name: "Autodesk Maya", src: "/dcc-logos/maya.svg", wordmark: true },
  { name: "Autodesk 3ds Max", src: "/dcc-logos/3ds-max.svg", wordmark: true },
  { name: "Unreal Engine", src: "/dcc-logos/unreal-engine.svg" },
  { name: "SideFX Houdini", src: "/dcc-logos/houdini.svg", wordmark: true },
  { name: "Cinema 4D", src: "/dcc-logos/cinema-4d.svg", wordmark: true },
  { name: "ZBrush", src: "/dcc-logos/zbrush.svg" },
  { name: "Foundry Nuke", src: "/dcc-logos/nuke.svg" },
  { name: "DaVinci Resolve", src: "/dcc-logos/davinci-resolve.svg" },
  { name: "Krita", src: "/dcc-logos/krita.svg" },
  { name: "GIMP", src: "/dcc-logos/gimp.svg" },
  { name: "AutoCAD", src: "/dcc-logos/autocad.svg", wordmark: true },
  { name: "Autodesk Fusion", src: "/dcc-logos/fusion.svg", wordmark: true },
];

const SCALE_CARDS = [
  {
    stat: "6+",
    title: "Native 3D software plugins",
    body: "Generate and receive models inside Blender, Maya, 3ds Max, Unity, Unreal Engine, and Godot 4.",
  },
  {
    stat: "$0",
    title: "Water Agent credit cost",
    body: "Plan and revise multi-asset 3D scenes in conversation with zero credit overhead.",
  },
  {
    stat: "1",
    title: "Unified studio workspace",
    body: "Seats, shared asset libraries, in-browser part inspection, and pooled credits in one place.",
  },
  {
    stat: "0%",
    title: "Customer data used to train",
    body: "Unreleased concepts, prompts, and generated 3D meshes stay private on every plan.",
  },
] as const;

const STUDIO_ROSTER = [
  { initials: "AK", name: "Alex Kim", role: "Owner" },
  { initials: "MR", name: "Maya Ross", role: "Admin" },
  { initials: "DL", name: "Devon Lin", role: "Tech Art" },
  { initials: "SP", name: "Sara Patel", role: "Env Artist" },
] as const;

const PIPELINE_CONTROLS = [
  "Segmented sub-parts",
  "Unwrapped UVs",
  "Base color, roughness, metalness & normal maps",
  "Water Agent scene planning",
  "In-browser lighting & wireframe check",
  "Local DCC Bridge (127.0.0.1)",
  "High-concurrency REST API",
  "Stdio MCP server for AI agents",
] as const;

const STUDIOS = [
  {
    title: "Game development",
    body: "Level dressing, environment props, and biome kits built directly into Unity, Unreal Engine, and Godot 4.",
    image: "dino",
    span: "md:col-span-3",
  },
  {
    title: "Film, VFX, and animation",
    body: "Previs sets, layout stand-ins, and background dressing across Blender, Maya, 3ds Max, and Houdini.",
    image: "films-a",
    span: "md:col-span-3",
  },
  {
    title: "Architecture and interiors",
    body: "Custom furniture, lighting fixtures, and room staging for rapid client design reviews.",
    image: "architecture",
    span: "md:col-span-2",
  },
  {
    title: "AR, VR, and spatial",
    body: "Clean, segmented 3D props with UVs and PBR maps ready to budget for standalone headsets.",
    image: "arvr1",
    span: "md:col-span-2",
  },
  {
    title: "Product and commerce",
    body: "Studio photography converted into interactive 3D product models for web viewers and campaigns.",
    image: "lampprop",
    span: "md:col-span-2",
  },
] as const;

const COMPARISON = [
  {
    row: "How you buy",
    pro: "Self-serve monthly ($12/mo)",
    enterprise: "Custom agreement shaped around your studio",
  },
  {
    row: "Seats & workspace",
    pro: "Individuals and small teams",
    enterprise: "Shared studio workspace across art, lookdev, and pipeline",
  },
  {
    row: "Credit structure",
    pro: "3,000 monthly credits",
    enterprise: "Pooled studio credits sized to monthly production volume",
  },
  {
    row: "Water Agent",
    pro: "Included at zero credit cost",
    enterprise: "Included across Studio and all plugins at zero credit cost",
  },
  {
    row: "3D software plugins",
    pro: "Self-serve plugins and Bridge",
    enterprise: "Plugins, local Bridge, and hands-on pipeline onboarding",
  },
  {
    row: "REST API & MCP",
    pro: "Standard API and stdio MCP",
    enterprise: "Dedicated API concurrency and priority queue throughput",
  },
  {
    row: "Data & IP",
    pro: "Commercial rights · Never trains models",
    enterprise: "Commercial rights · Never trains models · Vendor review support",
  },
] as const;

export default function EnterprisePage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/enterprise")} />
      <article className="ent-page">
        {/* 1. Hero + Curved Showcase */}
        <header className="ent-container flex flex-col items-center pt-[clamp(112px,14vh,152px)] text-center">
          <p className="text-[13px] font-[510] tracking-[-0.01em] text-black/50">
            Hydrilla AI <span className="mx-1.5 text-black/30">/</span>{" "}
            <span className="text-black">Enterprise</span>
          </p>

          <h1 className="ent-title mt-4 max-w-[15ch]">
            AI 3D creative production built for the enterprise
          </h1>

          <p className="ent-lede mt-5 max-w-[54ch]">
            BlueFox, Hydrilla&apos;s 3D model, Water Agent, native 3D software plugins, MCP, and high-concurrency API access in one private studio workspace, so your teams ship production 3D on schedule.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="#contact-sales" className="pickle-pill-solid">
              Contact sales
            </a>
            <a href={DEMO_URL} className="pickle-pill-ghost">
              Talk to our team
            </a>
          </div>
        </header>

        <div className="relative isolate mt-6 pb-[clamp(44px,5.5vw,76px)] md:mt-8">
          <TiltedGridHero
            images={HERO_ROW}
            tileHeight={76}
            axis={50}
            curve={68}
            gap={7}
            fade={10}
            speed={4.5}
            className="h-[clamp(280px,38vh,400px)] w-full"
          />
        </div>

        {/* 2. Higgsfield-style Split: Connect With Our AI Experts + Contact Sales Form + DCC Logos */}
        <section
          id="contact-sales"
          className="relative z-10 scroll-mt-[100px] border-y border-black/8 bg-[#f5f5f7] py-[clamp(64px,8vw,108px)]"
        >
          <div className="ent-container grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Pitch + Features + DCC Logo Matrix */}
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <h2 className="ent-h2 max-w-[14ch]">Connect with our 3D AI experts</h2>
                <p className="mt-3 text-[15.5px] leading-[1.55] text-black/65">
                  Features included in every studio deployment:
                </p>

                <ul className="mt-6 space-y-3.5">
                  {EXPERT_FEATURES.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15.5px] leading-[1.45] text-black/85">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* All 14 DCC Software Logos right under features (matching Higgsfield's partner logo placement) */}
              <div className="mt-10 border-t border-black/10 pt-8">
                <p className="text-[13.5px] font-[510] text-black/60">
                  Built to fit every 3D engine and DCC tool in your studio pipeline
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                  {DCC_LOGOS.map((logo) => (
                    <li
                      key={logo.name}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-black/8 bg-white px-3"
                    >
                      {logo.wordmark ? (
                        <Image
                          src={logo.src}
                          alt={logo.name}
                          width={104}
                          height={24}
                          className="max-h-5 w-auto max-w-[100px] object-contain"
                        />
                      ) : (
                        <>
                          <Image
                            src={logo.src}
                            alt=""
                            aria-hidden
                            width={20}
                            height={20}
                            className="h-5 w-5 shrink-0 object-contain"
                          />
                          <span className="truncate text-[12.5px] font-[510] tracking-[-0.01em] text-black/85">
                            {logo.name}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Structured Contact Sales Card */}
            <div className="lg:col-span-6">
              <EnterpriseContactForm idPrefix="top" />
            </div>
          </div>
        </section>

        {/* 3. The Capacity, Speed, and Support to Scale */}
        <section className="ent-section ent-container">
          <div className="ent-reveal mx-auto max-w-[680px] text-center">
            <h2 className="ent-h2">The capacity, speed, and support to scale</h2>
            <p className="ent-lede mt-4">
              Move from concept brief to UV-unwrapped, segmented 3D assets in minutes instead of weeks in a modeling queue.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCALE_CARDS.map((card) => (
              <div
                key={card.title}
                className="ent-bento-card ent-reveal rounded-[24px] p-6 sm:p-7"
              >
                <p className="text-[clamp(2.75rem,2.1rem+2.5vw,4rem)] leading-none font-[510] tracking-[-0.045em] text-black tabular-nums">
                  {card.stat}
                </p>
                <div className="mt-8">
                  <h3 className="text-[17px] font-[510] tracking-[-0.02em] text-black">{card.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.5] text-black/65">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Pro Control Over Workflow (Interactive Studio Window) */}
        <section id="workflow" className="ent-section ent-container">
          <div className="ent-reveal mx-auto max-w-[680px] text-center">
            <h2 className="ent-h2">Pro control over workflow</h2>
            <p className="ent-lede mt-4">
              Every artist, technical director, and automation script works against the same studio workspace and credit pool.
            </p>
          </div>

          <EnterprisePipelineShowcase />
        </section>

        {/* 5. BlueFox 3D Architecture Banner (Higgsfield Cinema Studio equivalent) */}
        <section className="ent-section ent-container">
          <div className="ent-reveal overflow-hidden rounded-[28px] border border-black/10 bg-[#0a0a0c] p-6 text-white sm:p-10 lg:p-12">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="text-[13px] font-[510] tracking-[-0.01em] text-white/55">
                BlueFox · In-house 3D Architecture
              </p>
              <h2 className="ent-h2 mt-3 text-white">All the 3D pipeline controls you rely on</h2>
              <p className="mt-4 text-[16px] leading-[1.55] text-white/68">
                Every model arrives segmented into editable parts with unwrapped UVs and attached PBR texture maps, ready for lighting, material swaps, and scene assembly.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {PIPELINE_CONTROLS.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-[500] text-white/85"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={featureImage("3df3")}
                    alt="Segmented 3D helmet split into selectable parts"
                    fill
                    sizes="(max-width: 768px) 100vw, 48vw"
                    className="object-contain p-4 sm:p-6"
                  />
                </div>
                <div className="border-t border-black/8 bg-[#fafafa] px-5 py-3.5 text-black">
                  <p className="text-[14.5px] font-[510]">Part-level mesh segmentation</p>
                  <p className="text-[13px] text-black/60">Select, hide, or re-material individual components without cutting apart a fused shell.</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={featureImage("3df2")}
                    alt="Base color, roughness, metalness, and normal PBR maps"
                    fill
                    sizes="(max-width: 768px) 100vw, 48vw"
                    className="object-contain p-4 sm:p-6"
                  />
                </div>
                <div className="border-t border-black/8 bg-[#fafafa] px-5 py-3.5 text-black">
                  <p className="text-[14.5px] font-[510]">4-channel PBR maps &amp; clean UVs</p>
                  <p className="text-[13px] text-black/60">Base color, roughness, metalness, and normal maps react accurately under engine lighting.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Your Data, IP, and Governance Bento (Higgsfield Security + Provisioning equivalent) */}
        <section id="security" className="ent-section bg-[#f5f5f7] py-[clamp(72px,9vw,120px)]">
          <div className="ent-container">
            <div className="ent-reveal max-w-[680px]">
              <h2 className="ent-h2">Your data and IP are protected</h2>
              <p className="ent-lede mt-4">
                Unreleased characters, environments, and product designs stay private inside your studio workspace, backed by clear commercial ownership.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-12">
              {/* Card A: No training on your data */}
              <div className="ent-reveal flex flex-col justify-between rounded-[24px] border border-black/8 bg-white p-6 sm:p-7 md:col-span-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7] text-black">
                      <Lock className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full border border-black/10 bg-[#f5f5f7] px-3 py-1 text-[12px] font-[510] text-black">
                      Private by default
                    </span>
                  </div>
                  <h3 className="ent-h3 mt-6">No training on your data</h3>
                  <p className="mt-2.5 text-[14.5px] leading-[1.55] text-black/68">
                    Hydrilla never trains models on your prompts, reference images, or generated 3D meshes, protecting unreleased titles and confidential client briefs.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-black/8 bg-[#f7f7f8] p-4">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-[510] text-black">Model training on studio assets</span>
                    <span className="rounded-md bg-black px-2 py-0.5 text-[11.5px] font-[510] text-white">OFF</span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[13px] text-black/65">
                    <span>Local DCC Bridge transfer</span>
                    <span className="font-[510] text-black">127.0.0.1 only</span>
                  </div>
                </div>
              </div>

              {/* Card B: Centralized seats & credit pool visual */}
              <div className="ent-reveal flex flex-col justify-between rounded-[24px] border border-black/8 bg-white p-6 sm:p-7 md:col-span-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7] text-black">
                      <Users className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full border border-black/10 bg-[#f5f5f7] px-3 py-1 text-[12px] font-[510] text-black">
                      Studio pool
                    </span>
                  </div>
                  <h3 className="ent-h3 mt-6">Centralized seats &amp; credit pool</h3>
                  <p className="mt-2.5 text-[14.5px] leading-[1.55] text-black/68">
                    Manage studio members in one workspace and share one unified monthly credit pool across artists, plugins, and automated API builds.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-black/8 bg-[#f7f7f8] p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {STUDIO_ROSTER.map((m) => (
                      <div key={m.name} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 border border-black/6">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-[510] text-white">
                          {m.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-[510] text-black">{m.name}</p>
                          <p className="text-[10.5px] text-black/50">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11.5px] text-black/60">
                      <span>Environment 45%</span>
                      <span>Lookdev 35%</span>
                      <span>API 20%</span>
                    </div>
                    <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-black/10">
                      <span className="w-[45%] bg-black" />
                      <span className="w-[35%] bg-black/55" />
                      <span className="w-[20%] bg-black/25" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card C: Commercial IP + Procurement */}
              <div className="ent-reveal flex flex-col justify-between rounded-[24px] border border-black/8 bg-white p-6 sm:p-7 md:col-span-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7] text-black">
                      <ShieldCheck className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full border border-black/10 bg-[#f5f5f7] px-3 py-1 text-[12px] font-[510] text-black">
                      Commercial IP
                    </span>
                  </div>
                  <h3 className="ent-h3 mt-6">Full ownership &amp; vendor reviews</h3>
                  <p className="mt-2.5 text-[14.5px] leading-[1.55] text-black/68">
                    You own generated 3D outputs for commercial release, and our team supports security questionnaires, custom legal agreements, and hands-on onboarding.
                  </p>
                </div>

                <div className="mt-6 space-y-2 rounded-2xl border border-black/8 bg-[#f7f7f8] p-4 text-[13px]">
                  {[
                    "Commercial rights on generated 3D assets",
                    "Isolated per-user sessions & workspace scope",
                    "Written vendor security questionnaire responses",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-black/80">
                      <Check className="h-3.5 w-3.5 shrink-0 text-black" aria-hidden />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Production Verticals */}
        <section id="teams" className="ent-section ent-container">
          <div className="ent-reveal max-w-[680px]">
            <h2 className="ent-h2">Built for every 3D production team</h2>
            <p className="ent-lede mt-4">
              Five studio disciplines putting BlueFox and Water Agent to work across real production schedules.
            </p>
          </div>

          <ul className="mt-10 grid gap-5 md:grid-cols-6">
            {STUDIOS.map((studio) => (
              <li
                key={studio.title}
                className={`ent-bento-card ent-reveal overflow-hidden p-4 sm:p-5 ${studio.span}`}
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-white">
                    <Image
                      src={cloudinaryImage(`hydrilla-landing/industrypower/${studio.image}`)}
                      alt={studio.title}
                      fill
                      sizes="(max-width: 767px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="ent-h3 mt-4">{studio.title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.5] text-black/68">{studio.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 8. Pro vs Enterprise */}
        <section id="compare" className="ent-section ent-container">
          <div className="ent-reveal max-w-[680px]">
            <h2 className="ent-h2">Pro vs Enterprise</h2>
            <p className="ent-lede mt-4">
              Pro serves individual creators and small teams. Enterprise scales seats, credit pools, API concurrency, and support around your studio.
            </p>
          </div>

          <div className="ent-reveal mt-8 overflow-x-auto rounded-[24px] border border-black/10 bg-white px-6 py-2">
            <table className="w-full min-w-[640px] border-collapse text-left text-[15px] leading-[1.45] tracking-[-0.01em]">
              <thead>
                <tr className="border-b border-black/15">
                  <th scope="col" className="py-4 pr-6 font-[510] text-black/50">
                    Capability
                  </th>
                  <th scope="col" className="py-4 pr-6 font-[510] text-black">
                    Pro
                  </th>
                  <th scope="col" className="py-4 font-[510] text-black">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ row, pro, enterprise }) => (
                  <tr key={row} className="border-b border-black/8 last:border-b-0">
                    <th scope="row" className="w-[24%] py-4 pr-6 font-[510] text-black">
                      {row}
                    </th>
                    <td className="w-[36%] py-4 pr-6 text-black/65">{pro}</td>
                    <td className="py-4 font-[500] text-black">{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq" className="ent-section ent-container pb-[clamp(72px,9vw,128px)]">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="ent-reveal md:col-span-4">
              <h2 className="ent-h2">Got any questions left?</h2>
              <p className="mt-3 text-[15px] leading-[1.5] text-black/65">
                Answers for studio leads, technical directors, and procurement reviewers.
              </p>
            </div>
            <div className="border-t border-black/15 md:col-span-8">
              {ENTERPRISE_FAQ.map((item, i) => (
                <details key={item.q} open={i === 0} className="group border-b border-black/15">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                    <h3 className="ent-h3">{item.q}</h3>
                    <Plus className="mt-1 h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden />
                  </summary>
                  <p className="max-w-[64ch] pb-6 text-[15.5px] leading-[1.55] tracking-[-0.01em] text-black/70">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Closing Liquid Glass Mark + Second Contact Sales Band */}
        <section id="contact" className="scroll-mt-[100px] border-t border-black/8 bg-[#f5f5f7] pb-[clamp(80px,10vw,136px)]">
          <EnterpriseGlassMark />
          <div className="ent-container grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5 lg:pt-4">
              <h2 className="ent-h2 text-balance">Bring Hydrilla Enterprise to your studio</h2>
              <p className="ent-lede mt-4">
                Share your studio size, primary 3D tools, and target monthly volume, or schedule a live walkthrough with our team.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={DEMO_URL} className="pickle-pill-solid">
                  Talk to our team
                </a>
                <a href="mailto:founders@hydrilla.ai" className="pickle-pill-ghost">
                  founders@hydrilla.ai
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <EnterpriseContactForm idPrefix="bottom" />
            </div>
          </div>
        </section>
      </article>
      <Footer />
    </>
  );
}
