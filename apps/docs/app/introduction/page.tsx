import React from "react";
import { Box, Sparkles, Layers, ShieldCheck, Cpu, Rocket, KeyRound, Shapes } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { H2 } from "@/components/Heading";
import { CardGrid, NextStepCard } from "@/components/Card";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Callout } from "@/components/Callout";

export const metadata = {
  title: "Introduction",
  description:
    "Hydrilla AI provides developers, game studios, and 3D pipelines with programmatic access to our proprietary BlueFox 3D neural reconstruction engine and multi-modal 2D concept models.",
  alternates: { canonical: "https://docs.hydrilla.ai/introduction" },
};

const FEATURES = [
  {
    icon: Box,
    title: "BlueFox 3D cascade pipeline",
    // CONTENT-FLAG: "BlueFox 3D" here vs "BlueFox 1" elsewhere — confirm the canonical product name.
    body: "Reconstruct dense 3D meshes up to 1536 resolution with watertight geometry, automated UV unwrapping, and PBR textures ready for Blender, Unreal, and Unity.",
  },
  {
    icon: Sparkles,
    title: "Multi-model 2D generation",
    // CONTENT-FLAG: third-party vendor and model names (OpenAI, Google Gemini, GPT Image, Flash, Pro Image) in prose.
    body: "Choose between OpenAI (GPT Image 2.5 Flare & Sunburst) and Google Gemini (Flash & Pro Image) for concept art generation and precise image editing.",
  },
  {
    icon: Layers,
    title: "Automated prompt-to-mesh",
    body: "Single-call Text-to-3D handles prompt expansion, multi-view concept rendering, background removal, and 3D reconstruction automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Zero-waste refund guarantee",
    body: "Credits are checked upfront, deducted atomically, and 100% refunded if an upstream model or GPU worker encounters an error.",
  },
];

export default function IntroductionPage() {
  return (
    <div className="prose">
      <PageHeader
        pathname="/introduction"
        heading="Introduction to Hydrilla AI"
        summary="Hydrilla AI provides developers, game studios, and 3D pipelines with programmatic access to our proprietary BlueFox 3D neural reconstruction engine and multi-modal 2D concept models."
      />

      <H2 id="capabilities">Capabilities</H2>
      <CardGrid>
        {FEATURES.map((feature) => (
          <div key={feature.title} className="card">
            <span className="card-icon">
              <feature.icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <p className="card-title">{feature.title}</p>
            <p className="card-desc">{feature.body}</p>
          </div>
        ))}
      </CardGrid>

      <H2 id="system-architecture">System architecture</H2>
      <p>
        The Hydrilla developer platform operates across high-availability edge API gateways and
        dedicated GCP GPU computing instances running the BlueFox runtime:
      </p>
      {/* CONTENT-FLAG: third-party vendor/model names (OpenAI, Google Gemini, Flare, Sunburst, Flash) and research model names (Trellis, Sparse Voxel Latents) in the architecture diagram. */}
      <pre className="code-plain mt-4">
        {`[Client Request] (Authorization: Bearer hyd_live_...)
  |
  v
[Hydrilla API: hydrilla-ai-g1bm.vercel.app] --- (Verify SHA-256 Key & Credits)
  |-- 2D Pipeline --> OpenAI / Google Gemini (Flare, Sunburst, Flash)
  |-- 3D Pipeline --> BlueFox 3D GPU Worker (Trellis / Sparse Voxel Latents)
        |-- Async Post-Processing --> GLB Export to Cloud Storage`}
      </pre>
      <Callout variant="note" title="Asynchronous by default">
        <p>
          Generation jobs return a task ID immediately. Poll{" "}
          <a href="/api/tasks">Tasks &amp; Polling</a> until the status is <code>SUCCEEDED</code>.
        </p>
      </Callout>

      <H2 id="next-steps">Next steps</H2>
      <CardGrid>
        <NextStepCard
          href="/quickstart"
          icon={Rocket}
          title="Quickstart"
          description="Generate your first 3D mesh in three steps."
        />
        <NextStepCard
          href="/authentication"
          icon={KeyRound}
          title="Authentication"
          description="Create and secure your API key."
        />
        <NextStepCard
          href="/models"
          icon={Shapes}
          title="Models & Engines"
          description="Compare 3D and 2D models, speeds, and credit costs."
        />
      </CardGrid>

      <FeedbackWidget />
    </div>
  );
}
