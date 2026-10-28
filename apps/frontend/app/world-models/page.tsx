import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  PickleActions,
  type PickleCardItem,
  PickleCards,
  PickleCta,
  PickleMediaGrid,
} from "@/components/layout/PicklePage";
import { absoluteUrl, getWebPageJsonLd } from "@/lib/seo";

const MODEL_CARDS = [
  {
    title: "BlueFox 1",
    icon: "bluefox",
    body: (
      <>
        Hydrilla&apos;s production 3D model turns a text prompt or reference image into a segmented mesh with UVs and PBR textures. It is built for the assets that move from generation into an artist&apos;s pipeline.
      </>
    ),
  },
  {
    title: "Water Agent",
    icon: "water",
    body: (
      <>
        Water is the agent layer around Hydrilla&apos;s models. It helps teams describe a scene, iterate on a direction, and move from an idea to a controllable 3D result through a guided workflow.
      </>
    ),
  },
  {
    title: "A workspace for worlds",
    icon: "studio",
    body: (
      <>
        The Hydrilla workspace connects generation, preview, editing, and export so models can become useful parts of a larger scene rather than isolated downloads.
      </>
    ),
  },
] satisfies PickleCardItem[];

const WORLD_MODEL_FAQS = [
  [
    "What is a world model?",
    "A world model is an AI system that represents aspects of a scene or environment so it can help generate, understand, or reason about spatial content. In Hydrilla, world-model workflows are focused on editable 3D assets and scenes.",
  ],
  [
    "Which models are available in Hydrilla AI?",
    "BlueFox 1 is Hydrilla's production 3D model for generating segmented, UV-unwrapped assets with PBR maps. Water is the agent-led workflow that helps users direct and iterate on 3D creation.",
  ],
  [
    "What can BlueFox 1 take as input?",
    "BlueFox 1 accepts a typed prompt or an uploaded reference image and returns a 3D asset that can be previewed and exported through Hydrilla.",
  ],
] as const;

function getWorldModelsJsonLd() {
  const path = "/world-models";
  const description =
    "Explore Hydrilla AI's world-model stack: BlueFox 1 for production-ready 3D assets and Water for controllable, agent-led 3D workflows.";
  const webpage = getWebPageJsonLd({
    name: "World Models for 3D Creation | Hydrilla AI",
    description,
    path,
    crumbs: [
      { name: "Product", path: "/features" },
      { name: "World Models", path },
    ],
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...((webpage as { "@graph": object[] })["@graph"] ?? []),
      {
        "@type": "ItemList",
        "@id": absoluteUrl(path) + "#models",
        name: "Hydrilla AI world models and 3D systems",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "BlueFox 1", url: absoluteUrl("/bluefox") },
          { "@type": "ListItem", position: 2, name: "Water Agent", url: absoluteUrl("/water") },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl(path) + "#faq",
        mainEntity: WORLD_MODEL_FAQS.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}

export default function WorldModelsPage() {
  return (
    <>
      <JsonLd data={getWorldModelsJsonLd()} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Spatial intelligence</p>
          <h1 className="pickle-article-title">World Models</h1>
          <div className="pickle-lead">
            <p>
              World models help AI understand the structure of a scene, not just the pixels inside it. Hydrilla brings that idea into practical 3D creation with models and workflows that turn prompts and references into editable assets.
            </p>
          </div>
          <p className="pickle-chip">From an idea to a 3D world you can work with.</p>
          <PickleActions
            primary={{ label: "Start creating", href: "/app/studio" }}
            secondary={{ label: "Explore BlueFox", href: "/bluefox" }}
          />
        </header>

        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              <strong>Hydrilla is built around useful spatial output.</strong> Generate a model, inspect it in the browser, keep its parts editable, and export it into the tools your team already uses. The goal is not only to make something that looks right, but to give artists and teams a workable starting point.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">The Hydrilla world-model stack</h2>
              <div className="pickle-text">
                <p>
                  Each layer has a clear job: BlueFox creates the asset, Water helps direct the process, and the workspace gives the result a place to be refined and used.
                </p>
              </div>
            </div>
            <PickleCards cards={MODEL_CARDS} />
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">From pixels to editable assets</h2>
              <div className="pickle-text">
                <p>
                  Hydrilla&apos;s world-model workflow starts with the inputs teams already have: a description, a reference image, or a visual direction. The output is designed to continue into a creative pipeline with parts, UVs, PBR maps, browser preview, and export options.
                </p>
              </div>
            </div>
            <PickleMediaGrid
              ratio="4 / 3"
              items={[
                {
                  src: "/features/3d1.png",
                  alt: "A text prompt and reference image being turned into a 3D asset in Hydrilla.",
                  label: <><strong>Understand</strong>Prompt and reference inputs</>,
                },
                {
                  src: "/features/3d2.png",
                  alt: "A generated 3D environment separated into editable parts.",
                  label: <><strong>Compose</strong>Parts and spatial structure</>,
                },
              ]}
            />
          </section>

          <section id="models" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Models at a glance</h2>
              <div className="pickle-text">
                <p>
                  Start with the model or workflow that matches the job. BlueFox is the direct path to a production-ready 3D asset; Water is the guided path for directing a broader creative task.
                </p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>System</th>
                      <th>Best for</th>
                      <th>Inputs</th>
                      <th>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>BlueFox 1</th>
                      <td>Direct 3D asset generation</td>
                      <td>Text prompt or image</td>
                      <td>Segmented mesh with UVs and PBR maps</td>
                    </tr>
                    <tr>
                      <th>Water Agent</th>
                      <td>Guided, iterative 3D workflows</td>
                      <td>Brief, references, and conversation</td>
                      <td>Directed Hydrilla generation workflow</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>

          <section id="faq" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">World Models FAQ</h2>
              <div className="pickle-text">
                {WORLD_MODEL_FAQS.map(([question, answer]) => (
                  <div key={question} className="mb-6 last:mb-0">
                    <h3 className="text-base font-semibold tracking-[-0.02em]">{question}</h3>
                    <p className="mt-2">{answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <PickleCta
            title="Build a world you can keep working on"
            line={
              <>
                Explore <Link href="/bluefox">BlueFox 1</Link> for direct asset generation, or open the{" "}
                <Link href="/water">Water Agent</Link> for a guided 3D workflow.
              </>
            }
            primary={{ label: "Start creating", href: "/app/studio" }}
            secondary={{ label: "Read the research", href: "/research#model-card" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
