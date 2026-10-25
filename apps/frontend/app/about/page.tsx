import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleFlow } from "@/components/layout/PicklePage";

export default function AboutPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/about")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Company</p>
          <h1 className="pickle-article-title">About Hydrilla</h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI is an AI 3D workspace for studio and artist pipelines. We build the Hydrilla workspace and BlueFox, Hydrilla&apos;s 3D model. Despite the name, we&apos;re a software company, not the aquatic plant.
            </p>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              This page sets out <strong>how the company, its research lab, and its products fit together</strong>, so it is always clear who builds what. The people behind them are on the team page linked at the end.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">What we build</h2>
            <div className="pickle-text">
              <p>
                Hydrilla is one workspace with three parts. <Link href="/bluefox">BlueFox</Link> is our 3D model, which turns prompts and pictures into segmented models with UVs and textures.{" "}
                <Link href="/water">Water Agent</Link> works through whole sets of assets with artists, from the first brief to the finished pieces. And the{" "}
                <Link href="/features">workspace</Link> ties generation, review, and handoff together in the browser and in your tools.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">One company, its research lab, and its model</h2>
              <div className="pickle-text">
                <p>
                  Hydrilla AI is the product and company; Hawan Research Labs is its research lab. The lab is where our 3D research and experimentation happen, and it builds BlueFox. Read about{" "}
                  <Link href="/research">Hawan Research Labs</Link>.
                </p>
              </div>
            </div>
            <PickleFlow
              direction="column"
              label="Diagram of three stacked nodes: Hydrilla AI at the top, Hawan Research Labs beneath it, and BlueFox beneath the lab."
              steps={[
                { title: "Hydrilla AI", detail: "company and product", emphasis: true },
                { title: "Hawan Research Labs", detail: "its research lab" },
                { title: "BlueFox", detail: "Hydrilla's 3D model" },
              ]}
            />
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">How we work</h2>
            <div className="pickle-text">
              <p>
                We build for professional artists and studios, so we aim to be precise about what our tools do and where they stop. Our model&apos;s limits are published on the{" "}
                <Link href="/bluefox#limits">BlueFox page</Link>, and the <Link href="/security">security page</Link> explains how your work is handled.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Company facts</h2>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th>Fact</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Company</th>
                      <td>Hydrilla AI</td>
                    </tr>
                    <tr>
                      <th>Founders</th>
                      <td>Tharak Nagaveti, Dharani Kumar, and Tejesh Varma</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>
          <PickleCta
            line={
              <>
                Want to see who builds Hydrilla, or work with us? Meet the <Link href="/team">team</Link>, or see how we{" "}
                <Link href="/careers">hire</Link>.
              </>
            }
            primary={{ label: "Meet the team", href: "/team" }}
            secondary={{ label: "See open roles", href: "/careers" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
