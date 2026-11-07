"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

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

const INPUT_CLASS =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[16px] text-white outline-none transition-colors hover:border-white/30 focus:border-white/70";

export function EnterpriseContactForm() {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
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
        setError(data.error || "Something went wrong. Email founders@hydrilla.ai instead.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("We couldn't send your message. Email founders@hydrilla.ai instead.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <p role="status" className="rounded-2xl border border-white/15 p-8 text-center text-[20px] text-white">
        Message sent. We&apos;ll reply to {form.work_email}.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 text-left sm:grid-cols-2">
      {FIELDS.map((field) => (
        <label key={field.name} className="grid gap-2 text-[15px] text-white/70">
          {field.label}
          <input
            name={field.name}
            type={field.type ?? "text"}
            required
            value={form[field.name]}
            onChange={handleChange}
            autoComplete={field.autoComplete}
            className={`${INPUT_CLASS} h-12`}
          />
        </label>
      ))}
      <label className="grid gap-2 text-[15px] text-white/70 sm:col-span-2">
        Message
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          className={`${INPUT_CLASS} resize-y py-3`}
        />
      </label>
      {error ? (
        <p role="alert" className="text-[15px] text-[#ffb4a8] sm:col-span-2">
          {error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button type="submit" disabled={submitting} className="ent-pill-light w-full sm:w-auto">
          {submitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
