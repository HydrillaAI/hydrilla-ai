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
    href: "/terms",
    date: "Oct 26, 2026",
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
      date="Effective October 26, 2026"
      author="Hydrilla Legal"
      heroThumbVariant="privacy-enclave"
      ctaLabel="Contact Privacy"
      ctaHref="mailto:founders@hydrilla.ai"
      relatedItems={RELATED}
    >
      <div className="pickle-text">
          <p>
            Welcome to Hydrilla AI, which is operated by Hydrilla AI Private Limited, registered at 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Hydrilla AI&quot;). Hydrilla AI provides users and visitors (&quot;you&quot; and &quot;your&quot;) with an AI 3D workspace for creating 3D content with generative AI, including text-to-3D and image-to-3D generation with BlueFox, Water Agent, plugins, the MCP server, the REST API, and a community for sharing work (the &quot;Services&quot;).
          </p>
          <p>
            This Privacy Policy (the &quot;Policy&quot;) describes and governs how we collect, use, share, and protect (collectively, &quot;process&quot;) personal information in the context of our Services. Please read it before you use or submit information through the Services. It should be read together with our <Link href="/terms">Terms of Service</Link> and <Link href="/cookies">Cookie Policy</Link>. To the extent the law allows, the English version of this Policy is binding and other translations are for convenience only.
          </p>
          <p>
            If you are in the European Economic Area, the United Kingdom, or Switzerland (&quot;Europe&quot;), the data controller for the purposes of the GDPR is Hydrilla AI Private Limited, which can be reached as set out in Section 13, and you do not need to consent to this Policy but you acknowledge that you have read and understood it. If you are a resident of California, the California Consumer Privacy Act and the California Privacy Rights Act give you additional rights. Residents of India, Singapore, and the United Arab Emirates also have rights under their local laws, described in Section 10. This Policy applies to the processing of your personal information on the premise that it does not conflict with the laws and regulations that apply to you.
          </p>
      </div>

      <nav aria-label="On this page" className="pickle-legal-toc">
        <p className="pickle-legal-toc-title">On this page</p>
        <ol>
          <li>
            <a href="#definitions">1. Definitions</a>
          </li>
          <li>
            <a href="#information-we-collect">2. What Information We Collect</a>
          </li>
          <li>
            <a href="#how-we-use">3. How We Use Your Information</a>
          </li>
          <li>
            <a href="#sharing">4. How We Disclose Your Information</a>
          </li>
          <li>
            <a href="#children">5. How We Handle Children&apos;s Personal Information</a>
          </li>
          <li>
            <a href="#security">6. Security</a>
          </li>
          <li>
            <a href="#do-not-track">7. Do-Not-Track Signals</a>
          </li>
          <li>
            <a href="#retention">8. How Your Information Is Stored and Transferred</a>
          </li>
          <li>
            <a href="#your-rights">9. Your Rights</a>
          </li>
          <li>
            <a href="#regions">10. Supplemental Terms for Certain Regions</a>
          </li>
          <li>
            <a href="#other-terms">11. Other Terms</a>
          </li>
          <li>
            <a href="#changes">12. How the Policy Will Be Updated</a>
          </li>
          <li>
            <a href="#contact">13. How to Contact Us</a>
          </li>
        </ol>
      </nav>

      <section id="definitions" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">1. Definitions</h2>
        <div className="pickle-text">
          <p>
            In this Policy, unless the context requires otherwise:
          </p>
          <ul>
            <li><strong>We, Us, or Our</strong> refers to Hydrilla AI Private Limited.</li>
            <li><strong>Personal Information</strong> (or personal data) is any information that relates to an identified or identifiable individual.</li>
            <li><strong>Data Controller</strong> is the person that alone or jointly with others determines the purposes and means of processing personal information. In India this is the data fiduciary, and in Singapore the organisation responsible. For the purposes of this Policy, Hydrilla AI is the Data Controller.</li>
            <li><strong>Service Provider</strong> means any person that processes data on our behalf to provide or support the Services. For the purposes of the GDPR, Service Providers are Data Processors.</li>
            <li><strong>Cookies</strong> are small files placed on your computer or device by a website, and other similar technologies described in our <Link href="/cookies">Cookie Policy</Link>.</li>
            <li><strong>Usage Data</strong> is data collected automatically, either generated by the use of the Services or from the Service infrastructure itself, such as the duration of a page visit.</li>
            <li><strong>Content</strong> means the prompts, reference images, files, briefs, and conversations you submit, and the 3D models, textures, and other outputs the Services generate for you.</li>
            <li><strong>Sell</strong> means disclosing personal information to another business or third party for money or other valuable consideration.</li>
            <li><strong>Website</strong> refers to Hydrilla AI, accessible from https://hydrilla.ai.</li>
          </ul>
        </div>
      </section>

      <section id="information-we-collect" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">2. What Information We Collect</h2>
        <div className="pickle-text">
          <p>
            As further described below, when you use or otherwise access the Services, we collect information when you provide it directly to us and when we passively collect it from your browser or device. We collect only what we need to provide and improve the Services, keep them secure, and meet our legal obligations.
          </p>
        </div>
        <h3 className="pickle-h3">2.1 Information That You Provide Directly to Us</h3>
        <div className="pickle-text">
          <p>
            <strong>A. Registration Information.</strong> When you register or open an account, we may collect your name, email address, and sign-in details, and any profile information you choose to add, such as a username, bio, or profile picture. If you are in Europe, we process this on the basis of entering into and performing our contract with you.
          </p>
          <p>
            <strong>B. Purchase Information.</strong> When you purchase a paid plan, we collect the plan you choose, your billing contact details, and transaction records. Card payments are handled by our payment provider, Dodo Payments, on our behalf. We do not store full card numbers on our servers. If you are in Europe, we process this on the basis of entering into and performing our contract with you.
          </p>
          <p>
            <strong>C. Content You Provide Through Our Services.</strong> We collect and securely store the Content you submit and generate through the Services, including prompts, reference images and other files, briefs and conversations with Water Agent, and the 3D models and textures you create. This may include personal information you choose to include. If you include other people&apos;s personal information, you confirm that you are authorised to do so. Content you choose to post to the community, along with your public profile, is visible to other users.
          </p>
          <p>
            <strong>D. Communications to Us.</strong> When you contact us, for example for support, sales enquiries, security questionnaires, or job applications, we collect the information you choose to provide, such as your contact details and the contents of your message and any attachments. Please do not send financial or sensitive data through our channels unless we specifically ask for it.
          </p>
        </div>
        <h3 className="pickle-h3">2.2 Information That Is Passively or Automatically Collected</h3>
        <div className="pickle-text">
          <p>
            <strong>A. Usage Information.</strong> When you interact with the Services, we automatically receive and store certain information from the devices you use, such as your IP address, browser settings, device information, operating system, pages visited, features used, generation jobs and their status, credit usage, crash data, session IDs, timestamps, and approximate location derived from your IP address. When you use a plugin, the MCP server, or the REST API, we also receive the requests your tools send and the identifier of the API key used. We collect this to ensure the security and stability of the Services. If you are in Europe, we process this on the basis of our legitimate interests.
          </p>
          <p>
            <strong>B. Email Interaction Information.</strong> When we email you, we record whether the message was delivered, opened, or clicked, so we can keep our emails relevant and our sending reputation healthy.
          </p>
          <p>
            <strong>C. Cookies and Other Electronic Technologies.</strong> We collect some information with commonly used technologies such as tracking pixels, JavaScript, cookies, and local storage, as described in our <Link href="/cookies">Cookie Policy</Link>.
          </p>
        </div>
        <h3 className="pickle-h3">2.3 Information From Other Sources</h3>
        <div className="pickle-text">
          <p>
            We receive limited information from the providers who help us run the Services, for example confirmation of a payment from our payment provider, or sign-in details from our authentication provider when you create or access an account. We do not ask for sensitive personal information, such as health or biometric data. Please do not include it in your prompts or uploads.
          </p>
        </div>
      </section>

      <section id="how-we-use" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">3. How We Use Your Information</h2>
        <div className="pickle-text">
          <p>
            We use the information collected from the Services in a manner consistent with this Policy, for the following purposes.
          </p>
        </div>
        <h3 className="pickle-h3">3.1 Provision of Services</h3>
        <div className="pickle-text">
          <p>
            We use your information to operate, maintain, and provide the Services in accordance with this Policy and our Terms of Service, including to create and manage your account, authenticate you in the workspace, plugins, and API, generate outputs from your inputs and store them in your workspace, process payments, trials, renewals, and credit allowances, and respond to support requests.
          </p>
        </div>
        <h3 className="pickle-h3">3.2 Marketing and Promotion</h3>
        <div className="pickle-text">
          <p>
            Where you have agreed, or the law otherwise allows, we send product news, tips, usage summaries, and offers to the email address you provided. You can opt out of these messages at any time by unsubscribing or following the instructions in them.
          </p>
        </div>
        <h3 className="pickle-h3">3.3 Analytics and Improvement of Our Services</h3>
        <div className="pickle-text">
          <p>
            We use usage information to manage, develop, improve, and maintain the Services, to monitor reliability and performance, and to analyse usage trends in order to improve their accuracy, effectiveness, security, and usability. If you are in Europe, we process this on the basis of our legitimate interests, or your consent where the law requires it.
          </p>
        </div>
        <h3 className="pickle-h3">3.4 Your Content and AI Processing</h3>
        <div className="pickle-text">
          <p>
            Your Content is processed to deliver the features you ask for. Some features send your inputs to AI service providers that process them on our behalf to produce a result, for example the image model that renders a reference picture before a text-to-3D generation. These providers act on our instructions. We do not use your Content to train our models, on any plan. We do not sell Content and we do not make it public unless you post it to the community. Your Content is available to your account or workspace, and to a limited number of our staff only where needed to support you, keep the Services secure, or meet a legal obligation.
          </p>
        </div>
        <h3 className="pickle-h3">3.5 Safety, Security, and Legal Compliance</h3>
        <div className="pickle-text">
          <p>
            We use information to protect the security and integrity of the Services, to detect, prevent, and respond to fraud, abuse, security incidents, and breaches of our Terms, to comply with legal obligations, to resolve disputes, and to enforce our agreements. We do not make decisions about you based solely on automated processing that produce legal or similarly significant effects.
          </p>
        </div>
      </section>

      <section id="sharing" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">4. How We Disclose Your Information</h2>
        <div className="pickle-text">
          <p>
            There are certain circumstances in which we share information collected through the Services with third parties without further notice to you, as set out below. We do not sell personal information, and we do not share it for cross-context behavioral advertising.
          </p>
        </div>
        <h3 className="pickle-h3">4.1 Third-Party Service Providers Who Process Your Data on Our Behalf</h3>
        <div className="pickle-text">
          <p>
            We share information with companies that process it on our behalf to provide authentication, payments, hosting and storage, analytics, AI processing, email, and customer support. They may use it only to provide their services to us, under written terms that require them to protect it. Our current providers are Clerk (authentication), Dodo Payments (payments), Vercel (hosting), Supabase (database), PostHog, Google Analytics, and Vercel Analytics (analytics), Customer.io (email), and Google (Gemini), OpenAI, and Anthropic (AI processing), together with the cloud GPU providers that run our generation workloads.
          </p>
        </div>
        <h3 className="pickle-h3">4.2 Government Authorities and Law Enforcement Officials</h3>
        <div className="pickle-text">
          <p>
            Personal information may be shared with authorities, courts, or other parties where the law requires it, or where we believe disclosure is necessary to protect the rights, property, or safety of our users, the public, or Hydrilla AI.
          </p>
        </div>
        <h3 className="pickle-h3">4.3 Potential Buyers and Advisers</h3>
        <div className="pickle-text">
          <p>
            In the event of a merger, acquisition, financing, reorganisation, or sale of assets, or steps taken in anticipation of one, your personal information may be shared with our advisers and any prospective buyer and its advisers, and will be passed to the new owners of the business, subject to this Policy.
          </p>
        </div>
        <h3 className="pickle-h3">4.4 Third Parties You Choose to Link</h3>
        <div className="pickle-text">
          <p>
            When you link to or interact directly with third-party companies or software, such as your DCC tool, game engine, or AI client, their use of your personal information is governed by their own privacy notices. We encourage you to read them.
          </p>
        </div>
        <h3 className="pickle-h3">4.5 Your Team</h3>
        <div className="pickle-text">
          <p>
            If you work in a shared workspace, other members of that workspace can see the Content and activity within it.
          </p>
        </div>
        <h3 className="pickle-h3">4.6 Your Consent</h3>
        <div className="pickle-text">
          <p>
            We may share your information for other purposes if you direct us to do so or you consent to the sharing.
          </p>
        </div>
        <h3 className="pickle-h3">4.7 Aggregated Data</h3>
        <div className="pickle-text">
          <p>
            We aggregate, anonymise, or de-identify information so that it no longer relates to you individually, and we use it for lawful purposes such as research on customer interests and behaviour.
          </p>
        </div>
        <h3 className="pickle-h3">4.8 Other Users of Our Services</h3>
        <div className="pickle-text">
          <p>
            We provide your information to other users if you choose to make it public in a publicly accessible area of the Services, such as in your posts, comments, or public profile.
          </p>
        </div>
      </section>

      <section id="children" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">5. How We Handle Children&apos;s Personal Information</h2>
        <div className="pickle-text">
          <p>
            The Services are not directed to children. You must be at least 18 years old to use them. We do not knowingly collect personal information from anyone under 18, and we do not track, profile, or target advertising at children. If we discover that a child has provided us with personal information, we will promptly delete it. If you believe a child has given us personal information, contact us at founders@hydrilla.ai and we will delete it to the extent required by law.
          </p>
        </div>
      </section>

      <section id="security" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">6. Security</h2>
        <div className="pickle-text">
          <p>
            We are committed to keeping your personal information safe. We protect it with technical and organisational measures appropriate to the risk, including encryption of data in transit, access controls, and limiting staff access to what is needed. Access to workspace Content requires a signed-in account, and third parties that process data for us are bound to protect it. The <Link href="/security">security page</Link> summarises how accounts, stored assets, and exports are handled.
          </p>
          <p>
            No transmission of data over the internet is completely secure, so we cannot guarantee the security of information transmitted to us. If a breach affects your personal information, we will notify you and the relevant authorities as the law requires. You can help by keeping your sign-in details and API keys private. If you believe you have found a security vulnerability, please email founders@hydrilla.ai.
          </p>
        </div>
      </section>

      <section id="do-not-track" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">7. Do-Not-Track Signals</h2>
        <div className="pickle-text">
          <p>
            Do Not Track (&quot;DNT&quot;) is a privacy preference that users can set in certain web browsers. We do not currently recognise or respond to browser-initiated DNT signals, as the internet industry has not yet agreed on what DNT means or how to respond to it.
          </p>
        </div>
      </section>

      <section id="retention" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">8. How Your Information Is Stored and Transferred</h2>
        <div className="pickle-text">
          <p>
            We keep personal information only for as long as we need it for the purposes in this Policy and to meet our legal obligations:
          </p>
          <ul>
            <li><strong>Account information</strong> for as long as your account is open, and for 90 days after it closes, unless we must keep certain records longer by law.</li>
            <li><strong>Content</strong> until you delete it or close your account. Deleted Content may remain in backups for up to 30 days before it is permanently removed.</li>
            <li><strong>Billing records</strong> for as long as tax and accounting laws require.</li>
            <li><strong>Logs and security records</strong> for up to 12 months, unless we need them longer to investigate an incident.</li>
          </ul>
          <p>
            When we no longer need information, we delete it or de-identify it so it can no longer be linked to you.
          </p>
          <p>
            We and our service providers may process personal information in countries other than the one where you live, including the United States, where our hosting and database are located, and India. Those countries may have data protection laws that are different from the laws where you live, and we endeavour to safeguard your information consistently with applicable law. When we transfer personal information out of Europe to a country without an adequacy decision, we use safeguards recognised by those laws, such as the European Commission&apos;s Standard Contractual Clauses and the UK Addendum. Transfers from India, Singapore, and the United Arab Emirates are made in line with the requirements of their laws. You can ask us for more detail about the safeguards we use.
          </p>
        </div>
      </section>

      <section id="your-rights" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">9. Your Rights</h2>
        <div className="pickle-text">
          <p>
            You have certain rights regarding your personal information, subject to applicable law. These include the right to:
          </p>
          <ul>
            <li><strong>Access</strong> your personal information and receive a copy of it.</li>
            <li><strong>Rectify</strong> incorrect, incomplete, or inaccurate information.</li>
            <li><strong>Erase</strong> your personal information, for example when it is no longer needed or has been processed unlawfully.</li>
            <li><strong>Object</strong> to processing, including for direct marketing or where we rely on legitimate interests.</li>
            <li><strong>Restrict</strong> processing in certain circumstances, such as while we verify its accuracy.</li>
            <li><strong>Data portability:</strong> receive your personal information in a structured, commonly used, machine-readable format and transmit it to another controller.</li>
            <li><strong>Withdraw consent</strong> at any time where we rely on consent. This does not affect processing before you withdrew it.</li>
            <li><strong>Not be subject to a decision based solely on automated processing</strong> that produces legal or similarly significant effects.</li>
            <li><strong>Complain</strong> to your local data protection authority. We would appreciate the chance to address your concern first.</li>
          </ul>
          <p>
            These rights may be limited in some situations, for example where we have a legal requirement to keep the data or it is needed for the performance of a contract. To exercise them, email founders@hydrilla.ai from the address on your account. You can also update your information in your account settings. We will not treat you differently for exercising your rights.
          </p>
        </div>
      </section>

      <section id="regions" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">10. Supplemental Terms for Certain Regions</h2>
        <h3 className="pickle-h3">10.1 Residents of Europe</h3>
        <div className="pickle-text">
          <p>
            We process personal information on the following legal bases.
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
                <th>Providing the Services, your account, and your Content</th>
                <td>Performance of our contract with you</td>
              </tr>
              <tr>
                <th>Billing, trials, and credit allowances</th>
                <td>Performance of our contract with you</td>
              </tr>
              <tr>
                <th>Security, fraud and abuse prevention</th>
                <td>Our legitimate interests in protecting the Services and their users</td>
              </tr>
              <tr>
                <th>Analytics and improvement</th>
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
            Under the GDPR and UK GDPR you have the rights described in Section 9. You can complain to your local data protection authority, or in the UK to the Information Commissioner&apos;s Office. International transfers are described in Section 8.
          </p>
        </div>
        <h3 className="pickle-h3">10.2 Residents of California and Other US States</h3>
        <div className="pickle-text">
          <p>
            If you are a California resident, the California Consumer Privacy Act (as amended, the &quot;CCPA&quot;) gives you the right to know what personal information we collect, use, and disclose; to delete it; to correct it; to opt out of its sale or sharing; and to limit the use of sensitive personal information. We do not sell or share personal information as those laws define the terms, we do not offer financial incentives in exchange for personal information, and we do not use sensitive personal information for purposes that give rise to a right to limit. The categories we collect are described in Section 2, used for the purposes in Section 3, and disclosed as described in Section 4. We do not currently disclose personal information to third parties for their own direct marketing purposes. You may use an authorised agent to make a request, and we will ask the agent for proof of authority. Residents of other US states with similar laws can make the same requests.
          </p>
        </div>
        <h3 className="pickle-h3">10.3 Residents of India</h3>
        <div className="pickle-text">
          <p>
            Under the Digital Personal Data Protection Act, 2023, you have the right to obtain a summary of the personal data we process and the processing activities, to have it corrected, completed, updated, or erased, to withdraw consent, to nominate another person to exercise your rights in the event of death or incapacity, and to have your grievances addressed. Our Grievance Officer is Tharak Nagaveti, Hydrilla AI Private Limited, who can be reached at founders@hydrilla.ai and will acknowledge your grievance within 48 hours and resolve it within 30 days. If you are not satisfied with our response, you may complain to the Data Protection Board of India.
          </p>
        </div>
        <h3 className="pickle-h3">10.4 Residents of Singapore</h3>
        <div className="pickle-text">
          <p>
            Under the Personal Data Protection Act 2012, you may ask to access your personal data and to learn how it has been used or disclosed in the past year, ask us to correct it, and withdraw consent to its collection, use, or disclosure. Withdrawing consent may mean we can no longer provide parts of the Services. Our Data Protection Officer can be reached at founders@hydrilla.ai. You may also contact the Personal Data Protection Commission.
          </p>
        </div>
        <h3 className="pickle-h3">10.5 Residents of the United Arab Emirates</h3>
        <div className="pickle-text">
          <p>
            Under Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data, you may request access to your personal data, its transfer to another controller, its correction or erasure, and the restriction of its processing, and you may object to processing, including processing for direct marketing and decisions based solely on automated processing. You may complain to the UAE Data Office. If you are in a financial free zone with its own data protection law, such as the DIFC or ADGM, that law may apply instead.
          </p>
        </div>
        <h3 className="pickle-h3">10.6 Elsewhere</h3>
        <div className="pickle-text">
          <p>
            If you live in another country with data protection laws, you have the rights those laws provide. Contact us and we will help.
          </p>
        </div>
      </section>

      <section id="other-terms" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">11. Other Terms</h2>
        <div className="pickle-text">
          <p>
            Each marketing email we send contains instructions to opt out of future marketing communications, and you can also click the &quot;unsubscribe&quot; link in any marketing email. If you opt out, we may still send you messages you need about your account, billing, security, and changes to our terms. We use Customer.io to send our emails. It processes your email address, name, and information about how you use the Services, such as your plan, credit balance, and recent activity, so that we can send you relevant messages.
          </p>
          <p>
            To exercise your rights, send your request to the contact in Section 13. For your privacy and security, we may ask you to confirm your identity before we act, and we may take up to 30 days to fulfil a request, or the time the applicable law requires. Our plugins run inside third-party software, and the MCP server runs inside an AI client you choose; that software, and any website we link to, is governed by its own terms and privacy policy. Your access to and use of the Services is also subject to our <Link href="/terms">Terms of Service</Link>.
          </p>
        </div>
      </section>

      <section id="changes" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">12. How the Policy Will Be Updated</h2>
        <div className="pickle-text">
          <p>
            We may update or modify this Policy at any time. When we do, we will update the effective date at the top of this page. Where a change will have a substantial impact on you or on how we process your personal information, we will tell you in advance by email or in the Services, and ask for your consent where the law requires it. If you disagree with our revisions, you can close your account or stop using the Services. If you are in Europe, you are not required to agree to changes to this Policy, but you acknowledge that you have read and understood its terms.
          </p>
        </div>
      </section>

      <section id="contact" className="pickle-head-block scroll-mt-28">
        <h2 className="pickle-h2">13. How to Contact Us</h2>
        <div className="pickle-text">
          <p>
            If you have any questions about this Policy or our information practices, or wish to exercise your rights, contact:
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
          <p>
            Data Protection Officer: <a href="mailto:founders@hydrilla.ai">founders@hydrilla.ai</a>
            <br />
            Grievance Officer (India): Tharak Nagaveti, <a href="mailto:founders@hydrilla.ai">founders@hydrilla.ai</a>
          </p>
        </div>
      </section>
    </PickleArticlePage>
    </>
  );
}
