"use client";

import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleActions, PickleCards } from "@/components/layout/PicklePage";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-ai-g1bm.vercel.app"
).replace(/\/+$/, "");

export default function ContactPage() {
  const [form, setForm] = useState({
    full_name: "",
    work_email: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
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
          company: form.company,
          use_case: "",
          studio_size: "",
          message: form.message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSubmittedEmail(form.work_email);
      setSubmitted(true);
    } catch {
      setError("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <JsonLd data={getKitJsonLd("/contact")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Company</p>
          <h1 className="pickle-article-title">Contact Hydrilla</h1>
          <div className="pickle-lead">
            <p>Reach the team behind Hydrilla AI about your account, a generation, or press. Pick the route that fits.</p>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              <strong>Choosing the right route helps us answer faster.</strong> Most account and how-to questions are already covered in the docs and FAQ, so check those first; for anything else, write to us and a member of the team will reply.
            </p>
          </div>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Choose a route</h2>
            </div>
            <PickleCards
              columns={3}
              titleAs="p"
              cards={[
                {
                  icon: "faq",
                  title: "Support",
                  body: (
                    <>
                      Account, billing, or a generation that went wrong: email founders@hydrilla.ai, or check the{" "}
                      <Link href="/faq">FAQ</Link> and <Link href="/docs">docs</Link> first.
                    </>
                  ),
                },
                {
                  icon: "blog",
                  title: "Press",
                  body: "Interviews and logos: write to founders@hydrilla.ai with your outlet and deadline.",
                },
                {
                  icon: "enterprise",
                  title: "Sales and demos",
                  body: (
                    <>
                      Seats, volume, or a walkthrough live on <Link href="/enterprise">Enterprise</Link>.
                    </>
                  ),
                },
              ]}
            />
            <PickleActions secondary={{ label: "Talk to our team", href: "/enterprise#contact" }} />
          </section>
          <section className="pickle-head-block">
            <h2 className="pickle-h2">Help us help you</h2>
            <div className="pickle-text">
              <p>
                For a generation problem, include your account email, the workspace, and a screenshot of the result. For billing, include the plan you are on. For press, tell us your outlet, your deadline, and what the piece is about.
              </p>
            </div>
          </section>

          <section className="pickle-section">
            <div className="pickle-head-block">
              <h2 className="pickle-h2">Send a message</h2>
            </div>
            {submitted ? (
              <div className="pickle-form-panel">
                <p className="pickle-card-body">Message sent. Thanks for reaching out. We will get back to you at {submittedEmail} shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pickle-form-panel">
                <div className="pickle-form-grid">
                  <label className="pickle-field">
                    <span>Full name</span>
                    <input name="full_name" required autoComplete="name" value={form.full_name} onChange={handleChange} />
                  </label>
                  <label className="pickle-field">
                    <span>Work email</span>
                    <input name="work_email" type="email" required autoComplete="email" value={form.work_email} onChange={handleChange} />
                  </label>
                  <label className="pickle-field" data-span="full">
                    <span>Company or studio</span>
                    <input name="company" required autoComplete="organization" value={form.company} onChange={handleChange} />
                  </label>
                  <label className="pickle-field" data-span="full">
                    <span>Message</span>
                    <textarea name="message" required rows={5} value={form.message} onChange={handleChange} />
                  </label>
                </div>
                <p className="pickle-card-body">Replies come from founders@hydrilla.ai.</p>
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
