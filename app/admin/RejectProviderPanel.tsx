"use client";

import { useActionState } from "react";

import { rejectProviderAction, type AdminState } from "./actions";
import { Button } from "@/components/ui/Button";

const initial: AdminState = undefined;

export function RejectProviderPanel() {
  const [state, formAction, pending] = useActionState(rejectProviderAction, initial);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <div>
        <h2 className="text-base font-semibold">Reject provider by id</h2>
        <p className="mt-0.5 text-sm text-muted">
          Requires a reason shown to the business owner.
        </p>
      </div>
      <label className="block text-sm font-medium">
        Provider id
        <input
          name="provider_id"
          required
          className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-base"
          placeholder="00000000-0000-0000-0000-000000000000"
        />
      </label>
      <label className="block text-sm font-medium">
        Reason
        <textarea
          name="reason"
          required
          rows={3}
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-base"
          placeholder="Rejection reason…"
        />
      </label>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state && state.ok ? (
        <p
          className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          ✓ {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Rejecting…" : "Reject provider"}
      </Button>
    </form>
  );
}
