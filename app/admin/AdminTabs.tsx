"use client";

import { useState } from "react";

import { ProviderRow } from "./ProviderRow";
import type { components } from "@/lib/api/schema";
import { UserManagementTable } from "@/components/UserManagementTable";

type Provider = components["schemas"]["ProviderDiscoveryPublic"];
type UserRow = {
  id: string;
  email: string;
  phone_number: string | null;
  is_active: boolean;
  is_suspended: boolean;
  user_type: string;
};

type Tab = "pending" | "verified" | "rejected" | "users" | "tools";

const TAB_LABELS: Record<Exclude<Tab, "tools">, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
  users: "Users",
};

export function AdminTabs({
  providers,
  initialUsers,
  toolsSlot,
}: {
  providers: Provider[];
  initialUsers: UserRow[];
  toolsSlot: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("pending");

  const counts: Record<Tab, number> = {
    pending: providers.filter((p) => p.verification_status === "pending").length,
    verified: providers.filter((p) => p.verification_status === "verified").length,
    rejected: providers.filter((p) => p.verification_status === "rejected").length,
    users: initialUsers.length,
    tools: 0,
  };

  const filtered = providers.filter((p) => p.verification_status === tab);

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-1 flex gap-1 overflow-x-auto rounded-2xl bg-surface p-1">
        {(["pending", "verified", "rejected", "users", "tools"] as const).map((t) => {
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span>{t === "tools" ? "Tools" : TAB_LABELS[t]}</span>
              {t !== "tools" ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive ? "bg-surface" : "bg-background"
                  }`}
                >
                  {counts[t]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "tools" ? (
        toolsSlot
      ) : tab === "users" ? (
        <UserManagementTable initialUsers={initialUsers} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">
            No {TAB_LABELS[tab].toLowerCase()} providers
          </p>
          <p className="mt-1 text-xs text-muted">
            Providers without coordinates won&apos;t appear in this list.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((p) => (
            <ProviderRow key={p.id} provider={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
