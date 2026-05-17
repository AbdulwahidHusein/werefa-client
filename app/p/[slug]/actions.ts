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
  const inviteToken = formData.get("invite_token");
  if (code.length > 6) {
    return { error: "Access code must be 6 characters or fewer.", code };
  }

  try {
    await apiFetch<QueueEntryPublic>(`/service-items/${serviceId}/join`, {
      method: "POST",
      body: { 
        access_code: code === "" ? null : code,
        invite_token: inviteToken ? String(inviteToken) : null 
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
