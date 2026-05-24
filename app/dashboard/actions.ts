"use server";

import { redirect } from "next/navigation";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { getMe } from "@/lib/dal";
import { providerHomePath } from "@/lib/provider-routes";
import { selectProvider, selectService, setAppRole } from "@/lib/session";

export type SetupFields = {
  biz_name?: string;
  slug?: string;
  category?: string;
  description?: string;
  city?: string;
  address?: string;
  phone?: string;
  show_phone_public?: string;
  biz_email?: string;
  website?: string;
  access_code?: string;
  is_private?: string;
  latitude?: string;
  longitude?: string;
  join_radius_m?: string;
};

export type SetupState =
  | {
      error?: string;
      fields?: SetupFields;
    }
  | undefined;

type ProviderPublic = components["schemas"]["ProviderPublic"];

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseOptionalNumber(raw: string): number | null | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

const ACCESS_CODE_RE = /^[A-Z0-9]{4,6}$/;

export async function setupBusinessAction(
  _prev: SetupState,
  formData: FormData,
): Promise<SetupState> {
  const biz_name = str(formData, "biz_name");
  const slug = str(formData, "slug").toLowerCase();
  const category = str(formData, "category") || null;
  const description = str(formData, "description") || null;
  const city = str(formData, "city") || null;
  const address = str(formData, "address") || null;
  const phone = str(formData, "phone") || null;
  const show_phone_public = formData.get("show_phone_public") === "true";
  const biz_email = str(formData, "biz_email") || null;
  const website = str(formData, "website") || null;
  const access_code_raw = str(formData, "access_code").toUpperCase();
  const is_private = formData.get("is_private") === "true";
  const latRaw = str(formData, "latitude");
  const lngRaw = str(formData, "longitude");
  const radiusRaw = str(formData, "join_radius_m");

  const fields: SetupFields = {
    biz_name,
    slug,
    category: category ?? "",
    description: description ?? "",
    city: city ?? "",
    address: address ?? "",
    phone: phone ?? "",
    show_phone_public: String(show_phone_public),
    biz_email: biz_email ?? "",
    website: website ?? "",
    access_code: access_code_raw,
    is_private: String(is_private),
    latitude: latRaw,
    longitude: lngRaw,
    join_radius_m: radiusRaw,
  };

  if (biz_name.length < 2) {
    return { error: "Business name is required (at least 2 characters).", fields };
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
    return { error: "Latitude and longitude must be valid numbers.", fields };
  }
  if ((latitude === undefined) !== (longitude === undefined)) {
    return { error: "Set both latitude and longitude, or neither.", fields };
  }

  const join_radius_m = parseOptionalNumber(radiusRaw);
  if (join_radius_m === null || (join_radius_m !== undefined && join_radius_m < 1)) {
    return { error: "Join radius must be a positive number.", fields };
  }

  const access_code =
    access_code_raw === "" ? null : access_code_raw;
  if (access_code !== null && !ACCESS_CODE_RE.test(access_code)) {
    return {
      error: "Access code must be 4–6 uppercase letters or numbers.",
      fields,
    };
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
        category,
        description,
        city,
        address,
        phone,
        show_phone_public,
        biz_email,
        website,
        is_private,
        ...(access_code !== null ? { access_code } : {}),
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
