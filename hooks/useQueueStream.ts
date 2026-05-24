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

  // Sync state when the server component re-renders after a server action revalidation.
  // useState(initialTickets) only runs once on mount; this ensures prop changes propagate.
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const path = token ? `/ws/service-items/${serviceId}/stream` : null;
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
    const unsubscribe = client.onMessage(() => {
      refreshTickets();
    });
    return () => { unsubscribe(); };
  }, [client, refreshTickets]);

  // Fallback: poll every 30 s when the WebSocket is not connected.
  useEffect(() => {
    if (wsState === "connected") return;
    const timer = setInterval(refreshTickets, 30_000);
    return () => clearInterval(timer);
  }, [wsState, refreshTickets]);

  return { tickets, wsState, isRefreshing, refreshTickets, client };
}
