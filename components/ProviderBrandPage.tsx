import {
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
} from "lucide-react";
import Link from "next/link";

import { JoinButton } from "@/app/p/[slug]/JoinButton";
import { ProviderLogo } from "@/components/ProviderLogo";
import { ServiceLinePreviewCard } from "@/components/ServiceLinePreviewCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatLocation } from "@/lib/ethiopia-locations";
import { formatCategoryLabel } from "@/lib/provider-categories";
import { parseRequirements } from "@/lib/join-documents";
import type { components } from "@/lib/api/schema";

type ProviderPublic = components["schemas"]["ProviderPublic"] & {
  category?: string | null;
  description?: string | null;
  region?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  show_phone_public?: boolean;
  website?: string | null;
  biz_email?: string | null;
  profile_image_url?: string | null;
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

function statusKey(p: {
  is_open: boolean;
  is_paused: boolean;
  verification_status: string;
}) {
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

function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function ProviderBrandPage({
  provider,
  services,
  rating,
  joinable,
  searchParams,
}: {
  provider: ProviderPublic;
  services: ServiceItemPublic[];
  rating: ProviderRatingSummary | null;
  joinable: boolean;
  searchParams: {
    serviceId?: string;
    inviteToken?: string;
    autoJoin?: string;
  };
}) {
  const queueStatus = statusKey(provider);
  const locationLine = formatLocation(provider.region, provider.city);
  const fullAddress = [provider.address, locationLine].filter(Boolean).join(" · ");
  const hasContact =
    (provider.phone && provider.show_phone_public) ||
    provider.website ||
    provider.biz_email;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white sm:rounded-3xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(59,130,246,0.4), transparent 50%), radial-gradient(circle at 85% 70%, rgba(168,85,247,0.25), transparent 45%)",
          }}
        />
        <div className="relative p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:text-left">
            <ProviderLogo
              name={provider.biz_name}
              imageUrl={provider.profile_image_url}
              size="xl"
              variant="hero"
              className="sm:shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <StatusPill status={queueStatus} />
                {provider.category ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium capitalize">
                    <Tag className="h-3 w-3" aria-hidden />
                    {formatCategoryLabel(provider.category)}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {provider.biz_name}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">werefa.com/p/{provider.slug}</p>
              {rating && rating.ratings_count > 0 && rating.rating_avg != null ? (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{rating.rating_avg.toFixed(1)}</span>
                    <span className="text-zinc-300">({rating.ratings_count})</span>
                  </span>
                  <Link
                    href={`/p/${provider.slug}/reviews`}
                    className="text-sm font-medium text-blue-300 hover:underline"
                  >
                    Reviews →
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {locationLine ? (
            <p className="mt-6 flex items-start justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-zinc-200 sm:justify-start">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span className="text-left">{fullAddress || locationLine}</span>
            </p>
          ) : null}

          {!joinable ? (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100 sm:text-left">
              {queueStatus === "paused"
                ? "Remote joins are paused. Please visit in person."
                : queueStatus === "closed"
                  ? "This business is currently closed."
                  : "Awaiting verification — queue joins will open soon."}
            </div>
          ) : null}
        </div>
      </section>

      {/* Main + sidebar on desktop */}
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {provider.description ? (
            <section className="rounded-2xl border border-border bg-background p-5 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                About
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap sm:text-base">
                {provider.description}
              </p>
            </section>
          ) : null}

          <section>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Services & queues
            </h2>
            <p className="mt-1 text-sm text-muted">
              Join a line remotely when the business is open.
            </p>

            {services.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="font-medium">No services listed yet</p>
                <p className="mt-1 text-sm text-muted">Check back soon.</p>
              </div>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {services.map((s) => (
                  <li
                    key={s.id}
                    className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
                  >
                    <div className="flex-1 p-4 sm:p-5">
                      <h3 className="text-base font-semibold sm:text-lg">{s.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          ~{s.avg_duration_minutes} min
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPrice(s.price)}
                        </span>
                      </div>
                      {s.description ? (
                        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-foreground/80">
                          {s.description}
                        </p>
                      ) : null}
                      {s.requirements ? (
                        <p className="mt-2 text-xs text-muted">Bring: {s.requirements}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3 border-t border-border bg-surface/50 p-4">
                      {s.is_active ? (
                        <ServiceLinePreviewCard serviceItemId={s.id} />
                      ) : null}
                      <JoinButton
                        serviceId={s.id}
                        serviceName={s.name}
                        isPrivate={s.is_private ?? provider.is_private}
                        allowVip={s.allow_vip ?? false}
                        joinable={joinable && !s.is_paused && s.is_active}
                        autoJoin={
                          searchParams?.autoJoin === "true" &&
                          searchParams?.serviceId === s.id
                        }
                        inviteToken={
                          searchParams?.serviceId === s.id
                            ? searchParams?.inviteToken
                            : undefined
                        }
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
        </div>

        {/* Sidebar — stacks on mobile, sticky on desktop */}
        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          {fullAddress ? (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Location
              </h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <span>{fullAddress}</span>
              </p>
              {provider.latitude != null && provider.longitude != null ? (
                <a
                  href={mapsUrl(provider.latitude, provider.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
                >
                  Open in Google Maps
                </a>
              ) : null}
            </div>
          ) : null}

          {hasContact ? (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Contact
              </h3>
              <ul className="mt-3 flex flex-col gap-3 text-sm">
                {provider.phone && provider.show_phone_public ? (
                  <li>
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 hover:border-accent/40"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-muted" />
                      <span className="font-medium">{provider.phone}</span>
                    </a>
                  </li>
                ) : null}
                {provider.biz_email ? (
                  <li>
                    <a
                      href={`mailto:${provider.biz_email}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 hover:border-accent/40"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-muted" />
                      <span className="truncate font-medium">{provider.biz_email}</span>
                    </a>
                  </li>
                ) : null}
                {provider.website ? (
                  <li>
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 hover:border-accent/40"
                    >
                      <Globe className="h-4 w-4 shrink-0 text-muted" />
                      <span className="truncate font-medium">
                        {provider.website.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
