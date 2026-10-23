"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

type State = "idle" | "comment" | "submitting" | "thanks" | "error";

export function FeedbackWidget() {
  const pathname = usePathname();
  const [state, setState] = useState<State>("idle");

  async function submit(helpful: boolean, comment: string) {
    setState("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, helpful, comment }),
      });
      if (!res.ok) throw new Error("failed");
      setState("thanks");
    } catch {
      setState("error");
    }
  }

  return (
    <section aria-labelledby="feedback-heading" className="mt-12 rounded border border-line bg-subtle p-5">
      <h2 id="feedback-heading" className="!mt-0 !border-t-0 !pt-0 text-h3 font-semibold text-ink">
        Was this page helpful?
      </h2>

      {state === "idle" && (
        <div className="mt-3 flex items-center gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => submit(true, "")}>
            <ThumbsUp className="h-4 w-4" aria-hidden />
            Yes
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setState("comment")}>
            <ThumbsDown className="h-4 w-4" aria-hidden />
            No
          </button>
        </div>
      )}

      {state === "comment" && (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            submit(false, String(data.get("comment") ?? ""));
          }}
        >
          <label htmlFor="feedback-comment" className="block text-small text-ink-2">
            What could we improve? (optional)
          </label>
          <textarea
            id="feedback-comment"
            name="comment"
            rows={3}
            maxLength={2000}
            className="w-full rounded-sm border border-line bg-surface p-3 text-small text-ink"
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="btn btn-primary">
              Submit feedback
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setState("idle")}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {state === "submitting" && (
        <p className="mt-3 flex items-center gap-2 text-small text-ink-2" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Sending feedback…
        </p>
      )}

      {state === "thanks" && (
        <p className="mt-3 text-small text-ink-2" role="status" aria-live="polite">
          Thanks, this helps us improve the docs.
        </p>
      )}

      {state === "error" && (
        <div className="mt-3 flex items-center gap-3" role="alert">
          <p className="text-small text-danger">We couldn’t send your feedback.</p>
          <button type="button" className="btn btn-secondary" onClick={() => submit(true, "")}>
            Retry
          </button>
        </div>
      )}
    </section>
  );
}
