"use client";

import { Crown, UserPlus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { type QueueActionState, walkInAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";

const initial: QueueActionState = undefined;

export function WalkInForm({
  serviceId,
  allowVip = false,
  onActionDone,
}: {
  serviceId: string;
  allowVip?: boolean;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const action = walkInAction.bind(null, serviceId);
  const [state, dispatch, pending] = useActionState(action, initial);
  const [open, setOpen] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if ("ok" in state && state.ok) {
      setOpen(false);
      setIsVip(false);
      formRef.current?.reset();
      onActionDone?.(state.message ?? "Walk-in added.");
    } else if ("error" in state && state.error) {
      onActionDone?.(state.error, "err");
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-base font-medium text-foreground hover:bg-surface transition-colors"
      >
        <UserPlus className="h-4 w-4" aria-hidden />
        Add walk-in
      </button>

      <Sheet open={open} onClose={() => { setOpen(false); setIsVip(false); }} title="Add walk-in">
        <form ref={formRef} action={dispatch} className="flex flex-col gap-4 pb-4">
          {/* Hidden VIP value */}
          <input type="hidden" name="is_vip" value={String(isVip)} />

          <Field
            label="Name (optional)"
            name="guest_name"
            maxLength={100}
            placeholder="Customer name"
          />

          {/* VIP toggle — only show if service allows VIP */}
          {allowVip ? (
            <button
              type="button"
              onClick={() => setIsVip((v) => !v)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                isVip
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-border bg-background text-muted hover:bg-surface"
              }`}
            >
              <Crown className={`h-4 w-4 ${isVip ? "text-amber-500" : "text-muted"}`} />
              <span className="flex-1 text-left">
                {isVip ? "VIP — will be served first" : "Mark as VIP"}
              </span>
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  isVip ? "bg-amber-400" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                    isVip ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          ) : null}

          {state && "error" in state && state.error ? (
            <p className="text-sm text-danger" role="alert">{state.error}</p>
          ) : null}

          <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? "Adding…" : isVip ? "Add VIP to queue" : "Add to queue"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
