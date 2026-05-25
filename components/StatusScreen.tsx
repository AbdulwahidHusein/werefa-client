import Link from "next/link";
import { AlertCircle, FileQuestion, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/Button";

type Action =
  | { label: string; href: string }
  | { label: string; onClick: () => void };

type StatusScreenProps = {
  variant?: "error" | "notFound" | "offline";
  title: string;
  message: string;
  primaryAction?: Action;
  secondaryAction?: Action;
  className?: string;
};

function ActionButton({ action }: { action: Action }) {
  if ("href" in action) {
    return (
      <Link href={action.href} className="block w-full">
        <Button type="button" className="w-full">
          {action.label}
        </Button>
      </Link>
    );
  }
  return (
    <Button type="button" className="w-full" onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function StatusScreen({
  variant = "error",
  title,
  message,
  primaryAction,
  secondaryAction,
  className = "",
}: StatusScreenProps) {
  const Icon =
    variant === "notFound"
      ? FileQuestion
      : variant === "offline"
        ? WifiOff
        : AlertCircle;

  const iconClass =
    variant === "notFound"
      ? "text-muted"
      : variant === "offline"
        ? "text-amber-600"
        : "text-danger";

  return (
    <div
      className={`mx-auto flex w-full max-w-sm flex-col items-center px-4 py-16 text-center sm:py-20 ${className}`}
    >
      <div
        className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface ${iconClass}`}
        aria-hidden
      >
        <Icon className="h-7 w-7" />
      </div>
      <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {title}
      </h1>
      <p className="mt-2 max-w-[20rem] text-sm leading-relaxed text-muted">{message}</p>
      {primaryAction || secondaryAction ? (
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          {primaryAction ? <ActionButton action={primaryAction} /> : null}
          {secondaryAction ? (
            "href" in secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="text-sm font-medium text-muted hover:text-foreground"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="cursor-pointer text-sm font-medium text-muted hover:text-foreground"
              >
                {secondaryAction.label}
              </button>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
