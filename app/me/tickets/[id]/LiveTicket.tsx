"use client";

import { Bell, Clock } from "lucide-react";

import { LeaveQueueButton } from "@/components/LeaveQueueButton";
import { ReviewForm } from "./ReviewForm";
import { StatusPill } from "@/components/ui/StatusPill";
import { TicketQueueInsights } from "@/components/TicketQueueInsights";
import type { components } from "@/lib/api/schema";
import type { TicketQueueSnapshot } from "@/lib/ticket-snapshot";
import { useTicketStream } from "@/hooks/useTicketStream";
import { useTicketSnapshot } from "@/hooks/useTicketSnapshot";
import { QueueLineChatPanel } from "@/components/QueueLineChatPanel";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { LocationShareStatus } from "@/components/LocationShareStatus";

type Ticket = components["schemas"]["QueueEntryPublic"];

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

export function LiveTicket({
  initialTicket,
  initialSnapshot,
  token,
}: {
  initialTicket: Ticket;
  initialSnapshot: TicketQueueSnapshot | null;
  token: string | null;
}) {
  const { ticket, wsState, client } = useTicketStream(initialTicket, token);
  const { snapshot, loading: snapshotLoading } = useTicketSnapshot({
    serviceItemId: ticket.service_item_id,
    ticketId: ticket.id,
    wsClient: client,
  });
  const displaySnapshot = snapshot ?? initialSnapshot;

  const status = ticket.status;
  const isServing = status === "serving";
  const isPendingApproval = status === "pending_approval";
  const isCallable = status === "waiting" || isPendingApproval;

  const { status: locStatus, lastPingTime, errorMsg, requestPermission } =
    useLocationTracking({
      serviceId: ticket.service_item_id,
      ticketId: ticket.id,
      enabled: ticket.status === "waiting" && !!ticket.user_id,
    });

  const title =
    displaySnapshot?.biz_name ?? "Your visit";
  const lineName = displaySnapshot?.service_name;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <TicketQueueInsights
        snapshot={displaySnapshot}
        status={status}
        loading={snapshotLoading && !displaySnapshot}
      />

      {isCallable ? (
        <LeaveQueueButton
          serviceId={ticket.service_item_id}
          ticketId={ticket.id}
          variant="card"
        />
      ) : isServing ? (
        <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-center text-sm text-muted">
          You&apos;re being served — ask the staff at the counter if you need to
          step out of the line.
        </p>
      ) : null}

      {isServing ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-600 p-8 text-center text-white shadow-lg">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
            <Bell className="h-7 w-7" />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest opacity-90">
            You&apos;re up — {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">Head to the counter</p>
          {lineName ? (
            <p className="text-sm opacity-90">{lineName}</p>
          ) : null}
          <div className="mt-1 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            Ticket #{ticket.ticket_number}
          </div>
        </div>
      ) : isPendingApproval ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-indigo-200 bg-indigo-50 p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-indigo-800">
            Waiting for approval · {title}
          </p>
          <p className="text-4xl font-bold tracking-tight text-indigo-950">
            #{ticket.ticket_number}
          </p>
          <p className="max-w-sm text-sm text-indigo-900/90">
            The business must approve your request before you appear in the queue.
            You can leave below if you changed your mind.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-background p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted">
            Your ticket · {title}
          </p>
          {lineName ? (
            <p className="text-sm font-medium text-muted">{lineName}</p>
          ) : null}
          <p className="text-6xl font-bold tracking-tight">#{ticket.ticket_number}</p>
          <StatusPill status={status} />
          <p className="inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" aria-hidden />
            Joined {relativeTime(ticket.joined_at) ?? "—"}
          </p>
        </div>
      )}

      {ticket.status === "waiting" && !!ticket.user_id ? (
        <LocationShareStatus
          status={locStatus}
          lastPingTime={lastPingTime}
          errorMsg={errorMsg}
          onRequestPermission={requestPermission}
        />
      ) : null}

      {wsState === "connecting" || wsState === "error" ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {wsState === "connecting"
            ? "Connecting to live updates…"
            : "Connection paused — retrying…"}
        </p>
      ) : null}

      {status === "completed" ? <ReviewForm ticketId={ticket.id} /> : null}

      <p className="text-center text-[10px] text-muted">
        {wsState === "connected"
          ? "Live · queue updates on"
          : "Live updates offline — numbers may be stale"}
      </p>

      <QueueLineChatPanel
        serviceItemId={ticket.service_item_id}
        providerId={ticket.provider_id ?? undefined}
        businessName={displaySnapshot?.biz_name}
        currentUserId={ticket.user_id ?? undefined}
        wsClient={client}
      />
    </div>
  );
}
