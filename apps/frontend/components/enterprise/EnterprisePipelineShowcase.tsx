"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { EnterpriseVideo } from "@/components/enterprise/EnterpriseVideo";
import {
  cloudinaryLoader,
  featureImage,
  WHY_HYDRILLA_MEDIA,
  WORKFLOW_DEMO,
} from "@/lib/cloudinary";

type TabId = "agent" | "plugins" | "workspace" | "api";

const TABS: {
  id: TabId;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
  href: string;
  cta: string;
}[] = [
  {
    id: "agent",
    label: "Water Agent",
    eyebrow: "AI 3D Agent",
    title: "Brief whole 3D sets in plain language",
    body: "Describe a scene or prop collection once. Water Agent lays out the plan first, builds every asset with BlueFox, and handles piece-by-piece revisions at zero credit cost.",
    points: [
      "Plans every piece before generation starts",
      "Works in Studio and inside connected 3D software",
      "Included at zero credit cost on every plan",
    ],
    href: "/water",
    cta: "Explore Water Agent",
  },
  {
    id: "plugins",
    label: "3D Plugins",
    eyebrow: "All-Software Bridge",
    title: "Generate directly inside your 3D tools",
    body: "Native plugins for Blender, Unity, Unreal Engine, and Godot 4 keep artists inside their open scene, synced through the local Bridge.",
    points: [
      "Generate from prompt or image inside the editor",
      "Sync reviewed assets from Studio over local Bridge",
      "Dedicated pipeline onboarding for Enterprise teams",
    ],
    href: "/integrations",
    cta: "See all plugins",
  },
  {
    id: "workspace",
    label: "Studio Workspace",
    eyebrow: "Team Collaboration",
    title: "Shared seats, part review, and pooled credits",
    body: "Art, lookdev, and pipeline teams inspect segmented geometry and PBR maps in the browser and draw from one shared studio credit pool.",
    points: [
      "Orbit meshes, isolate sub-parts, and verify lighting",
      "Shared folders and team seats in one workspace",
      "Custom monthly credit pool across departments",
    ],
    href: "/features",
    cta: "Explore Studio",
  },
  {
    id: "api",
    label: "API & MCP",
    eyebrow: "Automation & Coding Agents",
    title: "Scale generation via REST API and MCP",
    body: "Connect internal asset pipelines to the REST API with custom studio concurrency, or let AI coding agents generate through the local MCP server.",
    points: [
      "Async text-to-3D and image-to-3D REST endpoints",
      "Native MCP server for Cursor and Claude Code",
      "Concurrency and queue priority matched to volume",
    ],
    href: "/integrations/mcp",
    cta: "Explore MCP & API",
  },
];

const PLUGIN_LINKS = [
  { label: "Blender", href: "/integrations/blender" },
  { label: "Unity", href: "/integrations/unity" },
  { label: "Unreal Engine", href: "/integrations/unreal" },
  { label: "Godot 4", href: "/integrations/godot" },
] as const;

export function EnterprisePipelineShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("agent");
  const current = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div className="ent-reveal mt-10 md:mt-12">
      <div
        role="tablist"
        aria-label="Enterprise platform capabilities"
        className="flex flex-wrap gap-2"
      >
        {TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`ent-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`ent-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer rounded-full px-5 py-2.5 text-[14.5px] font-[510] tracking-[-0.01em] transition-all ${
                selected
                  ? "bg-black text-white shadow-sm"
                  : "border border-black/12 bg-[#f5f5f7] text-black/75 hover:border-black/25 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`ent-panel-${current.id}`}
        aria-labelledby={`ent-tab-${current.id}`}
        className="mt-6 grid items-center gap-6 rounded-[28px] border border-black/8 bg-[#f5f5f7] p-4 sm:p-6 lg:grid-cols-12 lg:gap-8"
      >
        {/* Left: Single Clean 16:10 Frame */}
        <div className="lg:col-span-7">
          {activeTab === "agent" ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-black">
              <EnterpriseVideo
                src={WHY_HYDRILLA_MEDIA.assets.video}
                poster={WHY_HYDRILLA_MEDIA.assets.poster}
                label="Water Agent generating a cohesive set of 3D assets"
              />
            </div>
          ) : null}

          {activeTab === "plugins" ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-black">
              <EnterpriseVideo
                src={WHY_HYDRILLA_MEDIA.blender.video}
                poster={WHY_HYDRILLA_MEDIA.blender.poster}
                label="Hydrilla Blender plugin generating a 3D scene"
              />
            </div>
          ) : null}

          {activeTab === "workspace" ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-black">
              <EnterpriseVideo
                src={WORKFLOW_DEMO.mp4}
                poster={WORKFLOW_DEMO.poster}
                label="Hydrilla Studio workspace walkthrough"
              />
            </div>
          ) : null}

          {activeTab === "api" ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] border border-black/8 bg-white">
              <Image
                src={featureImage("3df4")}
                alt="Hydrilla REST API and MCP 3D generation integration"
                fill
                loader={cloudinaryLoader}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-4 sm:p-6"
              />
            </div>
          ) : null}
        </div>

        {/* Right: Clean Copy Card */}
        <div className="flex h-full flex-col justify-between rounded-[20px] border border-black/8 bg-white p-6 sm:p-8 lg:col-span-5">
          <div>
            <p className="text-[12.5px] font-[510] uppercase tracking-[0.06em] text-black/50">
              {current.eyebrow}
            </p>
            <h3 className="mt-3 text-[clamp(1.5rem,1.2rem+0.9vw,2rem)] font-[510] leading-[1.12] tracking-[-0.03em] text-black">
              {current.title}
            </h3>
            <p className="mt-4 text-[15.5px] leading-[1.58] text-black/70">{current.body}</p>

            <ul className="mt-6 space-y-3 border-t border-black/10 pt-5">
              {current.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[14.5px] leading-[1.45] text-black/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {activeTab === "plugins" ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {PLUGIN_LINKS.map((plugin) => (
                  <Link
                    key={plugin.href}
                    href={plugin.href}
                    className="rounded-full border border-black/10 bg-[#f5f5f7] px-3 py-1 text-[13px] font-[510] text-black/80 transition-colors hover:border-black/25 hover:text-black"
                  >
                    {plugin.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-black/10 pt-5">
            <Link href={current.href} className="pickle-pill-solid">
              {current.cta}
            </Link>
            <a href="#contact-sales" className="pickle-pill-ghost">
              Contact sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
