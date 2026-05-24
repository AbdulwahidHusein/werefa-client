"use client";

import { useEffect, useRef } from "react";

import { trackDemandEvent } from "@/lib/analytics";

export function TrackDemandEvent({
  eventType,
  providerId,
  serviceItemId,
  clientRef,
}: {
  eventType: "service_view";
  providerId: string;
  serviceItemId?: string;
  clientRef?: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackDemandEvent({
      event_type: eventType,
      provider_id: providerId,
      service_item_id: serviceItemId,
      client_ref: clientRef,
    });
  }, [eventType, providerId, serviceItemId, clientRef]);

  return null;
}
