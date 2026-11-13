"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-backend.vercel.app"
).replace(/\/+$/, "");

const DEMO_URL = "https://cal.com/hydrilla";

const SOFTWARE_OPTIONS = [
  "Blender",
  "Unity",
  "Unreal Engine",
  "Godot 4",
  "Multi-DCC / Custom Pipeline",
  "MCP Server / REST API",
] as const;

const STUDIO_SIZE_OPTIONS = [
  "2-10 seats",
  "11-50 seats",
  "51-200 seats",
  "200+ seats",
] as const;

const INTEREST_OPTIONS = [
  "Shared studio workspace & team seats",
  "Water Agent & 3D software plugins",
  "High-concurrency REST API & MCP",
  "Custom credit pool & annual agreement",
  "Security review & legal agreement",
] as const;

const FIELD_CLASS =
  "w-full rounded-xl border border-black/12 bg-white px-3.5 text-[15px] text-black placeholder:text-black/35 outline-none transition-colors hover:border-black/25 focus:border-black/75";

type FormState = {
  first_name: string;
  last_name: string;
  studio: string;
  job_title: string;
  work_email: string;
  software: string;
  studio_size: string;
  interest: string;
  notes: string;
};

const INITIAL_STATE: FormState = {
  first_name: "",
  last_name: "",
  studio: "",
  job_title: "",
  work_email: "",
  software: "",
  studio_size: "",
  interest: "",
  notes: "",
};

export function EnterpriseContactForm({
  idPrefix = "ent",
  heading = "Contact Sales",
  subheading = "Tell us about your team and pipeline, and we'll get back to you.",
}: {
  idPrefix?: string;
  heading?: string;
  subheading?: string;
}) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fullName = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();
    const structuredSummary = [
      `Job title: ${form.job_title.trim()}`,
      `Primary 3D software: ${form.software}`,
      `Interest: ${form.interest}`,
      form.notes.trim() ? `\nNotes:\n${form.notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          work_email: form.work_email.trim(),
          company: form.studio.trim(),
          studio_size: form.studio_size,
          use_case: `${form.software} | ${form.interest}`.slice(0, 120),
          message: structuredSummary,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Email founders@hydrilla.ai instead.");
        return;
      }
      setSubmittedEmail(form.work_email.trim());
    } catch {
      setError("We couldn't send your message. Email founders@hydrilla.ai instead.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedEmail) {
    return (
      <div
        role="status"
        className="ent-form-card flex flex-col justify-between rounded-[24px] border border-black/10 bg-white p-7 text-left shadow-[0_20px_60px_-30px_rgba(0,0,0,0.14)] sm:p-9"
      >
        <div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <Check className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="mt-5 text-[24px] font-[510] tracking-[-0.03em] text-black">
            Request received
          </h3>
          <p className="mt-2 text-[15px] leading-[1.55] text-black/68">
            We&apos;ve logged your studio inquiry and will reply to{" "}
            <strong className="font-[510] text-black">{submittedEmail}</strong>.
          </p>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-black/10 pt-6">
          <a href={DEMO_URL} className="pickle-pill-solid">
            Book a demo
          </a>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_STATE);
              setSubmittedEmail(null);
            }}
            className="pickle-pill-ghost"
          >
            Send another inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="ent-form-card rounded-[24px] border border-black/10 bg-white p-6 text-left shadow-[0_20px_60px_-30px_rgba(0,0,0,0.14)] sm:p-8"
    >
      <div className="border-b border-black/10 pb-5">
        <h3 className="text-[22px] font-[510] tracking-[-0.03em] text-black">{heading}</h3>
        <p className="mt-1.5 text-[14px] leading-[1.45] text-black/60">{subheading}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label htmlFor={`${idPrefix}-first-name`} className="grid gap-1.5 text-[13px] font-[500] text-black/70">
          First name
          <input
            id={`${idPrefix}-first-name`}
            name="first_name"
            type="text"
            required
            placeholder="Alex"
            autoComplete="given-name"
            value={form.first_name}
            onChange={handleChange}
            className={`${FIELD_CLASS} h-11`}
          />
        </label>

        <label htmlFor={`${idPrefix}-last-name`} className="grid gap-1.5 text-[13px] font-[500] text-black/70">
          Last name
          <input
            id={`${idPrefix}-last-name`}
            name="last_name"
            type="text"
            required
            placeholder="Morgan"
            autoComplete="family-name"
            value={form.last_name}
            onChange={handleChange}
            className={`${FIELD_CLASS} h-11`}
          />
        </label>

        <label htmlFor={`${idPrefix}-studio`} className="grid gap-1.5 text-[13px] font-[500] text-black/70">
          Company / Studio
          <input
            id={`${idPrefix}-studio`}
            name="studio"
            type="text"
            required
            placeholder="Northwind Interactive"
            autoComplete="organization"
            value={form.studio}
            onChange={handleChange}
            className={`${FIELD_CLASS} h-11`}
          />
        </label>

        <label htmlFor={`${idPrefix}-job-title`} className="grid gap-1.5 text-[13px] font-[500] text-black/70">
          Job title
          <input
            id={`${idPrefix}-job-title`}
            name="job_title"
            type="text"
            required
            placeholder="Head of 3D / Technical Art"
            autoComplete="organization-title"
            value={form.job_title}
            onChange={handleChange}
            className={`${FIELD_CLASS} h-11`}
          />
        </label>

        <label htmlFor={`${idPrefix}-work-email`} className="grid gap-1.5 text-[13px] font-[500] text-black/70">
          Work email
          <input
            id={`${idPrefix}-work-email`}
            name="work_email"
            type="email"
            required
            placeholder="alex@studio.com"
            autoComplete="email"
            value={form.work_email}
            onChange={handleChange}
            className={`${FIELD_CLASS} h-11`}
          />
        </label>

        <label htmlFor={`${idPrefix}-studio-size`} className="grid gap-1.5 text-[13px] font-[500] text-black/70">
          Team size
          <select
            id={`${idPrefix}-studio-size`}
            name="studio_size"
            required
            value={form.studio_size}
            onChange={handleChange}
            className={`${FIELD_CLASS} h-11 cursor-pointer`}
          >
            <option value="" disabled>
              Select team size
            </option>
            {STUDIO_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor={`${idPrefix}-software`} className="grid gap-1.5 text-[13px] font-[500] text-black/70 sm:col-span-2">
          Primary 3D software or pipeline
          <select
            id={`${idPrefix}-software`}
            name="software"
            required
            value={form.software}
            onChange={handleChange}
            className={`${FIELD_CLASS} h-11 cursor-pointer`}
          >
            <option value="" disabled>
              Select software or pipeline
            </option>
            {SOFTWARE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor={`${idPrefix}-interest`} className="grid gap-1.5 text-[13px] font-[500] text-black/70 sm:col-span-2">
          What are you interested in
          <select
            id={`${idPrefix}-interest`}
            name="interest"
            required
            value={form.interest}
            onChange={handleChange}
            className={`${FIELD_CLASS} h-11 cursor-pointer`}
          >
            <option value="" disabled>
              Select a topic
            </option>
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor={`${idPrefix}-notes`} className="grid gap-1.5 text-[13px] font-[500] text-black/70 sm:col-span-2">
          Pipeline notes (optional)
          <textarea
            id={`${idPrefix}-notes`}
            name="notes"
            rows={3}
            placeholder="Monthly generation volume, plugin setup, or security review timeline"
            value={form.notes}
            onChange={handleChange}
            className={`${FIELD_CLASS} resize-y py-2.5`}
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-[#b42318]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="pickle-pill-solid inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <span>{submitting ? "Sending…" : "Continue"}</span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        <span className="text-[12.5px] text-black/50">
          Direct email:{" "}
          <a href="mailto:founders@hydrilla.ai" className="underline underline-offset-2 hover:text-black">
            founders@hydrilla.ai
          </a>
        </span>
      </div>
    </form>
  );
}
