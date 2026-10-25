"use client";

import { useEffect } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getKitJsonLd } from "@/lib/kit-schema";
import Link from "next/link";
import {
  PickleArticlePage,
  type PickleRelatedItem,
} from "@/components/layout/PicklePage";

const RELATED: PickleRelatedItem[] = [
  {
    title: "Privacy Policy",
    subtitle: "How Hydrilla AI collects, uses, and protects your account and service information.",
    href: "/privacy-policy",
    date: "Jul 14, 2026",
    author: "Hydrilla Legal",
    thumbVariant: "privacy-enclave",
  },
  {
    title: "Terms of Service",
    subtitle: "Account terms, generated asset ownership, and acceptable use on Hydrilla.",
    href: "/terms-and-conditions",
    date: "Jul 14, 2026",
    author: "Hydrilla Legal",
    thumbVariant: "docs-flow",
  },
];

export default function CookiePolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
    <JsonLd data={getKitJsonLd("/cookies")} />
    <PickleArticlePage
      kicker="Legal"
      kickerHref="/security"
      title="Cookie Policy"
      date="Effective [EFFECTIVE DATE]"
      author="Hydrilla Legal"
      ctaLabel="Contact Privacy"
      ctaHref="mailto:founders@hydrilla.ai"
      relatedItems={RELATED}
    >
      <div className="pickle-text">
        <p>
          This Cookie Policy explains how Hydrilla AI uses cookies and similar technologies on hydrilla.ai and in the Hydrilla workspace, what each category does, and how you can control them. It should be read together with our <Link href="/privacy">Privacy Policy</Link>, which explains how we handle personal information more generally.
        </p>
      </div>

      <nav aria-label="On this page" className="pickle-legal-toc">
        <p className="pickle-legal-toc-title">On this page</p>
        <ol>
          <li>
            <a href="#what-are-cookies">1. What cookies are</a>
          </li>
          <li>
            <a href="#categories">2. The cookies we use</a>
          </li>
          <li>
            <a href="#your-choices">3. Your choices</a>
          </li>
          <li>
            <a href="#plugins">4. Plugins, the MCP server, and the API</a>
          </li>
          <li>
            <a href="#changes">5. Changes to this policy</a>
          </li>
          <li>
            <a href="#contact">6. Contact</a>
          </li>
        </ol>
      </nav>

      <section id="what-are-cookies" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">1. What cookies are</h2>
        <div className="pickle-text">
          <p>
            Cookies are small text files that a website stores in your browser. Similar technologies, such as local storage and session storage, keep information on your device in the same way. Together they let a site keep you signed in, remember your settings, and understand how it is used. In this policy, &quot;cookies&quot; covers all of these technologies.
          </p>
          <p>
            Some cookies are set by us (first-party cookies). Others are set by service providers that help us run the site (third-party cookies), and those providers act on our behalf.
          </p>
        </div>
      </section>

      <section id="categories" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">2. The cookies we use</h2>
        <div className="pickle-text">
          <p>
            We keep our use of cookies small and focused on signing in, the workspace, and reliability. We do not use advertising cookies, and we do not allow third parties to use cookies on our site to build advertising profiles [CONFIRM NO ADVERTISING COOKIES].
          </p>
        </div>
        <div className="pickle-card-surface">
          <table className="pickle-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>What it does</th>
                <th>Provider</th>
                <th>Can you switch it off?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Strictly necessary</th>
                <td>Keeps you signed in, secures your session, and gives you access to your workspace</td>
                <td>Hydrilla AI and Clerk</td>
                <td>No, the Service cannot work without it</td>
              </tr>
              <tr>
                <th>Functional</th>
                <td>Remembers workspace settings such as the viewport, theme, and the local Bridge connection state</td>
                <td>Hydrilla AI (local storage)</td>
                <td>Yes, through your browser, but settings will reset</td>
              </tr>
              <tr>
                <th>Analytics</th>
                <td>Measures reliability, page speed, and how features are used in aggregate, so we can improve the Service</td>
                <td>PostHog, Google Analytics, and Vercel Analytics</td>
                <td>Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pickle-text">
          <p>
            A current list of the individual cookies, their providers, and how long each one lasts is available at [COOKIE LIST].
          </p>
        </div>
      </section>

      <section id="your-choices" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">3. Your choices</h2>
        <div className="pickle-text">
          <p>
            Where the law requires consent, such as in the European Economic Area and the United Kingdom, we ask before setting cookies that are not strictly necessary [CONFIRM CONSENT BANNER]. Your choice can be updated whenever you like through [COOKIE SETTINGS LINK], and saying no to analytics cookies leaves every feature of the Service working.
          </p>
          <p>
            Your browser settings also let you block or delete cookies. Most browsers let you refuse new cookies, delete existing ones, or alert you before a cookie is stored. If you block strictly necessary cookies, you will not be able to sign in or use the workspace. Browser &quot;Do Not Track&quot; signals are not consistently defined, so we rely on the choices above instead [CONFIRM DO NOT TRACK HANDLING].
          </p>
        </div>
      </section>

      <section id="plugins" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">4. Plugins, the MCP server, and the API</h2>
        <div className="pickle-text">
          <p>
            Our plugins, the MCP server, and the REST API run outside your browser. They authenticate with your account sign-in or an API key, as described on <Link href="/integrations#sign-in">integrations</Link>. When you sign in to a plugin through the browser, the strictly necessary cookies above are used for that sign-in. Information the plugins and API send is handled as described in our Privacy Policy.
          </p>
        </div>
      </section>

      <section id="changes" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">5. Changes to this policy</h2>
        <div className="pickle-text">
          <p>
            We will update this policy when the cookies we use change, and post the new version here with a new effective date. If we add a category that needs your consent, we will ask for it again.
          </p>
        </div>
      </section>

      <section id="contact" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">6. Contact</h2>
        <div className="pickle-text">
          <p>
            Questions about cookies or browser storage? Email founders@hydrilla.ai, or write to Hydrilla AI Pvt Ltd, 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India.
          </p>
        </div>
      </section>
    </PickleArticlePage>
    </>
  );
}
