"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import { requireMe } from "@/lib/dal";

export type ImageUploadState = { error?: string; success?: boolean } | undefined;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function uploadProviderProfileImageAction(
  providerId: string,
  _prev: ImageUploadState,
  formData: FormData,
): Promise<ImageUploadState> {
  await requireMe();
  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "Please choose an image." };
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be 5 MB or smaller." };
  if (!IMAGE_TYPES.includes(file.type)) return { error: "Use JPEG, PNG, or WebP." };

  const body = new FormData();
  body.append("file", file);

  try {
    await apiFetch(`/providers/${providerId}/profile-image`, { method: "POST", body });
    revalidatePath("/dashboard/settings/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail || "Upload failed." };
    return { error: "Upload failed. Try again." };
  }
}

export type ProfileUpdateState = { error?: string; success?: boolean } | undefined;

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function parseOptionalNumber(raw: string): number | null | undefined {
  const t = raw.trim();
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export async function updateProviderAction(
  providerId: string,
  _prev: ProfileUpdateState,
  formData: FormData,
): Promise<ProfileUpdateState> {
  await requireMe();

  const biz_name = str(formData, "biz_name");
  const category = str(formData, "category") || null;
  const description = str(formData, "description") || null;
  const city = str(formData, "city") || null;
  const address = str(formData, "address") || null;
  const phone = str(formData, "phone") || null;
  const show_phone_public = formData.get("show_phone_public") === "true";
  const website = str(formData, "website") || null;
  const biz_email = str(formData, "biz_email") || null;
  const latRaw = str(formData, "latitude");
  const lngRaw = str(formData, "longitude");
  const radiusRaw = str(formData, "join_radius_m");
  const is_open = formData.get("is_open") === "true";

  if (biz_name.length < 2) return { error: "Business name is required (at least 2 characters)." };

  const latitude = parseOptionalNumber(latRaw);
  const longitude = parseOptionalNumber(lngRaw);
  if (latitude === null || longitude === null) return { error: "Latitude and longitude must be valid numbers." };
  if ((latitude === undefined) !== (longitude === undefined)) return { error: "Set both latitude and longitude, or neither." };

  const join_radius_m = parseOptionalNumber(radiusRaw);
  if (join_radius_m === null || (join_radius_m !== undefined && join_radius_m < 1)) {
    return { error: "Join radius must be a positive number." };
  }

  try {
    await apiFetch(`/providers/${providerId}`, {
      method: "PATCH",
      body: {
        biz_name,
        category,
        description,
        city,
        address,
        phone,
        show_phone_public,
        website,
        biz_email,
        is_open,
        latitude: latitude === undefined ? null : latitude,
        longitude: longitude === undefined ? null : longitude,
        join_radius_m: join_radius_m === undefined ? null : join_radius_m,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings/profile");
    revalidatePath("/dashboard/services");

    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail };
    return { error: "Something went wrong. Try again." };
  }
}
