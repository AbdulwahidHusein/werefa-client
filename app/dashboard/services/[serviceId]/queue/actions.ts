"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";

type QueueEntry = components["schemas"]["QueueEntryPublic"];

export type QueueActionState =
  | { ok: true; message: string }
  | { error: string }
  | undefined;

export async function callNextAction(
  serviceId: string,
  _prev: QueueActionState,
  _fd: FormData,
): Promise<QueueActionState> {
  try {
    const next = await apiFetch<QueueEntry | null>(
      `/service-items/${serviceId}/call-next`,
      { method: "POST" },
    );
    revalidatePath(`/dashboard/services/${serviceId}/queue`);
    if (!next) return { ok: true, message: "Line is empty." };
    const who = next.guest_name ? ` — ${next.guest_name}` : "";
    return { ok: true, message: `Now serving #${next.ticket_number}${who}.` };
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail };
    return { error: "Could not call next. Try again." };
  }
}

async function patchStatus(
  serviceId: string,
  ticketId: string,
  status: "completed" | "no_show",
): Promise<QueueActionState> {
  try {
    const updated = await apiFetch<QueueEntry>(
      `/service-items/${serviceId}/tickets/${ticketId}/status`,
      { method: "PATCH", body: { status } },
    );
    revalidatePath(`/dashboard/services/${serviceId}/queue`);
    const label = status === "completed" ? "Completed" : "Marked no-show";
    return { ok: true, message: `${label} #${updated.ticket_number}.` };
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail };
    return { error: "Could not update ticket. Try again." };
  }
}

export async function completeTicketAction(
  serviceId: string,
  ticketId: string,
  _prev: QueueActionState,
  _fd: FormData,
): Promise<QueueActionState> {
  return patchStatus(serviceId, ticketId, "completed");
}

export async function noShowTicketAction(
  serviceId: string,
  ticketId: string,
  _prev: QueueActionState,
  _fd: FormData,
): Promise<QueueActionState> {
  return patchStatus(serviceId, ticketId, "no_show");
}

export async function walkInAction(
  serviceId: string,
  _prev: QueueActionState,
  formData: FormData,
): Promise<QueueActionState> {
  const guest_name = String(formData.get("guest_name") ?? "").trim();
  const is_vip = formData.get("is_vip") === "true";
  if (guest_name.length > 100) {
    return { error: "Name must be 100 characters or fewer." };
  }
  try {
    const t = await apiFetch<QueueEntry>(
      `/service-items/${serviceId}/walk-in`,
      {
        method: "POST",
        body: { guest_name: guest_name === "" ? null : guest_name, is_vip },
      },
    );
    revalidatePath(`/dashboard/services/${serviceId}/queue`);
    const who = guest_name ? ` — ${guest_name}` : "";
    const vipLabel = is_vip ? " [VIP]" : "";
    return { ok: true, message: `Added #${t.ticket_number}${who}${vipLabel}.` };
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail };
    return { error: "Could not add walk-in. Try again." };
  }
}

export async function setTicketPriorityAction(
  serviceId: string,
  ticketId: string,
  priority: number,
): Promise<QueueActionState> {
  try {
    await apiFetch<QueueEntry>(
      `/service-items/${serviceId}/tickets/${ticketId}/priority`,
      { method: "PATCH", body: { priority } },
    );
    revalidatePath(`/dashboard/services/${serviceId}/queue`);
    return { ok: true, message: priority > 0 ? "Ticket upgraded to VIP." : "VIP removed from ticket." };
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail };
    return { error: "Could not update ticket priority. Try again." };
  }
}

export async function createBroadcastAction(
  providerId: string,
  body: string,
  severity: "info" | "warning" | "critical",
  selectedServiceIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  if (!body || body.trim().length === 0) {
    return { ok: false, error: "Announcement message is required." };
  }
  if (body.length > 500) {
    return { ok: false, error: "Message must be 500 characters or fewer." };
  }

  try {
    const isProviderWide = selectedServiceIds.length === 0 || selectedServiceIds.includes("ALL");

    if (isProviderWide) {
      await apiFetch(`/providers/${providerId}/broadcasts`, {
        method: "POST",
        body: {
          body,
          severity,
          service_item_id: null,
          idempotency_key: crypto.randomUUID(),
        },
      });
    } else {
      await Promise.all(
        selectedServiceIds.map((id) =>
          apiFetch(`/providers/${providerId}/broadcasts`, {
            method: "POST",
            body: {
              body,
              severity,
              service_item_id: id,
              idempotency_key: crypto.randomUUID(),
            },
          })
        )
      );
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof ApiRequestError) return { ok: false, error: err.detail };
    return { ok: false, error: "Could not send announcement. Try again." };
  }
}

export async function pauseProviderQueueAction(providerId: string) {
  try {
    await apiFetch(`/providers/${providerId}/pause-queue`, {
      method: "POST",
    });
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiRequestError) return { ok: false, error: err.detail };
    return { ok: false, error: "Failed to pause queue. Try again." };
  }
}

export async function resumeProviderQueueAction(providerId: string) {
  try {
    await apiFetch(`/providers/${providerId}/resume-queue`, {
      method: "POST",
    });
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiRequestError) return { ok: false, error: err.detail };
    return { ok: false, error: "Failed to resume queue. Try again." };
  }
}

export async function getAccessCodeAction(providerId: string) {
  try {
    const res = await apiFetch<{ access_code: string | null }>(
      `/providers/${providerId}/access-code`,
      { method: "GET" }
    );
    return { ok: true, accessCode: res.access_code };
  } catch (err) {
    if (err instanceof ApiRequestError) return { ok: false, error: err.detail };
    return { ok: false, error: "Failed to load access code." };
  }
}

export async function rotateAccessCodeAction(providerId: string, newCode: string) {
  try {
    await apiFetch(`/providers/${providerId}`, {
      method: "PATCH",
      body: {
        access_code: newCode,
      },
    });
    revalidatePath(`/dashboard/services/[serviceId]/queue`);
    return { ok: true, accessCode: newCode };
  } catch (err) {
    if (err instanceof ApiRequestError) return { ok: false, error: err.detail };
    return { ok: false, error: "Failed to rotate access code." };
  }
}

export async function recallLastTicketAction(
  serviceId: string,
  _prev: QueueActionState,
  _fd: FormData,
): Promise<QueueActionState> {
  try {
    const t = await apiFetch<QueueEntry>(
      `/service-items/${serviceId}/recall`,
      { method: "POST" }
    );
    revalidatePath(`/dashboard/services/${serviceId}/queue`);
    const who = t.guest_name ? ` — ${t.guest_name}` : "";
    return { ok: true, message: `Recalled #${t.ticket_number}${who}.` };
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail };
    return { error: "Could not recall last completed ticket. Try again." };
  }
}

export async function syncKioskBatchAction(
  serviceId: string,
  _prev: QueueActionState,
  _fd: FormData,
): Promise<QueueActionState> {
  try {
    const walk_ins = [
      { guest_name: `Kiosk User ${Math.floor(Math.random() * 1000)}` },
      { guest_name: `Kiosk User ${Math.floor(Math.random() * 1000)}` },
      { guest_name: `Kiosk User ${Math.floor(Math.random() * 1000)}` }
    ];
    
    const res = await apiFetch<{ tickets: QueueEntry[] }>(
      `/service-items/${serviceId}/kiosk-sync-batch`,
      { 
        method: "POST",
        body: {
          idempotency_key: crypto.randomUUID(),
          walk_ins
        }
      }
    );
    revalidatePath(`/dashboard/services/${serviceId}/queue`);
    return { ok: true, message: `Successfully synced ${res.tickets.length} walk-ins from kiosk.` };
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.detail };
    return { error: "Could not sync kiosk batch. Try again." };
  }
}

