import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { ProviderBrandPage } from "@/components/ProviderBrandPage";
import { TrackDemandEvent } from "@/components/TrackDemandEvent";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
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

type ServiceItemPublic = components["schemas"]["ServiceItemPublic"];
type ProviderRatingSummary = components["schemas"]["ProviderRatingSummary"];

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

  return (
    <>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Discover
      </Link>
      <TrackDemandEvent
        eventType="service_view"
        providerId={provider.id}
        serviceItemId={sp?.serviceId}
        clientRef={slug}
      />
      <ProviderBrandPage
        provider={provider}
        services={services}
        rating={rating}
        joinable={joinable}
        searchParams={sp}
      />
    </>
  );
}
