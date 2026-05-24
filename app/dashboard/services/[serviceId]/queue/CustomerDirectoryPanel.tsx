"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Ban, Mail, Phone, RefreshCw, User } from "lucide-react";

import {
  banCustomerAction,
  fetchQueueCustomersAction,
  unbanCustomerAction,
} from "./actions";
import { isQueueActionOk, queueActionError } from "./queue-action-utils";
import type { ProviderCustomer } from "@/lib/queue-customer";

export function CustomerDirectoryPanel({
  serviceId,
  providerId,
  defaultOpen = false,
  onActionDone,
}: {
  serviceId: string;
  providerId: string;
  defaultOpen?: boolean;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [customers, setCustomers] = useState<ProviderCustomer[]>([]);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await fetchQueueCustomersAction(serviceId);
      if (res.ok) setCustomers(res.data);
      else onActionDone?.(res.error ?? "Could not load customers.", "err");
    });
  }, [serviceId, onActionDone]);

  useEffect(() => {
    if (open && customers.length === 0) load();
  }, [open, customers.length, load]);

  useEffect(() => {
    if (defaultOpen) load();
  }, [defaultOpen, load]);

  function toggleBan(c: ProviderCustomer) {
    startTransition(async () => {
      const res = c.is_banned
        ? await unbanCustomerAction(providerId, c.user_id)
        : await banCustomerAction(providerId, c.user_id);
      if (isQueueActionOk(res)) {
        onActionDone?.(res.message ?? "Updated.");
        load();
      } else {
        onActionDone?.(queueActionError(res), "err");
      }
    });
  }

  const listContent = (
        <div className={defaultOpen ? "" : "border-t border-border px-4 pb-4"}>
          <div className={`mb-3 flex items-center justify-between gap-2 ${defaultOpen ? "" : "pt-3"}`}>
            <p className="text-xs text-muted">
              People who joined this line — email and phone when available
            </p>
            <button
              type="button"
              onClick={load}
              disabled={pending}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted hover:bg-surface disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${pending ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {customers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
              No registered customers yet for this line.
            </p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {customers.map((c) => (
                <li
                  key={c.user_id}
                  className={`rounded-xl border p-3 ${
                    c.is_banned
                      ? "border-rose-200 bg-rose-50/50"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        <User className="h-3.5 w-3.5 shrink-0 text-muted" />
                        {c.full_name || "No name"}
                        {c.has_active_ticket ? (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            IN LINE
                          </span>
                        ) : null}
                      </p>
                      {c.email ? (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
                          <Mail className="h-3 w-3 shrink-0" />
                          {c.email}
                        </p>
                      ) : null}
                      {c.phone_number ? (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                          <Phone className="h-3 w-3 shrink-0" />
                          {c.phone_number}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[10px] text-muted">
                        {c.ticket_count} visit(s)
                        {c.is_banned ? " · Banned" : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => toggleBan(c)}
                      className={`shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
                        c.is_banned
                          ? "border border-border bg-background text-foreground"
                          : "bg-rose-600 text-white hover:bg-rose-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Ban className="h-3 w-3" />
                        {c.is_banned ? "Unban" : "Ban"}
                      </span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
  );

  if (defaultOpen) return listContent;

  return (
    <section className="rounded-2xl border border-border bg-background">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold">Customers & bans</span>
        <span className="text-xs text-muted">{open ? "Hide" : "Browse"}</span>
      </button>
      {open ? listContent : null}
    </section>
  );
}
