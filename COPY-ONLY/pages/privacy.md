# Page: /privacy

| Field | Value |
|---|---|
| Route | `/privacy` |
| Status | Rename (was `/privacy-policy`) and full rewrite of the legal text (24 Oct 2026). Lawyer review before launch. |
| Title (absolute, do not append the template suffix) | Privacy Policy \| Hydrilla AI |
| Meta description | How Hydrilla collects, uses, shares, and protects account and service information, and the rights and choices you have. |
| OG title | Privacy Policy |
| H1 | Privacy Policy |
| Canonical | `https://hydrilla.ai/privacy` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Legal template: kicker, H1, effective-date line, a summary box, then numbered sections, each H2 with the id given in its label, and an "On this page" table of contents built from the H2s. Bracketed placeholders such as [LEGAL ENTITY NAME] are facts Rishi and counsel must supply (`VERIFY-LIST.md` section I). Render them as-is on a local build, but never deploy a legal page that still contains a bracketed placeholder: stop and report. A lawyer reviews these pages before launch. Move the page to `/privacy`, add the 301 from `/privacy-policy` (see `routing.md`), and remove any reversed `/privacy` → `/privacy-policy` rule in the same deploy.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)
<!-- COPY:START -->
**[Section 0: Header]**

Kicker: Legal

# Privacy Policy

Date line: Effective [EFFECTIVE DATE] | Hydrilla Legal

This Privacy Policy explains how Hydrilla AI collects, uses, shares, and protects personal information when you use our websites, the Hydrilla workspace, our plugins, the MCP server, and the REST API (together, the "Service"). It also explains the choices and rights you have. Please read it together with our [Terms of Service →](/terms) and [Cookie Policy →](/cookies).

**[Section 1: Summary]**

## Summary

This summary is for convenience. The full policy below is what applies.

- We do not sell your personal information, and we do not sell your content or generated 3D assets.
- We do not use your prompts, reference images, briefs, or generated models to train our models.
- We use your information to run the Service, process payments, keep accounts secure, support you, and meet our legal obligations.
- We share information only with service providers who process it on our behalf, and where the law requires it.
- You can ask to access, correct, delete, or export your personal information at any time by writing to founders@hydrilla.ai.

**[Section 2: Who we are, anchor #who-we-are]**

## 1. Who we are

The Service is provided by [LEGAL ENTITY NAME], registered at [REGISTERED ADDRESS] ("Hydrilla AI", "Hydrilla", "we", "us", or "our"). For personal information processed under this policy, Hydrilla AI is the data controller (in India, the data fiduciary; in Singapore, the organisation responsible).

When a studio or company buys the Service for its team under a separate agreement, that customer may control the personal information in its workspace, and we process it on the customer's instructions. In that case the customer's own privacy notice also applies, and questions about that workspace are best sent to the customer first.

**[Section 3: Information we collect, anchor #information-we-collect]**

## 2. Information we collect

We collect only the information we need to provide and improve the Service, keep it secure, and meet our legal obligations.

### 2.1 Information you give us

- **Account information.** Your name, email address, and sign-in details when you create an account, plus any profile details you choose to add.
- **Billing information.** The plan you choose, your billing contact details, and transaction records. Card payments are handled by our payment provider, [PAYMENT PROVIDER]. We do not store full card numbers on our servers.
- **Your content.** Prompts, reference images and other files you upload, briefs and conversations with Water Agent, and the 3D models, textures, and other outputs the Service generates for you ("Content").
- **Communications.** Messages you send to us, such as support requests, sales enquiries, security questionnaires, and job applications, including any attachments.

### 2.2 Information collected automatically

- **Usage information.** Pages you visit, features you use, generation jobs and their status, credit usage, and how you interact with the Service.
- **Device and log information.** IP address, browser type, operating system, device identifiers, approximate location derived from your IP address, and timestamps.
- **Plugin and API information.** When you use a plugin, the MCP server, or the REST API, we receive the requests your tools send, the identifier of the API key used, and technical details needed to complete the job.
- **Cookies and similar technologies.** As described in our [Cookie Policy →](/cookies).

### 2.3 Information from other sources

We receive limited information from the providers who help us run the Service, for example confirmation of a payment from our payment provider, or sign-in details from our authentication provider when you create or access an account.

We do not ask for sensitive personal information, such as health, biometric, or financial account data beyond billing. Please do not include it, or other people's personal information, in your prompts or uploads unless you have the right to share it.

**[Section 4: How we use information, anchor #how-we-use]**

## 3. How we use your information

We use personal information to:

- Create and manage your account, and authenticate you in the workspace, plugins, and API
- Provide the Service, including generating outputs from your inputs and storing them in your workspace
- Process payments, trials, renewals, and credit allowances
- Respond to support requests and communicate with you about your account, changes to the Service, and these policies
- Monitor reliability and performance, and improve the Service using usage information
- Detect, prevent, and respond to fraud, abuse, security incidents, and breaches of our [Terms →](/terms)
- Send product news and marketing where you have agreed to receive it, or where the law otherwise allows it
- Comply with legal obligations, resolve disputes, and enforce our agreements

We do not make decisions about you based solely on automated processing that produce legal or similarly significant effects.

**[Section 5: Your content and AI processing, anchor #ai-processing]**

## 4. Your content and AI processing

Your Content is processed to deliver the features you ask for. Some features send your inputs to AI service providers that process them on our behalf to produce a result, for example the image model that renders a reference picture before a text-to-3D generation. These providers act on our instructions and are listed in [PROCESSOR LIST].

We do not use your Content to train our models, on any plan. We do not sell Content, and we do not make it public. Your Content is stored securely and is available to your account or workspace, and to a limited number of our staff only where needed to support you, keep the Service secure, or meet a legal obligation.

**[Section 6: Legal bases, anchor #legal-bases]**

## 5. Legal bases for processing

If you are in the European Economic Area, the United Kingdom, or Switzerland, we rely on the following legal bases. Similar grounds apply under other laws described in section 10.

| Purpose | Legal basis |
|---|---|
| Providing the Service, your account, and your Content | Performance of our contract with you |
| Billing, trials, and credit allowances | Performance of our contract with you |
| Security, fraud and abuse prevention | Our legitimate interests in protecting the Service and its users |
| Service analytics and improvement | Our legitimate interests, or your consent where the law requires it |
| Marketing messages | Your consent, or our legitimate interests where the law allows |
| Tax, accounting, and legal compliance | Compliance with a legal obligation |

Where we rely on consent, you can withdraw it at any time. This does not affect processing that took place before you withdrew it.

**[Section 7: Sharing, anchor #sharing]**

## 6. How we share information

We share personal information only as described here.

- **Service providers.** Companies that process information on our behalf to provide authentication, payments, hosting and storage, analytics, AI processing, email, and customer support. They may use it only to provide their services to us, under written terms that require them to protect it. The current list is at [PROCESSOR LIST].
- **Your team.** If you work in a shared workspace, other members of that workspace can see the Content and activity within it.
- **Legal and safety.** Authorities, courts, or other parties where the law requires it, or where we believe disclosure is necessary to protect the rights, property, or safety of our users, the public, or Hydrilla AI.
- **Business transfers.** A buyer or successor, and their advisers, in connection with a merger, acquisition, financing, or sale of assets, subject to this policy.
- **With your direction.** Anyone else, when you ask us to share or give your consent.

We do not sell personal information, and we do not share it for cross-context behavioral advertising.

**[Section 8: International transfers, anchor #transfers]**

## 7. International transfers

We and our service providers may process personal information in countries other than the one where you live, including [HOSTING REGION]. Those countries may have different data protection laws.

When we transfer personal information out of the European Economic Area, the United Kingdom, or Switzerland to a country without an adequacy decision, we use safeguards recognised by those laws, such as the European Commission's Standard Contractual Clauses and the UK Addendum. Transfers from India, Singapore, and the United Arab Emirates are made in line with the requirements of the laws described in section 10. You can ask us for more detail about the safeguards we use.

**[Section 9: Retention, anchor #retention]**

## 8. How long we keep information

We keep personal information only for as long as we need it for the purposes in this policy.

- **Account information** for as long as your account is open, and for [RETENTION PERIOD] after it closes.
- **Content** until you delete it or close your account. Deleted Content may remain in backups for up to [BACKUP RETENTION PERIOD] before it is permanently removed.
- **Billing records** for as long as tax and accounting laws require.
- **Logs and security records** for [LOG RETENTION PERIOD], unless we need them longer to investigate an incident.

When we no longer need information, we delete it or de-identify it so it can no longer be linked to you.

**[Section 10: Security, anchor #security]**

## 9. Security

We protect personal information with technical and organisational measures appropriate to the risk. Your data is stored securely, access to workspace content requires a signed-in account, and our staff access it only where needed. The [security page →](/security) summarises how accounts, stored assets, and exports are handled.

No method of transmission or storage is completely secure, so we cannot guarantee absolute security. If a breach affects your personal information, we will notify you and the relevant authorities as the law requires. You can help by keeping your sign-in details and API keys private.

**[Section 11: Your rights, anchor #your-rights]**

## 10. Your rights

Depending on where you live, you have rights over your personal information. Wherever you are, you can ask us to access, correct, delete, or export it, and to stop marketing messages. To make a request, email founders@hydrilla.ai from the email address on your account. We may need to confirm your identity before we act, and we will reply within the time the applicable law requires. We will not treat you differently for exercising your rights.

### 10.1 European Economic Area, United Kingdom, and Switzerland

Under the GDPR and UK GDPR you have the right to access your personal information, correct it, erase it, restrict or object to its processing, receive it in a portable format, and withdraw consent. You can also complain to your local data protection authority, or in the UK to the Information Commissioner's Office. We would welcome the chance to address your concern first. [EU AND UK REPRESENTATIVE, IF REQUIRED]

### 10.2 California and other US states

If you are a California resident, the California Consumer Privacy Act (as amended in 2020, the "CCPA") gives you the right to know what personal information we collect, use, and disclose; to delete it; to correct it; and to opt out of its sale or sharing. We do not sell or share personal information as those laws define the terms, and we do not use sensitive personal information for purposes that require a right to limit. The categories we collect are those in section 2, used for the purposes in section 3 and disclosed as described in section 6. You may use an authorised agent to make a request, and we will ask the agent for proof of authority. Residents of other US states with similar laws can make the same requests.

### 10.3 India

Under the Digital Personal Data Protection Act, 2023, you have the right to obtain a summary of the personal data we process and the processing activities, to have it corrected, completed, updated, or erased, to withdraw consent, to nominate another person to exercise your rights in the event of death or incapacity, and to have your grievances addressed. Our Grievance Officer is [GRIEVANCE OFFICER NAME AND CONTACT]. If you are not satisfied with our response, you may complain to the Data Protection Board of India.

### 10.4 Singapore

Under the Personal Data Protection Act 2012, you may ask to access your personal data and to learn how it has been used or disclosed in the past year, ask us to correct it, and withdraw consent to its collection, use, or disclosure. Withdrawing consent may mean we can no longer provide parts of the Service. Our Data Protection Officer can be reached at [DPO NAME AND CONTACT]. You may also contact the Personal Data Protection Commission.

### 10.5 United Arab Emirates

Under Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data, you may request access to your personal data, its transfer to another controller, its correction or erasure, and the restriction of its processing, and you may object to processing, including processing for direct marketing and decisions based solely on automated processing. You may complain to the UAE Data Office. If you are in a financial free zone with its own data protection law, such as the DIFC or ADGM, that law may apply instead, and you have the rights it provides.

### 10.6 Elsewhere

If you live in another country with data protection laws, you have the rights those laws provide. Contact us and we will help.

**[Section 12: Children, anchor #children]**

## 11. Children

The Service is not directed to children. You must be at least [MINIMUM AGE] to use it, and where the law of your country sets a higher age for consent to online services, you need the consent of a parent or guardian. We do not knowingly collect personal information from children without that consent, and we do not track, profile, or target advertising at children. In India, we treat anyone under 18 as a child and process their data only with verifiable consent from a parent or lawful guardian. If you believe a child has given us personal information without the required consent, contact founders@hydrilla.ai and we will delete it.

**[Section 13: Cookies, anchor #cookies]**

## 12. Cookies

We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the Service is used. The [Cookie Policy →](/cookies) explains the categories we use and how to manage them.

**[Section 14: Marketing, anchor #marketing]**

## 13. Marketing communications

We send product news and offers only where you have agreed or the law otherwise allows. Every marketing email includes a way to unsubscribe. Even if you opt out, we will still send messages you need about your account, billing, security, and changes to our terms.

**[Section 15: Third-party software, anchor #third-parties]**

## 14. Third-party software and links

Our plugins run inside third-party software, such as your DCC tool or game engine, and the MCP server runs inside an AI client you choose. That software, and any website we link to, is governed by its own terms and privacy policy, which we do not control.

**[Section 16: Changes, anchor #changes]**

## 15. Changes to this policy

We may update this policy as the Service or the law changes. We will post the updated policy on this page with a new effective date. If a change materially affects how we use your personal information, we will tell you in advance by email or in the Service, and ask for your consent where the law requires it.

**[Section 17: Contact, anchor #contact]**

## 16. Contact us

For questions about this policy or to exercise your rights, contact:

- Company: [LEGAL ENTITY NAME], [REGISTERED ADDRESS]
- Email: founders@hydrilla.ai
- Data Protection Officer: [DPO NAME AND CONTACT]
- Grievance Officer (India): [GRIEVANCE OFFICER NAME AND CONTACT]
<!-- COPY:END -->

## CTAs
None.

## Internal links on this page
- `/cookies`
- `/privacy`
- `/security`
- `/terms`
