"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";

import { clearQueueAction } from "./actions";

export function ClearQueueButton({
  serviceId,
  activeCount,
  onCleared,
  onActionDone,
}: {
  serviceId: string;
  activeCount: number;
  onCleared?: () => void;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClear() {
    setError("");
    startTransition(async () => {
      const res = await clearQueueAction(serviceId);
      if (res.ok) {
        setOpen(false);
        onCleared?.();
        onActionDone?.(
          res.message ??
            `Queue cleared (${res.clearedCount ?? 0} tickets closed). Joins are paused.`,
        );
      } else {
        setError(res.error || "Could not clear the queue.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-surface cursor-pointer"
      >
        <Trash2 className="h-3 w-3 text-muted" aria-hidden />
        Clear queue
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              if (!isPending) setOpen(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Clear queue for today?</h3>
            </div>

            {error ? (
              <div className="mt-3.5 flex items-start gap-1.5 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-950">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            ) : null}

            <ul className="mt-4 space-y-2 text-xs leading-relaxed text-muted">
              <li>
                Closes{" "}
                <strong className="text-foreground">{activeCount}</strong> active
                ticket{activeCount === 1 ? "" : "s"} (data kept for analytics).
              </li>
              <li>Notifies customers in line that the queue is closed.</li>
              <li>Clears line chat on this board (history is not deleted).</li>
              <li>Pauses remote joins until you resume.</li>
            </ul>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="flex-1 cursor-pointer rounded-xl border border-border bg-background py-2 text-xs font-semibold hover:bg-surface transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleClear}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Clear & pause"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
