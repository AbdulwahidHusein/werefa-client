import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api/server";
import { UserManagementTable } from "@/components/UserManagementTable";

export default async function AdminUsersPage() {
  let initialUsers: any[] = [];
  try {
    const res = await apiFetch<any>("/users/?limit=100", { method: "GET" });
    initialUsers = res?.data || [];
  } catch (err) {
    console.error("Failed to load initial users in admin panel", err);
  }

  return (
    <>
    <PageHeader
        title="Admin User Search"
        subtitle="Search users by phone, view standings, active strikes, and suspend accounts"
        back="/admin"
      />
      <div className="rounded-lg border border-border bg-background p-6">
        <UserManagementTable initialUsers={initialUsers} />
      </div>
  </>
  );
}
