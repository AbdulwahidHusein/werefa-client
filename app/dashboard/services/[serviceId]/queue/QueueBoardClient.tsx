"use client";

import { useState } from "react";
import { Clock, Loader2, Megaphone } from "lucide-react";
import { CallNextButton } from "./CallNextButton";
import { RecallButton } from "./RecallButton";
import { GenerateInviteButton } from "./GenerateInviteButton";
import { ServingActions } from "./ServingActions";
import { WalkInForm } from "./WalkInForm";
import { StatusPill } from "@/components/ui/StatusPill";
import { PageHeader } from "@/components/ui/PageHeader";
import { useQueueStream } from "@/hooks/useQueueStream";
import type { components } from "@/lib/api/schema";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { BroadcastModal } from "@/components/BroadcastModal";
import { QueuePauseToggle } from "@/components/QueuePauseToggle";
import { AccessCodeDisplay } from "@/components/AccessCodeDisplay";
import { TicketLivenessStatus, TicketLivenessDetailsPanel } from "@/components/TicketLivenessStatus";

type Ticket = components["schemas"]["QueueEntryPublic"];
type MyService = { id: string; name: string };

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

function TicketRow({ t, serviceId }: { t: Ticket; serviceId: string }) {
  const [expanded, setExpanded] = useState(false);
  const isWalkIn = t.source !== "remote_app";

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-background p-4 transition-all">
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => { if (!isWalkIn) setExpanded(!expanded); }}
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <span className="text-lg font-semibold">#{t.ticket_number}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusPill status={t.status} />
            {isWalkIn ? <StatusPill status="closed">Walk-in</StatusPill> : null}
            {!isWalkIn && (
              <TicketLivenessStatus livenessState={(t as any).liveness_state} />
            )}
          </div>
          {t.guest_name ? (
            <p className="mt-1 truncate text-sm font-medium">{t.guest_name}</p>
          ) : null}
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" aria-hidden />
            Joined {relativeTime(t.joined_at) ?? "—"}
          </p>
        </div>
      </div>

      {expanded && !isWalkIn && (
        <TicketLivenessDetailsPanel serviceId={serviceId} ticketId={t.id} />
      )}
    </li>
  );
}

export function QueueBoardClient({
  serviceId,
  serviceName,
  initialTickets,
  token,
  providerId,
  allServices,
  initialIsPaused,
}: {
  serviceId: string;
  serviceName: string;
  initialTickets: Ticket[];
  token: string | null;
  providerId: string;
  allServices: MyService[];
  initialIsPaused: boolean;
}) {
  const [isPaused, setIsPaused] = useState(initialIsPaused);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { broadcasts, refresh: refreshBroadcasts } = useBroadcasts({
    providerId,
    token,
    wsClient: null,
  });

  const { tickets, wsState, isRefreshing, refreshTickets } = useQueueStream(
    serviceId,
    initialTickets,
    token
  );

  const sortByJoined = (a: Ticket, b: Ticket) => {
    const ta = a.joined_at ? Date.parse(a.joined_at) : 0;
    const tb = b.joined_at ? Date.parse(b.joined_at) : 0;
    return ta - tb;
  };

  const serving = tickets
    .filter((t) => t.status === "serving")
    .sort(sortByJoined);
  const waiting = tickets
    .filter((t) => t.status === "waiting")
    .sort(sortByJoined);
  const completed = tickets
    .filter((t) => t.status === "completed")
    .sort((a, b) => {
      const ta = a.updated_at ? Date.parse(a.updated_at) : 0;
      const tb = b.updated_at ? Date.parse(b.updated_at) : 0;
      return tb - ta;
    });
  const recent = tickets
    .filter((t) => ["completed", "no_show", "cancelled"].includes(t.status))
    .sort((a, b) => -sortByJoined(a, b))
    .slice(0, 10);

  return (
    <>
      <PageHeader
        title={serviceName}
        subtitle={`${waiting.length} waiting · ${serving.length} serving`}
        back="/dashboard/services"
        trailing={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
          >
            <Megaphone className="h-3.5 w-3.5" />
            Send Announcement
          </button>
        }
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs">
          {wsState === "connecting" ? (
            <span className="text-amber-600 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Connecting...
            </span>
          ) : wsState === "error" || wsState === "disconnected" ? (
            <span className="text-danger">Live stream offline.</span>
          ) : (
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <QueuePauseToggle
            providerId={providerId}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
          />
          <button
            onClick={refreshTickets}
            disabled={isRefreshing}
            className="text-xs text-muted hover:text-foreground flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            {isRefreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <CallNextButton serviceId={serviceId} waitingCount={waiting.length} />
          <RecallButton serviceId={serviceId} lastCompletedTicket={completed[0]} />
          <div className="flex gap-3">
            <div className="flex-1">
              <WalkInForm serviceId={serviceId} />
            </div>
            <GenerateInviteButton serviceId={serviceId} />
          </div>
        </div>

        <div>
          <AccessCodeDisplay providerId={providerId} />
        </div>
      </div>

      <section className="mt-6">
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
                    <span className="text-lg font-semibold">
                      #{t.ticket_number}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusPill status={t.status} />
                      {t.source !== "remote_app" ? (
                        <StatusPill status="closed">Walk-in</StatusPill>
                      ) : null}
                    </div>
                    {t.guest_name ? (
                      <p className="mt-1 truncate text-sm font-medium">
                        {t.guest_name}
                      </p>
                    ) : null}
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3" aria-hidden />
                      {relativeTime(t.joined_at) ?? "—"}
                    </p>
                  </div>
                </div>
                <ServingActions serviceId={serviceId} ticketId={t.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Waiting ({waiting.length})
        </h2>
        {waiting.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted">
            Line is empty.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {waiting.map((t) => (
              <TicketRow key={t.id} t={t} serviceId={serviceId} />
            ))}
          </ul>
        )}
      </section>

      {recent.length > 0 ? (
        <details className="mt-6 rounded-2xl border border-border bg-surface p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Recent ({recent.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {recent.map((t) => (
              <TicketRow key={t.id} t={t} serviceId={serviceId} />
            ))}
          </ul>
        </details>
      ) : null}

      <details className="mt-6 rounded-2xl border border-border bg-surface p-4" open>
        <summary className="cursor-pointer text-sm font-medium">
          Recent Announcements ({broadcasts.length})
        </summary>
        {broadcasts.length === 0 ? (
          <p className="mt-3 text-xs text-muted">No announcements posted recently.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {broadcasts.map((b) => (
              <li key={b.id} className="rounded-xl border border-border bg-background p-3.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      b.severity === "critical" ? "bg-rose-100 text-rose-800" :
                      b.severity === "warning" ? "bg-amber-100 text-amber-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {b.severity === "critical" ? "Urgent" : b.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-muted">
                      Target: {b.service_item_id ? (allServices.find(s => s.id === b.service_item_id)?.name ?? "Service Line") : "All Services"}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted">{relativeTime(b.created_at)}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground leading-relaxed">{b.body}</p>
              </li>
            ))}
          </ul>
        )}
      </details>

      <BroadcastModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        providerId={providerId}
        services={allServices}
        onSuccess={refreshBroadcasts}
      />
    </>
  );
}
