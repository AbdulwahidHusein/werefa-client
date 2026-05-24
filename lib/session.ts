import "server-only";

import { cookies } from "next/headers";

import type { AppRole } from "./navigation";
import {
  APP_ROLE_COOKIE,
  PROVIDER_ID_COOKIE,
  SERVICE_ID_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "./env";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;

export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOpts);
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getProviderId(): Promise<string | null> {
  const store = await cookies();
  return store.get(PROVIDER_ID_COOKIE)?.value ?? null;
}

export async function selectProvider(id: string): Promise<void> {
  const store = await cookies();
  store.set(PROVIDER_ID_COOKIE, id, cookieOpts);
}

export async function setProviderId(id: string): Promise<void> {
  await selectProvider(id);
}

export async function clearProviderId(): Promise<void> {
  const store = await cookies();
  store.delete(PROVIDER_ID_COOKIE);
  store.delete(SERVICE_ID_COOKIE);
}

export async function getServiceId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SERVICE_ID_COOKIE)?.value ?? null;
}

export async function selectService(id: string): Promise<void> {
  const store = await cookies();
  store.set(SERVICE_ID_COOKIE, id, cookieOpts);
}

export async function clearServiceId(): Promise<void> {
  const store = await cookies();
  store.delete(SERVICE_ID_COOKIE);
}

export async function setAppRole(role: AppRole): Promise<void> {
  const store = await cookies();
  store.set(APP_ROLE_COOKIE, role, cookieOpts);
}

export async function getAppRole(): Promise<AppRole | null> {
  const store = await cookies();
  const value = store.get(APP_ROLE_COOKIE)?.value;
  if (value === "seeker" || value === "provider" || value === "admin") {
    return value;
  }
  return null;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PROVIDER_ID_COOKIE);
  store.delete(SERVICE_ID_COOKIE);
  store.delete(APP_ROLE_COOKIE);
}
