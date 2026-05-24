import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { isInvalidSessionError } from "./auth-errors";
import { apiFetch, ApiRequestError } from "./api/server";
import type { components } from "./api/schema";
import { getProviderId, getSessionToken } from "./session";

export type Me = components["schemas"]["UserPublic"];
export type MyProvider = components["schemas"]["MyProviderPublic"];
export type MyService = components["schemas"]["ServiceItemPublic"];
type MyProvidersList = components["schemas"]["MyProvidersPublic"];
export type DiscoveredProvider =
  components["schemas"]["ProviderDiscoveryPublic"];
export type Discoveries = components["schemas"]["ProviderDiscoveriesPublic"];
export type MyTicket = components["schemas"]["QueueEntryPublic"];
type MyTickets = components["schemas"]["QueueEntriesPublic"];

export const getMe = cache(async (): Promise<Me | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    return await apiFetch<Me>("/users/me", { method: "GET" });
  } catch (err) {
    if (isInvalidSessionError(err)) return null;
    throw err;
  }
});

export async function requireMe(): Promise<Me> {
  const token = await getSessionToken();
  const me = await getMe();
  if (!me) {
    const url = token ? "/login?session=expired" : "/login";
    redirect(url);
  }
  return me;
}

export async function requireAdmin(): Promise<Me> {
  const me = await requireMe();
  if (!me.is_superuser) redirect("/");
  return me;
}

export async function requireProvider(): Promise<Me> {
  const me = await requireMe();
  if (!me.is_superuser && me.user_type !== "provider") {
    redirect("/");
  }
  return me;
}

export const listMyProviders = cache(async (): Promise<MyProvider[]> => {
  try {
    const res = await apiFetch<MyProvidersList>("/users/me/providers/", {
      method: "GET",
    });
    return res.data;
  } catch (err) {
    if (isInvalidSessionError(err)) return [];
    throw err;
  }
});

export const getMyProvider = cache(async (): Promise<MyProvider | null> => {
  const providers = await listMyProviders();
  if (providers.length === 0) return null;

  const selectedId = await getProviderId();
  if (selectedId) {
    const match = providers.find((p) => p.id === selectedId);
    if (match) return match;
  }
  // No cookie or stale id after reseed: use first membership (read-only in RSC).
  return providers[0];
});

export const listMyServices = cache(async (): Promise<MyService[]> => {
  const provider = await getMyProvider();
  if (!provider) return [];
  try {
    return await apiFetch<MyService[]>(
      `/providers/${provider.id}/services/`,
      { method: "GET" },
    );
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return [];
    throw err;
  }
});

export const getMyService = cache(
  async (serviceId: string): Promise<MyService | null> => {
    const services = await listMyServices();
    return services.find((s) => s.id === serviceId) ?? null;
  },
);

export const listMyTickets = cache(async (): Promise<MyTicket[]> => {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    const res = await apiFetch<MyTickets>("/service-items/me/tickets", {
      method: "GET",
    });
    return res.data;
  } catch (err) {
    if (isInvalidSessionError(err)) return [];
    throw err;
  }
});

export const listAllProviders = cache(async (): Promise<DiscoveredProvider[]> => {
  const res = await apiFetch<Discoveries>("/providers/discover", {
    method: "GET",
    query: {
      latitude: 0,
      longitude: 0,
      radius_m: 20_000_000,
      include_unverified: true,
      include_paused: true,
      include_private: true,
      only_open: false,
      limit: 100,
    },
  });
  return res.data;
});
