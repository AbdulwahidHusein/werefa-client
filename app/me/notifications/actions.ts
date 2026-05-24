"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiRequestError } from "@/lib/api/server";

export async function markAsReadAction(notificationId: string) {
  try {
    await apiFetch(`/me/notifications/${notificationId}/read`, {
      method: "POST",
    });
    revalidatePath("/me/notifications");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { ok: false, error: err.detail };
    }
    return { ok: false, error: "Failed to mark notification as read." };
  }
}

export async function markAllAsReadAction(unreadIds: string[]) {
  try {
    await Promise.all(
      unreadIds.map((id) =>
        apiFetch(`/me/notifications/${id}/read`, {
          method: "POST",
        })
      )
    );
    revalidatePath("/me/notifications");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Failed to mark all as read." };
  }
}
