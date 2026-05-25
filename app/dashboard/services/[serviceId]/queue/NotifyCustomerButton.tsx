"use client";

import { Bell, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { notifyWaitingCustomerAction } from "./actions";
import { isQueueActionOk, queueActionError, type QueueActionState } from "./queue-action-utils";

export function NotifyCustomerButton({
  serviceId,
  ticketId,
  ticketNumber,
  canNotify,
  onActionDone,
}: {
  serviceId: string;
  ticketId: string;
  ticketNumber: number;
  canNotify: boolean;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  if (!canNotify) return null;

  function handleClick() {
    startTransition(async () => {
      const res: QueueActionState = await notifyWaitingCustomerAction(
        serviceId,
        ticketId,
      );
      if (isQueueActionOk(res)) {
        setSent(true);
        onActionDone?.(res.message ?? `Notified #${ticketNumber}.`);
        setTimeout(() => setSent(false), 4000);
      } else {
        onActionDone?.(queueActionError(res), "err");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
      aria-busy={pending}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Bell className="h-3.5 w-3.5 text-accent" aria-hidden />
      )}
      {pending ? "Sending…" : sent ? "Sent" : "Notify"}
    </button>
  );
}
