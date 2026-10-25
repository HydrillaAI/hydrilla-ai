"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ImageIcon,
  Box,
  Sparkles,
  ChevronRight,
  PenLine,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { planDisplayLabel } from "@/lib/pricing";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-backend.vercel.app"
).replace(/\/+$/, "");

/** reset_at is the next reset (period end). Chart from period start, not near the end. */
function billingPeriodStartMs(resetAt: string | null | undefined, nowMs: number): number {
  const fallback = nowMs - 30 * 86400000;
  if (!resetAt) {
    return fallback;
  }
  const resetMs = new Date(resetAt).getTime();
  if (Number.isNaN(resetMs)) {
    return fallback;
  }
  // Period end in the future → approximate start (~monthly). Never use resetAt-1d
  // (that left the window in the future and wiped the chart in production).
  if (resetMs > nowMs) {
    const periodStart = resetMs - 31 * 86400000;
    if (periodStart >= nowMs) {
      return fallback;
    }
    return periodStart;
  }
  return resetMs;
}

type CreditsData = {
  used: number;
  total: number;
  remaining: number;
  bonus?: number;
  plan: string | null;
  resetAt?: string | null;
};

type BreakdownItem = {
  type: string;
  label: string;
  credits: number;
  count: number;
};

type UsageRow = {
  id: string;
  date: string;
  type: string;
  credits: number;
  status: string;
};

type WaterUsageRow = {
  id: string;
  prompt: string | null;
  status: string;
  model: string | null;
  provider: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  createdAt: string;
};

const BREAKDOWN_ICONS: Record<string, typeof Box> = {
  "3d": Box,
  image: ImageIcon,
  edit: PenLine,
};

const CHART_TYPE_ORDER = ["Image generation", "3D model", "Edit image"] as const;
const CHART_COLORS: Record<string, string> = {
  "Image generation": "#3f6fa8",
  "3D model": "#7eb1e3",
  "Edit image": "#b49be6",
};

const TYPE_ICONS: Record<string, typeof Box> = {
  "Image generation": ImageIcon,
  "3D model": Box,
  "Edit image": PenLine,
};

function formatResetDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function formatTableDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function exportToCsv(rows: UsageRow[], rangeLabel: string) {
  const headers = ["Date", "Type", "Credits", "Status"];
  const lines = [headers.join(","), ...rows.map((r) => [formatTableDate(r.date), r.type, r.credits, r.status].join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safe = rangeLabel.replace(/\s*–\s*/g, "-").replace(/,/g, "").replace(/\s+/g, "-") || "export";
  a.download = `hydrilla-usage-${safe}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UsagePage() {
  const { getToken, isSignedIn } = useAuth();
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageRow[]>([]);
  const [waterUsage, setWaterUsage] = useState<WaterUsageRow[]>([]);
  const [waterLoading, setWaterLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [range, setRange] = useState<"1d" | "7d" | "30d">("30d");

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      setHistoryLoading(false);
      setWaterLoading(false);
      return;
    }
    (async () => {
      try {
        setLoadError(null);
        const token = await getToken();
        const headers = (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit;
        const [creditsRes, usageRes, historyRes, waterRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/payments/credits`, { headers }),
          fetch(`${BACKEND_URL}/api/payments/usage`, { headers }),
          fetch(`${BACKEND_URL}/api/payments/usage/history?limit=200`, { headers }),
          fetch(`${BACKEND_URL}/api/water/usage?limit=100`, { headers }),
        ]);
        if (creditsRes.ok) {
          const data = await creditsRes.json();
          setCredits(data.credits ?? null);
        }
        if (usageRes.ok) {
          const data = await usageRes.json();
          setBreakdown(data.breakdown ?? []);
        }
        if (historyRes.ok) {
          const data = await historyRes.json();
          setUsageHistory(data.usage ?? []);
        } else if (historyRes.status === 401 || historyRes.status === 403) {
          setLoadError("Sign in again to load usage history.");
        } else if (!historyRes.ok) {
          setLoadError("Could not load usage history. Try refreshing.");
        }
        if (waterRes.ok) {
          const data = await waterRes.json();
          setWaterUsage((data.jobs ?? []) as WaterUsageRow[]);
        }
      } catch {
        setLoadError("Could not reach the usage API. Try refreshing.");
      } finally {
        setLoading(false);
        setHistoryLoading(false);
        setWaterLoading(false);
      }
    })();
  }, [isSignedIn, getToken]);

  const pct = credits && credits.total > 0 ? Math.round((credits.used / credits.total) * 100) : 0;
  const remaining = credits
    ? typeof credits.remaining === "number"
      ? credits.remaining
      : Math.max(0, credits.total - credits.used)
    : 0;
  const resetStr = formatResetDate(credits?.resetAt);
  const planLabel = planDisplayLabel(credits?.plan);

  const now = Date.now();
  const rangeMs = { "1d": 86400000, "7d": 86400000 * 7, "30d": 86400000 * 30 }[range];
  const cutoff = now - rangeMs;
  const filteredHistory = useMemo(
    () => usageHistory.filter((r) => new Date(r.date).getTime() >= cutoff),
    [usageHistory, range]
  );

  const dateRangeLabel = useMemo(() => {
    const to = new Date();
    const from = new Date(cutoff);
    return `${from.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${to.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }, [cutoff]);

  const chartStart = useMemo(
    () => billingPeriodStartMs(credits?.resetAt, now),
    [credits?.resetAt, now]
  );

  const chartData = useMemo(() => {
    const byDay: Record<string, Record<string, number>> = {};
    const add = (dayKey: string, type: string, credits: number) => {
      if (!byDay[dayKey]) byDay[dayKey] = {};
      byDay[dayKey][type] = (byDay[dayKey][type] ?? 0) + credits;
    };
    usageHistory.forEach((r) => {
      const t = new Date(r.date).getTime();
      if (t < chartStart) return;
      const d = new Date(t);
      d.setHours(0, 0, 0, 0);
      const dayKey = d.toISOString().slice(0, 10);
      add(dayKey, r.type, r.credits);
    });
    const sortedDays = Object.keys(byDay).sort();
    const result: Array<Record<string, string | number>> = [];
    const cum: Record<string, number> = {};
    CHART_TYPE_ORDER.forEach((t) => (cum[t] = 0));
    sortedDays.forEach((dayKey) => {
      CHART_TYPE_ORDER.forEach((t) => {
        cum[t] += byDay[dayKey][t] ?? 0;
      });
      const row: Record<string, string | number> = { date: dayKey };
      CHART_TYPE_ORDER.forEach((t) => (row[t] = cum[t]));
      result.push(row);
    });
    const todayStr = new Date().toISOString().slice(0, 10);
    if (result.length > 0 && result[result.length - 1].date !== todayStr) {
      const last = result[result.length - 1];
      const todayRow: Record<string, string | number> = { date: todayStr };
      CHART_TYPE_ORDER.forEach((t) => (todayRow[t] = last[t]));
      result.push(todayRow);
    }
    return result;
  }, [usageHistory, chartStart]);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <div className="app-content-page font-dm-sans bg-[var(--app-canvas)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 sm:gap-12">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-400">Account</p>
            <h1 className="mt-2 text-neutral-900">Usage</h1>
            <p className="mt-2.5 text-[15px] text-neutral-500">
              {loading ? "Loading your usage…" : `${planLabel} plan · credits and generation history`}
            </p>
            {loadError ? <p className="mt-2 text-sm text-amber-700">{loadError}</p> : null}
          </div>
          <Link
            href="/app/settings?section=billing"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-neutral-200 bg-white px-5 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 sm:self-auto"
          >
            Plan &amp; billing
            <ChevronRight className="h-4 w-4" />
          </Link>
        </header>

        {/* Overview */}
        <section aria-label="Credits overview" className="grid gap-3 sm:grid-cols-3">
          <div className="app-panel p-5 sm:col-span-1 sm:p-6">
            <p className="text-[13px] font-medium text-neutral-500">Used this period</p>
            {loading ? (
              <div className="studio-skeleton mt-3 h-9 w-32 rounded-full" />
            ) : (
              <p className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-neutral-900">
                {credits?.used.toLocaleString() ?? "0"}
                <span className="text-[18px] font-medium text-neutral-400"> / {credits?.total.toLocaleString() ?? "0"}</span>
              </p>
            )}
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className={cn("h-full rounded-full transition-all duration-500 ease-out", pct >= 85 ? "bg-amber-500" : "bg-[var(--hyd-400)]")}
                style={{ width: `${loading ? 0 : Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] tabular-nums text-neutral-500">{loading ? " " : `${pct}% of plan credits`}</p>
          </div>

          <div className="app-panel p-5 sm:p-6">
            <p className="text-[13px] font-medium text-neutral-500">Remaining</p>
            {loading ? (
              <div className="studio-skeleton mt-3 h-9 w-24 rounded-full" />
            ) : (
              <p className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-neutral-900">
                {remaining.toLocaleString()}
              </p>
            )}
            <p className="mt-5 text-[12px] leading-relaxed text-neutral-500">
              {!loading && (credits?.bonus ?? 0) > 0
                ? `Includes ${(credits?.bonus ?? 0).toLocaleString()} bonus credits that carry over`
                : "Credits available to spend now"}
            </p>
          </div>

          <div className="app-panel flex flex-col p-5 sm:p-6">
            <p className="text-[13px] font-medium text-neutral-500">Plan</p>
            <p className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-neutral-900">
              {loading ? "—" : planLabel}
            </p>
            <p className="mt-auto pt-5 text-[12px] text-neutral-500">
              {resetStr ? `Renews ${resetStr}` : "Renewal date appears once your plan is active"}
            </p>
          </div>
        </section>

        {/* Breakdown */}
        {breakdown.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionHeading title="Credits by type" description="What your credits went to this period." />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {breakdown.map((item) => {
                const Icon = BREAKDOWN_ICONS[item.type] || Box;
                return (
                  <div key={item.type} className="app-panel flex items-center gap-3.5 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-neutral-900">{item.label}</p>
                      <p className="mt-0.5 text-[12px] tabular-nums text-neutral-500">
                        {item.count} job{item.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-[18px] font-semibold tabular-nums text-neutral-900">
                      {item.credits.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Chart + history */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title="Activity" description="Credits spent over the current billing period." />
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden text-[13px] tabular-nums text-neutral-500 md:inline">{dateRangeLabel}</span>
              <div className="inline-flex h-9 items-center gap-0.5 rounded-full bg-neutral-100 p-1" role="radiogroup" aria-label="Table range">
                {(["1d", "7d", "30d"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={range === r}
                    onClick={() => setRange(r)}
                    className={cn(
                      "h-7 rounded-full px-3.5 text-[12px] font-semibold transition-colors",
                      range === r ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-neutral-500 hover:text-neutral-900"
                    )}
                  >
                    {r === "1d" ? "24h" : r === "7d" ? "7 days" : "30 days"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => exportToCsv(filteredHistory, dateRangeLabel)}
                disabled={filteredHistory.length === 0}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="app-panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
              <p className="text-[13px] font-medium text-neutral-500">Cumulative credits</p>
              {chartData.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {CHART_TYPE_ORDER.map((type) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[type] }} />
                      <span className="text-[12px] text-neutral-500">{type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-3 pb-4 pt-3 sm:px-4">
              {chartData.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                  <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                    <Sparkles className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
                  </span>
                  <p className="text-sm font-medium text-neutral-700">No usage yet</p>
                  <p className="max-w-xs text-[13px] text-neutral-500">Credits you spend on images and 3D models will appear here.</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        {CHART_TYPE_ORDER.map((type) => (
                          <linearGradient key={type} id={`area-${type.replace(/\s/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS[type]} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={CHART_COLORS[type]} stopOpacity={0.03} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        tick={{ fontSize: 11, fill: "var(--color-neutral-400)" }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                      />
                      <YAxis
                        width={44}
                        tick={{ fontSize: 11, fill: "var(--color-neutral-400)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                      />
                      <Tooltip
                        formatter={(value: unknown, name) => [typeof value === "number" ? value.toLocaleString() : 0, name]}
                        labelFormatter={(label) =>
                          new Date(String(label)).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                        }
                        contentStyle={{
                          borderRadius: 14,
                          border: "1px solid var(--color-neutral-200)",
                          background: "var(--color-white)",
                          color: "var(--color-neutral-900)",
                          boxShadow: "0 8px 30px -8px rgba(0,0,0,0.2)",
                          fontSize: 12,
                        }}
                      />
                      {CHART_TYPE_ORDER.map((type) => (
                        <Area
                          key={type}
                          type="monotone"
                          dataKey={type}
                          stackId="1"
                          stroke={CHART_COLORS[type]}
                          fill={`url(#area-${type.replace(/\s/g, "-")})`}
                          strokeWidth={1.75}
                        />
                      ))}
                      <ReferenceLine x={todayKey} stroke="var(--color-neutral-300)" strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="app-panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
              <p className="text-[14px] font-semibold text-neutral-900">History</p>
              <p className="text-[12px] tabular-nums text-neutral-500">
                {historyLoading ? "" : `${filteredHistory.length} event${filteredHistory.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            {historyLoading ? (
              <TableMessage spinner title="Loading usage…" />
            ) : filteredHistory.length === 0 ? (
              <TableMessage title="No usage in this period" body="Credits you spend will show up here." />
            ) : (
              <div className="overflow-x-auto px-2 pb-2 sm:px-3 sm:pb-3">
                <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-0 text-[13px]">
                  <colgroup>
                    <col className="w-[34%]" />
                    <col className="w-[30%]" />
                    <col className="w-[18%]" />
                    <col className="w-[18%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th align="right">Credits</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((row) => {
                      const Icon = TYPE_ICONS[row.type] ?? Box;
                      return (
                        <tr key={row.id} className="group">
                          <Td className="whitespace-nowrap tabular-nums text-neutral-500">{formatTableDate(row.date)}</Td>
                          <Td>
                            <span className="inline-flex min-w-0 items-center gap-2 font-medium text-neutral-900">
                              <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={1.9} />
                              <span className="truncate">{row.type}</span>
                            </span>
                          </Td>
                          <Td>
                            <StatusPill status={row.status} />
                          </Td>
                          <Td align="right" className="font-semibold tabular-nums text-neutral-900">
                            {row.credits.toLocaleString()}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Water LLM tokens (BYOK — not Hydrilla credits) */}
        <section id="water-tokens" className="flex scroll-mt-24 flex-col gap-4">
          <SectionHeading
            title="Water tokens"
            description="LLM usage from your Water runs with your own API key. Separate from Hydrilla credits."
          />
          <div className="app-panel overflow-hidden">
            {waterLoading ? (
              <TableMessage spinner title="Loading Water tokens…" />
            ) : waterUsage.length === 0 ? (
              <TableMessage title="No Water runs yet" body="Token counts appear after you generate with Water." />
            ) : (
              <div className="overflow-x-auto p-2 sm:p-3">
                <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-[13px]">
                  <colgroup>
                    <col className="w-[19%]" />
                    <col className="w-[27%]" />
                    <col className="w-[17%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Prompt</Th>
                      <Th>Model</Th>
                      <Th align="right">Input</Th>
                      <Th align="right">Output</Th>
                      <Th align="right">Total</Th>
                      <Th align="right">Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterUsage.map((row) => (
                      <tr key={row.id} className="group">
                        <Td className="whitespace-nowrap tabular-nums text-neutral-500">{formatTableDate(row.createdAt)}</Td>
                        <Td className="truncate font-medium text-neutral-900" title={row.prompt || undefined}>
                          {row.prompt?.trim() || "—"}
                        </Td>
                        <Td className="truncate text-neutral-600" title={row.model || undefined}>
                          {row.model || "—"}
                        </Td>
                        <Td align="right" className="tabular-nums text-neutral-700">
                          {formatTokens(row.inputTokens)}
                        </Td>
                        <Td align="right" className="tabular-nums text-neutral-700">
                          {formatTokens(row.outputTokens)}
                        </Td>
                        <Td align="right" className="font-semibold tabular-nums text-neutral-900">
                          {formatTokens(row.totalTokens)}
                        </Td>
                        <Td align="right">
                          <StatusPill status={row.status} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="min-w-0">
      <h2 className="text-[20px] leading-tight text-neutral-900">{title}</h2>
      {description && <p className="mt-1 text-[14px] text-neutral-500">{description}</p>}
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-neutral-200 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400 first:pl-3 sm:px-4",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className,
  title,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  title?: string;
}) {
  return (
    <td
      title={title}
      className={cn(
        "border-b border-neutral-200/60 px-3 py-3 align-middle transition-colors group-last:border-b-0 group-hover:bg-white sm:px-4",
        "group-hover:first:rounded-l-xl group-hover:last:rounded-r-xl",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      {children}
    </td>
  );
}

function TableMessage({ title, body, spinner = false }: { title: string; body?: string; spinner?: boolean }) {
  return (
    <div className="px-6 pb-14 pt-10 text-center">
      {spinner && <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800" />}
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      {body && <p className="mt-1 text-[13px] text-neutral-500">{body}</p>}
    </div>
  );
}

const STATUS_STYLES: { match: RegExp; className: string }[] = [
  { match: /fail|error|cancel/i, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
  { match: /refund|pending|run|wait|queue/i, className: "bg-amber-500/12 text-amber-700 dark:text-amber-400" },
  { match: /done|complete|success|charged|ok/i, className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
];

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES.find((s) => s.match.test(status))?.className ?? "bg-neutral-200/70 text-neutral-600";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", style)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status.toLowerCase()}
    </span>
  );
}

function formatTokens(n: number | null): string {
  return n && n > 0 ? n.toLocaleString() : "—";
}
