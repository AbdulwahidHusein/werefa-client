import { LiveTicket } from "./LiveTicket";
import { PageHeader } from "@/components/ui/PageHeader";
import { listMyTickets } from "@/lib/dal";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import { getSessionToken } from "@/lib/session";
import type { TicketQueueSnapshot } from "@/lib/ticket-snapshot";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tickets = await listMyTickets();
  const ticket = tickets.find((t) => t.id === id);
  const token = await getSessionToken();

  let snapshot: TicketQueueSnapshot | null = null;
  if (ticket) {
    try {
      snapshot = await apiFetch<TicketQueueSnapshot>(
        `/service-items/${ticket.service_item_id}/tickets/${ticket.id}/snapshot`,
        { method: "GET" },
      );
    } catch (err) {
      if (!(err instanceof ApiRequestError)) throw err;
    }
  }

  const pageTitle = snapshot?.biz_name ?? "Your ticket";

  return (
    <>
      <PageHeader title={pageTitle} subtitle={snapshot?.service_name} back="/me/tickets" />

      {!ticket ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">Ticket not found</p>
          <p className="mt-1 text-sm text-muted">
            It may have been completed or cancelled.
          </p>
        </div>
      ) : (
        <LiveTicket
          initialTicket={ticket}
          initialSnapshot={snapshot}
          token={token}
        />
      )}
    </>
  );
}
