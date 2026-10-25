"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportContent, type ReportReason } from "@/lib/community";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCommunity } from "./CommunityProvider";

const REASONS: { id: ReportReason; label: string }[] = [
  { id: "spam", label: "Spam or misleading" },
  { id: "nsfw", label: "Sexual or explicit content" },
  { id: "violence", label: "Violence or gore" },
  { id: "harassment", label: "Harassment or hate" },
  { id: "copyright", label: "Copyright or stolen work" },
  { id: "other", label: "Something else" },
];

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "post" | "comment" | "user";
  targetId: string;
}) {
  const { getToken } = useCommunity();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason) return;
    setState("sending");
    setError(null);
    try {
      await reportContent(getToken, { targetType, targetId, reason, details: details.trim() || undefined });
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the report");
      setState("error");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setReason(null);
          setDetails("");
          setState("idle");
        }
      }}
    >
      <DialogContent className="max-w-md p-6">
        {state === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
              <Flag className="h-5 w-5" />
            </span>
            <DialogTitle className="community-display text-[20px]">Thanks for letting us know</DialogTitle>
            <DialogDescription className="text-[14px] text-neutral-500">
              Our team reviews every report. We&apos;ll take action if it breaks the community guidelines.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogTitle className="community-display pr-10 text-[20px]">Report {targetType}</DialogTitle>
            <DialogDescription className="mt-1 text-[13px] text-neutral-500">
              Reports are anonymous to the person you report.
            </DialogDescription>
            <div className="mt-5 flex flex-col gap-1.5">
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  aria-pressed={reason === r.id}
                  className={cn(
                    "flex h-11 items-center rounded-2xl border px-4 text-left text-[14px] transition-colors",
                    reason === r.id
                      ? "border-neutral-900 bg-neutral-50 text-neutral-900"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Anything else we should know? (optional)"
              className="mt-3 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
            />
            {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-10 rounded-full px-4 text-[14px] font-medium text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reason || state === "sending"}
                onClick={() => void submit()}
                className="h-10 rounded-full bg-neutral-900 px-5 text-[14px] font-semibold text-white hover:bg-neutral-700 disabled:opacity-40"
              >
                {state === "sending" ? "Sending…" : "Send report"}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
