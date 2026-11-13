/**
 * Enterprise FAQ, shared by the page and its FAQPage JSON-LD so the two can't drift.
 * Self-contained answers keep studio buyers on /enterprise without jumping away.
 */
export const ENTERPRISE_FAQ: readonly { q: string; a: string }[] = [
  {
    q: "What is Hydrilla Enterprise?",
    a: "Hydrilla Enterprise is an AI 3D production platform for studios. It combines BlueFox, Water Agent, native 3D software plugins, a local Bridge, an MCP server, and high-concurrency REST API access inside one private workspace with shared seats, custom credit pools, and commercial ownership.",
  },
  {
    q: "What's the difference between Pro and Enterprise?",
    a: "Pro is a self-serve monthly plan ($12/month for 3,000 credits) designed for individual creators and small teams. Enterprise is a custom studio agreement with shared team seats, custom credit pools, dedicated API concurrency, queue priority, and hands-on pipeline onboarding.",
  },
  {
    q: "Which 3D software and AI agent workflows are supported?",
    a: "Enterprise includes native plugins and a local Bridge for Blender, Autodesk Maya, Autodesk 3ds Max, Unity, Unreal Engine, and Godot 4, alongside standard 3D asset compatibility with Houdini, Cinema 4D, ZBrush, Nuke, DaVinci Resolve, Krita, GIMP, AutoCAD, and Autodesk Fusion. Coding agents connect via the local stdio MCP server, and custom pipelines connect via the REST API.",
  },
  {
    q: "How does Water Agent work for studio teams?",
    a: "Water Agent is Hydrilla's AI 3D agent. Art leads brief an entire prop set or environment in plain language, review and edit the asset plan before generation starts, and revise individual pieces in conversation inside Studio or their 3D plugin. Water Agent uses zero credits on every plan.",
  },
  {
    q: "How do Enterprise credit pools and pricing work?",
    a: "Enterprise pricing is tailored to your seat count, API concurrency, monthly generation volume, and queue priority. Instead of isolated per-seat caps, your studio shares one unified credit pool across artists, plugins, and automated API jobs.",
  },
  {
    q: "Do we own the 3D assets we generate, and do you train on our data?",
    a: "You keep all rights to your uploads, and as between you and Hydrilla AI (to the extent permitted by law), you own generated 3D outputs for commercial use. Hydrilla never trains models on your prompts, reference images, or generated 3D assets on any plan.",
  },
  {
    q: "Can we run a vendor security review or custom legal agreement?",
    a: "Yes. Enterprise agreements are shaped around your studio's legal and procurement requirements. Send security questionnaires or contract redlines through the Contact Sales form on this page or to founders@hydrilla.ai.",
  },
  {
    q: "How fast can our studio onboard?",
    a: "Studios can start generating immediately. Once your agreement is in place, we provision your shared workspace, configure credit pools and API concurrency, and help your technical art team connect plugins, the local Bridge, and MCP workflows.",
  },
];

export function faqPlainText(answer: string): string {
  return answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
