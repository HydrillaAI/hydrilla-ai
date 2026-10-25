# Page: /terms

| Field | Value |
|---|---|
| Route | `/terms` |
| Status | Rename (was `/terms-and-conditions`) and full rewrite of the legal text (24 Oct 2026). Lawyer review before launch. |
| Title (absolute, do not append the template suffix) | Terms of Service \| Hydrilla AI |
| Meta description | The terms for using Hydrilla and BlueFox generation, including accounts, payments, ownership of generated 3D assets, and acceptable use. |
| OG title | Terms of Service |
| H1 | Terms of Service |
| Canonical | `https://hydrilla.ai/terms` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Legal template: kicker, H1, effective-date line, a summary box, then numbered sections, each H2 with the id given in its label, and an "On this page" table of contents built from the H2s. Bracketed placeholders such as [LEGAL ENTITY NAME] are facts Rishi and counsel must supply (`VERIFY-LIST.md` section I). Render them as-is on a local build, but never deploy a legal page that still contains a bracketed placeholder: stop and report. A lawyer reviews these pages before launch. Move the page to `/terms`, add the 301 from `/terms-and-conditions` (see `routing.md`), and remove any reversed `/terms` → `/terms-and-conditions` rule in the same deploy.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)
<!-- COPY:START -->
**[Section 0: Header]**

Kicker: Legal

# Terms of Service

Date line: Effective [EFFECTIVE DATE] | Hydrilla Legal

These Terms of Service ("Terms") are an agreement between you and [LEGAL ENTITY NAME], registered at [REGISTERED ADDRESS] ("Hydrilla AI", "we", "us", or "our"). They govern your use of our websites, the Hydrilla workspace, Water Agent, our plugins, the MCP server, and the REST API (together, the "Service"). By creating an account or using the Service, you agree to these Terms. If you use the Service on behalf of a company or studio, you confirm that you have authority to bind it, and "you" includes that organisation.

**[Section 1: Summary]**

## Summary

This summary is for convenience. The full Terms below are what apply.

- You keep ownership of what you upload, and you own the 3D outputs you generate, subject to these Terms.
- We do not use your content to train our models.
- Paid plans renew each billing period until you cancel. Credits reset each billing month and do not carry over.
- The 14-day trial needs a card.
- Use the Service lawfully, respect other people's rights, and do not misuse the Service.

**[Section 2: The Service, anchor #service]**

## 1. The Service

Hydrilla AI is an AI 3D workspace. It lets you generate 3D models from text and images with BlueFox, Hydrilla's 3D model, review them in the browser, work with Water Agent, and use the results in your own tools through downloads, plugins, the MCP server, and the REST API. We improve the Service continually, so features may change, and we may add or remove features. If we remove a feature that is central to a paid plan, we will give you reasonable notice.

**[Section 3: Eligibility and accounts, anchor #accounts]**

## 2. Eligibility and accounts

You must be at least [MINIMUM AGE] to use the Service, and old enough to form a binding contract where you live, or have the consent of a parent or guardian where the law allows it. You may not use the Service if the law prohibits you from doing so.

You need an account to use most of the Service. Give us accurate information and keep it up to date. Keep your sign-in details and API keys confidential, because you are responsible for all activity under your account and keys. Tell us at founders@hydrilla.ai straight away if you believe your account or a key has been compromised.

If you use a shared workspace, the workspace owner controls who has access and may be able to view, manage, or remove Content in it.

**[Section 4: Plans and billing, anchor #billing]**

## 3. Plans, credits, and billing

**Plans.** We offer a Free plan and paid Monthly and Hourly plans, as described on our [pricing page →](/pricing). Hourly plans let you generate only during the daily window that comes with the plan. Prices, plan contents, and credit costs are shown on the pricing page and at checkout.

**Credits.** Generations use credits from your plan's monthly allowance, at the costs shown on the pricing page. Allowances reset at the start of each billing month, and unused credits do not carry over. Credits have no cash value, cannot be transferred or sold, and are not refundable except where these Terms or the law say otherwise.

**Billing and renewal.** Paid plans are billed in advance for each billing period and renew automatically until you cancel. By starting a paid plan, you authorise us and our payment provider to charge your payment method for each period. Prices exclude taxes unless stated, and you are responsible for applicable taxes such as VAT or GST. If a payment fails, we may suspend paid features until it succeeds.

**Price changes.** We may change prices. A change applies from your next billing period after we give you notice, and you can cancel before it takes effect.

**[Section 5: Trial, anchor #trial]**

## 4. Free trial

You can try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card. Unless you cancel before the trial ends, your plan continues as a paid subscription and your card is charged for the first billing period [TRIAL CONVERSION TERMS]. We may limit trials to one per person or organisation, and we may end a trial early if we see misuse.

**[Section 6: Cancellation and refunds, anchor #cancellation]**

## 5. Cancellation and refunds

You can cancel a paid plan at any time from your account or by writing to founders@hydrilla.ai. Cancellation takes effect at the end of the current billing period [CONFIRM CANCELLATION TIMING], and you keep paid features until then. After that, your account moves to the Free plan unless you close it.

[REFUND TERMS]

Nothing in these Terms removes refund or cancellation rights that consumer law in your country gives you.

**[Section 7: Your content and ownership, anchor #ownership]**

## 6. Your content and ownership of outputs

**Your inputs.** You keep all rights in the prompts, images, files, and briefs you submit ("Inputs").

**Your outputs.** As between you and us, and to the extent the law allows, you own the 3D models, textures, and other results the Service generates for you ("Outputs"), and you may use them for personal and commercial purposes. Inputs and Outputs together are "Content". Because AI models can produce similar results for similar requests, other users may receive Outputs that resemble yours, and those Outputs are not yours. The law on ownership of AI-generated material differs between countries and is still developing, so we do not promise that Outputs are protected by copyright where you are.

**Permission you give us.** You give us a worldwide, non-exclusive, royalty-free permission to host, store, copy, process, and display your Content only as needed to provide, secure, and support the Service for you. We do not use your Content to train our models, and we do not sell it or make it public.

**Your responsibility.** You confirm that you have the rights needed to submit your Inputs, and that your Inputs and your use of Outputs do not break the law or infringe anyone's rights. Review Outputs before you rely on them, and check that they are suitable for your purpose.

**[Section 8: Acceptable use, anchor #acceptable-use]**

## 7. Acceptable use

Use the Service lawfully and respectfully. You must not use it to create, upload, or share:

- Sexual content involving minors, or any content that sexualises or exploits children
- Sexually explicit material, or depictions of real people that are intimate, degrading, or made without their consent
- Content that harasses, threatens, or promotes violence or hatred against people or groups based on who they are
- Content that infringes copyright, trademarks, or other rights, including prompts or reference images designed to reproduce someone else's protected work or brand
- Content that promotes terrorism, self-harm, or illegal goods and activities
- Deceptive content that could cause real-world harm, or other people's private information shared without a right to do so

You must also not:

- Access or try to access the Service, other accounts, or our systems without permission, or test their security without our written agreement
- Interfere with or overload the Service, or get around credit limits, usage windows, or other restrictions
- Use bots, scrapers, or other automated means to access the Service, other than our API and MCP server within their limits
- Copy, reverse engineer, or extract our models, weights, or source code, except where the law allows it despite this restriction (a model we publish separately, for example on Hugging Face, is governed by the license published with it)
- Use the Service or its Outputs to build a competing AI 3D model or service
- Resell, sublicense, or share access to your account, or share API keys outside your organisation, without our written agreement

We may remove Content, suspend features, or close accounts that break these rules, and we may report illegal content to the authorities.

**[Section 9: Intellectual property, anchor #intellectual-property]**

## 8. Our intellectual property

The Service, including its software, models, design, and brand, belongs to Hydrilla AI and its licensors. We give you a limited, non-exclusive, non-transferable right to use the Service under these Terms while your account is in good standing. "Hydrilla", "BlueFox", "Water Agent", and our logos are trademarks of Hydrilla AI [CONFIRM TRADEMARK STATUS]. Do not use them in a way that suggests we endorse you without our written permission.

If you send us feedback or suggestions, we may use them without obligation to you.

**[Section 10: Copyright complaints, anchor #copyright]**

## 9. Copyright complaints

We respect intellectual property rights and respond to clear notices of infringement. To report material on the Service that you believe infringes your copyright, write to [COPYRIGHT AGENT CONTACT] and include: your contact details; a description of the work you say is infringed; where the material appears in the Service; a statement that you believe in good faith the use is not authorised; a statement that the information in your notice is accurate and that you are the owner or authorised to act for the owner; and your physical or electronic signature.

If we remove Content after a notice, we will tell the user, who may send a counter-notice if they believe the removal was a mistake. We close the accounts of repeat infringers where appropriate.

**[Section 11: Third-party software, anchor #third-party]**

## 10. Third-party software and services

Our plugins run inside software made by other companies, such as DCC tools and game engines, and the MCP server runs inside an AI client you choose. That software is provided by its makers under their own terms. We are not responsible for third-party software, and changes to it may affect how our plugins work.

**[Section 12: Availability, anchor #availability]**

## 11. Availability and changes

We work to keep the Service available and reliable, but we do not promise that it will be uninterrupted, error-free, or available at all times. We may carry out maintenance, and we may change, suspend, or discontinue parts of the Service. Keep your own copies of Outputs you need; downloaded files stay with you.

**[Section 13: Disclaimers, anchor #disclaimers]**

## 12. Disclaimers

The Service and Outputs are provided "as is" and "as available". To the fullest extent the law allows, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. AI-generated Outputs can be inaccurate, incomplete, or unsuitable for your purpose, and they are not a substitute for engineering, manufacturing, or other professional data. Some countries do not allow certain disclaimers, so some of these may not apply to you.

**[Section 14: Liability, anchor #liability]**

## 13. Limitation of liability

To the fullest extent the law allows, Hydrilla AI will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or goodwill, arising from or related to the Service or these Terms. Our total liability for all claims relating to the Service or these Terms will not exceed the amount you paid us for the Service in the twelve months before the event giving rise to the claim.

Nothing in these Terms limits liability that cannot be limited by law, such as liability for fraud, or for death or personal injury caused by negligence.

**[Section 15: Indemnity, anchor #indemnity]**

## 14. Indemnity

If you use the Service for business purposes, you agree to defend and indemnify Hydrilla AI against third-party claims, and related costs, arising from your Content, your use of the Service, or your breach of these Terms, to the extent the law allows.

**[Section 16: Termination, anchor #termination]**

## 15. Suspension and termination

You can stop using the Service at any time, and you can close your account by writing to founders@hydrilla.ai. We may suspend or close your account, with notice where practical, if you seriously or repeatedly break these Terms, if we must do so by law, or if your use creates a risk for the Service or other users. When an account closes, your right to use the Service ends, and we delete your Content as described in our [Privacy Policy →](/privacy). Sections that by their nature should continue, such as ownership, disclaimers, liability, and governing law, survive termination.

**[Section 17: Governing law, anchor #governing-law]**

## 16. Governing law and disputes

These Terms are governed by the laws of [GOVERNING LAW JURISDICTION], without regard to conflict-of-law rules. Before starting any formal proceeding, please contact us at founders@hydrilla.ai so we can try to resolve the issue informally. If we cannot, disputes will be resolved by [DISPUTE RESOLUTION METHOD AND VENUE]. If you are a consumer, you keep the protection of the mandatory laws of the country where you live, and you may bring proceedings in its courts.

**[Section 18: Changes, anchor #changes]**

## 17. Changes to these Terms

We may update these Terms. We will post the new version on this page with a new effective date, and if a change is material, we will tell you in advance by email or in the Service. If you keep using the Service after a change takes effect, the updated Terms apply. If you do not agree, stop using the Service and cancel any paid plan before the change takes effect.

**[Section 19: General, anchor #general]**

## 18. General

These Terms, together with our [Privacy Policy →](/privacy), [Cookie Policy →](/cookies), and any order form or written agreement we sign with you, are the whole agreement between you and us about the Service. If a signed agreement conflicts with these Terms, the signed agreement applies. If any part of these Terms is found unenforceable, the rest remains in effect. Our failure to enforce a provision is not a waiver. You may not transfer these Terms without our consent; we may transfer them as part of a merger, acquisition, or sale of assets. Neither party is liable for delays caused by events beyond its reasonable control.

**[Section 20: Contact, anchor #contact]**

## 19. Contact

Questions about these Terms? Contact [LEGAL ENTITY NAME], [REGISTERED ADDRESS], or email founders@hydrilla.ai.
<!-- COPY:END -->

## CTAs
None.

## Internal links on this page
- `/cookies`
- `/pricing`
- `/privacy`
- `/terms`
