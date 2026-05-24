"use client";

import { useState, useTransition } from "react";
import {
  Activity,
  Clock,
  Flame,
  Loader2,
  TrendingDown,
  Users,
  Eye,
  Zap,
} from "lucide-react";

import { fetchProviderAnalyticsAction } from "@/app/dashboard/analytics/actions";
import type {
  AnalyticsHighlight,
  AnalyticsPeakSlot,
  ProviderAnalytics,
  TimeBucket,
} from "@/lib/provider-analytics";

function maxOf(buckets: TimeBucket[]): number {
  return Math.max(1, ...buckets.map((b) => Math.max(b.value, b.secondary ?? 0)));
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function BarChart({
  buckets,
  secondaryKey,
  primaryClass = "bg-accent",
  secondaryClass = "bg-emerald-400/80",
  height = 160,
}: {
  buckets: TimeBucket[];
  secondaryKey?: "secondary";
  primaryClass?: string;
  secondaryClass?: string;
  height?: number;
}) {
  const max = maxOf(buckets);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {buckets.map((b, i) => {
        const primaryH = (b.value / max) * (height - 24);
        const secH = secondaryKey
          ? ((b.secondary ?? 0) / max) * (height - 24)
          : 0;
        return (
          <div
            key={`${b.label}-${i}`}
            className="flex flex-1 flex-col items-center justify-end gap-0.5"
            title={`${b.label}: ${b.value}${b.is_estimated ? " (est.)" : ""}`}
          >
            <div className="flex w-full max-w-[28px] items-end justify-center gap-px">
              {secondaryKey ? (
                <div
                  className={`w-1.5 rounded-t ${secondaryClass}`}
                  style={{ height: Math.max(2, secH) }}
                />
              ) : null}
              <div
                className={`w-2 rounded-t ${
                  b.is_estimated ? `${primaryClass} opacity-40` : primaryClass
                }`}
                style={{ height: Math.max(2, primaryH) }}
              />
            </div>
            <span className="truncate text-[8px] text-muted max-w-full px-0.5">
              {b.hour != null ? `${b.hour}` : b.label.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LineAreaChart({ buckets }: { buckets: TimeBucket[] }) {
  const max = maxOf(buckets);
  const w = 500;
  const h = 180;
  const pad = 16;
  const n = buckets.length;
  const dw = n > 1 ? (w - pad * 2) / (n - 1) : 0;
  const pts = buckets.map((b, i) => ({
    x: pad + i * dw,
    y: h - pad - (b.value / max) * (h - pad * 2),
  }));
  const path =
    pts.length === 0
      ? ""
      : pts.reduce((acc, p, i) => {
          if (i === 0) return `M ${p.x} ${p.y}`;
          return `${acc} L ${p.x} ${p.y}`;
        }, "");
  const area =
    pts.length === 0
      ? ""
      : `${path} L ${pts[pts.length - 1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[180px] w-full" preserveAspectRatio="none">
      <path d={area} fill="currentColor" className="text-accent/10" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" />
    </svg>
  );
}

const highlightTone: Record<string, string> = {
  good: "border-emerald-200 bg-emerald-50/80",
  caution: "border-amber-200 bg-amber-50/80",
  bad: "border-rose-200 bg-rose-50/80",
  neutral: "border-border bg-surface",
};

export function ProviderAnalyticsDashboard({
  providerId,
  services,
  initialData,
}: {
  providerId: string;
  services: { id: string; name: string }[];
  initialData: ProviderAnalytics;
}) {
  const [data, setData] = useState(initialData);
  const [days, setDays] = useState<"7" | "30" | "90">("30");
  const [serviceId, setServiceId] = useState<string>("");
  const [pending, startTransition] = useTransition();

  function refresh(opts: { days?: "7" | "30" | "90"; serviceItemId?: string }) {
    const d = opts.days ?? days;
    const sid = opts.serviceItemId ?? serviceId;
    startTransition(async () => {
      const res = await fetchProviderAnalyticsAction(providerId, {
        days: parseInt(d, 10),
        serviceItemId: sid || null,
      });
      if (res.ok) setData(res.data);
    });
  }

  const s = data.summary;
  const st = data.streaks;
  const qualityLabel =
    data.data_quality === "rich"
      ? "Good data"
      : data.data_quality === "sparse"
        ? "Building history"
        : "No activity yet";

  return (
    <div className="space-y-8 pb-10">
      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["7", "30", "90"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDays(d);
                refresh({ days: d });
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                days === d
                  ? "bg-accent text-white"
                  : "bg-background text-muted hover:text-foreground"
              }`}
            >
              Last {d} days
            </button>
          ))}
        </div>
        {services.length > 0 ? (
          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              refresh({ serviceItemId: e.target.value });
            }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All service lines</option>
            {services.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name}
              </option>
            ))}
          </select>
        ) : null}
        <div className="flex items-center gap-2 text-xs text-muted">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              data.data_quality === "rich"
                ? "bg-emerald-100 text-emerald-800"
                : data.data_quality === "sparse"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {qualityLabel}
          </span>
        </div>
      </div>

      {/* Plain-English summary */}
      {data.narrative_summary ? (
        <section className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/8 to-transparent p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-accent">
            Your story in plain words
          </p>
          <p className="mt-2 text-base leading-relaxed text-foreground sm:text-lg">
            {data.narrative_summary}
          </p>
        </section>
      ) : null}

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={Users} label="People joined" value={s.joins} tone="emerald" />
        <KpiCard
          icon={Activity}
          label="Successfully served"
          value={s.customers_helped}
          tone="blue"
        />
        <KpiCard icon={Eye} label="Page views" value={s.page_views} tone="zinc" />
        <KpiCard
          icon={TrendingDown}
          label="Lost demand"
          value={s.lost_demand_total}
          tone="amber"
          sub="joined then left"
        />
      </div>

      {/* Lost demand — joined then left */}
      <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
        <h2 className="text-sm font-semibold text-rose-950">Lost demand</h2>
        <p className="mt-0.5 text-xs text-rose-900/80">
          Customers who joined your queue but left without being served — when and how many
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock
            label="Total lost demand"
            value={s.lost_demand_total}
            unit="people"
            hint="Cancelled + no-show (joined but did not finish)"
            caution
          />
          <StatBlock
            label="Left on their own"
            value={s.customer_left_voluntarily}
            unit="people"
            hint='Used "Leave queue" in the app'
            caution
          />
          <StatBlock
            label="Cancelled (all)"
            value={s.cancellations}
            unit="tickets"
            hint="Includes customer leave + staff cancel + queue clear"
          />
          <StatBlock
            label="No-shows"
            value={s.no_shows}
            unit="people"
            hint="Marked no-show by staff"
            caution
          />
        </div>
        {s.browse_without_join > 0 ? (
          <p className="mt-3 text-xs text-muted">
            Separately, {s.browse_without_join} people viewed your page without joining
            (browsing only — not counted as lost demand).
          </p>
        ) : null}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="Lost demand by hour"
            hint="When customers leave after joining"
          >
            <BarChart
              buckets={data.hourly_leaves}
              primaryClass="bg-rose-500"
              height={140}
            />
            {data.peak_leave_hour != null ? (
              <p className="mt-2 text-xs text-rose-900/90">
                Worst hour: {formatHour(data.peak_leave_hour)}
              </p>
            ) : null}
          </ChartCard>
          <ChartCard title="Lost demand by weekday" hint="Which days lose the most customers">
            <BarChart
              buckets={data.weekday_leaves}
              primaryClass="bg-rose-500"
              height={140}
            />
          </ChartCard>
          <ChartCard title="Lost demand per day" hint="Last 14 days">
            <BarChart
              buckets={data.daily_leaves}
              primaryClass="bg-rose-500"
              height={140}
            />
          </ChartCard>
          <ChartCard title="Joins vs lost demand per day" hint="Blue trend = joins · compare bars">
            <LineAreaChart buckets={data.daily_trend} />
          </ChartCard>
        </div>
      </section>

      {/* Highlight cards */}
      {data.highlights.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Key facts at a glance</h2>
          <p className="mt-0.5 text-xs text-muted">
            The most important patterns  
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.highlights.map((h) => (
              <HighlightCard key={h.id} highlight={h} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Wait & serve stats */}
      <section className="rounded-2xl border border-border bg-background p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-muted" />
          How long customers wait & how long you serve them
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Based on completed visits only — average, shortest, and longest
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock
            label="Average wait"
            value={s.avg_wait_minutes}
            unit="min"
            hint="From join to done"
          />
          <StatBlock
            label="Shortest wait"
            value={s.min_wait_minutes}
            unit="min"
            hint="Your best speed"
            good
          />
          <StatBlock
            label="Longest wait"
            value={s.max_wait_minutes}
            unit="min"
            hint="Slowest visit"
            caution
          />
          <StatBlock
            label="Average serve time"
            value={s.avg_serve_minutes}
            unit="min"
            hint="While you help them"
          />
        </div>
        {(s.min_serve_minutes != null || s.max_serve_minutes != null) && (
          <p className="mt-3 text-xs text-muted">
            Serve time range: {s.min_serve_minutes ?? "—"}–{s.max_serve_minutes ?? "—"} min
            {s.leave_rate_pct != null
              ? ` · ${s.leave_rate_pct}% of joins left without finishing`
              : ""}
          </p>
        )}
      </section>

      {/* Best & worst times */}
      {data.peak_slots.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Best & worst times</h2>
          <p className="mt-0.5 text-xs text-muted">
            When to expect crowds, quiet periods, and people leaving
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.peak_slots.map((slot, i) => (
              <PeakSlotCard key={`${slot.kind}-${slot.direction}-${i}`} slot={slot} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Streaks & operations */}
      <section className="rounded-2xl border border-border bg-background p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Flame className="h-4 w-4 text-amber-500" />
          Activity streaks & queue resets
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StreakStat
            label="Days with customers"
            value={st.active_days}
            detail={`${st.quiet_days} quiet day(s) with zero joins`}
          />
          <StreakStat
            label="Longest busy streak"
            value={st.longest_busy_streak_days}
            detail="consecutive days with at least one join"
            suffix=" days"
          />
          <StreakStat
            label="Current busy run"
            value={st.current_busy_streak_days}
            detail="days in a row ending on your last active day"
            suffix=" days"
          />
          <StreakStat
            label="Queue cleared (end of day)"
            value={st.times_queue_cleared}
            detail="times you reset the line"
            suffix="×"
          />
        </div>
        {(st.busiest_day_name || st.quietest_day_name) && (
          <p className="mt-4 rounded-xl bg-surface px-3 py-2 text-sm text-muted">
            {st.busiest_day_name ? (
              <>
                <strong className="text-foreground">{st.busiest_day_name}</strong> is usually
                your busiest weekday
              </>
            ) : null}
            {st.busiest_day_name && st.quietest_day_name ? " · " : null}
            {st.quietest_day_name && st.quietest_day_name !== st.busiest_day_name ? (
              <>
                <strong className="text-foreground">{st.quietest_day_name}</strong> is
                usually the slowest
              </>
            ) : null}
          </p>
        )}
      </section>

      {/* Comparisons */}
      {data.comparisons.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Comparisons</h2>
          <div className="mt-3 space-y-3">
            {data.comparisons.map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-border bg-background p-4"
              >
                <p className="text-xs font-semibold uppercase text-muted">{c.label}</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-4">
                  <div>
                    <span className="text-2xl font-bold">{c.period_a_value}</span>
                    <span className="ml-1 text-xs text-muted">{c.period_a_label}</span>
                  </div>
                  <span className="text-muted">vs</span>
                  <div>
                    <span className="text-2xl font-bold">{c.period_b_value}</span>
                    <span className="ml-1 text-xs text-muted">{c.period_b_label}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-foreground">{c.verdict}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="When people join (by hour)"
          hint="Taller bar = more joins · green = completed that hour"
        >
          <BarChart buckets={data.hourly_activity} secondaryKey="secondary" />
          {data.peak_hour != null ? (
            <p className="mt-2 text-xs text-muted">
              Busiest: {formatHour(data.peak_hour)}
              {data.quiet_hour != null && data.quiet_hour !== data.peak_hour
                ? ` · Quietest: ${formatHour(data.quiet_hour)}`
                : ""}
            </p>
          ) : null}
        </ChartCard>

        <ChartCard title="Joins per day" hint="Last 14 days in selected window">
          <LineAreaChart buckets={data.daily_trend} />
        </ChartCard>

        <ChartCard title="Joins by weekday" hint="Which day of the week is strongest">
          <BarChart buckets={data.weekday_activity} height={140} />
        </ChartCard>

        <ChartCard title="Customer journey" hint="From view to done">
          <div className="space-y-3">
            <FunnelRow label="Viewed your page" value={s.page_views} max={s.page_views || 1} color="bg-blue-500" />
            <FunnelRow label="Joined the queue" value={s.joins} max={s.page_views || 1} color="bg-emerald-500" />
            <FunnelRow label="Finished successfully" value={s.completions} max={s.joins || 1} color="bg-accent" />
            <FunnelRow label="Left without finishing" value={s.cancellations + s.no_shows + s.abandonments} max={s.joins || 1} color="bg-rose-400" />
          </div>
        </ChartCard>
      </div>

      {/* Service lines */}
      {data.service_lines.length > 0 ? (
        <section className="rounded-2xl border border-border bg-background p-5">
          <h3 className="text-sm font-semibold">By service line</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="pb-2 font-medium">Service</th>
                  <th className="pb-2 font-medium">Joined</th>
                  <th className="pb-2 font-medium">Served</th>
                  <th className="pb-2 font-medium">Cancelled</th>
                  <th className="pb-2 font-medium">No-show</th>
                </tr>
              </thead>
              <tbody>
                {data.service_lines.map((line) => (
                  <tr key={line.service_item_id} className="border-b border-border/50">
                    <td className="py-2.5 font-medium">{line.service_name}</td>
                    <td className="py-2.5">{line.joins}</td>
                    <td className="py-2.5 text-emerald-700">{line.completed}</td>
                    <td className="py-2.5">{line.cancelled}</td>
                    <td className="py-2.5 text-rose-700">{line.no_show}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Tips */}
      {data.insights.length > 0 ? (
        <section className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">What to do next</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {data.insights.map((tip, i) => (
              <li key={i} className="text-sm leading-relaxed text-muted">
                {tip}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: AnalyticsHighlight }) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlightTone[highlight.tone] ?? highlightTone.neutral}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
        {highlight.title}
      </p>
      <p className="mt-1 text-xl font-bold tracking-tight">{highlight.value}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{highlight.detail}</p>
    </div>
  );
}

function PeakSlotCard({ slot }: { slot: AnalyticsPeakSlot }) {
  const isBest = slot.direction === "best" && slot.kind !== "leave";
  const isLeave = slot.kind === "leave";
  return (
    <div
      className={`rounded-xl border p-4 ${
        isLeave
          ? "border-rose-200 bg-rose-50/50"
          : isBest
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-amber-200 bg-amber-50/50"
      }`}
    >
      <p className="text-[10px] font-bold uppercase text-muted">
        {isLeave ? "Most people leave" : isBest ? "Best time" : "Quietest time"}
        {slot.kind === "day" ? " (weekday)" : slot.kind === "join" ? " (hour)" : ""}
      </p>
      <p className="mt-1 text-lg font-bold">{slot.label}</p>
      <p className="text-sm text-muted">
        {slot.metric_value} {slot.metric_label}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{slot.explanation}</p>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
  sub,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
  tone: "blue" | "emerald" | "amber" | "zinc";
  sub?: string;
}) {
  const tones = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-800 bg-amber-50 border-amber-100",
    zinc: "text-foreground bg-surface border-border",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide opacity-80">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {sub ? <p className="mt-0.5 text-[10px] opacity-70">{sub}</p> : null}
    </div>
  );
}

function StatBlock({
  label,
  value,
  unit,
  hint,
  good,
  caution,
}: {
  label: string;
  value: number | null;
  unit: string;
  hint: string;
  good?: boolean;
  caution?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        good
          ? "border-emerald-200 bg-emerald-50/50"
          : caution
            ? "border-amber-200 bg-amber-50/50"
            : "border-border bg-surface"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {value != null ? (
          <>
            {value}
            <span className="text-sm font-normal text-muted"> {unit}</span>
          </>
        ) : (
          "—"
        )}
      </p>
      <p className="mt-0.5 text-[10px] text-muted">{hint}</p>
    </div>
  );
}

function StreakStat({
  label,
  value,
  detail,
  suffix = "",
}: {
  label: string;
  value: number;
  detail: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="text-[10px] font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {value}
        {suffix}
      </p>
      <p className="mt-0.5 text-[10px] text-muted">{detail}</p>
    </div>
  );
}

function ChartCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FunnelRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted">{value}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-surface overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
