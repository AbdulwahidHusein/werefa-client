"use client";

import { useEffect, useState } from "react";
import { Navigation, ShieldCheck, ShieldAlert, ShieldAlert as DeniedIcon } from "lucide-react";

export function LocationShareStatus({
  status,
  lastPingTime,
  errorMsg,
  onRequestPermission,
}: {
  status: "idle" | "sharing" | "denied" | "error" | "unsupported";
  lastPingTime: Date | null;
  errorMsg: string | null;
  onRequestPermission: () => void;
}) {
  const [ago, setAgo] = useState<string>("never");

  useEffect(() => {
    if (!lastPingTime) return;
    const interval = setInterval(() => {
      const diffSecs = Math.round((Date.now() - lastPingTime.getTime()) / 1000);
      if (diffSecs < 5) setAgo("just now");
      else if (diffSecs < 60) setAgo(`${diffSecs}s ago`);
      else setAgo(`${Math.round(diffSecs / 60)}m ago`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastPingTime]);

  return (
    <div className="rounded-3xl border border-border bg-surface/30 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`grid h-8 w-8 place-items-center rounded-xl transition-colors ${
            status === "sharing"
              ? "bg-emerald-100 text-emerald-800"
              : status === "denied"
              ? "bg-rose-100 text-rose-800"
              : "bg-amber-100 text-amber-800"
          }`}>
            <Navigation className={`h-4 w-4 ${status === "sharing" ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Location Share Status</h4>
            <p className="text-[10px] text-muted font-medium">
              {status === "sharing"
                ? "Your spot is active and monitored nearby"
                : "Staff requires proximity pings to prevent no-show auto-removal"}
            </p>
          </div>
        </div>

        {status === "sharing" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
            <ShieldCheck className="h-3 w-3" />
            Sharing
          </span>
        ) : status === "denied" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
            <DeniedIcon className="h-3 w-3" />
            Blocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
            <ShieldAlert className="h-3 w-3" />
            Inactive
          </span>
        )}
      </div>

      {status === "sharing" && lastPingTime ? (
        <div className="flex justify-between items-center text-[10px] text-muted pt-1">
          <span>Proximity verification in progress</span>
          <span className="font-semibold text-foreground">Updated {ago}</span>
        </div>
      ) : null}

      {errorMsg ? (
        <div className="text-[10px] font-semibold text-rose-700 bg-rose-50/55 rounded-xl border border-rose-100/50 p-2.5">
          {errorMsg}
        </div>
      ) : null}

      {status !== "sharing" && (
        <button
          type="button"
          onClick={onRequestPermission}
          className="w-full rounded-2xl bg-accent hover:bg-accent-hover text-white py-2 text-xs font-semibold active:scale-95 transition-all cursor-pointer text-center"
        >
          Enable Location Access
        </button>
      )}
    </div>
  );
}
