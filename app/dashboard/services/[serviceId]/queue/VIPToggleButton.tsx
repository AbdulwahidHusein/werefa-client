"use client";

import { Crown, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { setTicketPriorityAction } from "./actions";

export function VIPToggleButton({
  serviceId,
  ticketId,
  isVip,
  onActionDone,
}: {
  serviceId: string;
  ticketId: string;
  isVip: boolean;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await setTicketPriorityAction(
        serviceId,
        ticketId,
        isVip ? 0 : 1,
      );
      if (result && "ok" in result && result.ok) {
        onActionDone?.(result.message ?? (isVip ? "VIP removed." : "Upgraded to VIP."));
      } else if (result && "error" in result) {
        onActionDone?.(result.error, "err");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={isVip ? "Remove VIP" : "Upgrade to VIP"}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        isVip
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-zinc-100 text-zinc-500 hover:bg-amber-50 hover:text-amber-600"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Crown className="h-3.5 w-3.5" />
      )}
      {isVip ? "VIP" : "Set VIP"}
    </button>
  );
}
