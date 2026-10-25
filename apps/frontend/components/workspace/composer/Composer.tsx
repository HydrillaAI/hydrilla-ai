"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ArrowUp, Box, Clock, Coins, Droplets, Image as ImageIcon, Paperclip, PenLine, Sparkles, Type, Upload, X } from "lucide-react";
import { COMPOSER_SIZE } from "@/lib/composer-size";
import type { PromptHistoryEntry } from "@/lib/prompt-history";
import { cn } from "@/lib/utils";
import { StudioOrb } from "../StudioOrb";
import { EASE, FOCUS, ICON_BUTTON, MAX_PROMPT, PromptHistoryDropdown } from "../composer-parts";
import type { ComposerMode } from "../types";
import { AttachmentCard, AttachmentDropzone } from "./ComposerAttachments";

export type ComposerAttachment = {
  kind: "image" | "model";
  /** Thumbnail; null while a 3D upload is still rendering its snapshot. */
  preview: string | null;
  label: string;
  /** Extra facts after the pixel size, e.g. "PNG · 1.2 MB" or "From library". */
  detail?: string;
};

/** The input tile left of the prompt (image → 3D, image edit, model edit). */
export type ComposerSlot = {
  label: string;
  /** Shown inside the empty dropzone when the slot is the only input. */
  hint?: string;
  kind: "image" | "model";
  attachment: ComposerAttachment | null;
  /** File types the tile's picker offers. */
  accept: ("image" | "model")[];
};

export type ComposerSuggestion = {
  label: string;
  icon: "model" | "image";
  onClick: () => void;
};

const MODES: { id: ComposerMode; label: string; icon: typeof ImageIcon }[] = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "3d", label: "3D", icon: Box },
  { id: "agent", label: "Agent", icon: Droplets },
];

const INPUTS: Record<"3d" | "image", { id: string; label: string; icon: typeof ImageIcon }[]> = {
  "3d": [
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "prompt", label: "Text", icon: Type },
    { id: "edit", label: "Edit", icon: PenLine },
  ],
  image: [
    { id: "generate", label: "Generate", icon: Sparkles },
    { id: "edit", label: "Edit", icon: PenLine },
  ],
};

const ACCEPT = {
  image: ".png,.jpg,.jpeg,.webp",
  model: ".glb,.gltf,.obj,model/gltf-binary,model/gltf+json",
} as const;

/**
 * One inset (`pad`) runs down the whole card: the mode bar, attachments, prompt text and footer all
 * start on the same vertical line, so the composer reads as one aligned column.
 */
const METRICS = {
  small: {
    width: "max-w-[620px]",
    radius: "rounded-[22px]",
    pad: "px-2.5",
    segment: "sm" as const,
    type: "text-[16px] sm:text-[14px] leading-6",
    minHeight: "min-h-12",
    promptMax: 120,
  },
  medium: {
    width: "max-w-[680px]",
    radius: "rounded-[26px]",
    pad: "px-3",
    segment: "md" as const,
    type: "text-[16px] sm:text-[15px] leading-6",
    minHeight: "min-h-11",
    promptMax: 168,
  },
  large: {
    width: "max-w-[760px]",
    radius: "rounded-[28px]",
    pad: "px-3.5",
    segment: "md" as const,
    type: "text-[16px] leading-6",
    minHeight: "min-h-14",
    promptMax: 200,
  },
} as const;

type Props = {
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  /** Sub-mode under the tabs: 3D source (Model3DSource) or image generate / edit. */
  inputSwitch?: {
    set: "3d" | "image";
    value: string;
    onChange: (value: string) => void;
    /** Options shown but not selectable, with the reason as a tooltip. */
    disabled?: { ids: string[]; reason: string };
    /** Briefly shine one option; a new `key` replays it. */
    attention?: { id: string; key: string };
  } | null;
  /** Agent refine history, shown collapsed above the prompt. */
  thread?: ReactNode;
  slot: ComposerSlot | null;
  onClearAttachment: () => void;
  /** Accept dropped / pasted files in this mode. */
  acceptFiles: boolean;
  onAttachFile: (file: File) => void;
  onDropOnComposer: (e: React.DragEvent) => void;
  /** False when the slot alone is the input (image → 3D); the placeholder becomes a hint. */
  showPrompt: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestion: ComposerSuggestion | null;
  settings: ReactNode;
  cost: number | null;
  submitLabel: string;
  canSubmit: boolean;
  /** Shown when the submit control is held, for example outside a booked hour. */
  blockedNote?: string | null;
  /** Short form of `blockedNote` for the chip beside submit, e.g. "Opens in 9h 19m". */
  blockedChip?: string | null;
  generating: boolean;
  onSubmit: () => void;
  error: string | null;
  onDismissError: () => void;
  promptHistory: PromptHistoryEntry[];
  onSelectHistory: (text: string) => void;
  onClearHistory: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  className?: string;
};

function Segmented<T extends string>({
  label,
  items,
  value,
  onChange,
  disabled,
  attention,
  size,
}: {
  label: string;
  items: { id: T; label: string; icon: typeof ImageIcon }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: { ids: string[]; reason: string };
  attention?: { id: string; key: string };
  size: "md" | "sm";
}) {
  return (
    <div className="flex shrink-0 items-center rounded-full bg-neutral-100 p-[3px]" role="radiogroup" aria-label={label}>
      {items.map(({ id, label: itemLabel, icon: Icon }) => {
        const off = Boolean(disabled?.ids.includes(id));
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={itemLabel}
            aria-disabled={off || undefined}
            title={off ? disabled?.reason : undefined}
            onClick={() => {
              if (!off) onChange(id);
            }}
            className={cn(
              "relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full font-medium tracking-[-0.01em]",
              size === "md" ? "h-8 px-3 text-[13px]" : "h-7 px-2.5 text-[12px]",
              EASE,
              FOCUS,
              active
                ? "bg-white text-neutral-950 shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_0.5px_rgb(0_0_0/0.06)] dark:bg-neutral-200 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.4)]"
                : off
                  ? "cursor-not-allowed text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className={cn(!active && "max-[380px]:sr-only")}>{itemLabel}</span>
            {attention?.id === id && !active && !off ? <span key={attention.key} aria-hidden className="segment-shine" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function Composer({
  mode,
  onModeChange,
  inputSwitch,
  thread,
  slot,
  onClearAttachment,
  acceptFiles,
  onAttachFile,
  onDropOnComposer,
  showPrompt,
  value,
  onChange,
  placeholder,
  suggestion,
  settings,
  cost,
  submitLabel,
  canSubmit,
  blockedNote = null,
  blockedChip = null,
  generating,
  onSubmit,
  error,
  onDismissError,
  promptHistory,
  onSelectHistory,
  onClearHistory,
  textareaRef,
  className,
}: Props) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onAttachFileRef = useRef(onAttachFile);
  onAttachFileRef.current = onAttachFile;
  const metrics = METRICS[COMPOSER_SIZE];
  const attachment = slot?.attachment ?? null;
  // Without a slot, attaching still works: the page switches to the mode that takes the file.
  const accept: readonly ("image" | "model")[] = slot ? slot.accept : mode === "3d" ? ["image", "model"] : ["image"];

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, metrics.promptMax)}px`;
  }, [value, textareaRef, showPrompt, metrics.promptMax]);

  // Paste an image anywhere on the page (outside other fields) to attach it.
  useEffect(() => {
    if (!acceptFiles) return;
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const file = event.clipboardData?.files?.[0];
      if (!file) return;
      event.preventDefault();
      onAttachFileRef.current(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [acceptFiles]);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onAttachFile(file);
  };
  const openPicker = () => fileInputRef.current?.click();

  const ready = canSubmit && !generating;
  const submitIfReady = () => {
    if (ready) onSubmit();
  };

  return (
    <div className={cn("relative mx-auto w-full", metrics.width, className)}>
      {suggestion && !generating ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center pb-3">
          <button
            type="button"
            onClick={suggestion.onClick}
            className={cn(
              "studio-float composer-attach-in pointer-events-auto inline-flex h-9 items-center gap-2 rounded-full border border-neutral-900/[0.08] bg-white/90 px-4 text-[13px] font-medium tracking-[-0.01em] text-neutral-800 shadow-[0_2px_8px_rgb(0_0_0/0.06)] backdrop-blur-xl hover:bg-white active:scale-[0.98]",
              EASE,
              FOCUS
            )}
          >
            {suggestion.icon === "model" ? (
              <Box className="h-3.5 w-3.5 text-neutral-500" strokeWidth={1.9} />
            ) : (
              <ImageIcon className="h-3.5 w-3.5 text-neutral-500" strokeWidth={1.9} />
            )}
            {suggestion.label}
          </button>
        </div>
      ) : null}

      <div
        data-dragging={dragOver || undefined}
        className={cn("studio-composer pointer-events-auto relative overflow-hidden", metrics.radius)}
        onDragEnter={(e) => {
          if (!acceptFiles) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          if (!acceptFiles) return;
          e.preventDefault();
          if (!dragOver) setDragOver(true);
        }}
        onDragLeave={(e) => {
          // Moving between children fires leave/enter pairs; only clear when the pointer exits the card.
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(false);
        }}
        onDrop={(e) => {
          setDragOver(false);
          onDropOnComposer(e);
        }}
      >
        {dragOver ? (
          <div className="pointer-events-none absolute inset-1.5 z-10 flex flex-col items-center justify-center gap-1.5 rounded-[20px] border border-dashed border-neutral-400 bg-white/90 text-neutral-900 backdrop-blur-sm composer-attach-in">
            <Upload className="h-5 w-5" strokeWidth={1.85} />
            <span className="text-[13px] font-medium tracking-[-0.01em]">Drop to attach</span>
          </div>
        ) : null}

        {error ? (
          <div
            className="flex items-start gap-2 border-b border-red-100 bg-red-50/80 px-4 py-2.5 text-[13px] leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            role="alert"
          >
            <span className="min-w-0 flex-1">{error}</span>
            <button
              type="button"
              onClick={onDismissError}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-200"
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
          </div>
        ) : null}

        <div className={cn("no-scrollbar flex items-center gap-2 overflow-x-auto pt-3", metrics.pad)}>
          <Segmented label="Create" items={MODES} value={mode} onChange={onModeChange} size={metrics.segment} />
          {inputSwitch ? (
            <Segmented
              label={inputSwitch.set === "3d" ? "Generate from" : "Image action"}
              items={INPUTS[inputSwitch.set]}
              value={inputSwitch.value}
              onChange={inputSwitch.onChange}
              disabled={inputSwitch.disabled}
              attention={inputSwitch.attention}
              size="sm"
            />
          ) : null}
          <div className="ml-auto shrink-0">
            {promptHistory.length > 0 && showPrompt ? (
              <PromptHistoryDropdown
                promptHistory={promptHistory}
                onSelectHistory={onSelectHistory}
                onClearHistory={onClearHistory}
                open={historyOpen}
                onOpenChange={setHistoryOpen}
              />
            ) : null}
          </div>
        </div>

        {thread ? <div className="mt-3 border-t border-neutral-100">{thread}</div> : null}

        {slot && !showPrompt ? (
          <div className={cn("pt-3", metrics.pad)}>
            {attachment ? (
              <AttachmentCard attachment={attachment} variant="hero" onRemove={onClearAttachment} onReplace={openPicker} />
            ) : (
              <AttachmentDropzone label={slot.label} hint={slot.hint} kind={slot.kind} onPick={openPicker} />
            )}
          </div>
        ) : null}

        {showPrompt ? (
          <div className={cn("flex flex-col gap-2 pt-3", metrics.pad)}>
            {attachment ? (
              <div className="flex">
                <AttachmentCard attachment={attachment} variant="inline" onRemove={onClearAttachment} onReplace={openPicker} />
              </div>
            ) : null}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value.slice(0, MAX_PROMPT))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submitIfReady();
                }
              }}
              onPaste={(e) => {
                const file = e.clipboardData.files?.[0];
                if (file && acceptFiles) {
                  e.preventDefault();
                  onAttachFile(file);
                }
              }}
              rows={1}
              maxLength={MAX_PROMPT}
              aria-label="Prompt"
              placeholder={placeholder}
              className={cn(
                // The card draws focus; the field itself never shows a border or ring.
                "studio-composer-input studio-bare-field w-full resize-none border-0 bg-transparent px-1 py-1 tracking-[-0.01em] text-neutral-950 shadow-none outline-none placeholder:text-neutral-400",
                metrics.type,
                metrics.minHeight
              )}
            />
          </div>
        ) : null}

        <div className={cn("flex items-center gap-1.5 pb-3 pt-2", metrics.pad)}>
          <div className="no-scrollbar -ml-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">{settings}</div>

          {blockedNote ? (
            // The full sentence lives in the tooltip and label; the chip keeps the footer quiet.
            <span
              role="status"
              title={blockedNote}
              aria-label={blockedNote}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-3 text-[12px] font-medium tabular-nums tracking-[-0.01em] text-neutral-600"
            >
              <Clock className="h-3.5 w-3.5 text-neutral-400" strokeWidth={2} aria-hidden />
              <span className="max-w-[180px] truncate">{blockedChip ?? blockedNote}</span>
            </span>
          ) : null}

          {acceptFiles ? (
            <button
              type="button"
              onClick={openPicker}
              aria-label="Attach a file"
              title={accept.includes("model") ? "Attach an image or GLB (or paste / drop)" : "Attach an image (or paste / drop)"}
              className={cn(ICON_BUTTON, "rounded-full")}
            >
              <Paperclip className="h-4 w-4" strokeWidth={1.85} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={submitIfReady}
            disabled={!ready}
            aria-label={blockedNote && !ready ? blockedNote : cost != null ? `${submitLabel}, ${cost} credits` : submitLabel}
            title={blockedNote && !ready ? blockedNote : submitLabel}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full p-1",
              cost != null && "pl-3",
              EASE,
              FOCUS,
              ready
                ? "bg-neutral-950 text-white shadow-[0_1px_2px_rgb(0_0_0/0.12),0_6px_16px_-8px_rgb(0_0_0/0.4)] hover:bg-neutral-800 active:scale-[0.97]"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400"
            )}
          >
            {cost != null ? (
              <span className="flex items-center gap-1 text-[12px] font-semibold tabular-nums tracking-[-0.01em]">
                <Coins className="h-3.5 w-3.5 opacity-70" strokeWidth={2} aria-hidden />
                {cost}
              </span>
            ) : null}
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", ready ? "bg-white/15" : "bg-transparent")}>
              {generating ? <StudioOrb state="working" size={20} /> : <ArrowUp className="h-4 w-4" strokeWidth={2.4} />}
            </span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept.map((k) => ACCEPT[k]).join(",")}
          className="hidden"
          onChange={pickFile}
        />
      </div>
    </div>
  );
}
