import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api/server";
import { SystemHealthMonitor } from "@/components/SystemHealthMonitor";

export default async function AdminSystemPage() {
  let initialHealth: any = null;
  try {
    initialHealth = await apiFetch<any>("/admin/system/health", {
      method: "GET",
    });
  } catch (err) {
    console.error("Failed to load initial system health", err);
  }

  return (
    <AppShell>
      <PageHeader
        title="System Health Monitor"
        subtitle="Operational status of backend, database, Redis, and WebSocket subscription channels"
        back="/admin"
      />
      <SystemHealthMonitor initialHealth={initialHealth} />
    </AppShell>
  );
}
