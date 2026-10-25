# Hydrilla email: editorial guide

Every email passes three steps: **copywriter** drafts from a brief, **ghost editor** reviews against this checklist in a separate pass, **sign-off** approves. Rishi (Creative Director) signs off voice and brand. A founder confirms facts for billing, credits and legal content.

## Senders

All mail is sent from the authenticated subdomain `mail.hydrilla.ai`, as Wispr (`hello@mail.wispr.ai`) and Grok (`updates@email.grok.com`) do. The root domain `hydrilla.ai` keeps the staff mailboxes, and replies go there through Reply-To.

Two senders only, so people always know who is writing.

| Sender | From | Reply-to | Sends |
|---|---|---|---|
| Hydrilla | `Hydrilla <hi@mail.hydrilla.ai>` | `hi@hydrilla.ai` | Anything about your account: welcome receipt, billing, plan changes, model ready or failed, credits, security, form receipts |
| Rishi | `Rishi from Hydrilla <rishi@mail.hydrilla.ai>` | `rishi@hydrilla.ai` | When the team talks to you: welcome note, onboarding, win-back, weekly recap, product news and releases |

Rule of thumb: if the product is reporting on your account, it comes from Hydrilla. If we are speaking to you, it comes from Rishi.

Only `hi@hydrilla.ai` and `rishi@hydrilla.ai` appear in email copy as contact addresses. Never `.co`.

## Voice

- Plain, factual, specific. Same register as the website.
- No hype, no emoji, no exclamation marks, no "revolutionary", "seamless", "unlock".
- Say what happened, then what the person can do next.
- Personal emails from Rishi read like a short note from a person: first person, no header banner, no more than 90 words.

## Naming

- "Hydrilla" or "Hydrilla AI". The 3D model is "BlueFox". The agent is "Water Agent", always in full.
- Product terms: Studio, Workspace, Credits, Slot.
- Never mention backend hosts, model internals or vendor names for the generation engine.

## Subject lines and preheaders

- 50 characters or fewer. State what is inside.
- No clickbait, no ALL CAPS, no emoji, no "Re:" or "Fwd:" tricks.
- The preheader adds information. It does not repeat the subject.

## Structure

1. One literal heading ("Your model is ready", "Payment didn't go through"). Not clever.
2. An opening line that says why the person is getting this email.
3. One primary action (one button). A secondary text link is allowed.
4. 120 words or fewer for lifecycle mail. The weekly recap is the exception.
5. Footer: why you are receiving this, preferences and unsubscribe (optional mail only), legal entity and postal address.

## Pre-send checklist

- [ ] Every Liquid variable has a fallback, for example `{{ customer.first_name | default: "there" }}`.
- [ ] Every link goes to the right page and uses `https://hydrilla.ai`.
- [ ] Plan names, credit numbers and dates match `docs/PAYMENTS.md` and `docs/pricing-and-models.md`.
- [ ] The plain-text version reads well on its own.
- [ ] Subject is 50 characters or fewer, preheader is set.
- [ ] Category is correct: always-sent mail has no promotion in it.
- [ ] Optional mail has the unsubscribe and preferences links.
- [ ] Tested in Gmail, Outlook, Apple Mail and on a phone, in light and dark mode.
- [ ] No emoji, no exclamation marks, no banned words.

## Weekly recap

- The tip is picked from a rotating list and never repeats within 8 weeks.
- "This week at Hydrilla" holds 1 or 2 items, edited in admin, each with a title, one sentence and a link.

## Frequency

- At most 1 marketing email a day and 3 a week, not counting the weekly recap and system mail.
- Marketing sends only 9am to 7pm in the person's local time.
