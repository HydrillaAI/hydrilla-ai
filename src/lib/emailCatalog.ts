import type { SenderKey } from "./customerio.js";

/**
 * Every email Hydrilla sends, in one place. The admin Emails pages read this list, and
 * notifications.ts sends the transactional ones by `id` (the Trigger Name in Customer.io).
 *
 * kind:
 *  - transactional: sent by the backend through the Transactional API.
 *  - campaign: sent by a Customer.io campaign that the backend triggers with an event.
 *  - broadcast: sent by hand from Customer.io.
 * Template source lives in hyd-f/email/templates; this list must match it.
 */
export type EmailKind = "transactional" | "campaign" | "broadcast";

export type CatalogEntry = {
  id: string;
  name: string;
  kind: EmailKind;
  sender: SenderKey;
  /** Subscription topic, or null for mail that is always sent. */
  topic: string | null;
  /** The event (or attribute) that starts it. */
  trigger: string;
  /** One line on what the email is for. */
  purpose: string;
  /** Internal alerts go to the team inbox, not customers. */
  internal?: boolean;
};

export const EMAIL_CATALOG: CatalogEntry[] = [
  // System mail from Hydrilla
  { id: "T02_model-ready", name: "Your model is ready", kind: "campaign", sender: "hi", topic: "model-alerts", trigger: "generation_completed (notify = true)", purpose: "Brings people back to a finished model when the job took long enough that they likely left." },
  { id: "T03_generation-failed", name: "Your generation didn't finish", kind: "campaign", sender: "hi", topic: "model-alerts", trigger: "generation_failed (notify = true)", purpose: "Says the job failed, that credits were returned, and offers a retry." },
  { id: "T04_plan-active", name: "You're on Hydrilla {plan}", kind: "transactional", sender: "hi", topic: null, trigger: "subscription_activated", purpose: "Confirms a paid plan or trial and what it includes." },
  { id: "T06_plan-cancelled", name: "Your Hydrilla plan is cancelled", kind: "transactional", sender: "hi", topic: null, trigger: "subscription_cancelled", purpose: "States when paid access ends. Sent once per cancellation." },
  { id: "D01_payment-failed", name: "Payment didn't go through", kind: "campaign", sender: "hi", topic: null, trigger: "payment_failed", purpose: "Asks them to update payment details before access is affected." },
  { id: "D02_payment-final", name: "Final notice on your payment", kind: "campaign", sender: "hi", topic: null, trigger: "payment_failed, 5 days later, unless payment_succeeded", purpose: "Last warning before access is limited." },
  { id: "C01_credits-low", name: "You have {n} credits left", kind: "campaign", sender: "hi", topic: "credit-alerts", trigger: "credits_low", purpose: "Warns at 20% of the period allowance, once per period." },
  { id: "C02_credits-out", name: "You've used all your credits", kind: "campaign", sender: "hi", topic: "credit-alerts", trigger: "credits_exhausted", purpose: "Offers the two ways forward: wait for the reset date or upgrade." },
  { id: "C08_trial-ending", name: "Your trial ends on {date}", kind: "campaign", sender: "hi", topic: null, trigger: "attribute trial_ends_at, 3 days before", purpose: "The only trial reminder." },
  { id: "T09_api-key-created", name: "A new API key was created", kind: "transactional", sender: "hi", topic: null, trigger: "api_key_created", purpose: "Security notice so keys can't be created silently." },
  { id: "T10_deletion-request", name: "We received your deletion request", kind: "transactional", sender: "hi", topic: null, trigger: "account_deletion_requested", purpose: "Confirms the request and gives a way to stop it." },
  { id: "T11_contact-received", name: "We've got your message", kind: "transactional", sender: "hi", topic: null, trigger: "contact, support or feedback form", purpose: "Receipt for any message sent to the team." },
  { id: "T12_enterprise-received", name: "Thanks for your interest in Hydrilla for teams", kind: "transactional", sender: "hi", topic: null, trigger: "enterprise form", purpose: "Receipt with the demo booking link. A person follows up." },

  // From Rishi
  { id: "T01_welcome", name: "Welcome to Hydrilla", kind: "transactional", sender: "rishi", topic: null, trigger: "account_created", purpose: "A short personal welcome and three first steps." },
  { id: "L02_first-model-nudge", name: "Text or image? Pick the faster start", kind: "campaign", sender: "rishi", topic: "news-and-tips", trigger: "account_created, 2 days later, only if no generation_completed", purpose: "The single onboarding nudge." },
  { id: "C04_checkout-help", name: "Anything I can help with?", kind: "campaign", sender: "rishi", topic: "news-and-tips", trigger: "checkout_started, 24 hours later, unless subscription_activated", purpose: "One human question after an unfinished checkout." },
  { id: "CL01_claim-link", name: "{n} Hydrilla credits for you", kind: "transactional", sender: "rishi", topic: null, trigger: "admin sends a claim link", purpose: "Gives someone a credit claim link." },
  { id: "T08_credits-granted", name: "{n} credits added to your account", kind: "transactional", sender: "rishi", topic: null, trigger: "admin adds credits to a user", purpose: "Tells them credits were added directly." },
  { id: "R02_win-back", name: "Your Hydrilla account is waiting", kind: "campaign", sender: "rishi", topic: "news-and-tips", trigger: "last_seen_at older than 30 days, once", purpose: "The only win-back. No click means silent suppression." },
  { id: "R05_cancel-question", name: "A short question", kind: "campaign", sender: "rishi", topic: "news-and-tips", trigger: "subscription_cancelled, 3 days later", purpose: "One question about why they left." },
  { id: "W01_weekly-recap", name: "Your week in Hydrilla", kind: "campaign", sender: "rishi", topic: "weekly-recap", trigger: "weekly_recap_ready (Mondays, active people only)", purpose: "Models made, credits left, one tip, and the week's news." },
  { id: "N01_release-news", name: "Release news", kind: "broadcast", sender: "rishi", topic: "news-and-tips", trigger: "sent by hand for real releases, at most 2 a month", purpose: "What shipped and what to do with it." },

  // Internal alerts to the team inbox
  { id: "INT01_new-message", name: "New message from {name}", kind: "transactional", sender: "hi", topic: null, trigger: "contact, enterprise, support or feedback form", purpose: "Tells the team a message arrived.", internal: true },
  { id: "INT02_gpu-offline", name: "GPU offline reported", kind: "transactional", sender: "hi", topic: null, trigger: "a user hits the GPU offline error", purpose: "Alerts the team that generation is down.", internal: true },
];

export function catalogEntry(id: string): CatalogEntry | undefined {
  return EMAIL_CATALOG.find((e) => e.id === id);
}
