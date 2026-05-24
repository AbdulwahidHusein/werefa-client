"use client";

import { useCallback, useEffect, useState } from "react";

import type { ServiceLinePreview } from "@/lib/service-line-preview";

const POLL_MS = 15_000;

export function useServiceLinePreview(
  serviceItemId: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const [preview, setPreview] = useState<ServiceLinePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch(`/api/service-items/${serviceItemId}/line-preview`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setError("Could not load queue status");
        return;
      }
      setPreview((await res.json()) as ServiceLinePreview);
      setError(null);
    } catch {
      setError("Could not load queue status");
    } finally {
      setLoading(false);
    }
  }, [serviceItemId, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [enabled, refresh]);

  return { preview, loading, error, refresh };
}
