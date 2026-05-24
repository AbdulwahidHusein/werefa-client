import { Star } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/ui/StatusPill";
import { formatDistance, formatWait, loadColor } from "@/lib/format";
import type { components } from "@/lib/api/schema";

type Discovery = components["schemas"]["ProviderDiscoveryPublic"];

export function ProviderCard({ p }: { p: Discovery }) {
  const status = p.is_paused
    ? "paused"
    : p.is_open === false
      ? "closed"
      : null;

  return (
    <Link
      href={`/p/${p.slug}`}
      className="block rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-surface active:bg-surface"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold tracking-tight">
              {p.biz_name}
            </h3>
            {status ? <StatusPill status={status} /> : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {p.distance_m != null ? (
              <span>{formatDistance(p.distance_m)}</span>
            ) : null}
            {p.rating_avg != null && p.ratings_count > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">
                  {p.rating_avg.toFixed(1)}
                </span>
                <span className="text-xs">({p.ratings_count})</span>
              </span>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-sm font-medium">
            <span
              className={`inline-block h-2 w-2 rounded-full ${loadColor(p.load_factor)}`}
              aria-hidden
            />
            {formatWait(p.estimated_wait_minutes)}
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {p.active_tickets} in line
          </div>
        </div>
      </div>
    </Link>
  );
}
