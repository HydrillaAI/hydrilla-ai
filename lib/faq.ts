import { PRICING, SLOT_PRICING } from "@/lib/pricing";

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Homepage FAQ, worded from BUILD-KIT/pages (pricing, features, bluefox,
 * water, integrations, research, faq). Plan numbers come from lib/pricing.
 * Formats link to /features#exports instead of being listed (kit rule).
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Who is Hydrilla designed for?",
    answer:
      "Hydrilla AI is an AI 3D workspace for studio and artist pipelines, used across games, film, architecture, XR, and product work.",
  },
  {
    question: "What inputs does Hydrilla support?",
    answer:
      "A typed prompt or an uploaded picture. For whole sets, Water Agent works from a brief, and a brief can be one prop or a whole scene.",
  },
  {
    question: "What is BlueFox?",
    answer:
      "BlueFox, Hydrilla's 3D model, turns a prompt or a picture into a segmented 3D model with UVs and PBR textures. Hawan Research Labs, Hydrilla AI's research lab, builds it.",
  },
  {
    question: "What is Water Agent?",
    answer:
      "Water Agent is the AI 3D agent for artists and studios. It works inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin, costs no credits, and is included on every plan.",
  },
  {
    question: "Do generated models still need an artist?",
    answer:
      "Assets close to camera still need an artist's pass. Use generated models as a starting point for hero work, and check the limits of BlueFox at https://hydrilla.ai/bluefox#limits.",
  },
  {
    question: "Which engines and tools does Hydrilla work with?",
    answer:
      "Hydrilla AI connects to the tools you already run: a Blender add-on, plugins for Unity, Unreal, and Godot, a local Bridge from Studio, and MCP and REST for custom pipelines. See https://hydrilla.ai/integrations.",
  },
  {
    question: "What formats does Hydrilla export?",
    answer:
      "Every plan exports every format, Free included. The full list is at https://hydrilla.ai/features#exports.",
  },
  {
    question: "Is there a free plan available?",
    answer: `Yes. Free is $${PRICING.free.monthly} a month with ${PRICING.free.credits.toLocaleString("en-US")} credits, for trying Hydrilla on your own projects.`,
  },
  {
    question: "What does a model cost?",
    answer:
      "A model from text costs 45 credits and a model from an uploaded image costs 30, at default quality.",
  },
  {
    question: "How does the 14-day trial work?",
    answer:
      "Start on the Free plan, or try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card.",
  },
  {
    question: "How do Hourly plans save?",
    answer: `Hourly Pro gives Pro's ${PRICING.pro.credits.toLocaleString("en-US")} credits for 33% less, $${SLOT_PRICING.slot_pro.monthly} instead of $${PRICING.pro.monthly}, in a chosen daily window. Hourly gives Starter's ${PRICING.starter.credits.toLocaleString("en-US")} credits for $${SLOT_PRICING.slot.monthly} instead of $${PRICING.starter.monthly}, in one chosen hour a day.`,
  },
  {
    question: "Which plan includes the API?",
    answer: "Pro includes REST API access. See https://hydrilla.ai/api.",
  },
  {
    question: "Do I own what I generate?",
    answer:
      "Hydrilla's Terms of Service cover ownership of the 3D assets you generate. The ownership section of the Terms has the exact wording: https://hydrilla.ai/terms#ownership.",
  },
  {
    question: "What is Hawan Research Labs?",
    answer:
      "Hawan Research Labs is Hydrilla AI's research lab, where the 3D research happens and BlueFox is built.",
  },
];

export function faqByQuestions(questions: string[]): FaqItem[] {
  return questions
    .map((question) => FAQ_ITEMS.find((item) => item.question === question))
    .filter((item): item is FaqItem => Boolean(item));
}
