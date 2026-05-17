import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireMe } from "@/lib/dal";
import { NotificationPreferencesForm } from "@/components/NotificationPreferencesForm";

export default async function NotificationPreferencesPage() {
  const me = await requireMe();

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        subtitle="Manage where and when you receive queue alerts"
        back="/account"
      />

      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <NotificationPreferencesForm
          initialPrefs={me.notification_prefs || ["websocket", "email"]}
        />
      </div>
    </AppShell>
  );
}
