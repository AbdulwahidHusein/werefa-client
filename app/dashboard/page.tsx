import {
  Building2,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { getMe, getMyProvider } from "@/lib/dal";

export default async function DashboardPage() {
  const [me, provider] = await Promise.all([getMe(), getMyProvider()]);

  const isProvider = me?.user_type === "provider";

  if (!isProvider) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Provider account required." />
      </>
    );
  }

  if (!provider) {
    return (
      <>
        <PageHeader
          title="Welcome to Werefa"
          subtitle="Set up your business to start managing queues."
        />
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-4 text-base font-semibold">No business yet</p>
            <p className="mt-1 text-sm text-muted">
              Create your business profile to get started.
            </p>
            <Link
              href="/dashboard/setup"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Create my business
            </Link>
          </div>
        </div>
      </>
    );
  }

  const verified = provider.verification_status === "verified";
  const isOwner = provider.membership_role === "owner";

  const p = provider as typeof provider & {
    category?: string | null;
    description?: string | null;
    city?: string | null;
    address?: string | null;
    phone?: string | null;
    show_phone_public?: boolean;
    website?: string | null;
    biz_email?: string | null;
  };

  return (
    <>
      <PageHeader
        title={provider.biz_name}
        subtitle={`/${provider.slug}`}
      />

      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {/* Header row */}
        <div className="flex items-start gap-4 p-5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold truncate">{provider.biz_name}</h2>
              <StatusPill status={provider.verification_status} />
              {isOwner ? <StatusPill status="owner" /> : <StatusPill status="staff" />}
            </div>
            {p.category ? (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Tag className="h-3.5 w-3.5" />
                <span className="capitalize">{p.category}</span>
              </div>
            ) : null}
            {p.description ? (
              <p className="mt-2 text-sm text-foreground/80 leading-relaxed line-clamp-2">
                {p.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Contact & location grid */}
        {(p.city || p.address || p.phone || p.website || p.biz_email) ? (
          <div className="border-t border-border px-5 py-4 grid grid-cols-1 gap-2">
            {(p.city || p.address) ? (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted" />
                <span className="text-foreground/80">
                  {[p.address, p.city].filter(Boolean).join(", ")}
                </span>
              </div>
            ) : null}
            {p.phone && p.show_phone_public ? (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-muted" />
                <span className="text-foreground/80">{p.phone}</span>
              </div>
            ) : null}
            {p.website ? (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 shrink-0 text-muted" />
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline truncate"
                >
                  {p.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            ) : null}
            {p.biz_email ? (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted" />
                <a href={`mailto:${p.biz_email}`} className="text-accent hover:underline truncate">
                  {p.biz_email}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Queue status row */}
        <div className="border-t border-border px-5 py-3 flex items-center gap-3">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              provider.is_open && !provider.is_paused
                ? "bg-emerald-500"
                : provider.is_open && provider.is_paused
                ? "bg-amber-400"
                : "bg-zinc-300"
            }`}
          />
          <span className="text-sm text-muted">
            {!provider.is_open
              ? "Closed — not accepting new tickets"
              : provider.is_paused
              ? "Open · remote joins paused"
              : "Open · accepting queue entries"}
          </span>
        </div>

        {/* Action strip */}
        <div className="border-t border-border grid grid-cols-3">
          {verified ? (
            <Link
              href={`/dashboard/services`}
              className="flex h-12 items-center justify-center gap-1.5 text-sm font-medium text-accent hover:bg-surface transition-colors"
            >
              <Clock className="h-4 w-4" aria-hidden />
              Services
            </Link>
          ) : (
            <span className="flex h-12 items-center justify-center text-xs text-muted">
              Locked
            </span>
          )}
          <Link
            href="/dashboard/members"
            className="flex h-12 items-center justify-center gap-1.5 border-l border-border text-sm font-medium text-foreground hover:bg-surface transition-colors"
          >
            <Users className="h-4 w-4" aria-hidden />
            Team
          </Link>
          {isOwner ? (
            <Link
              href="/dashboard/settings/profile"
              className="flex h-12 items-center justify-center gap-1.5 border-l border-border text-sm font-medium text-foreground hover:bg-surface transition-colors"
            >
              <Settings className="h-4 w-4" aria-hidden />
              Settings
            </Link>
          ) : (
            <span className="flex h-12 items-center justify-center border-l border-border text-xs text-muted">
              —
            </span>
          )}
        </div>
      </div>

      {/* Verification notice */}
      {!verified ? (
        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-900 leading-relaxed">
          <p className="font-semibold mb-0.5">Pending verification</p>
          <p>
            Your business profile is under review. Public search and queue access are locked until approved.
            Upload your documents in{" "}
            <Link href="/dashboard/settings/documents" className="font-medium underline underline-offset-2">
              Settings → Documents
            </Link>
            .
          </p>
        </div>
      ) : null}

      {/* Quick links */}
      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/dashboard/settings/profile"
          className="flex h-11 items-center justify-between rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-surface transition-colors"
        >
          <span>Edit business profile</span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
        <Link
          href="/dashboard/settings/documents"
          className="flex h-11 items-center justify-between rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-surface transition-colors"
        >
          <span>Verification documents</span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      </div>
    </>
  );
}
