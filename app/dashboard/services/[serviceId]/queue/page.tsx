import { redirect } from "next/navigation";

import { QueueBoardClient } from "./QueueBoardClient";
import { AppShell } from "@/components/AppShell";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { getMyProvider, getMyService } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";

type Ticket = components["schemas"]["QueueEntryPublic"];
type Tickets = components["schemas"]["QueueEntriesPublic"];

export default async function QueueBoardPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const [provider, service, token] = await Promise.all([
    getMyProvider(),
    getMyService(serviceId),
    getSessionToken()
  ]);
  if (!provider) redirect("/dashboard");
  if (provider.verification_status !== "verified") {
    redirect("/dashboard/services");
  }
  if (!service) redirect("/dashboard/services");

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
    <AppShell>
      {loadError ? (
        <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-danger">
          {loadError}
        </p>
      ) : null}

      {!loadError ? (
        <QueueBoardClient
          serviceId={serviceId}
          serviceName={service.name}
          initialTickets={tickets}
          token={token}
        />
      ) : null}
    </AppShell>
  );
}
