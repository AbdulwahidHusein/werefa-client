import { redirect } from "next/navigation";

import { ProviderProfileForm } from "./ProviderProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyProvider, requireMe } from "@/lib/dal";
import { apiFetch } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";

type ProviderStaffPublic = components["schemas"]["ProviderStaffPublic"] & {
  profile_image_url?: string | null;
  category?: string | null;
  description?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  show_phone_public?: boolean;
  website?: string | null;
  biz_email?: string | null;
};

export default async function ProviderProfilePage() {
  await requireMe();
  const provider = await getMyProvider();

  if (!provider) redirect("/dashboard");

  const isOwner = provider.membership_role === "owner";

  // Fetch full staff view to get last_rejection_reason and profile_image_url
  let fullProvider: ProviderStaffPublic | null = null;
  try {
    fullProvider = await apiFetch<ProviderStaffPublic>(
      `/providers/${provider.id}`,
      { method: "GET" },
    );
  } catch {
    // fall back to basic provider data
  }

  const merged = {
    ...provider,
    ...(fullProvider ?? {}),
    profile_image_url: fullProvider?.profile_image_url ?? null,
  };

  return (
    <>
      <PageHeader
        title="Business Profile"
        subtitle={provider.biz_name}
        back="/dashboard"
      />

      {!isOwner ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm font-semibold">View only</p>
          <p className="mt-1 text-sm">Only the business owner can edit profile settings.</p>
        </div>
      ) : null}

      <ProviderProfileForm
        provider={merged as Parameters<typeof ProviderProfileForm>[0]["provider"]}
        readonly={!isOwner}
      />
    </>
  );
}
