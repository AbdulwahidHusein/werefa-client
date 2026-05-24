"use client";

import { Check, UserX } from "lucide-react";
import { useActionState, useEffect } from "react";

import {
  completeTicketAction,
  noShowTicketAction,
  type QueueActionState,
} from "./actions";

const initial: QueueActionState = undefined;

export function ServingActions({
  serviceId,
  ticketId,
  onActionDone,
}: {
  serviceId: string;
  ticketId: string;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const completeAction = completeTicketAction.bind(null, serviceId, ticketId);
  const noShowAction = noShowTicketAction.bind(null, serviceId, ticketId);

  const [completeState, completeDispatch, completePending] = useActionState(completeAction, initial);
  const [noShowState, noShowDispatch, noShowPending] = useActionState(noShowAction, initial);

  useEffect(() => {
    if (!completeState) return;
    if ("ok" in completeState && completeState.ok) onActionDone?.(completeState.message ?? "Ticket completed.");
    else if ("error" in completeState && completeState.error) onActionDone?.(completeState.error, "err");
  }, [completeState]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!noShowState) return;
    if ("ok" in noShowState && noShowState.ok) onActionDone?.(noShowState.message ?? "Marked no-show.");
    else if ("error" in noShowState && noShowState.error) onActionDone?.(noShowState.error, "err");
  }, [noShowState]); // eslint-disable-line react-hooks/exhaustive-deps

  const pending = completePending || noShowPending;

  return (
    <div className="border-t border-border grid grid-cols-2">
      <form action={completeDispatch}>
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-4 w-4" aria-hidden />
          {completePending ? "Completing…" : "Complete"}
        </button>
      </form>
      <form action={noShowDispatch} className="border-l border-border">
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UserX className="h-4 w-4" aria-hidden />
          {noShowPending ? "Saving…" : "No-show"}
        </button>
      </form>
    </div>
  );
}
