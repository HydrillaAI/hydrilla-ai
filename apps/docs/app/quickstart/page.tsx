import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Steps, Step } from "@/components/Steps";
import { CodeBlock } from "@/components/CodeBlock";
import { CardGrid, NextStepCard } from "@/components/Card";
import { Callout } from "@/components/Callout";
import { H2 } from "@/components/Heading";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Boxes, KeyRound, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Quickstart",
  description:
    "Get up and running with the Hydrilla AI API in 3 simple steps: authenticate, submit a 3D reconstruction task, and poll for the downloadable GLB mesh.",
  alternates: { canonical: "https://docs.hydrilla.ai/quickstart" },
};

const curlStep2 = `curl -X POST https://hydrilla-ai-g1bm.vercel.app/v1/3d/text-to-3d \\
  -H "Authorization: Bearer hyd_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Futuristic cyberpunk vehicle, high details, game ready prop",
    "image_model": {
      "provider": "openai",
      "quality": "high"
    },
    "resolution": 1536
  }'`;

const curlStep3 = `curl -X GET https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_c18ab44d03e192a40 \\
  -H "Authorization: Bearer hyd_live_your_api_key_here"`;

const pythonQuickstart = `import requests
import time

API_KEY = "hyd_live_your_api_key_here"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 1. Trigger Text-to-3D
res = requests.post("https://hydrilla-ai-g1bm.vercel.app/v1/3d/text-to-3d", headers=HEADERS, json={
    "prompt": "Futuristic cyberpunk vehicle, high details, game ready prop",
    "resolution": 1536
})
task_id = res.json()["id"]
print(f"Task submitted: {task_id}")

# 2. Poll until complete
while True:
    task = requests.get(f"https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/{task_id}", headers=HEADERS).json()
    status = task.get("status")
    print(f"Status: {status} ({task.get('progress', 0)}%)")
    
    if status == "completed":
        glb_url = task["result"]["mesh_url"]
        print(f"3D Model Ready! Download at: {glb_url}")
        break
    elif status == "failed":
        print("Failed:", task.get("error"))
        break
        
    time.sleep(3)`;

export default async function QuickstartPage() {
  return (
    <div className="prose">
      <PageHeader
        pathname="/quickstart"
        heading="Quickstart Guide"
        summary="Get up and running with the Hydrilla AI API in 3 simple steps: authenticate, submit a 3D reconstruction task, and poll for the downloadable GLB mesh."
      />

      <Callout variant="tip" title="Before you start">
        <p>
          You need an API key that starts with <code>hyd_live_</code>. Create one in the{" "}
          <Link href="/authentication">Authentication</Link> guide if you don&apos;t have one yet.
        </p>
      </Callout>

      <Steps>
        <Step number={1} id="step-1" title="Create your API key">
          <p>
            API requests require a key that starts with <code>hyd_live_</code>.
          </p>
          <ol>
            <li>
              Log in to the{" "}
              <a href="https://hydrilla.co/app/studio" target="_blank" rel="noreferrer">
                Hydrilla Studio
              </a>
              .
            </li>
            <li>
              Open{" "}
              <a href="https://hydrilla.co/app/api-keys" target="_blank" rel="noreferrer">
                API Keys
              </a>{" "}
              in your dashboard sidebar.
            </li>
            <li>
              Click <strong>Create Secret Key</strong>, give it a name (for example,{" "}
              <em>Production-Backend</em>), and copy the revealed API key.
            </li>
          </ol>
        </Step>

        <Step number={2} id="step-2" title="Trigger 3D reconstruction">
          <p>
            Submit a prompt to the <code>POST /v1/3d/text-to-3d</code> endpoint. Hydrilla compiles
            the prompt, renders concept views, and dispatches the job to the BlueFox GPU cluster.
          </p>
          <CodeBlock code={curlStep2} lang="bash" filename="request.sh" />
          <p className="text-small text-ink-3">The endpoint returns an asynchronous task ID:</p>
          <CodeBlock
            code={`{
  "id": "job_c18ab44d03e192a40",
  "status": "queued",
  "resolution": 1536,
  "links": {
    "poll": "https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_c18ab44d03e192a40"
  }
}`}
            lang="json"
            filename="200_SUCCESS.json"
          />
        </Step>

        <Step number={3} id="step-3" title="Poll for completion and download the mesh" last>
          <p>
            Poll <code>GET /v1/3d/tasks/:taskId</code> every 2–3 seconds until the status reaches{" "}
            <code>completed</code>.
          </p>
          {/* CONTENT-FLAG: third-party storage hostnames (storage.googleapis.com) in example URLs. */}
          <CodeBlock code={curlStep3} lang="bash" filename="request.sh" />
          <CodeBlock
            code={`{
  "id": "job_c18ab44d03e192a40",
  "status": "completed",
  "progress": 100,
  "result": {
    "mesh_url": "https://storage.googleapis.com/hydrilla-meshes/job_c18ab.glb",
    "preview_image_url": "https://storage.googleapis.com/hydrilla-meshes/job_c18ab_thumb.png",
    "format": "glb",
    "triangles": 128450
  }
}`}
            lang="json"
            filename="200_SUCCESS.json"
          />
        </Step>
      </Steps>

      <H2 id="complete-python-example">Complete Python example</H2>
      <p>Run this self-contained script to test end-to-end 3D generation:</p>
      <CodeBlock code={pythonQuickstart} lang="python" filename="quickstart.py" showLines />

      <H2 id="next-steps">Next steps</H2>
      <CardGrid>
        <NextStepCard
          href="/authentication"
          icon={KeyRound}
          title="Authentication"
          description="Key lifecycle, the Bearer header, and error codes."
        />
        <NextStepCard
          href="/api/text-to-3d"
          icon={Boxes}
          title="Text to 3D"
          description="Full parameter reference for prompt-to-mesh generation."
        />
        <NextStepCard
          href="/models"
          icon={ShieldCheck}
          title="Models & Engines"
          description="Compare models, speeds, and credit costs."
        />
      </CardGrid>

      <FeedbackWidget />
    </div>
  );
}
