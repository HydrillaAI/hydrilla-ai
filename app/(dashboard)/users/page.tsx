"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAdminUsers, type AdminUserRow, type AdminUsersFilter } from "@/lib/users-api";

function formatWhen(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatCharge(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null) return "—";
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: code }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${code}`;
  }
}

function planLabel(plan: string | null): string {
  if (plan === "starter") return "Starter";
  if (plan === "pro") return "Pro";
  if (plan === "slot" || plan === "hourly") return "Hourly";
  if (plan === "slot_pro" || plan === "hourly_pro") return "Hourly Pro";
  if (plan === "creator") return "Creator";
  if (plan === "studio") return "Studio";
  return plan || "Free";
}

export default function UsersPage() {
  const { getToken } = useAuth();
  const [filter, setFilter] = useState<AdminUsersFilter>("all");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [payingCount, setPayingCount] = useState(0);
  const [trialCount, setTrialCount] = useState(0);
  const [freeCount, setFreeCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const token = useCallback(async () => (await getToken()) ?? null, [getToken]);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminUsers(filter, token);
      setUsers(data.users);
      setTotalCount(data.totalCount ?? data.users.length);
      setPayingCount(data.payingCount);
      setTrialCount(data.trialCount ?? 0);
      setFreeCount(data.freeCount ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    }
  }, [filter, token]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Accounts</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Users</h1>
        </div>
        <Select
          className="w-52"
          value={filter}
          onChange={(event) => setFilter(event.target.value as AdminUsersFilter)}
        >
          <option value="all">All accounts</option>
          <option value="paying">Active Paying</option>
          <option value="trial">14-Day Free Trials</option>
          <option value="cancelled">Cancelling / Ended</option>
          <option value="free">Free Tier</option>
        </Select>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{totalCount || users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Paying</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{payingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">In 14d Trial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">{trialCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Free Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-neutral-500">{freeCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Renewal</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link href={`/users/${encodeURIComponent(user.id)}`} className="font-medium hover:underline">
                    {user.name || user.email || user.id}
                  </Link>
                  <p className="text-xs text-muted-foreground">{user.email || user.id}</p>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{planLabel(user.plan)}</span>
                  {user.slot ? (
                    <p className="text-xs text-muted-foreground">
                      {user.slot.label ? `${user.slot.label} · ${user.slot.open ? "open" : "closed"}` : "No hour yet"}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  {user.isTrial ? (
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant="outline" className="border-amber-500/40 text-amber-700 bg-amber-50">
                        {user.cancelAtPeriodEnd ? "Trial Ending" : "14d Trial"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.cancelAtPeriodEnd
                          ? `Ends ${formatWhen(user.accessUntil || user.trialEndsAt)}`
                          : `Ends ${formatWhen(user.trialEndsAt)}`}
                      </span>
                    </div>
                  ) : user.paying ? (
                    <div className="flex flex-col items-start gap-1">
                      <Badge className={user.cancelAtPeriodEnd ? "bg-amber-600 hover:bg-amber-700" : ""}>
                        {user.cancelAtPeriodEnd ? "Cancelling" : "Paying"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.cancelAtPeriodEnd
                          ? `Access until ${formatWhen(user.accessUntil || user.periodEnd)}`
                          : `Active subscription`}
                      </span>
                    </div>
                  ) : user.subscriptionStatus === "cancelled" || user.subscriptionStatus === "expired" ? (
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant="secondary">Cancelled</Badge>
                      <span className="text-xs text-muted-foreground">Ended {formatWhen(user.periodEnd)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary">Free</Badge>
                      {user.hasUsedTrial ? (
                        <span className="text-[10px] text-muted-foreground border border-neutral-200 rounded px-1 py-0.2">
                          Trial used
                        </span>
                      ) : null}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {user.isTrial ? (
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                        {formatWhen(user.trialEndsAt)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {user.cancelAtPeriodEnd ? "Will not charge" : "First billing starts"}
                      </p>
                    </div>
                  ) : user.paying && !user.cancelAtPeriodEnd ? (
                    <div>
                      <p className="text-xs font-medium">{formatWhen(user.renewsAt || user.periodEnd)}</p>
                      {user.recurringAmount ? (
                        <p className="text-[11px] text-muted-foreground">
                          {formatCharge(user.recurringAmount, user.currency)}/mo
                        </p>
                      ) : null}
                    </div>
                  ) : user.cancelAtPeriodEnd ? (
                    <div>
                      <p className="text-xs text-muted-foreground">{formatWhen(user.accessUntil || user.periodEnd)}</p>
                      <p className="text-[11px] text-amber-600">Will not renew</p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <p>{formatCharge(user.lastPaymentAmount, user.lastPaymentCurrency)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(user.lastPaymentAt)}
                    {user.lastPaymentStatus ? ` · ${user.lastPaymentStatus}` : ""}
                  </p>
                </TableCell>
                <TableCell className="tabular-nums">
                  <span className="font-medium">{user.creditsUsed}</span> / {user.creditsTotal}
                  {user.creditsBonus && user.creditsBonus > 0 ? (
                    <span className="ml-1 text-[11px] text-emerald-600 font-normal">
                      (+{user.creditsBonus})
                    </span>
                  ) : null}
                  {user.creditsResetAt ? (
                    <p className="text-[11px] text-muted-foreground">
                      Resets {formatWhen(user.creditsResetAt)}
                    </p>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-muted-foreground text-center py-6">
                  No users found in this view.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
