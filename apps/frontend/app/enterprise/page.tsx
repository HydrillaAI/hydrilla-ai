import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { EnterpriseContactForm } from "@/components/enterprise/EnterpriseContactForm";
import { EnterpriseGlassMark } from "@/components/enterprise/EnterpriseGlassMark";
import { EnterpriseVideo } from "@/components/enterprise/EnterpriseVideo";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { cloudinaryImage, whyHydrillaVideoPoster, WHY_HYDRILLA_MEDIA } from "@/lib/cloudinary";
import { ENTERPRISE_FAQ } from "@/lib/enterprise-faq";
import { getKitJsonLd } from "@/lib/kit-schema";

const DEMO_URL = "https://cal.com/hydrilla";

// Stills from Hydrilla's own showcase, cropped to the row's 16:9 tiles. The 3d-assets clip is left
// out on purpose: it shows third-party brand logos.
const ROW_TILE = "f_webp,q_auto,c_fill,g_auto,w_960,h_540";
const HERO_ROW = [
  ...["bluefox-why", "model-why", "blender-why", "texture-why-model", "rockey-why", "multi-why", "mesh-why"].map((id) => ({
    src: whyHydrillaVideoPoster(id, `so_1,${ROW_TILE}`),
  })),
  ...["dino", "films-a", "architecture"].map((id) => ({
    src: cloudinaryImage(`hydrilla-landing/industrypower/${id}`, ROW_TILE),
  })),
].flatMap((img, i, all) => (i < 7 ? [img, all[7 + (i % 3)]] : []));

const FACTS = [
  { value: "4", label: "Export formats", detail: "GLB, FBX, OBJ, and USDZ" },
  { value: "4", label: "Engine and DCC plugins", detail: "Blender, Unity, Unreal, and Godot" },
  { value: "1", label: "Shared workspace", detail: "Generations, reviews, and approved versions" },
  { value: "0", label: "Customer data used for training", detail: "On any plan" },
];

const STEPS = [
  {
    title: "Brief the asset",
    body: "Type a prompt or upload a reference image. For a whole set, brief Water Agent as you would brief your team: the look, the pieces, the scene.",
    media: WHY_HYDRILLA_MEDIA.model,
    label: "A stylized armored character on a blue background",
  },
  {
    title: "Generate and review",
    body: "BlueFox returns a mesh in parts, UV-unwrapped, with PBR maps attached. Orbit it, select parts, and check materials under light, right in the browser.",
    media: WHY_HYDRILLA_MEDIA.blender,
    label: "A rendered kitchen scene above the same scene in wireframe",
  },
  {
    title: "Export into your pipeline",
    body: "Download GLB, FBX, OBJ, or USDZ, or send the model over the local Bridge into Blender, Unity, Unreal, or Godot.",
    media: WHY_HYDRILLA_MEDIA.mesh,
    label: "A hillside town drawn with mesh lines over a dark blue mountain",
  },
];

const ORGANIZATION = [
  {
    title: "Seats in a shared workspace",
    body: "Art, lookdev, and pipeline staff work together in one shared workspace, so generations, reviews, and approved versions live in the same place.",
  },
  {
    title: "API concurrency",
    body: "Jobs from your own backend, sized to your volume, for asset libraries, build steps, and internal tools.",
  },
  {
    title: "Custom credit pools",
    body: "Custom plans with credit pools set around your monthly volume, instead of individual allowances.",
  },
  {
    title: "Queue priority",
    body: "Priority is part of your plan, set around the monthly volume your pipeline needs.",
  },
  {
    title: "Pipeline support",
    body: "Help connecting the Bridge and plugins to your pipeline, so artists get generation inside the tools they already use.",
  },
  {
    title: "Water Agent for the team",
    body: "The AI 3D agent works alongside artists from brief to finished assets, in the Hydrilla app and inside their tools. It costs no credits.",
  },
];

const TEAMS = [
  {
    title: "Game development",
    line: "Level dressing and prop sets for your game engine.",
    href: "/solutions/games",
    image: "dino",
    span: "md:col-span-3",
  },
  {
    title: "Film and animation",
    line: "Set pieces and props for previs, layout, and background dressing.",
    href: "/solutions/film",
    image: "films-a",
    span: "md:col-span-3",
  },
  {
    title: "Architecture and interiors",
    line: "Furniture and fixtures that dress rooms for presentations and reviews.",
    href: "/solutions/architecture",
    image: "architecture",
    span: "md:col-span-2",
  },
  {
    title: "AR, VR, and XR",
    line: "Objects for headsets and spatial apps, checked against a frame budget.",
    href: "/solutions/xr",
    image: "arvr1",
    span: "md:col-span-2",
  },
  {
    title: "Product visualization",
    line: "Product photos turned into 3D for web viewers, campaigns, and AR.",
    href: "/solutions/product",
    image: "lampprop",
    span: "md:col-span-2",
  },
];

const COMPARISON: { row: string; pro: ReactNode; enterprise: ReactNode }[] = [
  {
    row: "How you buy",
    pro: (
      <>
        Self-serve and monthly, on <Link href="/pricing" className="ent-link">pricing</Link>
      </>
    ),
    enterprise: "An agreement shaped around your studio",
  },
  { row: "Built for", pro: "Individuals and small teams", enterprise: "Whole studios, with seats in a shared workspace" },
  { row: "Credits", pro: "3,000 monthly credits on a set plan", enterprise: "Custom plans and credit pools" },
  { row: "API", pro: "REST API access", enterprise: "API concurrency sized to your volume" },
  { row: "Pipeline", pro: "Plugins and docs", enterprise: "Help connecting the Bridge and plugins" },
  { row: "Water Agent", pro: "Included, at no credit cost", enterprise: "Included, at no credit cost" },
  { row: "Export formats", pro: "GLB, FBX, OBJ, and USDZ", enterprise: "GLB, FBX, OBJ, and USDZ" },
  { row: "Training on your data", pro: "Never", enterprise: "Never" },
];

const API_REQUEST = `curl -X POST https://api.hydrilla.co/v1/3d/text-to-3d \\
  -H "Authorization: Bearer hyd_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Futuristic cyberpunk vehicle, high details, game ready prop",
    "resolution": 1536
  }'`;

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

function SectionHead({ title, lede }: { title: string; lede: ReactNode }) {
  return (
    <div className="ent-reveal grid gap-6 border-b border-black/15 pb-10 md:grid-cols-12 md:gap-10 md:pb-14">
      <h2 className="ent-h2 md:col-span-7">{title}</h2>
      <p className="ent-lede self-end md:col-span-5">{lede}</p>
    </div>
  );
}

function DetailList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 divide-y divide-black/10 border-y border-black/10">
      {items.map((item) => (
        <li key={item} className="py-3 text-[16px] leading-[1.45] tracking-[-0.01em] text-black/75">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function EnterprisePage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/enterprise")} />
      <article className="ent-page">
        <header className="ent-container flex flex-col items-center pt-[clamp(120px,17vh,184px)] text-center">
          <p className="text-[15px] font-[510] tracking-[-0.01em] text-black/60">Studios</p>
          <h1 className="ent-title mt-5 max-w-[12ch]">Hydrilla for Enterprise</h1>
          <p className="mt-8 max-w-[26ch] text-[clamp(1.5rem,1.15rem+1.4vw,2.25rem)] leading-[1.12] font-[500] tracking-[-0.03em] text-balance">
            Production 3D assets at enterprise scale, across your whole studio.
          </p>
          <p className="ent-lede mt-6 max-w-[56ch]">
            Hydrilla Enterprise brings BlueFox, Hydrilla&apos;s 3D model, and Water Agent to your team in one shared
            workspace and through the API, with seats, API concurrency, custom plans, and pipeline support.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href={DEMO_URL} className="pickle-pill-solid">
              Book a demo
            </a>
            <a href="#contact" className="pickle-pill-ghost">
              Talk to our team
            </a>
          </div>
        </header>

        <TiltedGridHero
          images={HERO_ROW}
          tileHeight={58}
          axis={50}
          curve={74}
          gap={7}
          fade={10}
          speed={4.5}
          className="mt-[clamp(40px,6vw,72px)] h-[clamp(260px,44vh,520px)] w-full"
        />

        <dl className="ent-container grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 md:py-20">
          {FACTS.map((fact) => (
            <div key={fact.label} className="ent-reveal flex flex-col border-t border-black/15 pt-5">
              <dt className="order-2 mt-4 text-[16px] font-[510] tracking-[-0.01em]">{fact.label}</dt>
              <dd className="order-1 text-[clamp(3rem,2rem+3.4vw,5rem)] leading-none font-[500] tracking-[-0.04em]">{fact.value}</dd>
              <dd className="order-3 mt-1 text-[15px] leading-[1.4] text-black/60">{fact.detail}</dd>
            </div>
          ))}
        </dl>

        <section id="workflow" className="ent-section ent-container">
          <SectionHead
            title="From a prompt or an image to an asset in your pipeline"
            lede="Brief it, review it in the browser, and move it into the tools your team already uses."
          />
          <ol className="mt-10 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="ent-reveal">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-black">
                  <EnterpriseVideo src={step.media.video} poster={step.media.poster} label={step.label} />
                </div>
                <p className="mt-5 text-[15px] font-[510] text-black/50 tabular-nums">0{i + 1}</p>
                <h3 className="ent-h3 mt-1">{step.title}</h3>
                <p className="mt-3 text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="organization" className="ent-section ent-container">
          <SectionHead
            title="Hydrilla across your organization"
            lede="Each part of Enterprise is shaped around how your studio works rather than a fixed tier."
          />
          <ul className="grid md:grid-cols-2 md:gap-x-10 lg:grid-cols-3">
            {ORGANIZATION.map((item) => (
              <li key={item.title} className="ent-reveal border-b border-black/10 py-8 md:py-10">
                <h3 className="ent-h3">{item.title}</h3>
                <p className="mt-3 text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">{item.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <a href={DEMO_URL} className="pickle-pill-solid">
              Book a demo
            </a>
          </div>
        </section>

        <section id="platform" className="ent-section ent-container">
          <SectionHead
            title="Two ways to use Hydrilla: the workspace and the API"
            lede="Use either one, or both. Artists work in Studio and their own tools, while engineers run the same generation from your backend."
          />
          <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-2 md:gap-6">
            <div className="ent-reveal">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-black">
                <EnterpriseVideo
                  src={WHY_HYDRILLA_MEDIA.multi.video}
                  poster={WHY_HYDRILLA_MEDIA.multi.poster}
                  label="A fantasy scene with a dragon, a pegasus, and a stone lion over an ancient city"
                />
              </div>
              <h3 className="ent-h3 mt-6">Workspace</h3>
              <p className="mt-2 text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">
                For artists and art teams, in the browser and inside their tools.
              </p>
              <DetailList
                items={[
                  "Text to 3D and image to 3D with BlueFox",
                  "Water Agent, at no credit cost",
                  "Review in the browser: orbit, select parts, check materials",
                  "Plugins for Blender, Unity, Unreal, and Godot",
                ]}
              />
              <Link href="/features" className="ent-link mt-5 inline-block text-[16px]">
                See the features
              </Link>
            </div>
            <div className="ent-reveal">
              <div className="aspect-[16/10] overflow-auto rounded-[20px] bg-black p-5 md:p-7">
                <pre className="text-[12px] leading-[1.7] text-white/85 md:text-[13px]">
                  <code>{API_REQUEST}</code>
                </pre>
              </div>
              <h3 className="ent-h3 mt-6">API</h3>
              <p className="mt-2 text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">
                For pipeline engineers building generation into your own systems.
              </p>
              <DetailList
                items={[
                  "REST API with keys you keep server-side",
                  "Submit a job, then poll its status",
                  "A mesh in parts, with UVs and texture maps",
                  "Concurrency sized to your volume on Enterprise",
                ]}
              />
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[16px]">
                <Link href="/api" className="ent-link">
                  Explore the API
                </Link>
                <Link href="/integrations/mcp" className="ent-link">
                  MCP server for AI agents
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="teams" className="ent-section ent-container">
          <SectionHead
            title="How studio teams use Hydrilla"
            lede="Five ways teams put BlueFox to work, each with its fit, limits, and tools."
          />
          <ul className="mt-10 grid gap-x-6 gap-y-10 md:mt-14 md:grid-cols-6">
            {TEAMS.map((team) => (
              <li key={team.href} className={`ent-reveal ${team.span}`}>
                <Link href={team.href} className="group block">
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-[20px] bg-[#f5f5f7]">
                    <Image
                      src={cloudinaryImage(`hydrilla-landing/industrypower/${team.image}`)}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </span>
                  <span className="ent-h3 mt-5 block">{team.title}</span>
                  <span className="mt-2 block text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">{team.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="compare" className="ent-section ent-container">
          <SectionHead
            title="How Enterprise differs from Pro"
            lede="Pro is built for individuals and small teams who buy online. Enterprise is for studios that need an agreement around their volume and their tools."
          />
          <div className="ent-reveal overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[16px] leading-[1.45] tracking-[-0.01em]">
              <thead>
                <tr className="border-b border-black/15">
                  <td className="py-5 pr-6" />
                  <th scope="col" className="py-5 pr-6 font-[510]">Pro</th>
                  <th scope="col" className="py-5 font-[510]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ row, pro, enterprise }) => (
                  <tr key={row} className="border-b border-black/10">
                    <th scope="row" className="w-[26%] py-5 pr-6 font-[510]">{row}</th>
                    <td className="w-[37%] py-5 pr-6 text-black/70">{pro}</td>
                    <td className="py-5 text-black/70">{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="security" className="ent-section bg-[#f5f5f7] py-[clamp(72px,9vw,128px)]">
          <div className="ent-container">
            <SectionHead
              title="Security, data, and IP"
              lede={
                <>
                  Work made in a 3D workspace is often unreleased. The{" "}
                  <Link href="/security" className="ent-link">security page</Link> sets out how it&apos;s handled; the{" "}
                  <Link href="/privacy" className="ent-link">Privacy Policy</Link> and{" "}
                  <Link href="/terms" className="ent-link">Terms</Link> are the binding documents.
                </>
              }
            />
            <ul className="mt-10 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-10">
              <li className="ent-reveal">
                <h3 className="ent-h3">Your data doesn&apos;t train our models</h3>
                <p className="mt-3 text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">
                  That holds on every plan, including your prompts, the reference images you upload, and the models you generate.
                </p>
              </li>
              <li className="ent-reveal">
                <h3 className="ent-h3">You own your output</h3>
                <p className="mt-3 text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">
                  As between you and Hydrilla AI, and to the extent the law allows, you own what the service generates for you and may use it commercially.{" "}
                  <Link href="/terms#ownership" className="ent-link">Read the exact wording</Link>.
                </p>
              </li>
              <li className="ent-reveal">
                <h3 className="ent-h3">Your work stays scoped to you</h3>
                <p className="mt-3 text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">
                  Sign-in runs through Clerk, generated meshes stay scoped to your workspace, and files sent over the local Bridge travel on your machine to the tool you have open.
                </p>
              </li>
            </ul>
            <p className="ent-reveal mt-12 border-t border-black/15 pt-6 text-[16px] leading-[1.5] tracking-[-0.01em] text-black/70">
              Running a vendor review? Send your questionnaire to{" "}
              <a href="mailto:founders@hydrilla.ai" className="ent-link">founders@hydrilla.ai</a>, naming your studio and when you need answers. We answer in writing with what we can confirm.
            </p>
          </div>
        </section>

        <section id="faq" className="ent-section ent-container pb-[clamp(88px,11vw,160px)]">
          <div className="grid gap-10 md:grid-cols-12">
            <h2 className="ent-h2 ent-reveal md:col-span-4">Enterprise questions, answered</h2>
            <div className="border-t border-black/15 md:col-span-8">
              {ENTERPRISE_FAQ.map((item, i) => (
                <details key={item.q} open={i === 0} className="group border-b border-black/15">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="ent-h3">{item.q}</h3>
                    <Plus className="mt-1 h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden />
                  </summary>
                  <p className="max-w-[62ch] pb-7 text-[16px] leading-[1.55] tracking-[-0.01em] text-black/70">
                    {withLinks(item.a)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-[120px] bg-[#f5f5f7] pb-[clamp(88px,11vw,160px)]">
          <EnterpriseGlassMark />
          <div className="ent-container text-center">
            <h2 className="ent-h2 text-balance">Get Hydrilla Enterprise</h2>
            <p className="mx-auto mt-6 max-w-[60ch] text-[clamp(1.0625rem,1rem+0.3vw,1.25rem)] leading-[1.45] tracking-[-0.015em] text-black/65">
              Tell us your studio size, engine, and expected monthly volume, and whether you already generate on Pro. The more we know about your pipeline, the more useful the first conversation will be.
            </p>
            <div className="mt-8 flex justify-center">
              <a href={DEMO_URL} className="pickle-pill-solid">
                Book a demo
              </a>
            </div>
            <div className="mx-auto mt-16 max-w-[760px] border-t border-black/10 pt-12">
              <EnterpriseContactForm />
            </div>
          </div>
        </section>
      </article>
      <Footer />
    </>
  );
}
