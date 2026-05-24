import { redirect } from "next/navigation";

import { SetupForm } from "./SetupForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMyProvider } from "@/lib/dal";

export default async function SetupPage() {
  const provider = await getMyProvider();
  if (provider) redirect("/dashboard/settings/profile");

  return (
    <>
      <PageHeader
        title="Set up your business"
        subtitle="Profile, contact, location, and queue access"
        back="/dashboard"
      />
      <p className="-mt-2 mb-5 max-w-3xl text-sm leading-relaxed text-muted lg:max-w-none">
        Complete your public profile so customers can find and trust you on
        Discover. You can add a logo and services right after creation.
      </p>
      <div className="mx-auto w-full lg:max-w-4xl xl:max-w-5xl">
        <SetupForm />
      </div>
    </>
  );
}
