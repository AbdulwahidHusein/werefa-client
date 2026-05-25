import { redirect } from "next/navigation";

import { AdminPanel } from "./AdminPanel";
import { AdminTabs } from "./AdminTabs";
import { RejectProviderPanel } from "./RejectProviderPanel";
import { unblockUserAction, verifyProviderAction } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { isInvalidSessionError } from "@/lib/auth-errors";
import { listAllProviders } from "@/lib/dal";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import { rethrowNavigationError } from "@/lib/rethrow-navigation";
import type { components } from "@/lib/api/schema";

/** FastAPI route is ``GET /users/`` — trailing slash avoids 307 + lost auth on redirect. */
const ADMIN_USERS_PATH = "/users/?limit=100";

type AdminUserRow = {
  id: string;
  email: string;
  phone_number: string | null;
  is_active: boolean;
  is_suspended: boolean;
  user_type: string;
};

export default async function AdminPage() {
  let providers: Awaited<ReturnType<typeof listAllProviders>> = [];
  let initialUsers: AdminUserRow[] = [];
  let loadError: string | null = null;
  let sessionExpired = false;

  try {
    const [providerRows, usersRes] = await Promise.all([
      listAllProviders(),
      apiFetch<components["schemas"]["UsersPublic"]>(ADMIN_USERS_PATH, {
        method: "GET",
      }),
    ]);
    providers = providerRows;
    initialUsers = (usersRes?.data ?? []).map((u) => ({
      id: String(u.id),
      email: u.email,
      phone_number: u.phone_number ?? null,
      is_active: u.is_active,
      is_suspended: Boolean((u as { is_suspended?: boolean }).is_suspended),
      user_type: u.user_type,
    }));
  } catch (err) {
    rethrowNavigationError(err);
    if (isInvalidSessionError(err)) {
      sessionExpired = true;
    } else if (err instanceof ApiRequestError) {
      loadError = err.detail;
    } else if (err instanceof Error) {
      loadError = err.message;
    } else {
      loadError = "Could not load admin data.";
    }
  }

  if (sessionExpired) {
    redirect("/login?session=expired");
  }

  const tools = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-background p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Operational Analytics</h3>
          <p className="text-xs text-muted">View event charts, conversion funnels, and export analytics CSV.</p>
        </div>
        <a
          href="/admin/analytics"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-xs font-semibold text-accent-foreground hover:bg-accent-hover"
        >
          Open Analytics Dashboard
        </a>
      </div>

      <div className="rounded-lg border border-border bg-background p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">System Health Monitor</h3>
          <p className="text-xs text-muted">Verify active status of PostgreSQL database, Redis caches, and WebSocket subscription channels.</p>
        </div>
        <a
          href="/admin/system"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-xs font-semibold text-accent-foreground hover:bg-accent-hover"
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
      <RejectProviderPanel />
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
    <>
      <PageHeader
        title="Overview"
        subtitle="Verify businesses and manage platform access"
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {loadError}
        </p>
      ) : null}
      <AdminTabs
        providers={providers}
        initialUsers={initialUsers}
        toolsSlot={tools}
      />
    </>
  );
}
