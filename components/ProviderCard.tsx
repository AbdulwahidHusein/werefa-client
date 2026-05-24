import { Star, Tag } from "lucide-react";
import Link from "next/link";

import { ProviderLogo } from "@/components/ProviderLogo";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDistance, formatWait, loadColor } from "@/lib/format";
import { formatLocation } from "@/lib/ethiopia-locations";
import type { components } from "@/lib/api/schema";

type Discovery = components["schemas"]["ProviderDiscoveryPublic"] & {
  region?: string | null;
  city?: string | null;
  category?: string | null;
  profile_image_url?: string | null;
};

export function ProviderCard({ p }: { p: Discovery }) {
  const status = p.is_paused
    ? "paused"
    : p.is_open === false
      ? "closed"
      : null;
  const location = formatLocation(p.region, p.city);

  return (
    <Link
      href={`/p/${p.slug}`}
      className="group flex min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-colors hover:border-accent/30 hover:bg-surface/30 active:bg-surface/50 sm:flex sm:h-full sm:min-h-[188px] sm:flex-col sm:rounded-2xl sm:shadow-sm sm:hover:shadow-md"
    >
      {/* Mobile: compact horizontal row */}
      <div className="flex min-w-0 flex-1 items-stretch gap-2.5 p-2.5 sm:hidden">
        <ProviderLogo
          name={p.biz_name}
          imageUrl={p.profile_image_url}
          size="sm"
          className="shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <div className="flex min-w-0 items-start gap-1.5">
            <h3 className="min-w-0 flex-1 break-words text-[13px] font-semibold leading-snug line-clamp-2">
              {p.biz_name}
            </h3>
            {status ? <StatusPill status={status} /> : null}
          </div>
          {p.category ? (
            <p className="flex min-w-0 items-center gap-1 text-[11px] capitalize text-muted">
              <Tag className="h-2.5 w-2.5 shrink-0" aria-hidden />
              <span className="truncate">{p.category}</span>
            </p>
          ) : null}
          {location ? (
            <p className="truncate text-[11px] text-muted">{location}</p>
          ) : null}
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0 text-[11px] text-muted">
            {p.distance_m != null ? (
              <span className="shrink-0">{formatDistance(p.distance_m)}</span>
            ) : null}
            {p.rating_avg != null && p.ratings_count > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-0.5">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">
                  {p.rating_avg.toFixed(1)}
                </span>
              </span>
            ) : null}
            <span className="shrink-0">{p.active_tickets} in line</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-center gap-1 pl-1">
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${loadColor(p.load_factor)}`}
              aria-hidden
            />
            {formatWait(p.estimated_wait_minutes)}
          </span>
        </div>
      </div>

      {/* Desktop / tablet: card layout */}
      <div className="hidden min-w-0 flex-1 flex-col sm:flex">
        <div className="flex flex-1 flex-col p-3.5">
          <div className="flex items-start justify-between gap-2">
            <ProviderLogo
              name={p.biz_name}
              imageUrl={p.profile_image_url}
              size="md"
            />
            {status ? <StatusPill status={status} /> : null}
          </div>

          <h3 className="mt-2.5 line-clamp-2 break-words text-sm font-semibold leading-snug tracking-tight">
            {p.biz_name}
          </h3>

          {p.category ? (
            <p className="mt-1 flex min-w-0 items-center gap-1 text-xs capitalize text-muted">
              <Tag className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{p.category}</span>
            </p>
          ) : null}

          <div className="mt-1.5 flex min-w-0 flex-col gap-0.5 text-xs text-muted">
            {location ? (
              <span className="line-clamp-1 break-words">{location}</span>
            ) : null}
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
              {p.distance_m != null ? (
                <span className="shrink-0">{formatDistance(p.distance_m)}</span>
              ) : null}
              {p.rating_avg != null && p.ratings_count > 0 ? (
                <span className="inline-flex shrink-0 items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">
                    {p.rating_avg.toFixed(1)}
                  </span>
                  <span>({p.ratings_count})</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-2 border-t border-border bg-surface/60 px-3.5 py-2.5">
          <span className="truncate text-xs text-muted">
            {p.active_tickets} in line
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground">
            <span
              className={`inline-block h-2 w-2 rounded-full ${loadColor(p.load_factor)}`}
              aria-hidden
            />
            {formatWait(p.estimated_wait_minutes)}
          </span>
        </div>
      </div>
    </Link>
  );
}
