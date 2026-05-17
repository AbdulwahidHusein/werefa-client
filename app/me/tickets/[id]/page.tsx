import { LiveTicket } from "./LiveTicket";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { listMyTickets } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tickets = await listMyTickets();
  const ticket = tickets.find((t) => t.id === id);
  const token = await getSessionToken();

  return (
    <AppShell>
      <PageHeader title="Ticket" back="/me/tickets" />

      {!ticket ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">Ticket not found</p>
          <p className="mt-1 text-sm text-muted">
            It may have been completed or cancelled.
          </p>
        </div>
      ) : (
        <LiveTicket initialTicket={ticket} token={token} />
      )}
    </AppShell>
  );
}
