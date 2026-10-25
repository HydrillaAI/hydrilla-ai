import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleFlow } from "@/components/layout/PicklePage";

export default function SecurityPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/security")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Trust</p>
          <h1 className="pickle-article-title" data-wide="true">
            How Hydrilla protects your studio assets
          </h1>
          <div className="pickle-lead">
            <p>
              Hydrilla AI protects the keys to your account, keeps your work inside your AI 3D workspace, and hands files to your pipeline.
            </p>
          </div>
          <div className="pickle-article-meta">
            <span>Oct 1, 2026</span>
            <span className="pickle-meta-divider" aria-hidden="true" />
            <span>Hydrilla Team</span>
          </div>
        </header>
        <div className="pickle-article-column">
          <PickleFlow
            label="Where your work lives: you sign in to your own workspace, generated meshes stay scoped to it, and exports move into your pipeline."
            steps={[
              { title: "Signed-in account", detail: "One session per user" },
              { title: "Your workspace", detail: "Generated meshes stay scoped here" },
              { title: "Your pipeline", detail: "Exports you download", emphasis: true },
            ]}
          />

          <div className="pickle-intro">
            <p>
              Work made in a 3D workspace is often unreleased: concept images, briefs for unannounced projects, and the assets that come from them. This page sets out, in plain terms, <strong>how that work is handled</strong>. It is a summary for reviewers; the{" "}
              <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms</Link> are the binding documents.
            </p>
          </div>

          <section className="pickle-head-block">
            <h2 className="pickle-h2">Your data doesn&apos;t train our models</h2>
            <div className="pickle-text">
              <p>
                We don&apos;t use your data to train our models. That holds for every account on every plan, including your prompts, the reference images you upload, and the models you generate.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Accounts and stored assets</h2>
            <div className="pickle-text">
              <p>
                Sign-in runs through Clerk, and each session belongs to one user. Generated meshes stay scoped to your workspace. Your data is stored securely, and reaching it takes a signed-in account.
              </p>
              <ul>
                <li>Signed-in pages are kept out of search engines</li>
                <li>API keys are created and managed from your account</li>
              </ul>
              <p>
                Treat API keys like passwords. Keep them on a server, never in a client app or a shared document, and manage them from your account if you think one has been exposed.
              </p>
            </div>
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">What happens after export</h2>
            <div className="pickle-text">
              <p>
                Once you download an export, the file lives in your own pipeline, under your studio&apos;s own controls. Files sent to a plugin over the local Bridge travel on your machine to the tool you have open.
              </p>
            </div>
          </section>

          <PickleCta
            title="Questionnaires and vendor reviews"
            line={
              <>
                For a questionnaire or vendor review, use Contact security below, or{" "}
                <Link href="/enterprise#contact">talk to our team</Link>. Tell us your studio, the review you are running, and when you need answers, and we will reply in writing with what we can confirm.
              </>
            }
            primary={{ label: "Contact security", href: "mailto:founders@hydrilla.ai" }}
            secondary={{ label: "Talk to our team", href: "/enterprise#contact" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
