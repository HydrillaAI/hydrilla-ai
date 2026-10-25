"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Grid3x3, RotateCw, Sun, Box, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProxyGlbUrl } from "@/lib/api";
import { formatEngineLabel } from "@/lib/engines";
import { applyLookPatch, DEFAULT_VIEWER_LOOK, type ViewerLook } from "@/lib/viewer/look";
import type { PostItem } from "@/lib/community";

const ThreeViewer = dynamic(() => import("@/components/ThreeViewer").then((m) => ({ default: m.ThreeViewer })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800" />
    </div>
  ),
});

const LIGHTING: { id: ViewerLook["lighting"]; label: string }[] = [
  { id: "studio", label: "Studio" },
  { id: "outdoor", label: "Outdoor" },
  { id: "neutral", label: "Neutral" },
];

const MATERIALS: { id: ViewerLook["materialType"]; label: string }[] = [
  { id: "standard", label: "Textured" },
  { id: "matcap", label: "Clay" },
  { id: "normal", label: "Normals" },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/80 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-md"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "h-7 rounded-full px-2.5 text-[12px] font-medium transition-colors",
            value === o.id ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-md transition-colors",
        on ? "bg-neutral-900 text-white" : "bg-white/80 text-neutral-500 hover:text-neutral-900"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Left side of a post: interactive model (or image) with a compact look toolbar.
 * `footer` sits under the item strip at the bottom of the stage (the mobile summary card).
 */
export function PostStage({ items, title, footer }: { items: PostItem[]; title: string; footer?: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [index, setIndex] = useState(0);
  const [look, setLook] = useState<ViewerLook>({ ...DEFAULT_VIEWER_LOOK, autoRotate: true });
  const item = items[Math.min(index, items.length - 1)];

  useEffect(() => setIndex(0), [items]);

  const viewerLook = useMemo(
    () => ({ ...look, theme: resolvedTheme === "dark" ? ("dark" as const) : ("light" as const) }),
    [look, resolvedTheme]
  );
  const patch = (p: Partial<ViewerLook>) => setLook((prev) => applyLookPatch(prev, p));

  if (!item) return <div className="community-stage h-full w-full rounded-[22px]" />;

  return (
    <div className="community-stage relative h-full w-full overflow-hidden rounded-[22px]">
      {item.kind === "model" ? (
        <>
          <ThreeViewer
            key={item.jobId}
            glbUrl={getProxyGlbUrl(item.jobId)}
            look={viewerLook}
            statsCorner="top-left"
            statsClassName="top-[52px]"
            statsBadge={item.engine ? { label: formatEngineLabel(item.engine), icon: "cloud" } : null}
          />
          {/* One row everywhere; scrolls sideways on narrow screens instead of wrapping over the model. */}
          <div className="hide-scrollbar absolute inset-x-0 top-0 z-10 flex items-center gap-2 overflow-x-auto px-3 pt-3">
            <Segmented label="Lighting" value={look.lighting} options={LIGHTING} onChange={(lighting) => patch({ lighting })} />
            <Segmented
              label="Material"
              value={look.materialType}
              options={MATERIALS}
              onChange={(materialType) => patch({ materialType })}
            />
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <Toggle on={look.wireframe} label="Wireframe" onClick={() => patch({ wireframe: !look.wireframe })}>
                <Box className="h-4 w-4" />
              </Toggle>
              <Toggle on={look.grid} label="Grid" onClick={() => patch({ grid: !look.grid })}>
                <Grid3x3 className="h-4 w-4" />
              </Toggle>
              <Toggle on={look.autoRotate} label="Auto-rotate" onClick={() => patch({ autoRotate: !look.autoRotate })}>
                <RotateCw className="h-4 w-4" />
              </Toggle>
              <Toggle on={look.shadow} label="Shadow" onClick={() => patch({ shadow: !look.shadow })}>
                <Sun className="h-4 w-4" />
              </Toggle>
            </div>
          </div>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={title} className="absolute inset-0 h-full w-full object-contain p-4" />
      )}

      {(items.length > 1 || footer) && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex flex-col items-center gap-2">
          {items.length > 1 && (
            <div className="hide-scrollbar pointer-events-auto flex max-w-full gap-1.5 overflow-x-auto rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur-md">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show item ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "flex h-9 min-w-9 shrink-0 items-center justify-center gap-1 rounded-full px-2.5 text-[12px] font-medium transition-colors",
                    i === index ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {it.kind === "model" ? <Box className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  {i + 1}
                </button>
              ))}
            </div>
          )}
          {footer && <div className="pointer-events-auto w-full">{footer}</div>}
        </div>
      )}
    </div>
  );
}
