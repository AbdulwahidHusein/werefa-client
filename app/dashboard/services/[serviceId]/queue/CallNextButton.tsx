"use client";

import { ChevronsRight } from "lucide-react";
import { useActionState, useEffect } from "react";

import { callNextAction, type QueueActionState } from "./actions";

const initial: QueueActionState = undefined;

export function CallNextButton({
  serviceId,
  waitingCount,
  onActionDone,
}: {
  serviceId: string;
  waitingCount: number;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const action = callNextAction.bind(null, serviceId);
  const [state, dispatch, pending] = useActionState(action, initial);

  useEffect(() => {
    if (!state) return;
    if ("ok" in state && state.ok) onActionDone?.(state.message ?? "Called next ticket.");
    else if ("error" in state && state.error) onActionDone?.(state.error, "err");
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const empty = waitingCount === 0;

  return (
    <form action={dispatch}>
      <button
        type="submit"
        disabled={pending || empty}
        aria-busy={pending}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-base font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-muted"
      >
        <ChevronsRight className="h-5 w-5" aria-hidden />
        {pending
          ? "Calling…"
          : empty
            ? "Line is empty"
            : `Call next · ${waitingCount} waiting`}
      </button>
    </form>
  );
}
