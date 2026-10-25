"use client";

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toHexColor } from "@/lib/viewer/look";
import { cn } from "@/lib/utils";

export const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20";

/** Small square icon action used in section headers and layer rows. */
export const INSPECTOR_ICON_BUTTON = cn(
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors",
  "hover:bg-neutral-100 hover:text-neutral-950 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35",
  FOCUS_RING
);

export function Section({
  title,
  action,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const shown = !collapsible || open;
  return (
    <section className="border-t border-neutral-200/70 first:border-t-0">
      <div className="flex h-12 items-center gap-1 px-4">
        <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[-0.01em] text-neutral-950">{title}</h3>
        {action}
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => setOpen((v) => !v)}
            className={INSPECTOR_ICON_BUTTON}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} strokeWidth={1.85} />
          </button>
        ) : null}
      </div>
      {shown ? (
        <div id={bodyId} className="flex flex-col gap-3 px-4 pb-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function decimalsOf(step: number) {
  const text = String(step);
  return text.includes(".") ? text.length - text.indexOf(".") - 1 : 0;
}

/**
 * Numeric readout that scrubs on horizontal drag (Shift = fine) and types on click.
 * Arrow keys step while editing; Enter commits, Escape reverts.
 */
export function ScrubValue({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const decimals = decimalsOf(step);
  const format = (n: number) => n.toFixed(decimals);
  const fit = (n: number) => Number(Math.min(max, Math.max(min, Math.round(n / step) * step)).toFixed(decimals));

  const commit = () => {
    if (draft === null) return;
    const parsed = parseFloat(draft.replace(/[^\d.+-]/g, ""));
    if (Number.isFinite(parsed)) onChange(fit(parsed));
    setDraft(null);
  };

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md px-1.5 text-[12px] font-medium tabular-nums text-neutral-950 transition-colors",
        draft === null ? "cursor-ew-resize hover:bg-neutral-100" : "bg-white ring-1 ring-neutral-300",
        className
      )}
    >
      <input
        ref={inputRef}
        aria-label={label}
        inputMode="decimal"
        readOnly={draft === null}
        value={draft ?? format(value)}
        size={Math.max(3, (draft ?? format(value)).length)}
        onFocus={(event) => {
          if (draft === null) setDraft(format(value));
          event.currentTarget.select();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setDraft(null);
            event.currentTarget.blur();
          } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            const delta = (event.key === "ArrowUp" ? 1 : -1) * step * (event.shiftKey ? 10 : 1);
            const next = fit(value + delta);
            onChange(next);
            setDraft(format(next));
          }
        }}
        onPointerDown={(event) => {
          if (draft !== null || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, start: value, moved: false };
        }}
        onPointerMove={(event) => {
          const d = drag.current;
          if (!d) return;
          const dx = event.clientX - d.x;
          if (!d.moved && Math.abs(dx) < 3) return;
          d.moved = true;
          // The full range spans about 240px; Shift slows it tenfold.
          const perPixel = ((max - min) / 240) * (event.shiftKey ? 0.1 : 1);
          onChange(fit(d.start + dx * perPixel));
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (d && !d.moved) inputRef.current?.focus();
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        className="studio-bare-field min-w-0 bg-transparent text-right outline-none [field-sizing:content] read-only:cursor-ew-resize"
      />
      {suffix ? <span className="pl-0.5 text-neutral-500">{suffix}</span> : null}
    </span>
  );
}

/** Thin track, solid fill and a white pill thumb. */
export function InspectorSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <BaseSlider.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(next) => {
        const v = Array.isArray(next) ? next[0] : next;
        if (typeof v === "number" && !Number.isNaN(v)) onChange(v);
      }}
      className="relative flex w-full touch-none select-none items-center"
    >
      <BaseSlider.Control className="flex h-5 w-full cursor-pointer items-center">
        <BaseSlider.Track className="h-1 w-full rounded-full bg-neutral-200/90">
          <BaseSlider.Indicator className="rounded-full bg-neutral-900" />
          <BaseSlider.Thumb
            aria-label={label}
            className={cn(
              // The theme flips `white` to a dark surface; the handle stays a bright pill in both.
              "block h-[18px] w-3 cursor-grab rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.14),0_2px_6px_-1px_rgba(0,0,0,0.22)] transition-transform dark:bg-[#ededf0] dark:shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
              "active:scale-110 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2"
            )}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

/** Label + scrubbable value on one line, slider below. Double-click the label to restore the default. */
export function Channel({
  label,
  value,
  min,
  max,
  step,
  suffix,
  defaultValue,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  defaultValue?: number;
  /** Shown after the label in a muted tone, e.g. "model". */
  hint?: string;
  onChange: (value: number) => void;
}) {
  const resettable = defaultValue !== undefined && Math.abs(value - defaultValue) > step / 2;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex h-7 items-center justify-between gap-3">
        <span
          onDoubleClick={() => (resettable ? onChange(defaultValue) : undefined)}
          title={resettable ? "Double-click to reset" : undefined}
          className="flex min-w-0 items-baseline gap-1.5 text-[12px] text-neutral-600"
        >
          <span className="truncate">{label}</span>
          {hint ? <span className="shrink-0 text-[11px] text-neutral-400">{hint}</span> : null}
        </span>
        <ScrubValue label={label} value={value} min={min} max={max} step={step} suffix={suffix} onChange={onChange} className="-mr-1.5" />
      </div>
      <InspectorSlider label={label} value={value} min={min} max={max} step={step} onChange={onChange} />
    </div>
  );
}

export function Flag({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex h-7 items-center justify-between gap-3">
      <label htmlFor={id} className="min-w-0 truncate text-[12px] text-neutral-600">
        {label}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={(next) => onChange(next === true)} className="focus-visible:ring-neutral-900/25" />
    </div>
  );
}

/** Segmented choice; the pressed option reads as a raised white chip. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "md",
}: {
  label: string;
  value: T;
  options: { value: T; label: string; title?: string }[];
  onChange: (value: T) => void;
  size?: "md" | "lg";
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex bg-neutral-100 p-[3px]", size === "lg" ? "rounded-xl" : "rounded-[10px]")}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-w-0 flex-1 truncate px-2 font-medium transition-[background-color,color,box-shadow] duration-150",
              size === "lg" ? "h-9 rounded-[9px] text-[13px]" : "h-8 rounded-lg text-[12px]",
              active
                ? "bg-white text-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.06)] dark:bg-neutral-200 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.4)]"
                : "text-neutral-500 hover:text-neutral-900",
              FOCUS_RING
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * CSS-only sphere that reads like a material ball: a specular hotspot sized by roughness,
 * a body shaded from the base color, and stronger contrast for metals.
 */
export function sphereStyle(color: string, roughness: number, metalness: number): CSSProperties {
  const r = Math.min(1, Math.max(0, roughness));
  const m = Math.min(1, Math.max(0, metalness));
  const hotspot = 6 + r * 34;
  const shine = 0.95 - r * 0.7;
  const shade = Math.round(38 + m * 30);
  const lift = Math.round(30 - m * 12);
  const bounce = (1 - r) * (0.25 + m * 0.35);
  return {
    backgroundImage: [
      `radial-gradient(circle at 33% 27%, rgba(255,255,255,${shine.toFixed(2)}) 0%, rgba(255,255,255,0) ${hotspot.toFixed(0)}%)`,
      `radial-gradient(circle at 50% 118%, rgba(255,255,255,${bounce.toFixed(2)}) 0%, rgba(255,255,255,0) 46%)`,
      `radial-gradient(circle at 38% 32%, color-mix(in srgb, ${color} ${100 - lift}%, white) 0%, ${color} 46%, color-mix(in srgb, ${color} ${100 - shade}%, black) 100%)`,
    ].join(", "),
    boxShadow: "inset -3px -5px 9px rgba(0,0,0,0.18), 0 6px 10px -7px rgba(0,0,0,0.45)",
  };
}

export const CHECKERBOARD: CSSProperties = {
  backgroundColor: "#fff",
  backgroundImage:
    "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
};

/** Swatch (opens the system picker) + editable hex, in one field. */
export function ColorField({ label, value, onChange, trailing }: { label: string; value: string; onChange: (hex: string) => void; trailing?: ReactNode }) {
  const pickerId = useId();
  const hex = toHexColor(value) ?? "#888888";
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft === null) return;
    const raw = draft.trim();
    const next = toHexColor(raw.startsWith("#") ? raw : `#${raw}`);
    if (next) onChange(next);
    setDraft(null);
  };
  return (
    <div className="flex h-10 items-center rounded-xl bg-neutral-100 pl-1.5 pr-1">
      <label htmlFor={pickerId} className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]" style={{ backgroundColor: hex }}>
        <span className="sr-only">{label} picker</span>
        <input
          id={pickerId}
          type="color"
          value={hex}
          onChange={(event) => {
            const next = toHexColor(event.target.value);
            if (next) onChange(next);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <input
        aria-label={`${label} hex`}
        spellCheck={false}
        value={draft ?? hex.slice(1).toUpperCase()}
        onFocus={(event) => {
          setDraft(hex.slice(1).toUpperCase());
          event.currentTarget.select();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            event.stopPropagation();
            setDraft(null);
            requestAnimationFrame(() => (event.target as HTMLInputElement).blur());
          }
        }}
        className="studio-bare-field h-full min-w-0 flex-1 bg-transparent px-2.5 text-[12px] font-medium uppercase tracking-wide text-neutral-950 outline-none"
      />
      {trailing}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] bg-neutral-100 px-1 font-sans text-[10px] font-medium text-neutral-600 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]">
      {children}
    </kbd>
  );
}
