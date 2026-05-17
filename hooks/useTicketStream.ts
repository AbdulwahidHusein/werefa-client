import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";
import type { components } from "@/lib/api/schema";

type Ticket = components["schemas"]["QueueEntryPublic"];

export function useTicketStream(initialTicket: Ticket, token: string | null) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  
  const path = token ? `/tickets/${initialTicket.id}/stream` : null;
  const { state: wsState, client } = useWebSocket(path, token);

  useEffect(() => {
    if (!client) return;

    return client.onMessage((msg) => {
      // Typically backend sends {"type": "queue_updated", "status": "serving", ...}
      if (msg.ticket_id === ticket.id) {
        setTicket((prev) => ({
          ...prev,
          status: msg.status ?? prev.status,
        }));
      }
    });
  }, [client, ticket.id]);

  return { ticket, wsState };
}
