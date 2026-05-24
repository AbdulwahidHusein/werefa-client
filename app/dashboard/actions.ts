"use server";

import { redirect } from "next/navigation";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { getMe } from "@/lib/dal";
import { providerHomePath } from "@/lib/provider-routes";
import { selectProvider, selectService, setAppRole } from "@/lib/session";

export type SetupState =
  | {
      error?: string;
      fields?: {
        biz_name?: string;
        slug?: string;
        latitude?: string;
        longitude?: string;
        join_radius_m?: string;
      };
    }
  | undefined;

type ProviderPublic = components["schemas"]["ProviderPublic"];

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

function parseOptionalNumber(raw: string): number | null | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export async function setupBusinessAction(
  _prev: SetupState,
  formData: FormData,
): Promise<SetupState> {
  const biz_name = String(formData.get("biz_name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const latRaw = String(formData.get("latitude") ?? "");
  const lngRaw = String(formData.get("longitude") ?? "");
  const radiusRaw = String(formData.get("join_radius_m") ?? "");

  const fields = {
    biz_name,
    slug,
    latitude: latRaw,
    longitude: lngRaw,
    join_radius_m: radiusRaw,
  };

  if (biz_name.length < 2) {
    return { error: "Business name is required.", fields };
  }
  if (!SLUG_RE.test(slug)) {
    return {
      error:
        "Slug must be lowercase letters, numbers, or dashes (no spaces).",
      fields,
    };
  }

  const latitude = parseOptionalNumber(latRaw);
  const longitude = parseOptionalNumber(lngRaw);
  if (latitude === null || longitude === null) {
    return { error: "Latitude and longitude must be numbers.", fields };
  }
  if ((latitude === undefined) !== (longitude === undefined)) {
    return { error: "Set both latitude and longitude, or neither.", fields };
  }

  const join_radius_m = parseOptionalNumber(radiusRaw);
  if (join_radius_m === null || (join_radius_m !== undefined && join_radius_m < 1)) {
    return { error: "Join radius must be a positive number.", fields };
  }

  const me = await getMe();
  if (!me) redirect("/login");

  try {
    if (me.user_type !== "provider") {
      await apiFetch("/users/me/become-provider", { method: "POST" });
    }
    const created = await apiFetch<ProviderPublic>("/providers/", {
      method: "POST",
      body: {
        slug,
        biz_name,
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
        ...(join_radius_m !== undefined ? { join_radius_m } : {}),
      },
    });
    await selectProvider(created.id);
    await setAppRole("provider");
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.detail, fields };
    }
    return { error: "Something went wrong. Try again.", fields };
  }

  redirect(await providerHomePath());
}

export async function manageBusinessAction(id: string): Promise<void> {
  await selectProvider(id);
  redirect(await providerHomePath());
}

export async function selectBusinessAction(id: string): Promise<void> {
  await selectProvider(id);
  redirect("/dashboard");
}

export async function openQueueForServiceAction(
  serviceId: string,
): Promise<void> {
  await selectService(serviceId);
  redirect(`/dashboard/services/${serviceId}/queue`);
}

/** Persist last-opened queue line (Server Action only — not for RSC render). */
export async function rememberActiveServiceAction(
  serviceId: string,
): Promise<void> {
  await selectService(serviceId);
}
