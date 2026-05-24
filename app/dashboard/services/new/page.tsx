import { redirect } from "next/navigation";

import { ServiceForm } from "../ServiceForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyProvider } from "@/lib/dal";

export default async function NewServicePage() {
  const provider = await getMyProvider();
  if (!provider) redirect("/dashboard");
  if (provider.verification_status !== "verified") {
    redirect("/dashboard/services");
  }

  return (
    <>
    <PageHeader title="New service" back="/dashboard/services" />
      <p className="-mt-2 mb-4 text-sm text-muted">
        Customers will see this option when joining your queue.
      </p>
      <ServiceForm />
  </>
  );
}
