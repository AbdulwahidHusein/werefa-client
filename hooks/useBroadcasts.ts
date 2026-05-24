"use client";

import { useEffect, useState } from "react";

export type Broadcast = {
  id: string;
  body: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
  service_item_id: string | null;
  author_role?: "owner" | "staff" | string;
  author_label?: string;
};

export function useBroadcasts({
  providerId,
  token,
  wsClient,
}: {
  providerId?: string | null;
  token: string | null;
  wsClient: any;
}) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!providerId) {
        setLoading(false);
        return;
      }
      try {
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/providers/${providerId}/broadcasts`, {
          headers,
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch line messages");
        }
        const json = await res.json();
        if (active) {
          setBroadcasts(json.data || []);
        }
      } catch (err) {
        console.error("Error loading line messages:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [providerId, token, refreshTrigger]);

  useEffect(() => {
    if (!wsClient) return;

    const unsubscribe = wsClient.onMessage((msg: any) => {
      if (msg.type === "broadcast_v1") {
        const newBroadcast: Broadcast = {
          id: msg.broadcast_id,
          body: msg.body,
          severity: msg.severity,
          created_at: msg.occurred_at,
          service_item_id: msg.service_item_id ?? null,
          author_role: msg.author_role ?? "staff",
          author_label: msg.author_label ?? "Business",
        };

        setBroadcasts((prev) => {
          if (prev.some((b) => b.id === newBroadcast.id)) return prev;
          return [...prev, newBroadcast];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [wsClient]);

  return { broadcasts, setBroadcasts, loading, refresh };
}
