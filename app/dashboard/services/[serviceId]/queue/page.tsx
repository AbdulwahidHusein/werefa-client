import { redirect } from "next/navigation";

import { RememberActiveService } from "@/components/RememberActiveService";
import { QueueBoardClient } from "./QueueBoardClient";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { getMe, getMyProvider, getMyService, listMyServices } from "@/lib/dal";
import { getServiceLineStats } from "@/lib/provider-routes";
import { getSessionToken } from "@/lib/session";

type Ticket = components["schemas"]["QueueEntryPublic"];
type Tickets = components["schemas"]["QueueEntriesPublic"];
type ServiceItemPublic = components["schemas"]["ServiceItemPublic"] & {
  allow_vip?: boolean;
  is_paused?: boolean;
  line_chat_enabled?: boolean;
};

export default async function QueueBoardPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const [provider, service, allServices, token, me] = await Promise.all([
    getMyProvider(),
    getMyService(serviceId),
    listMyServices(),
    getSessionToken(),
    getMe(),
  ]);
  if (!provider) redirect("/dashboard");
  if (provider.verification_status !== "verified") {
    redirect("/dashboard/services");
  }
  if (!service) redirect("/dashboard/services");

  const serviceLineStats = await getServiceLineStats(allServices);

  let tickets: Ticket[] = [];
  let loadError: string | null = null;
  try {
    const res = await apiFetch<Tickets>(
      `/service-items/${serviceId}/tickets`,
      { method: "GET" },
    );
    tickets = res.data;
  } catch (err) {
    if (err instanceof ApiRequestError) {
      loadError = err.detail;
    } else {
      throw err;
    }
  }

  return (
    <>
      <RememberActiveService serviceId={serviceId} />
      {loadError ? (
        <p className="mb-4 rounded-lg border border-border bg-surface p-4 text-sm text-danger">
          {loadError}
        </p>
      ) : null}

      {!loadError ? (
        <QueueBoardClient
          serviceId={serviceId}
          serviceName={service.name}
          initialTickets={tickets}
          token={token}
          providerId={provider.id}
          businessName={provider.biz_name}
          allServices={allServices}
          initialIsPaused={(service as ServiceItemPublic).is_paused ?? false}
          allowVip={(service as ServiceItemPublic).allow_vip ?? false}
          lineChatEnabled={(service as ServiceItemPublic).line_chat_enabled ?? true}
          isOwner={provider.membership_role === "owner"}
          currentUserId={me?.id}
          serviceLineStats={serviceLineStats}
        />
      ) : null}
    </>
  );
}
