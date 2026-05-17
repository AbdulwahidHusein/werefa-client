"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Server,
  Database,
  Radio,
  Zap,
  RefreshCw,
  Clock,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getSystemHealthAction } from "@/app/admin/actions";

type HealthData = {
  database_reachable: boolean;
  realtime_redis_enabled: boolean;
  websocket_subscribers_total: number;
  websocket_subscribers_by_line: Record<string, number>;
  environment: string;
  checked_at: string;
};

export function SystemHealthMonitor({
  initialHealth,
}: {
  initialHealth: HealthData | null;
}) {
  const [health, setHealth] = useState<HealthData | null>(initialHealth);
  const [isPending, startTransition] = useTransition();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [latency, setLatency] = useState<number | null>(null);

  // Load health data and track latency
  function loadHealth() {
    const start = performance.now();
    startTransition(async () => {
      const res = await getSystemHealthAction();
      const end = performance.now();
      if (res.ok && res.health) {
        setHealth(res.health);
        setLatency(Math.round(end - start));
        setCountdown(30); // reset countdown
      } else {
        setLatency(null);
      }
    });
  }

  // Countdown timer for auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadHealth();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const checkedAtTime = health?.checked_at
    ? new Date(health.checked_at).toLocaleTimeString()
    : "Never";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Control panel header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-500">
            Environment Mode:{" "}
            <strong className="text-foreground capitalize">{health?.environment || "production"}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Auto Refresh Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent" />
            <span className="text-xs font-semibold text-zinc-500">
              {autoRefresh ? `Auto-syncing in ${countdown}s` : "Auto-sync disabled"}
            </span>
          </label>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadHealth}
            disabled={isPending}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3.5 text-xs font-semibold hover:bg-surface active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted ${isPending ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* API Server status */}
        <div className="rounded-3xl border border-border bg-background p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
              <Server className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Operational</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">API Server Gateway</h4>
            <p className="text-[10px] text-muted font-semibold mt-1">
              Gateway Latency: {latency ? `${latency}ms` : "responsive"}
            </p>
          </div>
        </div>

        {/* Database status */}
        <div className="rounded-3xl border border-border bg-background p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${
              health?.database_reachable
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-rose-50 text-rose-700 border-rose-100"
            }`}>
              <Database className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                health?.database_reachable ? "bg-emerald-500" : "bg-rose-500"
              }`} />
              <span className={`text-[10px] font-bold uppercase ${
                health?.database_reachable ? "text-emerald-700" : "text-rose-700"
              }`}>
                {health?.database_reachable ? "Connected" : "Offline"}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Postgres Database</h4>
            <p className="text-[10px] text-muted font-semibold mt-1">
              {health?.database_reachable
                ? "Transactional query loop is healthy"
                : "SQL connection pool exhausted"}
            </p>
          </div>
        </div>

        {/* Redis Backplane status */}
        <div className="rounded-3xl border border-border bg-background p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${
              health?.realtime_redis_enabled
                ? "bg-purple-50 text-purple-700 border-purple-100"
                : "bg-zinc-50 text-zinc-700 border-zinc-100"
            }`}>
              <Radio className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${
                health?.realtime_redis_enabled ? "bg-purple-500 animate-pulse" : "bg-zinc-400"
              }`} />
              <span className={`text-[10px] font-bold uppercase ${
                health?.realtime_redis_enabled ? "text-purple-700" : "text-zinc-500"
              }`}>
                {health?.realtime_redis_enabled ? "Active PubSub" : "Inactive"}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Redis Cache Memory</h4>
            <p className="text-[10px] text-muted font-semibold mt-1">
              {health?.realtime_redis_enabled
                ? "PubSub event distributor is active"
                : "Local process memory fallbacks active"}
            </p>
          </div>
        </div>

        {/* WebSocket Gateway status */}
        <div className="rounded-3xl border border-border bg-background p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-100">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Gateway OK</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">WebSocket Coordinator</h4>
            <p className="text-[10px] text-muted font-semibold mt-1">
              Active clients: <strong className="text-foreground">{health?.websocket_subscribers_total || 0}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Telemetry WebSocket Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-border bg-background p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-muted" />
            <h3 className="text-xs font-bold text-foreground">WebSocket Listeners by Service Line</h3>
          </div>

          <div className="divide-y divide-border">
            {!health?.websocket_subscribers_by_line ||
            Object.keys(health.websocket_subscribers_by_line).length === 0 ? (
              <div className="py-8 text-center text-muted font-semibold text-[10px]">
                No active WebSocket connections found.
              </div>
            ) : (
              Object.entries(health.websocket_subscribers_by_line).map(([lineId, count]) => (
                <div key={lineId} className="flex items-center justify-between py-3 text-xs">
                  <span className="font-mono text-[10px] font-semibold text-zinc-500 truncate max-w-[220px]">
                    Service Line ID: {lineId}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {count} listener{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timestamp overview card */}
        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted" />
              <h3 className="text-xs font-bold text-foreground">Status Refresh Tracker</h3>
            </div>
            <p className="text-[10px] text-muted leading-relaxed font-semibold">
              The health monitoring gateway captures operational metrics from Postgres transactional states and the WebSocket lifecycles.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-surface/50 p-4 border border-border">
            <span className="text-[9px] uppercase font-bold text-muted">Last Gateway Check</span>
            <p className="text-sm font-bold text-foreground font-mono">{checkedAtTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
