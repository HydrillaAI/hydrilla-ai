"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { PickleCta } from "@/components/layout/PicklePage";

const MONTHLY_CARDS = [
  {
    name: "Free",
    price: "$0",
    period: "a month",
    audience: "For trying Hydrilla on your own projects.",
    features: [
      "100 credits a month",
      "Generate any time",
      "Water Agent, no credits",
    ],
    ctaLabel: "Start generating",
    ctaHref: "/app/studio",
    badge: undefined,
  },
  {
    name: "Starter",
    price: "$5",
    period: "a month",
    audience: "For artists who generate every week.",
    features: [
      "900 credits a month",
      "Generate any time",
      "Water Agent, no credits",
    ],
    ctaLabel: "Choose Starter",
    ctaHref: "/checkout?plan=starter",
    badge: undefined,
  },
  {
    name: "Pro",
    price: "$12",
    period: "a month",
    audience: "For heavy use and API pipelines.",
    features: [
      "3,000 credits a month",
      "Generate any time",
      "REST API access",
      "Water Agent, no credits",
    ],
    ctaLabel: "Choose Pro",
    ctaHref: "/checkout?plan=pro",
    badge: undefined,
  },
] as const;

const HOURLY_CARDS = [
  {
    name: "Hourly",
    price: "$3",
    period: "a month",
    audience: "For artists who work in the same hour each day.",
    features: [
      "Starter's 900 credits a month",
      "One chosen hour a day",
      "Water Agent, no credits",
    ],
    ctaLabel: "Choose Hourly",
    // VERIFY: Checkout slug `hourly` (VERIFY-LIST #13)
    ctaHref: "/checkout?plan=hourly",
    badge: undefined,
  },
  {
    name: "Hourly Pro",
    price: "$8",
    period: "a month",
    badge: "33% off",
    audience: "For heavy use on a daily schedule.",
    features: [
      "Pro's 3,000 credits a month",
      // VERIFY: Hourly Pro window length. Safe: "a chosen daily window" (VERIFY-LIST #9)
      "A chosen daily window",
      "Water Agent, no credits",
    ],
    ctaLabel: "Choose Hourly Pro",
    // VERIFY: Checkout slug `hourly-pro` (VERIFY-LIST #13)
    ctaHref: "/checkout?plan=hourly-pro",
  },
] as const;

function PlanCardGrid({
  cards,
  count,
}: {
  cards: readonly {
    name: string;
    price: string;
    period: string;
    audience: string;
    features: readonly string[];
    ctaLabel: string;
    ctaHref: string;
    badge?: string;
  }[];
  count: "2" | "3";
}) {
  return (
    <div className="mob-pricing-grid" data-count={count} data-variant="page">
      {cards.map((card) => (
        <article key={card.name} className="mob-pricing-card">
          <h2 className="mob-pricing-card-name">
            {card.name}
            {card.badge ? <span className="mob-pricing-badge">{card.badge}</span> : null}
          </h2>
          <p className="mob-pricing-audience">{card.audience}</p>
          <p className="mob-pricing-price">
            <span className="mob-pricing-price-value">{card.price}</span>
            <span className="mob-pricing-price-period">{card.period}</span>
          </p>
          <Link href={card.ctaHref} className="mob-pricing-cta">
            {card.ctaLabel}
          </Link>
          <ul className="mob-pricing-features">
            {card.features.map((feat) => (
              <li key={feat}>
                <Check size={16} strokeWidth={1.8} aria-hidden />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function PricingPageClient() {
  const [slotMode, setSlotMode] = useState(false);

  return (
    <>
      <section className="mob-pricing" data-pad="page">
        <div className="mob-pricing-inner">
          <header className="mob-pricing-hero">
            <h1 className="mob-pricing-title">Pricing</h1>
            <p className="mob-pricing-subtitle">
              Start free. Pay monthly, or pay less to generate in a set daily window.
            </p>
            <p className="mob-pricing-note">
              Every plan runs on credits and includes Water Agent. Start on the Free plan, or try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card.
            </p>

            <div
              className="mob-pricing-switch"
              data-slot={slotMode ? "true" : "false"}
              role="radiogroup"
              aria-label="Billing mode"
            >
              <span className="mob-pricing-switch-thumb" aria-hidden="true" />
              <button
                type="button"
                role="radio"
                aria-checked={!slotMode}
                onClick={() => setSlotMode(false)}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={slotMode}
                onClick={() => setSlotMode(true)}
              >
                Hourly
              </button>
            </div>
          </header>

          <div>
            <p className="sr-only">Monthly view</p>
            <div className={slotMode ? "hidden" : "block"}>
              <PlanCardGrid cards={MONTHLY_CARDS} count="3" />
            </div>

            <p className="sr-only">Hourly view</p>
            <div className={slotMode ? "block" : "hidden"}>
              <PlanCardGrid cards={HOURLY_CARDS} count="2" />
            </div>
          </div>

          <section className="mt-16">
            <h2 className="pickle-h2" style={{ width: "100%", marginBottom: "24px" }}>
              Compare plans
            </h2>
            <div className="mob-pricing-compare" style={{ marginTop: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th />
                    <th>Free</th>
                    <th>Starter</th>
                    <th>Pro</th>
                    <th>Hourly</th>
                    <th>Hourly Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Credits a month</th>
                    <td>100</td>
                    <td>900</td>
                    <td>3,000</td>
                    <td>900</td>
                    <td>3,000</td>
                  </tr>
                  <tr>
                    <th>When you generate</th>
                    <td>Any time</td>
                    <td>Any time</td>
                    <td>Any time</td>
                    <td>1 hour a day</td>
                    <td>Chosen daily window</td>
                  </tr>
                  <tr>
                    <th>
                      <Link href="/water">Water Agent</Link>
                    </th>
                    <td>Included, no credits</td>
                    <td>Included, no credits</td>
                    <td>Included, no credits</td>
                    <td>Included, no credits</td>
                    <td>Included, no credits</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mob-pricing-faq">
            <h2>Pricing questions</h2>
            <dl>
              <div>
                <dt>What does a model cost?</dt>
                <dd>
                  A model from text costs 45 credits and a model from an uploaded image costs 30, at default quality.
                </dd>
              </div>
              <div>
                <dt>Do unused credits carry over?</dt>
                <dd>No. Allowances reset each billing month.</dd>
              </div>
              <div>
                <dt>How does the 14-day trial work?</dt>
                <dd>
                  Start on the Free plan, or try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card.
                </dd>
              </div>
              <div>
                <dt>How do Hourly plans save?</dt>
                <dd>
                  Hourly Pro gives Pro&apos;s 3,000 credits for 33% less, $8 instead of $12, in a chosen daily window. Hourly gives Starter&apos;s 900 credits for $3 instead of $5, in one chosen hour a day.
                </dd>
              </div>
              <div>
                <dt>Which plan includes the API?</dt>
                <dd>
                  Pro includes REST API access. <Link href="/api">API</Link>
                </dd>
              </div>
            </dl>
          </section>

          <div style={{ marginTop: "64px" }}>
            <PickleCta
              title="Start with the Free plan"
              line={
                <>
                  Need more than Pro for a whole studio? <Link href="/enterprise">Enterprise</Link>
                </>
              }
              primary={{ label: "Start generating", href: "/app/studio" }}
              secondary={{ label: "Talk to our team", href: "/enterprise#contact" }}
            />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
