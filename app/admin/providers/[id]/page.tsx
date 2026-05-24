import { redirect } from "next/navigation";

import { DocumentList, type ProviderDocument } from "@/components/DocumentList";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireMe } from "@/lib/dal";
import { apiFetch } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";

type ProviderDetail = components["schemas"]["ProviderDiscoveryPublic"];

export default async function AdminProviderKYCPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireMe();
  if (!me.is_superuser) {
    redirect("/dashboard");
  }

  const { id: providerId } = await params;

  let provider: ProviderDetail;
  let documents: ProviderDocument[] = [];

  try {
    // 1. Fetch provider details
    provider = await apiFetch<ProviderDetail>(`/providers/${providerId}`);
    // 2. Fetch provider documents
    documents = await apiFetch<ProviderDocument[]>(`/providers/${providerId}/documents`);
  } catch (err) {
    redirect("/admin");
  }

  return (
    <>
    <PageHeader
        title="Provider Verification"
        subtitle={provider.biz_name}
        back="/admin"
      />

      <div className="flex flex-col gap-6">
        {/* Upload Form Component */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted px-1">Admin Upload Console</h3>
          <DocumentUploadForm providerId={providerId} />
        </section>

        {/* List view of documents */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted px-1">Verification Documents</h3>
          <DocumentList documents={documents} providerId={providerId} />
        </section>
      </div>
  </>
  );
}
