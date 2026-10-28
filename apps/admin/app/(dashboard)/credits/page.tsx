"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Gift, Mail, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchCreditClaimLinks,
  createCreditClaimLink,
  sendCreditClaimLink,
  updateCreditClaimLink,
  type CreditClaimLink,
} from "@/lib/credit-claims-api";

function formatWhen(value: string | null): string {
  if (!value) {
    return "Never";
  }
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CreditClaimsPage() {
  const { getToken } = useAuth();
  const [links, setLinks] = useState<CreditClaimLink[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "disabled">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  // Taken when the list loads so expired badges are computed outside render.
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Form states
  const [amount, setAmount] = useState<string>("50");
  const [reason, setReason] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [creditsExpireAt, setCreditsExpireAt] = useState<string>("");
  const [maxClaims, setMaxClaims] = useState<string>("1");
  const [allowedEmail, setAllowedEmail] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [lastCreatedUrl, setLastCreatedUrl] = useState<string | null>(null);
  const [emailAfterCreate, setEmailAfterCreate] = useState<boolean>(true);

  // "Send by email" dialog: Rishi emails the link through Customer.io.
  const [sendLink, setSendLink] = useState<CreditClaimLink | null>(null);
  const [sendTo, setSendTo] = useState<string>("");
  const [sendName, setSendName] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  const token = useCallback(async () => (await getToken()) ?? null, [getToken]);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCreditClaimLinks(filter, token);
      setLinks(data);
      setNowMs(Date.now());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load claim links");
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLinks();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLinks]);

  const handleCopy = async (url: string, linkToken: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(linkToken);
      toast.success("Claim link copied to clipboard");
      setTimeout(() => {
        setCopiedToken((prev) => (prev === linkToken ? null : prev));
      }, 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);
    const parsedMaxClaims = parseInt(maxClaims, 10);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please provide a positive amount of credits");
      return;
    }

    if (!Number.isFinite(parsedMaxClaims) || parsedMaxClaims <= 0) {
      toast.error("Max claims must be at least 1");
      return;
    }

    if (creditsExpireAt && new Date(creditsExpireAt).getTime() <= Date.now()) {
      toast.error("Credit expiry must be in the future");
      return;
    }

    if (creditsExpireAt && expiresAt && new Date(creditsExpireAt) < new Date(expiresAt)) {
      toast.error("Credits cannot expire before the link stops accepting claims");
      return;
    }

    setIsCreating(true);
    try {
      const res = await createCreditClaimLink(
        {
          amount: parsedAmount,
          reason: reason.trim() || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          creditsExpireAt: creditsExpireAt ? new Date(creditsExpireAt).toISOString() : null,
          maxClaims: parsedMaxClaims,
          allowedEmail: allowedEmail.trim() || null,
        },
        token
      );

      toast.success(`Claim link created for ${parsedAmount} credits!`);
      setLastCreatedUrl(res.claimUrl);
      if (emailAfterCreate && allowedEmail.trim()) {
        try {
          const sent = await sendCreditClaimLink(res.link.id, {}, token);
          toast.success(`Rishi emailed the link to ${sent.sentTo}`);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Link created, but the email was not sent");
        }
      }
      setReason("");
      setAllowedEmail("");
      setExpiresAt("");
      setCreditsExpireAt("");
      setMaxClaims("1");
      await loadLinks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create claim link");
    } finally {
      setIsCreating(false);
    }
  };

  const openSend = (link: CreditClaimLink) => {
    setSendLink(link);
    setSendTo(link.allowed_email || "");
    setSendName("");
  };

  const handleSend = async () => {
    if (!sendLink) return;
    setIsSending(true);
    try {
      const res = await sendCreditClaimLink(sendLink.id, { to: sendTo.trim(), name: sendName.trim() || undefined }, token);
      toast.success(`Rishi emailed the link to ${res.sentTo}`);
      setSendLink(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send claim link");
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleStatus = async (link: CreditClaimLink) => {
    const nextStatus = link.status === "active" ? "disabled" : "active";
    try {
      await updateCreditClaimLink(link.id, { status: nextStatus }, token);
      toast.success(`Link status changed to ${nextStatus}`);
      await loadLinks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update link status");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Credit Claim Links</h1>
        <p className="text-sm text-muted-foreground">
          Generate and distribute shareable links to grant Hydrilla credits to users or communities.
        </p>
      </div>

      {/* Creation form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            Create New Claim Link
          </CardTitle>
          <CardDescription>
            Specify credit allotment, optional recipient restriction, link and credit expiry, and claim limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Credit Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxClaims">Max Claims (Usage Limit)</Label>
                <Input
                  id="maxClaims"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={maxClaims}
                  onChange={(e) => setMaxClaims(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expiresAt">Link Expires (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Last moment the link can be claimed.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="creditsExpireAt">Credits Expire (Optional)</Label>
                <Input
                  id="creditsExpireAt"
                  type="datetime-local"
                  value={creditsExpireAt}
                  onChange={(e) => setCreditsExpireAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Unused claimed credits are removed on this date. Empty means they never expire.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason / Promotion Campaign (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g. Discord Community Giveaway, Beta Tester Bonus"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="allowedEmail">Restrict to Specific Email (Optional)</Label>
                <Input
                  id="allowedEmail"
                  type="email"
                  placeholder="e.g. user@example.com (only this email can claim)"
                  value={allowedEmail}
                  onChange={(e) => setAllowedEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button type="submit" disabled={isCreating} size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {isCreating ? "Generating Link..." : "Generate Claim Link"}
              </Button>
              {allowedEmail.trim() ? (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={emailAfterCreate}
                    onChange={(e) => setEmailAfterCreate(e.target.checked)}
                  />
                  Email it to {allowedEmail.trim()} from Rishi
                </label>
              ) : null}
            </div>
          </form>

          {/* Highlight newly created link */}
          {lastCreatedUrl ? (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm flex items-center justify-between gap-3">
              <div className="truncate">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 mr-2">Link Created:</span>
                <span className="font-mono text-xs">{lastCreatedUrl}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 h-8"
                onClick={() => handleCopy(lastCreatedUrl, "last-created")}
              >
                {copiedToken === "last-created" ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Filter Tabs & Links List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Active & Historic Claim Links</h2>
          <div className="flex gap-1.5">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "active" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={filter === "disabled" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("disabled")}
            >
              Disabled
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Link / Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Claims</TableHead>
                <TableHead>Restricted Email</TableHead>
                <TableHead>Link Expires</TableHead>
                <TableHead>Credits Expire</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const creditsExpired =
                  !!link.credits_expire_at && new Date(link.credits_expire_at).getTime() <= nowMs;
                const isExpired =
                  (!!link.expires_at && new Date(link.expires_at).getTime() <= nowMs) || creditsExpired;
                const isExhausted = link.claims_used >= link.max_claims;

                return (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium">
                            {link.token.slice(0, 10)}...{link.token.slice(-6)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="Copy claim link"
                            onClick={() => handleCopy(link.claimUrl, link.token)}
                          >
                            {copiedToken === link.token ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                          <a
                            href={link.claimUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="Open link in new tab"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        {link.reason ? (
                          <p className="text-xs text-muted-foreground">{link.reason}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-emerald-500 tabular-nums">
                        +{link.amount}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      <span className={isExhausted ? "text-rose-500 font-semibold" : ""}>
                        {link.claims_used}
                      </span>
                      {" / "}
                      {link.max_claims}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {link.allowed_email ? (
                        <span className="font-mono">{link.allowed_email}</span>
                      ) : (
                        <span className="italic">Anyone</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {isExpired ? (
                        <span className="text-rose-500">Expired ({formatWhen(link.expires_at)})</span>
                      ) : (
                        formatWhen(link.expires_at)
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {creditsExpired ? (
                        <span className="text-rose-500">Expired ({formatWhen(link.credits_expire_at)})</span>
                      ) : (
                        formatWhen(link.credits_expire_at)
                      )}
                    </TableCell>
                    <TableCell>
                      {link.status === "disabled" ? (
                        <Badge variant="destructive">Disabled</Badge>
                      ) : isExpired ? (
                        <Badge variant="outline" className="border-rose-500 text-rose-500">Expired</Badge>
                      ) : isExhausted ? (
                        <Badge variant="secondary">Exhausted</Badge>
                      ) : (
                        <Badge className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {link.status === "active" && !isExpired && !isExhausted ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => openSend(link)}
                            title="Rishi emails this link"
                          >
                            <Mail className="h-3 w-3" />
                            Send
                          </Button>
                        ) : null}
                        <Button
                          variant={link.status === "active" ? "ghost" : "outline"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleToggleStatus(link)}
                        >
                          {link.status === "active" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-muted-foreground text-center py-6">
                    No claim links found for this filter.
                  </TableCell>
                </TableRow>
              ) : null}

              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-muted-foreground text-center py-6">
                    Loading claim links...
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!sendLink} onOpenChange={(open) => (!open ? setSendLink(null) : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email this claim link</DialogTitle>
            <DialogDescription>
              Rishi sends {sendLink ? `${sendLink.amount} credits` : "the link"} from rishi@mail.hydrilla.ai. Replies go to
              rishi@hydrilla.ai.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="send-to">Recipient email</Label>
              <Input
                id="send-to"
                type="email"
                value={sendTo}
                disabled={!!sendLink?.allowed_email}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="person@example.com"
              />
              {sendLink?.allowed_email ? (
                <p className="text-xs text-muted-foreground">This link only works for this address.</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="send-name">First name (optional)</Label>
              <Input id="send-name" value={sendName} onChange={(e) => setSendName(e.target.value)} placeholder="Used in “Hi …”" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSendLink(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void handleSend()} disabled={isSending || !sendTo.trim()}>
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              {isSending ? "Sending..." : "Send email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
