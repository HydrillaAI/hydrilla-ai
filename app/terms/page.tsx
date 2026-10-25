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
    title: "Cookie Policy",
    subtitle: "How Hydrilla uses essential, functional, and analytics cookies.",
    href: "/cookie-policy",
    date: "Jul 14, 2026",
    author: "Hydrilla Legal",
    thumbVariant: "docs-flow",
  },
];

export default function TermsAndConditionsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
    <JsonLd data={getKitJsonLd("/terms")} />
    <PickleArticlePage
      kicker="Legal"
      kickerHref="/security"
      title="Terms of Service"
      date="Effective [EFFECTIVE DATE]"
      author="Hydrilla Legal"
      ctaLabel="Contact Legal"
      ctaHref="mailto:founders@hydrilla.ai"
      relatedItems={RELATED}
    >
      <div className="pickle-text">
        <p>
          These Terms of Service (&quot;Terms&quot;) are an agreement between you and Hydrilla AI Pvt Ltd, registered at 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India (&quot;Hydrilla AI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). They govern your use of our websites, the Hydrilla workspace, Water Agent, our plugins, the MCP server, and the REST API (together, the &quot;Service&quot;). By creating an account or using the Service, you agree to these Terms. If you use the Service on behalf of a company or studio, you confirm that you have authority to bind it, and &quot;you&quot; includes that organisation.
        </p>
      </div>

      <div className="pickle-card-surface pickle-legal-summary">
        <h2 className="pickle-h3">Summary</h2>
        <div className="pickle-text">
          <p>
            This summary is for convenience. The full Terms below are what apply.
          </p>
          <ul>
            <li>You keep ownership of what you upload, and you own the 3D outputs you generate, subject to these Terms.</li>
            <li>We do not use your content to train our models.</li>
            <li>Paid plans renew each billing period until you cancel. Credits reset each billing month and do not carry over.</li>
            <li>The 14-day trial needs a card.</li>
            <li>Use the Service lawfully, respect other people&apos;s rights, and do not misuse the Service.</li>
          </ul>
        </div>
      </div>

      <nav aria-label="On this page" className="pickle-legal-toc">
        <p className="pickle-legal-toc-title">On this page</p>
        <ol>
          <li>
            <a href="#service">1. The Service</a>
          </li>
          <li>
            <a href="#accounts">2. Eligibility and accounts</a>
          </li>
          <li>
            <a href="#billing">3. Plans, credits, and billing</a>
          </li>
          <li>
            <a href="#trial">4. Free trial</a>
          </li>
          <li>
            <a href="#cancellation">5. Cancellation and refunds</a>
          </li>
          <li>
            <a href="#ownership">6. Your content and ownership of outputs</a>
          </li>
          <li>
            <a href="#acceptable-use">7. Acceptable use</a>
          </li>
          <li>
            <a href="#intellectual-property">8. Our intellectual property</a>
          </li>
          <li>
            <a href="#copyright">9. Copyright complaints</a>
          </li>
          <li>
            <a href="#third-party">10. Third-party software and services</a>
          </li>
          <li>
            <a href="#availability">11. Availability and changes</a>
          </li>
          <li>
            <a href="#disclaimers">12. Disclaimers</a>
          </li>
          <li>
            <a href="#liability">13. Limitation of liability</a>
          </li>
          <li>
            <a href="#indemnity">14. Indemnity</a>
          </li>
          <li>
            <a href="#termination">15. Suspension and termination</a>
          </li>
          <li>
            <a href="#governing-law">16. Governing law and disputes</a>
          </li>
          <li>
            <a href="#changes">17. Changes to these Terms</a>
          </li>
          <li>
            <a href="#general">18. General</a>
          </li>
          <li>
            <a href="#contact">19. Contact</a>
          </li>
        </ol>
      </nav>

      <section id="service" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">1. The Service</h2>
        <div className="pickle-text">
          <p>
            Hydrilla AI is an AI 3D workspace. It lets you generate 3D models from text and images with BlueFox, Hydrilla&apos;s 3D model, review them in the browser, work with Water Agent, and use the results in your own tools through downloads, plugins, the MCP server, and the REST API. We improve the Service continually, so features may change, and we may add or remove features. If we remove a feature that is central to a paid plan, we will give you reasonable notice.
          </p>
        </div>
      </section>

      <section id="accounts" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">2. Eligibility and accounts</h2>
        <div className="pickle-text">
          <p>
            You must be at least [MINIMUM AGE] to use the Service, and old enough to form a binding contract where you live, or have the consent of a parent or guardian where the law allows it. You may not use the Service if the law prohibits you from doing so.
          </p>
          <p>
            You need an account to use most of the Service. Give us accurate information and keep it up to date. Keep your sign-in details and API keys confidential, because you are responsible for all activity under your account and keys. Tell us at founders@hydrilla.ai straight away if you believe your account or a key has been compromised.
          </p>
          <p>
            If you use a shared workspace, the workspace owner controls who has access and may be able to view, manage, or remove Content in it.
          </p>
        </div>
      </section>

      <section id="billing" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">3. Plans, credits, and billing</h2>
        <div className="pickle-text">
          <p>
            <strong>Plans.</strong>{" "}We offer a Free plan and paid Monthly and Hourly plans, as described on our <Link href="/pricing">pricing page</Link>. Hourly plans let you generate only during the daily window that comes with the plan. Prices, plan contents, and credit costs are shown on the pricing page and at checkout.
          </p>
          <p>
            <strong>Credits.</strong>{" "}Generations use credits from your plan&apos;s monthly allowance, at the costs shown on the pricing page. Allowances reset at the start of each billing month, and unused credits do not carry over. Credits have no cash value, cannot be transferred or sold, and are not refundable except where these Terms or the law say otherwise.
          </p>
          <p>
            <strong>Billing and renewal.</strong>{" "}Paid plans are billed in advance for each billing period and renew automatically until you cancel. By starting a paid plan, you authorise us and our payment provider to charge your payment method for each period. Prices exclude taxes unless stated, and you are responsible for applicable taxes such as VAT or GST. If a payment fails, we may suspend paid features until it succeeds.
          </p>
          <p>
            <strong>Price changes.</strong>{" "}We may change prices. A change applies from your next billing period after we give you notice, and you can cancel before it takes effect.
          </p>
        </div>
      </section>

      <section id="trial" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">4. Free trial</h2>
        <div className="pickle-text">
          <p>
            You can try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card. Unless you cancel before the trial ends, your plan continues as a paid subscription and your card is charged for the first billing period [TRIAL CONVERSION TERMS]. We may limit trials to one per person or organisation, and we may end a trial early if we see misuse.
          </p>
        </div>
      </section>

      <section id="cancellation" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">5. Cancellation and refunds</h2>
        <div className="pickle-text">
          <p>
            You can cancel a paid plan at any time from your account or by writing to founders@hydrilla.ai. Cancellation takes effect at the end of the current billing period [CONFIRM CANCELLATION TIMING], and you keep paid features until then. After that, your account moves to the Free plan unless you close it.
          </p>
          <p>
            [REFUND TERMS]
          </p>
          <p>
            Nothing in these Terms removes refund or cancellation rights that consumer law in your country gives you.
          </p>
        </div>
      </section>

      <section id="ownership" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">6. Your content and ownership of outputs</h2>
        <div className="pickle-text">
          <p>
            <strong>Your inputs.</strong>{" "}You keep all rights in the prompts, images, files, and briefs you submit (&quot;Inputs&quot;).
          </p>
          <p>
            <strong>Your outputs.</strong>{" "}As between you and us, and to the extent the law allows, you own the 3D models, textures, and other results the Service generates for you (&quot;Outputs&quot;), and you may use them for personal and commercial purposes. Inputs and Outputs together are &quot;Content&quot;. Because AI models can produce similar results for similar requests, other users may receive Outputs that resemble yours, and those Outputs are not yours. The law on ownership of AI-generated material differs between countries and is still developing, so we do not promise that Outputs are protected by copyright where you are.
          </p>
          <p>
            <strong>Permission you give us.</strong>{" "}You give us a worldwide, non-exclusive, royalty-free permission to host, store, copy, process, and display your Content only as needed to provide, secure, and support the Service for you. We do not use your Content to train our models, and we do not sell it or make it public.
          </p>
          <p>
            <strong>Your responsibility.</strong>{" "}You confirm that you have the rights needed to submit your Inputs, and that your Inputs and your use of Outputs do not break the law or infringe anyone&apos;s rights. Review Outputs before you rely on them, and check that they are suitable for your purpose.
          </p>
        </div>
      </section>

      <section id="acceptable-use" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">7. Acceptable use</h2>
        <div className="pickle-text">
          <p>
            Use the Service lawfully and respectfully. You must not use it to create, upload, or share:
          </p>
          <ul>
            <li>Sexual content involving minors, or any content that sexualises or exploits children</li>
            <li>Sexually explicit material, or depictions of real people that are intimate, degrading, or made without their consent</li>
            <li>Content that harasses, threatens, or promotes violence or hatred against people or groups based on who they are</li>
            <li>Content that infringes copyright, trademarks, or other rights, including prompts or reference images designed to reproduce someone else&apos;s protected work or brand</li>
            <li>Content that promotes terrorism, self-harm, or illegal goods and activities</li>
            <li>Deceptive content that could cause real-world harm, or other people&apos;s private information shared without a right to do so</li>
          </ul>
          <p>
            You must also not:
          </p>
          <ul>
            <li>Access or try to access the Service, other accounts, or our systems without permission, or test their security without our written agreement</li>
            <li>Interfere with or overload the Service, or get around credit limits, usage windows, or other restrictions</li>
            <li>Use bots, scrapers, or other automated means to access the Service, other than our API and MCP server within their limits</li>
            <li>Copy, reverse engineer, or extract our models, weights, or source code, except where the law allows it despite this restriction (a model we publish separately, for example on Hugging Face, is governed by the license published with it)</li>
            <li>Use the Service or its Outputs to build a competing AI 3D model or service</li>
            <li>Resell, sublicense, or share access to your account, or share API keys outside your organisation, without our written agreement</li>
          </ul>
          <p>
            We may remove Content, suspend features, or close accounts that break these rules, and we may report illegal content to the authorities.
          </p>
        </div>
      </section>

      <section id="intellectual-property" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">8. Our intellectual property</h2>
        <div className="pickle-text">
          <p>
            The Service, including its software, models, design, and brand, belongs to Hydrilla AI and its licensors. We give you a limited, non-exclusive, non-transferable right to use the Service under these Terms while your account is in good standing. &quot;Hydrilla&quot;, &quot;BlueFox&quot;, &quot;Water Agent&quot;, and our logos are trademarks of Hydrilla AI [CONFIRM TRADEMARK STATUS]. Do not use them in a way that suggests we endorse you without our written permission.
          </p>
          <p>
            If you send us feedback or suggestions, we may use them without obligation to you.
          </p>
        </div>
      </section>

      <section id="copyright" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">9. Copyright complaints</h2>
        <div className="pickle-text">
          <p>
            We respect intellectual property rights and respond to clear notices of infringement. To report material on the Service that you believe infringes your copyright, write to [COPYRIGHT AGENT CONTACT] and include: your contact details; a description of the work you say is infringed; where the material appears in the Service; a statement that you believe in good faith the use is not authorised; a statement that the information in your notice is accurate and that you are the owner or authorised to act for the owner; and your physical or electronic signature.
          </p>
          <p>
            If we remove Content after a notice, we will tell the user, who may send a counter-notice if they believe the removal was a mistake. We close the accounts of repeat infringers where appropriate.
          </p>
        </div>
      </section>

      <section id="third-party" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">10. Third-party software and services</h2>
        <div className="pickle-text">
          <p>
            Our plugins run inside software made by other companies, such as DCC tools and game engines, and the MCP server runs inside an AI client you choose. That software is provided by its makers under their own terms. We are not responsible for third-party software, and changes to it may affect how our plugins work.
          </p>
        </div>
      </section>

      <section id="availability" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">11. Availability and changes</h2>
        <div className="pickle-text">
          <p>
            We work to keep the Service available and reliable, but we do not promise that it will be uninterrupted, error-free, or available at all times. We may carry out maintenance, and we may change, suspend, or discontinue parts of the Service. Keep your own copies of Outputs you need; downloaded files stay with you.
          </p>
        </div>
      </section>

      <section id="disclaimers" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">12. Disclaimers</h2>
        <div className="pickle-text">
          <p>
            The Service and Outputs are provided &quot;as is&quot; and &quot;as available&quot;. To the fullest extent the law allows, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. AI-generated Outputs can be inaccurate, incomplete, or unsuitable for your purpose, and they are not a substitute for engineering, manufacturing, or other professional data. Some countries do not allow certain disclaimers, so some of these may not apply to you.
          </p>
        </div>
      </section>

      <section id="liability" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">13. Limitation of liability</h2>
        <div className="pickle-text">
          <p>
            To the fullest extent the law allows, Hydrilla AI will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or goodwill, arising from or related to the Service or these Terms. Our total liability for all claims relating to the Service or these Terms will not exceed the amount you paid us for the Service in the twelve months before the event giving rise to the claim.
          </p>
          <p>
            Nothing in these Terms limits liability that cannot be limited by law, such as liability for fraud, or for death or personal injury caused by negligence.
          </p>
        </div>
      </section>

      <section id="indemnity" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">14. Indemnity</h2>
        <div className="pickle-text">
          <p>
            If you use the Service for business purposes, you agree to defend and indemnify Hydrilla AI against third-party claims, and related costs, arising from your Content, your use of the Service, or your breach of these Terms, to the extent the law allows.
          </p>
        </div>
      </section>

      <section id="termination" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">15. Suspension and termination</h2>
        <div className="pickle-text">
          <p>
            You can stop using the Service at any time, and you can close your account by writing to founders@hydrilla.ai. We may suspend or close your account, with notice where practical, if you seriously or repeatedly break these Terms, if we must do so by law, or if your use creates a risk for the Service or other users. When an account closes, your right to use the Service ends, and we delete your Content as described in our <Link href="/privacy">Privacy Policy</Link>. Sections that by their nature should continue, such as ownership, disclaimers, liability, and governing law, survive termination.
          </p>
        </div>
      </section>

      <section id="governing-law" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">16. Governing law and disputes</h2>
        <div className="pickle-text">
          <p>
            These Terms are governed by the laws of [GOVERNING LAW JURISDICTION], without regard to conflict-of-law rules. Before starting any formal proceeding, please contact us at founders@hydrilla.ai so we can try to resolve the issue informally. If we cannot, disputes will be resolved by [DISPUTE RESOLUTION METHOD AND VENUE]. If you are a consumer, you keep the protection of the mandatory laws of the country where you live, and you may bring proceedings in its courts.
          </p>
        </div>
      </section>

      <section id="changes" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">17. Changes to these Terms</h2>
        <div className="pickle-text">
          <p>
            We may update these Terms. We will post the new version on this page with a new effective date, and if a change is material, we will tell you in advance by email or in the Service. If you keep using the Service after a change takes effect, the updated Terms apply. If you do not agree, stop using the Service and cancel any paid plan before the change takes effect.
          </p>
        </div>
      </section>

      <section id="general" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">18. General</h2>
        <div className="pickle-text">
          <p>
            These Terms, together with our <Link href="/privacy">Privacy Policy</Link>, <Link href="/cookies">Cookie Policy</Link>, and any order form or written agreement we sign with you, are the whole agreement between you and us about the Service. If a signed agreement conflicts with these Terms, the signed agreement applies. If any part of these Terms is found unenforceable, the rest remains in effect. Our failure to enforce a provision is not a waiver. You may not transfer these Terms without our consent; we may transfer them as part of a merger, acquisition, or sale of assets. Neither party is liable for delays caused by events beyond its reasonable control.
          </p>
        </div>
      </section>

      <section id="contact" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">19. Contact</h2>
        <div className="pickle-text">
          <p>
            Questions about these Terms? Contact Hydrilla AI Pvt Ltd, 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India, or email founders@hydrilla.ai.
          </p>
        </div>
      </section>
    </PickleArticlePage>
    </>
  );
}
