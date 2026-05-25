import { redirect } from "next/navigation";

import { AdminProviderReview } from "@/components/AdminProviderReview";
import type { ProviderDocument } from "@/components/DocumentList";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireMe } from "@/lib/dal";
import { apiFetch } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import type { VerificationRequirements } from "@/lib/verification-documents";

type ProviderDetail = components["schemas"]["ProviderPublic"];

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
  let requirements: VerificationRequirements | null = null;

  try {
    [provider, documents, requirements] = await Promise.all([
      apiFetch<ProviderDetail>(`/providers/${providerId}`),
      apiFetch<ProviderDocument[]>(`/providers/${providerId}/documents`),
      apiFetch<VerificationRequirements>(
        `/providers/${providerId}/verification-requirements`,
      ),
    ]);
  } catch {
    redirect("/admin");
  }

  return (
    <>
      <PageHeader
        title="Provider verification"
        subtitle={provider.biz_name}
        back="/admin"
      />

      <AdminProviderReview
        providerId={providerId}
        bizName={provider.biz_name}
        verificationStatus={provider.verification_status}
        lastRejectionReason={
          (provider as ProviderDetail & { last_rejection_reason?: string | null })
            .last_rejection_reason
        }
        documents={documents}
        requirements={requirements}
      />
    </>
  );
}
