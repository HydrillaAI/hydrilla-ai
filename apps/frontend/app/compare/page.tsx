import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleLinkCards, type PickleLinkItem } from "@/components/layout/PicklePage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Compare Hydrilla with Meshy, Tripo, Hyper3D, Trellis, Sloyd | Hydrilla AI",
  description:
    "Factual comparisons of Hydrilla with Meshy, Tripo, Hyper3D Rodin, Trellis, and Sloyd, plus a neutral guide to choosing an AI 3D generator. Dates checked.",
  ogTitle: "Compare Hydrilla",
  path: "/compare",
  absoluteTitle: true,
  keywords: [
    "best 3D AI generator",
    "AI 3D generator comparison",
    "Hydrilla vs Meshy",
    "Hydrilla vs Tripo",
    "Hydrilla vs Hyper3D Rodin",
    "Hydrilla vs Trellis",
    "Hydrilla vs Sloyd",
  ],
});

const CARDS = [
  {
    title: "Hydrilla vs Meshy",
    tileLabel: "vs Meshy",
    tileDetail: "Checked 24 Oct 2026",
    href: "/compare/meshy",
    line: "Inputs, formats, plugins, API, and agents, row by row.",
  },
  {
    title: "Hydrilla vs Tripo",
    tileLabel: "vs Tripo",
    tileDetail: "Checked 24 Oct 2026",
    href: "/compare/tripo",
    line: "Model, outputs, engine bridges, and pricing approach, row by row.",
  },
  {
    title: "Hydrilla vs Hyper3D",
    tileLabel: "vs Hyper3D",
    tileDetail: "Checked 24 Oct 2026",
    href: "/compare/hyper3d",
    line: "BlueFox next to Rodin on inputs, formats, and developer access.",
  },
  {
    title: "Hydrilla vs Trellis",
    tileLabel: "vs Trellis",
    tileDetail: "Checked 24 Oct 2026",
    href: "/compare/trellis",
    line: "Managed studio workspace with BlueFox next to open-weights checkpoints.",
  },
  {
    title: "Hydrilla vs Sloyd",
    tileLabel: "vs Sloyd",
    tileDetail: "Checked 24 Oct 2026",
    href: "/compare/sloyd",
    line: "Open-domain segmented meshes next to parametric templates and generators.",
  },
  {
    title: "How to choose an AI 3D generator",
    tileLabel: "How to choose",
    tileDetail: "Ten criteria",
    href: "/compare/how-to-choose",
    line: "Ten criteria and a bake-off method for any tool you are weighing.",
  },
] satisfies PickleLinkItem[];

export default function ComparePage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/compare")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <h1 className="pickle-article-title" data-wide="true">
            Compare Hydrilla with other AI 3D tools
          </h1>
          <div className="pickle-lead">
            <p>How Hydrilla AI and BlueFox, Hydrilla&apos;s 3D model, differ from other generators, plus a neutral buying guide.</p>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              Choosing an AI 3D tool is <strong>a pipeline decision, not a demo decision</strong>. These pages set Hydrilla next to other generators row by row, using each company&apos;s own public pages, so you can see the differences that matter to a studio before you run your own test.
            </p>
          </div>

          <section className="pickle-section">
            <PickleLinkCards items={CARDS} />
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">How we compare</h2>
            <div className="pickle-text">
              <p>
                Every row comes from each company&apos;s public pages, dated when we checked. We give no scores, imply no relationship, and ask you to confirm details on each product&apos;s own site. Products change quickly, so each page carries the date of its last check, and we update the rows when we find a change.
              </p>
            </div>
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Test in your own scene</h2>
            <div className="pickle-text">
              <p>
                A table tells you what a tool offers. Only your own scene tells you how the output behaves under your lighting, in your engine, against your budget. The{" "}
                <Link href="/compare/how-to-choose">buying guide</Link> sets out a fair way to run that test with any tool.
              </p>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
