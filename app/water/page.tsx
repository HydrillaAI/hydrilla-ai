import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Water Agent: The AI 3D Agent for Studios | Hydrilla AI",
  description:
    "Hydrilla Water Agent is the AI 3D agent that works with artists and studios, from brief to finished 3D assets, inside the tools they already use.",
  ogTitle: "Water Agent: the AI 3D agent for artists and studios",
  path: "/water",
  absoluteTitle: true,
});

const WATER_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/water#software",
      name: "Water Agent",
      alternateName: "Hydrilla Water Agent",
      description:
        "Hydrilla Water Agent is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the tools they already use.",
      url: "https://hydrilla.ai/water",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      isPartOf: {
        "@id": "https://hydrilla.ai/features#software",
      },
      provider: {
        "@id": "https://hydrilla.ai/#organization",
      },
      featureList: [
        "Build 3D asset sets from a brief, in conversation",
        "Revise piece by piece",
        "Works inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Included on every Hydrilla plan, no credits",
      },
    },
    {
      "@type": "HowTo",
      "@id": "https://hydrilla.ai/water#howto",
      name: "From brief to finished set",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          text: "Write the brief like a creative director: the pieces, the style, and where the assets will be used.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          text: "Review the plan and adjust it until it matches your intent.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          text: "Water Agent builds the set to the direction you gave it.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          text: "Check each piece, ask for changes in the conversation, and take the finished set into your project.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://hydrilla.ai/water#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What does Water Agent cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Water Agent costs no credits and is included on every plan.",
          },
        },
        {
          "@type": "Question",
          name: "Who is it for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "3D artists, art leads, and studio teams who brief whole sets of assets and need them to hold together.",
          },
        },
        {
          "@type": "Question",
          name: "Can a brief be a single asset?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. A brief can be one prop or a whole scene, and Water Agent plans only what you ask for.",
          },
        },
        {
          "@type": "Question",
          name: "When should I use text to 3D instead?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "When you already know the one model you want. Text to 3D starts from a prompt, and image to 3D starts from a reference.",
          },
        },
        {
          "@type": "Question",
          name: "How is Water Agent different from the MCP server?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Water Agent is the agent inside Hydrilla. The MCP server lets your own AI agent drive Hydrilla from outside.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Product",
          item: "https://hydrilla.ai/features",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Water Agent",
          item: "https://hydrilla.ai/water",
        },
      ],
    },
  ],
};

export default function WaterPage() {
  return (
    <>
      <JsonLd data={WATER_JSON_LD} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Product</p>
          <h1 className="pickle-article-title" data-wide="true">
            Water Agent, the AI 3D agent for artists and studios
          </h1>
          <div className="pickle-text" style={{ textAlign: "center" }}>
            <p>
              Hydrilla Water Agent is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the tools they already use.
            </p>
            <p>
              Brief it as you would brief your team: the look, the pieces, the scene. It plans the set, builds it, and revises with you until it&apos;s right.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app/water" className="pickle-pill-solid">
              Open Water Agent
            </Link>
            <Link
              href="/docs#water"
              className="pickle-glass-pill"
              style={{ height: "48px", fontSize: "17px", padding: "0 22px" }}
            >
              Read the docs
            </Link>
          </div>
        </header>

        <div className="pickle-article-column">
          {/* TODO(kit): visual – real Water Agent session capture; a short brief in the chat panel resolves into a 3 x 3 grid of matching props turning slowly */}
          <figure className="pickle-figure">
            <div
              role="img"
              aria-label="A Water Agent session in Hydrilla, with a chat brief for a fantasy armory on the left and nine matching props, including a helmet, a rune dagger, and a supply crate, on the right."
              className="pickle-card-surface"
            />
          </figure>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Direct the set, piece by piece</h2>
            <div className="pickle-text">
              {/* VERIFY: Safe wording "plans the set with you before it builds" (VERIFY-LIST #6) */}
              <ul>
                <li>
                  <strong>Turn a brief into a plan.</strong> Describe what the scene needs, and Water Agent plans the set with you before it builds.
                </li>
                <li>
                  <strong>Direct the look.</strong> Set the style in your brief, and keep refining it in the same conversation.
                </li>
                <li>
                  <strong>Revise piece by piece.</strong> Ask for a taller lantern or a darker crate, and the rest of the set stays as it is.
                </li>
                <li>
                  <strong>Work inside your tools.</strong> Brief and revise from your engine or DCC, and each piece lands in the project you have open.
                </li>
              </ul>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">From brief to finished set</h2>
            <div className="pickle-text">
              {/* VERIFY: Safe step 2 "Review the plan and adjust it" (VERIFY-LIST #6) */}
              <ol>
                <li>
                  Write the brief like a creative director: the pieces, the style, and where the assets will be used.
                </li>
                <li>
                  Review the plan and adjust it until it matches your intent.
                </li>
                <li>
                  Water Agent builds the set to the direction you gave it.
                </li>
                <li>
                  Check each piece, ask for changes in the conversation, and take the finished set into your project.
                </li>
              </ol>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Where Water Agent works</h2>
            <div className="pickle-text">
              <p>
                Water Agent works in the Hydrilla app, and inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin.{" "}
                <Link href="/integrations">Set up the plugin →</Link>
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Questions about Water Agent</h2>
            <div className="pickle-text">
              <p>
                <strong>What does Water Agent cost?</strong>
                <br />
                Water Agent costs no credits and is included on every plan.
              </p>
              <p>
                <strong>Who is it for?</strong>
                <br />
                3D artists, art leads, and studio teams who brief whole sets of assets and need them to hold together.
              </p>
              <p>
                <strong>Can a brief be a single asset?</strong>
                <br />
                Yes. A brief can be one prop or a whole scene, and Water Agent plans only what you ask for.
              </p>
              <p>
                <strong>When should I use text to 3D instead?</strong>
                <br />
                When you already know the one model you want.{" "}
                <Link href="/text-to-3d">Text to 3D →</Link> starts from a prompt, and{" "}
                <Link href="/image-to-3d">image to 3D →</Link> starts from a reference.
              </p>
              <p>
                <strong>How is Water Agent different from the MCP server?</strong>
                <br />
                Water Agent is the agent inside Hydrilla. The MCP server lets your own AI agent drive Hydrilla from outside.{" "}
                <Link href="/integrations/mcp">MCP server →</Link>
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Bring your next brief</h2>
            <div className="pickle-text">
              <p>Open Water Agent with the brief for your next set.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/app/water" className="pickle-pill-solid">
                Open Water Agent
              </Link>
              <Link
                href="/docs#water"
                className="pickle-glass-pill"
                style={{ height: "48px", fontSize: "17px", padding: "0 22px" }}
              >
                Read the docs
              </Link>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
