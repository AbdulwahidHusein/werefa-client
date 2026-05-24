export type QueueAheadPreview = {
  ticket_number: number;
  position: number;
  is_vip: boolean;
  is_you: boolean;
};

export type TicketQueueSnapshot = {
  service_item_id: string;
  service_name: string;
  provider_id: string;
  biz_name: string;
  profile_image_url?: string | null;
  avg_duration_minutes: number;
  waiting_count: number;
  serving_count: number;
  vip_waiting_count: number;
  your_ticket_id: string;
  your_ticket_number: number;
  your_position?: number | null;
  people_ahead: number;
  estimated_wait_minutes?: number | null;
  pace_note: string;
  ahead_preview: QueueAheadPreview[];
};
