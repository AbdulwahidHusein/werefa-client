import { redirect } from "next/navigation";

import { getProviderQueuePath } from "@/lib/provider-routes";

export default async function ProviderQueueRedirectPage() {
  const path = await getProviderQueuePath();
  if (path) {
    redirect(path);
  }
  redirect("/dashboard");
}
