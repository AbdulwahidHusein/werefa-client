import { redirect } from "next/navigation";

import { DocumentList } from "@/components/DocumentList";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyProvider, requireMe } from "@/lib/dal";
import { apiFetch } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";

type ProviderDocument = components["schemas"]["ProviderDocumentPublic"];

export default async function ProviderDocumentsPage() {
  await requireMe();
  const provider = await getMyProvider();

  if (!provider) {
    redirect("/dashboard");
  }

  // Fetch all KYC documents for this business from backend
  let documents: ProviderDocument[] = [];
  try {
    documents = await apiFetch<ProviderDocument[]>(`/providers/${provider.id}/documents`);
  } catch (err) {
    // If not authorized or provider not found, let documents remain empty
  }

  return (
    <AppShell>
      <PageHeader
        title="Business Verification"
        subtitle="Uploads & active KYC documents"
        back="/dashboard/settings/profile"
      />

      <div className="flex flex-col gap-6">
        {/* Verification Context Card */}
        <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">KYC Documents</h3>
            <p className="text-xs text-muted mt-0.5">
              Review verification licenses, permits, and credentials uploaded for your business.
            </p>
          </div>
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs leading-normal text-muted">
            For security and regulatory compliance, verification documents are managed and uploaded by platform administrators. If you need to submit new documents, please reach out to admin support.
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted px-1">Uploaded Credentials</h3>
          <DocumentList documents={documents} providerId={provider.id} />
        </section>
      </div>
    </AppShell>
  );
}
