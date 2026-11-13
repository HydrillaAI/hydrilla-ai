export type IntegrationCategory =
  | "modeling"
  | "engines"
  | "agents"
  | "api";

export type IntegrationStatus = "available" | "bridge" | "coming_soon";

export type IntegrationGuideStep = {
  title: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type Integration = {
  slug: string;
  name: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  summary: string;
  description: string;
  downloadPath?: string;
  docsAnchor?: string;
  bridgeTarget: string;
  /** Local port the app's plugin listens on for Send to DCC. Unset when the app cannot receive. */
  bridgePort?: number;
  installSteps: string[];
  guideSteps?: IntegrationGuideStep[];
};

/** Each plugin runs its own Bridge on this machine, one port per app. */
export const BRIDGE_HOST = "127.0.0.1";

export function bridgeUrlFor(port: number): string {
  return `http://${BRIDGE_HOST}:${port}`;
}

export const INTEGRATIONS: Integration[] = [
  {
    slug: "blender",
    name: "Blender",
    category: "modeling",
    status: "available",
    summary: "Generate text/image to 3D and import GLB in Blender.",
    description:
      "Install the Hydrilla Blender add-on, open the sidebar Hydrilla tab, paste your API key, and generate models in place. Models sent from Studio or your AI agent arrive in the open scene through the local Bridge.",
    downloadPath: "/plugins/hydrilla-blender.zip",
    bridgeTarget: "blender",
    bridgePort: 7345,
    installSteps: [
      "Download hydrilla-blender.zip.",
      "In Blender: Edit → Preferences → Add-ons → dropdown → Install from Disk… and select the zip.",
      "Enable the Hydrilla add-on, then press N (or the sidebar arrow) and open the Hydrilla tab.",
      "Paste your API key (create one at /app/api-keys), then generate. Click Run Bridge to receive models from Studio or your AI agent.",
    ],
    guideSteps: [
      {
        title: "Install from Disk",
        body: "Open Edit → Preferences → Add-ons. Open the dropdown in the top-right and choose Install from Disk…. Select hydrilla-blender.zip, then enable the Hydrilla add-on.",
        imageSrc: "/integrations/blender/01-install-from-disk.jpg",
        imageAlt: "Blender Preferences Add-ons menu with Install from Disk highlighted",
      },
      {
        title: "Open the sidebar",
        body: "Back in the 3D Viewport, click the small arrow on the right edge of the viewport (or press N) to open the sidebar.",
        imageSrc: "/integrations/blender/02-open-sidebar.jpg",
        imageAlt: "Blender 3D Viewport with arrow pointing to the sidebar toggle",
      },
      {
        title: "Open the Hydrilla tab",
        body: "In the sidebar tabs, click Hydrilla. Paste your API key once and generate from text or an image. Click Run Bridge to receive models sent from Studio or your AI agent.",
        imageSrc: "/integrations/blender/03-hydrilla-tab.jpg",
        imageAlt: "Blender sidebar showing the Hydrilla tab",
      },
    ],
  },
  {
    slug: "maya",
    name: "Maya",
    category: "modeling",
    status: "available",
    summary: "Generate AI 3D models and import them into Maya.",
    description:
      "A Hydrilla window for Maya that generates models with your API key and imports them into the open scene. Click Run Bridge to receive models sent from Studio or your AI agent.",
    downloadPath: "/plugins/hydrilla-maya.zip",
    bridgeTarget: "maya",
    bridgePort: 7346,
    installSteps: [
      "Download hydrilla-maya.zip and unzip it into a folder on Maya's script path (for example your maya/scripts folder).",
      "In the Script Editor (Python tab), run: import hydrilla_maya; hydrilla_maya.show()",
      "Paste your API key (create one at /app/api-keys), then generate from text or an image.",
      "Click Run Bridge to receive models from Studio or your AI agent. Maya imports GLB through its glTF importer.",
    ],
  },
  {
    slug: "3dsmax",
    name: "3ds Max",
    category: "modeling",
    status: "available",
    summary: "Generate AI 3D models and import them into 3ds Max.",
    description:
      "A Hydrilla window for 3ds Max that generates models with your API key and imports them into the open scene. Click Run Bridge to receive models sent from Studio or your AI agent.",
    downloadPath: "/plugins/hydrilla-3dsmax.zip",
    bridgeTarget: "3dsmax",
    bridgePort: 7347,
    installSteps: [
      "Download hydrilla-3dsmax.zip and unzip it.",
      "In 3ds Max choose Scripting › Run Script and pick hydrilla_max.py.",
      "Paste your API key (create one at /app/api-keys), then generate from text or an image.",
      "Click Run Bridge to receive models from Studio or your AI agent. 3ds Max 2023 and newer import GLB directly.",
    ],
  },
  {
    slug: "unity",
    name: "Unity",
    category: "engines",
    status: "available",
    summary: "Import game-ready GLB into the Unity Editor.",
    description:
      "Editor window that uses your Hydrilla API key to generate models, saves the GLB into Assets/Hydrilla, and receives models sent from Studio or your AI agent through the local Bridge.",
    downloadPath: "/plugins/hydrilla-unity.zip",
    bridgeTarget: "unity",
    bridgePort: 7349,
    installSteps: [
      "Download hydrilla-unity.zip and copy the Hydrilla folder into Assets/.",
      "Open Window → Hydrilla.",
      "Paste your API key (create one at /app/api-keys) and generate, or click Run Bridge to receive models from Studio.",
      "Install a glTF importer such as the glTFast package so Unity can open the GLB files.",
    ],
  },
  {
    slug: "unreal",
    name: "Unreal Engine",
    category: "engines",
    status: "available",
    summary: "Import Hydrilla meshes into Unreal Editor.",
    description:
      "Unreal Editor Python plugin that generates models with your Hydrilla API key and receives models sent from Studio or your AI agent. Models import into /Game/Hydrilla.",
    downloadPath: "/plugins/hydrilla-unreal.zip",
    bridgeTarget: "unreal",
    bridgePort: 7348,
    installSteps: [
      "Enable the Python Editor Script Plugin in Unreal and restart the editor.",
      "Copy the contents of the zip’s Python folder into your project’s Content/Python folder and restart.",
      "Set your API key once: in the Python console run import hydrilla_unreal; hydrilla_unreal.set_api_key(\"hyd_live_…\").",
      "Choose Hydrilla → Run Bridge to receive models, or call hydrilla_unreal.generate_text(\"a sci-fi crate\").",
    ],
  },
  {
    slug: "godot",
    name: "Godot",
    category: "engines",
    status: "available",
    summary: "Bring Hydrilla GLB into Godot 4 projects.",
    description:
      "Godot 4 editor plugin that generates models with your Hydrilla API key and receives models sent from Studio or your AI agent. Imported meshes land under res://hydrilla/.",
    downloadPath: "/plugins/hydrilla-godot.zip",
    bridgeTarget: "godot",
    bridgePort: 7350,
    installSteps: [
      "Copy addons/hydrilla into your Godot 4.2+ project.",
      "Enable the Hydrilla plugin in Project Settings → Plugins.",
      "Open the Hydrilla dock, paste your API key (create one at /app/api-keys), and generate or click Run Bridge.",
    ],
  },
  {
    slug: "mcp",
    name: "MCP Server",
    category: "agents",
    status: "available",
    summary: "Let AI agents generate 3D through Hydrilla over MCP.",
    description:
      "Local stdio MCP server for the Hydrilla developer API. Agents can generate models and place them straight into your open Blender, Unity, Unreal or Godot project. Works with Claude Code, Cursor, Codex, and other MCP clients.",
    bridgeTarget: "mcp",
    installSteps: [
      "Follow the setup on the MCP page for your agent.",
      "Add your API key in the Hydrilla plugin, or set HYDRILLA_API_KEY in the MCP server config. Never paste it into the chat.",
      "Ask your agent for a model; with a plugin’s Bridge running it lands in your open scene.",
    ],
  },
  {
    slug: "api",
    name: "REST API",
    category: "api",
    status: "available",
    summary: "Build custom pipelines with the Hydrilla API.",
    description:
      "Task-based REST API for text-to-3D and image-to-3D. Authenticate with hyd_live_ keys, poll tasks, and download GLB — the same contract the DCC plugins use.",
    docsAnchor: "/api",
    bridgeTarget: "api",
    installSteps: [
      "Create a key at /app/api-keys.",
      "POST /v1/3d/text-to-3d or /v1/3d/image-to-3d with Bearer auth.",
      "Poll GET /v1/3d/tasks/:id until SUCCEEDED, then download result.mesh_url.",
    ],
  },
];

export const INTEGRATION_CATEGORIES: Array<{
  id: IntegrationCategory;
  title: string;
  description: string;
}> = [
  {
    id: "modeling",
    title: "3D Modeling",
    description: "Generate and import models inside Blender, Maya and 3ds Max.",
  },
  {
    id: "engines",
    title: "Game Engines",
    description: "Drop production meshes into real-time engines.",
  },
  {
    id: "agents",
    title: "AI Agents",
    description: "Drive Hydrilla from MCP-compatible agents.",
  },
  {
    id: "api",
    title: "Build your own",
    description: "REST API for custom studio and pipeline tooling.",
  },
];

export function getIntegration(slug: string): Integration | undefined {
  return INTEGRATIONS.find((item) => item.slug === slug);
}

export function integrationsByCategory(
  category: IntegrationCategory
): Integration[] {
  return INTEGRATIONS.filter((item) => item.category === category);
}
