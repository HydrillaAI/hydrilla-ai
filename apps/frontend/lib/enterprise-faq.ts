/**
 * Enterprise FAQ, shared by the page and its FAQPage JSON-LD so the two can't drift.
 * Answers use `[label](href)` for links; `faqPlainText` strips them for structured data.
 */
export const ENTERPRISE_FAQ: readonly { q: string; a: string }[] = [
  {
    q: "What is Hydrilla Enterprise?",
    a: "Hydrilla Enterprise gives studios a shared AI 3D workspace, [BlueFox](/bluefox), [Water Agent](/water), native 3D software plugins, an [MCP server](/integrations/mcp), and [REST API](/api) concurrency under one studio agreement with custom credit pools and pipeline support.",
  },
  {
    q: "What's the difference between Pro and Enterprise?",
    a: "Pro is a self-serve monthly plan for individuals and small teams: $12 a month for 3,000 credits, with REST API access. Enterprise is an agreement shaped around your studio, with seats in a shared workspace, API concurrency sized to your volume, custom credit pools, queue priority, and help connecting your pipeline. [See self-serve plans](/pricing).",
  },
  {
    q: "Which 3D software and AI agent workflows does Enterprise support?",
    a: "[Water Agent](/water) works inside the Hydrilla Studio workspace and directly inside Blender, Unity, Unreal Engine, and Godot 4 through [Hydrilla plugins](/integrations) and the local Bridge. Coding agents and internal studio automation connect through the [MCP server](/integrations/mcp) and the [REST API](/api).",
  },
  {
    q: "How does Water Agent work for studio teams?",
    a: "Water Agent is Hydrilla's AI 3D agent. Artists and leads brief an entire set of props or environment pieces in plain language, review the plan first, and revise individual pieces in conversation inside Studio or their 3D tool. Water Agent uses zero credits on every plan.",
  },
  {
    q: "What drives Enterprise pricing and credit pools?",
    a: "Enterprise is quoted around your studio's seats, API concurrency, monthly generation volume, and queue priority. Instead of separate individual caps, your team draws from one shared credit pool sized to your pipeline. On public plans, a default model costs 45 credits from text or 30 from an image.",
  },
  {
    q: "Who owns what we generate, and do you train on our data?",
    a: "You keep all rights in what you upload. As between you and Hydrilla AI, and to the extent the law allows, you own the 3D assets generated for you and may use them commercially. The [ownership section of the Terms](/terms#ownership) has the exact wording. Prompts, reference images, and generated models are never used to train our models, on any plan. [Read security details](/security).",
  },
  {
    q: "Can we sign our own agreement or run a vendor security review?",
    a: "Yes. Enterprise runs on an agreement shaped around your studio. Send your legal requirements or security questionnaire to founders@hydrilla.ai, naming your studio and timeline, and we will respond in writing with what we can confirm.",
  },
  {
    q: "Can we evaluate on Pro before moving to Enterprise?",
    a: "Yes. Your team can test [BlueFox](/bluefox), [Water Agent](/water), and the [plugins](/integrations) on any self-serve plan first. When you are ready for shared seats, custom credit pools, or higher API concurrency, contact our team and we will structure Enterprise around your current setup.",
  },
];

export function faqPlainText(answer: string): string {
  return answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
