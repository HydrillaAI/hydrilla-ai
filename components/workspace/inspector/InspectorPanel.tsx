"use client";

import { memo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ModelMeshStats } from "@/lib/viewer/meshStats";
import type { PartMaterial, ViewerCameraView, ViewerLook } from "@/lib/viewer/look";
import { cn } from "@/lib/utils";
import { AssetInspector, type InspectorTab } from "../AssetInspector";
import { ICON_BUTTON } from "../composer-parts";
import type { ModelBadge } from "../ModelStatsOverlay";
import { Segmented } from "./controls";

type Props = {
  kind: "3d" | "code";
  parts: string[];
  partColors?: Record<string, string>;
  editedParts?: string[];
  hiddenParts?: string[];
  onTogglePartHidden?: (name: string) => void;
  onIsolatePart?: (name: string) => void;
  onShowAllParts?: () => void;
  onResetPart?: () => void;
  onResetAllParts?: () => void;
  onCopyPartMaterial?: () => void;
  onPastePartMaterial?: () => void;
  copiedMaterial?: PartMaterial | null;
  onCapture?: () => void;
  selectedPart: string | null;
  onSelectPart: (name: string) => void;
  look: ViewerLook;
  onLookChange: (patch: Partial<ViewerLook>) => void;
  partMaterial?: PartMaterial | null;
  onPartMaterial?: (patch: Partial<PartMaterial>) => void;
  authoredPbr?: { roughness: number; metalness: number } | null;
  onCameraView?: (view: ViewerCameraView) => void;
  stats?: ModelMeshStats | null;
  badge?: ModelBadge | null;
  onClose: () => void;
  /** Compact screens: slide over the canvas instead of docking beside it. */
  overlay: boolean;
  /** Credits, theme, and profile. Stays inside this column. */
  account?: ReactNode;
};

/** Keep in sync with the toolbar offset in app/workspace/page.tsx. */
export const INSPECTOR_WIDTH = 304;

const TABS: { value: InspectorTab; label: string; title: string }[] = [
  { value: "design", label: "Design", title: "Layers, part materials and surface" },
  { value: "scene", label: "Scene", title: "Light, backdrop and camera" },
];

export const InspectorPanel = memo(function InspectorPanel({ onClose, overlay, kind, stats = null, badge = null, account = null, ...inspector }: Props) {
  const [tab, setTab] = useState<InspectorTab>("design");
  const panel = (
    <aside
      aria-label="Adjust"
      style={{ width: INSPECTOR_WIDTH }}
      className={cn(
        "inspector-panel-in pointer-events-auto flex h-full max-w-[85vw] shrink-0 flex-col overflow-hidden border-l border-neutral-200/80 bg-white pt-[env(safe-area-inset-top)] select-none",
        overlay && "shadow-[-24px_0_60px_-30px_rgba(0,0,0,0.35)]"
      )}
    >
      <div className="flex h-12 shrink-0 items-center gap-1 pl-4 pr-1.5">
        <span className="shrink-0 text-[13px] font-semibold text-neutral-950">Adjust</span>
        <div className="ml-auto min-w-0">{account}</div>
        <button type="button" onClick={onClose} className={cn(ICON_BUTTON, "rounded-full")} aria-label="Close adjust panel">
          <X className="h-4 w-4" strokeWidth={1.85} />
        </button>
      </div>
      <div className="shrink-0 border-b border-neutral-200/70 px-3 pb-3">
        <Segmented label="Inspector section" value={tab} options={TABS} onChange={setTab} size="lg" />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="pb-6">
          <AssetInspector kind={kind} tab={tab} hideViewToggles={kind === "3d" && !overlay} stats={stats} badge={badge} {...inspector} />
        </div>
      </ScrollArea>
    </aside>
  );

  if (!overlay) return panel;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Close adjust panel" onClick={onClose} className="absolute inset-0 bg-scrim/20 dark:bg-scrim/50" />
      <div className="relative h-full">{panel}</div>
    </div>
  );
});
