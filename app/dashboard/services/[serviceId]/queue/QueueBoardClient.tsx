"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Clock, Crown, Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import type { ServiceLineStat } from "@/lib/provider-routes";
import { CallNextButton } from "./CallNextButton";
import { RecallButton } from "./RecallButton";
import { ServingActions } from "./ServingActions";
import { WalkInForm } from "./WalkInForm";
import { VIPToggleButton } from "./VIPToggleButton";
import { GenerateInviteButton } from "./GenerateInviteButton";
import { KioskSyncWidget } from "./KioskSyncWidget";
import { StatusPill } from "@/components/ui/StatusPill";
import { PageHeader } from "@/components/ui/PageHeader";
import { useQueueStream } from "@/hooks/useQueueStream";
import type { components } from "@/lib/api/schema";
import { QueueLineChatPanel } from "@/components/QueueLineChatPanel";
import { QueuePauseToggle } from "@/components/QueuePauseToggle";
import { AccessCodeDisplay } from "@/components/AccessCodeDisplay";
import { TicketLivenessStatus, TicketLivenessDetailsPanel } from "@/components/TicketLivenessStatus";

type Ticket = components["schemas"]["QueueEntryPublic"];
type MyService = { id: string; name: string };

// ─── helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function sortByJoined(a: Ticket, b: Ticket) {
  return (a.joined_at ? Date.parse(a.joined_at) : 0) - (b.joined_at ? Date.parse(b.joined_at) : 0);
}

function sortByPriorityThenJoined(a: Ticket & { priority?: number }, b: Ticket & { priority?: number }) {
  const pa = a.priority ?? 0;
  const pb = b.priority ?? 0;
  if (pb !== pa) return pb - pa; // higher priority first
  return (a.joined_at ? Date.parse(a.joined_at) : 0) - (b.joined_at ? Date.parse(b.joined_at) : 0);
}

// ─── sub-components ───────────────────────────────────────────────────────────

function WaitingRow({
  t, serviceId, position, onActionDone,
}: {
  t: Ticket & { priority?: number };
  serviceId: string;
  position: number;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isWalkIn = t.source !== "remote_app";
  const isVip = (t.priority ?? 0) > 0;

  return (
    <li className={`flex flex-col rounded-2xl border bg-background ${
      isVip ? "border-amber-300" : "border-border"
    }`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
        onClick={() => { if (!isWalkIn) setExpanded(!expanded); }}
      >
        {/* Position badge */}
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-bold ${
          isVip
            ? "border-amber-300 bg-amber-50 text-amber-700"
            : "border-border bg-surface text-muted"
        }`}>
          {isVip ? <Crown className="h-4 w-4" /> : position}
        </div>

        {/* Ticket number */}
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${
          isVip ? "bg-amber-100 text-amber-700" : "bg-accent/10 text-accent"
        }`}>
          #{t.ticket_number}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {isVip && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                <Crown className="h-3 w-3" /> VIP
              </span>
            )}
            <StatusPill status={t.status} />
            {isWalkIn && <StatusPill status="closed">Walk-in</StatusPill>}
            {!isWalkIn && (
              <TicketLivenessStatus livenessState={(t as any).liveness_state} />
            )}
          </div>
          {t.guest_name ? (
            <p className="mt-0.5 truncate text-sm font-medium">{t.guest_name}</p>
          ) : null}
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" aria-hidden />
            Joined {relativeTime(t.joined_at) ?? "—"}
          </p>
        </div>

        {/* VIP toggle (stop propagation so it doesn't expand) */}
        <div onClick={(e) => e.stopPropagation()}>
          <VIPToggleButton
            serviceId={serviceId}
            ticketId={t.id}
            isVip={isVip}
            onActionDone={onActionDone}
          />
        </div>
      </div>

      {expanded && !isWalkIn && (
        <div className="border-t border-border">
          <TicketLivenessDetailsPanel serviceId={serviceId} ticketId={t.id} />
        </div>
      )}
    </li>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type Toast = { id: number; message: string; variant: "ok" | "err" };

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl pointer-events-auto ${
            t.variant === "ok"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <span className="mt-px shrink-0">{t.variant === "ok" ? "✓" : "⚠"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Live indicator ───────────────────────────────────────────────────────────

function LiveIndicator({
  wsState,
  isRefreshing,
  onRefresh,
}: {
  wsState: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  if (wsState === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
        <Wifi className="h-3.5 w-3.5" />
        Live
      </span>
    );
  }

  if (wsState === "connecting") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Connecting…
      </span>
    );
  }

  // disconnected / error — show manual refresh
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isRefreshing}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface disabled:opacity-50 cursor-pointer"
      title="Live stream offline — click to refresh manually"
    >
      {isRefreshing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-rose-500" />
      )}
      {isRefreshing ? "Refreshing…" : "Offline · refresh"}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function QueueBoardClient({
  serviceId,
  serviceName,
  initialTickets,
  token,
  providerId,
  businessName,
  allServices,
  initialIsPaused,
  allowVip = false,
  lineChatEnabled = true,
  isOwner = false,
  currentUserId,
  serviceLineStats = [],
}: {
  serviceId: string;
  serviceName: string;
  initialTickets: Ticket[];
  token: string | null;
  providerId: string;
  businessName?: string;
  allServices: MyService[];
  initialIsPaused: boolean;
  allowVip?: boolean;
  lineChatEnabled?: boolean;
  isOwner?: boolean;
  currentUserId?: string;
  serviceLineStats?: ServiceLineStat[];
}) {
  const [isPaused, setIsPaused] = useState(initialIsPaused);

  // ── toasts ──────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const notify = useCallback((message: string, variant: "ok" | "err" = "ok") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  // ── live queue ──────────────────────────────────────────────────────────────
  const { tickets, wsState, isRefreshing, refreshTickets, client } = useQueueStream(
    serviceId,
    initialTickets,
    token,
  );

  // ── derived lists ───────────────────────────────────────────────────────────
  const serving = tickets.filter((t) => t.status === "serving").sort(sortByJoined);
  const waiting = tickets.filter((t) => t.status === "waiting").sort(sortByPriorityThenJoined);
  const completed = tickets
    .filter((t) => t.status === "completed")
    .sort((a, b) => (b.completed_at ? Date.parse(b.completed_at) : 0) - (a.completed_at ? Date.parse(a.completed_at) : 0));
  const recent = tickets
    .filter((t) => ["completed", "no_show", "cancelled"].includes(t.status))
    .sort((a, b) => sortByJoined(b, a))
    .slice(0, 10);

  const otherLinesWithPeople = serviceLineStats.filter(
    (line) =>
      line.id !== serviceId && line.waiting + line.serving > 0,
  );

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <PageHeader
        title={serviceName}
        subtitle={`${waiting.length} waiting · ${serving.length} serving`}
        back="/dashboard/services"
      />

      {serviceLineStats.length > 1 ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {serviceLineStats.map((line) => {
            const active = line.id === serviceId;
            const total = line.waiting + line.serving;
            return (
              <Link
                key={line.id}
                href={`/dashboard/services/${line.id}/queue`}
                className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-background text-muted hover:bg-surface"
                }`}
              >
                {line.name}
                {total > 0 ? (
                  <span className="ml-1.5 rounded-full bg-surface px-1.5 py-0.5 text-[10px]">
                    {total}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}

      {waiting.length === 0 &&
      serving.length === 0 &&
      otherLinesWithPeople.length > 0 ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="mt-1 text-amber-900/90">
            This line is empty. Switch to{" "}
            {otherLinesWithPeople.map((line, i) => (
              <span key={line.id}>
                {i > 0 ? " or " : ""}
                <Link
                  href={`/dashboard/services/${line.id}/queue`}
                  className="font-semibold underline"
                >
                  {line.name}
                </Link>
                ({line.waiting} waiting)
              </span>
            ))}{" "}
            to see customers in queue.
          </p>
        </div>
      ) : null}

      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <LiveIndicator
          wsState={wsState}
          isRefreshing={isRefreshing}
          onRefresh={refreshTickets}
        />
        <QueuePauseToggle
          providerId={providerId}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
      </div>

      {/* ── Action grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Left column: queue controls */}
        <div className="flex flex-col gap-3">
          <CallNextButton
            serviceId={serviceId}
            waitingCount={waiting.length}
            onActionDone={notify}
          />
          <RecallButton
            serviceId={serviceId}
            lastCompletedTicket={completed[0]}
            onActionDone={notify}
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <WalkInForm serviceId={serviceId} allowVip={allowVip} onActionDone={notify} />
            </div>
            <GenerateInviteButton serviceId={serviceId} />
          </div>
        </div>

        {/* Right column: access code */}
        <div>
          <AccessCodeDisplay providerId={providerId} />
        </div>
      </div>

      {/* ── Now serving ────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Now serving
        </h2>
        {serving.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted">
            No one being served right now.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {serving.map((t) => (
              <li
                key={t.id}
                className="overflow-hidden rounded-2xl border border-emerald-200 bg-background"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <span className="text-lg font-bold">#{t.ticket_number}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusPill status={t.status} />
                      {t.source !== "remote_app" && (
                        <StatusPill status="closed">Walk-in</StatusPill>
                      )}
                    </div>
                    {t.guest_name ? (
                      <p className="mt-1 truncate text-sm font-semibold">{t.guest_name}</p>
                    ) : null}
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3" aria-hidden />
                      Joined {relativeTime(t.joined_at) ?? "—"}
                    </p>
                  </div>
                </div>
                <ServingActions
                  serviceId={serviceId}
                  ticketId={t.id}
                  onActionDone={notify}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Waiting list ───────────────────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Waiting ({waiting.length})
        </h2>
        {waiting.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted">
            Line is empty.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {waiting.map((t, i) => (
              <WaitingRow key={t.id} t={t} serviceId={serviceId} position={i + 1} onActionDone={notify} />
            ))}
          </ul>
        )}
      </section>

      {/* ── Recent (collapsed) ─────────────────────────────────────────────── */}
      {recent.length > 0 && (
        <details className="mb-4 rounded-2xl border border-border bg-surface p-4">
          <summary className="cursor-pointer text-sm font-medium select-none">
            Recent ({recent.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-sm font-bold text-muted">
                  #{t.ticket_number}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusPill status={t.status} />
                    {t.source !== "remote_app" && <StatusPill status="closed">Walk-in</StatusPill>}
                  </div>
                  {t.guest_name ? (
                    <p className="mt-0.5 truncate text-xs text-muted">{t.guest_name}</p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-muted">
                    {relativeTime(t.completed_at ?? t.joined_at) ?? "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}

      <QueueLineChatPanel
        serviceItemId={serviceId}
        providerId={providerId}
        businessName={businessName}
        currentUserId={currentUserId}
        wsClient={client}
        isOwner={isOwner}
        initialChatEnabled={lineChatEnabled}
      />

    

      {/* ── Toast stack ─────────────────────────────────────────────────────── */}
      <ToastStack toasts={toasts} />
    </>
  );
}
