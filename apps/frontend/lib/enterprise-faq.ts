/**
 * Enterprise FAQ, shared by the page and its FAQPage JSON-LD so the two can't drift.
 * Answers use `[label](href)` for links; `faqPlainText` strips them for structured data.
 */
export const ENTERPRISE_FAQ: readonly { q: string; a: string }[] = [
  {
    q: "What's the difference between Pro and Enterprise?",
    a: "Pro is a self-serve monthly plan for individuals and small teams: $12 a month for 3,000 credits, with REST API access. Enterprise is an agreement shaped around your studio, with seats in a shared workspace, API concurrency sized to your volume, custom credit pools, queue priority, and help connecting your pipeline. [See self-serve plans](/pricing).",
  },
  {
    q: "What drives Enterprise pricing?",
    a: "Enterprise is quoted, not listed. The price follows your seats, API concurrency, monthly generation volume, and queue priority. Tell us those numbers, and we'll come back with a plan around them.",
  },
  {
    q: "How do credits work on Enterprise?",
    a: "Instead of individual allowances, your studio gets a credit pool set around its monthly volume. On public plans, a model at default quality costs 45 credits from text and 30 from an uploaded image, and Water Agent costs no credits. Your agreement sets the terms of your pool.",
  },
  {
    q: "What happens to our assets if we don't renew?",
    a: "Files you've already exported stay in your own pipeline. For work still in the workspace, export what you want to keep before your account closes: under the [Terms](/terms), content is deleted as described in the [Privacy Policy](/privacy) when an account closes.",
  },
  {
    q: "Can we sign our own agreement?",
    a: "Enterprise runs on an agreement shaped around your studio. Send your legal team's requirements or your own paper with your inquiry, and we'll tell you in writing what we can agree to.",
  },
  {
    q: "Who owns what we generate, and do you train on our data?",
    a: "You keep all rights in what you upload. As between you and Hydrilla AI, and to the extent the law allows, you own the output generated for you and may use it commercially. The [ownership section of the Terms](/terms#ownership) has the exact wording. We don't use your prompts, reference images, or generated models to train our models, on any plan. [How we handle data](/security).",
  },
  {
    q: "Will Hydrilla fit the pipeline we already run?",
    a: "Hydrilla exports GLB, FBX, OBJ, and USDZ on every plan. [Plugins](/integrations) for Blender, Unity, Unreal, and Godot connect through a local Bridge, the [REST API](/api) runs jobs from your own backend, and an [MCP server](/integrations/mcp) serves AI agents. Enterprise adds help connecting these to your pipeline.",
  },
  {
    q: "Can we start on Pro and move up later?",
    a: "Yes. You can evaluate on any self-serve plan first. When you get in touch, tell us what you run today, and we'll plan Enterprise around it.",
  },
  {
    q: "Can we send a security questionnaire?",
    a: "Yes. Send it to founders@hydrilla.ai, naming your studio and when you need answers. We answer in writing with what we can confirm.",
  },
];

export function faqPlainText(answer: string): string {
  return answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
