import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";

type JoinInviteResolved = components["schemas"]["JoinInviteResolved"];

export default async function JoinDeepLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-xl font-semibold">Invalid Invite Link</p>
          <p className="mt-2 text-sm text-muted">
            The link you followed is missing the invite token.
          </p>
        </div>
      </AppShell>
    );
  }

  let resolved: JoinInviteResolved | null = null;
  let error: string | null = null;

  try {
    const res = await apiFetch<JoinInviteResolved>(`/join-invites/resolve?token=${token}`, {
      method: "GET",
    });
    resolved = res.data;
  } catch (err) {
    if (err instanceof ApiRequestError) {
      error = err.detail;
    } else {
      error = "Failed to resolve invite link.";
    }
  }

  if (error || !resolved) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-xl font-semibold text-danger">Invite Error</p>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </div>
      </AppShell>
    );
  }

  // Redirect to provider page with autoJoin parameters
  const redirectUrl = `/p/${resolved.slug}?serviceId=${resolved.service_item_id}&inviteToken=${token}&autoJoin=true`;
  redirect(redirectUrl);
}
