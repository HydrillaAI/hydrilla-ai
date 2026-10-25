# Page: /security

| Field | Value |
|---|---|
| Route | `/security` |
| Status | Extend |
| Title (absolute, do not append the template suffix) | Security: How Hydrilla Protects Studio Assets \| Hydrilla AI |
| Meta description | How Hydrilla secures accounts, keeps generated meshes scoped to your workspace, and never uses your data to train its models. |
| OG title | Security at Hydrilla AI |
| H1 | How Hydrilla protects your studio assets |
| Canonical | `https://hydrilla.ai/security` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Trust page: hero, no-training section, accounts section, exports/reviews. Only page that names Clerk. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: Trust

# How Hydrilla protects your studio assets

Hydrilla AI protects the keys to your account, keeps your work inside your AI 3D workspace, and hands files to your pipeline.

Date line: Oct 1, 2026 | Hydrilla Team

**[Section 2: No training]**

## Your data doesn't train our models

We don't use your data to train our models. That holds for every account on every plan, including your prompts, the reference images you upload, and the models you generate.

**[Section 3: Accounts and stored assets]**

## Accounts and stored assets

Sign-in runs through Clerk, and each session belongs to one user. Generated meshes stay scoped to your workspace. Your data is stored securely, and reaching it takes a signed-in account.

- Signed-in pages are kept out of search engines
- API keys are created and managed from your account

**[Section 4: Exports and reviews]**

## Exports and vendor reviews

Once you download an export, the file lives in your own pipeline. For a questionnaire or vendor review, use Contact security below, or [talk to our team →](/enterprise#contact). See also the [Privacy Policy →](/privacy) and [Terms →](/terms).
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Section 4, primary | Contact security | `mailto:founders@hydrilla.ai` |
| Section 4, secondary | Talk to our team | `/enterprise#contact` |

## Internal links on this page
- `/enterprise#contact`
- `/privacy`
- `/terms`
