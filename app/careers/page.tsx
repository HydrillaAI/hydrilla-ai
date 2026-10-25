import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCards, PickleCta } from "@/components/layout/PicklePage";

export default function CareersPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/careers")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Company</p>
          <h1 className="pickle-article-title" data-wide="true">
            Careers at Hydrilla
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI is a small team building an AI 3D workspace for artists and studios: meshes, materials, exports, and the software around them.
            </p>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              The work sits <strong>where research meets production</strong>. Every feature has to survive contact with a real pipeline, which means engineers, researchers, and artists review the same results and hold them to the same standard.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Who we hire</h2>
              <div className="pickle-text">
                <p>
                  We hire people who care about craft on both sides of the screen: those who write the software and those who judge the 3D it produces.
                </p>
              </div>
            </div>
            <PickleCards
              titleAs="p"
              cards={[
                {
                  icon: "api",
                  title: "Engineering",
                  body: "Full-stack product, 3D runtime, and generation infrastructure.",
                },
                {
                  icon: "research",
                  title: "3D and research",
                  body: <>Model quality, mesh structure, materials, and evaluation for BlueFox, Hydrilla&apos;s 3D model.</>,
                },
              ]}
            />
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">What we look for</h2>
            <div className="pickle-text">
              <p>
                Show us work you are proud of, whether that is a shipped product, a research project, a tool you built for yourself, or a portfolio of 3D. We care more about what you have made and how you think about it than about titles.
              </p>
            </div>
          </section>

          <PickleCta
            title="How to apply"
            line={
              <>
                Email founders@hydrilla.ai with the subject &quot;Careers / your name&quot;, links to your work, and your location, even if no role fits yet. Meet the{" "}
                <Link href="/team">team</Link> or read <Link href="/about">about Hydrilla</Link> first.
              </>
            }
            primary={{ label: "Email your application", href: "mailto:founders@hydrilla.ai?subject=Careers%20%2F%20" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
