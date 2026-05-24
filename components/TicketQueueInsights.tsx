"use client";

import {
  Clock,
  Crown,
  MapPin,
  Timer,
  Users,
} from "lucide-react";
import type { TicketQueueSnapshot } from "@/lib/ticket-snapshot";
import { StatusPill } from "@/components/ui/StatusPill";

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tracking-tight">{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-muted">{sub}</p> : null}
    </div>
  );
}

export function TicketQueueInsights({
  snapshot,
  status,
  loading,
}: {
  snapshot: TicketQueueSnapshot | null;
  status: string;
  loading?: boolean;
}) {
  if (loading && !snapshot) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
        Loading queue details…
      </div>
    );
  }
  if (!snapshot) return null;

  const inLine = status === "waiting" || status === "serving";
  const positionLabel =
    status === "serving"
      ? "Now serving"
      : snapshot.your_position != null
        ? `#${snapshot.your_position} in line`
        : "In queue";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex gap-3 border-b border-border bg-background p-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-accent/10">
          {snapshot.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={snapshot.profile_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-lg font-bold text-accent">
              {snapshot.biz_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{snapshot.biz_name}</p>
          <p className="truncate text-sm text-muted">{snapshot.service_name}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3" aria-hidden />
            Queue line
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {inLine ? (
        <div className="grid grid-cols-2 gap-2 p-4">
          <Stat
            label="Your spot"
            value={positionLabel}
            sub={
              snapshot.people_ahead > 0
                ? `${snapshot.people_ahead} ahead of you`
                : "You're at the front"
            }
          />
          <Stat
            label="Est. wait"
            value={
              snapshot.estimated_wait_minutes != null
                ? `~${snapshot.estimated_wait_minutes} min`
                : "—"
            }
            sub={snapshot.pace_note}
          />
          <Stat
            label="In line"
            value={String(snapshot.waiting_count)}
            sub={`${snapshot.serving_count} being served`}
          />
          <Stat
            label="Typical visit"
            value={`${snapshot.avg_duration_minutes} min`}
            sub="Average service time"
          />
        </div>
      ) : null}

      {snapshot.vip_waiting_count > 0 ? (
        <p className="border-t border-border px-4 py-2 text-xs text-muted">
          <Crown className="mr-1 inline h-3.5 w-3.5 text-amber-600" aria-hidden />
          {snapshot.vip_waiting_count} VIP ticket
          {snapshot.vip_waiting_count === 1 ? "" : "s"} waiting
        </p>
      ) : null}

      {snapshot.ahead_preview.length > 0 ? (
        <div className="border-t border-border p-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Next in line
          </p>
          <ul className="flex flex-col gap-2">
            {snapshot.ahead_preview.map((row) => (
              <li
                key={`${row.position}-${row.ticket_number}`}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  row.is_you
                    ? "bg-accent/10 font-semibold text-accent"
                    : "bg-background"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-muted">#{row.position}</span>
                  <span>Ticket {row.ticket_number}</span>
                  {row.is_vip ? (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                      VIP
                    </span>
                  ) : null}
                  {row.is_you ? (
                    <span className="text-[10px] uppercase text-accent">You</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-center gap-4 border-t border-border bg-background/80 px-4 py-2 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1">
          <Timer className="h-3 w-3" aria-hidden />
          Live queue stats
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          Updates as the line moves
        </span>
      </div>
    </section>
  );
}
