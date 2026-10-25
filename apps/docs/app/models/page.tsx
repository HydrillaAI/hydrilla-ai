import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { H2 } from "@/components/Heading";
import { CardGrid, NextStepCard } from "@/components/Card";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Callout } from "@/components/Callout";
import { Box, Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Models & Engines",
  description:
    "Hydrilla AI orchestrates specialized neural architectures across 3D reconstruction and 2D concept rendering.",
  alternates: { canonical: "https://docs.hydrilla.ai/models" },
};

const MODELS_3D = [
  { id: "bluefox-1 (1024)", resolution: "1024 voxels", speed: "~25–35s", cost: "2 credits", useCase: "Rapid prototyping, low-poly game props, mobile games" },
  { id: "bluefox-1 (1536)", resolution: "1536 voxels", speed: "~45–60s", cost: "4 credits", useCase: "High-fidelity hero assets, film, Unreal Engine 5 production" },
];

// CONTENT-FLAG: third-party vendor and model names (OpenAI, Google, GPT Image, Gemini) in the 2D models table.
const MODELS_2D = [
  { id: "gpt-image-2.5-flare", provider: "OpenAI", cost: "1 credit", highlights: "Ultra-fast, stylized concept art, vivid lighting, ideal for rapid iterations" },
  { id: "gpt-image-2.5-sunburst", provider: "OpenAI", cost: "1 credit", highlights: "Studio lighting, orthographic views, crisp texture details" },
  { id: "gemini-3.1-flash-image", provider: "Google", cost: "1 credit", highlights: "Fastest turnaround time (<3s), exceptional multi-angle consistency" },
  { id: "gemini-3-pro-image", provider: "Google", cost: "1 credit", highlights: "Complex scene comprehension, multi-part engineering equipment renders" },
];

export default function ModelsPage() {
  return (
    <div className="prose">
      <PageHeader
        pathname="/models"
        heading="Models & Engines"
        summary="Hydrilla AI orchestrates specialized neural architectures across 3D reconstruction and 2D concept rendering."
      />

      <H2 id="3d-reconstruction-models">3D reconstruction models</H2>
      {/* CONTENT-FLAG: credit costs disagree — Text to 3D lists 3/5 credits while this table lists 2/4; "BlueFox 3D" vs "BlueFox 1" naming. */}
      <div className="mt-3 overflow-hidden rounded border border-line">
        <table className="params-table">
          <thead>
            <tr>
              <th>Model ID</th>
              <th>Cascade Resolution</th>
              <th>Speed</th>
              <th>Cost</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            {MODELS_3D.map((model) => (
              <tr key={model.id}>
                <td className="param-name">{model.id}</td>
                <td className="mono text-code">{model.resolution}</td>
                <td className="mono text-code">{model.speed}</td>
                <td className="font-semibold text-success">{model.cost}</td>
                <td>{model.useCase}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 pb-2 md:hidden">
          {MODELS_3D.map((model) => (
            <div key={model.id} className="param-card">
              <div className="param-name">{model.id}</div>
              <div className="mt-1 text-small text-ink-2">Resolution: {model.resolution}</div>
              <div className="text-small text-ink-2">Speed: {model.speed}</div>
              <div className="text-small text-ink-2">Cost: {model.cost}</div>
              <div className="mt-1 text-small text-ink-3">{model.useCase}</div>
            </div>
          ))}
        </div>
      </div>

      <H2 id="2d-image-models">2D concept and image editing models</H2>
      <div className="mt-3 overflow-hidden rounded border border-line">
        <table className="params-table">
          <thead>
            <tr>
              <th>Model ID</th>
              <th>Provider</th>
              <th>Cost</th>
              <th>Highlights</th>
            </tr>
          </thead>
          <tbody>
            {MODELS_2D.map((model) => (
              <tr key={model.id}>
                <td className="param-name">{model.id}</td>
                <td>{model.provider}</td>
                <td className="font-semibold text-success">{model.cost}</td>
                <td>{model.highlights}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 pb-2 md:hidden">
          {MODELS_2D.map((model) => (
            <div key={model.id} className="param-card">
              <div className="param-name">{model.id}</div>
              <div className="mt-1 text-small text-ink-2">Provider: {model.provider}</div>
              <div className="text-small text-ink-2">Cost: {model.cost}</div>
              <div className="mt-1 text-small text-ink-3">{model.highlights}</div>
            </div>
          ))}
        </div>
      </div>

      <Callout variant="note" title="Live model list">
        <p>
          Fetch the current list programmatically from <a href="/api/models-list">List Models</a>.
        </p>
      </Callout>

      <CardGrid>
        <NextStepCard href="/api/image-to-3d" icon={Box} title="Image to 3D" description="Reconstruct a mesh from a single concept image." />
        <NextStepCard href="/api/images-generate" icon={Sparkles} title="Generate Concept Image" description="Render 2D concept art and orthographic references." />
        <NextStepCard href="/quickstart" icon={ArrowRight} title="Quickstart" description="Run your first generation in three steps." />
      </CardGrid>

      <FeedbackWidget />
    </div>
  );
}
