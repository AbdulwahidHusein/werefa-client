import { redirect } from "next/navigation";

import { StatusScreen } from "@/components/StatusScreen";
import { friendlyJoinError } from "@/lib/api-errors";
import { apiFetch, ApiRequestError } from "@/lib/api/server";

type JoinInviteResolved = {
  token: string;
  slug: string;
  service_item_id: string;
  expires_at?: string | null;
};

export default async function JoinDeepLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <StatusScreen
        variant="error"
        title="Invalid invite link"
        message="This link is missing the invite token. Ask the business for a new QR code or link."
        primaryAction={{ label: "Go to Discover", href: "/" }}
      />
    );
  }

  let resolved: JoinInviteResolved | null = null;
  let error: string | null = null;

  try {
    resolved = await apiFetch<JoinInviteResolved>(
      `/join-invites/resolve?token=${token}`,
      { method: "GET" },
    );
  } catch (err) {
    if (err instanceof ApiRequestError) {
      error = friendlyJoinError(err.detail, err.status);
    } else {
      error = "We couldn't open this invite. Check your connection and try again.";
    }
  }

  if (error || !resolved) {
    return (
      <StatusScreen
        variant="error"
        title="Invite unavailable"
        message={error ?? "This invite link is no longer valid."}
        primaryAction={{ label: "Go to Discover", href: "/" }}
      />
    );
  }

  redirect(
    `/p/${resolved.slug}?serviceId=${resolved.service_item_id}&inviteToken=${token}&autoJoin=true`,
  );
}
