"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

import { EnterpriseVideo } from "@/components/enterprise/EnterpriseVideo";
import { DEMO_URL } from "@/lib/brand";
import {
  cloudinaryLoader,
  featureImage,
  WHY_HYDRILLA_MEDIA,
  WORKFLOW_DEMO,
} from "@/lib/cloudinary";

type TabId = "team" | "agent" | "plugins" | "api";

const TABS: {
  id: TabId;
  label: string;
  windowUrl: string;
  title: string;
  body: string;
  points: readonly string[];
}[] = [
  {
    id: "team",
    label: "Create as one team",
    windowUrl: "hydrilla.ai/app/studio",
    title: "One shared workspace across art, lookdev, and technical art",
    body: "Keep prompts, reference boards, segmented 3D parts, and approved versions in one studio workspace instead of scattered folders and individual accounts.",
    points: [
      "Orbit meshes, isolate individual sub-parts, and inspect PBR maps in the browser",
      "Shared project folders and pooled monthly studio credits across departments",
      "Consistent BlueFox geometry with unwrapped UVs and 4-channel PBR textures",
    ],
  },
  {
    id: "agent",
    label: "Direct with Water Agent",
    windowUrl: "hydrilla.ai/app/water",
    title: "Brief complete 3D prop sets and environments in one conversation",
    body: "Water Agent works like an art-directable 3D teammate. Describe the scene once, review the planned asset list before generation starts, and revise individual pieces at zero credit cost.",
    points: [
      "Approves the asset list and visual direction before spending generation credits",
      "Revises single props without regenerating the rest of the collection",
      "Included at zero credit cost inside Studio and every connected 3D plugin",
    ],
  },
  {
    id: "plugins",
    label: "Connect your 3D stack",
    windowUrl: "127.0.0.1:7345 · Local Bridge",
    title: "Native plugins inside Blender, Maya, 3ds Max, Unity, Unreal, and Godot 4",
    body: "Artists generate from text or images directly inside their open viewport, or send approved meshes from Studio straight into their active scene over the local Bridge.",
    points: [
      "Native panels for Blender, Maya, 3ds Max, Unity, Unreal Engine, and Godot 4",
      "Local machine Bridge transfer with zero manual file shuffling",
      "Hands-on pipeline onboarding from Hydrilla engineers",
    ],
  },
  {
    id: "api",
    label: "Automate via API & MCP",
    windowUrl: "api.hydrilla.co/v1/3d · hydrilla-mcp",
    title: "High-concurrency REST API and local MCP server for AI agents",
    body: "Wire BlueFox into internal asset libraries, build pipelines, or AI coding agents like Cursor and Claude Code with concurrency and queue priority sized to your studio.",
    points: [
      "Async text-to-3D and image-to-3D jobs with server-side API keys",
      "Local stdio MCP server (`npx -y hydrilla-mcp@latest`) for coding agents",
      "Dedicated studio concurrency and priority queue throughput",
    ],
  },
];

export function EnterprisePipelineShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("team");
  const current = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div className="ent-reveal mt-8 md:mt-10">
      {/* Higgsfield-style Clean Segmented Tab Bar */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Enterprise workflow controls"
          className="inline-flex max-w-full flex-wrap justify-center gap-1.5 rounded-2xl border border-black/8 bg-[#f5f5f7] p-1.5"
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
                className={`min-h-10 cursor-pointer rounded-xl px-4 py-2 text-[14px] font-[510] tracking-[-0.01em] transition-all duration-200 ${
                  selected
                    ? "bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-black/62 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Studio Window Frame */}
      <div
        role="tabpanel"
        id={`ent-panel-${current.id}`}
        aria-labelledby={`ent-tab-${current.id}`}
        className="mt-7 overflow-hidden rounded-[28px] border border-black/10 bg-[#f5f5f7] p-3 sm:p-5"
      >
        <div className="overflow-hidden rounded-[20px] border border-black/8 bg-white">
          {/* Window Chrome Header */}
          <div className="flex items-center justify-between border-b border-black/8 bg-[#fafafa] px-4 py-3">
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
            </div>
            <span className="rounded-md border border-black/6 bg-white px-3 py-0.5 text-[12px] font-[500] text-black/55">
              {current.windowUrl}
            </span>
            <span className="text-[12px] font-[510] text-black/45">Enterprise Studio</span>
          </div>

          {/* Content Grid */}
          <div className="grid items-center lg:grid-cols-12">
            <div className="border-b border-black/8 bg-black lg:col-span-7 lg:border-r lg:border-b-0">
              {activeTab === "team" ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <EnterpriseVideo
                    src={WORKFLOW_DEMO.mp4}
                    poster={WORKFLOW_DEMO.poster}
                    label="Hydrilla Enterprise shared Studio workspace walkthrough"
                  />
                </div>
              ) : null}

              {activeTab === "agent" ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <EnterpriseVideo
                    src={WHY_HYDRILLA_MEDIA.assets.video}
                    poster={WHY_HYDRILLA_MEDIA.assets.poster}
                    label="Water Agent generating a multi-asset 3D set"
                  />
                </div>
              ) : null}

              {activeTab === "plugins" ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <EnterpriseVideo
                    src={WHY_HYDRILLA_MEDIA.blender.video}
                    poster={WHY_HYDRILLA_MEDIA.blender.poster}
                    label="Hydrilla plugin running inside a 3D viewport"
                  />
                </div>
              ) : null}

              {activeTab === "api" ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-white">
                  <Image
                    src={featureImage("3df4")}
                    alt="Hydrilla REST API and MCP server pipeline workflow"
                    fill
                    loader={cloudinaryLoader}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-contain p-5 sm:p-7"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
              <div>
                <h3 className="text-[clamp(1.35rem,1.15rem+0.75vw,1.8rem)] font-[510] leading-[1.15] tracking-[-0.03em] text-black">
                  {current.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.58] text-black/68">{current.body}</p>

                <ul className="mt-6 space-y-3 border-t border-black/8 pt-5">
                  {current.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-black/80">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-black/8 pt-5">
                <a href="#contact-sales" className="pickle-pill-solid">
                  Contact sales
                </a>
                <a href={DEMO_URL} className="pickle-pill-ghost">
                  Talk to our team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
