import { api } from "@/lib/api/client";

export type DemandEventType =
  | "join_remote"
  | "join_walk_in"
  | "join_qr"
  | "join_walk_in_batch"
  | "service_view"
  | "queue_abandon";

type DemandEventBody = {
  event_type: DemandEventType;
  provider_id?: string;
  service_item_id?: string;
  client_ref?: string;
  payload?: Record<string, unknown>;
};

/** Fire-and-forget funnel event (anonymous OK). */
export function trackDemandEvent(body: DemandEventBody): void {
  void api<{ status: string }>("/analytics/demand-events", {
    method: "POST",
    body,
  }).catch(() => {
    /* analytics must not block UX */
  });
}
