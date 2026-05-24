"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api/client";

export function useLocationTracking({
  serviceId,
  ticketId,
  enabled = true,
}: {
  serviceId: string;
  ticketId: string;
  enabled?: boolean;
}) {
  const [permission, setPermission] = useState<PermissionState | "unsupported" | "not-requested">("not-requested");
  const [status, setStatus] = useState<"idle" | "sharing" | "denied" | "error" | "unsupported">("idle");
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const pingInFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    if (typeof window === "undefined" || !navigator.geolocation) {
      setPermission("unsupported");
      setStatus("unsupported");
      return;
    }

    // Check existing permission state if possible
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          setPermission(result.state);
          if (result.state === "denied") {
            setStatus("denied");
          }
          result.onchange = () => {
            setPermission(result.state);
            if (result.state === "denied") {
              setStatus("denied");
            }
          };
        })
        .catch((err) => {
          console.warn("Failed to query geolocation permission", err);
        });
    }

    let intervalId: NodeJS.Timeout;

    async function sendPing(pos: GeolocationPosition) {
      if (pingInFlightRef.current) return;
      pingInFlightRef.current = true;
      try {
        await api(
          `/service-items/${serviceId}/tickets/${ticketId}/position`,
          {
            method: "POST",
            body: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy_m: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null,
            },
          }
        );
        setLastPingTime(new Date());
        setStatus("sharing");
        setErrorMsg(null);
      } catch (err: any) {
        console.error("Failed to submit location ping", err);
        setErrorMsg(err.message || "Failed to update location");
        setStatus("error");
      } finally {
        pingInFlightRef.current = false;
      }
    }

    function handleSuccess(pos: GeolocationPosition) {
      setPermission("granted");
      sendPing(pos);
    }

    function handleError(err: GeolocationPositionError) {
      console.warn("Geolocation watch error", err);
      if (err.code === err.PERMISSION_DENIED) {
        setPermission("denied");
        setStatus("denied");
        setErrorMsg("Location access denied. Please enable it to keep your queue spot.");
      } else {
        setStatus("error");
        setErrorMsg(err.message || "Could not retrieve your location.");
      }
    }

    // Prompt immediately on mount/activation
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
    });

    // Setup interval to ping location periodically
    intervalId = setInterval(() => {
      if (!enabledRef.current) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendPing(pos);
        },
        (err) => {
          console.warn("Interval location fetch failed", err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [serviceId, ticketId, enabled]);

  function requestPermission() {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setStatus("idle");
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermission("granted");
        setStatus("sharing");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermission("denied");
          setStatus("denied");
        } else {
          setStatus("error");
        }
      },
      { enableHighAccuracy: true }
    );
  }

  return { permission, status, lastPingTime, errorMsg, requestPermission };
}
