"use client";

import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleActions, PickleCards, PickleHeroVideo, PickleQA } from "@/components/layout/PicklePage";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-backend.vercel.app"
).replace(/\/+$/, "");

const FIELDS: {
  name: "full_name" | "work_email" | "studio" | "studio_size" | "engine" | "volume";
  label: string;
  type?: string;
  autoComplete?: string;
}[] = [
  { name: "full_name", label: "Full name", autoComplete: "name" },
  { name: "work_email", label: "Work email", type: "email", autoComplete: "email" },
  { name: "studio", label: "Studio", autoComplete: "organization" },
  { name: "studio_size", label: "Studio size" },
  { name: "engine", label: "Engine" },
  { name: "volume", label: "Expected monthly volume" },
];

export default function EnterprisePage() {
  const [form, setForm] = useState({
    full_name: "",
    work_email: "",
    studio: "",
    studio_size: "",
    engine: "",
    volume: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          work_email: form.work_email,
          company: form.studio,
          studio_size: form.studio_size,
          use_case: form.engine,
          message: `Expected monthly volume: ${form.volume}\n\n${form.message}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <JsonLd data={getKitJsonLd("/enterprise")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Studios</p>
          <h1 className="pickle-article-title" data-wide="true">
            Bring AI 3D to your whole studio
          </h1>
          <div className="pickle-lead">
            <p>Hydrilla AI for whole studios: BlueFox, Hydrilla&apos;s 3D model, and Water Agent across your team, in one shared workspace.</p>
          </div>
          <div className="pickle-actions">
            <a href="https://cal.com/hydrilla" className="pickle-pill-solid">Book a demo</a>
            <a href="#contact" className="pickle-pill-ghost">
              Talk to our team
            </a>
          </div>
        </header>
        <div className="pickle-article-column">
          <PickleHeroVideo />

          <div className="pickle-intro">
            <p>
              When generation moves from one artist&apos;s experiment to <strong>a studio-wide tool</strong>, the questions change. Who has access, how much volume the pipeline needs, how jobs from your own systems are handled, and how your data is treated all need clear answers. Enterprise is where we work those out with you.
            </p>
          </div>
          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">What Enterprise adds for your studio</h2>
              <div className="pickle-text">
                <p>Enterprise adds seats, API concurrency, custom plans, and pipeline support. Each is shaped around how your studio works rather than a fixed tier.</p>
              </div>
            </div>
            <PickleCards
              titleAs="p"
              cards={[
                {
                  icon: "team",
                  title: "Seats",
                  body: "Art, lookdev, and pipeline staff work together in one shared workspace, so generations, reviews, and approved versions live in the same place.",
                },
                {
                  icon: "api",
                  title: "API concurrency",
                  body: "Jobs from your own backend, sized to your volume, for asset libraries, build steps, and internal tools.",
                },
                {
                  icon: "startup",
                  title: "Custom plans",
                  body: "Credit pools and queue priority set around your monthly volume, instead of individual allowances.",
                },
                {
                  icon: "integrations",
                  title: "Pipeline support",
                  body: "Help connecting the Bridge and plugins to your pipeline, so artists get generation inside the tools they already use.",
                },
              ]}
            />
          </section>
          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">How this differs from Pro</h2>
              <div className="pickle-text">
                <p>
                  Pro is built for individuals and small teams who buy online. Enterprise is for studios that need an agreement around their volume and their tools.
                </p>
              </div>
            </div>
            <figure className="pickle-figure">
              <div className="pickle-card-surface">
                <table className="pickle-table">
                  <thead>
                    <tr>
                      <th />
                      <th>Pro</th>
                      <th>Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>How you buy</th>
                      <td>Self-serve and monthly, on <Link href="/pricing">pricing</Link></td>
                      <td>An agreement shaped around your studio</td>
                    </tr>
                    <tr>
                      <th>Plans</th>
                      <td>Monthly credits on a set plan</td>
                      <td>Custom plans and credit pools</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </figure>
          </section>
          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Answers for procurement</h2>
            </div>
            <PickleQA
              items={[
                {
                  q: "How is our data handled?",
                  a: (
                    <>
                      Your data isn&apos;t used to train our models, on any plan. Generated assets are kept to your own workspace, and the{" "}
                      <Link href="/security">security page</Link> explains both.
                    </>
                  ),
                },
                {
                  q: "Can we send a security questionnaire?",
                  a: "Yes. Send it to founders@hydrilla.ai, naming your studio and when you need answers. We answer in writing with what we can confirm.",
                },
              ]}
            />
          </section>

          <section id="contact" className="pickle-section scroll-mt-28">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">How to start</h2>
              <div className="pickle-text">
                <p>Tell us your studio size, engine, and expected monthly volume, and whether you already generate on Pro. The more we know about your pipeline, the more useful the first conversation will be. You can also book a demo directly.</p>
              </div>
              <PickleActions align="start" primary={{ label: "Book a demo", href: "https://cal.com/hydrilla" }} />
            </div>
            {submitted ? (
              <div className="pickle-form-panel">
                <p className="pickle-card-title">Message sent.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pickle-form-panel">
                <div className="pickle-form-grid">
                  {FIELDS.map((field) => (
                    <label key={field.name} className="pickle-field">
                      <span>{field.label}</span>
                      <input
                        name={field.name}
                        type={field.type ?? "text"}
                        required
                        value={form[field.name]}
                        onChange={handleChange}
                        autoComplete={field.autoComplete}
                      />
                    </label>
                  ))}
                  <label className="pickle-field" data-span="full">
                    <span>Message</span>
                    <textarea name="message" required rows={5} value={form.message} onChange={handleChange} />
                  </label>
                </div>
                {error ? <p className="pickle-form-error">{error}</p> : null}
                <button type="submit" disabled={submitting} className="pickle-pill-solid">
                  {submitting ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
