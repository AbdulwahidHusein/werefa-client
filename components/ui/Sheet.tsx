"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Pinned below scrollable body (e.g. primary action). */
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[110] flex flex-col justify-end"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/40"
      />
      <div
        className="relative z-10 mx-auto flex w-full max-w-md max-h-[min(92dvh,100%)] flex-col overflow-hidden rounded-t-3xl border-t border-border bg-background shadow-xl"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="shrink-0 pt-2">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-zinc-300" />
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="-mr-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full text-muted hover:bg-surface hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 [-webkit-overflow-scrolling:touch]">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-border bg-background px-5 pt-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
