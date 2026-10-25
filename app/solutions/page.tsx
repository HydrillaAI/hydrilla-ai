import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleLinkCards, type PickleLinkItem } from "@/components/layout/PicklePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { createPageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "How teams use Hydrilla and BlueFox for game assets, film previs, architectural visualization, XR, and product visualization.";

export const metadata = createPageMetadata({
  title: "AI 3D Use Cases: Games, Film, Architecture, XR | Hydrilla AI",
  description: DESCRIPTION,
  ogTitle: "Hydrilla by industry",
  path: "/solutions",
  absoluteTitle: true,
});

const CARDS = [
  {
    title: "Game development",
    href: "/solutions/games",
    imageSrc: "/industrypower/dino.png",
    imageAlt: "Pencil sketch of a winged dragon.",
    imageFit: "contain",
    imageTone: "dark",
    line: "Level dressing and prop sets that fill a level while the layout is still changing.",
  },
  {
    title: "Film and animation",
    href: "/solutions/film",
    imageSrc: "/industrypower/films&a.png",
    imageAlt: "Pencil sketch of a film crew filming with a camera on a dolly.",
    imageFit: "contain",
    imageTone: "dark",
    line: "Set pieces and props for previs, layout, and background dressing.",
  },
  {
    title: "Architecture and interiors",
    href: "/solutions/architecture",
    imageSrc: "/industrypower/architecture.png",
    imageAlt: "Pencil sketch of a two-story house with a front porch.",
    imageFit: "contain",
    imageTone: "dark",
    line: "Furniture and fixtures that dress rooms for presentations and reviews.",
  },
  {
    title: "AR, VR, and XR",
    href: "/solutions/xr",
    imageSrc: "/industrypower/arvr1.png",
    imageAlt: "Pencil sketch of a low-poly farm scene floating under a geodesic sphere.",
    imageFit: "contain",
    imageTone: "dark",
    line: "Objects for headsets and spatial apps, checked against a frame budget.",
  },
  {
    title: "Product visualization",
    href: "/solutions/product",
    imageSrc: "/industrypower/lampprop.png",
    imageAlt: "Pencil sketch of an adjustable desk lamp.",
    imageFit: "contain",
    imageTone: "dark",
    line: "Product photos turned into 3D for web viewers, campaigns, and AR.",
  },
] satisfies PickleLinkItem[];

export default function SolutionsPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/solutions")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Solutions</p>
          <h1 className="pickle-article-title" data-wide="true">
            Hydrilla AI 3D by industry
          </h1>
          <div className="pickle-lead">
            <p>
              Five ways teams put BlueFox, Hydrilla&apos;s 3D model, to work in Hydrilla AI, each with its fit, limits, and tools.
            </p>
          </div>
        </header>

        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              <strong>Every industry asks something different of a 3D asset.</strong> A game prop has a polygon budget, a previs set piece has a camera distance, a furnished room has a client review, and a product model has a spec sheet. Each page below starts from those demands and is honest about where generation helps and where an artist still leads.
            </p>
          </div>

          <section className="pickle-section">
            <PickleLinkCards items={CARDS} />
          </section>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">What every team gets</h2>
            <div className="pickle-text">
              <p>
                Whichever industry you work in, the workspace is the same: generate from a prompt or a picture, review in the browser, and bring the result into your own tools. The{" "}
                <Link href="/features">features page</Link> shows that workflow end to end.
              </p>
            </div>
          </section>

          <PickleCta
            line={
              <>
                Rolling out across a studio? <Link href="/enterprise">See Enterprise</Link>
              </>
            }
            secondary={{ label: "Talk to our team", href: "/enterprise#contact" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
