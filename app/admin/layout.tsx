import { DeskShell } from "@/components/layouts/DeskShell";
import { requireAdmin } from "@/lib/dal";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <DeskShell role="admin">{children}</DeskShell>;
}
