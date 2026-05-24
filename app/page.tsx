import Link from "next/link";
import { redirect } from "next/navigation";

import { Discover } from "@/components/Discover";
import { Button } from "@/components/ui/Button";
import { getMe } from "@/lib/dal";
import { resolveAppRole } from "@/lib/navigation";
import { getSessionToken } from "@/lib/session";

export default async function Home() {
  const [token, me] = await Promise.all([getSessionToken(), getMe()]);
  if (token && !me) redirect("/login?session=expired");

  const isSeeker = me && resolveAppRole(me) === "seeker";

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-lg font-semibold tracking-tight">Werefa</span>
          <p className="mt-0.5 text-sm text-muted">Find a queue near you</p>
        </div>
        <div className="flex items-center gap-2">
          {isSeeker ? (
            <Link
              href="/me/tickets"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface"
            >
              My queue
            </Link>
          ) : null}
          {!me ? (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
            >
              Log in
            </Link>
          ) : null}
        </div>
      </header>

      {!me ? (
        <div className="mb-5 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-medium">Skip the line</p>
          <p className="mt-1 text-sm text-muted">
            Browse queues on the map or list. Sign in to join a line.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/signup" className="contents">
              <Button>Create account</Button>
            </Link>
            <Link href="/login" className="contents">
              <Button variant="secondary">Log in</Button>
            </Link>
          </div>
        </div>
      ) : null}

      <Discover />
    </>
  );
}
