"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { requireMe } from "@/lib/dal";

type QueueEntryPublic = components["schemas"]["QueueEntryPublic"];

export type CancelState = { error?: string } | undefined;

export async function cancelTicketAction(
  serviceId: string,
  ticketId: string,
  _prev: CancelState,
  _fd: FormData,
): Promise<CancelState> {
  await requireMe();
  try {
    await apiFetch<QueueEntryPublic>(
      `/service-items/${serviceId}/tickets/${ticketId}`,
      { method: "DELETE" },
    );
    revalidatePath("/me/tickets");
    revalidatePath(`/me/tickets/${ticketId}`);
    redirect("/me/tickets?left=1");
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail };
    return { error: "Could not cancel. Try again." };
  }
}
