"use client";

import React, { useEffect, useState } from "react";

type Status = "operational" | "degraded" | "capacity" | "unknown";

const LABELS: Record<Status, string> = {
  operational: "All systems normal",
  degraded: "Degraded",
  capacity: "At capacity",
  unknown: "Status unavailable",
};

export function StatusIndicator({ withLabel = false }: { withLabel?: boolean }) {
  const [status, setStatus] = useState<Status>("unknown");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad status"))))
      .then((data: { status?: Status }) => {
        if (!alive) return;
        setStatus(data.status && data.status in LABELS ? data.status : "unknown");
        setReady(true);
      })
      .catch(() => {
        if (!alive) return;
        setStatus("unknown");
        setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const label = ready ? LABELS[status] : "Checking status";

  return (
    <span className="inline-flex items-center gap-2 text-caption uppercase tracking-wider text-ink-3">
      <span className="status-dot" data-status={status} aria-hidden />
      {withLabel && <span className="normal-case tracking-normal text-ink-2">{label}</span>}
      <span className="sr-only">System status: {label}</span>
    </span>
  );
}
