import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireMe } from "@/lib/dal";
import { apiFetch } from "@/lib/api/server";
import { StrikesDisplay } from "@/components/StrikesDisplay";

export default async function AccountStrikesPage() {
  // 1. Ensure user is logged in
  await requireMe();

  // 2. Fetch the strikes summary from backend
  const summary = await apiFetch<any>("/me/strikes", {
    method: "GET",
  });

  return (
    <AppShell>
      <PageHeader
        title="Standing & Strikes"
        subtitle="Manage active queue warnings and suspension status"
        back="/account"
      />

      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <StrikesDisplay summary={summary} />
      </div>
    </AppShell>
  );
}
