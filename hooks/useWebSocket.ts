import { useEffect, useState, useRef } from "react";
import { WsClient, ConnectionState } from "@/lib/websocket/client";
import { getWsUrl } from "@/lib/api/client";

export function useWebSocket(path: string | null, token: string | null) {
  const [state, setState] = useState<ConnectionState>("disconnected");
  const clientRef = useRef<WsClient | null>(null);

  useEffect(() => {
    if (!path || !token) return;

    const url = getWsUrl(path, token);
    const client = new WsClient(url);
    clientRef.current = client;

    const unsubscribeState = client.onStateChange(setState);

    client.connect();

    return () => {
      unsubscribeState();
      client.disconnect();
      clientRef.current = null;
    };
  }, [path, token]);

  return { client: clientRef.current, state };
}
