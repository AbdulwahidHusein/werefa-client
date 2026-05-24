"use client";

import { Undo2, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";

import { recallLastTicketAction, type QueueActionState } from "./actions";

type Ticket = {
  id: string;
  ticket_number: number;
  guest_name?: string | null;
  status: string;
  completed_at?: string | null;
};

const initial: QueueActionState = undefined;

export function RecallButton({
  serviceId,
  lastCompletedTicket,
  onActionDone,
}: {
  serviceId: string;
  lastCompletedTicket: Ticket | undefined;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const action = recallLastTicketAction.bind(null, serviceId);
  const [state, dispatch, pending] = useActionState(action, initial);

  useEffect(() => {
    if (!state) return;
    if ("ok" in state && state.ok) onActionDone?.(state.message ?? "Ticket recalled.");
    else if ("error" in state && state.error) onActionDone?.(state.error, "err");
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const disabled = !lastCompletedTicket || pending;
  const label = lastCompletedTicket?.guest_name ?? `#${lastCompletedTicket?.ticket_number}`;

  return (
    <form action={dispatch}>
      <button
        type="submit"
        disabled={disabled}
        aria-busy={pending}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted" />
        ) : (
          <Undo2 className="h-4 w-4 text-muted" />
        )}
        {pending
          ? "Recalling…"
          : lastCompletedTicket
          ? `Recall ${label}`
          : "No tickets to recall"}
      </button>
    </form>
  );
}
