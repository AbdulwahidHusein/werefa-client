"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Loader2, Navigation, Compass } from "lucide-react";
import { api } from "@/lib/api/client";

type LivenessDetails = {
  ticket_id: string;
  liveness_state: string;
  liveness_deadline_at: string | null;
  last_ping_at: string | null;
  last_latitude: number | null;
  last_longitude: number | null;
  last_accuracy_m: number | null;
};

export function TicketLivenessStatus({
  livenessState,
}: {
  livenessState: string | undefined | null;
}) {
  const state = livenessState || "idle";

  const config = {
    ok: { color: "bg-emerald-500", label: "Online", text: "text-emerald-700 dark:text-emerald-400" },
    awaiting: { color: "bg-amber-500", label: "Away", text: "text-amber-700 dark:text-amber-400" },
    flagged: { color: "bg-rose-500", label: "Flagged", text: "text-rose-700 dark:text-rose-400" },
    idle: { color: "bg-zinc-400", label: "Offline", text: "text-muted" },
  }[state as "ok" | "awaiting" | "flagged" | "idle"] || { color: "bg-zinc-400", label: "Offline", text: "text-muted" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-surface/50 px-2 py-0.5 text-[10px] font-bold ${config.text}`}>
      <span className="relative flex h-1.5 w-1.5">
        {state !== "idle" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.color}`} />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.color}`} />
      </span>
      {config.label}
    </span>
  );
}

export function TicketLivenessDetailsPanel({
  serviceId,
  ticketId,
}: {
  serviceId: string;
  ticketId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<LivenessDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await api<LivenessDetails>(
          `/service-items/${serviceId}/tickets/${ticketId}/liveness`
        );
        setDetails(res);
      } catch (err: any) {
        console.error("Failed to load liveness status", err);
        setError(err.message || "Failed to load telemetry");
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [serviceId, ticketId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-muted text-xs gap-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Syncing telemetry...
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
        ⚠ {error || "No telemetry records found."}
      </div>
    );
  }

  const { last_ping_at, last_latitude, last_longitude, last_accuracy_m } = details;

  function formatTime(iso: string | null) {
    if (!iso) return "never";
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const secs = Math.round(diff / 1000);
    if (secs < 5) return "just now";
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    return date.toLocaleTimeString();
  }

  return (
    <div className="mt-3 border-t border-border pt-3 space-y-2 text-[10px] leading-relaxed">
      <div className="grid grid-cols-2 gap-2 text-muted">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-zinc-400" />
          <span>Last ping: <strong className="text-foreground">{formatTime(last_ping_at)}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-zinc-400" />
          <span>Accuracy: <strong className="text-foreground">{last_accuracy_m ? `${last_accuracy_m}m` : "unknown"}</strong></span>
        </div>
      </div>

      {last_latitude && last_longitude ? (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-muted">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
            <span>Coords: <strong className="text-foreground">{last_latitude.toFixed(5)}, {last_longitude.toFixed(5)}</strong></span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${last_latitude},${last_longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-surface hover:bg-zinc-200 border border-border px-2 py-1 text-[10px] font-semibold transition-colors cursor-pointer text-foreground"
          >
            <Navigation className="h-3 w-3 text-accent" />
            View Map
          </a>
        </div>
      ) : (
        <p className="text-[10px] text-muted italic">Location coordinates not yet verified.</p>
      )}
    </div>
  );
}
