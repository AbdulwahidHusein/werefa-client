import Link from "next/link";
import { redirect } from "next/navigation";

import { Discover } from "@/components/Discover";
import { WerefaLogo } from "@/components/WerefaLogo";
import { getMe } from "@/lib/dal";
import { resolveAppRole } from "@/lib/navigation";
import { getSessionToken } from "@/lib/session";

export default async function Home() {
  const [token, me] = await Promise.all([getSessionToken(), getMe()]);
  if (token && !me) redirect("/login?session=expired");

  const isSeeker = me && resolveAppRole(me) === "seeker";

  return (
    <div className="flex w-full min-w-0 flex-col overflow-x-hidden">
      <header className="mb-2 flex min-w-0 items-center justify-between gap-2 sm:mb-5 sm:gap-4">
        <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
          <WerefaLogo size="sm" href="/" className="sm:hidden" />
          <WerefaLogo size="md" href="/" className="hidden sm:inline-flex" />
          <h1 className="truncate text-base font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Discover
          </h1>
          <p className="mt-0.5 hidden text-sm text-muted sm:block">
            Find queues near you — filter by region, city, or search.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isSeeker ? (
            <Link
              href="/me/tickets"
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-foreground hover:bg-surface sm:rounded-xl sm:border sm:border-border sm:px-3 sm:py-2 sm:text-sm"
            >
              My queue
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
