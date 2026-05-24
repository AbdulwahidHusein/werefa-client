import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  back,
  trailing,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-center gap-3">
      {back ? (
        <Link
          href={back}
          aria-label="Back"
          className="-ml-1 grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-sm text-muted">{subtitle}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </header>
  );
}
