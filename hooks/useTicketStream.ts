import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";
import type { components } from "@/lib/api/schema";

type Ticket = components["schemas"]["QueueEntryPublic"];

export function useTicketStream(initialTicket: Ticket, token: string | null) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);

  // Sync state when the server component re-renders after a server action revalidation.
  useEffect(() => {
    setTicket(initialTicket);
  }, [initialTicket]);

  const path = token ? `/ws/tickets/${initialTicket.id}/stream` : null;
  const { state: wsState, client } = useWebSocket(path, token);

  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.onMessage((msg) => {
      // Typically backend sends {"type": "queue_updated", "status": "serving", ...}
      if (msg.ticket_id === ticket.id) {
        setTicket((prev) => ({
          ...prev,
          status: msg.status ?? prev.status,
        }));
      }
    });
    return () => { unsubscribe(); };
  }, [client, ticket.id]);

  return { ticket, wsState, client };
}
