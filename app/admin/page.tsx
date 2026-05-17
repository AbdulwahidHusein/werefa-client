import { AdminPanel } from "./AdminPanel";
import { AdminTabs } from "./AdminTabs";
import {
  rejectProviderAction,
  unblockUserAction,
  verifyProviderAction,
} from "./actions";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { listAllProviders } from "@/lib/dal";
import { apiFetch } from "@/lib/api/server";

export default async function AdminPage() {
  const [providers, usersRes] = await Promise.all([
    listAllProviders(),
    apiFetch<any>("/users?limit=100", { method: "GET" }),
  ]);

  const initialUsers = usersRes?.data || [];

  const tools = (
    <div className="flex flex-col gap-4">
      <AdminPanel
        title="Verify provider by id"
        description="Use when a provider isn't in the list (e.g. no coordinates set)."
        idLabel="Provider id"
        idName="provider_id"
        placeholder="00000000-0000-0000-0000-000000000000"
        submitLabel="Verify"
        pendingLabel="Verifying…"
        action={verifyProviderAction}
      />
      <AdminPanel
        title="Reject provider by id"
        idLabel="Provider id"
        idName="provider_id"
        placeholder="00000000-0000-0000-0000-000000000000"
        submitLabel="Reject"
        pendingLabel="Rejecting…"
        action={rejectProviderAction}
      />
      <AdminPanel
        title="Unblock user"
        description="Clears any active join block."
        idLabel="User id"
        idName="user_id"
        placeholder="00000000-0000-0000-0000-000000000000"
        submitLabel="Unblock"
        pendingLabel="Unblocking…"
        action={unblockUserAction}
      />
    </div>
  );

  return (
    <AppShell>
      <PageHeader
        title="Admin"
        subtitle="Review and act on providers"
        back="/account"
      />
      <AdminTabs
        providers={providers}
        initialUsers={initialUsers}
        toolsSlot={tools}
      />
    </AppShell>
  );
}
