"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getProxyGlbUrl, type BackendJob } from "@/lib/api";
import { isWaterJob } from "@/lib/engines";
import { renderLibraryMeshSnapshot } from "@/lib/viewer/renderGlbSnapshot";
import { readMeshThumbs, writeMeshThumb } from "@/lib/viewer/meshThumbs";
import { libraryCardPreview } from "@/components/workspace/library/cardPreview";

const CONCURRENCY = 2;

/** True for a finished GLB whose only server preview is the input photo, so a render is needed. */
export function needsMeshRender(job: BackendJob): boolean {
  return job.status === "DONE" && Boolean(job.resultGlbUrl) && !isWaterJob(job) && !libraryCardPreview(job, "3d");
}

/**
 * Same front-view renders as the workspace library (shared session cache). Cards call
 * `request(id)` when they scroll into view; renders run a couple at a time.
 */
export function useMeshThumbnails(
  getToken: () => Promise<string | null>,
  /** Called once per freshly rendered job (not for cached renders). */
  onRendered?: (jobId: string, dataUrl: string) => void
) {
  const onRenderedRef = useRef(onRendered);
  onRenderedRef.current = onRendered;
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState<Record<string, true>>({});
  const known = useRef<Record<string, string>>({});
  const queue = useRef<string[]>([]);
  const queued = useRef(new Set<string>());
  const failedRef = useRef(new Set<string>());
  const active = useRef(0);
  const mounted = useRef(true);

  // Session cache is browser-only; read it after mount so server and client markup match.
  useEffect(() => {
    known.current = readMeshThumbs();
    setThumbs(known.current);
    return () => {
      mounted.current = false;
    };
  }, []);

  const pump = useCallback(() => {
    while (active.current < CONCURRENCY && queue.current.length > 0) {
      const jobId = queue.current.shift()!;
      active.current += 1;
      void (async () => {
        try {
          const token = await getToken();
          const shot = await renderLibraryMeshSnapshot(getProxyGlbUrl(jobId), 384, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          known.current = { ...known.current, [jobId]: shot.dataUrl };
          writeMeshThumb(jobId, shot.dataUrl);
          if (mounted.current) setThumbs((prev) => ({ ...prev, [jobId]: shot.dataUrl }));
          onRenderedRef.current?.(jobId, shot.dataUrl);
        } catch {
          failedRef.current.add(jobId);
          if (mounted.current) setFailed((prev) => ({ ...prev, [jobId]: true }));
        } finally {
          active.current -= 1;
          queued.current.delete(jobId);
          if (mounted.current) pump();
        }
      })();
    }
  }, [getToken]);

  const request = useCallback(
    (jobId: string) => {
      if (known.current[jobId] || failedRef.current.has(jobId) || queued.current.has(jobId)) return;
      queued.current.add(jobId);
      queue.current.push(jobId);
      pump();
    },
    [pump]
  );

  return { thumbs, failed, request };
}
