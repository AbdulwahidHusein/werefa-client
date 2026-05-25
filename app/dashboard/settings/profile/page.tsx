import { redirect } from "next/navigation";

import { ProviderProfileForm } from "./ProviderProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyProvider, requireMe } from "@/lib/dal";

export default async function ProviderProfilePage() {
  await requireMe();
  const provider = await getMyProvider();

  if (!provider) redirect("/dashboard");

  const isOwner = provider.membership_role === "owner";

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

      <ProviderProfileForm provider={provider} readonly={!isOwner} />
    </>
  );
}
