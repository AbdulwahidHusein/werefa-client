import { redirect } from "next/navigation";

import { DocumentList, type ProviderDocument } from "@/components/DocumentList";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { VerificationChecklist } from "@/components/VerificationChecklist";
import { getMyProvider, requireMe } from "@/lib/dal";
import { apiFetch } from "@/lib/api/server";
import type { VerificationRequirements } from "@/lib/verification-documents";

export default async function ProviderDocumentsPage() {
  await requireMe();
  const provider = await getMyProvider();

  if (!provider) {
    redirect("/dashboard");
  }

  let documents: ProviderDocument[] = [];
  let requirements: VerificationRequirements | null = null;

  try {
    [documents, requirements] = await Promise.all([
      apiFetch<ProviderDocument[]>(`/providers/${provider.id}/documents`),
      apiFetch<VerificationRequirements>(
        `/providers/${provider.id}/verification-requirements`,
      ),
    ]);
  } catch {
    // leave empty
  }

  const status = provider.verification_status;
  const isVerified = status === "verified";
  const isPending = status === "pending";
  const isRejected = status === "rejected";
  const needsUploadsForReview = isPending || isRejected;

  return (
    <>
      <PageHeader
        title="Business verification"
        subtitle={
          isVerified
            ? "Manage verification documents"
            : "Upload documents for platform review"
        }
        back="/dashboard/settings/profile"
      />

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{provider.biz_name}</h3>
              <p className="text-xs text-muted mt-0.5">Verification status</p>
            </div>
            <StatusPill status={status} />
          </div>

          {isPending ? (
            <p className="text-xs leading-relaxed text-amber-900 bg-amber-50 border border-amber-100 rounded-xl p-3">
              Upload all required documents below, then wait for admin approval. Until then,
              your business will not appear in public search and customers cannot join online.
            </p>
          ) : null}

          {isRejected ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-950">
              <p className="font-semibold">Previous rejection</p>
              <p className="mt-1 leading-relaxed">
                {provider.last_rejection_reason ?? "Please upload corrected documents."}
              </p>
            </div>
          ) : null}

          {isVerified ? (
            <p className="text-xs text-muted leading-relaxed">
              Your business is live on Werefa. You can still upload or replace documents below
              for your records.
            </p>
          ) : null}
        </div>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
            {isVerified ? "Verification" : "Required documents"}
          </h3>
          <VerificationChecklist requirements={requirements} />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
            {needsUploadsForReview ? "Upload (required for review)" : "Upload documents"}
          </h3>
          <DocumentUploadForm providerId={provider.id} />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
            Your uploads
          </h3>
          <DocumentList
            documents={documents}
            providerId={provider.id}
            emptyMessage={
              needsUploadsForReview
                ? "No documents uploaded yet. Add each required type above."
                : "No documents on file yet."
            }
          />
        </section>
      </div>
    </>
  );
}
