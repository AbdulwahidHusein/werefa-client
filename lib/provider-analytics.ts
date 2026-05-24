/** Provider analytics API shape (hand-written until OpenAPI regen). */

export type TimeBucket = {
  label: string;
  value: number;
  secondary?: number;
  hour?: number | null;
  is_estimated?: boolean;
};

export type ProviderAnalyticsSummary = {
  page_views: number;
  joins: number;
  completions: number;
  cancellations: number;
  no_shows: number;
  abandonments: number;
  queue_clears: number;
  lost_demand_total: number;
  browse_without_join: number;
  customer_left_voluntarily: number;
  /** @deprecated use lost_demand_total — joined then left */
  lost_join_opportunities: number;
  avg_wait_minutes: number | null;
  avg_serve_minutes: number | null;
  min_wait_minutes: number | null;
  max_wait_minutes: number | null;
  min_serve_minutes: number | null;
  max_serve_minutes: number | null;
  conversion_rate_pct: number | null;
  customers_helped: number;
  leave_rate_pct: number | null;
};

export type AnalyticsHighlight = {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: "good" | "caution" | "neutral" | "bad";
};

export type AnalyticsPeakSlot = {
  kind: string;
  direction: string;
  label: string;
  metric_label: string;
  metric_value: string;
  explanation: string;
};

export type AnalyticsStreaks = {
  active_days: number;
  quiet_days: number;
  current_busy_streak_days: number;
  longest_busy_streak_days: number;
  times_queue_cleared: number;
  busiest_day_name: string | null;
  quietest_day_name: string | null;
};

export type AnalyticsComparison = {
  label: string;
  period_a_label: string;
  period_a_value: string;
  period_b_label: string;
  period_b_value: string;
  verdict: string;
};

export type ProviderAnalyticsServiceLine = {
  service_item_id: string;
  service_name: string;
  joins: number;
  completed: number;
  cancelled: number;
  no_show: number;
};

export type ProviderAnalytics = {
  provider_id: string;
  service_item_id: string | null;
  range_days: number;
  since: string | null;
  until: string | null;
  data_quality: "rich" | "sparse" | "empty";
  uses_estimates: boolean;
  narrative_summary: string;
  summary: ProviderAnalyticsSummary;
  hourly_activity: TimeBucket[];
  hourly_leaves: TimeBucket[];
  daily_trend: TimeBucket[];
  daily_leaves: TimeBucket[];
  weekday_activity: TimeBucket[];
  weekday_leaves: TimeBucket[];
  ticket_outcomes: Record<string, number>;
  join_sources: Record<string, number>;
  service_lines: ProviderAnalyticsServiceLine[];
  insights: string[];
  highlights: AnalyticsHighlight[];
  peak_slots: AnalyticsPeakSlot[];
  streaks: AnalyticsStreaks;
  comparisons: AnalyticsComparison[];
  peak_hour: number | null;
  quiet_hour: number | null;
  peak_leave_hour: number | null;
};
