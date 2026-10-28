"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchCreditClaimants, type CreditClaimant, type CreditClaimLink } from "@/lib/credit-claims-api";

function formatWhen(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function linkLabel(link: { reason: string | null; token: string | null }): string {
  return link.reason?.trim() || (link.token ? `${link.token.slice(0, 10)}...` : "Claim link");
}

/** State of the claimed credits: never expire, expired, partly spent, or untouched. */
function creditsStatus(claim: CreditClaimant): { label: string; tone: keyof typeof TONE_CLASS } {
  if (claim.expiredAt) {
    return { label: claim.expiredAmount > 0 ? `Expired (${claim.expiredAmount} unused)` : "Expired (all used)", tone: "red" };
  }
  if (claim.remaining === null) {
    return { label: "Never expires", tone: "neutral" };
  }
  if (claim.remaining < claim.amount) {
    return { label: `${claim.remaining} of ${claim.amount} left`, tone: "amber" };
  }
  return { label: "Unused", tone: "green" };
}

const TONE_CLASS = {
  green: "border-emerald-500/40 bg-emerald-600/10 text-emerald-500",
  red: "border-rose-500/40 text-rose-500",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  neutral: "",
} as const;

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportCsv(claims: CreditClaimant[], fileLabel: string) {
  const header = ["Email", "Name", "User ID", "Link", "Credits", "Claimed at", "Credits expire", "Status"];
  const lines = claims.map((claim) =>
    [
      claim.email,
      claim.name,
      claim.userId,
      linkLabel({ reason: claim.linkReason, token: claim.linkToken }),
      claim.amount,
      claim.claimedAt,
      claim.expiresAt,
      creditsStatus(claim).label,
    ]
      .map(csvCell)
      .join(",")
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `claimed-by-${fileLabel.replace(/[^\w-]+/g, "-").toLowerCase() || "all"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * "Claimed by" tab: every account that claimed credits, filterable by link and searchable by
 * email or name, with CSV export to match against a sign-up form sheet.
 */
export function ClaimedByPanel({
  links,
  linkId,
  onLinkChange,
  getToken,
}: {
  links: CreditClaimLink[];
  linkId: string | null;
  onLinkChange: (linkId: string | null) => void;
  getToken: () => Promise<string | null>;
}) {
  const [claims, setClaims] = useState<CreditClaimant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setClaims(await fetchCreditClaimants(linkId, getToken));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load claims");
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [linkId, getToken]);

  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      needle
        ? claims.filter((claim) =>
            [claim.email, claim.name, claim.userId].some((field) => field?.toLowerCase().includes(needle))
          )
        : claims,
    [claims, needle]
  );

  const selectedLink = links.find((link) => link.id === linkId) ?? null;
  const totalCredits = claims.reduce((sum, claim) => sum + claim.amount, 0);
  const people = new Set(claims.map((claim) => claim.userId)).size;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Claims</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{loading ? "—" : claims.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">People</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{loading ? "—" : people}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Credits claimed</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-500">
            {loading ? "—" : `+${totalCredits.toLocaleString()}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Filter by claim link"
          className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm"
          value={linkId ?? ""}
          onChange={(e) => onLinkChange(e.target.value || null)}
        >
          <option value="">All links</option>
          {links.map((link) => (
            <option key={link.id} value={link.id}>
              {linkLabel(link)} · {link.claims_used}/{link.max_claims}
            </option>
          ))}
        </select>
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Check an email or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          disabled={visible.length === 0}
          onClick={() => exportCsv(visible, selectedLink ? linkLabel(selectedLink) : "all")}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {needle && !loading ? (
        <p className="text-sm">
          {visible.length > 0 ? (
            <span className="font-medium text-emerald-600">
              ✓ Claimed — {visible.length} match{visible.length !== 1 ? "es" : ""}
            </span>
          ) : (
            <span className="font-medium text-rose-500">
              ✗ Not claimed — no account matching “{query.trim()}” claimed {selectedLink ? "this link" : "any link"}.
            </span>
          )}
        </p>
      ) : null}

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Claimed</TableHead>
              <TableHead>Credits expire</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  Loading claims...
                </TableCell>
              </TableRow>
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  {needle ? "No matching claims." : "Nobody has claimed yet."}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((claim) => {
                const status = creditsStatus(claim);
                return (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <Link href={`/users/${encodeURIComponent(claim.userId)}`} className="hover:underline">
                        <p className="text-sm font-medium">{claim.email || claim.userId}</p>
                        {claim.name ? <p className="text-xs text-muted-foreground">{claim.name}</p> : null}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {linkLabel({ reason: claim.linkReason, token: claim.linkToken })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatWhen(claim.claimedAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {claim.expiresAt ? formatWhen(claim.expiresAt) : "Never"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={TONE_CLASS[status.tone]}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-emerald-500">
                      +{claim.amount}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
