"use client";

import { useActionState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { testTokenAction } from "./actions";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function TestTokenPage() {
  const [state, formAction, isPending] = useActionState(
    testTokenAction,
    undefined,
  );

  return (
    <>
    <PageHeader title="Test Token Debugger" back="/admin" />

      <div className="max-w-2xl mx-auto mt-6">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Session Validation
            </h2>
            <p className="text-sm text-muted mt-1">
              Verify your current authentication token against the backend 
              <code className="mx-1 rounded bg-accent/10 px-1 py-0.5 text-accent font-mono text-xs">
                POST /login/test-token
              </code> 
              endpoint.
            </p>
          </div>

          <form action={formAction} className="mb-8">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {!isPending && <ShieldCheck className="h-4 w-4" />}
              Test Current Token
            </button>
          </form>

          {state && "ok" in state && state.ok && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
              <div className="bg-emerald-100 px-4 py-2 border-b border-emerald-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span className="text-sm font-semibold text-emerald-800">Token is valid!</span>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono text-emerald-900 whitespace-pre-wrap break-all">
                  {JSON.stringify(state.user, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {state && "error" in state && state.error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 overflow-hidden">
              <div className="bg-rose-100 px-4 py-2 border-b border-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-700" />
                <span className="text-sm font-semibold text-rose-800">Token is invalid or expired</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-rose-700 font-medium">{state.error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
  </>
  );
}
