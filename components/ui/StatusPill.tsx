import type { ReactNode } from "react";

const palettes = {
  amber: "bg-amber-100 text-amber-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-800",
  zinc: "bg-zinc-100 text-zinc-700",
  indigo: "bg-indigo-100 text-indigo-800",
  blue: "bg-blue-100 text-blue-800",
} as const;

type Palette = keyof typeof palettes;

const PALETTE: Record<string, Palette> = {
  // queue ticket statuses
  waiting: "amber",
  pending_approval: "indigo",
  serving: "emerald",
  completed: "zinc",
  no_show: "rose",
  cancelled: "zinc",
  // provider verification
  pending: "amber",
  verified: "emerald",
  rejected: "rose",
  // membership roles
  owner: "indigo",
  staff: "zinc",
  // open/close/paused (also used for verification fallback)
  open: "emerald",
  closed: "zinc",
  paused: "amber",
  // notification kinds
  you_are_next: "amber",
  head_to_counter: "blue",
  now_serving: "emerald",
  liveness_ping_request: "blue",
  liveness_stale: "rose",
  line_chat_update: "indigo",
  queue_cleared: "rose",
  called: "emerald",
};

export function StatusPill({
  status,
  children,
}: {
  status: string;
  children?: ReactNode;
}) {
  const palette = PALETTE[status] ?? "zinc";
  const label = (children ?? status.replace(/_/g, " ")) as ReactNode;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${palettes[palette]}`}
    >
      {label}
    </span>
  );
}
