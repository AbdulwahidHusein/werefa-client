"use client";

import { useServiceLinePreview } from "@/hooks/useServiceLinePreview";
import { TicketQueueInsights } from "@/components/TicketQueueInsights";
import type { TicketQueueSnapshot } from "@/lib/ticket-snapshot";

function toSnapshot(
  p: import("@/lib/service-line-preview").ServiceLinePreview,
): TicketQueueSnapshot {
  return {
    service_item_id: p.service_item_id,
    service_name: p.service_name,
    provider_id: p.provider_id,
    biz_name: p.biz_name,
    profile_image_url: p.profile_image_url,
    avg_duration_minutes: p.avg_duration_minutes,
    waiting_count: p.waiting_count,
    serving_count: p.serving_count,
    vip_waiting_count: p.vip_waiting_count,
    your_ticket_id: "",
    your_ticket_number: 0,
    your_position: null,
    people_ahead: p.waiting_count,
    estimated_wait_minutes: p.estimated_wait_minutes,
    pace_note: p.pace_note,
    ahead_preview: [],
  };
}

export function ServiceLinePreviewCard({
  serviceItemId,
  enabled = true,
}: {
  serviceItemId: string;
  enabled?: boolean;
}) {
  const { preview, loading, error } = useServiceLinePreview(serviceItemId, { enabled });

  if (error && !preview) {
    return (
      <p className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
        {error}
      </p>
    );
  }

  return (
    <TicketQueueInsights
      snapshot={preview ? toSnapshot(preview) : null}
      status="preview"
      loading={loading && !preview}
      variant="preview"
      acceptingRemoteJoins={preview?.is_accepting_remote_joins}
    />
  );
}
