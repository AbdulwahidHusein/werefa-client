"use server";

import { redirect } from "next/navigation";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { requireMe } from "@/lib/dal";

type QueueEntryPublic = components["schemas"]["QueueEntryPublic"];

export type JoinState = { error?: string; code?: string } | undefined;

export async function joinQueueAction(
  serviceId: string,
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  await requireMe();
  const code = String(formData.get("access_code") ?? "").trim();
  const vipCode = String(formData.get("vip_code") ?? "").trim();
  const inviteToken = formData.get("invite_token");
  const latRaw = String(formData.get("latitude") ?? "").trim();
  const lngRaw = String(formData.get("longitude") ?? "").trim();
  if (code.length > 6) {
    return { error: "Access code must be 6 characters or fewer.", code };
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  if (latRaw || lngRaw) {
    if (!latRaw || !lngRaw) {
      return { error: "Location is incomplete. Try again.", code };
    }
    latitude = Number(latRaw);
    longitude = Number(lngRaw);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { error: "Invalid location.", code };
    }
  }

  try {
    await apiFetch<QueueEntryPublic>(`/service-items/${serviceId}/join`, {
      method: "POST",
      body: {
        access_code: code === "" ? null : code,
        vip_code: vipCode === "" ? null : vipCode,
        invite_token: inviteToken ? String(inviteToken) : null,
        latitude,
        longitude,
      },
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.detail, code };
    }
    return { error: "Something went wrong. Try again.", code };
  }

  redirect("/me/tickets");
}
