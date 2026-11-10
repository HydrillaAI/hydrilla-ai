import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { H2 } from "@/components/Heading";
import { CodeBlock } from "@/components/CodeBlock";
import { CardGrid, NextStepCard } from "@/components/Card";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { FileCode2, Rocket } from "lucide-react";

export const metadata = {
  title: "TypeScript SDK Guide",
  description:
    "Full TypeScript definitions and helper client for Next.js, Node.js, Bun, or Cloudflare Workers.",
  alternates: { canonical: "https://docs.hydrilla.ai/sdks/typescript" },
};

const clientCode = `export interface HydrillaConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TaskResult {
  mesh_url: string;
  preview_image_url: string;
  format: string;
  triangles: number;
}

export interface TaskStatusResponse {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  result?: TaskResult;
  error?: string;
}

export class Hydrilla {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: HydrillaConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://hydrilla-ai-g1bm.vercel.app").replace(/\\/+$/, "");
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(\`\${this.baseUrl}\${path}\`, {
      ...options,
      headers: {
        "Authorization": \`Bearer \${this.apiKey}\`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || \`Hydrilla API Error: \${res.status}\`);
    }

    return res.json() as Promise<T>;
  }

  async textTo3d(prompt: string, resolution: 1024 | 1536 = 1536): Promise<{ id: string }> {
    return this.request<{ id: string }>("/v1/3d/text-to-3d", {
      method: "POST",
      body: JSON.stringify({ prompt, resolution })
    });
  }

  async imageTo3d(imageUrl: string, resolution: 1024 | 1536 = 1536): Promise<{ id: string }> {
    return this.request<{ id: string }>("/v1/3d/image-to-3d", {
      method: "POST",
      body: JSON.stringify({ image_url: imageUrl, resolution })
    });
  }

  async getTask(taskId: string): Promise<TaskStatusResponse> {
    return this.request<TaskStatusResponse>(\`/v1/3d/tasks/\${taskId}\`);
  }

  async pollUntilReady(taskId: string, intervalMs = 3000, maxAttempts = 60): Promise<TaskResult> {
    const checkAttempt = async (attempt: number): Promise<TaskResult> => {
      if (attempt >= maxAttempts) {
        throw new Error(\`Polling timed out after \${maxAttempts} attempts.\`);
      }

      const task = await this.getTask(taskId);
      if (task.status === "completed" && task.result) {
        return task.result;
      }
      if (task.status === "failed") {
        throw new Error(task.error || "3D generation failed");
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      return checkAttempt(attempt + 1);
    };

    return checkAttempt(0);
  }
}`;

const usageCode = `import { Hydrilla } from "./hydrilla";

const client = new Hydrilla({
  apiKey: process.env.HYDRILLA_API_KEY!
});

async function main() {
  // 1. Submit text prompt
  const { id } = await client.textTo3d(
    "Futuristic cyberpunk street lamp, neon fixtures, game asset",
    1536
  );
  console.log("Task submitted:", id);

  // 2. Poll until mesh is generated
  const result = await client.pollUntilReady(id);
  console.log("GLB Mesh Ready:", result.mesh_url);
}

main().catch(console.error);`;

export default async function TypeScriptSdkPage() {
  return (
    <div className="prose">
      <PageHeader
        pathname="/sdks/typescript"
        heading="TypeScript Integration Guide"
        summary="Full TypeScript definitions and helper client for Next.js, Node.js, Bun, or Cloudflare Workers."
      />

      <H2 id="typescript-client-implementation">TypeScript client implementation</H2>
      <p>
        Save this as <code>hydrilla.ts</code>:
      </p>
      <CodeBlock code={clientCode} lang="typescript" filename="hydrilla.ts" showLines />

      <H2 id="example-usage">Example usage</H2>
      <CodeBlock code={usageCode} lang="typescript" filename="generate.ts" showLines />

      <CardGrid>
        <NextStepCard href="/sdks/python" icon={FileCode2} title="Python SDK Guide" description="The same client, written for Python services and scripts." />
        <NextStepCard href="/quickstart" icon={Rocket} title="Quickstart" description="Run your first generation in three steps." />
      </CardGrid>

      <FeedbackWidget />
    </div>
  );
}
