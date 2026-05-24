"use client";

import { X as XIcon } from "lucide-react";
import { useActionState } from "react";

import {
  cancelTicketAction,
  type CancelState,
} from "@/app/me/tickets/actions";

const initial: CancelState = undefined;

export function LeaveQueueButton({
  serviceId,
  ticketId,
  variant = "card",
}: {
  serviceId: string;
  ticketId: string;
  variant?: "card" | "compact";
}) {
  const action = cancelTicketAction.bind(null, serviceId, ticketId);
  const [state, dispatch, pending] = useActionState(action, initial);

  const btnClass =
    variant === "compact"
      ? "flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 px-3 text-xs font-semibold text-rose-800 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
      : "flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-900 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className={variant === "card" ? "rounded-2xl border border-border bg-background p-4" : ""}>
      {state?.error ? (
        <p className="mb-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <form
        action={dispatch}
        onSubmit={(e) => {
          if (
            !window.confirm(
              "Leave the queue? You will lose your place in line and need to join again.",
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <button type="submit" disabled={pending} className={btnClass}>
          <XIcon className="h-4 w-4" aria-hidden />
          {pending ? "Leaving queue…" : "Leave queue"}
        </button>
        {variant === "card" ? (
          <p className="mt-1.5 text-center text-[10px] text-muted">
            You can rejoin later if the line is still open
          </p>
        ) : null}
      </form>
    </div>
  );
}
