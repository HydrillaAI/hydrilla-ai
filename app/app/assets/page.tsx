"use client";

import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import {
  fetchHistory,
  fetchWaterJob,
  deleteJob,
  getProxyGlbUrl,
  getProxiedImageUrl,
  downloadGlbWithAuth,
  type BackendJob,
} from "../../../lib/api";
import {
  ArrowDownUp,
  Box,
  Code2,
  Download,
  ExternalLink,
  ImageIcon,
  Plus,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { formatEngineLabel, isWaterJob } from "../../../lib/engines";
import { DEFAULT_VIEWER_LOOK } from "../../../lib/viewer/look";
import { libraryCardPreview } from "../../../components/workspace/library/cardPreview";
import { needsMeshRender, useMeshThumbnails } from "../../../hooks/useMeshThumbnails";
import { CommunityProvider, useCommunity } from "../../../components/community/CommunityProvider";
import { refreshAutoSharedCover } from "../../../lib/community";
import { isPostableModel } from "../../../components/community/PostComposerDialog";

const ThreeViewer = dynamic(
  () => import("../../../components/ThreeViewer").then((m) => ({ default: m.ThreeViewer })),
  { ssr: false, loading: () => <StageSpinner /> }
);

const WaterViewer = dynamic(
  () => import("../../../components/WaterViewer").then((m) => ({ default: m.WaterViewer })),
  { ssr: false, loading: () => <StageSpinner /> }
);

function StageSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800" />
    </div>
  );
}

type AssetTab = "all" | "mesh" | "code" | "images";
type ImageSubFilter = "all" | "TextToImage" | "EditImage";
type SortOrder = "newest" | "oldest";

const tabs: { id: AssetTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mesh", label: "3D models" },
  { id: "code", label: "Water" },
  { id: "images", label: "Images" },
];

const imageSubTabs: { id: ImageSubFilter; label: string }[] = [
  { id: "all", label: "All images" },
  { id: "TextToImage", label: "Generated" },
  { id: "EditImage", label: "Edited" },
];

const IMAGE_GENERATE_TYPES = new Set(["TextToImage", "EditImage", "Combined"]);

const isWaterAsset = (job: BackendJob): boolean => isWaterJob(job);

const isMeshAsset = (job: BackendJob): boolean =>
  !isWaterAsset(job) && Boolean(job.resultGlbUrl) && job.status !== "FAIL";

const isImageAsset = (job: BackendJob): boolean =>
  !isWaterAsset(job) &&
  !job.resultGlbUrl &&
  IMAGE_GENERATE_TYPES.has(job.generateType) &&
  Boolean(job.previewImageUrl || job.imageUrl) &&
  job.status === "DONE";

function imageSubType(t: string): "TextToImage" | "EditImage" {
  return t === "EditImage" || t === "Combined" ? "EditImage" : "TextToImage";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    const sameYear = d.getFullYear() === new Date().getFullYear();
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
  } catch {
    return "";
  }
}

/** Photos-style section label for a creation date. */
function dateGroup(iso: string, now: Date): string {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return "Earlier this month";
  return d.toLocaleDateString(undefined, {
    month: "long",
    ...(d.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

function getAssetBadge(job: BackendJob): { label: string; icon: typeof Box } {
  if (isWaterAsset(job)) return { label: "Water", icon: Code2 };
  if (isMeshAsset(job)) return { label: "3D model", icon: Box };
  if (imageSubType(job.generateType) === "EditImage") return { label: "Edited", icon: Wand2 };
  return { label: "Image", icon: Sparkles };
}

function assetTitle(job: BackendJob, max = 60): string {
  if (job.prompt) return job.prompt.length > max ? `${job.prompt.slice(0, max).trimEnd()}…` : job.prompt;
  if (isWaterAsset(job)) return "Water scene";
  if (isImageAsset(job)) return "Untitled image";
  return "3D model";
}

/** Proxy remote images through the backend; data URLs (local renders) are used as-is. */
function displayUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("data:") ? url : getProxiedImageUrl(url) || url;
}

type Thumbs = ReturnType<typeof useMeshThumbnails>;

/**
 * The picture for a card: the workspace's front render for meshes, the captured scene for
 * Water, the image itself for images. `pending` while a mesh render is on its way.
 */
function resolveThumb(job: BackendJob, thumbs: Thumbs): { src: string | null; pending: boolean; isRender: boolean } {
  if (isMeshAsset(job)) {
    const rendered = thumbs.thumbs[job.id] ?? libraryCardPreview(job, "3d");
    if (rendered) return { src: displayUrl(rendered), pending: false, isRender: true };
    if (needsMeshRender(job) && !thumbs.failed[job.id]) return { src: null, pending: true, isRender: true };
    // Render failed: the input photo beats an empty tile.
    return { src: displayUrl(job.previewImageUrl || job.imageUrl), pending: false, isRender: false };
  }
  if (isWaterAsset(job)) {
    return { src: displayUrl(libraryCardPreview(job, "3d")), pending: false, isRender: true };
  }
  return { src: displayUrl(job.previewImageUrl || job.imageUrl), pending: false, isRender: false };
}

function AssetCard({
  job,
  thumbs,
  onSelect,
  onDownload,
  onShare,
}: {
  job: BackendJob;
  thumbs: Thumbs;
  onSelect: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { src, pending, isRender } = resolveThumb(job, thumbs);
  const { label, icon: BadgeIcon } = getAssetBadge(job);
  const title = assetTitle(job, 48);
  const running = job.status === "RUN" || job.status === "WAIT";
  const { request } = thumbs;

  // Only render meshes the user can actually see.
  useEffect(() => {
    if (!pending) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          request(job.id);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pending, job.id, request]);

  return (
    <div
      ref={ref}
      className="group relative min-w-0 rounded-[22px] bg-neutral-50 p-1.5 ring-1 ring-transparent transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_22px_44px_-26px_rgba(15,23,42,0.45)] hover:ring-[var(--hyd-200)] focus-within:ring-[var(--hyd-400)]"
    >
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-[17px]",
          isRender ? "bg-[#f4f4f5]" : "bg-neutral-100"
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className={cn("absolute inset-0 flex items-center justify-center text-neutral-400", pending && "studio-skeleton")}>
            <BadgeIcon className="h-7 w-7" strokeWidth={1.4} />
          </div>
        )}

        <span
          className="pointer-events-none absolute left-2 top-2 z-[2] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.12)] backdrop-blur-md"
          title={label}
        >
          <BadgeIcon className="h-3.5 w-3.5" strokeWidth={2.1} />
        </span>

        {running && (
          <span className="pointer-events-none absolute right-2 top-2 z-[2] inline-flex h-7 items-center gap-1.5 rounded-full bg-amber-400/95 px-2.5 text-[11px] font-semibold text-amber-950">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-950" />
            Generating
          </span>
        )}
        {job.status === "FAIL" && (
          <span className="pointer-events-none absolute right-2 top-2 z-[2] inline-flex h-7 items-center rounded-full bg-red-500/95 px-2.5 text-[11px] font-semibold text-white">
            Failed
          </span>
        )}

        {(onDownload || onShare) && !running && (
          <div className="absolute right-2 top-2 z-[3] flex gap-1 rounded-full bg-white/90 p-1 opacity-0 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)] backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:hidden">
            {onShare && (
              <CardAction label="Share to community" onClick={onShare}>
                <Share2 className="h-3.5 w-3.5" />
              </CardAction>
            )}
            {onDownload && (
              <CardAction label="Download" onClick={onDownload}>
                <Download className="h-3.5 w-3.5" />
              </CardAction>
            )}
          </div>
        )}
      </div>

      <div className="px-2 pb-1.5 pt-2.5">
        <p className="truncate text-[13.5px] font-semibold leading-snug text-neutral-900" title={job.prompt ?? undefined}>
          {title}
        </p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-[11.5px] text-neutral-500">
          <span>{label}</span>
          <span aria-hidden className="h-0.5 w-0.5 shrink-0 rounded-full bg-neutral-400" />
          <span className="tabular-nums">{formatShortDate(job.createdAt)}</span>
          {isMeshAsset(job) && job.engine && (
            <>
              <span aria-hidden className="h-0.5 w-0.5 shrink-0 rounded-full bg-neutral-400" />
              <span className="truncate">{formatEngineLabel(job.engine)}</span>
            </>
          )}
        </p>
      </div>

      {/* Whole card opens the asset; action buttons sit above this layer. */}
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Open ${title}`}
        className="absolute inset-0 z-[1] rounded-[22px] outline-none"
      />
    </div>
  );
}

function CardAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white"
    >
      {children}
    </button>
  );
}

/** Two-pane asset view: media on the left, details and actions on the right. */
function AssetModal({ job, onClose, onDelete }: { job: BackendJob; onClose: () => void; onDelete: (id: string) => Promise<void> }) {
  const { getToken } = useAuth();
  const { resolvedTheme } = useTheme();
  const { openComposer } = useCommunity();
  const water = isWaterAsset(job);
  const image = isImageAsset(job);
  const { label, icon: Icon } = getAssetBadge(job);
  const [deleting, setDeleting] = useState(false);
  const [factoryCode, setFactoryCode] = useState<string | null>(
    job.factoryCode && job.factoryCode !== "__present__" ? job.factoryCode : null
  );
  const [waterThumb, setWaterThumb] = useState<string | null>(
    job.previewImageUrl && job.previewImageUrl !== "__present__" ? job.previewImageUrl : null
  );
  const glbUrl = getProxyGlbUrl(job.id);
  const imageUrl = image ? displayUrl(job.previewImageUrl || job.imageUrl) : null;
  const look = useMemo(
    () => ({ ...DEFAULT_VIEWER_LOOK, theme: resolvedTheme === "dark" ? ("dark" as const) : ("light" as const) }),
    [resolvedTheme]
  );
  const sources = job.sourceImages?.length ? job.sourceImages : job.imageUrl && !image ? [job.imageUrl] : [];

  useEffect(() => {
    if (!water || factoryCode) return;
    void (async () => {
      try {
        const cs = await fetchWaterJob(job.id, async () => (await getToken()) ?? null);
        if (cs.factoryCode) setFactoryCode(cs.factoryCode);
      } catch {
        // keep the captured thumbnail
      }
    })();
  }, [water, factoryCode, job.id, getToken]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = previous;
    };
  }, [onClose]);

  const download = () => {
    if (image && imageUrl) {
      const ext = (imageUrl.split("?")[0].split(".").pop() || "png").toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "png";
      void downloadImage(imageUrl, `hydrilla-${job.id.slice(0, 8)}.${safeExt}`);
      return;
    }
    void downloadGlbWithAuth(glbUrl, `hydrilla-${job.id}.glb`, async () => (await getToken()) ?? null).catch((err) =>
      window.alert(err instanceof Error ? err.message : "Failed to download model")
    );
  };

  const remove = async () => {
    if (deleting) return;
    const message = isMeshAsset(job)
      ? "Delete this asset? This cannot be undone. If you shared it to the community, it's removed from those posts too."
      : "Delete this asset? This cannot be undone.";
    if (!window.confirm(message)) return;
    setDeleting(true);
    try {
      await onDelete(job.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const facts: [string, string][] = [
    ["Type", label],
    ["Created", formatDate(job.createdAt)],
    ...(job.engine && !image ? ([["Engine", formatEngineLabel(job.engine)]] as [string, string][]) : []),
  ];

  // Portal to <body> so no transformed/scrolling ancestor can clip or offset the overlay.
  return createPortal(
    <div
      className="app-themed community-root community-overlay-in fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-2 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={assetTitle(job)}
        className="community-pop-in flex h-[min(820px,calc(100dvh-16px))] w-full max-w-[1180px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.55)] ring-1 ring-black/5 lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="relative min-h-[46vh] flex-1 p-2.5 lg:min-h-0">
          <div className={cn("relative h-full w-full overflow-hidden rounded-[22px]", image ? "bg-neutral-50" : "community-stage")}>
            {image ? (
              imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={assetTitle(job)} className="absolute inset-0 h-full w-full object-contain p-4" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-500">No image available</div>
              )
            ) : water ? (
              factoryCode ? (
                <WaterViewer factoryCode={factoryCode} jobId={job.id} className="h-full w-full" onThumbnail={(d) => setWaterThumb(d)} />
              ) : waterThumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayUrl(waterThumb) ?? undefined} alt="" className="h-full w-full object-cover" />
              ) : (
                <StageSpinner />
              )
            ) : (
              <ThreeViewer glbUrl={glbUrl} look={look} statsCorner="bottom-left" />
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm backdrop-blur-md hover:bg-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Details */}
        <aside className="flex w-full shrink-0 flex-col border-t border-neutral-200/70 lg:w-[360px] lg:border-l lg:border-t-0">
          <div className="flex items-start gap-3 px-6 pb-4 pt-5">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
              <h2 className="community-display mt-3 line-clamp-3 break-words text-[21px] leading-snug text-neutral-900">
                {assetTitle(job, 120)}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:flex"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-5 scrollbar-minimal">
            <dl className="divide-y divide-neutral-200/70 rounded-2xl bg-neutral-50 px-4">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="truncate font-medium text-neutral-900">{v}</dd>
                </div>
              ))}
            </dl>

            {job.prompt && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">Prompt</p>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-neutral-700">{job.prompt}</p>
              </div>
            )}

            {sources.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  Source {sources.length > 1 ? "images" : "image"}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {sources.slice(0, 6).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${src}-${i}`}
                      src={displayUrl(src) ?? undefined}
                      alt={`Source ${i + 1}`}
                      className="aspect-square w-full rounded-xl bg-neutral-100 object-cover ring-1 ring-neutral-200/70"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-neutral-200/70 p-4">
            {!water && (
              <button
                type="button"
                onClick={download}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-neutral-900 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-700"
              >
                <Download className="h-4 w-4" />
                {image ? "Download image" : "Download GLB"}
              </button>
            )}
            <div className="flex gap-2">
              {isPostableModel(job) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openComposer([job.id]);
                  }}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-200 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              )}
              {job.workspaceId && (
                <Link
                  href={`/workspace/${job.workspaceId}`}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-200 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Workspace
                </Link>
              )}
              <button
                type="button"
                onClick={() => void remove()}
                disabled={deleting}
                aria-label="Delete asset"
                title="Delete asset"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-red-200 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}

export default function AssetsPage() {
  return (
    <CommunityProvider>
      <AssetsLibrary />
    </CommunityProvider>
  );
}

function AssetsLibrary() {
  const { getToken, isSignedIn } = useAuth();
  const { openComposer } = useCommunity();
  const tokenGetter = useCallback(async () => (await getToken()) ?? null, [getToken]);
  const { me } = useCommunity();
  const thumbs = useMeshThumbnails(tokenGetter);

  // Auto-shared posts start with the input photo as cover. Offer each front render (cached or
  // fresh) once; the backend only applies it to the owner's untouched backfilled posts.
  const offeredCovers = useRef(new Set<string>());
  useEffect(() => {
    if (!me?.autoSharedCount) return;
    for (const [jobId, url] of Object.entries(thumbs.thumbs)) {
      if (!url.startsWith("data:") || offeredCovers.current.has(jobId)) continue;
      offeredCovers.current.add(jobId);
      void refreshAutoSharedCover(tokenGetter, jobId, url);
    }
  }, [thumbs.thumbs, me?.autoSharedCount, tokenGetter]);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AssetTab>("all");
  const [imageFilter, setImageFilter] = useState<ImageSubFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<BackendJob | null>(null);

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("tab");
    if (asked === "images" || asked === "mesh" || asked === "code") setTab(asked);
  }, []);

  const loadAssets = useCallback(async () => {
    if (!isSignedIn) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const all = await fetchHistory(tokenGetter);
      setJobs(
        all.filter((j) => {
          if (isMeshAsset(j)) return true;
          if (isWaterAsset(j)) return j.status === "DONE" || j.status === "RUN" || j.status === "WAIT";
          return isImageAsset(j);
        })
      );
    } catch {
      setJobs([]);
    }
    setLoading(false);
  }, [isSignedIn, tokenGetter]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteJob(id, tokenGetter);
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } catch (err) {
        window.alert((err as Error)?.message || "Failed to delete asset. Please try again.");
      }
    },
    [tokenGetter]
  );

  const quickDownload = useCallback(
    (job: BackendJob) => {
      if (isImageAsset(job)) {
        const url = displayUrl(job.previewImageUrl || job.imageUrl);
        if (url) void downloadImage(url, `hydrilla-${job.id.slice(0, 8)}.png`);
        return;
      }
      void downloadGlbWithAuth(getProxyGlbUrl(job.id), `hydrilla-${job.id}.glb`, tokenGetter).catch((err) =>
        window.alert(err instanceof Error ? err.message : "Failed to download model")
      );
    },
    [tokenGetter]
  );

  const counts = useMemo(
    () => ({
      all: jobs.length,
      mesh: jobs.filter(isMeshAsset).length,
      code: jobs.filter(isWaterAsset).length,
      images: jobs.filter(isImageAsset).length,
    }),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = jobs.filter((j) => {
      if (tab === "mesh" && !isMeshAsset(j)) return false;
      if (tab === "code" && !isWaterAsset(j)) return false;
      if (tab === "images") {
        if (!isImageAsset(j)) return false;
        if (imageFilter !== "all" && imageSubType(j.generateType) !== imageFilter) return false;
      }
      return !q || (j.prompt || "").toLowerCase().includes(q);
    });
    const dir = sort === "newest" ? -1 : 1;
    return list.sort((a, b) => dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  }, [jobs, tab, imageFilter, searchQuery, sort]);

  const groups = useMemo(() => {
    const now = new Date();
    const out: { label: string; jobs: BackendJob[] }[] = [];
    for (const job of filteredJobs) {
      const label = dateGroup(job.createdAt, now);
      const last = out[out.length - 1];
      if (last && last.label === label) last.jobs.push(job);
      else out.push({ label, jobs: [job] });
    }
    return out;
  }, [filteredJobs]);

  const EmptyIcon = tab === "code" ? Code2 : tab === "images" ? ImageIcon : Box;

  return (
    <div className="app-content-page font-dm-sans bg-[var(--app-canvas)]">
      <section className="flex flex-col gap-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-400">Library</p>
            <h1 className="mt-2 text-neutral-900">Assets</h1>
            <p className="mt-2.5 text-[15px] text-neutral-500">
              {loading
                ? "Loading your library…"
                : `${counts.mesh} 3D ${counts.mesh === 1 ? "model" : "models"} · ${counts.code} Water · ${counts.images} ${counts.images === 1 ? "image" : "images"}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative flex h-10 min-w-0 flex-1 items-center sm:w-64 sm:flex-none">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by prompt"
                className="h-full w-full rounded-full border border-neutral-200 bg-white pl-10 pr-9 text-[13px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-neutral-400 hover:text-neutral-700"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
            <Link
              href="/app/studio"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-neutral-900 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New in Studio</span>
            </Link>
          </div>
        </header>

        {/* Filters */}
        <div className="sticky top-0 z-20 -mx-[var(--app-content-px)] -mt-2 flex flex-wrap items-center gap-2 bg-[color-mix(in_srgb,var(--app-canvas)_88%,transparent)] px-[var(--app-content-px)] py-2.5 backdrop-blur-xl">
          <div role="tablist" aria-label="Asset type" className="hide-scrollbar flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-neutral-100 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                  tab === t.id ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                {t.label}
                <span className={cn("text-[11px] tabular-nums", tab === t.id ? "text-neutral-500" : "text-neutral-400")}>
                  {counts[t.id]}
                </span>
              </button>
            ))}
          </div>

          {tab === "images" &&
            imageSubTabs.map((sub) => (
              <button
                key={sub.id}
                type="button"
                className="community-chip h-9"
                data-active={imageFilter === sub.id}
                onClick={() => setImageFilter(sub.id)}
              >
                {sub.label}
              </button>
            ))}

          <button
            type="button"
            onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            aria-label={`Sorted ${sort} first. Switch order`}
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            {sort === "newest" ? "Newest first" : "Oldest first"}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-[22px] bg-neutral-50 p-1.5">
                <div className="studio-skeleton aspect-square rounded-[17px]" />
                <div className="studio-skeleton mx-2 mt-3 h-3.5 w-2/3 rounded-full" />
                <div className="studio-skeleton mx-2 mb-2 mt-1.5 h-3 w-1/3 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="app-panel flex flex-col items-center px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <EmptyIcon className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />
            </span>
            <h2 className="mt-5 text-[20px] text-neutral-900">
              {searchQuery
                ? "No matching assets"
                : tab === "code"
                  ? "No Water scenes yet"
                  : tab === "images"
                    ? "No images yet"
                    : tab === "mesh"
                      ? "No 3D models yet"
                      : "Your library is empty"}
            </h2>
            <p className="mt-1.5 max-w-sm text-[14px] text-neutral-500">
              {searchQuery
                ? "Try a different keyword or filter."
                : "Models, Water scenes and images you create in the Studio collect here."}
            </p>
            {!searchQuery && (
              <Link
                href="/app/studio"
                className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-full bg-neutral-900 px-5 text-[13px] font-semibold text-white hover:bg-neutral-700"
              >
                <Plus className="h-4 w-4" />
                Open Studio
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-9">
            {groups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <div className="mb-3.5 flex items-baseline gap-2">
                  <h2 className="text-[17px] text-neutral-900">{group.label}</h2>
                  <span className="text-[12px] tabular-nums text-neutral-400">{group.jobs.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {group.jobs.map((job) => (
                    <AssetCard
                      key={job.id}
                      job={job}
                      thumbs={thumbs}
                      onSelect={() => setSelectedJob(job)}
                      onDownload={isMeshAsset(job) || isImageAsset(job) ? () => quickDownload(job) : undefined}
                      onShare={isPostableModel(job) ? () => openComposer([job.id]) : undefined}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      {selectedJob && <AssetModal job={selectedJob} onClose={() => setSelectedJob(null)} onDelete={handleDelete} />}
    </div>
  );
}
