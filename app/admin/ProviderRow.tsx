"use client";

import { Check, X as XIcon } from "lucide-react";
import { useActionState, useState } from "react";
import Link from "next/link";

import {
  inlineRejectProvider,
  inlineVerifyProvider,
  type AdminState,
} from "./actions";
import { StatusPill } from "@/components/ui/StatusPill";
import type { components } from "@/lib/api/schema";

type Provider = components["schemas"]["ProviderDiscoveryPublic"];

const initial: AdminState = undefined;

export function ProviderRow({ provider }: { provider: Provider }) {
  const verifyAction = inlineVerifyProvider.bind(null, provider.id);
  const rejectAction = inlineRejectProvider.bind(null, provider.id);
  const [vState, vDispatch, vPending] = useActionState(verifyAction, initial);
  const [rState, rDispatch, rPending] = useActionState(rejectAction, initial);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const state = vState ?? rState;
  const showVerify = provider.verification_status !== "verified";
  const showReject = provider.verification_status !== "rejected";

  return (
    <li className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {provider.biz_name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted">
              /{provider.slug}
            </p>
            <p className="mt-1 truncate font-mono text-xs text-muted">
              {provider.id}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <StatusPill status={provider.verification_status} />
            <Link
              href={`/admin/providers/${provider.id}`}
              className="text-sm font-medium text-foreground hover:underline"
            >
              Review documents
            </Link>
          </div>
        </div>

        {state && "ok" in state && state.ok ? (
          <p
            className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-foreground"
            role="status"
          >
            {state.message}
          </p>
        ) : null}
        {state && "error" in state && state.error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>

      {showRejectForm ? (
        <form action={rDispatch} className="border-t border-border p-4">
          <label className="block text-sm font-medium">Rejection reason</label>
          <textarea
            name="reason"
            required
            minLength={1}
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-base"
            placeholder="Explain what is missing or invalid…"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={rPending}
              className="h-10 flex-1 rounded-lg bg-accent text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
            >
              {rPending ? "Rejecting…" : "Confirm reject"}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              className="h-10 flex-1 rounded-lg border border-border text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {(showVerify || showReject) && !showRejectForm ? (
        <div className="grid grid-cols-2 border-t border-border">
          {showVerify ? (
            <form action={vDispatch}>
              <button
                type="submit"
                disabled={vPending || rPending}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-emerald-800 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" aria-hidden />
                {vPending ? "Verifying…" : "Verify"}
              </button>
            </form>
          ) : null}
          {showReject ? (
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              disabled={vPending || rPending}
              className={`flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 border-l border-border text-sm font-medium text-danger hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${!showVerify ? "col-span-2" : ""}`}
            >
              <XIcon className="h-4 w-4" aria-hidden />
              Reject
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
