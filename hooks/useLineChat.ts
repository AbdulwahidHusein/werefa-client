"use client";

import { useCallback, useEffect, useState } from "react";

export type LineChatMessage = {
  id: string;
  body: string;
  author_user_id: string;
  author_role: "owner" | "staff" | "seeker" | string;
  author_label: string;
  created_at: string;
};

type ChatResponse = {
  data: LineChatMessage[];
  count: number;
  line_chat_enabled: boolean;
};

export function useLineChat({
  serviceItemId,
  wsClient,
  enabled = true,
}: {
  serviceItemId: string;
  wsClient?: { onMessage: (cb: (msg: unknown) => void) => () => void } | null;
  enabled?: boolean;
}) {
  const [messages, setMessages] = useState<LineChatMessage[]>([]);
  const [lineChatEnabled, setLineChatEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/service-items/${serviceItemId}/chat/messages`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Could not load chat");
      }
      const json = (await res.json()) as ChatResponse;
      setMessages(json.data ?? []);
      setLineChatEnabled(json.line_chat_enabled ?? true);
      setError(null);
    } catch {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [serviceItemId, enabled]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (!wsClient) return;

    const unsubscribe = wsClient.onMessage((msg: unknown) => {
      const m = msg as {
        type?: string;
        message_id?: string;
        author_user_id?: string;
        body?: string;
        author_role?: string;
        author_label?: string;
        occurred_at?: string;
      };
      if (m.type !== "line_chat_v1" || !m.message_id || !m.body) return;

      const incoming: LineChatMessage = {
        id: m.message_id,
        body: m.body,
        author_user_id: m.author_user_id ?? "",
        author_role: m.author_role ?? "seeker",
        author_label: m.author_label ?? "Guest",
        created_at: m.occurred_at ?? new Date().toISOString(),
      };

      setMessages((prev) => {
        if (prev.some((x) => x.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
    });

    return unsubscribe;
  }, [wsClient]);

  const postMessage = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !lineChatEnabled) return false;

      const res = await fetch(`/api/service-items/${serviceItemId}/chat/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail =
          typeof data.detail === "string" ? data.detail : "Could not send message";
        setError(detail);
        return false;
      }

      const created = (await res.json()) as LineChatMessage;
      setMessages((prev) => {
        if (prev.some((x) => x.id === created.id)) return prev;
        return [...prev, created];
      });
      setError(null);
      return true;
    },
    [serviceItemId, lineChatEnabled],
  );

  const setChatEnabled = useCallback((value: boolean) => {
    setLineChatEnabled(value);
  }, []);

  return {
    messages,
    lineChatEnabled,
    loading,
    error,
    postMessage,
    refresh: load,
    setChatEnabled,
  };
}
