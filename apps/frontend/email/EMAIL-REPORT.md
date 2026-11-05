# Hydrilla email report

Every email Hydrilla can send: when it goes out, who gets it, and what it looks like.

Last checked: 5 Nov 2026.

## Summary

- **Total:** 23 emails in use: 21 to customers and 2 internal alerts.
- **Platform:** Customer.io sends all of them.
- **Sender:** every email comes from `Hydrilla <hi@mail.hydrilla.ai>`. Replies go to `hi@hydrilla.ai`.
- **Sign-off:** personal emails are signed:

  ```
  Tejesh Varma,
  Head of Growth
  Team Hydrilla AI
  ```

| Group | Count | State |
|---|---|---|
| Sent directly by the backend | 9 | Live |
| Built, but nothing triggers it yet (T10) | 1 | Not sending |
| Customer.io automations | 12 emails in 11 automations | **Draft: not sending until started** |
| Sent by hand (N01) | 1 | Draft |

## Live emails

The backend sends these as soon as the event happens. People can't unsubscribe from them, because they are about their account or a message they sent.

| ID | Subject | When it sends | Format |
|---|---|---|---|
| T01 | Welcome to Hydrilla | A new person signs up | Personal |
| T04 | You're on Hydrilla {plan} | A paid plan or trial starts, or the plan changes | Branded |
| T06 | Your Hydrilla plan is cancelled | A plan is cancelled, once per cancellation | Branded |
| T08 | {n} credits added to your account | An admin adds credits with the email option ticked | Personal |
| T09 | A new API key was created | Someone creates an API key on the account | Branded |
| T11 | We've got your message | Someone submits the contact, support or feedback form | Branded |
| T12 | Thanks for your interest in Hydrilla for teams | Someone submits the enterprise form | Branded |
| INT01 | New {type} message from {name} | Any of those forms is submitted. Goes to `hi@hydrilla.ai`, and replying answers the customer directly | Branded |
| INT02 | GPU offline reported | A user hits the GPU offline error. Goes to `hi@hydrilla.ai` | Branded |

## Automations (draft)

The backend already reports these events to Customer.io, but **no email goes out until each automation is started**.

"Can opt out" means the footer has Email preferences and Unsubscribe links, and the email respects the listed topic.

| ID | Subject | When it sends | Can opt out | Format |
|---|---|---|---|---|
| T02 | Your model is ready | A generation finishes after running 3 minutes or more | Yes: model alerts | Branded |
| T03 | Your generation didn't finish | A generation fails after running 3 minutes or more | Yes: model alerts | Branded |
| C01 | You have {n} credits left | The balance drops to 20% of the period's allowance | Yes: credit alerts | Branded |
| C02 | You've used all your credits | A generation is blocked for lack of credits | Yes: credit alerts | Branded |
| D01 | Payment didn't go through | A payment fails | No | Branded |
| D02 | Final notice: your payment is still due | 5 days after D01, unless the payment succeeded | No | Branded |
| C08 | Your trial ends on {date} | 3 days before the trial ends | No | Branded |
| L02 | Text or image? Pick the faster start | 2 days after sign-up, only if they made no model | Yes: news and tips | Personal |
| C04 | Anything I can help with? | 24 hours after an unfinished checkout | Yes: news and tips | Personal |
| R05 | A short question | 3 days after cancelling | Yes: news and tips | Personal |
| R02 | Your Hydrilla account is waiting | No login for 30 days, once only | Yes: news and tips | Personal |
| W01 | Your week in Hydrilla: {n} models | Mondays, 10:00 in the person's time zone, only if they made a model that week | Yes: weekly recap | Branded |

**Suggested start order,** a few days apart so Gmail gets used to the domain:

1. T02, T03
2. C01, C02
3. D01 + D02, C08 (after the sign-offs below)
4. L02, C04, R05
5. W01 (after the sign-off below), R02

## Other emails

| ID | Subject | State |
|---|---|---|
| N01 | {headline}, default "What's new in Hydrilla" | Sent by hand for real releases, at most 2 a month. Can opt out: news and tips. Branded format with Tejesh's name at the end |
| T10 | We received your deletion request | Ready, but not sent. Account deletion is handled by email today |
| CL01 | Claim-link email | In Customer.io only. The backend has no route that sends it |
| T05, T07, T13 | Plan changed, refund, feedback received | Parked in `email/parked/`. Not in Customer.io's active set |

## Format

There are two layouts.

### Branded

Used when the product is reporting something about the account.

- **Page:** 600 px wide, light blue background, white card with rounded corners.
- **Top:** Hydrilla logo, then a large heading (the subject line, unless the template sets its own).
- **Body:** "Hi {first name}," then short paragraphs and usually one button.
- **Footer:** why they received it, the legal name and address, and "Questions? Write to hi@hydrilla.ai."
- **Dark mode:** supported. The logo header stays white so the logo stays visible.

```
┌────────────────────────────┐
│ HYDRILLA LOGO              │
│                            │
│ Your model is ready        │
│                            │
│ Hi Alex,                   │
│ Your text-to-3D generation │
│ has finished.              │
│                            │
│ [ Open in Studio ]         │
└────────────────────────────┘
 You're receiving this because...
 Hydrilla AI Pvt Ltd, address
 Email preferences · Unsubscribe
```

### Personal

Used when the team is talking to the person. It reads like a short note.

- **Page:** 560 px wide, white, no card and no header banner.
- **Body:** a first-person note of 90 words or fewer, with a plain link.
- **End:** Tejesh's sign-off, then a small Hydrilla logo.
- **Footer:** why they received it and the legal name and address. Opt-out links appear on emails people can opt out of.

```
Hi Alex,

I'm Tejesh Varma, Head of Growth at Hydrilla.
Your account is ready...

Open Studio

Tejesh Varma,
Head of Growth
Team Hydrilla AI

HYDRILLA LOGO

You're receiving this because...
Hydrilla AI Pvt Ltd, address
```

### Rules for every email

The build checks the first four automatically (`npm run email:build:strict`).

- Subject is 50 characters or fewer.
- No emoji and no exclamation marks.
- Every personalised value has a fallback, for example "Hi there," when there is no first name.
- Transactional emails read `trigger.*` data, and automations read `event.*` data.
- The only contact address in email text is `hi@hydrilla.ai`.
- Don't promise a reply time until the team agrees one.

## Still needed

| Who | What | Why it matters |
|---|---|---|
| Team | Sign up with a fresh email and check that T01 arrives. If it doesn't, set the Clerk webhook to `https://hydrilla-ai-g1bm.vercel.app/api/webhooks/clerk` with `user.created`, `user.updated`, `user.deleted` and `session.created` | Production has no fallback, so **no welcome email goes out if the webhook is wrong**. The logs couldn't confirm it |
| Team | Make sure `hi@hydrilla.ai` exists in Google Workspace and someone reads it | All replies and internal alerts go there |
| Team | Add SPF on `hydrilla.ai`: TXT, host `@`, `v=spf1 include:_spf.google.com ~all` | Mail sent from Gmail can land in spam without it |
| Team | Set up [Google Postmaster Tools](https://postmaster.google.com) for `hydrilla.ai` | Shows if Gmail starts limiting the domain |
| Team | Start the automations in the order above | Those 12 emails don't send until then |
| Sign-off | C08 trial wording | The terms still have a placeholder for trial conversion |
| Sign-off | D01 and D02 payment link | It points at the pricing page |
| Sign-off | The 8 tips in `weeklyRecap.ts` | They appear in W01 |

## How to change an email

1. Edit `email/templates/<ID>.mjml`.
2. Run `npm run email:build:strict`.
3. Dry run, then apply:

   ```
   CUSTOMERIO_APP_API_KEY=… node email/scripts/sync-customerio.mjs
   CUSTOMERIO_APP_API_KEY=… node email/scripts/sync-customerio.mjs --apply
   ```

4. Send one test and check its status in Customer.io → Deliveries. Send tests one at a time, because bursts get the domain rate limited by Gmail.

The repo is the source of truth, so edits made in the Customer.io editor get overwritten by the next sync.
