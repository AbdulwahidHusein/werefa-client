"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProviderLogo } from "@/components/ProviderLogo";
import { GOOGLE_MAPS_API_KEY } from "@/lib/env";
import { formatLocation } from "@/lib/ethiopia-locations";
import { formatWait, loadColor } from "@/lib/format";
import type { components } from "@/lib/api/schema";
import type { Coords } from "@/lib/geo";

type Provider = components["schemas"]["ProviderDiscoveryPublic"] & {
  region?: string | null;
  city?: string | null;
  profile_image_url?: string | null;
};

type GoogleMap = {
  fitBounds: (b: unknown, padding?: number) => void;
  panTo: (p: { lat: number; lng: number }) => void;
  setZoom: (z: number) => void;
  getZoom: () => number | undefined;
};

type GoogleMaps = {
  maps: {
    Map: new (
      el: HTMLElement,
      opts: { center: { lat: number; lng: number }; zoom: number },
    ) => GoogleMap;
    LatLngBounds: new () => { extend: (p: { lat: number; lng: number }) => void };
    Marker: new (opts: {
      map: unknown;
      position: { lat: number; lng: number };
      title?: string;
    }) => { addListener: (ev: string, fn: () => void) => void };
    InfoWindow: new () => {
      setContent: (html: string) => void;
      open: (opts: { anchor: unknown; map: unknown }) => void;
      close: () => void;
    };
    event: {
      addListenerOnce: (map: unknown, ev: string, fn: () => void) => void;
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

function infoContent(p: Provider) {
  const wait = formatWait(p.estimated_wait_minutes);
  return `
    <div style="font-family:system-ui,sans-serif;max-width:240px;padding:2px 0">
      <strong style="font-size:14px">${p.biz_name}</strong>
      <p style="margin:6px 0 0;font-size:12px;color:#52525b">${wait} · ${p.active_tickets} in line</p>
      <a href="/p/${p.slug}" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:600;color:#2563eb">View queue →</a>
    </div>`;
}

const FOCUS_ZOOM = 15;

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
  const mapRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<InstanceType<GoogleMaps["maps"]["Marker"]>[]>([]);
  const infoWindowRef = useRef<InstanceType<GoogleMaps["maps"]["InfoWindow"]> | null>(
    null,
  );
  const onSelectRef = useRef(onSelect);
  const [mapError, setMapError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  onSelectRef.current = onSelect;

  const mappable = useMemo(
    () => providers.filter((p) => p.latitude != null && p.longitude != null),
    [providers],
  );

  const providerKey = useMemo(
    () =>
      mappable
        .map((p) => `${p.id}:${p.latitude}:${p.longitude}`)
        .sort()
        .join("|"),
    [mappable],
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
        infoWindowRef.current = new google.maps.InfoWindow();
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
    const infoWindow = infoWindowRef.current;
    if (!ready || !google?.maps || !map || !infoWindow) return;

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
        onSelectRef.current(p.id);
        map.panTo(pos);
        const zoom = map.getZoom();
        if (zoom == null || zoom < FOCUS_ZOOM) map.setZoom(FOCUS_ZOOM);
        infoWindow.setContent(infoContent(p));
        infoWindow.open({ anchor: marker, map });
      });
      markersRef.current.push(marker);
    }

    if (mappable.length > 0) {
      map.fitBounds(bounds, 48);
      google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        const z = map.getZoom();
        if (z != null && z > FOCUS_ZOOM) map.setZoom(FOCUS_ZOOM);
        if (z != null && z < 11) map.setZoom(11);
      });
    }
  }, [ready, providerKey, center.lat, center.lng]);

  useEffect(() => {
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;
    if (!ready || !map || !selectedId) return;

    const p = mappable.find((x) => x.id === selectedId);
    if (!p?.latitude || !p.longitude) return;

    const pos = { lat: p.latitude, lng: p.longitude };
    map.panTo(pos);
    const zoom = map.getZoom();
    if (zoom == null || zoom < FOCUS_ZOOM) map.setZoom(FOCUS_ZOOM);

    const marker = markersRef.current[mappable.findIndex((x) => x.id === selectedId)];
    if (infoWindow && marker) {
      infoWindow.setContent(infoContent(p));
      infoWindow.open({ anchor: marker, map });
    }
  }, [ready, selectedId, mappable]);

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

  const selectedLocation = selected
    ? formatLocation(selected.region, selected.city)
    : "";

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div
        ref={containerRef}
        className="h-[min(62dvh,440px)] w-full min-w-0 overflow-hidden rounded-xl border-2 border-border bg-zinc-200 shadow-sm sm:h-[min(58vh,500px)] sm:rounded-2xl lg:h-[min(65vh,600px)]"
        aria-label="Map of nearby businesses"
      />
      {selected ? (
        <Link
          href={`/p/${selected.slug}`}
          className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-3 transition-colors hover:bg-accent/10 sm:p-4"
        >
          <ProviderLogo
            name={selected.biz_name}
            imageUrl={selected.profile_image_url}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{selected.biz_name}</p>
            <p className="mt-0.5 text-sm text-muted">
              <span
                className={`mr-1.5 inline-block h-2 w-2 rounded-full ${loadColor(selected.load_factor)}`}
              />
              {formatWait(selected.estimated_wait_minutes)} · {selected.active_tickets}{" "}
              in line
              {selectedLocation ? ` · ${selectedLocation}` : ""}
            </p>
          </div>
        </Link>
      ) : (
        <p className="text-center text-xs text-muted">Tap a pin for details</p>
      )}
    </div>
  );
}
