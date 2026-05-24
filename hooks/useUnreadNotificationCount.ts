"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useUnreadNotificationCount() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me/notifications/unread-count", {
        credentials: "include",
      });
      if (!res.ok) return;
      const body = (await res.json()) as { unread_count?: number };
      setUnreadCount(body.unread_count ?? 0);
    } catch {
      // keep last count
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, pathname]);

  return { unreadCount, refresh };
}
