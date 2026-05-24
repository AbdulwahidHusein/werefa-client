import { redirect } from "next/navigation";
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-semibold">Invalid invite link</p>
        <p className="mt-2 text-sm text-muted">
          The link you followed is missing the invite token.
        </p>
      </div>
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
      error = err.detail;
    } else {
      error = "Failed to resolve invite link.";
    }
  }

  if (error || !resolved) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-semibold text-danger">Invite error</p>
        <p className="mt-2 text-sm text-muted">{error}</p>
      </div>
    );
  }

  redirect(
    `/p/${resolved.slug}?serviceId=${resolved.service_item_id}&inviteToken=${token}&autoJoin=true`,
  );
}
