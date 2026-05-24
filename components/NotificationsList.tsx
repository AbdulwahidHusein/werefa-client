"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronRight, Clock, CheckCheck, Loader2 } from "lucide-react";
import type { components } from "@/lib/api/schema";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { markAsReadAction, markAllAsReadAction } from "@/app/me/notifications/actions";

type Notification = components["schemas"]["NotificationPublic"];

function relativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function NotificationsList({
  initialNotifications,
  onReadChange,
}: {
  initialNotifications: Notification[];
  onReadChange?: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [readIds, setReadIds] = useState<string[]>(
    initialNotifications.filter((n) => n.read_at != null).map((n) => n.id),
  );
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleMarkRead(id: string) {
    if (readIds.includes(id) || loadingIds.includes(id)) return;

    setLoadingIds((prev) => [...prev, id]);
    // Optimistic UI update
    setReadIds((prev) => [...prev, id]);

    const res = await markAsReadAction(id);
    setLoadingIds((prev) => prev.filter((x) => x !== id));

    if (!res.ok) {
      // Revert optimistic update
      setReadIds((prev) => prev.filter((x) => x !== id));
      showToast(res.error || "Failed to mark as read");
    } else {
      onReadChange?.();
    }
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !readIds.includes(n.id));
    if (unread.length === 0 || isBulkLoading) return;

    const unreadIds = unread.map((n) => n.id);
    setIsBulkLoading(true);
    // Optimistic UI update
    setReadIds((prev) => [...prev, ...unreadIds]);

    const res = await markAllAsReadAction(unreadIds);
    setIsBulkLoading(false);

    if (!res.ok) {
      // Revert optimistic update for all unread IDs
      setReadIds((prev) => prev.filter((id) => !unreadIds.includes(id)));
      showToast(res.error || "Failed to mark all as read");
    } else {
      onReadChange?.();
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Alert overlay */}
      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toast}
        </div>
      ) : null}

      {/* Header Panel Actions */}
      {unreadCount > 0 ? (
        <div className="flex items-center justify-between bg-surface border border-border p-3.5 rounded-2xl animate-in fade-in duration-200">
          <p className="text-xs font-medium text-muted">
            You have <span className="font-bold text-foreground">{unreadCount}</span> unread update{unreadCount > 1 ? "s" : ""}.
          </p>
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={isBulkLoading}
            className="h-8 rounded-xl text-xs flex items-center gap-1.5 border-border hover:bg-background cursor-pointer"
          >
            {isBulkLoading ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5 text-accent" />
            )}
            Mark all read
          </Button>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {notifications.map((n) => {
          const isRead = readIds.includes(n.id);
          const isLoading = loadingIds.includes(n.id);

          const inner = (
            <div className="flex items-start gap-3">
              {/* Icon / Status */}
              <div className="relative mt-0.5">
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all ${
                  isRead
                    ? "bg-surface text-muted"
                    : "bg-accent/10 text-accent font-semibold"
                }`}>
                  <Bell className="h-4 w-4" />
                </div>
                {/* Visual Unread dot */}
                {!isRead ? (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                  </span>
                ) : null}
              </div>

              {/* Message Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <StatusPill status={n.kind} />
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted">
                    <Clock className="h-3 w-3" aria-hidden />
                    {relativeTime(n.created_at)}
                  </span>
                </div>
                <p className={`mt-2 text-sm leading-relaxed transition-all ${
                  isRead ? "text-muted font-normal" : "text-foreground font-semibold"
                }`}>
                  {n.body}
                </p>
                {n.position != null ? (
                  <p className="mt-1 text-xs font-medium text-muted">
                    Position {n.position}
                  </p>
                ) : null}
              </div>

              {/* Navigation icon / Read icon */}
              <div className="flex shrink-0 items-center gap-2 self-center">
                {!isRead ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMarkRead(n.id);
                    }}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="h-3.5 w-3.5 opacity-60 hover:opacity-100 text-accent" />
                    )}
                  </button>
                ) : null}

                {n.ticket_id ? (
                  <ChevronRight
                    className="h-4 w-4 text-muted/60"
                    aria-hidden
                  />
                ) : null}
              </div>
            </div>
          );

          const listStyles = `rounded-2xl border transition-all duration-300 p-4 ${
            isRead
              ? "bg-background border-border"
              : "bg-blue-50/20 border-blue-200/50 dark:bg-blue-950/5 dark:border-blue-900/30"
          }`;

          return (
            <li
              key={n.id}
              className={listStyles}
              onClick={() => {
                if (!isRead) handleMarkRead(n.id);
              }}
            >
              {n.ticket_id ? (
                <Link
                  href={`/me/tickets/${n.ticket_id}`}
                  className="block transition-all hover:opacity-90 active:scale-[0.99]"
                >
                  {inner}
                </Link>
              ) : (
                <div className="transition-all active:scale-[0.99]">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
