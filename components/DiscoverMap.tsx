"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { GOOGLE_MAPS_API_KEY } from "@/lib/env";
import { formatWait, loadColor } from "@/lib/format";
import type { components } from "@/lib/api/schema";
import type { Coords } from "@/lib/geo";

type Provider = components["schemas"]["ProviderDiscoveryPublic"];

type GoogleMaps = {
  maps: {
    Map: new (
      el: HTMLElement,
      opts: { center: { lat: number; lng: number }; zoom: number; mapId?: string },
    ) => { fitBounds: (b: unknown) => void; setCenter: (c: { lat: number; lng: number }) => void };
    LatLngBounds: new () => { extend: (p: { lat: number; lng: number }) => void };
    Marker: new (opts: {
      map: unknown;
      position: { lat: number; lng: number };
      title?: string;
    }) => { addListener: (ev: string, fn: () => void) => void };
    InfoWindow: new (opts: { content: string }) => {
      open: (opts: { anchor: unknown; map: unknown }) => void;
    };
  };
};

function loadGoogleMaps(): Promise<GoogleMaps> {
  const w = window as Window & { google?: GoogleMaps };
  if (w.google?.maps) return Promise.resolve(w.google);

  return new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error("Google Maps API key is not configured"));
      return;
    }
    const id = "google-maps-script";
    if (document.getElementById(id)) {
      const t = setInterval(() => {
        if (w.google?.maps) {
          clearInterval(t);
          resolve(w.google);
        }
      }, 50);
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly`;
    script.onload = () => {
      if (w.google?.maps) resolve(w.google);
      else reject(new Error("Google Maps failed to load"));
    };
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
}

export function DiscoverMap({
  providers,
  center,
  selectedId,
  onSelect,
}: {
  providers: Provider[];
  center: Coords;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<InstanceType<GoogleMaps["maps"]["Map"]> | null>(null);
  const markersRef = useRef<InstanceType<GoogleMaps["maps"]["Marker"]>[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const mappable = providers.filter(
    (p) => p.latitude != null && p.longitude != null,
  );

  useEffect(() => {
    let cancelled = false;
    setMapError(null);
    setReady(false);

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        const map = new google.maps.Map(containerRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 13,
        });
        mapRef.current = map;
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setMapError(err instanceof Error ? err.message : "Map unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    const google = (window as Window & { google?: GoogleMaps }).google;
    const map = mapRef.current;
    if (!ready || !google?.maps || !map) return;

    for (const m of markersRef.current) {
      (m as unknown as { setMap: (map: null) => void }).setMap(null);
    }
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: center.lat, lng: center.lng });

    for (const p of mappable) {
      const pos = { lat: p.latitude!, lng: p.longitude! };
      bounds.extend(pos);
      const marker = new google.maps.Marker({
        map,
        position: pos,
        title: p.biz_name,
      });
      marker.addListener("click", () => {
        onSelect(p.id);
        const wait = formatWait(p.estimated_wait_minutes);
        const content = `
          <div style="font-family:system-ui,sans-serif;max-width:220px;padding:4px">
            <strong>${p.biz_name}</strong>
            <p style="margin:6px 0 0;font-size:12px;color:#52525b">${wait} · ${p.active_tickets} in line</p>
            <a href="/p/${p.slug}" style="font-size:12px;color:#2563eb">View queue →</a>
          </div>`;
        new google.maps.InfoWindow({ content }).open({ anchor: marker, map });
      });
      markersRef.current.push(marker);
    }

    if (mappable.length > 0) {
      map.fitBounds(bounds);
    }
  }, [ready, mappable, center, onSelect]);

  const selected = mappable.find((p) => p.id === selectedId) ?? null;

  if (mapError) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm font-medium">Map view unavailable</p>
        <p className="mt-1 text-xs text-muted">
          Set <code className="text-foreground">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in
          your environment to enable the map. List view still works.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="h-[min(52vh,420px)] w-full overflow-hidden rounded-2xl border border-border bg-zinc-100"
        aria-label="Map of nearby businesses"
      />
      {selected ? (
        <Link
          href={`/p/${selected.slug}`}
          className="block rounded-2xl border border-accent/30 bg-accent/5 p-4 transition-colors hover:bg-accent/10"
        >
          <p className="font-semibold">{selected.biz_name}</p>
          <p className="mt-1 text-sm text-muted">
            <span
              className={`mr-1.5 inline-block h-2 w-2 rounded-full ${loadColor(selected.load_factor)}`}
            />
            {formatWait(selected.estimated_wait_minutes)} · {selected.active_tickets} in
            line
            {selected.city ? ` · ${selected.city}` : ""}
          </p>
        </Link>
      ) : (
        <p className="text-center text-xs text-muted">Tap a pin to see details</p>
      )}
    </div>
  );
}
