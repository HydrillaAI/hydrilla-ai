import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta, PickleQA } from "@/components/layout/PicklePage";

export default function FaqPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/faq")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Resources</p>
          <h1 className="pickle-article-title" data-wide="true">
            Frequently asked questions
          </h1>
          <div className="pickle-lead">
            <p>Straight answers on owning what you make in Hydrilla AI, running your account, and getting help.</p>
          </div>
        </header>
        <div className="pickle-article-column">
          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Licensing and ownership</h2>
            </div>
            <PickleQA
              items={[
                {
                  q: "Do I own the 3D models I generate?",
                  a: (
                    <>
                      Hydrilla&apos;s Terms of Service cover ownership of the 3D assets you generate. The{" "}
                <Link href="/terms#ownership">ownership section of the Terms</Link> has the exact wording.
                    </>
                  ),
                },
                {
                  q: <>Can I upload reference images I didn&apos;t create?</>,
                  a: (
                    <>
                      Only upload images you have the right to use. The <Link href="/terms">Terms</Link> apply to everything you upload.
                    </>
                  ),
                },
              ]}
            />
          </section>
          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Accounts and data</h2>
            </div>
            <PickleQA
              items={[
                {
                  q: "How do I sign in?",
                  a: (
                    <>
                      You sign in to Studio with your Hydrilla account. How each plugin signs in is listed on{" "}
                <Link href="/integrations#sign-in">integrations</Link>. <Link href="/security">Sign-in security</Link>
                    </>
                  ),
                },
                {
                  q: "Can I delete my work or my account?",
                  a: "To close your account or ask for its data to be deleted, write to founders@hydrilla.ai from your account email.",
                },
                {
                  q: "Where can I read how my data is handled?",
                  a: (
                    <>
                      The <Link href="/privacy">Privacy Policy</Link> covers personal data. The <Link href="/security">security page</Link> covers model training, accounts, stored assets, and exports for studio reviewers.
                    </>
                  ),
                },
              ]}
            />
          </section>
          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Support</h2>
            </div>
            <PickleQA
              items={[
                {
                  q: "How do I get help?",
                  a: (
                    <>
                      Email founders@hydrilla.ai or use the <Link href="/contact">contact form</Link>. For a generation problem, include your account email, the workspace, and a screenshot.
                    </>
                  ),
                },
                {
                  q: <>Where should I start if I&apos;m new?</>,
                  a: (
                    <>
                      Follow the steps in the <Link href="/docs">docs</Link>, from sign-up to a first import in your own tools.
                    </>
                  ),
                },
              ]}
            />
          </section>
          <PickleCta secondary={{ label: "Contact support", href: "/contact" }} />
        </div>
      </article>
      <Footer />
    </>
  );
}
