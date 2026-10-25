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
    title: "Terms of Service",
    subtitle: "Account terms, generated asset ownership, and acceptable use on Hydrilla.",
    href: "/terms-and-conditions",
    date: "Jul 14, 2026",
    author: "Hydrilla Legal",
    thumbVariant: "docs-flow",
  },
  {
    title: "Security & Trust",
    subtitle: "How Hydrilla isolates accounts, private workspaces, and exported files.",
    href: "/security",
    date: "Oct 1, 2026",
    author: "Hydrilla Team",
    thumbVariant: "privacy-enclave",
  },
];

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
    <JsonLd data={getKitJsonLd("/privacy")} />
    <PickleArticlePage
      kicker="Legal"
      kickerHref="/security"
      title="Privacy Policy"
      date="Effective [EFFECTIVE DATE]"
      author="Hydrilla Legal"
      heroThumbVariant="privacy-enclave"
      ctaLabel="Contact Privacy"
      ctaHref="mailto:founders@hydrilla.ai"
      relatedItems={RELATED}
    >
      <div className="pickle-text">
        <p>
          This Privacy Policy explains how Hydrilla AI collects, uses, shares, and protects personal information when you use our websites, the Hydrilla workspace, our plugins, the MCP server, and the REST API (together, the &quot;Service&quot;). It also explains the choices and rights you have. Please read it together with our <Link href="/terms">Terms of Service</Link>{" "}and <Link href="/cookies">Cookie Policy</Link>.
        </p>
      </div>

      <div className="pickle-card-surface pickle-legal-summary">
        <h2 className="pickle-h3">Summary</h2>
        <div className="pickle-text">
          <p>
            This summary is for convenience. The full policy below is what applies.
          </p>
          <ul>
            <li>We do not sell your personal information, and we do not sell your content or generated 3D assets.</li>
            <li>We do not use your prompts, reference images, briefs, or generated models to train our models.</li>
            <li>We use your information to run the Service, process payments, keep accounts secure, support you, and meet our legal obligations.</li>
            <li>We share information only with service providers who process it on our behalf, and where the law requires it.</li>
            <li>You can ask to access, correct, delete, or export your personal information at any time by writing to founders@hydrilla.ai.</li>
          </ul>
        </div>
      </div>

      <nav aria-label="On this page" className="pickle-legal-toc">
        <p className="pickle-legal-toc-title">On this page</p>
        <ol>
          <li>
            <a href="#who-we-are">1. Who we are</a>
          </li>
          <li>
            <a href="#information-we-collect">2. Information we collect</a>
          </li>
          <li>
            <a href="#how-we-use">3. How we use your information</a>
          </li>
          <li>
            <a href="#ai-processing">4. Your content and AI processing</a>
          </li>
          <li>
            <a href="#legal-bases">5. Legal bases for processing</a>
          </li>
          <li>
            <a href="#sharing">6. How we share information</a>
          </li>
          <li>
            <a href="#transfers">7. International transfers</a>
          </li>
          <li>
            <a href="#retention">8. How long we keep information</a>
          </li>
          <li>
            <a href="#security">9. Security</a>
          </li>
          <li>
            <a href="#your-rights">10. Your rights</a>
          </li>
          <li>
            <a href="#children">11. Children</a>
          </li>
          <li>
            <a href="#cookies">12. Cookies</a>
          </li>
          <li>
            <a href="#marketing">13. Marketing communications</a>
          </li>
          <li>
            <a href="#third-parties">14. Third-party software and links</a>
          </li>
          <li>
            <a href="#changes">15. Changes to this policy</a>
          </li>
          <li>
            <a href="#contact">16. Contact us</a>
          </li>
        </ol>
      </nav>

      <section id="who-we-are" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">1. Who we are</h2>
        <div className="pickle-text">
          <p>
            The Service is provided by Hydrilla AI Pvt Ltd, registered at 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India (&quot;Hydrilla AI&quot;, &quot;Hydrilla&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). For personal information processed under this policy, Hydrilla AI is the data controller (in India, the data fiduciary; in Singapore, the organisation responsible).
          </p>
          <p>
            When a studio or company buys the Service for its team under a separate agreement, that customer may control the personal information in its workspace, and we process it on the customer&apos;s instructions. In that case the customer&apos;s own privacy notice also applies, and questions about that workspace are best sent to the customer first.
          </p>
        </div>
      </section>

      <section id="information-we-collect" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">2. Information we collect</h2>
        <div className="pickle-text">
          <p>
            We collect only the information we need to provide and improve the Service, keep it secure, and meet our legal obligations.
          </p>
        </div>
        <h3 className="pickle-h3">2.1 Information you give us</h3>
        <div className="pickle-text">
          <ul>
            <li><strong>Account information.</strong>{" "}Your name, email address, and sign-in details when you create an account, plus any profile details you choose to add.</li>
            <li><strong>Billing information.</strong>{" "}The plan you choose, your billing contact details, and transaction records. Card payments are handled by our payment provider, Dodo Payments. We do not store full card numbers on our servers.</li>
            <li><strong>Your content.</strong>{" "}Prompts, reference images and other files you upload, briefs and conversations with Water Agent, and the 3D models, textures, and other outputs the Service generates for you (&quot;Content&quot;).</li>
            <li><strong>Communications.</strong>{" "}Messages you send to us, such as support requests, sales enquiries, security questionnaires, and job applications, including any attachments.</li>
          </ul>
        </div>
        <h3 className="pickle-h3">2.2 Information collected automatically</h3>
        <div className="pickle-text">
          <ul>
            <li><strong>Usage information.</strong>{" "}Pages you visit, features you use, generation jobs and their status, credit usage, and how you interact with the Service.</li>
            <li><strong>Device and log information.</strong>{" "}IP address, browser type, operating system, device identifiers, approximate location derived from your IP address, and timestamps.</li>
            <li><strong>Plugin and API information.</strong>{" "}When you use a plugin, the MCP server, or the REST API, we receive the requests your tools send, the identifier of the API key used, and technical details needed to complete the job.</li>
            <li><strong>Email interaction information.</strong>{" "}When we email you, whether the message was delivered, opened, or clicked, so we can keep our emails relevant and our sending reputation healthy.</li>
            <li><strong>Cookies and similar technologies.</strong>{" "}As described in our <Link href="/cookies">Cookie Policy</Link>.</li>
          </ul>
        </div>
        <h3 className="pickle-h3">2.3 Information from other sources</h3>
        <div className="pickle-text">
          <p>
            We receive limited information from the providers who help us run the Service, for example confirmation of a payment from our payment provider, or sign-in details from our authentication provider when you create or access an account.
          </p>
          <p>
            We do not ask for sensitive personal information, such as health, biometric, or financial account data beyond billing. Please do not include it, or other people&apos;s personal information, in your prompts or uploads unless you have the right to share it.
          </p>
        </div>
      </section>

      <section id="how-we-use" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">3. How we use your information</h2>
        <div className="pickle-text">
          <p>
            We use personal information to:
          </p>
          <ul>
            <li>Create and manage your account, and authenticate you in the workspace, plugins, and API</li>
            <li>Provide the Service, including generating outputs from your inputs and storing them in your workspace</li>
            <li>Process payments, trials, renewals, and credit allowances</li>
            <li>Respond to support requests and communicate with you about your account, changes to the Service, and these policies</li>
            <li>Monitor reliability and performance, and improve the Service using usage information</li>
            <li>Detect, prevent, and respond to fraud, abuse, security incidents, and breaches of our <Link href="/terms">Terms</Link></li>
            <li>Send product news and marketing where you have agreed to receive it, or where the law otherwise allows it</li>
            <li>Comply with legal obligations, resolve disputes, and enforce our agreements</li>
          </ul>
          <p>
            We do not make decisions about you based solely on automated processing that produce legal or similarly significant effects.
          </p>
        </div>
      </section>

      <section id="ai-processing" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">4. Your content and AI processing</h2>
        <div className="pickle-text">
          <p>
            Your Content is processed to deliver the features you ask for. Some features send your inputs to AI service providers that process them on our behalf to produce a result, for example the image model that renders a reference picture before a text-to-3D generation. These providers act on our instructions and are described in section 6.
          </p>
          <p>
            We do not use your Content to train our models, on any plan. We do not sell Content, and we do not make it public. Your Content is stored securely and is available to your account or workspace, and to a limited number of our staff only where needed to support you, keep the Service secure, or meet a legal obligation.
          </p>
        </div>
      </section>

      <section id="legal-bases" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">5. Legal bases for processing</h2>
        <div className="pickle-text">
          <p>
            If you are in the European Economic Area, the United Kingdom, or Switzerland, we rely on the following legal bases. Similar grounds apply under other laws described in section 10.
          </p>
        </div>
        <div className="pickle-card-surface">
          <table className="pickle-table">
            <thead>
              <tr>
                <th>Purpose</th>
                <th>Legal basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Providing the Service, your account, and your Content</th>
                <td>Performance of our contract with you</td>
              </tr>
              <tr>
                <th>Billing, trials, and credit allowances</th>
                <td>Performance of our contract with you</td>
              </tr>
              <tr>
                <th>Security, fraud and abuse prevention</th>
                <td>Our legitimate interests in protecting the Service and its users</td>
              </tr>
              <tr>
                <th>Service analytics and improvement</th>
                <td>Our legitimate interests, or your consent where the law requires it</td>
              </tr>
              <tr>
                <th>Marketing messages</th>
                <td>Your consent, or our legitimate interests where the law allows</td>
              </tr>
              <tr>
                <th>Tax, accounting, and legal compliance</th>
                <td>Compliance with a legal obligation</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pickle-text">
          <p>
            Where we rely on consent, you can withdraw it at any time. This does not affect processing that took place before you withdrew it.
          </p>
        </div>
      </section>

      <section id="sharing" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">6. How we share information</h2>
        <div className="pickle-text">
          <p>
            We share personal information only as described here.
          </p>
          <ul>
            <li><strong>Service providers.</strong>{" "}Companies that process information on our behalf to provide authentication, payments, hosting and storage, analytics, AI processing, email, and customer support. They may use it only to provide their services to us, under written terms that require them to protect it. Our current providers are Clerk (authentication), Dodo Payments (payments), Vercel (hosting), Supabase (database), PostHog, Google Analytics, and Vercel Analytics (analytics), Customer.io (email), and [AI PROCESSING PROVIDERS].</li>
            <li><strong>Your team.</strong>{" "}If you work in a shared workspace, other members of that workspace can see the Content and activity within it.</li>
            <li><strong>Legal and safety.</strong>{" "}Authorities, courts, or other parties where the law requires it, or where we believe disclosure is necessary to protect the rights, property, or safety of our users, the public, or Hydrilla AI.</li>
            <li><strong>Business transfers.</strong>{" "}A buyer or successor, and their advisers, in connection with a merger, acquisition, financing, or sale of assets, subject to this policy.</li>
            <li><strong>With your direction.</strong>{" "}Anyone else, when you ask us to share or give your consent.</li>
          </ul>
          <p>
            We do not sell personal information, and we do not share it for cross-context behavioral advertising.
          </p>
        </div>
      </section>

      <section id="transfers" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">7. International transfers</h2>
        <div className="pickle-text">
          <p>
            We and our service providers may process personal information in countries other than the one where you live, including [HOSTING REGION]. Those countries may have different data protection laws.
          </p>
          <p>
            When we transfer personal information out of the European Economic Area, the United Kingdom, or Switzerland to a country without an adequacy decision, we use safeguards recognised by those laws, such as the European Commission&apos;s Standard Contractual Clauses and the UK Addendum. Transfers from India, Singapore, and the United Arab Emirates are made in line with the requirements of the laws described in section 10. You can ask us for more detail about the safeguards we use.
          </p>
        </div>
      </section>

      <section id="retention" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">8. How long we keep information</h2>
        <div className="pickle-text">
          <p>
            We keep personal information only for as long as we need it for the purposes in this policy.
          </p>
          <ul>
            <li><strong>Account information</strong>{" "}for as long as your account is open, and for [RETENTION PERIOD] after it closes.</li>
            <li><strong>Content</strong>{" "}until you delete it or close your account. Deleted Content may remain in backups for up to [BACKUP RETENTION PERIOD] before it is permanently removed.</li>
            <li><strong>Billing records</strong>{" "}for as long as tax and accounting laws require.</li>
            <li><strong>Logs and security records</strong>{" "}for [LOG RETENTION PERIOD], unless we need them longer to investigate an incident.</li>
          </ul>
          <p>
            When we no longer need information, we delete it or de-identify it so it can no longer be linked to you.
          </p>
        </div>
      </section>

      <section id="security" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">9. Security</h2>
        <div className="pickle-text">
          <p>
            We protect personal information with technical and organisational measures appropriate to the risk. Your data is stored securely, access to workspace content requires a signed-in account, and our staff access it only where needed. The <Link href="/security">security page</Link>{" "}summarises how accounts, stored assets, and exports are handled.
          </p>
          <p>
            No method of transmission or storage is completely secure, so we cannot guarantee absolute security. If a breach affects your personal information, we will notify you and the relevant authorities as the law requires. You can help by keeping your sign-in details and API keys private.
          </p>
        </div>
      </section>

      <section id="your-rights" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">10. Your rights</h2>
        <div className="pickle-text">
          <p>
            Depending on where you live, you have rights over your personal information. Wherever you are, you can ask us to access, correct, delete, or export it, and to stop marketing messages. To make a request, email founders@hydrilla.ai from the email address on your account. We may need to confirm your identity before we act, and we will reply within the time the applicable law requires. We will not treat you differently for exercising your rights.
          </p>
        </div>
        <h3 className="pickle-h3">10.1 European Economic Area, United Kingdom, and Switzerland</h3>
        <div className="pickle-text">
          <p>
            Under the GDPR and UK GDPR you have the right to access your personal information, correct it, erase it, restrict or object to its processing, receive it in a portable format, and withdraw consent. You can also complain to your local data protection authority, or in the UK to the Information Commissioner&apos;s Office. We would welcome the chance to address your concern first. [EU AND UK REPRESENTATIVE, IF REQUIRED]
          </p>
        </div>
        <h3 className="pickle-h3">10.2 California and other US states</h3>
        <div className="pickle-text">
          <p>
            If you are a California resident, the California Consumer Privacy Act (as amended in 2020, the &quot;CCPA&quot;) gives you the right to know what personal information we collect, use, and disclose; to delete it; to correct it; and to opt out of its sale or sharing. We do not sell or share personal information as those laws define the terms, and we do not use sensitive personal information for purposes that require a right to limit. The categories we collect are those in section 2, used for the purposes in section 3 and disclosed as described in section 6. You may use an authorised agent to make a request, and we will ask the agent for proof of authority. Residents of other US states with similar laws can make the same requests.
          </p>
        </div>
        <h3 className="pickle-h3">10.3 India</h3>
        <div className="pickle-text">
          <p>
            Under the Digital Personal Data Protection Act, 2023, you have the right to obtain a summary of the personal data we process and the processing activities, to have it corrected, completed, updated, or erased, to withdraw consent, to nominate another person to exercise your rights in the event of death or incapacity, and to have your grievances addressed. Our Grievance Officer is [GRIEVANCE OFFICER NAME AND CONTACT]. If you are not satisfied with our response, you may complain to the Data Protection Board of India.
          </p>
        </div>
        <h3 className="pickle-h3">10.4 Singapore</h3>
        <div className="pickle-text">
          <p>
            Under the Personal Data Protection Act 2012, you may ask to access your personal data and to learn how it has been used or disclosed in the past year, ask us to correct it, and withdraw consent to its collection, use, or disclosure. Withdrawing consent may mean we can no longer provide parts of the Service. Our Data Protection Officer can be reached at [DPO NAME AND CONTACT]. You may also contact the Personal Data Protection Commission.
          </p>
        </div>
        <h3 className="pickle-h3">10.5 United Arab Emirates</h3>
        <div className="pickle-text">
          <p>
            Under Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data, you may request access to your personal data, its transfer to another controller, its correction or erasure, and the restriction of its processing, and you may object to processing, including processing for direct marketing and decisions based solely on automated processing. You may complain to the UAE Data Office. If you are in a financial free zone with its own data protection law, such as the DIFC or ADGM, that law may apply instead, and you have the rights it provides.
          </p>
        </div>
        <h3 className="pickle-h3">10.6 Elsewhere</h3>
        <div className="pickle-text">
          <p>
            If you live in another country with data protection laws, you have the rights those laws provide. Contact us and we will help.
          </p>
        </div>
      </section>

      <section id="children" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">11. Children</h2>
        <div className="pickle-text">
          <p>
            The Service is not directed to children. You must be at least [MINIMUM AGE] to use it, and where the law of your country sets a higher age for consent to online services, you need the consent of a parent or guardian. We do not knowingly collect personal information from children without that consent, and we do not track, profile, or target advertising at children. In India, we treat anyone under 18 as a child and process their data only with verifiable consent from a parent or lawful guardian. If you believe a child has given us personal information without the required consent, contact founders@hydrilla.ai and we will delete it.
          </p>
        </div>
      </section>

      <section id="cookies" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">12. Cookies</h2>
        <div className="pickle-text">
          <p>
            We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the Service is used. The <Link href="/cookies">Cookie Policy</Link>{" "}explains the categories we use and how to manage them.
          </p>
        </div>
      </section>

      <section id="marketing" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">13. Marketing communications</h2>
        <div className="pickle-text">
          <p>
            We send product news, tips, usage summaries, and offers only where you have agreed or the law otherwise allows. Every one of these emails includes an unsubscribe link and a link to manage which emails you receive. Even if you opt out, we will still send messages you need about your account, billing, security, and changes to our terms.
          </p>
          <p>
            We use Customer.io to send our emails. It processes your email address, name, and information about how you use the Service, such as your plan, credit balance, and recent activity, so that we can send you messages that are relevant to you.
          </p>
        </div>
      </section>

      <section id="third-parties" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">14. Third-party software and links</h2>
        <div className="pickle-text">
          <p>
            Our plugins run inside third-party software, such as your DCC tool or game engine, and the MCP server runs inside an AI client you choose. That software, and any website we link to, is governed by its own terms and privacy policy, which we do not control.
          </p>
        </div>
      </section>

      <section id="changes" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">15. Changes to this policy</h2>
        <div className="pickle-text">
          <p>
            We may update this policy as the Service or the law changes. We will post the updated policy on this page with a new effective date. If a change materially affects how we use your personal information, we will tell you in advance by email or in the Service, and ask for your consent where the law requires it.
          </p>
        </div>
      </section>

      <section id="contact" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">16. Contact us</h2>
        <div className="pickle-text">
          <p>
            For questions about this policy or to exercise your rights, contact:
          </p>
          <ul>
            <li>Company: Hydrilla AI Pvt Ltd, 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India</li>
            <li>Email: founders@hydrilla.ai</li>
            <li>Data Protection Officer: [DPO NAME AND CONTACT]</li>
            <li>Grievance Officer (India): [GRIEVANCE OFFICER NAME AND CONTACT]</li>
          </ul>
        </div>
      </section>
    </PickleArticlePage>
    </>
  );
}
