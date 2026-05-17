import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
  Bell,
} from "lucide-react";
import Link from "next/link";

import { logoutAction } from "../(auth)/actions";
import { CopyId } from "../dashboard/CopyId";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireMe } from "@/lib/dal";

export default async function AccountPage() {
  const me = await requireMe();

  const isProvider = me.user_type === "provider";

  return (
    <AppShell>
      <PageHeader title="Account" subtitle={me.email} />

      <section className="rounded-2xl border border-border bg-background p-4">
        <p className="text-xs font-medium text-muted">Your user ID</p>
        <CopyId id={me.id} />
      </section>

      <section className="rounded-2xl border border-border bg-background mt-4">
        <Link
          href="/account/edit"
          className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface"
        >
          <User className="h-5 w-5 text-muted" aria-hidden />
          <span className="flex-1 text-sm font-medium">
            Edit profile & password
          </span>
          <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
        </Link>
        <Link
          href="/account/notifications"
          className="flex items-center gap-3 border-t border-border px-4 py-3.5 transition-colors hover:bg-surface"
        >
          <Bell className="h-5 w-5 text-muted" aria-hidden />
          <span className="flex-1 text-sm font-medium">
            Notification preferences
          </span>
          <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
        </Link>
        {isProvider ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 border-t border-border px-4 py-3.5 transition-colors hover:bg-surface"
          >
            <LayoutDashboard className="h-5 w-5 text-muted" aria-hidden />
            <span className="flex-1 text-sm font-medium">
              Business dashboard
            </span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        ) : (
          <Link
            href="/dashboard/setup"
            className="flex items-center gap-3 border-t border-border px-4 py-3.5 transition-colors hover:bg-surface"
          >
            <LayoutDashboard className="h-5 w-5 text-muted" aria-hidden />
            <span className="flex-1 text-sm font-medium">Run a business</span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        )}
        {me.is_superuser ? (
          <Link
            href="/admin"
            className="flex items-center gap-3 border-t border-border px-4 py-3.5 transition-colors hover:bg-surface"
          >
            <ShieldCheck className="h-5 w-5 text-muted" aria-hidden />
            <span className="flex-1 text-sm font-medium">Admin tools</span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        ) : null}
      </section>

      <form action={logoutAction} className="mt-4">
        <button
          type="submit"
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </button>
      </form>
    </AppShell>
  );
}
