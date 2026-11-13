"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { DEMO_URL } from "@/lib/brand";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-ai-g1bm.vercel.app"
).replace(/\/+$/, "");

const SOFTWARE_OPTIONS = [
  "Blender",
  "Autodesk Maya",
  "Autodesk 3ds Max",
  "Unity",
  "Unreal Engine",
  "Godot 4",
  "Houdini / Cinema 4D / ZBrush",
  "Multi-DCC Studio Pipeline",
  "MCP Server / REST API",
] as const;

const STUDIO_SIZE_OPTIONS = [
  "2–10 seats",
  "11–50 seats",
  "51–200 seats",
  "200+ seats",
] as const;

const INTEREST_OPTIONS = [
  "Shared studio workspace & team seats",
  "Water Agent & native 3D software plugins",
  "High-concurrency REST API & MCP automation",
  "Custom credit pool & annual studio agreement",
  "Vendor security review & custom legal terms",
] as const;

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-black/10 bg-[#f7f7f8] px-3.5 text-[14.5px] text-black placeholder:text-black/38 outline-none transition-all duration-150 hover:border-black/22 hover:bg-white focus:border-black focus:bg-white";

type FormState = {
  first_name: string;
  last_name: string;
  studio: string;
  job_title: string;
  work_email: string;
  studio_size: string;
  software: string;
  interest: string;
};

const INITIAL_STATE: FormState = {
  first_name: "",
  last_name: "",
  studio: "",
  job_title: "",
  work_email: "",
  studio_size: "",
  software: "",
  interest: "",
};

export function EnterpriseContactForm({ idPrefix = "ent" }: { idPrefix?: string }) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fullName = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();
    const message = [
      `Job title: ${form.job_title.trim()}`,
      `Primary 3D stack: ${form.software}`,
      `Interest: ${form.interest}`,
    ].join("\n");

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
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Email founders@hydrilla.ai instead.");
        return;
      }
      setSubmittedEmail(form.work_email.trim());
    } catch {
      setError("We couldn't send your request. Email founders@hydrilla.ai instead.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedEmail) {
    return (
      <div
        role="status"
        className="flex flex-col justify-between rounded-[24px] border border-black/10 bg-white p-7 text-left sm:p-9"
      >
        <div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <Check className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="mt-5 text-[24px] font-[510] tracking-[-0.03em] text-black">
            Request received
          </h3>
          <p className="mt-2 text-[15px] leading-[1.55] text-black/68">
            Our team will follow up at{" "}
            <strong className="font-[510] text-black">{submittedEmail}</strong>. You can also book a call right now.
          </p>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-black/10 pt-6">
          <a href={DEMO_URL} className="pickle-pill-solid">
            Talk to our team
          </a>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_STATE);
              setSubmittedEmail(null);
            }}
            className="pickle-pill-ghost cursor-pointer"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-black/10 bg-white p-6 text-left sm:p-8"
    >
      <div>
        <h3 className="text-[24px] font-[510] tracking-[-0.03em] text-black">Contact Sales</h3>
        <p className="mt-1 text-[14.5px] text-black/60">
          Tell us about your studio and we&apos;ll get back to you.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label htmlFor={`${idPrefix}-first-name`} className="grid gap-1.5 text-[13px] font-[510] text-black/75">
          First name
          <input
            id={`${idPrefix}-first-name`}
            name="first_name"
            type="text"
            required
            placeholder="John"
            autoComplete="given-name"
            value={form.first_name}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </label>

        <label htmlFor={`${idPrefix}-last-name`} className="grid gap-1.5 text-[13px] font-[510] text-black/75">
          Last name
          <input
            id={`${idPrefix}-last-name`}
            name="last_name"
            type="text"
            required
            placeholder="Doe"
            autoComplete="family-name"
            value={form.last_name}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </label>

        <label htmlFor={`${idPrefix}-studio`} className="grid gap-1.5 text-[13px] font-[510] text-black/75">
          Company / Studio
          <input
            id={`${idPrefix}-studio`}
            name="studio"
            type="text"
            required
            placeholder="Northwind Studio"
            autoComplete="organization"
            value={form.studio}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </label>

        <label htmlFor={`${idPrefix}-job-title`} className="grid gap-1.5 text-[13px] font-[510] text-black/75">
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
            className={INPUT_CLASS}
          />
        </label>

        <label htmlFor={`${idPrefix}-work-email`} className="grid gap-1.5 text-[13px] font-[510] text-black/75">
          Business email
          <input
            id={`${idPrefix}-work-email`}
            name="work_email"
            type="email"
            required
            placeholder="john@studio.com"
            autoComplete="email"
            value={form.work_email}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </label>

        <label htmlFor={`${idPrefix}-studio-size`} className="grid gap-1.5 text-[13px] font-[510] text-black/75">
          Studio size
          <select
            id={`${idPrefix}-studio-size`}
            name="studio_size"
            required
            value={form.studio_size}
            onChange={handleChange}
            className={`${INPUT_CLASS} cursor-pointer`}
          >
            <option value="" disabled>
              Select seats
            </option>
            {STUDIO_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor={`${idPrefix}-software`} className="grid gap-1.5 text-[13px] font-[510] text-black/75 sm:col-span-2">
          Primary 3D software or pipeline
          <select
            id={`${idPrefix}-software`}
            name="software"
            required
            value={form.software}
            onChange={handleChange}
            className={`${INPUT_CLASS} cursor-pointer`}
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

        <label htmlFor={`${idPrefix}-interest`} className="grid gap-1.5 text-[13px] font-[510] text-black/75 sm:col-span-2">
          What are you interested in
          <select
            id={`${idPrefix}-interest`}
            name="interest"
            required
            value={form.interest}
            onChange={handleChange}
            className={`${INPUT_CLASS} cursor-pointer`}
          >
            <option value="" disabled>
              Select a reason
            </option>
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-[14px] text-[#b42318]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-5 text-[15px] font-[510] tracking-[-0.01em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-55"
      >
        <span>{submitting ? "Submitting…" : "Continue"}</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
