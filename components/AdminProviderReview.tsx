"use client";

import { useActionState, useState } from "react";
import { Check, X as XIcon } from "lucide-react";

import {
  inlineRejectProvider,
  inlineVerifyProvider,
  type AdminState,
} from "@/app/admin/actions";
import { DocumentPreviewList } from "@/components/DocumentPreviewList";
import { StatusPill } from "@/components/ui/StatusPill";
import { VerificationChecklist } from "@/components/VerificationChecklist";
import type { ProviderDocument } from "@/components/DocumentList";
import type { VerificationRequirements } from "@/lib/verification-documents";
import { kindLabel } from "@/lib/verification-documents";

const initial: AdminState = undefined;

export function AdminProviderReview({
  providerId,
  bizName,
  verificationStatus,
  lastRejectionReason,
  documents,
  requirements,
}: {
  providerId: string;
  bizName: string;
  verificationStatus: string;
  lastRejectionReason?: string | null;
  documents: ProviderDocument[];
  requirements: VerificationRequirements | null;
}) {
  const verifyAction = inlineVerifyProvider.bind(null, providerId);
  const rejectAction = inlineRejectProvider.bind(null, providerId);
  const [vState, vDispatch, vPending] = useActionState(verifyAction, initial);
  const [rState, rDispatch, rPending] = useActionState(rejectAction, initial);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const state = vState ?? rState;
  const canVerify = verificationStatus !== "verified";
  const missingDocs =
    requirements && !requirements.ready_for_review && !requirements.is_verified;
  const showReject = verificationStatus !== "rejected";

  const previewDocs = documents.map((d) => ({
    id: d.id,
    filename: d.filename,
    label: d.document_kind ? kindLabel(d.document_kind) : d.filename,
    url: d.url,
    content_type: undefined as string | undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{bizName}</h3>
            <p className="text-xs text-muted mt-0.5 font-mono">{providerId}</p>
          </div>
          <StatusPill status={verificationStatus} />
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Review uploaded documents when available. You can approve or reject at your
          discretion — documents are not required to verify. The owner receives an email on
          approval or rejection.
        </p>
        {lastRejectionReason ? (
          <p className="text-xs text-rose-900 bg-rose-50 border border-rose-100 rounded-xl p-3">
            <span className="font-semibold">Last rejection: </span>
            {lastRejectionReason}
          </p>
        ) : null}
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
          Document checklist
        </h3>
        <VerificationChecklist requirements={requirements} />
        {missingDocs ? (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3">
            Some required document types are not uploaded yet. You can still approve if you
            have verified this business another way.
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
          Preview documents
        </h3>
        <DocumentPreviewList documents={previewDocs} />
      </section>

      {state && "ok" in state && state.ok ? (
        <p className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-900" role="status">
          {state.message}
        </p>
      ) : null}
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      {showRejectForm ? (
        <form action={rDispatch} className="rounded-2xl border border-border p-4 flex flex-col gap-3">
          <label className="text-sm font-medium">Rejection reason (sent to owner by email)</label>
          <textarea
            name="reason"
            required
            minLength={1}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base"
            placeholder="Explain what is missing or invalid…"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={rPending}
              className="h-10 flex-1 rounded-lg bg-accent text-sm font-medium text-accent-foreground disabled:opacity-50"
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
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {showReject ? (
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              disabled={vPending || rPending}
              className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-medium text-danger hover:bg-surface disabled:opacity-50"
            >
              <XIcon className="h-4 w-4" />
              Reject
            </button>
          ) : (
            <div />
          )}
          {verificationStatus !== "verified" ? (
            <form action={vDispatch} className={showReject ? "" : "col-span-2"}>
              <button
                type="submit"
                disabled={!canVerify || vPending || rPending}
                className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                title="Approve business"
              >
                <Check className="h-4 w-4" />
                {vPending ? "Approving…" : "Approve business"}
              </button>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
}
