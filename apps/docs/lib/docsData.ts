export interface DocNavItem {
  id: string;
  title: string;
  href: string;
  method?: "GET" | "POST" | "DELETE";
}

export interface DocSection {
  title: string;
  items: DocNavItem[];
}

export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
  children?: ApiParam[];
}

export interface ApiEndpointSpec {
  method: "GET" | "POST" | "DELETE";
  path: string;
  title: string;
  summary: string;
  description: string;
  creditCost: string;
  creditChip: string;
  authHeader: string;
  contentType?: string;
  headers?: ApiParam[];
  bodyParams?: ApiParam[];
  queryParams?: ApiParam[];
  curlExample: string;
  pythonExample: string;
  tsExample: string;
  response200: string;
  response402?: string;
  response401: string;
  responseFailed?: string;
}

export interface PageMeta {
  slug: string;
  title: string;
  heading: string;
  summary: string;
  kind: "guide" | "endpoint";
  method?: "GET" | "POST" | "DELETE";
  path?: string;
  headings: { id: string; text: string }[];
}

export const DOC_SECTIONS: DocSection[] = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", title: "Introduction", href: "/introduction" },
      { id: "quickstart", title: "Quickstart", href: "/quickstart" },
    ],
  },
  {
    title: "Start Here",
    items: [
      { id: "authentication", title: "Authentication", href: "/authentication" },
      { id: "models", title: "Models & Engines", href: "/models" },
    ],
  },
  {
    title: "3D Generation API",
    items: [
      { id: "image-to-3d", title: "Image to 3D", href: "/api/image-to-3d", method: "POST" },
      { id: "text-to-3d", title: "Text to 3D", href: "/api/text-to-3d", method: "POST" },
      { id: "tasks", title: "Tasks & Polling", href: "/api/tasks", method: "GET" },
      { id: "tasks-list", title: "List Tasks", href: "/api/tasks-list", method: "GET" },
      { id: "tasks-cancel", title: "Cancel Task", href: "/api/tasks-cancel", method: "DELETE" },
    ],
  },
  {
    title: "2D Image API",
    items: [
      { id: "images-generate", title: "Generate Concept Image", href: "/api/images-generate", method: "POST" },
      { id: "images-edit", title: "Edit Concept Image", href: "/api/images-edit", method: "POST" },
    ],
  },
  {
    title: "Models & Account",
    items: [
      { id: "models-list", title: "List Models", href: "/api/models-list", method: "GET" },
      { id: "user-me", title: "Account & Credits", href: "/api/user-me", method: "GET" },
    ],
  },
  {
    title: "SDKs & Examples",
    items: [
      { id: "python-sdk", title: "Python SDK Guide", href: "/sdks/python" },
      { id: "typescript-sdk", title: "TypeScript SDK Guide", href: "/sdks/typescript" },
    ],
  },
];

const ENDPOINT_HEADINGS = (extra: { id: string; text: string }[] = []) => [
  { id: "overview", text: "Overview" },
  { id: "authentication", text: "Authentication" },
  { id: "base-url", text: "Base URL" },
  ...extra,
  { id: "response", text: "Response" },
  { id: "try-it", text: "Try it" },
];

// CONTENT-FLAG summary (see inline notes below):
// - Domain mismatch: code examples use api.hydrilla.co while docs/links use hydrilla.ai / hydrilla.co.
// - Third-party vendor/model names: OpenAI, Gemini, GPT Image, BlueFox.
// - Storage hostnames: storage.googleapis.com listed first, hydrilla-assets.s3.amazonaws.com second.
// - Credit-cost disagreement: Text to 3D lists 3/5 credits; the Models page table lists 2/4.
// - "BlueFox 3D" (descriptions) vs "bluefox-1" / "BlueFox 3D v1" (model list) naming.
export const API_SPECS: Record<string, ApiEndpointSpec> = {
  "image-to-3d": {
    method: "POST",
    path: "/v1/3d/image-to-3d",
    title: "Image to 3D Reconstruction",
    summary:
      "Reconstruct a production-ready 3D mesh (.glb) from a single concept image via JSON image URL or multipart file upload.",
    description:
      "Reconstruct a production-ready 3D mesh (.glb) from a single concept image. Supports either JSON image URL or multipart file upload.",
    creditCost: "2 credits (1024) / 4 credits (1536)",
    creditChip: "2 credits · 1024 / 4 credits · 1536",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    contentType: "application/json or multipart/form-data",
    bodyParams: [
      {
        name: "image_url",
        type: "string",
        required: false,
        description:
          "Public HTTPS URL of the reference concept image (optional if uploading a file via multipart).",
      },
      {
        name: "image",
        type: "file",
        required: false,
        description: "Direct binary upload of PNG, JPEG, or WebP image via multipart/form-data.",
      },
      {
        name: "resolution",
        type: "number",
        required: false,
        default: "1536",
        description: "Cascade mesh resolution: 1024 (fast draft) or 1536 (ultra high resolution).",
      },
      {
        name: "webhook_url",
        type: "string",
        required: false,
        description: "Optional HTTPS webhook endpoint to notify when reconstruction finishes.",
      },
    ],
    curlExample: `curl -X POST https://hydrilla-ai-g1bm.vercel.app/v1/3d/image-to-3d \\
  -H "Authorization: Bearer hyd_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://storage.googleapis.com/assets/concept-drone.png",
    "resolution": 1536
  }'`,
    pythonExample: `import requests

url = "https://hydrilla-ai-g1bm.vercel.app/v1/3d/image-to-3d"
headers = {
    "Authorization": "Bearer hyd_live_your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "image_url": "https://storage.googleapis.com/assets/concept-drone.png",
    "resolution": 1536
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print("Task queued:", data["id"])`,
    tsExample: `const response = await fetch("https://hydrilla-ai-g1bm.vercel.app/v1/3d/image-to-3d", {
  method: "POST",
  headers: {
    "Authorization": "Bearer hyd_live_your_api_key_here",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    image_url: "https://storage.googleapis.com/assets/concept-drone.png",
    resolution: 1536
  })
});

const data = await response.json();
console.log("Task ID:", data.id);`,
    response200: `{
  "id": "job_9b1deb4d3b7d4e8b82",
  "status": "queued",
  "resolution": 1536,
  "created_at": "2026-09-30T10:00:00.000Z",
  "eta_seconds": 45,
  "links": {
    "poll": "https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_9b1deb4d3b7d4e8b82"
  }
}`,
    response401: `{
  "error": "Unauthorized",
  "message": "Invalid or revoked API key."
}`,
    response402: `{
  "error": "Insufficient credits",
  "credits_required": 2,
  "credits_available": 0,
  "upgrade_url": "https://hydrilla.co/app/settings"
}`,
  },
  "text-to-3d": {
    method: "POST",
    path: "/v1/3d/text-to-3d",
    title: "Text to 3D Generation",
    summary:
      "Run the end-to-end pipeline: optimize a text prompt, render a multi-view concept image, and reconstruct a 3D mesh.",
    // CONTENT-FLAG: third-party vendor/model names (OpenAI, Gemini, BlueFox 3D).
    description:
      "Automated end-to-end pipeline: optimizes your text prompt, generates a multi-view 2D concept render via OpenAI or Gemini, and reconstructs into a 3D mesh via BlueFox 3D.",
    // CONTENT-FLAG: 3 (1024) / 5 (1536) credits disagrees with the Models page table (2 / 4 credits).
    creditCost: "3 credits (1024) / 5 credits (1536)",
    creditChip: "3 credits · 1024 / 5 credits · 1536",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    contentType: "application/json",
    bodyParams: [
      {
        name: "prompt",
        type: "string",
        required: true,
        description:
          "Text description of the 3D model (e.g. 'A futuristic cyberpunk cybernetic samurai helmet, matte titanium, emissive neon cyan visor').",
      },
      {
        name: "image_model",
        type: "object",
        required: false,
        description:
          "Optional provider settings: { provider: 'openai' | 'gemini', quality: 'standard' | 'high', aspect: '1:1' }",
        children: [
          {
            name: "provider",
            type: "string",
            required: false,
            default: "openai",
            description: "Concept render provider: openai or gemini.",
          },
          {
            name: "quality",
            type: "string",
            required: false,
            default: "standard",
            description: "Render quality: standard or high.",
          },
          {
            name: "aspect",
            type: "string",
            required: false,
            default: "1:1",
            description: "Concept render aspect ratio.",
          },
        ],
      },
      {
        name: "resolution",
        type: "number",
        required: false,
        default: "1536",
        description: "Mesh cascade resolution: 1024 or 1536.",
      },
    ],
    curlExample: `curl -X POST https://hydrilla-ai-g1bm.vercel.app/v1/3d/text-to-3d \\
  -H "Authorization: Bearer hyd_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Futuristic cyberpunk vehicle, high details, game ready prop",
    "image_model": {
      "provider": "openai",
      "quality": "high"
    },
    "resolution": 1536
  }'`,
    pythonExample: `import requests

url = "https://hydrilla-ai-g1bm.vercel.app/v1/3d/text-to-3d"
headers = {
    "Authorization": "Bearer hyd_live_your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "prompt": "Futuristic cyberpunk vehicle, high details, game ready prop",
    "image_model": {
        "provider": "openai",
        "quality": "high"
    },
    "resolution": 1536
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print("Task ID:", data["id"])`,
    tsExample: `const response = await fetch("https://hydrilla-ai-g1bm.vercel.app/v1/3d/text-to-3d", {
  method: "POST",
  headers: {
    "Authorization": "Bearer hyd_live_your_api_key_here",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: "Futuristic cyberpunk vehicle, high details, game ready prop",
    image_model: {
      provider: "openai",
      quality: "high"
    },
    resolution: 1536
  })
});

const data = await response.json();
console.log("Task ID:", data.id);`,
    response200: `{
  "id": "job_c18ab44d03e192a40",
  "status": "queued",
  "prompt": "Futuristic cyberpunk vehicle, high details, game ready prop",
  "resolution": 1536,
  "concept_image_url": "https://hydrilla-assets.s3.amazonaws.com/generated/concept_c18ab.png",
  "created_at": "2026-09-30T10:00:00.000Z",
  "eta_seconds": 60,
  "links": {
    "poll": "https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_c18ab44d03e192a40"
  }
}`,
    response401: `{
  "error": "Unauthorized",
  "message": "Invalid or revoked API key."
}`,
    response402: `{
  "error": "Insufficient credits",
  "credits_required": 3,
  "credits_available": 0,
  "upgrade_url": "https://hydrilla.co/app/settings"
}`,
  },
  tasks: {
    method: "GET",
    path: "/v1/3d/tasks/:taskId",
    title: "Tasks & Polling",
    summary:
      "Poll the current progress and download URLs of an asynchronous 3D generation job.",
    description:
      "Poll the current progress and download URLs of an asynchronous 3D generation job. The status moves from PENDING to IN_PROGRESS, then ends as SUCCEEDED, FAILED or CANCELLED. Poll every 2–3 seconds; generation usually takes a few minutes. Failed and cancelled jobs refund their credits automatically.",
    creditCost: "Free (0 credits)",
    creditChip: "Free · 0 credits",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    queryParams: [
      {
        name: "taskId",
        type: "string",
        required: true,
        description: "The job identifier returned by /v1/3d/text-to-3d or /v1/3d/image-to-3d.",
      },
    ],
    curlExample: `curl -X GET https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_9b1deb4d3b7d4e8b82 \\
  -H "Authorization: Bearer hyd_live_your_api_key_here"`,
    pythonExample: `import requests
import time

taskId = "job_9b1deb4d3b7d4e8b82"
headers = {"Authorization": "Bearer hyd_live_your_api_key_here"}

while True:
    res = requests.get(f"https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/{taskId}", headers=headers).json()
    status = res.get("status")
    print(f"Status: {status} ({res.get('progress', 0)}%)")
    if status == "SUCCEEDED":
        print("Download GLB:", res["result"]["mesh_url"])
        break
    elif status in ("FAILED", "CANCELLED"):
        print("Job failed:", res.get("error"))
        break
    time.sleep(3)`,
    tsExample: `const taskId = "job_9b1deb4d3b7d4e8b82";
const headers = { "Authorization": "Bearer hyd_live_your_api_key_here" };

const pollTask = async () => {
  const res = await fetch(\`https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/\${taskId}\`, { headers });
  const data = await res.json();
  if (data.status === "SUCCEEDED") {
    console.log("3D Mesh ready:", data.result.mesh_url);
    return data.result;
  }
  if (data.status === "FAILED" || data.status === "CANCELLED") {
    throw new Error(data.error);
  }
  await new Promise((r) => setTimeout(r, 3000));
  return pollTask();
};`,
    response200: `{
  "id": "job_9b1deb4d3b7d4e8b82",
  "object": "task",
  "type": "text-to-3d",
  "status": "SUCCEEDED",
  "progress": 100,
  "status_message": null,
  "model": "bluefox-1",
  "result": {
    "mesh_url": "https://storage.googleapis.com/hydrilla-meshes/job_9b1deb4d3b7d4e8b82.glb",
    "preview_image_url": "https://storage.googleapis.com/hydrilla-meshes/job_9b1deb4d3b7d4e8b82_thumb.png",
    "format": "glb",
    "model": "bluefox-1"
  },
  "error": null,
  "created_at": 1790762400,
  "updated_at": 1790762442
}`,
    response401: `{
  "error": "Unauthorized",
  "message": "Invalid or revoked API key."
}`,
    responseFailed: `{
  "id": "job_9b1deb4d3b7d4e8b82",
  "object": "task",
  "status": "FAILED",
  "progress": 0,
  "result": null,
  "error": "GPU worker error during reconstruction. Credits refunded."
}`,
  },
  "tasks-list": {
    method: "GET",
    path: "/v1/3d/tasks",
    title: "List Tasks",
    summary: "List your recent 3D generation tasks, newest first, with download URLs for finished ones.",
    description:
      "List the account's recent 3D generation tasks, newest first. Use it to find a model that already exists instead of generating it again, or to resume after your app restarts. Finished tasks include result.mesh_url.",
    creditCost: "Free (0 credits)",
    creditChip: "Free · 0 credits",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    queryParams: [
      {
        name: "limit",
        type: "integer",
        required: false,
        default: "20",
        description: "How many tasks to return, from 1 to 100.",
      },
    ],
    curlExample: `curl -X GET "https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks?limit=10" \\
  -H "Authorization: Bearer hyd_live_your_api_key_here"`,
    pythonExample: `import requests

headers = {"Authorization": "Bearer hyd_live_your_api_key_here"}
res = requests.get("https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks", params={"limit": 10}, headers=headers).json()

for task in res["data"]:
    mesh = (task.get("result") or {}).get("mesh_url")
    print(task["id"], task["status"], mesh or "")`,
    tsExample: `const res = await fetch("https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks?limit=10", {
  headers: { "Authorization": "Bearer hyd_live_your_api_key_here" },
});
const { data } = await res.json();
const ready = data.filter((task) => task.status === "SUCCEEDED");
console.log(ready.map((task) => task.result.mesh_url));`,
    response200: `{
  "object": "list",
  "data": [
    {
      "id": "job_9b1deb4d3b7d4e8b82",
      "object": "task",
      "type": "text-to-3d",
      "status": "SUCCEEDED",
      "prompt": "a medieval treasure chest",
      "model": "bluefox-1",
      "result": {
        "mesh_url": "https://storage.googleapis.com/hydrilla-meshes/job_9b1deb4d3b7d4e8b82.glb",
        "preview_image_url": "https://storage.googleapis.com/hydrilla-meshes/job_9b1deb4d3b7d4e8b82_thumb.png",
        "format": "glb",
        "model": "bluefox-1"
      },
      "error": null,
      "created_at": 1790762400,
      "updated_at": 1790762442
    }
  ],
  "has_more": false
}`,
    response401: `{
  "error": {
    "message": "Invalid API key.",
    "type": "authentication_error"
  }
}`,
  },
  "tasks-cancel": {
    method: "DELETE",
    path: "/v1/3d/tasks/:taskId",
    title: "Cancel Task",
    summary: "Stop a 3D generation task that is still running. Unused credits are refunded.",
    description:
      "Stop a task that is still PENDING or IN_PROGRESS. Its credits are refunded automatically. Cancelling a task that has already finished changes nothing and returns its current status.",
    creditCost: "Free (0 credits)",
    creditChip: "Free · 0 credits",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    queryParams: [
      {
        name: "taskId",
        type: "string",
        required: true,
        description: "The job identifier returned by /v1/3d/text-to-3d or /v1/3d/image-to-3d.",
      },
    ],
    curlExample: `curl -X DELETE https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_9b1deb4d3b7d4e8b82 \\
  -H "Authorization: Bearer hyd_live_your_api_key_here"`,
    pythonExample: `import requests

headers = {"Authorization": "Bearer hyd_live_your_api_key_here"}
res = requests.delete("https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_9b1deb4d3b7d4e8b82", headers=headers).json()
print(res["status"])  # CANCELLED`,
    tsExample: `const res = await fetch("https://hydrilla-ai-g1bm.vercel.app/v1/3d/tasks/job_9b1deb4d3b7d4e8b82", {
  method: "DELETE",
  headers: { "Authorization": "Bearer hyd_live_your_api_key_here" },
});
console.log((await res.json()).status); // CANCELLED`,
    response200: `{
  "id": "job_9b1deb4d3b7d4e8b82",
  "object": "task",
  "status": "CANCELLED"
}`,
    response401: `{
  "error": {
    "message": "Invalid API key.",
    "type": "authentication_error"
  }
}`,
  },
  "images-generate": {
    method: "POST",
    path: "/v1/images/generate",
    title: "Generate Concept Image",
    summary: "Render high-fidelity 2D concept art and orthographic visual references.",
    // CONTENT-FLAG: third-party model names (OpenAI Flare / Sunburst, Google Gemini Flash / Pro Image).
    description:
      "Render high-fidelity 2D concept art and orthographic visual references using leading vision models (OpenAI Flare / Sunburst or Google Gemini Flash / Pro Image).",
    creditCost: "1 credit",
    creditChip: "1 credit",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    contentType: "application/json",
    bodyParams: [
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "Detailed description of the asset to illustrate.",
      },
      {
        name: "model",
        type: "string",
        required: false,
        default: "gpt-image-2.5-flare",
        description:
          "Target model: gpt-image-2.5-flare, gpt-image-2.5-sunburst, gemini-3.1-flash-image, or gemini-3-pro-image.",
      },
      {
        name: "aspect_ratio",
        type: "string",
        required: false,
        default: "1:1",
        description: "Image aspect ratio: '1:1', '3:2', or '2:3'.",
      },
    ],
    curlExample: `curl -X POST https://hydrilla-ai-g1bm.vercel.app/v1/images/generate \\
  -H "Authorization: Bearer hyd_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Sci-fi tactical rover with solar panels, clean studio render",
    "model": "gpt-image-2.5-flare",
    "aspect_ratio": "1:1"
  }'`,
    pythonExample: `import requests

url = "https://hydrilla-ai-g1bm.vercel.app/v1/images/generate"
headers = {
    "Authorization": "Bearer hyd_live_your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "prompt": "Sci-fi tactical rover with solar panels, clean studio render",
    "model": "gpt-image-2.5-flare"
}

response = requests.post(url, headers=headers, json=payload)
print("Image URL:", response.json()["image_url"])`,
    tsExample: `const response = await fetch("https://hydrilla-ai-g1bm.vercel.app/v1/images/generate", {
  method: "POST",
  headers: {
    "Authorization": "Bearer hyd_live_your_api_key_here",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: "Sci-fi tactical rover with solar panels, clean studio render",
    model: "gpt-image-2.5-flare"
  })
});

const data = await response.json();
console.log("Rendered Image:", data.image_url);`,
    response200: `{
  "image_url": "https://hydrilla-assets.s3.amazonaws.com/generated/img_20260930_rover.png",
  "model": "gpt-image-2.5-flare",
  "prompt": "Sci-fi tactical rover with solar panels, clean studio render",
  "width": 1024,
  "height": 1024
}`,
    response401: `{
  "error": "Unauthorized",
  "message": "Invalid or revoked API key."
}`,
  },
  "images-edit": {
    method: "POST",
    path: "/v1/images/edit",
    title: "Edit Concept Image",
    summary: "Modify an existing concept render using natural language prompts and optional masks.",
    description: "Modify an existing concept render using natural language prompts and optional masks.",
    creditCost: "1 credit",
    creditChip: "1 credit",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    contentType: "application/json",
    bodyParams: [
      {
        name: "image_url",
        type: "string",
        required: true,
        description: "Public HTTPS URL of the base image to modify.",
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        description:
          "Description of the modifications (e.g. 'Add glowing orange lights and weathered rust scratches').",
      },
      {
        name: "model",
        type: "string",
        required: false,
        default: "gpt-image-2.5-flare",
        description: "Model to use for editing.",
      },
    ],
    curlExample: `curl -X POST https://hydrilla-ai-g1bm.vercel.app/v1/images/edit \\
  -H "Authorization: Bearer hyd_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://hydrilla-assets.s3.amazonaws.com/generated/img_20260930_rover.png",
    "prompt": "Add heavy battle damage and glowing warning lights",
    "model": "gpt-image-2.5-flare"
  }'`,
    pythonExample: `import requests

url = "https://hydrilla-ai-g1bm.vercel.app/v1/images/edit"
headers = {
    "Authorization": "Bearer hyd_live_your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "image_url": "https://hydrilla-assets.s3.amazonaws.com/generated/img_20260930_rover.png",
    "prompt": "Add heavy battle damage and glowing warning lights"
}

response = requests.post(url, headers=headers, json=payload)
print("Edited Image:", response.json()["image_url"])`,
    tsExample: `const response = await fetch("https://hydrilla-ai-g1bm.vercel.app/v1/images/edit", {
  method: "POST",
  headers: {
    "Authorization": "Bearer hyd_live_your_api_key_here",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    image_url: "https://hydrilla-assets.s3.amazonaws.com/generated/img_20260930_rover.png",
    prompt: "Add heavy battle damage and glowing warning lights"
  })
});

const data = await response.json();
console.log("Edited Image:", data.image_url);`,
    response200: `{
  "image_url": "https://hydrilla-assets.s3.amazonaws.com/generated/img_20260930_rover_edited.png",
  "model": "gpt-image-2.5-flare",
  "prompt": "Add heavy battle damage and glowing warning lights"
}`,
    response401: `{
  "error": "Unauthorized",
  "message": "Invalid or revoked API key."
}`,
  },
  "models-list": {
    method: "GET",
    path: "/v1/models",
    title: "List Models & Capabilities",
    summary:
      "Returns all currently available 3D reconstruction and 2D concept generation models, active versions, and credit costs.",
    description:
      "Returns all currently available 3D reconstruction and 2D concept generation models, active versions, and credit costs.",
    creditCost: "Free (0 credits)",
    creditChip: "Free · 0 credits",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    curlExample: `curl -X GET https://hydrilla-ai-g1bm.vercel.app/v1/models \\
  -H "Authorization: Bearer hyd_live_your_api_key_here"`,
    pythonExample: `import requests

res = requests.get("https://hydrilla-ai-g1bm.vercel.app/v1/models", headers={"Authorization": "Bearer hyd_live_..."})
for model in res.json()["models"]:
    print(model["id"], model["type"], model["credits"])`,
    tsExample: `const res = await fetch("https://hydrilla-ai-g1bm.vercel.app/v1/models", {
  headers: { "Authorization": "Bearer hyd_live_..." }
});
const { models } = await res.json();
console.table(models);`,
    // CONTENT-FLAG: response lists third-party provider/model names (BlueFox 3D v1, GPT Image 2.5 Flare, Gemini 3.1 Flash Image).
    response200: `{
  "models": [
    {
      "id": "bluefox-1",
      "type": "3d",
      "provider": "hydrilla",
      "name": "BlueFox 3D v1",
      "credits": 2,
      "max_resolution": 1536
    },
    {
      "id": "gpt-image-2.5-flare",
      "type": "image",
      "provider": "openai",
      "name": "GPT Image 2.5 Flare",
      "credits": 1
    },
    {
      "id": "gemini-3.1-flash-image",
      "type": "image",
      "provider": "gemini",
      "name": "Gemini 3.1 Flash Image",
      "credits": 1
    }
  ]
}`,
    response401: `{
  "error": "Unauthorized",
  "message": "Invalid or revoked API key."
}`,
  },
  "user-me": {
    method: "GET",
    path: "/v1/user/me",
    title: "Account & Credits",
    summary: "Inspect your developer account credentials, active tier, and remaining credit balance.",
    description: "Inspect your developer account credentials, active tier, and remaining credit balance.",
    creditCost: "Free (0 credits)",
    creditChip: "Free · 0 credits",
    authHeader: "Authorization: Bearer hyd_live_your_api_key_here",
    curlExample: `curl -X GET https://hydrilla-ai-g1bm.vercel.app/v1/user/me \\
  -H "Authorization: Bearer hyd_live_your_api_key_here"`,
    pythonExample: `import requests

res = requests.get("https://hydrilla-ai-g1bm.vercel.app/v1/user/me", headers={"Authorization": "Bearer hyd_live_..."})
print("Remaining credits:", res.json()["credits"])`,
    tsExample: `const res = await fetch("https://hydrilla-ai-g1bm.vercel.app/v1/user/me", {
  headers: { "Authorization": "Bearer hyd_live_..." }
});
const me = await res.json();
console.log(\`Credits remaining: \${me.credits}\`);`,
    // CONTENT-FLAG: key_prefix hyd_live_d81a... matches the sample key flagged on the Authentication page.
    response200: `{
  "user_id": "usr_94f8a120cb9e",
  "email": "developer@studio.com",
  "credits": 250,
  "plan": "pro",
  "key_prefix": "hyd_live_d81a..."
}`,
    response401: `{
  "error": "Unauthorized",
  "message": "Invalid or revoked API key."
}`,
  },
};

export const ENDPOINT_PAGE_META: Record<string, PageMeta> = Object.fromEntries(
  Object.entries(API_SPECS).map(([slug, spec]) => [
    `/api/${slug}`,
    {
      slug: `/api/${slug}`,
      title: spec.title,
      heading: spec.title,
      summary: spec.summary,
      kind: "endpoint",
      method: spec.method,
      path: spec.path,
      headings: ENDPOINT_HEADINGS(
        spec.bodyParams
          ? [{ id: "request-body", text: "Request body" }]
          : [{ id: "path-query-parameters", text: "Path & query parameters" }],
      ),
    } satisfies PageMeta,
  ]),
);

export const GUIDE_PAGE_META: Record<string, PageMeta> = {
  "/introduction": {
    slug: "/introduction",
    title: "Introduction",
    heading: "Introduction to Hydrilla AI",
    summary:
      "Hydrilla AI provides developers, game studios, and 3D pipelines with programmatic access to our proprietary BlueFox 3D neural reconstruction engine and multi-modal 2D concept models.",
    kind: "guide",
    headings: [
      { id: "capabilities", text: "Capabilities" },
      { id: "system-architecture", text: "System architecture" },
      { id: "next-steps", text: "Next steps" },
    ],
  },
  "/quickstart": {
    slug: "/quickstart",
    title: "Quickstart",
    heading: "Quickstart Guide",
    summary:
      "Get up and running with the Hydrilla AI API in 3 simple steps: authenticate, submit a 3D reconstruction task, and poll for the downloadable GLB mesh.",
    kind: "guide",
    headings: [
      { id: "step-1", text: "Create your API key" },
      { id: "step-2", text: "Trigger 3D reconstruction" },
      { id: "step-3", text: "Poll for completion and download the mesh" },
      { id: "complete-python-example", text: "Complete Python example" },
      { id: "next-steps", text: "Next steps" },
    ],
  },
  "/authentication": {
    slug: "/authentication",
    title: "Authentication",
    heading: "Authentication",
    summary:
      "The Hydrilla AI API uses secure Bearer keys to authenticate requests. Manage your keys and monitor usage through the developer dashboard.",
    kind: "guide",
    headings: [
      { id: "authorization-headers", text: "Authorization headers" },
      { id: "key-security", text: "Key security and hashing" },
      { id: "error-codes", text: "Error codes" },
    ],
  },
  "/models": {
    slug: "/models",
    title: "Models & Engines",
    heading: "Models & Engines",
    summary:
      "Hydrilla AI orchestrates specialized neural architectures across 3D reconstruction and 2D concept rendering.",
    kind: "guide",
    headings: [
      { id: "3d-reconstruction-models", text: "3D reconstruction models" },
      { id: "2d-image-models", text: "2D concept and image editing models" },
    ],
  },
  "/sdks/python": {
    slug: "/sdks/python",
    title: "Python SDK Guide",
    heading: "Python Integration Guide",
    summary:
      "Easily integrate Hydrilla 3D and 2D generation into your Python scripts, Blender add-ons, or backend services.",
    kind: "guide",
    headings: [
      { id: "installation", text: "Installation" },
      { id: "python-client-implementation", text: "Python client implementation" },
      { id: "example-usage", text: "Example usage" },
    ],
  },
  "/sdks/typescript": {
    slug: "/sdks/typescript",
    title: "TypeScript SDK Guide",
    heading: "TypeScript Integration Guide",
    summary:
      "Full TypeScript definitions and helper client for Next.js, Node.js, Bun, or Cloudflare Workers.",
    kind: "guide",
    headings: [
      { id: "typescript-client-implementation", text: "TypeScript client implementation" },
      { id: "example-usage", text: "Example usage" },
    ],
  },
};

export const PAGE_META: Record<string, PageMeta> = {
  ...GUIDE_PAGE_META,
  ...ENDPOINT_PAGE_META,
};

export const PAGE_ORDER: string[] = [
  "/introduction",
  "/quickstart",
  "/authentication",
  "/models",
  "/api/image-to-3d",
  "/api/text-to-3d",
  "/api/tasks",
  "/api/images-generate",
  "/api/images-edit",
  "/api/models-list",
  "/api/user-me",
  "/sdks/python",
  "/sdks/typescript",
];

export interface FlatNavItem extends DocNavItem {
  section: string;
}

export function flatNav(): FlatNavItem[] {
  return DOC_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({ ...item, section: section.title })),
  );
}

export function getPrevNext(currentPath: string): {
  prev: FlatNavItem | null;
  next: FlatNavItem | null;
} {
  const items = flatNav();
  const idx = items.findIndex((i) => i.href === currentPath);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? items[idx - 1] : null,
    next: idx < items.length - 1 ? items[idx + 1] : null,
  };
}
