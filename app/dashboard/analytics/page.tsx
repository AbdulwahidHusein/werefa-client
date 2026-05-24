import { redirect } from "next/navigation";

import { ProviderAnalyticsDashboard } from "@/components/ProviderAnalyticsDashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyProvider, listMyServices } from "@/lib/dal";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { ProviderAnalytics } from "@/lib/provider-analytics";

export default async function ProviderAnalyticsPage() {
  const provider = await getMyProvider();
  if (!provider) redirect("/dashboard/setup");
  if (provider.verification_status !== "verified") {
    redirect("/dashboard");
  }

  const services = await listMyServices();

  let initial: ProviderAnalytics | null = null;
  let loadError: string | null = null;
  try {
    initial = await apiFetch<ProviderAnalytics>(
      `/providers/${provider.id}/analytics`,
      { method: "GET", query: { days: "30" } },
    );
  } catch (err) {
    if (err instanceof ApiRequestError) {
      loadError = err.detail;
    } else {
      throw err;
    }
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Plain-language stats: best times, wait times, streaks, and what to improve"
        back="/dashboard"
      />
      {loadError ? (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
          {loadError}
        </p>
      ) : null}
      {initial ? (
        <ProviderAnalyticsDashboard
          providerId={provider.id}
          services={services.map((s) => ({ id: s.id, name: s.name }))}
          initialData={initial}
        />
      ) : null}
    </>
  );
}
