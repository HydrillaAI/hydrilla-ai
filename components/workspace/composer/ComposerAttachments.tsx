"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Image as ImageIcon, Maximize2, RefreshCw, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayImageUrl, EASE, FOCUS } from "../composer-parts";
import type { ComposerAttachment } from "./Composer";

type Size = { w: number; h: number };

/** "1024 × 768" once the preview has decoded; the attachment's own detail until then. */
function describe(attachment: ComposerAttachment, size: Size | null) {
  if (attachment.kind === "model") return attachment.preview ? "3D model" : "Rendering views…";
  const dims = size ? `${size.w} × ${size.h}` : null;
  return [dims, attachment.detail].filter(Boolean).join(" · ") || "Image";
}

function Thumb({
  attachment,
  onSize,
  className,
}: {
  attachment: ComposerAttachment;
  onSize: (size: Size) => void;
  className?: string;
}) {
  const Icon = attachment.kind === "model" ? Box : ImageIcon;
  const imgRef = useRef<HTMLImageElement>(null);
  // A cached or pre-hydration image can finish before React attaches onLoad; read it directly then.
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth) onSize({ w: el.naturalWidth, h: el.naturalHeight });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment.preview]);
  return (
    <span className={cn("relative block shrink-0 overflow-hidden bg-neutral-100", className)}>
      {attachment.preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={displayImageUrl(attachment.preview)}
          alt=""
          draggable={false}
          onLoad={(e) => onSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          className="h-full w-full object-cover"
        />
      ) : (
        // A 3D upload has no thumbnail until its views render.
        <span className="studio-skeleton flex h-full w-full items-center justify-center text-neutral-400">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </span>
      )}
      {attachment.kind === "model" ? (
        <span className="absolute bottom-1 left-1 rounded-[5px] bg-scrim/60 px-1 text-[9px] font-semibold leading-[14px] text-on-scrim backdrop-blur-sm">
          3D
        </span>
      ) : null}
    </span>
  );
}

/** Full-size look at the attachment. Esc or a click outside closes it. */
function AttachmentPreview({ attachment, size, onClose }: { attachment: ComposerAttachment; size: Size | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  if (!attachment.preview) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${attachment.label}`}
      onClick={onClose}
      className="app-themed fixed inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-scrim/70 p-6 backdrop-blur-md composer-attach-in"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayImageUrl(attachment.preview)}
        alt={attachment.label}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[78vh] max-w-[min(92vw,1100px)] rounded-[20px] object-contain shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)]"
      />
      <div className="flex items-center gap-3 text-[13px] text-on-scrim/80" onClick={(e) => e.stopPropagation()}>
        <span className="max-w-[50vw] truncate font-medium text-on-scrim">{attachment.label}</span>
        <span className="tabular-nums">{describe(attachment, size)}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-on-scrim/10 text-on-scrim hover:bg-on-scrim/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-scrim/60"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>,
    document.body
  );
}

/**
 * The attached image or model. "inline" sits above the prompt; "hero" fills the composer when the
 * attachment is the whole input (image → 3D), with room to replace it.
 */
export function AttachmentCard({
  attachment,
  variant,
  onRemove,
  onReplace,
}: {
  attachment: ComposerAttachment;
  variant: "inline" | "hero";
  onRemove: () => void;
  onReplace: () => void;
}) {
  // Keyed to the source, so a replaced image never shows the previous one's size (and no reset can race onLoad).
  const [measured, setMeasured] = useState<(Size & { src: string | null }) | null>(null);
  const size = measured && measured.src === attachment.preview ? measured : null;
  const setSize = (next: Size) => setMeasured({ ...next, src: attachment.preview });
  const [previewing, setPreviewing] = useState(false);
  const canPreview = Boolean(attachment.preview);
  const hero = variant === "hero";

  return (
    <div
      className={cn(
        "composer-attach-in group/attach relative flex min-w-0 items-center rounded-[18px] bg-neutral-50 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
        hero ? "w-full gap-3.5 p-2 pr-2.5" : "max-w-full gap-3 p-1.5 pr-2"
      )}
    >
      <button
        type="button"
        onClick={() => canPreview && setPreviewing(true)}
        disabled={!canPreview}
        aria-label={canPreview ? `Preview ${attachment.label}` : attachment.label}
        title={canPreview ? "Preview" : undefined}
        className={cn("relative shrink-0 rounded-[13px] disabled:cursor-default", FOCUS)}
      >
        <Thumb attachment={attachment} onSize={setSize} className={cn("rounded-[13px]", hero ? "h-16 w-16" : "h-12 w-12")} />
        {canPreview ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-[13px] bg-scrim/35 text-on-scrim opacity-0 transition-opacity duration-150 group-hover/attach:opacity-100">
            <Maximize2 className="h-4 w-4" strokeWidth={2} />
          </span>
        ) : null}
      </button>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate font-medium tracking-[-0.01em] text-neutral-900", hero ? "text-[14px]" : "text-[13px]")} title={attachment.label}>
          {attachment.label}
        </span>
        <span className="truncate text-[12px] tabular-nums text-neutral-500">{describe(attachment, size)}</span>
        {hero ? (
          <span className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
            Ready to generate
          </span>
        ) : null}
      </span>

      <span className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onReplace}
          aria-label="Replace"
          title="Replace"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full text-[12px] font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
            hero ? "px-3" : "w-8 justify-center",
            EASE,
            FOCUS
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          {hero ? <span>Replace</span> : null}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${attachment.label}`}
          title="Remove"
          className={cn("flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950", EASE, FOCUS)}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </span>

      {previewing ? <AttachmentPreview attachment={attachment} size={size} onClose={() => setPreviewing(false)} /> : null}
    </div>
  );
}

/** Empty input slot: click, drop, or paste. */
export function AttachmentDropzone({
  label,
  hint,
  kind,
  onPick,
}: {
  label: string;
  hint?: string;
  kind: "image" | "model";
  onPick: () => void;
}) {
  const Icon = kind === "model" ? Box : Upload;
  return (
    <button
      type="button"
      onClick={onPick}
      title={kind === "model" ? "Click, or drop a GLB here" : "Click, drop, or paste an image"}
      className={cn(
        "group/drop flex w-full items-center gap-3 rounded-[18px] border border-dashed border-neutral-200 bg-neutral-50/70 p-2 pr-2.5 text-left",
        "hover:border-neutral-400 hover:bg-neutral-100/70 active:scale-[0.995]",
        EASE,
        FOCUS
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-neutral-700 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.12)] transition-transform duration-200 group-hover/drop:-translate-y-px dark:bg-neutral-200 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.06)]">
        <Icon className="h-4 w-4" strokeWidth={1.85} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-neutral-900">{label}</span>
        {hint ? <span className="truncate text-[12px] text-neutral-500 max-sm:hidden">{hint}</span> : null}
        <span className="truncate text-[12px] text-neutral-500 sm:hidden">
          {kind === "model" ? "Tap to choose a GLB file" : "Tap to choose an image"}
        </span>
      </span>
      <span className="hidden h-8 shrink-0 items-center rounded-full bg-neutral-950 px-3.5 text-[12px] font-semibold text-white transition-colors group-hover/drop:bg-neutral-800 sm:inline-flex">
        Browse
      </span>
    </button>
  );
}
