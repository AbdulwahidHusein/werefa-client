import { redirect } from "next/navigation";

import { SetupForm } from "./SetupForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyProvider } from "@/lib/dal";

export default async function SetupPage() {
  const provider = await getMyProvider();
  if (provider) redirect("/dashboard/settings/profile");

  return (
    <>
      <PageHeader title="Create your business" back="/dashboard" />
      <p className="-mt-2 mb-4 text-sm text-muted">
        Add the basics so customers can find you. You can fill in more details
        from your settings page once created.
      </p>
      <SetupForm />
    </>
  );
}
