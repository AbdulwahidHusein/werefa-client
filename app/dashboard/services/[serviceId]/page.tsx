import { notFound, redirect } from "next/navigation";

import { ServiceForm } from "../ServiceForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyProvider, getMyService } from "@/lib/dal";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const provider = await getMyProvider();
  if (!provider) redirect("/dashboard");
  if (provider.verification_status !== "verified") {
    redirect("/dashboard/services");
  }

  const service = await getMyService(serviceId);
  if (!service) notFound();

  return (
    <>
    <PageHeader
        title="Edit service"
        subtitle={service.name}
        back="/dashboard/services"
      />
      <ServiceForm service={service} />
  </>
  );
}
