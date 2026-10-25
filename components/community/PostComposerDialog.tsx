"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Box, Camera, Check, Image as ImageIcon, Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchHistory, getProxiedImageUrl, getProxyGlbUrl, type BackendJob } from "@/lib/api";
import { isWaterJob } from "@/lib/engines";
import { DEFAULT_VIEWER_LOOK } from "@/lib/viewer/look";
import { readMeshThumbs } from "@/lib/viewer/meshThumbs";
import { libraryCardPreview } from "@/components/workspace/library/cardPreview";
import {
  COMMUNITY_TAGS,
  CommunityApiError,
  createCommunityPost,
  LICENSES,
  postPath,
  uploadCommunityImage,
  type NewPostItem,
  type PostLicense,
} from "@/lib/community";
import { track } from "@/lib/analytics";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCommunity } from "./CommunityProvider";
import { AssetPickerDialog } from "./AssetPickerDialog";
import { prepareImage } from "./imageTools";

const ThreeViewer = dynamic(() => import("@/components/ThreeViewer").then((m) => ({ default: m.ThreeViewer })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
    </div>
  ),
});

const MAX_ITEMS = 10;

type Item =
  | { key: string; kind: "model"; job: BackendJob }
  | { key: string; kind: "image"; url: string | null; preview: string; error?: string };

/** Finished GLB meshes only: Water (code-built) scenes and images can't be posted as models. */
export function isPostableModel(job: BackendJob): boolean {
  return job.status === "DONE" && Boolean(job.resultGlbUrl) && !isWaterJob(job);
}

/** Same picture the workspace library and Assets show for a model, falling back to its input photo. */
function itemThumb(item: Item): string | null {
  if (item.kind === "image") return item.preview;
  const render = readMeshThumbs()[item.job.id] ?? libraryCardPreview(item.job, "3d");
  if (render) return render.startsWith("data:") ? render : getProxiedImageUrl(render);
  return getProxiedImageUrl(item.job.previewImageUrl || item.job.imageUrl);
}

function Hints() {
  const cards = [
    { label: "3D model", icon: Box, tilt: "-rotate-6 translate-x-6" },
    { label: "Finished render", icon: Camera, tilt: "z-10 scale-105" },
    { label: "Making of", icon: ImageIcon, tilt: "rotate-6 -translate-x-6" },
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
      <h3 className="community-display text-[24px] text-neutral-900">Share what you made</h3>
      <div className="flex items-end justify-center">
        {cards.map((c) => (
          <div key={c.label} className={cn("flex flex-col items-center gap-3", c.tilt)}>
            <div className="community-surface community-stage flex h-44 w-32 items-center justify-center rounded-[18px] sm:h-52 sm:w-40">
              <c.icon className="h-8 w-8 text-neutral-400" strokeWidth={1.4} />
            </div>
            <span className="text-[12px] font-medium text-neutral-500">{c.label}</span>
          </div>
        ))}
      </div>
      <p className="max-w-xs text-[13px] leading-relaxed text-neutral-500">
        Add models from your assets, plus optional images. The first item becomes the cover.
      </p>
    </div>
  );
}

export function PostComposerDialog({
  open,
  onOpenChange,
  initialJobIds = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialJobIds?: string[];
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { getToken } = useCommunity();

  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const [picker, setPicker] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [license, setLicense] = useState<PostLicense>("cc-by-nc-4.0");
  const [allowDownload, setAllowDownload] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [cover, setCover] = useState<string | null>(null);
  const [capture, setCapture] = useState<{ id: number; filename: string } | null>(null);
  /** Key of the model whose viewer has finished loading (captures only work once it has). */
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captureWaiter = useRef<((dataUrl: string | null) => void) | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHistory(getToken)
      .then((all) => {
        if (cancelled) return;
        const postable = all.filter(isPostableModel);
        setJobs(postable);
        const preset = initialJobIds
          .map((id) => postable.find((j) => j.id === id))
          .filter((j): j is BackendJob => Boolean(j))
          .slice(0, MAX_ITEMS);
        if (preset.length) {
          setItems(preset.map((job) => ({ key: job.id, kind: "model", job })));
          if (preset[0].prompt) setTitle(preset[0].prompt.slice(0, 70));
        }
      })
      .catch(() => setError("Couldn't load your assets"))
      .finally(() => !cancelled && setJobsLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  const activeItem = items[Math.min(active, items.length - 1)];
  const coverItem = items[0];
  const added = useMemo(() => new Set(items.flatMap((i) => (i.kind === "model" ? [i.job.id] : []))), [items]);
  const look = useMemo(
    () => ({ ...DEFAULT_VIEWER_LOOK, theme: resolvedTheme === "dark" ? ("dark" as const) : ("light" as const) }),
    [resolvedTheme]
  );

  // The cover is tied to the first item; reordering or removing it resets the capture.
  const coverKey = coverItem?.key;
  useEffect(() => setCover(null), [coverKey]);

  const addModels = (picked: BackendJob[]) => {
    setItems((prev) => {
      const next = [...prev, ...picked.map((job): Item => ({ key: job.id, kind: "model", job }))].slice(0, MAX_ITEMS);
      return next;
    });
    if (!title && picked[0]?.prompt) setTitle(picked[0].prompt.slice(0, 70));
  };

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_ITEMS - items.length;
    for (const file of [...files].slice(0, room)) {
      const key = `img-${crypto.randomUUID()}`;
      try {
        const dataUrl = await prepareImage(file, 2048, 2048, { fit: "contain" });
        setItems((prev) => [...prev, { key, kind: "image", url: null, preview: dataUrl }]);
        const url = await uploadCommunityImage(getToken, "image", dataUrl);
        setItems((prev) => prev.map((it) => (it.key === key && it.kind === "image" ? { ...it, url } : it)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setItems((prev) => prev.map((it) => (it.key === key && it.kind === "image" ? { ...it, error: message } : it)));
        setError(message);
      }
    }
  };

  const remove = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
    setActive(0);
  };

  const makeCover = (key: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.key === key);
      return item ? [item, ...prev.filter((i) => i.key !== key)] : prev;
    });
    setActive(0);
  };

  const coverViewerReady = coverItem?.kind === "model" && active === 0 && readyKey === coverItem.key;

  /** Ask the live viewer for the current view of the cover model. Resolves null if it isn't on screen. */
  const captureCover = useCallback((): Promise<string | null> => {
    if (!coverViewerReady) return Promise.resolve(null);
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        captureWaiter.current = null;
        resolve(null);
      }, 6000);
      captureWaiter.current = (dataUrl) => {
        clearTimeout(timer);
        captureWaiter.current = null;
        resolve(dataUrl);
      };
      setCapture({ id: Date.now(), filename: "cover.png" });
    });
  }, [coverViewerReady]);

  const onCapture = useCallback((dataUrl: string) => {
    setCover(dataUrl);
    captureWaiter.current?.(dataUrl);
  }, []);

  const uploadsPending = items.some((i) => i.kind === "image" && !i.url && !i.error);
  const canPost = items.length > 0 && title.trim().length > 0 && agreed && !uploadsPending && !posting;

  const submit = async () => {
    if (!canPost) return;
    setPosting(true);
    setError(null);
    try {
      let coverImageUrl: string | null = null;
      if (coverItem.kind === "model") {
        const shot = cover ?? (await captureCover());
        if (shot) coverImageUrl = await uploadCommunityImage(getToken, "cover", await prepareImage(shot, 900, 1200));
      }
      const post = await createCommunityPost(getToken, {
        title: title.trim(),
        description: description.trim(),
        tags,
        license,
        allowDownload,
        showPrompt,
        coverImageUrl,
        items: items.flatMap((i): NewPostItem[] =>
          i.kind === "model"
            ? [{ kind: "model" as const, jobId: i.job.id }]
            : i.url
              ? [{ kind: "image" as const, imageUrl: i.url }]
              : []
        ),
      });
      track("community_post_created", { items: items.length });
      onOpenChange(false);
      router.push(postPath(post.id));
    } catch (err) {
      setError(err instanceof CommunityApiError ? err.message : "Couldn't publish your post");
      setPosting(false);
    }
  };

  const fieldClass =
    "w-full rounded-2xl border border-neutral-200 bg-white px-4 text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400";

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !posting && onOpenChange(next)}>
        <DialogContent className="flex h-[min(820px,calc(100dvh-24px))] max-w-[1200px] flex-col overflow-hidden lg:flex-row" hideClose>
          {/* Preview */}
          <section className="relative hidden min-h-0 flex-1 flex-col border-r border-neutral-200/70 bg-neutral-50 lg:flex">
            {activeItem ? (
              <>
                <p className="pt-5 text-center text-[13px] text-neutral-500">
                  Preview {Math.min(active, items.length - 1) + 1}/{items.length}
                </p>
                <div className="flex min-h-0 flex-1 items-center justify-center p-6">
                  <div className="community-stage relative aspect-[3/4] h-full max-h-full overflow-hidden rounded-[20px] border border-neutral-200/70">
                    {activeItem.kind === "model" ? (
                      <ThreeViewer
                        key={activeItem.job.id}
                        glbUrl={getProxyGlbUrl(activeItem.job.id)}
                        look={look}
                        showStats={false}
                        captureRequest={active === 0 ? capture : null}
                        onCapture={onCapture}
                        onModelStats={() => setReadyKey(activeItem.key)}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={activeItem.preview} alt="" className="absolute inset-0 h-full w-full object-contain" />
                    )}
                  </div>
                </div>
                {active === 0 && coverItem?.kind === "model" && (
                  <div className="flex items-center justify-center gap-3 pb-5">
                    <span className="text-[12px] text-neutral-500">Drag to rotate, scroll to zoom.</span>
                    <button
                      type="button"
                      disabled={!coverViewerReady}
                      onClick={() => void captureCover()}
                      className="inline-flex h-9 disabled:opacity-50 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-800 hover:bg-neutral-100"
                    >
                      {cover ? <Check className="h-4 w-4 text-emerald-500" /> : <Camera className="h-4 w-4" />}
                      {cover ? "Cover angle set" : "Use this angle as cover"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Hints />
            )}
          </section>

          {/* Form */}
          <section className="flex min-h-0 w-full flex-col lg:w-[460px] lg:shrink-0">
            <div className="flex items-center justify-between border-b border-neutral-200/70 px-6 py-4">
              <DialogTitle className="community-display text-[20px]">Post to community</DialogTitle>
              <DialogDescription className="sr-only">Share models from your assets with the Hydrilla community.</DialogDescription>
              <button
                type="button"
                onClick={() => !posting && onOpenChange(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 scrollbar-minimal">
              <div className="flex items-baseline justify-between">
                <h4 className="text-[14px] font-semibold text-neutral-900">
                  Creation <span className="text-rose-500">*</span>
                </h4>
                <span className="text-[12px] tabular-nums text-neutral-400">
                  {items.length}/{MAX_ITEMS}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {items.map((item, i) => {
                  const thumb = itemThumb(item);
                  return (
                    <div key={item.key} className="group relative">
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        className={cn(
                          "community-stage relative block aspect-[3/4] w-full overflow-hidden rounded-[14px] border-2 transition-colors",
                          i === active ? "border-[var(--hyd-400)]" : "border-transparent hover:border-neutral-200"
                        )}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={i === 0 && cover ? cover : thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <Box className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-neutral-400" />
                        )}
                        {item.kind === "image" && !item.url && !item.error && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          </span>
                        )}
                        {i === 0 && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-scrim/60 px-2 py-0.5 text-[10px] font-semibold text-on-scrim">
                            Cover
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.key)}
                        aria-label="Remove"
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-scrim/60 text-on-scrim opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => makeCover(item.key)}
                          className="absolute inset-x-1.5 bottom-1.5 rounded-full bg-scrim/60 py-1 text-[10px] font-semibold text-on-scrim opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                        >
                          Make cover
                        </button>
                      )}
                    </div>
                  );
                })}
                {items.length < MAX_ITEMS && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPicker(true)}
                      className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      <Box className="h-5 w-5" />
                      <span className="text-[12px] font-medium">Models</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => imageInput.current?.click()}
                      className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-[12px] font-medium">Images</span>
                    </button>
                  </>
                )}
              </div>
              <input
                ref={imageInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                hidden
                onChange={(e) => {
                  void addImages(e.target.files);
                  e.target.value = "";
                }}
              />

              <label className="mt-6 flex flex-col gap-1.5">
                <span className="flex items-center justify-between text-[14px] font-semibold text-neutral-900">
                  Title <span className="text-[11px] font-normal tabular-nums text-neutral-400">{title.length}/70</span>
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 70))}
                  placeholder="What's this about?"
                  className={cn(fieldClass, "h-11")}
                />
              </label>

              <label className="mt-5 flex flex-col gap-1.5">
                <span className="flex items-center justify-between text-[14px] font-semibold text-neutral-900">
                  Description
                  <span className="text-[11px] font-normal tabular-nums text-neutral-400">{description.length}/2000</span>
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                  rows={4}
                  placeholder="How you made it, what it's for, or a question for the community."
                  className={cn(fieldClass, "resize-none py-3")}
                />
              </label>

              <div className="mt-5">
                <span className="flex items-center justify-between text-[14px] font-semibold text-neutral-900">
                  Tags <span className="text-[11px] font-normal tabular-nums text-neutral-400">{tags.length}/5</span>
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COMMUNITY_TAGS.map((t) => {
                    const on = tags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className="community-chip h-8 px-3 text-[12px]"
                        data-active={on}
                        disabled={!on && tags.length >= 5}
                        onClick={() => setTags((prev) => (on ? prev.filter((x) => x !== t.id) : [...prev, t.id]))}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <span className="text-[14px] font-semibold text-neutral-900">License</span>
                <div className="mt-2 grid gap-1.5">
                  {LICENSES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLicense(l.id)}
                      aria-pressed={license === l.id}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors",
                        license === l.id
                          ? "border-[var(--hyd-400)] bg-[var(--hyd-50)]"
                          : "border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          license === l.id ? "border-[var(--hyd-400)]" : "border-neutral-300"
                        )}
                      >
                        {license === l.id && <span className="h-2 w-2 rounded-full bg-[var(--hyd-400)]" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-neutral-900">{l.label}</span>
                        <span className="block text-[12px] text-neutral-500">{l.summary}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {[
                  { on: allowDownload, set: setAllowDownload, label: "Allow downloads", hint: "Visitors can download the GLB." },
                  { on: showPrompt, set: setShowPrompt, label: "Show prompt", hint: "Display the prompt you used." },
                ].map((row) => (
                  <label
                    key={row.label}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 px-3.5 py-3 transition-colors hover:bg-neutral-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-neutral-900">{row.label}</span>
                      <span className="block text-[12px] text-neutral-500">{row.hint}</span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.on}
                      onClick={() => row.set(!row.on)}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hyd-400)]",
                        row.on ? "bg-[var(--hyd-400)]" : "bg-neutral-300"
                      )}
                    >
                      {/* Knob is always true white so on/off read the same in light and dark. */}
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-[#fff] shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform",
                          row.on ? "translate-x-[22px]" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-200/70 px-6 py-4">
              {error && <p className="mb-2 text-[13px] text-red-600">{error}</p>}
              <div className="flex items-center gap-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-[12px] leading-snug text-neutral-500">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--hyd-400)]"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="underline hover:text-neutral-800">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/community-guidelines" target="_blank" className="underline hover:text-neutral-800">
                      Community Guidelines
                    </Link>
                  </span>
                </label>
                <button
                  type="button"
                  disabled={!canPost}
                  onClick={() => void submit()}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-35"
                >
                  {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Post
                </button>
              </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>

      <AssetPickerDialog
        open={picker}
        onOpenChange={setPicker}
        jobs={jobs}
        loading={jobsLoading}
        alreadyAdded={added}
        limit={MAX_ITEMS - items.length}
        onAdd={addModels}
      />
    </>
  );
}
