"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AdminSidebar } from "./AdminSidebar";
import { ProviderServiceSwitcher } from "./ProviderServiceSwitcher";
import { ProviderSidebar } from "./ProviderSidebar";

export type DeskShellProps = {
  role: "provider" | "admin";
  children: React.ReactNode;
  businessName?: string | null;
  queueHref?: string | null;
  services?: { id: string; name: string }[];
  currentServiceId?: string | null;
};

export function DeskShell({
  role,
  children,
  businessName,
  queueHref,
  services = [],
  currentServiceId = null,
}: DeskShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = role === "admin" ? "Admin console" : "Provider console";

  const sidebar =
    role === "admin" ? (
      <AdminSidebar onNavigate={() => setMobileOpen(false)} />
    ) : (
      <ProviderSidebar
        businessName={businessName}
        queueHref={queueHref}
        onNavigate={() => setMobileOpen(false)}
      />
    );

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Sidebar: drawer on mobile, sticky on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:translate-x-0 lg:shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      {/* Main content column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 lg:px-6">
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted hover:bg-surface hover:text-foreground lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            {role === "provider" && businessName ? (
              <p className="truncate text-xs text-muted">{businessName}</p>
            ) : null}
          </div>
          {role === "provider" ? (
            <ProviderServiceSwitcher
              services={services}
              currentServiceId={currentServiceId}
            />
          ) : null}
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
