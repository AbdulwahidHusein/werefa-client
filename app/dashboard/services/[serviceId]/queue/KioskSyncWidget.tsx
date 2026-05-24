"use client";

import { useActionState, useEffect } from "react";
import { TabletSmartphone, Loader2 } from "lucide-react";

import { syncKioskBatchAction } from "./actions";

export function KioskSyncWidget({
  serviceId,
  onActionDone,
}: {
  serviceId: string;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [state, formAction, isPending] = useActionState(
    syncKioskBatchAction.bind(null, serviceId),
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    if ("ok" in state && state.ok) onActionDone?.(state.message ?? "Kiosk batch synced.");
    else if ("error" in state && state.error) onActionDone?.(state.error, "err");
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
        <TabletSmartphone className="h-5 w-5" />
      </div>
      
    </div>
  );
}
