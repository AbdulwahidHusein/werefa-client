import Link from "next/link";
import { redirect } from "next/navigation";

import { Discover } from "@/components/Discover";
import { Button } from "@/components/ui/Button";
import { getMe } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";

export default async function Home() {
  const [token, me] = await Promise.all([getSessionToken(), getMe()]);
  if (token && !me) redirect("/login?session=expired");

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">Werefa</span>
        {!me ? (
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
          >
            Log in
          </Link>
        ) : null}
      </header>

      {!me ? (
        <div className="mb-5 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-medium">Skip the line</p>
          <p className="mt-1 text-sm text-muted">
            Browse nearby queues. Sign in to join a line.
          </p>
          <div className="mt-3">
            <Link href="/signup" className="contents">
              <Button>Create account</Button>
            </Link>
          </div>
        </div>
      ) : null}

      <Discover />
    </>
  );
}
