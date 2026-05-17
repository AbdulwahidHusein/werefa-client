"use client";

import { Check, X as XIcon } from "lucide-react";
import { useActionState } from "react";
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

  const state = vState ?? rState;
  const showVerify = provider.verification_status !== "verified";
  const showReject = provider.verification_status !== "rejected";

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {provider.biz_name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted">
              /{provider.slug}
            </p>
            <p className="mt-1 truncate font-mono text-[10px] text-muted">
              {provider.id}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <StatusPill status={provider.verification_status} />
            <Link
              href={`/admin/providers/${provider.id}`}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Review Documents →
            </Link>
          </div>
        </div>

        {state && "ok" in state && state.ok ? (
          <p
            className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
            role="status"
          >
            ✓ {state.message}
          </p>
        ) : null}
        {state && "error" in state && state.error ? (
          <p className="mt-3 text-xs text-danger" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>

      {(showVerify || showReject) ? (
        <div className="grid grid-cols-2 border-t border-border">
          {showVerify ? (
            <form action={vDispatch}>
              <button
                type="submit"
                disabled={vPending || rPending}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" aria-hidden />
                {vPending ? "Verifying…" : "Verify"}
              </button>
            </form>
          ) : null}
          {showReject ? (
            <form action={rDispatch} className={showVerify ? "border-l border-border" : ""}>
              <button
                type="submit"
                disabled={vPending || rPending}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XIcon className="h-4 w-4" aria-hidden />
                {rPending ? "Rejecting…" : "Reject"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
