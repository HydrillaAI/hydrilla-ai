"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PersonEmails } from "@/components/emails/person-emails";
import {
  fetchAdminUser,
  adjustUserCredits,
  syncAdminUserSubscription,
  type AdminPayment,
  type AdminSubscription,
  type AdminUserRow,
  type CreditLedgerEntry,
  type UserJobUsage,
} from "@/lib/users-api";

function formatWhen(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  if (plan === "starter") {
    return "Starter";
  }
  if (plan === "pro") {
    return "Pro";
  }
  if (plan === "slot" || plan === "hourly") {
    return "Hourly";
  }
  if (plan === "slot_pro" || plan === "hourly_pro") {
    return "Hourly Pro";
  }
  if (plan === "creator") {
    return "Creator";
  }
  if (plan === "studio") {
    return "Studio";
  }
  return plan || "—";
}

function sourceBadge(source: string) {
  if (source === "admin_grant") {
    return <Badge className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20">Admin Grant</Badge>;
  }
  if (source === "admin_remove") {
    return <Badge variant="destructive">Admin Deduct</Badge>;
  }
  if (source === "claim_link") {
    return <Badge variant="outline" className="border-indigo-500/40 text-indigo-400">Claim Link</Badge>;
  }
  if (source === "expired") {
    return <Badge variant="outline" className="border-rose-500/40 text-rose-500">Expired</Badge>;
  }
  return <Badge variant="secondary">{source}</Badge>;
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [user, setUser] = useState<AdminUserRow | null>(null);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [jobs, setJobs] = useState<UserJobUsage[]>([]);
  const [creditLedger, setCreditLedger] = useState<CreditLedgerEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Credit adjustment form state
  const [creditAction, setCreditAction] = useState<"add" | "remove">("add");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [creditReason, setCreditReason] = useState<string>("");
  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);
  const [isSubmittingCredit, setIsSubmittingCredit] = useState<boolean>(false);

  const token = useCallback(async () => (await getToken()) ?? null, [getToken]);
  const userId = decodeURIComponent(params.id);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminUser(userId, token);
      setUser(data.user);
      setSubscriptions(data.subscriptions);
      setPayments(data.payments);
      setJobs(data.jobs || []);
      setCreditLedger(data.creditLedger || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    }
  }, [token, userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAdminUserSubscription(userId, token);
      toast.success(res.message || "Subscription synced with Dodo Payments");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sync subscription");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(creditAmount, 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive number for credits.");
      return;
    }

    setIsSubmittingCredit(true);
    try {
      const res = await adjustUserCredits(
        userId,
        {
          amount: parsedAmount,
          reason: creditReason.trim() || undefined,
          action: creditAction,
          sendEmail: creditAction === "add" ? notifyEmail : false,
        },
        token
      );

      toast.success(
        creditAction === "add"
          ? `Successfully added ${res.amount} credits. Remaining: ${res.remaining}`
          : `Successfully deducted ${res.amount} credits. Remaining: ${res.remaining}`
      );

      setCreditAmount("");
      setCreditReason("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust credits");
    } finally {
      setIsSubmittingCredit(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/users" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to Users
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{user?.name || user?.email || "User"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing with Dodo…" : "Sync from Dodo"}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {user ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plan & Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">{planLabel(user.plan)}</p>
                {user.isTrial ? (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-700 bg-amber-50 text-xs">
                    {user.cancelAtPeriodEnd ? "Trial Ending" : "14d Trial"}
                  </Badge>
                ) : user.paying ? (
                  <Badge className={user.cancelAtPeriodEnd ? "bg-amber-600 hover:bg-amber-700 text-xs" : "text-xs"}>
                    {user.cancelAtPeriodEnd ? "Cancelling" : "Paying"}
                  </Badge>
                ) : user.subscriptionStatus === "cancelled" || user.subscriptionStatus === "expired" ? (
                  <Badge variant="secondary" className="text-xs">Cancelled</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Free</Badge>
                )}
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {user.isTrial ? (
                  <p className="text-amber-700 dark:text-amber-400 font-medium">
                    14-day trial ends {formatWhen(user.trialEndsAt || user.periodEnd)}
                    {user.cancelAtPeriodEnd ? " (will not charge)" : " (first charge starts)"}
                  </p>
                ) : user.paying && !user.cancelAtPeriodEnd ? (
                  <p>
                    Renews on {formatWhen(user.renewsAt || user.periodEnd)}
                    {user.recurringAmount ? ` · ${formatCharge(user.recurringAmount, user.currency)}/mo` : ""}
                  </p>
                ) : user.cancelAtPeriodEnd ? (
                  <p className="text-amber-700 font-medium">
                    Access until {formatWhen(user.accessUntil || user.periodEnd)} · Will not renew
                  </p>
                ) : user.subscriptionStatus === "cancelled" || user.subscriptionStatus === "expired" ? (
                  <p>Subscription ended on {formatWhen(user.periodEnd)}</p>
                ) : (
                  <p>Free plan · 100 monthly credits</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Trial status: {user.hasUsedTrial ? "Trial already consumed" : "Eligible for free trial"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Credits Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {Math.max(0, user.creditsTotal - user.creditsUsed)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.creditsUsed} used / {user.creditsTotal} period total
              </p>
              {user.creditsBonus && user.creditsBonus > 0 ? (
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  +{user.creditsBonus} bonus credits available
                </p>
              ) : null}
              {user.creditsResetAt ? (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Monthly allotment resets {formatWhen(user.creditsResetAt)}
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {user.isTrial ? (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-700 bg-amber-50">
                    Active Trial
                  </Badge>
                ) : user.paying ? (
                  <Badge>Active Paying Subscriber</Badge>
                ) : user.hasPaidBefore ? (
                  <Badge variant="secondary">Past Customer (Inactive)</Badge>
                ) : (
                  <Badge variant="secondary">Free Account</Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Joined {formatWhen(user.createdAt)}</p>
              <p className="text-xs text-muted-foreground">
                {user.paymentCount} charge{user.paymentCount === 1 ? "" : "s"}
                {payments.length > 0
                  ? ` · ${formatCharge(
                      payments.filter((p) => p.status === "succeeded").reduce((acc, p) => acc + (p.amount || 0), 0),
                      user.currency || payments[0]?.currency || "USD"
                    )} spent`
                  : ""}
              </p>
            </CardContent>
          </Card>
          {user.slot ? (
            <Card className="sm:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hourly Window</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{user.slot.label || "No hour yet"}</p>
                <p className="text-xs text-muted-foreground">
                  {user.slot.label
                    ? `${user.slot.open ? "Open now" : "Closed now"} · ${user.slot.timezone?.replaceAll("_", " ")} · ${user.slot.durationHours} hour${user.slot.durationHours === 1 ? "" : "s"}`
                    : "This account has not chosen an hour."}
                  {user.slot.changedOn ? ` · last change ${formatWhen(user.slot.changedOn)}` : ""}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* Credit Control Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Adjust Credits</CardTitle>
          <CardDescription>
            Grant bonus credits or deduct credits manually. All changes are tracked in the credit ledger.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreditSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={creditAction === "add" ? "default" : "outline"}
                size="sm"
                onClick={() => setCreditAction("add")}
              >
                + Add Credits
              </Button>
              <Button
                type="button"
                variant={creditAction === "remove" ? "destructive" : "outline"}
                size="sm"
                onClick={() => setCreditAction("remove")}
              >
                - Deduct Credits
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="creditAmount">Amount</Label>
                <Input
                  id="creditAmount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 50"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="creditReason">Reason (Optional)</Label>
                <Input
                  id="creditReason"
                  placeholder="e.g. Compensation for failed generation, promo grant"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                />
              </div>
            </div>

            {creditAction === "add" ? (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  id="notifyEmail"
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="notifyEmail" className="text-xs text-muted-foreground cursor-pointer font-normal">
                  Notify user by email about these credits via ZeptoMail
                </Label>
              </div>
            ) : null}

            <div className="pt-2">
              <Button type="submit" disabled={isSubmittingCredit} size="sm">
                {isSubmittingCredit
                  ? "Processing..."
                  : creditAction === "add"
                  ? "Grant Credits"
                  : "Deduct Credits"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Credit Ledger History */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Credit Ledger History</h2>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead>Admin / Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditLedger.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatWhen(row.created_at)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold tabular-nums ${
                        row.delta > 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {row.delta > 0 ? `+${row.delta}` : row.delta}
                    </span>
                  </TableCell>
                  <TableCell>{sourceBadge(row.source)}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {row.reason || "—"}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {row.balance_total_after} total ({row.balance_total_after - row.balance_used_after} rem)
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {row.admin_email || row.admin_user_id || "System"}
                  </TableCell>
                </TableRow>
              ))}
              {creditLedger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground text-center py-4">
                    No credit ledger entries found for this user.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Generation Usage */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Recent Generation Usage</h2>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prompt / Engine</TableHead>
                <TableHead>Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatWhen(job.createdAt)}
                  </TableCell>
                  <TableCell className="capitalize text-sm font-medium">{job.generateType || "3D"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === "completed"
                          ? "outline"
                          : job.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                    {job.prompt ? `"${job.prompt}"` : job.engine || "—"}
                  </TableCell>
                  <TableCell className="tabular-nums font-semibold text-sm">
                    {job.creditsUsed}
                  </TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground text-center py-4">
                    No recent job generations found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Subscriptions</h2>
          <span className="text-xs text-muted-foreground">Synced via Dodo Payments</span>
        </div>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Next Renewal / End</TableHead>
                <TableHead>Subscription ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.subscriptionId || sub.createdAt}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{planLabel(sub.plan)}</span>
                      {sub.isTrial ? (
                        <Badge variant="outline" className="text-[10px] py-0 border-amber-500/40 text-amber-700 bg-amber-50">
                          14d Trial
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="capitalize font-medium text-xs">{sub.status}</span>
                      {sub.isTrial && sub.trialEndsAt ? (
                        <span className="text-[11px] text-amber-700">Trial ends {formatWhen(sub.trialEndsAt)}</span>
                      ) : null}
                      {sub.cancelAtPeriodEnd ? (
                        <span className="text-[11px] text-amber-600">Cancels at period end</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums text-xs">
                    {sub.recurringAmount ? formatCharge(sub.recurringAmount, sub.currency || "USD") : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {sub.cancelAtPeriodEnd
                      ? `Access until ${formatWhen(sub.accessUntil || sub.periodEnd)}`
                      : sub.status === "active"
                      ? `Renews ${formatWhen(sub.renewsAt || sub.periodEnd)}`
                      : formatWhen(sub.periodEnd)}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {sub.subscriptionId || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground text-center py-4">
                    No subscriptions found for this account.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Billing history */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Billing history</h2>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatWhen(payment.createdAt)}
                  </TableCell>
                  <TableCell>{planLabel(payment.plan)}</TableCell>
                  <TableCell className="tabular-nums">{formatCharge(payment.amount, payment.currency)}</TableCell>
                  <TableCell>
                    {payment.status}
                    <p className="text-xs text-muted-foreground">{payment.paymentId}</p>
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground text-center py-4">
                    No payments for this email.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      <PersonEmails userId={userId} />
    </div>
  );
}
