import { Clock, MapPin, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { JoinButton } from "./JoinButton";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";

type ProviderPublic = components["schemas"]["ProviderPublic"];
type ServiceItemPublic = components["schemas"]["ServiceItemPublic"];
type ProviderRatingSummary = components["schemas"]["ProviderRatingSummary"];

function statusKey(p: { is_open: boolean; is_paused: boolean; verification_status: string }) {
  if (p.is_paused) return "paused";
  if (!p.is_open) return "closed";
  if (p.verification_status !== "verified") return p.verification_status;
  return "open";
}

function formatPrice(p: string): string {
  const n = Number(p);
  if (!Number.isFinite(n)) return p;
  if (n === 0) return "Free";
  return n.toFixed(2);
}

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string; inviteToken?: string; autoJoin?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  let provider: ProviderPublic;
  try {
    provider = await apiFetch<ProviderPublic>(
      `/providers/by-slug/${encodeURIComponent(slug)}`,
      { method: "GET" },
    );
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) notFound();
    throw err;
  }

  const [services, rating] = await Promise.all([
    apiFetch<ServiceItemPublic[]>(`/providers/${provider.id}/services/`, {
      method: "GET",
    }).catch((err) => {
      if (err instanceof ApiRequestError && err.status === 404) return [];
      throw err;
    }),
    apiFetch<ProviderRatingSummary>(`/providers/${provider.id}/rating`, {
      method: "GET",
    }).catch((err) => {
      if (err instanceof ApiRequestError && err.status === 404) return null;
      throw err;
    }),
  ]);

  const joinable =
    provider.verification_status === "verified" &&
    provider.is_open &&
    !provider.is_paused;

  return (
    <AppShell>
      <PageHeader title={provider.biz_name} back="/" />

      <section className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm text-muted">/{provider.slug}</p>
          <StatusPill status={statusKey(provider)} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
          {rating && rating.ratings_count > 0 && rating.rating_avg != null ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">
                {rating.rating_avg.toFixed(1)}
              </span>
              <span>({rating.ratings_count})</span>
            </span>
          ) : null}
          {provider.latitude != null && provider.longitude != null ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {provider.latitude.toFixed(3)},{" "}
              {provider.longitude.toFixed(3)}
            </span>
          ) : null}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Services
        </h2>
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium">No services yet</p>
            <p className="mt-1 text-sm text-muted">
              This business hasn&apos;t added anything to queue for.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold tracking-tight">
                    {s.name}
                  </h3>
                  <p className="mt-0.5 inline-flex items-center gap-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {s.avg_duration_minutes} min
                    </span>
                    <span>{formatPrice(s.price)}</span>
                  </p>
                </div>
                <JoinButton
                  serviceId={s.id}
                  serviceName={s.name}
                  isPrivate={provider.is_private}
                  joinable={joinable}
                  autoJoin={sp?.autoJoin === "true" && sp?.serviceId === s.id}
                  inviteToken={sp?.serviceId === s.id ? sp?.inviteToken : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
