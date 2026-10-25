# Page: /pricing

| Field | Value |
|---|---|
| Route | `/pricing` |
| Status | Rebuilt lean |
| Title (absolute, do not append the template suffix) | Pricing: Free, Starter, Pro, and Hourly Plans \| Hydrilla AI |
| Meta description | Hydrilla AI 3D pricing: Free $0, Starter $5, Pro $12, Hourly $3, and Hourly Pro $8 a month. A model costs 30 or 45 credits. |
| OG title | Hydrilla pricing |
| H1 | Pricing |
| Canonical | `https://hydrilla.ai/pricing` (self) |
| Robots | index, follow |
| Schema type | SoftwareApplication offers (5 Offer nodes) + FAQPage (5 Q&As) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Lean card pattern: H1 plus one line, Monthly | Hourly toggle (Free sits in Monthly), plan cards (3 monthly, 2 hourly; "33% off" badge on Hourly Pro only), one compact compare table, 5-question FAQ accordion, CTA band. No formats anywhere on this page. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

# Pricing

Start free. Pay monthly, or pay less to generate in a set daily window.

Every plan runs on credits and includes Water Agent. Start on the Free plan, or try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card.

**[Section 2: Plan cards]**

Toggle: Monthly | Hourly

Monthly view

**Free** · $0 a month
For trying Hydrilla on your own projects.
- 100 credits a month
- Generate any time
- Water Agent, no credits
Button: Start generating

**Starter** · $5 a month
For artists who generate every week.
- 900 credits a month
- Generate any time
- Water Agent, no credits
Button: Choose Starter

**Pro** · $12 a month
For heavy use and API pipelines.
- 3,000 credits a month
- Generate any time
- REST API access
- Water Agent, no credits
Button: Choose Pro

Hourly view

**Hourly** · $3 a month
For artists who work in the same hour each day.
- Starter's 900 credits a month
- One chosen hour a day
- Water Agent, no credits
Button: Choose Hourly

**Hourly Pro** · $8 a month · Badge: 33% off
For heavy use on a daily schedule.
- Pro's 3,000 credits a month
- A chosen daily window
- Water Agent, no credits
Button: Choose Hourly Pro

**[Section 3: Compare plans]**

## Compare plans

| | Free | Starter | Pro | Hourly | Hourly Pro |
|---|---|---|---|---|---|
| Credits a month | 100 | 900 | 3,000 | 900 | 3,000 |
| When you generate | Any time | Any time | Any time | 1 hour a day | Chosen daily window |
| [Water Agent →](/water) | Included, no credits | Included, no credits | Included, no credits | Included, no credits | Included, no credits |

**[Section 4: Pricing questions]**

## Pricing questions

**What does a model cost?**
A model from text costs 45 credits and a model from an uploaded image costs 30, at default quality.

**Do unused credits carry over?**
No. Allowances reset each billing month, so pick the plan that matches a typical month of work.

**How does the 14-day trial work?**
Choose any Monthly or Hourly plan, Pro included, and use it free for 14 days. The trial needs a card. The Free plan needs no trial.

**How do Hourly plans save?**
Hourly Pro gives Pro's 3,000 credits for 33% less, $8 instead of $12, in a chosen daily window. Hourly gives Starter's 900 credits for $3 instead of $5, in one chosen hour a day.

**Which plan includes the API?**
Pro includes REST API access. [API →](/api)

**[Section 5: CTA]**

## Start with the Free plan

Close line: Need more than Pro for a whole studio? [Enterprise →](/enterprise)
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Free card | Start generating | `/app/studio` |
| Starter card | Choose Starter | `/checkout?plan=starter` |
| Pro card | Choose Pro | `/checkout?plan=pro` |
| Hourly card | Choose Hourly | `/checkout?plan=hourly` (slug to confirm in repo) |
| Hourly Pro card | Choose Hourly Pro | `/checkout?plan=hourly-pro` (slug to confirm in repo) |
| CTA, primary | Start generating | `/app/studio` |
| CTA, secondary | Talk to our team | `/enterprise#contact` |

## Internal links on this page
- `/api`
- `/app/studio`
- `/checkout?plan=hourly`
- `/checkout?plan=hourly-pro`
- `/checkout?plan=pro`
- `/checkout?plan=starter`
- `/enterprise`
- `/enterprise#contact`
- `/water`
