export type ServiceLinePreview = {
  service_item_id: string;
  service_name: string;
  provider_id: string;
  biz_name: string;
  profile_image_url?: string | null;
  avg_duration_minutes: number;
  waiting_count: number;
  serving_count: number;
  vip_waiting_count: number;
  estimated_wait_minutes?: number | null;
  pace_note: string;
  is_accepting_remote_joins: boolean;
};
