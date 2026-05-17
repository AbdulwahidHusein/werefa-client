import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDistanceToNow } from "date-fns";

type UserPublic = components["schemas"]["UserPublic"];

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user: UserPublic;
  try {
    user = await apiFetch<UserPublic>(`/users/${id}`, { method: "GET" });
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) notFound();
    throw err;
  }

  return (
    <AppShell>
      <PageHeader title="User Profile" back="/admin/users" />

      <div className="max-w-2xl mx-auto mt-6">
        <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
          <div className="bg-accent/5 p-8 flex flex-col items-center justify-center text-center border-b border-border">
            <div className="h-20 w-20 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-4 text-3xl font-bold uppercase">
              {user.email.charAt(0)}
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {user.full_name || "Anonymous User"}
            </h1>
            <p className="text-sm text-muted mt-1">{user.email}</p>
          </div>

          <div className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted mb-4">
              Account Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-xs text-muted mb-1">User ID</dt>
                <dd className="text-sm font-medium break-all">{user.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted mb-1">Status</dt>
                <dd className="text-sm font-medium">
                  <StatusPill status={user.is_active ? "open" : "closed"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </StatusPill>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted mb-1">Role</dt>
                <dd className="text-sm font-medium capitalize">
                  {user.is_superuser ? "Superuser" : "Standard"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted mb-1">Phone</dt>
                <dd className="text-sm font-medium">
                  {user.phone_number || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
