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
      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Operational Analytics</h3>
          <p className="text-xs text-muted">View event charts, conversion funnels, and export analytics CSV.</p>
        </div>
        <a
          href="/admin/analytics"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-accent px-4 text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          Open Analytics Dashboard
        </a>
      </div>

      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">System Health Monitor</h3>
          <p className="text-xs text-muted">Verify active status of PostgreSQL database, Redis caches, and WebSocket subscription channels.</p>
        </div>
        <a
          href="/admin/system"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-accent px-4 text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          Open Health Dashboard
        </a>
      </div>

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
