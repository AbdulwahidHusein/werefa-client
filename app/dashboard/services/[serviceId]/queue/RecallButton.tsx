"use client";

import { Undo2, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { recallLastTicketAction, type QueueActionState } from "./actions";

type Ticket = {
  id: string;
  ticket_number: number;
  guest_name?: string | null;
  user_email?: string | null;
  status: string;
  completed_at?: string | null;
};

const initial: QueueActionState = undefined;

export function RecallButton({
  serviceId,
  lastCompletedTicket,
}: {
  serviceId: string;
  lastCompletedTicket: Ticket | undefined;
}) {
  const action = recallLastTicketAction.bind(null, serviceId);
  const [state, dispatch, pending] = useActionState(action, initial);

  const disabled = !lastCompletedTicket || pending;
  const targetName = lastCompletedTicket?.guest_name || lastCompletedTicket?.user_email || `#${lastCompletedTicket?.ticket_number}`;

  return (
    <div className="flex flex-col gap-2">
      <form action={dispatch}>
        <button
          type="submit"
          disabled={disabled}
          aria-busy={pending}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 transition-colors shadow-sm"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          ) : (
            <Undo2 className="h-4 w-4 text-muted" />
          )}
          {pending
            ? "Recalling…"
            : lastCompletedTicket
            ? `Recall ${targetName}`
            : "No tickets to recall"}
        </button>
      </form>

      {state && "ok" in state && state.ok ? (
        <p
          className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 border border-emerald-100"
          role="status"
        >
          ✓ {state.message}
        </p>
      ) : null}

      {state && "error" in state && state.error ? (
        <p className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-950" role="alert">
          ⚠ {state.error}
        </p>
      ) : null}
    </div>
  );
}
