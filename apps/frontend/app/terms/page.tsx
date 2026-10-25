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
    href: "/privacy",
    date: "Oct 26, 2026",
    author: "Hydrilla Legal",
    thumbVariant: "privacy-enclave",
  },
  {
    title: "Cookie Policy",
    subtitle: "How Hydrilla uses essential, functional, and analytics cookies.",
    href: "/cookies",
    date: "Oct 26, 2026",
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
      date="Effective October 26, 2026"
      author="Hydrilla Legal"
      ctaLabel="Contact Legal"
      ctaHref="mailto:founders@hydrilla.ai"
      relatedItems={RELATED}
    >
      <div className="pickle-text">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the platform provided by Hydrilla AI Private Limited, registered at 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India (&quot;Hydrilla AI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Hydrilla AI is an AI-powered 3D workspace that enables users to generate 3D models and textures from text and images with BlueFox, work with Water Agent, and use the results through downloads, plugins, the MCP server, and the REST API, together with a community for sharing work (collectively, the &quot;Service&quot;).
          </p>
          <p>
            You may enter into a separate order form or written agreement with us that references and incorporates these Terms (an &quot;Order&quot;). Together with any Order, our <Link href="/privacy">Privacy Policy</Link>, our <Link href="/cookies">Cookie Policy</Link>, and our <Link href="/community-guidelines">Community Guidelines</Link>, these Terms form the entire agreement between you and Hydrilla AI (the &quot;Agreement&quot;).
          </p>
          <p>
            By accessing or using the Service, you (&quot;Customer&quot;, &quot;your&quot;, or &quot;you&quot;) agree to these Terms. If you do not agree, you may not access or use the Service. If you use the Service on behalf of a company or studio, you confirm that you have authority to bind it, and &quot;you&quot; includes that organisation.
          </p>
          <p>
            We may update this Agreement from time to time. We will post the updated Terms on this page with a new effective date, and we will notify you at least 7 calendar days in advance. For changes that are material or disadvantageous to you, we will notify you individually, by email or in the Service, at least 30 calendar days in advance. Your continued use of the Service after a change takes effect constitutes your acceptance of the revised Agreement.
          </p>
      </div>

      <nav aria-label="On this page" className="pickle-legal-toc">
        <p className="pickle-legal-toc-title">On this page</p>
        <ol>
          <li>
            <a href="#access">1. Access to the Service</a>
          </li>
          <li>
            <a href="#using">2. Using the Service</a>
          </li>
          <li>
            <a href="#intellectual-property">3. Intellectual Property</a>
          </li>
          <li>
            <a href="#billing">4. Billing and Payments</a>
          </li>
          <li>
            <a href="#termination">5. Term and Termination</a>
          </li>
          <li>
            <a href="#copyright">6. Copyright and Takedowns Policy</a>
          </li>
          <li>
            <a href="#warranties">7. Warranties and Disclaimers</a>
          </li>
          <li>
            <a href="#indemnity">8. Indemnification</a>
          </li>
          <li>
            <a href="#liability">9. Limitation of Liability</a>
          </li>
          <li>
            <a href="#governing-law">10. Dispute Resolution</a>
          </li>
          <li>
            <a href="#general">11. General Provisions</a>
          </li>
        </ol>
      </nav>

      <section id="access" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">1. Access to the Service</h2>
        <h3 className="pickle-h3">1.1 Age Restrictions</h3>
        <div className="pickle-text">
          <p>
            You must be at least 18 years old, and old enough to form a binding contract where you live, to use the Service. By using the Service, you represent and warrant that you meet this requirement.
          </p>
        </div>
        <h3 className="pickle-h3">1.2 User Accounts and Authorized Access</h3>
        <div className="pickle-text">
          <p>
            To access and use the Service, you must register for an account and provide certain information. You agree to provide information that is accurate, complete, and current at all times. Your use of the Service is limited to the scope of the plan you select and purchase, and is permitted solely for you, if you are an individual user, or for your employees, contractors, and agents whom you permit to use the Service under this Agreement and for whom access has been purchased (&quot;Authorized Users&quot;). If you use a shared workspace, the workspace owner controls who has access and may be able to view, manage, or remove Content in it.
          </p>
          <p>
            You agree not to share your account credentials or API keys with anyone who is not an Authorized User. You are fully responsible for all activity under your account and keys, whether or not you authorised it. Hydrilla AI is not liable for losses arising from unauthorised use of your account, except where caused by our wilful misconduct or gross negligence. Tell us at founders@hydrilla.ai straight away if you believe your account or a key has been compromised.
          </p>
        </div>
        <h3 className="pickle-h3">1.3 Privacy Policy</h3>
        <div className="pickle-text">
          <p>
            Hydrilla AI handles personal information in accordance with its <Link href="/privacy">Privacy Policy</Link>. By accessing or using the Service, you acknowledge that you have read it.
          </p>
        </div>
      </section>

      <section id="using" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">2. Using the Service</h2>
        <h3 className="pickle-h3">2.1 Access Grant, Availability, and Quality</h3>
        <div className="pickle-text">
          <p>
            We grant you a limited, revocable, non-exclusive, non-transferable, and non-sublicensable right to access and use the Service during the Term (as defined below). We reserve all rights not expressly granted to you under this Agreement.
          </p>
          <p>
            The Service may be modified, updated, or discontinued from time to time. If we make a change that materially and negatively affects a paid plan, we will give you reasonable advance notice, except in urgent situations such as preventing abuse, responding to legal requirements, or addressing security and technical issues. Except as set out in a separate written agreement, we make no guarantees about the quality, stability, uptime, or reliability of the Service, and we are not liable for any unavailability or interruption of the Service, in whole or in part.
          </p>
        </div>
        <h3 className="pickle-h3">2.2 Customer Input</h3>
        <div className="pickle-text">
          <p>
            As part of your use of the Service, you may upload, submit, or otherwise provide prompts, text, images, files, briefs, API calls, code, or other materials (&quot;Customer Input&quot;). You keep all rights in your Customer Input.
          </p>
          <p>
            You represent and warrant that you have all rights, licenses, and permissions needed to submit your Customer Input to the Service, and the right to give us the permission described in these Terms. Do not include sensitive personal data, such as financial account details or government identification numbers, or other people&apos;s personal information in your Customer Input unless you have the right to share it.
          </p>
        </div>
        <h3 className="pickle-h3">2.3 Customer Output</h3>
        <div className="pickle-text">
          <p>
            The Service returns 3D models, textures, and other results generated in response to Customer Input (&quot;Customer Output&quot;). Customer Input and Customer Output together are &quot;Content&quot;.
          </p>
          <p>
            You are solely responsible for reviewing and evaluating Customer Output for accuracy, completeness, and suitability before you use, distribute, or rely on it, and for all decisions you take based on it. Customer Output is not a substitute for engineering, manufacturing, or other professional data.
          </p>
          <p>
            The Service may include machine-readable metadata or other identifiers in Customer Output to show that it was generated by AI. You agree not to remove, alter, or tamper with such identifiers where we include them.
          </p>
        </div>
        <h3 className="pickle-h3">2.4 Storage of Content</h3>
        <div className="pickle-text">
          <p>
            Your Content is stored in your account until you delete it or close your account. We may set reasonable storage limits for accounts and remove Content that exceeds them or is associated with an inactive account, and we will use commercially reasonable efforts to give you notice first. Deleted Content may remain in backups for a short period, as described in our Privacy Policy. You are responsible for keeping your own copies of Customer Output you need; downloaded files stay with you.
          </p>
        </div>
        <h3 className="pickle-h3">2.5 Use Restrictions</h3>
        <div className="pickle-text">
          <p>
            Your use of the Service is subject to the rights granted in this Agreement. You agree that you will not use the Service to:
          </p>
          <ul>
            <li>violate any applicable law or regulation;</li>
            <li>reverse engineer, decompile, or disassemble the Service, or copy or extract our models, weights, or source code, except where the law allows it despite this restriction;</li>
            <li>infringe or violate any third-party rights, including intellectual property, publicity, or privacy rights;</li>
            <li>develop or offer a competing AI 3D model or service, or use the Service or Customer Output to train, develop, or improve AI models that compete with Hydrilla AI;</li>
            <li>resell, sublicense, or redistribute the Service or access to it, or allow multiple people to use one account;</li>
            <li>deceive or defraud, or create, upload, or share content prohibited by our <Link href="/community-guidelines">Community Guidelines</Link>;</li>
            <li>introduce any virus, malware, or other malicious code, or attempt to gain unauthorised access to, test the security of, or interfere with any part of the Service;</li>
            <li>use bots, scrapers, or other automated means to access the Service, other than our API and MCP server within their limits, or get around credit limits, usage windows, or other restrictions.</li>
          </ul>
          <p>
            You are responsible for all Content that you or your Authorized Users submit, create, or share on the Service. We may monitor use of the Service to assess compliance with this Agreement, and may remove Content, suspend features, or close accounts that break these rules in accordance with Section 5. We may report illegal content to the authorities.
          </p>
        </div>
        <h3 className="pickle-h3">2.6 Third-Party Products</h3>
        <div className="pickle-text">
          <p>
            The Service may give access to third-party software, tools, or services that we do not own or control (&quot;Third-Party Products&quot;). Our plugins run inside software made by other companies, such as DCC tools and game engines, and the MCP server runs inside an AI client you choose. Third-Party Products are subject to their own terms, which you must follow. Hydrilla AI disclaims all warranties, indemnities, and liabilities with respect to Third-Party Products, and changes to them may affect how our plugins work.
          </p>
        </div>
        <h3 className="pickle-h3">2.7 Aggregated Statistics</h3>
        <div className="pickle-text">
          <p>
            We may monitor your use of the Service and compile data about it in an aggregated and anonymised form to compile statistical and performance information and to improve the Service (&quot;Aggregated Statistics&quot;). Aggregated Statistics do not include Customer Input or Customer Output. As between you and Hydrilla AI, all rights in Aggregated Statistics belong to Hydrilla AI.
          </p>
        </div>
        <h3 className="pickle-h3">2.8 Training on User Content</h3>
        <div className="pickle-text">
          <p>
            We do not use your Customer Input or Customer Output to train our models, on any plan.
          </p>
        </div>
        <h3 className="pickle-h3">2.9 Subscription Features</h3>
        <div className="pickle-text">
          <p>
            Each plan includes a defined set of features, such as monthly credits, as described on our <Link href="/pricing">pricing page</Link> or in your Order. Features are allocated on a monthly basis and renew automatically each billing month. They do not roll over from one month to the next, and unused credits expire, have no cash value, and cannot be transferred, sold, or reinstated. Hourly plans let you generate only during the daily window that comes with the plan. We may modify the features included in each plan from time to time, and we will give you reasonable notice of changes to a plan you have already purchased.
          </p>
        </div>
        <h3 className="pickle-h3">2.10 Processing Data</h3>
        <div className="pickle-text">
          <p>
            By using the Service, you permit us to collect, use, store, and otherwise process your data in accordance with these Terms and our Privacy Policy. This includes account details, Customer Input, and other information you choose to share. You give us a worldwide, non-exclusive, royalty-free permission to host, store, copy, process, and display your Content only as needed to provide, secure, and support the Service for you. We do not sell your Content or make it public.
          </p>
        </div>
      </section>

      <section id="intellectual-property" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">3. Intellectual Property</h2>
        <h3 className="pickle-h3">3.1 Hydrilla AI&apos;s Intellectual Property</h3>
        <div className="pickle-text">
          <p>
            Hydrilla AI and its licensors own all right, title, and interest in and to the Service, including the website, software, models, design, documentation, and Aggregated Statistics (collectively, &quot;Hydrilla IP&quot;). &quot;Hydrilla&quot;, &quot;BlueFox&quot;, &quot;Water Agent&quot;, and our logos are trademarks of Hydrilla AI, whether or not registered. Do not use them in a way that suggests we endorse you without our written permission.
          </p>
          <p>
            We grant you a non-exclusive, royalty-free, worldwide, non-transferable license to use the Hydrilla IP solely as necessary to access and use the Service under this Agreement. Nothing in this Agreement or the Service grants you any other license or right in Hydrilla IP without our prior written authorisation.
          </p>
        </div>
        <h3 id="ownership" className="pickle-h3 scroll-mt-28">3.2 Ownership of Content; Rights Granted to Hydrilla AI</h3>
        <div className="pickle-text">
          <p>
            <strong>Your inputs.</strong> You keep all rights in your Customer Input.
          </p>
          <p>
            <strong>Your outputs.</strong> As between you and Hydrilla AI, and to the extent the law allows, you own the Customer Output the Service generates for you, and you may use it for personal and commercial purposes. Because AI models can produce similar results for similar requests, other users may receive Outputs that resemble yours, and those outputs are not yours. The law on ownership of AI-generated material differs between countries and is still developing, so we do not promise that Customer Output qualifies for intellectual property protection.
          </p>
          <p>
            <strong>Permission you give us.</strong> By using the Service and providing or generating Content, you grant Hydrilla AI the worldwide, non-exclusive, royalty-free permission described in Section 2.10. Unless prohibited by law, we may delete Content at any time if we determine that it violates this Agreement or that deletion is necessary to comply with the law.
          </p>
        </div>
        <h3 className="pickle-h3">3.3 Community Content</h3>
        <div className="pickle-text">
          <p>
            Nothing you generate is public until you post it to the Hydrilla community. If you post a model, image, comment, or other material there (&quot;Community Content&quot;), it is licensed to the public under the license you choose when you share it: CC BY-NC 4.0 (the default), CC BY 4.0, CC0, or all rights reserved. The license applies to the shared files and does not change your ownership of your Customer Output. If you allow downloads, anyone can download the model file.
          </p>
          <p>
            By posting Community Content, you also grant Hydrilla AI a non-exclusive, royalty-free, worldwide license to host, display, and distribute it, and to show it in feeds, search, and recommendations, for as long as it remains posted. Deleting a post or its source asset removes it from the community. Community Content is also subject to our <Link href="/community-guidelines">Community Guidelines</Link>.
          </p>
        </div>
        <h3 className="pickle-h3">3.4 Content Representations</h3>
        <div className="pickle-text">
          <p>
            You represent and warrant that you own your Content and Community Content or have obtained all necessary permissions to share it, that it does not infringe or violate any intellectual property, privacy, or other rights of any third party, and that you have full authority to grant the rights set out in these Terms. If your Community Content includes the name, image, likeness, or voice of an identifiable person, you represent and warrant that you have obtained all necessary consents from that person or their legal guardian.
          </p>
        </div>
        <h3 className="pickle-h3">3.5 Feedback</h3>
        <div className="pickle-text">
          <p>
            If you send us feedback or suggestions, you grant us a perpetual, worldwide, irrevocable, royalty-free license to use them without restriction or obligation to you.
          </p>
        </div>
        <h3 className="pickle-h3">3.6 Publicity</h3>
        <div className="pickle-text">
          <p>
            Unless we agree otherwise in writing, Hydrilla AI may use a business Customer&apos;s name, logo, and word marks to identify it as a customer of the Service on our website and marketing materials. This use is not an endorsement by the Customer. A Customer may withdraw this permission at any time by giving us written notice.
          </p>
        </div>
      </section>

      <section id="billing" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">4. Billing and Payments</h2>
        <div className="pickle-text">
          <p>
            <strong>Plans.</strong> We offer a Free plan and paid Monthly and Hourly plans, as described on our <Link href="/pricing">pricing page</Link>. Prices, plan contents, and credit costs are shown on the pricing page and at checkout. Unless an Order says otherwise, fees are billed in advance for each billing period by automatic charge to your payment method, which is processed by our payment provider, Dodo Payments. By starting a paid plan, you authorise us and our payment provider to charge your payment method for each period.
          </p>
          <p>
            <strong>Free trial.</strong> You can try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card. Unless you cancel before the trial ends, your plan continues as a paid subscription and your card is charged for the first billing period when the trial ends. We may limit trials to one per person or organisation, and we may end a trial early if we see misuse.
          </p>
          <p>
            <strong>Renewal and cancellation.</strong> Your subscription renews automatically at the end of each billing period at the then-current price unless you cancel before renewal. You can cancel at any time from your account or by writing to founders@hydrilla.ai. Cancellation takes effect at the end of the current billing period, and you keep paid features until then. After that, your account moves to the Free plan unless you close it.
          </p>
          <p>
            <strong>Taxes.</strong> Prices exclude taxes unless stated, and you are responsible for applicable taxes such as VAT or GST.
          </p>
          <p>
            <strong>Failed payments.</strong> If a payment fails, we may suspend paid features until it succeeds, and amounts you owe remain due.
          </p>
          <p>
            <strong>Price changes.</strong> We may change prices. A change applies from your next billing period after we give you notice, and you can cancel before it takes effect.
          </p>
          <p>
            <strong>Refunds.</strong> Fees are non-refundable, including for unused credits and for the part of a billing period that remains after you cancel, except where these Terms or the law say otherwise. If we charged you in error, or you were charged for a renewal you cancelled in time, write to us within 14 days of the charge and we will review it and correct it where the charge was ours to correct. Nothing in these Terms removes refund or cancellation rights that consumer law in your country gives you.
          </p>
        </div>
      </section>

      <section id="termination" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">5. Term and Termination</h2>
        <div className="pickle-text">
          <p>
            This Agreement begins on the date you first use the Service, or the effective date of an Order, whichever is earlier, and continues until it is terminated as set out in this Section 5 (the &quot;Term&quot;). A paid subscription renews for additional billing periods of the same length until you cancel.
          </p>
          <p>
            You can stop using the Service at any time, and you can close your account by writing to founders@hydrilla.ai. We may suspend your access or terminate this Agreement if (i) we need to prevent a credible risk of harm or liability to Hydrilla AI, our users, or a third party; (ii) you use the Service in a way that violates this Agreement or our Community Guidelines; (iii) we are required to do so by law; or (iv) you become insolvent or subject to bankruptcy or similar proceedings. We will take reasonable steps to give you notice before suspension or termination, where practical.
          </p>
          <p>
            When your account closes, your right to use the Service ends, and we delete your Content as described in our <Link href="/privacy">Privacy Policy</Link>. Sections that by their nature should continue, such as ownership, payment, disclaimers, indemnification, limitation of liability, and dispute resolution, survive termination.
          </p>
        </div>
      </section>

      <section id="copyright" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">6. Copyright and Takedowns Policy</h2>
        <h3 className="pickle-h3">6.1 Notification Procedures</h3>
        <div className="pickle-text">
          <p>
            We respect the intellectual property rights of others. If you believe that material on or linked to by the Service infringes your copyright or trademark, send a notice of claimed infringement by email to founders@hydrilla.ai with the subject line &quot;Takedown Request&quot;, or by post to Hydrilla AI Private Limited, 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India. Include:
          </p>
          <ul>
            <li>your physical or electronic signature;</li>
            <li>identification of the copyrighted work or mark you believe has been infringed, or a representative list if there are several;</li>
            <li>identification of the material you believe is infringing, in enough detail for us to locate it;</li>
            <li>your contact details, including your name, postal address, telephone number, and email address;</li>
            <li>a statement that you believe in good faith that the use is not authorised by the owner, its agent, or the law;</li>
            <li>a statement that the information in your notice is accurate, and that you are the owner or are authorised to act for the owner.</li>
          </ul>
          <p>
            After receiving a notice that meets these requirements, we may remove or disable access to the material, tell the user concerned, and close the accounts of repeat infringers. If you knowingly misrepresent that material is infringing, you may be liable for the resulting damages and costs.
          </p>
        </div>
        <h3 className="pickle-h3">6.2 Counter-Notification Procedure</h3>
        <div className="pickle-text">
          <p>
            If you believe your material was removed by mistake or misidentification, send a counter-notice to the same address. It should include your signature; identification of the material and where it appeared before removal; your contact details; and a statement that you believe in good faith that the material was removed because of a mistake or misidentification. We may restore the material unless the complaining party takes legal action and tells us of it within a reasonable period.
          </p>
        </div>
      </section>

      <section id="warranties" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">7. Warranties and Disclaimers</h2>
        <h3 className="pickle-h3">7.1 Limited Warranty</h3>
        <div className="pickle-text">
          <p>
            We warrant that the Service will perform materially as described during your paid subscription term, and that we will provide it with reasonable care and skill. This warranty does not apply to issues caused by misuse of the Service, unauthorised modifications, Third-Party Products or data, or circumstances beyond our reasonable control. If we verify a breach of this warranty reported to us in writing, we will use reasonable efforts to correct it. This is your exclusive remedy and our sole liability for a breach of this warranty.
          </p>
        </div>
        <h3 className="pickle-h3">7.2 Disclaimers</h3>
        <div className="pickle-text">
          <p>
            EXCEPT AS EXPRESSLY SET OUT IN SECTION 7.1, THE SERVICE AND CUSTOMER OUTPUT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;, WITHOUT WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. TO THE FULLEST EXTENT THE LAW ALLOWS, WE DISCLAIM ALL WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, AND WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS, OR THAT IT WILL MEET YOUR NEEDS OR ACHIEVE ANY PARTICULAR RESULT.
          </p>
          <p>
            YOU ACKNOWLEDGE THAT, DUE TO THE NATURE OF AI TECHNOLOGY, CUSTOMER OUTPUT MAY BE INACCURATE, INCOMPLETE, BIASED, OR NON-UNIQUE, AND MAY NOT QUALIFY FOR INTELLECTUAL PROPERTY PROTECTION. THE SERVICE MAY GENERATE SIMILAR OR IDENTICAL 3D MODELS FOR DIFFERENT USERS WHO PROVIDE SIMILAR INPUTS, AND WE DO NOT GUARANTEE THE UNIQUENESS OF ANY CUSTOMER OUTPUT. Some countries do not allow certain disclaimers, so some of these may not apply to you.
          </p>
        </div>
      </section>

      <section id="indemnity" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">8. Indemnification</h2>
        <div className="pickle-text">
          <p>
            To the fullest extent the law allows, you agree to defend, indemnify, and hold harmless Hydrilla AI and its directors, officers, employees, agents, affiliates, and licensors from and against third-party claims, and related liabilities, losses, costs, and expenses including reasonable legal fees, arising from or related to (i) your Content; (ii) your unauthorised use of the Service; (iii) your breach of this Agreement; or (iv) your violation of applicable law, except to the extent caused by our negligence or wilful misconduct.
          </p>
        </div>
      </section>

      <section id="liability" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">9. Limitation of Liability</h2>
        <div className="pickle-text">
          <p>
            TO THE FULLEST EXTENT THE LAW ALLOWS, NEITHER YOU NOR HYDRILLA AI WILL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF REVENUE, PROFITS, DATA, USE, GOODWILL, OR REPUTATION, OR THE COST OF SUBSTITUTE SERVICES, ARISING FROM OR RELATED TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT, WARRANTY, OR OTHERWISE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. TO THE FULLEST EXTENT THE LAW ALLOWS, THE TOTAL AGGREGATE LIABILITY OF HYDRILLA AI RELATED TO THIS AGREEMENT WILL NOT EXCEED THE AMOUNT YOU ACTUALLY PAID TO HYDRILLA AI IN THE TWELVE (12) MONTHS BEFORE THE FIRST EVENT THAT GAVE RISE TO THE LIABILITY.
          </p>
          <p>
            Nothing in these Terms limits liability that cannot be limited by law, such as liability for fraud, or for death or personal injury caused by negligence.
          </p>
        </div>
      </section>

      <section id="governing-law" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">10. Dispute Resolution</h2>
        <div className="pickle-text">
          <p>
            To the extent permitted by applicable consumer protection laws, any dispute, controversy, or claim arising out of or relating to this Agreement (a &quot;Dispute&quot;) will be resolved by arbitration rather than in court. The party raising a Dispute must first try in good faith to resolve it by sending the other party a written notice describing the facts of the Dispute, and allowing 30 days to respond. You can write to us at founders@hydrilla.ai.
          </p>
          <p>
            If the Dispute is not resolved within 30 days, it will be finally resolved by arbitration under the Arbitration and Conciliation Act, 1996, before a sole arbitrator appointed by mutual agreement. The seat and venue of arbitration will be Tirupati, Andhra Pradesh, and the language will be English. The award will be final and binding, and each party will bear its own legal and expert fees. Either party may apply to a competent court for urgent injunctive or other equitable relief to protect its rights while the arbitration is pending.
          </p>
          <p>
            This Agreement is governed by the laws of India, without regard to conflict-of-law rules, and the courts at Tirupati have exclusive jurisdiction over any matter that the law does not allow to be arbitrated. If you are a consumer, you keep the protection of the mandatory laws of the country where you live, and you may bring proceedings in its courts.
          </p>
        </div>
      </section>

      <section id="general" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">11. General Provisions</h2>
        <h3 className="pickle-h3">11.1 Waiver and Severability</h3>
        <div className="pickle-text">
          <p>
            Our failure to enforce a term of this Agreement is not a waiver of that term or any other term. If any provision is found to be invalid or unenforceable, the remaining provisions continue in full force and effect.
          </p>
        </div>
        <h3 className="pickle-h3">11.2 Assignments</h3>
        <div className="pickle-text">
          <p>
            You may not assign or transfer this Agreement, in whole or in part, without our prior written consent. We may assign it as part of a merger, acquisition, or sale of assets.
          </p>
        </div>
        <h3 className="pickle-h3">11.3 Sequence of Precedent</h3>
        <div className="pickle-text">
          <p>
            If there is a conflict, the documents control in this order: the Order, then these Terms.
          </p>
        </div>
        <h3 className="pickle-h3">11.4 Force Majeure</h3>
        <div className="pickle-text">
          <p>
            Neither party is liable for failure or delay in performance caused by circumstances beyond its reasonable control, including natural disaster, labour dispute, civil disturbance, terrorism, war, power or internet failure, or the failure of a third-party provider.
          </p>
        </div>
        <h3 className="pickle-h3">11.5 Notice</h3>
        <div className="pickle-text">
          <p>
            Notices to Hydrilla AI must be in writing and sent by email to founders@hydrilla.ai, with a copy to our registered address above. We may give notices to you by email to the address on your account, or in the Service.
          </p>
        </div>
        <h3 className="pickle-h3">11.6 Language</h3>
        <div className="pickle-text">
          <p>
            This Agreement is made in English. Any translation is provided for convenience only, and the English version prevails unless local law requires otherwise.
          </p>
        </div>
        <h3 className="pickle-h3">11.7 Entire Agreement</h3>
        <div className="pickle-text">
          <p>
            This Agreement is the entire agreement between you and Hydrilla AI regarding the Service, and supersedes any prior or contemporaneous agreements between us.
          </p>
        </div>
        <h3 className="pickle-h3">11.8 Contact</h3>
        <div className="pickle-text">
          <p>
            Questions about these Terms? Contact us:
          </p>
          <p>
            <strong>Hydrilla AI Private Limited</strong>
            <br />
            5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar
            <br />
            Tirupati, Andhra Pradesh 517502, India
            <br />
            Website: <a href="https://hydrilla.ai">hydrilla.ai</a>
            <br />
            Email: <a href="mailto:founders@hydrilla.ai">founders@hydrilla.ai</a>
          </p>
        </div>
      </section>
    </PickleArticlePage>
    </>
  );
}
