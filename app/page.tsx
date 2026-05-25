import Link from "next/link";
import { redirect } from "next/navigation";

import { Discover } from "@/components/Discover";
import { DeskNavDrawer } from "@/components/layouts/DeskNavDrawer";
import { WerefaLogo } from "@/components/WerefaLogo";
import { getMe, getMyProvider } from "@/lib/dal";
import { homePathForRole, resolveAppRole } from "@/lib/navigation";
import { getProviderQueuePath } from "@/lib/provider-routes";
import { getSessionToken } from "@/lib/session";

export default async function Home() {
  const [token, me] = await Promise.all([getSessionToken(), getMe()]);
  if (token && !me) redirect("/login?session=expired");

  const role = me ? resolveAppRole(me) : null;
  const isSeeker = role === "seeker";
  const isProvider = role === "provider";
  const isAdmin = role === "admin";

  const providerDesk =
    isProvider && me
      ? await Promise.all([getMyProvider(), getProviderQueuePath()]).then(
          ([provider, queueHref]) => ({
            businessName: provider?.biz_name ?? null,
            queueHref,
          }),
        )
      : null;

  const consoleLinkClass =
    "rounded-lg px-2 py-1.5 text-xs font-medium text-foreground hover:bg-surface sm:rounded-xl sm:border sm:border-border sm:px-3 sm:py-2 sm:text-sm";

  return (
    <div className="flex w-full min-w-0 flex-col overflow-x-hidden">
      <header className="mb-2 flex min-w-0 items-center justify-between gap-2 sm:mb-5 sm:gap-4">
        <div className="flex min-w-0 items-start gap-2 sm:gap-3">
          {isProvider && providerDesk ? (
            <div className="shrink-0 pt-0.5 sm:pt-1">
              <DeskNavDrawer
                role="provider"
                businessName={providerDesk.businessName}
                queueHref={providerDesk.queueHref}
              />
            </div>
          ) : null}
          {isAdmin ? (
            <div className="shrink-0 pt-0.5 sm:pt-1">
              <DeskNavDrawer role="admin" />
            </div>
          ) : null}
          <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
            <WerefaLogo
              size="sm"
              href="/"
              className="max-w-[7.5rem] sm:max-w-[10.5rem]"
            />
            <h1 className="truncate text-base font-bold tracking-tight sm:text-2xl lg:text-3xl">
              Discover
            </h1>
            <p className="mt-0.5 hidden text-sm text-muted sm:block">
              Find queues near you — filter by region, city, or search.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isSeeker ? (
            <Link href="/me/tickets" className={consoleLinkClass}>
              My queue
            </Link>
          ) : null}
          {isProvider ? (
            <Link
              href={homePathForRole("provider")}
              className={consoleLinkClass}
            >
              Console
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href={homePathForRole("admin")} className={consoleLinkClass}>
              Admin
            </Link>
          ) : null}
          {!me ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted hover:bg-surface hover:text-foreground sm:px-3 sm:py-2 sm:text-sm"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent-hover sm:px-4 sm:py-2 sm:text-sm"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </div>
      </header>

      {!me ? (
        <p className="mb-2 text-[11px] leading-snug text-muted sm:mb-4 sm:hidden">
          Browse queues below.{" "}
          <Link href="/signup" className="font-medium text-accent">
            Sign up
          </Link>{" "}
          to join from your phone.
        </p>
      ) : null}

      <Discover />
    </div>
  );
}
