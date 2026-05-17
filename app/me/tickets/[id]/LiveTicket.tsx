"use client";

import { Bell, Clock, X as XIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { cancelTicketAction, type CancelState } from "../actions";
import { StatusPill } from "@/components/ui/StatusPill";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { useTicketStream } from "@/hooks/useTicketStream";

type Ticket = components["schemas"]["QueueEntryPublic"];
const initial: CancelState = undefined;

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

export function LiveTicket({ initialTicket, token }: { initialTicket: Ticket; token: string | null }) {
  const { ticket, wsState } = useTicketStream(initialTicket, token);

  const cancelAction = cancelTicketAction.bind(
    null,
    ticket.service_item_id,
    ticket.id,
  );
  const [cancelState, cancelDispatch, cancelPending] = useActionState(
    cancelAction,
    initial,
  );

  const status = ticket.status;
  const isServing = status === "serving";
  const isCallable = status === "waiting";

  return (
    <div className="flex flex-col gap-4">
      {isServing ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-600 p-8 text-center text-white shadow-lg">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
            <Bell className="h-7 w-7" />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest opacity-90">
            You&apos;re up
          </p>
          <p className="text-3xl font-bold tracking-tight">
            Head to the counter
          </p>
          <div className="mt-1 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            Ticket #{ticket.ticket_number}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-background p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted">
            Your ticket
          </p>
          <p className="text-6xl font-bold tracking-tight">
            #{ticket.ticket_number}
          </p>
          <StatusPill status={status} />
          <p className="inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" aria-hidden />
            Joined {relativeTime(ticket.joined_at) ?? "—"}
          </p>
        </div>
      )}

      {wsState === "connecting" || wsState === "error" ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {wsState === "connecting" ? "Connecting to live updates..." : "Connection paused — Lost connection. Retrying."}
        </p>
      ) : null}

      {cancelState?.error ? (
        <p className="text-sm text-danger" role="alert">
          {cancelState.error}
        </p>
      ) : null}

      {isCallable ? (
        <form action={cancelDispatch}>
          <button
            type="submit"
            disabled={cancelPending}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-muted hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XIcon className="h-4 w-4" aria-hidden />
            {cancelPending ? "Cancelling…" : "Cancel my ticket"}
          </button>
        </form>
      ) : null}

      <p className="text-center text-[10px] text-muted">
        {wsState === "connected" ? "Live · connected to real-time updates" : "Live stream offline"}
      </p>
    </div>
  );
}
