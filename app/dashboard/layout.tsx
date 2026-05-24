import { DeskShell } from "@/components/layouts/DeskShell";
import { getMyProvider, listMyServices, requireProvider } from "@/lib/dal";
import { getProviderQueuePath } from "@/lib/provider-routes";
import { getServiceId } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProvider();
  const [provider, queueHref, services, currentServiceId] = await Promise.all([
    getMyProvider(),
    getProviderQueuePath(),
    listMyServices(),
    getServiceId(),
  ]);

  return (
    <DeskShell
      role="provider"
      businessName={provider?.biz_name ?? null}
      queueHref={queueHref}
      services={services.map((s) => ({ id: s.id, name: s.name }))}
      currentServiceId={currentServiceId}
    >
      {children}
    </DeskShell>
  );
}
