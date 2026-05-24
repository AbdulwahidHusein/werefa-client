import { ChevronRight, Clock, Lock, Pause, Plus, Settings, Tag, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { getMyProvider, listMyServices } from "@/lib/dal";
import type { components } from "@/lib/api/schema";

type Service = components["schemas"]["ServiceItemPublic"] & {
  description?: string | null;
  category?: string | null;
  is_paused?: boolean;
  is_private?: boolean;
};

function formatPrice(p: string): string {
  const n = Number(p);
  if (!Number.isFinite(n)) return p;
  if (n === 0) return "Free";
  return `${n.toFixed(2)} ETB`;
}

export default async function ServicesPage() {
  const provider = await getMyProvider();
  if (!provider) redirect("/dashboard");

  const verified = provider.verification_status === "verified";
  const services = verified ? (await listMyServices()) as Service[] : [];

  return (
    <>
      <PageHeader
        title="Services"
        subtitle={provider.biz_name}
        back="/dashboard"
        trailing={
          provider.membership_role === "owner" ? (
            <Link
              href="/dashboard/settings/profile"
              className="grid h-10 w-10 place-items-center rounded-xl bg-surface hover:bg-zinc-100 transition-colors"
              title="Business Settings"
            >
              <Settings className="h-4 w-4 text-muted" />
            </Link>
          ) : null
        }
      />

      {!verified ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm font-semibold">Service editing locked</p>
          <p className="mt-1 text-sm">
            <strong>{provider.biz_name}</strong> must be verified before you can add services.
            {" "}Status: <StatusPill status={provider.verification_status} />
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-base font-semibold">No services yet</p>
          <p className="mt-1 text-sm text-muted">
            Add the first thing customers can queue for.
          </p>
          <Link
            href="/dashboard/services/new"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add first service
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {services.map((s) => {
              const inactive = !s.is_active;
              const paused = s.is_paused;
              const isPrivate = s.is_private;

              return (
                <li
                  key={s.id}
                  className={`overflow-hidden rounded-2xl border bg-background transition-colors ${
                    inactive ? "border-border opacity-60" : "border-border"
                  }`}
                >
                  <Link
                    href={`/dashboard/services/${s.id}`}
                    className="flex items-start gap-3 p-4 hover:bg-surface transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      {/* Name + status badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold tracking-tight">{s.name}</h3>
                        {inactive ? <StatusPill status="closed">Inactive</StatusPill> : null}
                        {paused && !inactive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            <Pause className="h-3 w-3" />
                            Paused
                          </span>
                        ) : null}
                        {isPrivate ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                            <Lock className="h-3 w-3" />
                            Private
                          </span>
                        ) : null}
                      </div>

                      {/* Category */}
                      {s.category ? (
                        <div className="flex items-center gap-1 text-xs text-muted mb-1.5">
                          <Tag className="h-3 w-3" />
                          <span className="capitalize">{s.category}</span>
                        </div>
                      ) : null}

                      {/* Duration + price */}
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {s.avg_duration_minutes} min
                        </span>
                        <span>{formatPrice(s.price)}</span>
                      </div>

                      {/* Description snippet */}
                      {s.description ? (
                        <p className="mt-1.5 text-xs text-muted line-clamp-1">{s.description}</p>
                      ) : null}
                    </div>
                    <ChevronRight className="h-4 w-4 mt-1 shrink-0 text-muted" aria-hidden />
                  </Link>

                  {/* Queue link */}
                  <Link
                    href={`/dashboard/services/${s.id}/queue`}
                    className="flex h-11 items-center justify-center gap-1.5 border-t border-border text-sm font-medium text-accent hover:bg-surface transition-colors"
                  >
                    <Users className="h-4 w-4" aria-hidden />
                    Open Queue Board
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/dashboard/services/new"
            className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm font-medium text-muted hover:border-accent hover:bg-surface hover:text-accent transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add another service
          </Link>
        </>
      )}
    </>
  );
}
