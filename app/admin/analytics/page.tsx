import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api/server";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default async function AdminAnalyticsPage() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const since = d.toISOString();

  let initialData: any[] = [];
  try {
    const res = await apiFetch<any>("/admin/analytics/demand-summary", {
      method: "GET",
      query: { since },
    });
    initialData = res?.data || [];
  } catch (err) {
    console.error("Failed to load initial analytics summary", err);
  }

  return (
    <AppShell>
      <PageHeader
        title="Admin Analytics"
        subtitle="Operational funnel demand matrix and conversion stats"
        back="/admin"
      />
      <AnalyticsDashboard initialData={initialData} />
    </AppShell>
  );
}
