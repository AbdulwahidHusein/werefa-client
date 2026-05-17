"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiRequestError } from "@/lib/api/server";

export async function updateNotificationPrefsAction(notificationPrefs: string[]) {
  try {
    await apiFetch("/users/me/notifications", {
      method: "PATCH",
      body: {
        notification_prefs: notificationPrefs,
      },
    });
    revalidatePath("/account");
    revalidatePath("/account/notifications");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { ok: false, error: err.detail };
    }
    return { ok: false, error: "Failed to update notification preferences." };
  }
}
