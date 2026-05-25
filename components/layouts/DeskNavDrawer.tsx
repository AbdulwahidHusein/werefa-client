"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AdminSidebar } from "./AdminSidebar";
import { ProviderSidebar } from "./ProviderSidebar";

type DeskNavDrawerProps =
  | {
      role: "admin";
    }
  | {
      role: "provider";
      businessName?: string | null;
      queueHref?: string | null;
    };

export function DeskNavDrawer(props: DeskNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const label = props.role === "admin" ? "Open admin menu" : "Open provider menu";

  const sidebar =
    props.role === "admin" ? (
      <AdminSidebar onNavigate={() => setOpen(false)} />
    ) : (
      <ProviderSidebar
        businessName={props.businessName}
        queueHref={props.queueHref}
        onNavigate={() => setOpen(false)}
      />
    );

  return (
    <>
      <button
        type="button"
        className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-border text-muted hover:bg-surface hover:text-foreground sm:h-10 sm:w-10"
        aria-label={open ? "Close menu" : label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-[120] w-64 max-w-[85vw] transform transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {sidebar}
      </div>
    </>
  );
}
