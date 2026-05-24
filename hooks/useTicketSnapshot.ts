"use client";

import { useCallback, useEffect, useState } from "react";

import type { TicketQueueSnapshot } from "@/lib/ticket-snapshot";

export function useTicketSnapshot({
  serviceItemId,
  ticketId,
  wsClient,
}: {
  serviceItemId: string;
  ticketId: string;
  wsClient?: { onMessage: (cb: (msg: unknown) => void) => () => void } | null;
}) {
  const [snapshot, setSnapshot] = useState<TicketQueueSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/service-items/${serviceItemId}/tickets/${ticketId}/snapshot`,
        { credentials: "include" },
      );
      if (res.ok) {
        setSnapshot((await res.json()) as TicketQueueSnapshot);
      }
    } catch {
      // keep last snapshot
    } finally {
      setLoading(false);
    }
  }, [serviceItemId, ticketId]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!wsClient) return;
    const unsub = wsClient.onMessage((msg: unknown) => {
      const m = msg as { type?: string };
      if (m.type === "queue_updated") {
        refresh();
      }
    });
    return unsub;
  }, [wsClient, refresh]);

  return { snapshot, loading, refresh };
}
