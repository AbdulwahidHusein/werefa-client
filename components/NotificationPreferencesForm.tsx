"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowUp, ArrowDown, Bell, Check, Loader2, Mail, Smartphone, Globe, Moon } from "lucide-react";
import { updateNotificationPrefsAction } from "@/app/account/notifications/actions";
import { Button } from "@/components/ui/Button";

type Channel = {
  key: string;
  name: string;
  desc: string;
  icon: any;
};

const ALL_CHANNELS: Channel[] = [
  { key: "websocket", name: "In-App Live Stream", desc: "Real-time updates delivered inside the application.", icon: Bell },
  { key: "email", name: "Email Notifications", desc: "Receive immediate updates directly in your mailbox.", icon: Mail },
  { key: "push", name: "Browser Push Alerts", desc: "Native browser push alerts when you are away.", icon: Smartphone },
  { key: "sms", name: "SMS Text Messages", desc: "Receive SMS alerts on queue updates.", icon: Smartphone },
];

export function NotificationPreferencesForm({
  initialPrefs,
}: {
  initialPrefs: string[];
}) {
  const [prefs, setPrefs] = useState<string[]>(initialPrefs);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [timezone, setTimezone] = useState("UTC");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Load quiet hours and timezone from localStorage on mount
  useEffect(() => {
    try {
      const storedQuiet = localStorage.getItem("notification_quiet_hours");
      if (storedQuiet) {
        const parsed = JSON.parse(storedQuiet);
        setQuietHoursEnabled(parsed.enabled ?? false);
        setQuietStart(parsed.start ?? "22:00");
        setQuietEnd(parsed.end ?? "08:00");
      }
      
      const storedTz = localStorage.getItem("notification_timezone");
      if (storedTz) {
        setTimezone(storedTz);
      } else {
        // Fallback to browser timezone
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
      }
    } catch (e) {
      console.error("Failed to load local notification settings", e);
    }
  }, []);

  function handleToggleChannel(key: string) {
    if (prefs.includes(key)) {
      // Must have at least one delivery channel enabled
      if (prefs.length <= 1) {
        setError("You must retain at least one active delivery channel.");
        setTimeout(() => setError(""), 3000);
        return;
      }
      setPrefs((prev) => prev.filter((x) => x !== key));
    } else {
      setPrefs((prev) => [...prev, key]);
    }
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setPrefs((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  }

  function handleMoveDown(index: number) {
    if (index === prefs.length - 1) return;
    setPrefs((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(async () => {
      // 1. Save preferences list to Backend
      const res = await updateNotificationPrefsAction(prefs);
      
      if (!res.ok) {
        setError(res.error || "Failed to update notification preferences.");
        return;
      }

      // 2. Stash Quiet Hours and Timezone in localStorage
      try {
        localStorage.setItem(
          "notification_quiet_hours",
          JSON.stringify({ enabled: quietHoursEnabled, start: quietStart, end: quietEnd })
        );
        localStorage.setItem("notification_timezone", timezone);
      } catch (err) {
        console.error("Failed to store quiet hours locally", err);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  // Active channel items mapped in the user's priority order
  const activeChannels = prefs
    .map((key) => ALL_CHANNELS.find((c) => c.key === key))
    .filter(Boolean) as Channel[];

  // Inactive channels that are checked out / disabled
  const inactiveChannels = ALL_CHANNELS.filter((c) => !prefs.includes(c.key));

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-950 animate-in fade-in duration-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-950 flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Preferences updated successfully!</span>
        </div>
      ) : null}

      {/* 1. Priorities and Channels Section */}
      <section className="space-y-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold tracking-tight">Delivery Channels & Priorities</h2>
          <p className="text-xs text-muted leading-relaxed">
            Choose which channels are active. Arrange their position to set delivery priority (top item tried first).
          </p>
        </div>

        {/* Enabled Channels in Order */}
        <div className="space-y-2.5">
          {activeChannels.map((c, idx) => {
            const Icon = c.icon;
            const isFirst = idx === 0;
            const isLast = idx === prefs.length - 1;

            return (
              <div
                key={c.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm transition-all hover:border-accent/40"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent font-semibold">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground leading-none">{c.name}</span>
                      {idx === 0 && (
                        <span className="inline-flex items-center rounded-full  px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted leading-normal">{c.desc}</p>
                  </div>
                </div>

                {/* Priority Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={isFirst}
                    className="p-1 rounded-lg border border-border bg-surface text-muted hover:bg-background hover:text-foreground disabled:opacity-30 disabled:hover:bg-surface disabled:hover:text-muted cursor-pointer transition-colors"
                    title="Increase Priority"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={isLast}
                    className="p-1 rounded-lg border border-border bg-surface text-muted hover:bg-background hover:text-foreground disabled:opacity-30 disabled:hover:bg-surface disabled:hover:text-muted cursor-pointer transition-colors"
                    title="Decrease Priority"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleChannel(c.key)}
                    className="ml-1 text-xs font-semibold text-danger hover:underline cursor-pointer"
                  >
                    Disable
                  </button>
                </div>
              </div>
            );
          })}

          {/* Inactive Channels */}
          {inactiveChannels.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-surface/30 p-4 opacity-70 transition-all hover:opacity-100 hover:border-border"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-muted">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-muted leading-none">{c.name} (Disabled)</span>
                    <p className="mt-1 text-xs text-muted leading-normal">{c.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleChannel(c.key)}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer shrink-0"
                >
                  Enable
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <hr className="border-border" />

      {/* 2. Quiet Hours Section */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <Moon className="h-4.5 w-4.5 text-muted" />
              <h2 className="text-sm font-semibold tracking-tight">Quiet Hours</h2>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Mute alerts during specific periods of the day.
            </p>
          </div>

          {/* Quiet Hours Switch Toggle */}
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={quietHoursEnabled}
              onChange={(e) => setQuietHoursEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-surface border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted peer-checked:after:bg-accent-foreground after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        {quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl border border-border bg-surface/50 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider">Mute From</label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs font-medium focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider">Unmute At</label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2 text-xs font-medium focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}
      </section>

      <hr className="border-border" />

      {/* 3. Timezone Section */}
      <section className="space-y-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Globe className="h-4.5 w-4.5 text-muted" />
            <h2 className="text-sm font-semibold tracking-tight">Time Zone Settings</h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Ensure quiet hours deliver relative to your local time.
          </p>
        </div>

        <div className="relative">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs font-semibold focus:outline-none focus:border-accent appearance-none cursor-pointer"
          >
            {[
              "UTC",
              "Africa/Addis_Ababa",
              "America/New_York",
              "America/Los_Angeles",
              "Europe/London",
              "Europe/Paris",
              "Asia/Tokyo",
              "Asia/Dubai",
            ].map((tz) => (
              <option key={tz} value={tz}>
                {tz} {tz === Intl.DateTimeFormat().resolvedOptions().timeZone ? "(Local Time)" : ""}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">
            <Globe className="h-4 w-4" />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="pt-2">
        <Button type="submit" disabled={isPending} className="w-full h-11 rounded-2xl cursor-pointer">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Saving Preferences...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </form>
  );
}
