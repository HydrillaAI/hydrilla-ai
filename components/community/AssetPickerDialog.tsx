"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Check, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProxiedImageUrl, type BackendJob } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { libraryCardPreview } from "@/components/workspace/library/cardPreview";
import { needsMeshRender, useMeshThumbnails } from "@/hooks/useMeshThumbnails";
import { useCommunity } from "./CommunityProvider";

const PAGE_SIZE = 20;

/** "My assets" picker: finished 3D models only, multi-select up to `limit`. */
export function AssetPickerDialog({
  open,
  onOpenChange,
  jobs,
  loading,
  alreadyAdded,
  limit,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: BackendJob[];
  loading: boolean;
  alreadyAdded: Set<string>;
  limit: number;
  onAdd: (jobs: BackendJob[]) => void;
}) {
  const { getToken } = useCommunity();
  const thumbs = useMeshThumbnails(getToken);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => !alreadyAdded.has(j.id) && (!q || (j.prompt ?? "").toLowerCase().includes(q)));
  }, [jobs, alreadyAdded, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const { request } = thumbs;

  // Render the models on this page (same front view the workspace library shows).
  useEffect(() => {
    if (!open) return;
    for (const job of visible) if (needsMeshRender(job)) request(job.id);
  }, [open, visible, request]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= limit ? prev : [...prev, id]
    );

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSelected([]);
      setSearch("");
      setPage(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex h-[min(760px,calc(100dvh-24px))] max-w-5xl flex-col" hideClose>
        <div className="flex flex-col gap-3 border-b border-neutral-200/70 px-5 py-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <DialogTitle className="community-display text-[20px]">My assets</DialogTitle>
            <DialogDescription className="text-[13px] text-neutral-500">
              Finished 3D models you can share. Select up to {limit}.
            </DialogDescription>
          </div>
          <label className="relative flex h-10 w-full items-center sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search models"
              className="h-full w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-minimal">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-neutral-500">
              <Box className="h-6 w-6" />
              <p className="text-[14px]">
                {jobs.length === 0 ? "No finished 3D models yet. Generate one in the Studio first." : "No models match."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visible.map((job) => {
                const on = selected.includes(job.id);
                const rendered = thumbs.thumbs[job.id] ?? libraryCardPreview(job, "3d");
                const pending = !rendered && needsMeshRender(job) && !thumbs.failed[job.id];
                const raw = rendered ?? (pending ? null : job.previewImageUrl || job.imageUrl);
                const thumb = raw?.startsWith("data:") ? raw : getProxiedImageUrl(raw);
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => toggle(job.id)}
                    aria-pressed={on}
                    title={job.prompt ?? "3D model"}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-[18px] border-2 bg-[#f4f4f5] transition-all",
                      pending && "studio-skeleton",
                      on ? "border-[var(--hyd-400)] shadow-[0_0_0_4px_var(--hyd-100)]" : "border-transparent hover:border-neutral-200"
                    )}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <Box className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
                    )}
                    {job.prompt && (
                      <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2.5 pb-2 pt-6 text-left text-[11px] font-medium text-white">
                        {job.prompt}
                      </span>
                    )}
                    <span
                      className={cn(
                        "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                        on ? "border-transparent bg-[var(--hyd-400)] text-white" : "border-white/70 bg-black/20"
                      )}
                    >
                      {on && <Check className="h-4 w-4" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-neutral-200/70 px-5 py-3.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-12 text-center text-[13px] tabular-nums text-neutral-600">
              {current + 1}/{pages}
            </span>
            <button
              type="button"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => close(false)}
            className="h-10 rounded-full px-4 text-[14px] font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => {
              onAdd(selected.map((id) => jobs.find((j) => j.id === id)!).filter(Boolean));
              close(false);
            }}
            className="h-10 rounded-full bg-neutral-900 px-5 text-[14px] font-semibold text-white hover:bg-neutral-700 disabled:opacity-35"
          >
            Add{selected.length ? ` (${selected.length})` : ""}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
