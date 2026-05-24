import { Clock, Globe, Mail, MapPin, Phone, Star, Tag } from "lucide-react";
import { notFound } from "next/navigation";

import { JoinButton } from "./JoinButton";
import { ServiceLinePreviewCard } from "@/components/ServiceLinePreviewCard";
import { TrackDemandEvent } from "@/components/TrackDemandEvent";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { parseRequirements } from "@/lib/join-documents";

type ProviderPublic = components["schemas"]["ProviderPublic"] & {
  category?: string | null;
  description?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  show_phone_public?: boolean;
  website?: string | null;
  biz_email?: string | null;
};

type ServiceItemPublic = components["schemas"]["ServiceItemPublic"] & {
  description?: string | null;
  requirements?: string | null;
  category?: string | null;
  is_paused?: boolean;
  is_private?: boolean;
  allow_vip?: boolean;
  requires_join_documents?: boolean;
  join_document_requirements?: unknown;
};

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
  return `${n.toFixed(2)} ETB`;
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
    }).catch(() => null),
  ]);

  const joinable =
    provider.verification_status === "verified" &&
    provider.is_open &&
    !provider.is_paused;

  const queueStatus = statusKey(provider);

  return (
    <>
      <TrackDemandEvent
        eventType="service_view"
        providerId={provider.id}
        serviceItemId={sp?.serviceId}
        clientRef={slug}
      />
      <PageHeader title={provider.biz_name} back="/" />

      {/* Business profile card */}
      <section className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="p-5">
          {/* Status row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm text-muted">/{provider.slug}</p>
            <StatusPill status={queueStatus} />
          </div>

          {/* Category */}
          {provider.category ? (
            <div className="flex items-center gap-1.5 text-sm text-muted mb-2">
              <Tag className="h-3.5 w-3.5" />
              <span className="capitalize">{provider.category}</span>
            </div>
          ) : null}

          {/* Rating */}
          {rating && rating.ratings_count > 0 && rating.rating_avg != null ? (
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{rating.rating_avg.toFixed(1)}</span>
                <span className="text-muted">({rating.ratings_count} reviews)</span>
              </span>
              <a href={`/p/${provider.slug}/reviews`} className="text-xs text-accent hover:underline">
                See all →
              </a>
            </div>
          ) : null}

          {/* Description */}
          {provider.description ? (
            <p className="text-sm text-foreground/80 leading-relaxed mb-3">
              {provider.description}
            </p>
          ) : null}

          {/* Contact & location details */}
          <div className="flex flex-col gap-1.5">
            {(provider.city || provider.address) ? (
              <div className="flex items-start gap-2 text-sm text-muted">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{[provider.address, provider.city].filter(Boolean).join(", ")}</span>
              </div>
            ) : null}
            {provider.phone && provider.show_phone_public ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${provider.phone}`} className="hover:text-foreground transition-colors">
                  {provider.phone}
                </a>
              </div>
            ) : null}
            {provider.website ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Globe className="h-4 w-4 shrink-0" />
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline truncate"
                >
                  {provider.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            ) : null}
            {provider.biz_email ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${provider.biz_email}`} className="text-accent hover:underline truncate">
                  {provider.biz_email}
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {/* Status banner */}
        {!joinable ? (
          <div className={`px-5 py-3 text-sm border-t border-border ${
            queueStatus === "paused"
              ? "bg-amber-50/60 text-amber-900"
              : queueStatus === "closed"
              ? "bg-zinc-50 text-zinc-500"
              : "bg-amber-50/60 text-amber-900"
          }`}>
            {queueStatus === "paused"
              ? "Remote joins are currently paused. Walk-in only."
              : queueStatus === "closed"
              ? "This business is currently closed."
              : "This business is not yet verified for public queue access."}
          </div>
        ) : null}
      </section>

      {/* Services */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Services
        </h2>
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium">No services yet</p>
            <p className="mt-1 text-sm text-muted">
              This business hasn&apos;t added any services.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {services.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-border bg-background overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold tracking-tight">{s.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {s.avg_duration_minutes} min
                        </span>
                        <span>{formatPrice(s.price)}</span>
                      </div>
                      {s.description ? (
                        <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
                          {s.description}
                        </p>
                      ) : null}
                      {s.requirements ? (
                        <p className="mt-1 text-xs text-muted italic">
                          Bring: {s.requirements}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border px-4 py-3 flex flex-col gap-3">
                  {s.is_active ? (
                    <ServiceLinePreviewCard serviceItemId={s.id} />
                  ) : null}
                  <JoinButton
                    serviceId={s.id}
                    serviceName={s.name}
                    isPrivate={s.is_private ?? provider.is_private}
                    allowVip={s.allow_vip ?? false}
                    joinable={joinable && !s.is_paused && s.is_active}
                    autoJoin={sp?.autoJoin === "true" && sp?.serviceId === s.id}
                    inviteToken={sp?.serviceId === s.id ? sp?.inviteToken : undefined}
                    joinDocuments={
                      s.requires_join_documents
                        ? parseRequirements(s.join_document_requirements)
                        : []
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
