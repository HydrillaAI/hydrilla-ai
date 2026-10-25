"use client";

import { useMemo, type ReactNode } from "react";
import { Camera, ClipboardPaste, Copy, Eye, EyeOff, Focus, RotateCcw, Scan } from "lucide-react";
import type { ModelMeshStats } from "@/lib/viewer/meshStats";
import { cn } from "@/lib/utils";
import type { ModelBadge } from "./ModelStatsOverlay";
import {
  DEFAULT_PBR,
  DEFAULT_VIEWER_LOOK,
  FOV_RANGE,
  THEME_BACKDROP,
  backdropColorOf,
  focalLengthFromFov,
  fovFromFocalLength,
  type PartMaterial,
  type ViewerCameraMode,
  type ViewerCameraView,
  type ViewerLook,
  type ViewerWireframeStyle,
} from "@/lib/viewer/look";
import {
  CHECKERBOARD,
  Channel,
  ColorField,
  FOCUS_RING,
  Flag,
  INSPECTOR_ICON_BUTTON,
  Kbd,
  Section,
  Segmented,
  sphereStyle,
} from "./inspector/controls";
import { LayersList } from "./inspector/LayersList";
import {
  BACKDROP_SWATCHES,
  FINISH_PRESETS,
  FOCAL_STOPS,
  LIGHT_PRESETS,
  PART_PRESETS,
  SHADING_PRESETS,
  finishMatches,
  partMatches,
} from "./inspector/presets";

export type InspectorTab = "design" | "scene";

type Props = {
  kind: "empty" | "preview" | "3d" | "code";
  tab: InspectorTab;
  parts: string[];
  /** Current base color per part, for layer swatches. */
  partColors?: Record<string, string>;
  /** Parts whose material differs from the authored one. */
  editedParts?: string[];
  hiddenParts?: string[];
  onTogglePartHidden?: (name: string) => void;
  onIsolatePart?: (name: string) => void;
  onShowAllParts?: () => void;
  /** Restore the selected part's authored material. */
  onResetPart?: () => void;
  /** Restore every edited part's authored material. */
  onResetAllParts?: () => void;
  onCopyPartMaterial?: () => void;
  /** Present only while a material is on the clipboard. */
  onPastePartMaterial?: () => void;
  copiedMaterial?: PartMaterial | null;
  /** Save a PNG of the current view. */
  onCapture?: () => void;
  selectedPart: string | null;
  onSelectPart: (name: string) => void;
  look: ViewerLook;
  onLookChange: (patch: Partial<ViewerLook>) => void;
  partMaterial?: PartMaterial | null;
  onPartMaterial?: (patch: Partial<PartMaterial>) => void;
  /** Average authored roughness / metalness, shown until the user overrides them. */
  authoredPbr?: { roughness: number; metalness: number } | null;
  onCameraView?: (view: ViewerCameraView) => void;
  stats?: ModelMeshStats | null;
  badge?: ModelBadge | null;
  /** Grid, rotate and wireframe already live in the viewer toolbar. */
  hideViewToggles?: boolean;
};

const NONE: string[] = [];

/** Mid-grey hairline so white and black swatches both keep an edge in either theme. */
const SWATCH = "aspect-square rounded-[10px] shadow-[inset_0_0_0_1px_rgb(128_128_128/0.28)]";

const ACTION_BUTTON = cn(
  "flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-neutral-100 px-2 text-[12px] font-medium text-neutral-700 transition-colors",
  "hover:bg-neutral-200/70 hover:text-neutral-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
  FOCUS_RING
);

const LENS_OPTIONS: { value: ViewerCameraMode; label: string }[] = [
  { value: "perspective", label: "Perspective" },
  { value: "isometric", label: "Isometric" },
];

type WireMode = "off" | ViewerWireframeStyle;

const WIRE_OPTIONS: { value: WireMode; label: string; title: string }[] = [
  { value: "off", label: "Off", title: "Shaded only" },
  { value: "overlay", label: "Overlay", title: "Edges over the shaded surface, for topology review" },
  { value: "only", label: "Wire", title: "Wireframe only" },
];

const VIEW_OPTIONS: { value: ViewerCameraView; label: string; title: string }[] = [
  { value: "front", label: "Front", title: "Front view" },
  { value: "side", label: "Side", title: "Right side view" },
  { value: "top", label: "Top", title: "Top view" },
  { value: "reset", label: "¾", title: "Three-quarter view, framed (F with nothing selected)" },
];

/** Neutral body for the finish tiles: they preview light response, not color. */
const FINISH_TILE_COLOR = "#a8a29e";

const FOCAL_RANGE = {
  min: Math.ceil(focalLengthFromFov(FOV_RANGE.max)),
  max: Math.floor(focalLengthFromFov(FOV_RANGE.min)),
};

function Tile({
  active,
  label,
  onClick,
  title,
  className,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={title ?? label}
      onClick={onClick}
      className={cn(
        "group flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl transition-[background-color,box-shadow] duration-150",
        active
          ? "bg-white shadow-[0_0_0_1.5px_var(--color-neutral-950),0_4px_14px_-6px_rgba(0,0,0,0.25)] dark:bg-neutral-200"
          : "bg-neutral-100 hover:bg-neutral-200/70",
        FOCUS_RING,
        className
      )}
    >
      {children}
      <span className={cn("max-w-full truncate px-1 text-[11px]", active ? "font-medium text-neutral-950" : "text-neutral-600")}>{label}</span>
    </button>
  );
}

const SHORTCUTS: [string, string][] = [
  ["F", "frame"],
  ["H", "hide"],
  ["⇧H", "isolate"],
  ["⌥H", "show all"],
];

function Shortcuts() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-neutral-200/70 px-4 py-3 text-[11px] text-neutral-500">
      {SHORTCUTS.map(([key, action]) => (
        <span key={key} className="flex items-center gap-1">
          <Kbd>{key}</Kbd> {action}
        </span>
      ))}
    </div>
  );
}

/** Three significant figures keeps 0.0123 and 123 equally readable. */
const dimension = (n: number) => (n === 0 ? "0" : Number(n.toPrecision(3)).toString());

function Mesh({ stats, unit }: { stats: ModelMeshStats; unit: string }) {
  const size = stats.size;
  const rows: [string, string][] = [
    ["Faces", stats.faces.toLocaleString()],
    ["Vertices", stats.vertices.toLocaleString()],
    ["Parts", String(stats.meshCount)],
    ["Topology", stats.topology],
    ["Watertight", stats.isWatertight ? "Yes" : "No"],
  ];
  return (
    <dl className="grid grid-cols-2 gap-1.5">
      {size ? (
        <div className="col-span-2 flex min-w-0 flex-col gap-1 rounded-xl bg-neutral-100 px-3 py-2">
          <dt className="text-[11px] text-neutral-500">Dimensions</dt>
          <dd className="grid grid-cols-3 gap-2 text-[12px] font-medium tabular-nums text-neutral-950">
            {(["W", "H", "D"] as const).map((axis, i) => (
              // glTF is Y-up: width is X, height is Y, depth is Z.
              <span key={axis} className="flex min-w-0 items-baseline gap-1" title={`${size[i]} ${unit}`.trim()}>
                <span className="text-[10px] font-semibold text-neutral-400">{axis}</span>
                <span className="truncate">
                  {dimension(size[i])}
                  {unit ? <span className="pl-0.5 text-neutral-500">{unit}</span> : null}
                </span>
              </span>
            ))}
          </dd>
        </div>
      ) : null}
      {rows.map(([term, value]) => (
        <div key={term} className="flex min-w-0 flex-col gap-0.5 rounded-xl bg-neutral-100 px-3 py-2">
          <dt className="text-[11px] text-neutral-500">{term}</dt>
          <dd className="truncate text-[12px] font-medium tabular-nums text-neutral-950" title={value}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function AssetInspector({
  kind,
  tab,
  parts,
  partColors = {},
  editedParts = NONE,
  hiddenParts = NONE,
  onTogglePartHidden,
  onIsolatePart,
  onShowAllParts,
  onResetPart,
  onResetAllParts,
  onCopyPartMaterial,
  onPastePartMaterial,
  copiedMaterial = null,
  onCapture,
  selectedPart,
  onSelectPart,
  look,
  onLookChange,
  partMaterial,
  onPartMaterial,
  authoredPbr,
  onCameraView,
  stats = null,
  badge = null,
  hideViewToggles = false,
}: Props) {
  const edited = useMemo(() => new Set(editedParts), [editedParts]);
  const hidden = useMemo(() => new Set(hiddenParts), [hiddenParts]);

  if (kind === "empty" || kind === "preview") {
    return (
      <p className="px-4 py-4 text-[13px] leading-5 text-neutral-600">
        {kind === "preview" ? "Turn this image into 3D to adjust materials, light and camera." : "Open a 3D model to adjust it."}
      </p>
    );
  }

  const isCloud = kind === "3d";
  const pbrShading = !isCloud || look.materialType === "standard";
  const pbrEdited =
    look.roughness !== DEFAULT_PBR.roughness ||
    look.metalness !== DEFAULT_PBR.metalness ||
    look.reflections !== DEFAULT_PBR.reflections ||
    look.clearcoat !== DEFAULT_PBR.clearcoat;
  const surfaceEdited = pbrEdited || look.materialType !== DEFAULT_VIEWER_LOOK.materialType;
  const authoredRoughness = authoredPbr?.roughness ?? 0.5;
  const authoredMetalness = authoredPbr?.metalness ?? 0;
  const roughness = look.roughness ?? authoredRoughness;
  const metalness = look.metalness ?? authoredMetalness;
  const editedCount = editedParts.length;

  if (tab === "design") {
    const selectedHidden = selectedPart ? hidden.has(selectedPart) : false;
    const selectedEdited = selectedPart ? edited.has(selectedPart) : false;
    return (
      <div className="flex flex-col">
        {parts.length > 0 && onTogglePartHidden && onIsolatePart && onShowAllParts ? (
          <Section
            title="Layers"
            collapsible
            action={
              editedCount > 0 && onResetAllParts ? (
                <button
                  type="button"
                  onClick={onResetAllParts}
                  className={INSPECTOR_ICON_BUTTON}
                  aria-label="Reset all part materials"
                  title={`Reset ${editedCount === 1 ? "1 edited part" : `${editedCount} edited parts`} to authored materials`}
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.85} />
                </button>
              ) : null
            }
          >
            <LayersList
              title={badge?.label ?? "Model"}
              parts={parts}
              colors={partColors}
              edited={edited}
              hidden={hidden}
              selected={selectedPart}
              onSelect={onSelectPart}
              onToggleHidden={onTogglePartHidden}
              onIsolate={onIsolatePart}
              onShowAll={onShowAllParts}
            />
          </Section>
        ) : null}

        {selectedPart && partMaterial && onPartMaterial ? (
          <Section
            title={
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-3 w-[2px] shrink-0 rounded-full bg-sky-500" aria-hidden />
                <span className="truncate" title={selectedPart}>
                  {selectedPart}
                </span>
              </span>
            }
            action={
              <span className="flex shrink-0 items-center">
                {onCameraView ? (
                  <button type="button" onClick={() => onCameraView("selection")} disabled={selectedHidden} className={INSPECTOR_ICON_BUTTON} aria-label="Frame part" title="Frame part (F)">
                    <Scan className="h-3.5 w-3.5" strokeWidth={1.85} />
                  </button>
                ) : null}
                {onIsolatePart ? (
                  <button type="button" onClick={() => onIsolatePart(selectedPart)} className={INSPECTOR_ICON_BUTTON} aria-label="Isolate part" title="Isolate (Shift+H)">
                    <Focus className="h-3.5 w-3.5" strokeWidth={1.85} />
                  </button>
                ) : null}
                {onTogglePartHidden ? (
                  <button
                    type="button"
                    onClick={() => onTogglePartHidden(selectedPart)}
                    className={INSPECTOR_ICON_BUTTON}
                    aria-label={selectedHidden ? "Show part" : "Hide part"}
                    aria-pressed={selectedHidden}
                    title={selectedHidden ? "Show (H)" : "Hide (H)"}
                  >
                    {selectedHidden ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.85} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.85} />}
                  </button>
                ) : null}
              </span>
            }
          >
            <div role="group" aria-label="Part material presets" className="grid grid-cols-8 gap-1">
              {PART_PRESETS.map((preset) => {
                const active = partMatches(partMaterial, preset.material);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={active}
                    aria-label={preset.label}
                    title={preset.label}
                    onClick={() => onPartMaterial(preset.material)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-[10px] transition-[background-color,box-shadow]",
                      active ? "bg-white shadow-[0_0_0_1.5px_var(--color-neutral-950)] dark:bg-neutral-200" : "hover:bg-neutral-100",
                      FOCUS_RING
                    )}
                  >
                    <span
                      className="h-[22px] w-[22px] rounded-full"
                      style={sphereStyle(preset.material.color, preset.material.roughness, preset.material.metalness)}
                    />
                  </button>
                );
              })}
            </div>
            <ColorField
              label="Base color"
              value={partMaterial.color}
              onChange={(color) => onPartMaterial({ color })}
              trailing={
                <span
                  className="mr-1 h-6 w-6 shrink-0 rounded-full"
                  style={sphereStyle(partMaterial.color, partMaterial.roughness, partMaterial.metalness)}
                  title="Preview"
                  aria-hidden
                />
              }
            />
            <Channel label="Roughness" value={partMaterial.roughness} min={0} max={1} step={0.01} onChange={(value) => onPartMaterial({ roughness: value })} />
            <Channel label="Metalness" value={partMaterial.metalness} min={0} max={1} step={0.01} onChange={(value) => onPartMaterial({ metalness: value })} />
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {onCopyPartMaterial ? (
                <button type="button" onClick={onCopyPartMaterial} className={ACTION_BUTTON} title="Copy this part's material">
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.85} aria-hidden />
                  Copy
                </button>
              ) : null}
              <button
                type="button"
                onClick={onPastePartMaterial}
                disabled={!onPastePartMaterial || !copiedMaterial || partMatches(partMaterial, copiedMaterial)}
                className={ACTION_BUTTON}
                title={copiedMaterial ? "Paste the copied material onto this part" : "Copy a material from another part first"}
              >
                {copiedMaterial ? (
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                    style={sphereStyle(copiedMaterial.color, copiedMaterial.roughness, copiedMaterial.metalness)}
                    aria-hidden
                  />
                ) : (
                  <ClipboardPaste className="h-3.5 w-3.5" strokeWidth={1.85} aria-hidden />
                )}
                Paste
              </button>
              {onResetPart ? (
                <button type="button" onClick={onResetPart} disabled={!selectedEdited} className={ACTION_BUTTON} title="Reset to the authored material">
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.85} aria-hidden />
                  Reset
                </button>
              ) : null}
            </div>
          </Section>
        ) : parts.length > 0 ? (
          <p className="border-t border-neutral-200/70 px-4 py-4 text-[12px] leading-5 text-neutral-500">
            Select a part in the list or click it on the model to edit its material.
          </p>
        ) : null}

        <Section
          title="Surface"
          action={
            surfaceEdited ? (
              <button
                type="button"
                className={INSPECTOR_ICON_BUTTON}
                aria-label="Reset surface"
                title="Reset shading and finish"
                onClick={() => onLookChange({ ...DEFAULT_PBR, materialType: DEFAULT_VIEWER_LOOK.materialType })}
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.85} />
              </button>
            ) : null
          }
        >
          {isCloud ? (
            <div role="group" aria-label="Shading" className="grid grid-cols-5 gap-1.5">
              {SHADING_PRESETS.map((option) => (
                <Tile
                  key={option.value}
                  active={look.materialType === option.value}
                  label={option.label}
                  onClick={() => onLookChange({ materialType: option.value })}
                  className="h-[62px]"
                >
                  <span
                    className="h-6 w-6 rounded-full shadow-[0_5px_8px_-6px_rgba(0,0,0,0.5)]"
                    style={{ backgroundImage: option.preview }}
                    aria-hidden
                  />
                </Tile>
              ))}
            </div>
          ) : null}

          {pbrShading ? (
            <>
              <div role="group" aria-label="Finish" className="grid grid-cols-3 gap-1.5">
                {FINISH_PRESETS.map((preset) => {
                  const r = preset.finish.roughness ?? authoredRoughness;
                  const m = preset.finish.metalness ?? authoredMetalness;
                  return (
                    <Tile
                      key={preset.id}
                      active={finishMatches(look, preset.finish)}
                      label={preset.label}
                      title={preset.id === "authored" ? "Keep each part's authored roughness and metalness" : `${preset.label} finish`}
                      onClick={() => onLookChange(preset.finish)}
                      className="h-[78px]"
                    >
                      <span className="h-9 w-9 rounded-full" style={sphereStyle(FINISH_TILE_COLOR, r, m)} aria-hidden />
                    </Tile>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1">
                <Channel
                  label="Roughness"
                  hint={look.roughness == null ? "authored" : undefined}
                  value={roughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => onLookChange({ roughness: value })}
                />
                <Channel
                  label="Metalness"
                  hint={look.metalness == null ? "authored" : undefined}
                  value={metalness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => onLookChange({ metalness: value })}
                />
                <Channel
                  label="Reflections"
                  value={look.reflections}
                  min={0}
                  max={3}
                  step={0.05}
                  defaultValue={DEFAULT_PBR.reflections}
                  onChange={(reflections) => onLookChange({ reflections })}
                />
                <Channel
                  label="Clearcoat"
                  value={look.clearcoat}
                  min={0}
                  max={1}
                  step={0.01}
                  defaultValue={DEFAULT_PBR.clearcoat}
                  onChange={(clearcoat) => onLookChange({ clearcoat })}
                />
              </div>
              {editedCount > 0 && (look.roughness != null || look.metalness != null) ? (
                <p className="text-[11px] leading-4 text-neutral-500">
                  {editedCount === 1 ? "1 edited part keeps" : `${editedCount} edited parts keep`} its own roughness and metalness.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-[12px] leading-5 text-neutral-500">Finish, roughness, metalness and clearcoat apply with PBR shading.</p>
          )}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-neutral-600">Wireframe</span>
            <Segmented
              label="Wireframe"
              value={look.wireframe ? look.wireframeStyle : "off"}
              options={WIRE_OPTIONS}
              onChange={(mode) => onLookChange(mode === "off" ? { wireframe: false } : { wireframe: true, wireframeStyle: mode })}
            />
          </div>
        </Section>
        {parts.length > 0 ? <Shortcuts /> : null}
      </div>
    );
  }

  const focal = focalLengthFromFov(look.fov);
  const autoBackdrop = look.backgroundColor === "auto";
  // What the viewer shows right now, so the hex field never reads "auto".
  const backdropColor = backdropColorOf(look);
  const swatchRing = "ring-[1.5px] ring-neutral-950 ring-offset-2 ring-offset-white";

  return (
    <div className="flex flex-col">
      <Section title="Environment">
        <div role="group" aria-label="Light preset" className="grid grid-cols-3 gap-1.5">
          {LIGHT_PRESETS.map((preset) => {
            const active = look.lighting === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                aria-pressed={active}
                onClick={() => onLookChange({ lighting: preset.value })}
                className={cn(
                  "relative flex h-[72px] flex-col items-center justify-center overflow-hidden rounded-xl transition-shadow",
                  active
                    ? "shadow-[0_0_0_1.5px_var(--color-neutral-950),0_4px_14px_-6px_rgba(0,0,0,0.25)]"
                    : "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]",
                  FOCUS_RING
                )}
                style={{ backgroundImage: preset.backdrop }}
              >
                <span className="mb-3 h-7 w-7 rounded-full shadow-[0_6px_8px_-5px_rgba(0,0,0,0.45)]" style={{ backgroundImage: preset.sphere }} aria-hidden />
                {/* The tile is a light preview image in both themes, so its label stays dark ink. */}
                <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-[rgb(24_24_27/0.8)]">{preset.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          <Channel
            label="Rotation"
            value={look.lightRotation}
            min={0}
            max={360}
            step={1}
            suffix="°"
            defaultValue={0}
            onChange={(lightRotation) => onLookChange({ lightRotation })}
          />
          <Channel label="Intensity" value={look.lightIntensity} min={0.3} max={2} step={0.05} onChange={(lightIntensity) => onLookChange({ lightIntensity })} />
          <Channel label="Exposure" value={look.brightness} min={0.5} max={2} step={0.05} onChange={(brightness) => onLookChange({ brightness })} />
        </div>
        <Flag label="Ground shadow" checked={look.shadow} onChange={(shadow) => onLookChange({ shadow })} />
        {hideViewToggles ? null : (
          <>
            <Flag label="Grid" checked={look.grid} onChange={(grid) => onLookChange({ grid })} />
            <Flag label="Turntable" checked={look.autoRotate} onChange={(autoRotate) => onLookChange({ autoRotate })} />
          </>
        )}
      </Section>

      <Section title="Backdrop">
        <div role="group" aria-label="Backdrop presets" className="grid grid-cols-8 gap-1">
          <button
            type="button"
            aria-pressed={look.background && autoBackdrop}
            aria-label="Auto, follows the light or dark theme"
            title="Auto: follows the light or dark theme"
            onClick={() => onLookChange({ background: true, backgroundColor: "auto" })}
            className={cn(SWATCH, look.background && autoBackdrop && swatchRing, FOCUS_RING)}
            style={{ backgroundImage: `linear-gradient(135deg, ${THEME_BACKDROP.light} 50%, ${THEME_BACKDROP.dark} 50%)` }}
          />
          <button
            type="button"
            aria-pressed={!look.background}
            aria-label="Transparent"
            title="Transparent"
            onClick={() => onLookChange({ background: false })}
            className={cn(SWATCH, !look.background && swatchRing, FOCUS_RING)}
            style={CHECKERBOARD}
          />
          {BACKDROP_SWATCHES.map((swatch) => {
            const active = look.background && !autoBackdrop && backdropColor.toLowerCase() === swatch.color;
            return (
              <button
                key={swatch.color}
                type="button"
                aria-pressed={active}
                aria-label={swatch.label}
                title={swatch.label}
                onClick={() => onLookChange({ background: true, backgroundColor: swatch.color })}
                className={cn(SWATCH, active && swatchRing, FOCUS_RING)}
                style={{ backgroundColor: swatch.color }}
              />
            );
          })}
        </div>
        <ColorField
          label="Backdrop"
          value={backdropColor}
          onChange={(backgroundColor) => onLookChange({ background: true, backgroundColor })}
          trailing={
            <button
              type="button"
              onClick={() => onLookChange({ background: !look.background })}
              aria-pressed={look.background}
              aria-label={look.background ? "Hide backdrop" : "Show backdrop"}
              title={look.background ? "Hide backdrop" : "Show backdrop"}
              className={cn("flex h-8 items-center gap-1.5 rounded-lg border-l border-neutral-200 pl-2.5 pr-2 text-[12px] text-neutral-600 hover:text-neutral-950", FOCUS_RING)}
            >
              {look.background ? <Eye className="h-3.5 w-3.5" strokeWidth={1.85} /> : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.85} />}
              <span className="w-6 text-left">{look.background ? "On" : "Off"}</span>
            </button>
          }
        />
      </Section>

      <Section title="Camera">
        <Segmented label="Lens" value={look.cameraMode} options={LENS_OPTIONS} onChange={(cameraMode) => onLookChange({ cameraMode })} />
        {look.cameraMode === "perspective" ? (
          <div className="flex flex-col gap-2">
            <Channel
              label="Focal length"
              hint={`${Math.round(look.fov)}° FOV`}
              value={Math.round(focal)}
              min={FOCAL_RANGE.min}
              max={FOCAL_RANGE.max}
              step={1}
              suffix="mm"
              defaultValue={Math.round(focalLengthFromFov(DEFAULT_VIEWER_LOOK.fov))}
              onChange={(mm) => onLookChange({ fov: fovFromFocalLength(mm) })}
            />
            <div role="group" aria-label="Focal length presets" className="grid grid-cols-4 gap-1">
              {FOCAL_STOPS.map((mm) => {
                const active = Math.round(focal) === mm;
                return (
                  <button
                    key={mm}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onLookChange({ fov: fovFromFocalLength(mm) })}
                    className={cn(
                      "h-7 rounded-lg text-[11px] font-medium tabular-nums transition-colors",
                      active ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-600 hover:text-neutral-950",
                      FOCUS_RING
                    )}
                  >
                    {mm}mm
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-[11px] leading-4 text-neutral-500">Isometric has no perspective distortion, so parallel edges stay parallel.</p>
        )}
        {onCameraView ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-neutral-600">View</span>
            <div role="group" aria-label="Camera view" className="grid grid-cols-4 gap-1">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  title={option.title}
                  onClick={() => onCameraView(option.value)}
                  className={cn(
                    "h-8 rounded-lg bg-neutral-100 text-[12px] font-medium text-neutral-700 transition-colors hover:bg-neutral-200/70 hover:text-neutral-950 active:scale-[0.98]",
                    FOCUS_RING
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {onCapture ? (
          <button
            type="button"
            onClick={onCapture}
            title={isCloud ? "Save a PNG of this view at 2×. Transparent when the backdrop is off." : "Save a PNG of this view. Transparent when the backdrop is off."}
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-xl bg-neutral-950 text-[12px] font-semibold text-white transition-colors hover:bg-neutral-800 active:scale-[0.99]",
              FOCUS_RING
            )}
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Capture view
          </button>
        ) : null}
      </Section>

      {stats && stats.faces > 0 ? (
        <Section title="Mesh" collapsible>
          <Mesh stats={stats} unit={isCloud ? "m" : ""} />
        </Section>
      ) : null}

    </div>
  );
}
