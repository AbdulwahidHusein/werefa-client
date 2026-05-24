import { redirect } from "next/navigation";

import { AddMemberModal } from "./AddMemberModal";
import { MembersList } from "./MembersList";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { getMe, getMyProvider } from "@/lib/dal";

type Membership = components["schemas"]["MembershipPublic"];
type UserPublic = components["schemas"]["UserPublic"];

type MemberItem = {
  membership: Membership;
  user: UserPublic;
};

async function loadMembers(providerId: string): Promise<MemberItem[]> {
  return apiFetch<MemberItem[]>(`/providers/${providerId}/members`, {
    method: "GET",
  });
}

export default async function MembersPage() {
  const [me, provider] = await Promise.all([getMe(), getMyProvider()]);

  if (!provider) redirect("/dashboard");

  const items = await loadMembers(provider.id);
  const isOwner = provider.membership_role === "owner";

  return (
    <>
    <PageHeader
        title="Members"
        subtitle={provider.biz_name}
        back="/dashboard"
        trailing={isOwner ? <AddMemberModal providerId={provider.id} /> : null}
      />

      {!isOwner ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm font-medium">Only owners can manage members</p>
          <p className="mt-1 text-sm">
            Ask an owner to add or remove staff for this provider.
          </p>
        </div>
      ) : null}

      <MembersList
        providerId={provider.id}
        currentUserId={me?.id}
        canManage={isOwner}
        items={items}
      />
  </>
  );
}
