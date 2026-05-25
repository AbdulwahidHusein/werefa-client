"use server";

import { redirect } from "next/navigation";

import { friendlyJoinError } from "@/lib/api-errors";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { requireMe } from "@/lib/dal";
import { rethrowNavigationError } from "@/lib/rethrow-navigation";

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
  const docCount = Number(formData.get("join_doc_count") ?? "0");
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

  const useMultipart = Number.isFinite(docCount) && docCount > 0;

  let destination = "/me/tickets";

  try {
    let ticket: QueueEntryPublic & { status?: string };

    if (useMultipart) {
      const body = new FormData();
      if (code) body.set("access_code", code);
      if (vipCode) body.set("vip_code", vipCode);
      if (inviteToken) body.set("invite_token", String(inviteToken));
      if (latitude != null) body.set("latitude", String(latitude));
      if (longitude != null) body.set("longitude", String(longitude));
      for (let i = 0; i < docCount; i++) {
        const file = formData.get(`document_${i}`);
        if (!(file instanceof File) || file.size === 0) {
          return { error: "Please upload all required documents.", code };
        }
        body.append("documents", file);
      }
      ticket = await apiFetch<QueueEntryPublic & { status?: string }>(
        `/service-items/${serviceId}/join-with-files`,
        { method: "POST", body },
      );
    } else {
      ticket = await apiFetch<QueueEntryPublic & { status?: string }>(
        `/service-items/${serviceId}/join`,
        {
          method: "POST",
          body: {
            access_code: code === "" ? null : code,
            vip_code: vipCode === "" ? null : vipCode,
            invite_token: inviteToken ? String(inviteToken) : null,
            latitude,
            longitude,
          },
        },
      );
    }
    destination =
      ticket.status === "pending_approval"
        ? `/me/tickets/${ticket.id}?pending=1`
        : `/me/tickets/${ticket.id}`;
  } catch (err) {
    rethrowNavigationError(err);
    if (err instanceof ApiRequestError) {
      return { error: friendlyJoinError(err.detail, err.status), code };
    }
    const offline =
      err instanceof TypeError ||
      (err instanceof Error &&
        /fetch|network|ECONNREFUSED|ENOTFOUND/i.test(err.message));
    return {
      error: offline
        ? "Could not reach the server. Check your connection and try again."
        : "Something went wrong. Try again.",
      code,
    };
  }

  redirect(destination);
}
