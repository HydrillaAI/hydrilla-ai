"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ExternalLink, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  fetchEmailDeliveries,
  fetchEmailsOverview,
  fetchEmailTemplates,
  fetchWeeklyNews,
  fetchWeeklyPreview,
  saveWeeklyNews,
  sendTestEmail,
  type EmailDelivery,
  type EmailsOverview,
  type EmailTemplate,
  type NewsItem,
  type WeeklyPreview,
} from "@/lib/emails-api";

type Tab = "overview" | "templates" | "deliveries" | "weekly";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "templates", label: "Templates" },
  { id: "deliveries", label: "Deliveries" },
  { id: "weekly", label: "Weekly recap" },
];

const CUSTOMERIO_URL = "https://fly.customer.io";

function pct(part: number, whole: number): string {
  if (!whole) return "–";
  return `${((part / whole) * 100).toFixed(part / whole < 0.01 ? 2 : 1)}%`;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "–";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    live: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    delivered: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    opened: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    clicked: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    sent: "border-neutral-500/40 bg-neutral-500/10 text-neutral-600 dark:text-neutral-300",
    draft: "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    drafted: "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ready: "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    missing: "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    failed: "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    bounced: "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    spammed: "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };
  return (
    <Badge variant="outline" className={tone[status] || "border-neutral-500/40 text-muted-foreground"}>
      {status}
    </Badge>
  );
}

function Metric({ label, value, hint, warn }: { label: string; value: string; hint?: string; warn?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-semibold tabular-nums ${warn ? "text-rose-600 dark:text-rose-400" : ""}`}>{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default function EmailsPage() {
  const { getToken } = useAuth();
  const token = useCallback(async () => (await getToken()) ?? null, [getToken]);
  const [tab, setTab] = useState<Tab>("overview");

  const [overview, setOverview] = useState<EmailsOverview | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [deliveries, setDeliveries] = useState<EmailDelivery[]>([]);
  const [deliveriesNext, setDeliveriesNext] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [preview, setPreview] = useState<WeeklyPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [savingNews, setSavingNews] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview") setOverview(await fetchEmailsOverview(token));
      if (tab === "templates") setTemplates((await fetchEmailTemplates(token)).templates);
      if (tab === "deliveries") {
        const res = await fetchEmailDeliveries(null, token);
        setDeliveries(res.deliveries);
        setDeliveriesNext(res.next);
      }
      if (tab === "weekly") {
        const [n, p] = await Promise.all([fetchWeeklyNews(token), fetchWeeklyPreview(token)]);
        setNews(n.items.length ? n.items : [{ title: "", blurb: "", url: "" }]);
        setPreview(p);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [tab, token]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const loadMoreDeliveries = async () => {
    if (!deliveriesNext) return;
    try {
      const res = await fetchEmailDeliveries(deliveriesNext, token);
      setDeliveries((prev) => [...prev, ...res.deliveries]);
      setDeliveriesNext(res.next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load more");
    }
  };

  const handleTest = async (template: EmailTemplate) => {
    setSendingTest(template.id);
    try {
      const res = await sendTestEmail(template.id, token);
      toast.success(`Test of ${template.id} sent to ${res.sentTo}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test send failed");
    } finally {
      setSendingTest(null);
    }
  };

  const handleSaveNews = async () => {
    setSavingNews(true);
    try {
      const res = await saveWeeklyNews(news.filter((n) => n.title.trim()), token);
      setNews(res.items.length ? res.items : [{ title: "", blurb: "", url: "" }]);
      toast.success(res.items.length ? "News saved for the next weekly recap" : "News cleared");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save news");
    } finally {
      setSavingNews(false);
    }
  };

  const totals = overview?.totals;
  const sampleRows = Array.isArray(preview?.sample) ? preview.sample : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Customer.io</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Emails</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Every email Hydrilla sends, from hi@ and Rishi, read live from Customer.io.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={CUSTOMERIO_URL} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Customer.io
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              tab === t.id ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-6">
          {overview && (!overview.connected.app || !overview.connected.track) ? (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
              The backend is missing Customer.io keys ({!overview.connected.track ? "Track API " : ""}
              {!overview.connected.app ? "App API" : ""}). No emails are sent until they are set.
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Metric label="Sent (30 days)" value={totals ? String(totals.sent) : "–"} hint="Transactional mail" />
            <Metric label="Delivered" value={totals ? pct(totals.delivered, totals.sent) : "–"} />
            <Metric label="Clicked" value={totals ? pct(totals.clicked, totals.delivered) : "–"} hint="Opens are unreliable" />
            <Metric
              label="Bounced"
              value={totals ? pct(totals.bounced, totals.sent) : "–"}
              hint="Target under 2%"
              warn={!!totals && totals.sent > 0 && totals.bounced / totals.sent > 0.02}
            />
            <Metric
              label="Spam reports"
              value={totals ? pct(totals.spammed, totals.delivered) : "–"}
              hint="Target under 0.1%"
              warn={!!totals && totals.delivered > 0 && totals.spammed / totals.delivered > 0.001}
            />
            <Metric
              label="Unsubscribed"
              value={totals ? pct(totals.unsubscribed, totals.delivered) : "–"}
              hint="Target under 0.5%"
              warn={!!totals && totals.delivered > 0 && totals.unsubscribed / totals.delivered > 0.005}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transactional emails, last 30 days</CardTitle>
              <CardDescription>Sent by the backend. Campaign numbers are in Customer.io.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Delivered</TableHead>
                    <TableHead className="text-right">Clicked</TableHead>
                    <TableHead className="text-right">Bounced</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(overview?.transactional || []).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.trigger}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.totals.sent}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.totals.delivered}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.totals.clicked}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.totals.bounced}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.totals.failed}</TableCell>
                    </TableRow>
                  ))}
                  {!loading && !overview?.transactional.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                        No transactional emails yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaigns in Customer.io</CardTitle>
              <CardDescription>Onboarding, credits, billing, win-back and the weekly recap run as campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {(overview?.campaigns || []).map((c) => (
                <Badge key={c.id} variant="outline" className="gap-1.5">
                  {c.name}
                  <span className={c.active ? "text-emerald-500" : "text-muted-foreground"}>{c.active ? "live" : c.state}</span>
                </Badge>
              ))}
              {!overview?.campaigns.length ? <p className="text-sm text-muted-foreground">No campaigns yet.</p> : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "templates" ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[190px]">Template</TableHead>
                <TableHead>What it does</TableHead>
                <TableHead className="w-[90px]">From</TableHead>
                <TableHead className="w-[120px]">Kind</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="w-[90px] text-right">Test</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="font-mono text-xs">{t.id}</p>
                    <p className="text-xs text-muted-foreground">{t.name}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p>{t.purpose}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t.trigger}
                      {t.topic ? ` · topic ${t.topic}` : t.internal ? " · internal" : " · always sent"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{t.sender === "rishi" ? "Rishi" : "hi@"}</TableCell>
                  <TableCell className="text-sm capitalize">{t.kind}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {t.kind === "transactional" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        disabled={sendingTest === t.id || t.status !== "live"}
                        onClick={() => void handleTest(t)}
                        title="Send to your own email with sample data"
                      >
                        <Send className="h-3 w-3" />
                        {sendingTest === t.id ? "Sending" : "Send"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">in Customer.io</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {loading && !templates.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Loading templates...
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {tab === "deliveries" ? (
        <div className="space-y-3">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">When</TableHead>
                  <TableHead className="w-[230px]">To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[110px]">Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatWhen(d.sentAt)}</TableCell>
                    <TableCell className="font-mono text-xs">{d.to}</TableCell>
                    <TableCell className="text-sm">
                      {d.subject}
                      {d.failure ? <p className="text-xs text-rose-500">{d.failure}</p> : null}
                    </TableCell>
                    <TableCell className="text-xs capitalize">{d.type.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && !deliveries.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      No emails sent yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          {deliveriesNext ? (
            <Button variant="outline" size="sm" onClick={() => void loadMoreDeliveries()}>
              Load more
            </Button>
          ) : null}
        </div>
      ) : null}

      {tab === "weekly" ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>This week at Hydrilla</CardTitle>
              <CardDescription>
                Up to two items shown in Monday&apos;s recap from Rishi. Leave empty to hide the block.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {news.map((item, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-3">
                  <div className="space-y-1">
                    <Label htmlFor={`news-title-${i}`}>Title</Label>
                    <Input
                      id={`news-title-${i}`}
                      value={item.title}
                      maxLength={80}
                      placeholder="BlueFox now handles hard-surface props better"
                      onChange={(e) => setNews((prev) => prev.map((n, j) => (j === i ? { ...n, title: e.target.value } : n)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`news-blurb-${i}`}>One sentence</Label>
                    <Input
                      id={`news-blurb-${i}`}
                      value={item.blurb}
                      maxLength={200}
                      onChange={(e) => setNews((prev) => prev.map((n, j) => (j === i ? { ...n, blurb: e.target.value } : n)))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`news-url-${i}`}>Link (https)</Label>
                    <Input
                      id={`news-url-${i}`}
                      value={item.url}
                      placeholder="https://hydrilla.ai/changelog"
                      onChange={(e) => setNews((prev) => prev.map((n, j) => (j === i ? { ...n, url: e.target.value } : n)))}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                {news.length < 2 ? (
                  <Button variant="outline" size="sm" onClick={() => setNews((prev) => [...prev, { title: "", blurb: "", url: "" }])}>
                    Add item
                  </Button>
                ) : null}
                <Button size="sm" onClick={() => void handleSaveNews()} disabled={savingNews}>
                  {savingNews ? "Saving" : "Save news"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next recap</CardTitle>
              <CardDescription>
                Mondays at 10:00 in each person&apos;s time zone, only for people who made a model in the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold tabular-nums">{preview ? preview.people : "–"}</p>
              <p className="-mt-3 text-sm text-muted-foreground">people would get a recap if it ran now</p>
              {sampleRows.length ? (
                <div className="space-y-2">
                  {sampleRows.map((r) => (
                    <div key={r.userId} className="rounded-md border p-2 text-xs">
                      <p className="font-mono">{r.userId}</p>
                      <p className="text-muted-foreground">
                        {String(r.data.models_count)} models · {String(r.data.credits_left ?? "–")} credits left · tip: {String(r.data.tip_title)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
