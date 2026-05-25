"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { api } from "@/lib/api/client";

export function LineChatSettingsSection({
  serviceId,
  providerId,
  lineChatEnabled,
  onLineChatEnabledChange,
  isOwner,
}: {
  serviceId: string;
  providerId: string;
  lineChatEnabled: boolean;
  onLineChatEnabledChange: (enabled: boolean) => void;
  isOwner: boolean;
}) {
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    if (!isOwner || toggling) return;
    const next = !lineChatEnabled;
    setToggling(true);
    try {
      await api(`/providers/${providerId}/services/${serviceId}`, {
        method: "PATCH",
        body: { line_chat_enabled: next },
      });
      onLineChatEnabledChange(next);
    } catch {
      // keep previous state
    } finally {
      setToggling(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <MessageCircle className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Line chat</h2>
          <p className="mt-1 text-sm text-muted">
            Chat with everyone on this line from the <strong className="text-foreground">Queue</strong>{" "}
            tab — it stays open beside your board on larger screens.
          </p>
          {isOwner ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted">Allow customer messages</span>
              <button
                type="button"
                disabled={toggling}
                onClick={handleToggle}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  lineChatEnabled
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {lineChatEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">
              {lineChatEnabled
                ? "Customers can post in line chat."
                : "Customer chat is turned off for this line."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
