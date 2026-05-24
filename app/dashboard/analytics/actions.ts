"use server";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { ProviderAnalytics } from "@/lib/provider-analytics";

export async function fetchProviderAnalyticsAction(
  providerId: string,
  options?: { days?: number; serviceItemId?: string | null },
): Promise<{ ok: true; data: ProviderAnalytics } | { ok: false; error: string }> {
  try {
    const query: Record<string, string> = {
      days: String(options?.days ?? 30),
    };
    if (options?.serviceItemId) {
      query.service_item_id = options.serviceItemId;
    }
    const data = await apiFetch<ProviderAnalytics>(
      `/providers/${providerId}/analytics`,
      { method: "GET", query },
    );
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { ok: false, error: err.detail };
    }
    return { ok: false, error: "Could not load analytics." };
  }
}
