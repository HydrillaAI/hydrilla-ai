import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Layers, Lock, Plus, ShieldCheck } from "lucide-react";

import { EnterpriseContactForm } from "@/components/enterprise/EnterpriseContactForm";
import { EnterpriseGlassMark } from "@/components/enterprise/EnterpriseGlassMark";
import { EnterprisePipelineShowcase } from "@/components/enterprise/EnterprisePipelineShowcase";
import { EnterpriseVideo } from "@/components/enterprise/EnterpriseVideo";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import {
  cloudinaryImage,
  featureImage,
  whyHydrillaVideoPoster,
  WHY_HYDRILLA_MEDIA,
} from "@/lib/cloudinary";
import { ENTERPRISE_FAQ } from "@/lib/enterprise-faq";
import { getKitJsonLd } from "@/lib/kit-schema";

const DEMO_URL = "https://cal.com/hydrilla";

// High-resolution 16:9 stills from Hydrilla's own showcase for the curved hero ribbon.
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
  "Zero training on your prompts, references, or 3D models",
  "BlueFox and Water Agent in one shared studio workspace",
  "Native plugins for Blender, Unity, Unreal Engine, and Godot 4",
  "MCP server for AI coding agents and studio automation",
  "Custom credit pools, seats, and API queue priority",
] as const;

const INTEGRATED_STACK = [
  { label: "Blender", href: "/integrations/blender" },
  { label: "Unity", href: "/integrations/unity" },
  { label: "Unreal Engine", href: "/integrations/unreal" },
  { label: "Godot 4", href: "/integrations/godot" },
  { label: "MCP Server", href: "/integrations/mcp" },
  { label: "REST API", href: "/api" },
  { label: "Water Agent", href: "/water" },
  { label: "BlueFox", href: "/bluefox" },
] as const;

const FACTS = [
  {
    value: "4",
    label: "3D software plugins",
    detail: "Blender, Unity, Unreal Engine, and Godot 4",
  },
  {
    value: "$0",
    label: "Water Agent cost",
    detail: "AI 3D agent included with zero credits",
  },
  {
    value: "1",
    label: "Shared studio workspace",
    detail: "Generations, part reviews, and approved assets",
  },
  {
    value: "0%",
    label: "Customer data trained on",
    detail: "Prompts, references, and outputs stay private",
  },
] as const;

const TEAMS = [
  {
    title: "Game development",
    line: "Level dressing, environment props, and asset sets inside Unity, Unreal Engine, and Godot 4.",
    href: "/solutions/games",
    image: "dino",
    span: "md:col-span-3",
  },
  {
    title: "Film and animation",
    line: "Set pieces and props for previs, layout, and background dressing inside Blender.",
    href: "/solutions/film",
    image: "films-a",
    span: "md:col-span-3",
  },
  {
    title: "Architecture and interiors",
    line: "Furniture and fixtures that dress rooms for client presentations and design reviews.",
    href: "/solutions/architecture",
    image: "architecture",
    span: "md:col-span-2",
  },
  {
    title: "AR, VR, and XR",
    line: "Segmented 3D objects with clean UVs and PBR maps checked against frame budgets.",
    href: "/solutions/xr",
    image: "arvr1",
    span: "md:col-span-2",
  },
  {
    title: "Product visualization",
    line: "Product photography turned into editable 3D meshes for web viewers, campaigns, and AR.",
    href: "/solutions/product",
    image: "lampprop",
    span: "md:col-span-2",
  },
] as const;

const COMPARISON: { row: string; pro: ReactNode; enterprise: ReactNode }[] = [
  {
    row: "Agreement",
    pro: (
      <>
        Self-serve monthly plan on <Link href="/pricing" className="ent-link">pricing</Link>
      </>
    ),
    enterprise: "Custom agreement shaped around your studio",
  },
  {
    row: "Workspace",
    pro: "Individuals and small teams",
    enterprise: "Shared studio seats across art, lookdev, and pipeline",
  },
  {
    row: "Water Agent",
    pro: "Included at zero credit cost",
    enterprise: "Included across Studio and plugins at zero credit cost",
  },
  {
    row: "Plugins & Bridge",
    pro: "Blender, Unity, Unreal, and Godot plugins",
    enterprise: "Plugins, local Bridge, and pipeline onboarding",
  },
  {
    row: "MCP & REST API",
    pro: "Standard API and stdio MCP access",
    enterprise: "Concurrency and queue priority sized to volume",
  },
  {
    row: "Credits",
    pro: "3,000 monthly credits",
    enterprise: "Custom credit pools shared across teams",
  },
  {
    row: "Model training",
    pro: "Never trains on customer data",
    enterprise: "Never trains on customer data",
  },
];

/** Renders `[label](href)` segments of a shared FAQ answer as links. */
function withLinks(text: string) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return <Fragment key={i}>{part}</Fragment>;
    return (
      <Link key={i} href={match[2]} className="ent-link">
        {match[1]}
      </Link>
    );
  });
}

function SectionHead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede: ReactNode;
}) {
  return (
    <div className="ent-reveal grid gap-6 border-b border-black/15 pb-8 md:grid-cols-12 md:gap-10 md:pb-12">
      <div className="md:col-span-7">
        {eyebrow ? (
          <p className="mb-2.5 text-[12.5px] font-[510] uppercase tracking-[0.06em] text-black/50">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="ent-h2">{title}</h2>
      </div>
      <p className="ent-lede self-end md:col-span-5">{lede}</p>
    </div>
  );
}

export default function EnterprisePage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/enterprise")} />
      <article className="ent-page">
        {/* Hero */}
        <header className="ent-container flex flex-col items-center pt-[clamp(88px,11vh,128px)] text-center">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[13.5px] font-[510] tracking-[-0.01em] text-black/55"
          >
            <Link href="/" className="transition-colors hover:text-black">
              Hydrilla AI
            </Link>
            <span aria-hidden>/</span>
            <span className="text-black">Enterprise</span>
          </nav>

          <h1 className="ent-title mt-4 max-w-[14ch]">AI 3D built for the enterprise</h1>

          <p className="ent-lede mt-5 max-w-[54ch]">
            Hydrilla Enterprise brings BlueFox, Hydrilla&apos;s 3D model, and Water Agent to your studio
            inside one private workspace, across every 3D plugin, MCP, and the REST API.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={DEMO_URL} className="pickle-pill-solid">
              Book a demo
            </a>
            <a href="#contact-sales" className="pickle-pill-ghost">
              Contact sales
            </a>
          </div>
        </header>

        {/* Large, clear curved 3D showcase ribbon */}
        <div className="relative isolate mt-[clamp(36px,5vw,64px)] pb-[clamp(56px,7vw,96px)]">
          <TiltedGridHero
            images={HERO_ROW}
            tileHeight={52}
            axis={50}
            curve={66}
            gap={7}
            fade={10}
            speed={4.5}
            className="h-[clamp(320px,48vh,540px)] w-full"
          />
        </div>

        {/* Contact Sales Band */}
        <section
          id="contact-sales"
          className="relative z-10 scroll-mt-[110px] border-y border-black/10 bg-[#f5f5f7] py-[clamp(64px,8vw,104px)]"
        >
          <div className="ent-container grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-between lg:col-span-5 lg:pt-2">
              <div>
                <p className="text-[12.5px] font-[510] uppercase tracking-[0.06em] text-black/50">
                  Enterprise Sales
                </p>
                <h2 className="ent-h2 mt-3">Connect with our 3D AI experts</h2>
                <p className="ent-lede mt-4">
                  Plan seats, plugin setup, MCP automation, and API concurrency around your studio&apos;s monthly output.
                </p>

                <ul className="mt-7 space-y-3 border-t border-black/10 pt-6">
                  {EXPERT_FEATURES.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] leading-[1.45] text-black/80">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="text-[12px] font-[510] uppercase tracking-[0.06em] text-black/50">
                  Built for your 3D stack
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INTEGRATED_STACK.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[13px] font-[510] text-black/80 transition-colors hover:border-black/30 hover:text-black"
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <EnterpriseContactForm idPrefix="top" />
            </div>
          </div>
        </section>

        {/* Studio Metrics */}
        <dl className="ent-container grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 md:py-20">
          {FACTS.map((fact) => (
            <div key={fact.label} className="ent-reveal flex flex-col border-t border-black/15 pt-5">
              <dt className="order-2 mt-4 text-[16px] font-[510] tracking-[-0.01em]">{fact.label}</dt>
              <dd className="order-1 text-[clamp(3rem,2rem+3.4vw,4.75rem)] leading-none font-[500] tracking-[-0.04em]">
                {fact.value}
              </dd>
              <dd className="order-3 mt-1 text-[14.5px] leading-[1.4] text-black/60">{fact.detail}</dd>
            </div>
          ))}
        </dl>

        {/* Interactive Pipeline Control */}
        <section id="workflow" className="ent-section ent-container">
          <SectionHead
            eyebrow="Studio Control"
            title="Pro control over your 3D pipeline"
            lede="Switch between Water Agent, native 3D plugins, the shared Studio workspace, and API automation."
          />
          <EnterprisePipelineShowcase />
        </section>

        {/* Clean 2x2 Media Showcase */}
        <section id="organization" className="ent-section ent-container">
          <SectionHead
            eyebrow="Platform"
            title="Built for studios, agents, and 3D software"
            lede="Four core capabilities that connect artists, AI agents, and pipeline automation."
          />

          <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2">
            {/* 1. Water Agent */}
            <div className="ent-bento-card ent-reveal overflow-hidden p-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                <EnterpriseVideo
                  src={WHY_HYDRILLA_MEDIA.multi.video}
                  poster={WHY_HYDRILLA_MEDIA.multi.poster}
                  label="Multi-asset scene generated with Water Agent"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="ent-h3">Water Agent for multi-asset briefs</h3>
                <p className="mt-2.5 text-[15.5px] leading-[1.55] text-black/70">
                  Describe an entire prop set or scene once. Review the plan before generation starts and revise individual pieces inside Studio or your 3D tool.
                </p>
                <Link href="/water" className="ent-link mt-4 inline-block text-[14.5px] font-[510]">
                  See Water Agent
                </Link>
              </div>
            </div>

            {/* 2. Native Plugins */}
            <div className="ent-bento-card ent-reveal overflow-hidden p-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-black/6 bg-white">
                <Image
                  src={featureImage("3df5")}
                  alt="Hydrilla native AI 3D plugin running inside Blender"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-5 sm:p-7"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="ent-h3">Native plugins across 3D software</h3>
                <p className="mt-2.5 text-[15.5px] leading-[1.55] text-black/70">
                  Generate inside Blender, Unity, Unreal Engine, and Godot 4, or send approved meshes from Studio over the local Bridge.
                </p>
                <Link href="/integrations" className="ent-link mt-4 inline-block text-[14.5px] font-[510]">
                  Explore plugins
                </Link>
              </div>
            </div>

            {/* 3. Segmented Parts & PBR */}
            <div className="ent-bento-card ent-reveal overflow-hidden p-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-black/6 bg-white">
                <Image
                  src={featureImage("3df3")}
                  alt="Exploded 3D helmet split into selectable parts with PBR maps in Studio"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4 sm:p-6"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="ent-h3">Segmented parts, UVs, and PBR maps</h3>
                <p className="mt-2.5 text-[15.5px] leading-[1.55] text-black/70">
                  BlueFox returns meshes split into logical parts with unwrapped UVs and PBR maps attached, ready for lookdev and lighting.
                </p>
                <Link href="/bluefox" className="ent-link mt-4 inline-block text-[14.5px] font-[510]">
                  Meet BlueFox
                </Link>
              </div>
            </div>

            {/* 4. MCP & REST API */}
            <div className="ent-bento-card-dark ent-reveal overflow-hidden p-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                <Image
                  src={featureImage("3df2")}
                  alt="Base color, roughness, metalness, and normal PBR maps ready via API and MCP"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4 sm:p-6"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="ent-h3 text-white">MCP server and REST API concurrency</h3>
                <p className="mt-2.5 text-[15.5px] leading-[1.55] text-white/70">
                  Run batch 3D jobs from your own backend with dedicated concurrency and queue priority, or connect AI coding agents over MCP.
                </p>
                <div className="mt-4 flex flex-wrap gap-5 text-[14.5px] font-[510] text-white">
                  <Link href="/integrations/mcp" className="ent-link">
                    MCP server
                  </Link>
                  <Link href="/api" className="ent-link">
                    REST API
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Studio Teams */}
        <section id="teams" className="ent-section ent-container">
          <SectionHead
            eyebrow="Use Cases"
            title="Built for every 3D team"
            lede="Five production pipelines running BlueFox and Water Agent today."
          />
          <ul className="mt-10 grid gap-6 md:mt-12 md:grid-cols-6">
            {TEAMS.map((team) => (
              <li key={team.href} className={`ent-reveal ${team.span}`}>
                <Link
                  href={team.href}
                  className="group flex h-full flex-col justify-between rounded-[24px] border border-black/8 bg-[#f5f5f7] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_22px_48px_-30px_rgba(0,0,0,0.18)] sm:p-5"
                >
                  <div>
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-white">
                      <Image
                        src={cloudinaryImage(`hydrilla-landing/industrypower/${team.image}`)}
                        alt={team.title}
                        fill
                        sizes="(max-width: 767px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </span>
                    <div className="mt-5 flex items-center justify-between gap-2">
                      <h3 className="ent-h3">{team.title}</h3>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-black/45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-2 text-[15px] leading-[1.5] tracking-[-0.01em] text-black/70">{team.line}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Pro vs Enterprise Comparison */}
        <section id="compare" className="ent-section ent-container">
          <SectionHead
            eyebrow="Comparison"
            title="Pro vs Enterprise"
            lede="Pro fits individuals and small teams buying online. Enterprise tailors seats, credits, concurrency, and support around your studio."
          />
          <div className="ent-reveal mt-8 overflow-x-auto rounded-[24px] border border-black/10 bg-white px-6 py-2">
            <table className="w-full min-w-[640px] border-collapse text-left text-[15.5px] leading-[1.45] tracking-[-0.01em]">
              <thead>
                <tr className="border-b border-black/15">
                  <td className="py-5 pr-6 text-[12.5px] font-[510] uppercase tracking-[0.06em] text-black/45">
                    Capability
                  </td>
                  <th scope="col" className="py-5 pr-6 font-[510] text-black">
                    Pro
                  </th>
                  <th scope="col" className="py-5 font-[510] text-black">
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
                    <td className="w-[38%] py-4 pr-6 text-black/68">{pro}</td>
                    <td className="py-4 font-[500] text-black/90">{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Security, Data, and IP */}
        <section id="security" className="ent-section bg-[#f5f5f7] py-[clamp(72px,9vw,120px)]">
          <div className="ent-container">
            <SectionHead
              eyebrow="Data & IP"
              title="Your work stays yours"
              lede={
                <>
                  Details live on the <Link href="/security" className="ent-link">security page</Link>; the{" "}
                  <Link href="/privacy" className="ent-link">Privacy Policy</Link> and{" "}
                  <Link href="/terms" className="ent-link">Terms</Link> are the binding documents.
                </>
              }
            />
            <ul className="mt-10 grid gap-6 md:mt-12 md:grid-cols-3">
              <li className="ent-reveal flex flex-col justify-between rounded-[24px] border border-black/8 bg-white p-6 sm:p-7">
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7] text-black">
                    <Lock className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="ent-h3 mt-5">Zero model training</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.55] text-black/70">
                    Prompts, reference images, and generated 3D assets are never used to train our models on any plan.
                  </p>
                </div>
                <Link href="/security" className="ent-link mt-6 inline-block text-[14.5px] font-[510]">
                  How we handle data
                </Link>
              </li>

              <li className="ent-reveal flex flex-col justify-between rounded-[24px] border border-black/8 bg-white p-6 sm:p-7">
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7] text-black">
                    <ShieldCheck className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="ent-h3 mt-5">Full output ownership</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.55] text-black/70">
                    As between you and Hydrilla AI, and to the extent the law allows, you own generated outputs for commercial use.
                  </p>
                </div>
                <Link href="/terms#ownership" className="ent-link mt-6 inline-block text-[14.5px] font-[510]">
                  Read ownership terms
                </Link>
              </li>

              <li className="ent-reveal flex flex-col justify-between rounded-[24px] border border-black/8 bg-white p-6 sm:p-7">
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7] text-black">
                    <Layers className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="ent-h3 mt-5">Scoped to your workspace</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.55] text-black/70">
                    Sessions stay isolated per user, assets stay scoped to your studio, and Bridge transfers stay local on your machine.
                  </p>
                </div>
                <Link href="/security" className="ent-link mt-6 inline-block text-[14.5px] font-[510]">
                  Security overview
                </Link>
              </li>
            </ul>

            <p className="ent-reveal mt-8 rounded-2xl border border-black/10 bg-white px-6 py-4 text-[15px] leading-[1.55] text-black/75">
              Need a vendor review or custom legal agreement? Send your questionnaire to{" "}
              <a href="mailto:founders@hydrilla.ai" className="ent-link font-[510] text-black">
                founders@hydrilla.ai
              </a>{" "}
              with your studio name and timeline.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="ent-section ent-container pb-[clamp(80px,10vw,140px)]">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="ent-reveal md:col-span-4">
              <p className="mb-2.5 text-[12.5px] font-[510] uppercase tracking-[0.06em] text-black/50">
                FAQ
              </p>
              <h2 className="ent-h2">Enterprise questions, answered</h2>
            </div>
            <div className="border-t border-black/15 md:col-span-8">
              {ENTERPRISE_FAQ.map((item, i) => (
                <details key={item.q} open={i === 0} className="group border-b border-black/15">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="ent-h3">{item.q}</h3>
                    <Plus className="mt-1 h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden />
                  </summary>
                  <p className="max-w-[64ch] pb-7 text-[15.5px] leading-[1.55] tracking-[-0.01em] text-black/70">
                    {withLinks(item.a)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing Liquid Glass Band */}
        <section id="contact" className="scroll-mt-[120px] bg-[#f5f5f7] pb-[clamp(88px,11vw,144px)]">
          <EnterpriseGlassMark />
          <div className="ent-container text-center">
            <h2 className="ent-h2 text-balance">Get Hydrilla Enterprise</h2>
            <p className="mx-auto mt-5 max-w-[54ch] text-[clamp(1.0625rem,1rem+0.3vw,1.25rem)] leading-[1.45] tracking-[-0.015em] text-black/68">
              Ready to bring BlueFox, Water Agent, and native 3D plugins to your studio?
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={DEMO_URL} className="pickle-pill-solid">
                Book a demo
              </a>
              <a href="#contact-sales" className="pickle-pill-ghost">
                Contact sales
              </a>
            </div>
          </div>
        </section>
      </article>
      <Footer />
    </>
  );
}
