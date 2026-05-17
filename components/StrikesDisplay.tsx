"use client";

import { useState } from "react";
import { ShieldAlert, AlertTriangle, ShieldCheck, Calendar, Info, Mail, Send, Loader2, X } from "lucide-react";
import type { components } from "@/lib/api/schema";

type Strike = {
  id: string;
  ticket_id: string;
  provider_id: string;
  kind: string;
  created_at: string | null;
};

type StrikeSummary = {
  data: Strike[];
  count: number;
  joins_blocked_until: string | null;
  window_days: number;
  limit: number;
};

export function StrikesDisplay({ summary }: { summary: StrikeSummary }) {
  const { data: strikes, count, joins_blocked_until, window_days, limit } = summary;
  const isSuspended = !!joins_blocked_until && new Date(joins_blocked_until) > new Date();

  // Appeal state
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleAppealSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appealReason.trim()) return;

    setSubmitting(true);
    // Simulate API call for appeal
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAppealOpen(false);
        setAppealReason("");
      }, 2000);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Status Display Card */}
      <div className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 ${
        isSuspended
          ? "bg-rose-50/50 border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/30"
          : count > 0
          ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30"
          : "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
            isSuspended
              ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400"
              : count > 0
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
          }`}>
            {isSuspended ? (
              <ShieldAlert className="h-6 w-6" />
            ) : count > 0 ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {isSuspended
                ? "Account Suspended"
                : count > 0
                ? `${count} Active Strike${count > 1 ? "s" : ""} Issued`
                : "Excellent Standing"}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {isSuspended
                ? `Your account has exceeded the strike limit of ${limit} and is temporarily suspended from remote queue joins.`
                : count > 0
                ? `You have received ${count} strike${count > 1 ? "s" : ""}. Accumulating ${limit} strikes within ${window_days} days triggers an automatic temporary suspension.`
                : `Your queue record is completely clean! You have 0 active strikes.`}
            </p>
          </div>
        </div>

        {/* Action / Detail Block */}
        {isSuspended && joins_blocked_until ? (
          <div className="mt-4 border-t border-rose-200/50 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-400">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Suspension active until {new Date(joins_blocked_until).toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={() => setAppealOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Mail className="h-3.5 w-3.5" />
              Appeal Suspension
            </button>
          </div>
        ) : null}
      </div>

      {/* 2. Educational / Helper Card */}
      <div className="rounded-3xl border border-border bg-background p-5 space-y-3 shadow-inner">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Info className="h-4 w-4 text-accent" />
          Strikes Guidelines
        </h4>
        <ul className="text-xs text-muted space-y-2 pl-1.5 list-disc list-inside leading-relaxed">
          <li><strong>No-Shows</strong>: Standard strikes are issued automatically by businesses when a guest is called but fails to appear.</li>
          <li><strong>Expiration</strong>: Active strikes remain in your record for exactly <strong>{window_days} days</strong> from the date of issue.</li>
          <li><strong>Limits</strong>: Reaching <strong>{limit} strikes</strong> triggers a temporary remote joining block. Walk-ins registered manually by staff are never affected.</li>
        </ul>
      </div>

      {/* 3. History List Card */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Strike History</h4>

        {strikes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-background p-8 text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">Clean Record!</p>
            <p className="text-xs text-muted max-w-[280px] mx-auto leading-relaxed">
              No active strikes found in the last {window_days} days. Keep arriving on time to maintain your status!
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {strikes.map((strike) => (
              <li key={strike.id} className="flex items-center gap-3.5 rounded-2xl border border-border bg-background p-4 shadow-sm">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100/60 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground">
                      {strike.kind === "no_show" ? "Queue No-Show" : "Late Cancellation"}
                    </span>
                    <span className="text-[10px] font-semibold text-muted bg-surface px-2 py-0.5 rounded-md border border-border">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Issued: {strike.created_at ? new Date(strike.created_at).toLocaleString() : "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 4. Appeal Dialog Modal */}
      {appealOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => { if (!submitting) setAppealOpen(false); }}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-800">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Submit Suspension Appeal</h3>
                  <p className="text-[10px] text-muted font-medium">Your request will be reviewed by administrators</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppealOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 animate-in zoom-in-95 duration-250">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Appeal Submitted!</h4>
                <p className="text-xs text-muted max-w-[240px]">
                  Administrators will review your appeal and send an update within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAppealSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="appealReason" className="text-xs font-semibold text-foreground">
                    Reason for appeal
                  </label>
                  <textarea
                    id="appealReason"
                    required
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    rows={4}
                    placeholder="Provide context regarding the no-shows (e.g. medical emergencies, connectivity failures)..."
                    className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed placeholder:text-zinc-400"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setAppealOpen(false)}
                    className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !appealReason.trim()}
                    className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-rose-700 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send Appeal
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
