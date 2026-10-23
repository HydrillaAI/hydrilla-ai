import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { H2 } from "@/components/Heading";
import { CodeBlock } from "@/components/CodeBlock";
import { CardGrid, NextStepCard } from "@/components/Card";
import { Callout } from "@/components/Callout";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { FileCode2, ListChecks } from "lucide-react";

export const metadata = {
  title: "Python SDK Guide",
  description:
    "Easily integrate Hydrilla 3D and 2D generation into your Python scripts, Blender add-ons, or backend services.",
  alternates: { canonical: "https://docs.hydrilla.ai/sdks/python" },
};

const installCmd = `pip install requests`;

const clientCode = `import requests
import time
from typing import Optional, Dict, Any

class Hydrilla:
    def __init__(self, api_key: str, base_url: str = "https://api.hydrilla.co"):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def text_to_3d(self, prompt: str, resolution: int = 1536, image_model: Optional[Dict[str, str]] = None) -> str:
        """Trigger Text-to-3D generation and return the task ID."""
        payload = {"prompt": prompt, "resolution": resolution}
        if image_model:
            payload["image_model"] = image_model
            
        res = requests.post(f"{self.base_url}/v1/3d/text-to-3d", headers=self.headers, json=payload)
        res.raise_for_status()
        return res.json()["id"]

    def image_to_3d(self, image_url: str, resolution: int = 1536) -> str:
        """Trigger Image-to-3D generation and return the task ID."""
        payload = {"image_url": image_url, "resolution": resolution}
        res = requests.post(f"{self.base_url}/v1/3d/image-to-3d", headers=self.headers, json=payload)
        res.raise_for_status()
        return res.json()["id"]

    def poll_task(self, task_id: str, poll_interval: int = 3, timeout: int = 180) -> Dict[str, Any]:
        """Poll task until completed or failed."""
        start = time.time()
        while time.time() - start < timeout:
            res = requests.get(f"{self.base_url}/v1/3d/tasks/{task_id}", headers=self.headers)
            res.raise_for_status()
            data = res.json()
            status = data.get("status")
            
            if status == "completed":
                return data["result"]
            elif status == "failed":
                raise RuntimeError(f"Hydrilla Task Failed: {data.get('error')}")
                
            time.sleep(poll_interval)
            
        raise TimeoutError(f"Task {task_id} timed out after {timeout} seconds.")`;

const usageCode = `from hydrilla import Hydrilla

client = Hydrilla(api_key="hyd_live_your_api_key_here")

# 1. Generate 3D directly from prompt
task_id = client.text_to_3d(
    prompt="Cyberpunk drone quadcopter, carbon fiber frame, glowing blue LED",
    resolution=1536
)
print(f"Queued 3D task: {task_id}")

# 2. Wait for GLB export
result = client.poll_task(task_id)
print(f"Success! Download GLB mesh: {result['mesh_url']}")`;

export default async function PythonSdkPage() {
  return (
    <div className="prose">
      <PageHeader
        pathname="/sdks/python"
        heading="Python Integration Guide"
        summary="Easily integrate Hydrilla 3D and 2D generation into your Python scripts, Blender add-ons, or backend services."
      />

      <H2 id="installation">Installation</H2>
      <CodeBlock code={installCmd} lang="bash" filename="terminal" />

      <H2 id="python-client-implementation">Python client implementation</H2>
      <p>
        Save this lightweight wrapper as <code>hydrilla.py</code>:
      </p>
      <CodeBlock code={clientCode} lang="python" filename="hydrilla.py" showLines />

      <H2 id="example-usage">Example usage</H2>
      <CodeBlock code={usageCode} lang="python" filename="generate.py" showLines />

      <Callout variant="tip" title="Pair it with polling">
        <p>
          <code>poll_task</code> reuses the <code>GET /v1/3d/tasks/:taskId</code> endpoint. See{" "}
          <a href="/api/tasks">Tasks &amp; Polling</a> for status values and the result shape.
        </p>
      </Callout>

      <CardGrid>
        <NextStepCard href="/sdks/typescript" icon={FileCode2} title="TypeScript SDK Guide" description="The same client, typed for Node.js and the browser." />
        <NextStepCard href="/api/tasks" icon={ListChecks} title="Tasks & Polling" description="Poll progress and download completed meshes." />
      </CardGrid>

      <FeedbackWidget />
    </div>
  );
}
