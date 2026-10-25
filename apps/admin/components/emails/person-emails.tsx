"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchPersonEmails, type EmailDelivery } from "@/lib/emails-api";

/** The emails one user has received, read live from Customer.io. Shown on the user detail page. */
export function PersonEmails({ userId }: { userId: string }) {
  const { getToken } = useAuth();
  const token = useCallback(async () => (await getToken()) ?? null, [getToken]);
  const [messages, setMessages] = useState<EmailDelivery[]>([]);
  const [found, setFound] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPersonEmails(userId, token)
      .then((res) => {
        if (cancelled) return;
        setFound(res.found);
        setMessages(res.messages);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load emails"));
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Emails</h2>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {found === false ? (
        <p className="text-sm text-muted-foreground">This person isn&apos;t in Customer.io yet.</p>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">When</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {m.sentAt ? new Date(m.sentAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "–"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {m.subject}
                    {m.failure ? <p className="text-xs text-rose-500">{m.failure}</p> : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {found && messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-4 text-center text-sm text-muted-foreground">
                    No emails sent to this person yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
