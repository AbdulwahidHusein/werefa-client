import "server-only";

import { apiFetch } from "./api/server";
import type { components } from "./api/schema";
import { getMyProvider, listMyProviders, listMyServices } from "./dal";
import { getServiceId } from "./session";

type Tickets = components["schemas"]["QueueEntriesPublic"];

export type ServiceLineStat = {
  id: string;
  name: string;
  waiting: number;
  serving: number;
};

/** Count active tickets per service line (provider staff). */
export async function getServiceLineStats(
  services: { id: string; name: string }[],
): Promise<ServiceLineStat[]> {
  const stats = await Promise.all(
    services.map(async (s) => {
      try {
        const res = await apiFetch<Tickets>(
          `/service-items/${s.id}/tickets`,
          { method: "GET" },
        );
        const waiting = res.data.filter((t) => t.status === "waiting").length;
        const serving = res.data.filter((t) => t.status === "serving").length;
        return { id: s.id, name: s.name, waiting, serving };
      } catch {
        return { id: s.id, name: s.name, waiting: 0, serving: 0 };
      }
    }),
  );
  return stats;
}

function pickBusiestLine(
  stats: ServiceLineStat[],
  preferredId: string | null,
): ServiceLineStat | null {
  if (stats.length === 0) return null;
  const withActivity = stats.filter((s) => s.waiting + s.serving > 0);
  if (withActivity.length === 0) {
    if (preferredId) {
      return stats.find((s) => s.id === preferredId) ?? stats[0];
    }
    return stats[0];
  }
  if (preferredId) {
    const pref = withActivity.find((s) => s.id === preferredId);
    if (pref) return pref;
  }
  return withActivity.reduce((best, cur) => {
    const curTotal = cur.waiting + cur.serving;
    const bestTotal = best.waiting + best.serving;
    return curTotal > bestTotal ? cur : best;
  });
}

/** Best queue board URL — prefers the line with people waiting. */
export async function getProviderQueuePath(): Promise<string | null> {
  const provider = await getMyProvider();
  if (!provider || provider.verification_status !== "verified") {
    return null;
  }

  const services = await listMyServices();
  if (services.length === 0) {
    return null;
  }

  const stats = await getServiceLineStats(services);
  const savedId = await getServiceId();
  const chosen = pickBusiestLine(stats, savedId);
  if (!chosen) return null;
  return `/dashboard/services/${chosen.id}/queue`;
}

/** Post-login / post-select landing for a provider account. */
export async function providerHomePath(): Promise<string> {
  const providers = await listMyProviders();
  if (providers.length === 0) {
    return "/dashboard/setup";
  }

  const provider = await getMyProvider();
  if (!provider) {
    return "/dashboard";
  }

  if (provider.verification_status !== "verified") {
    return "/dashboard";
  }

  const queuePath = await getProviderQueuePath();
  if (queuePath) {
    return queuePath;
  }

  const services = await listMyServices();
  if (services.length === 0) {
    return "/dashboard/services";
  }

  return "/dashboard";
}
