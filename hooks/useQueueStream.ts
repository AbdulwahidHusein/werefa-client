import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import type { components } from "@/lib/api/schema";
import { api } from "@/lib/api/client";

type Ticket = components["schemas"]["QueueEntryPublic"];
type Tickets = components["schemas"]["QueueEntriesPublic"];

export function useQueueStream(
  serviceId: string,
  initialTickets: Ticket[],
  token: string | null
) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const path = token ? `/service-items/${serviceId}/stream` : null;
  const { state: wsState, client } = useWebSocket(path, token);

  const refreshTickets = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await api<Tickets>(`/service-items/${serviceId}/tickets`);
      setTickets(res.data);
    } catch (e) {
      console.error("Failed to refresh tickets", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (!client) return;

    return client.onMessage((msg) => {
      // Upon receiving any update event, refresh the full list
      refreshTickets();
    });
  }, [client, refreshTickets]);

  return { tickets, wsState, isRefreshing, refreshTickets };
}
