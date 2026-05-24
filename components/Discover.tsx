"use client";

import { useQuery } from "@tanstack/react-query";
import { List, Map, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { DiscoverMap } from "./DiscoverMap";
import { LocationPrompt } from "./LocationPrompt";
import { ProviderCard } from "./ProviderCard";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import {
  cacheLocation,
  clearCachedLocation,
  type Coords,
  readCachedLocation,
} from "@/lib/geo";

type DiscoveryResponse = components["schemas"]["ProviderDiscoveriesPublic"];
type CitiesResponse = { data: string[]; count: number };

type ViewMode = "list" | "map";

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function Discover() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounced(search.trim(), 300);

  useEffect(() => {
    setCoords(readCachedLocation());
    setHydrated(true);
  }, []);

  const citiesQuery = useQuery<CitiesResponse>({
    queryKey: ["discover-cities"],
    queryFn: () => api<CitiesResponse>("/providers/discover/cities"),
    staleTime: 5 * 60_000,
  });

  const discoverQuery = useQuery<DiscoveryResponse>({
    enabled: !!coords,
    queryKey: [
      "discover",
      coords?.lat,
      coords?.lng,
      debouncedSearch || null,
      city || null,
    ],
    queryFn: () =>
      api<DiscoveryResponse>("/providers/discover", {
        query: {
          latitude: coords!.lat,
          longitude: coords!.lng,
          query: debouncedSearch || undefined,
          city: city || undefined,
          limit: 80,
        },
      }),
  });

  if (!hydrated) return null;

  if (!coords) {
    return (
      <LocationPrompt
        onLocation={(c) => {
          cacheLocation(c);
          setCoords(c);
        }}
      />
    );
  }

  const providers = discoverQuery.data?.data ?? [];
  const cities = citiesQuery.data?.data ?? [];

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            inputMode="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, category, or city"
            className="block h-12 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-base placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            clearCachedLocation();
            setCoords(null);
            setCity("");
          }}
          aria-label="Change location"
          className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-2xl border border-border bg-background text-muted hover:bg-surface hover:text-foreground"
        >
          <MapPin className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {cities.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            City
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setCity("")}
              className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                city === ""
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-background text-muted hover:border-accent/40"
              }`}
            >
              All cities
            </button>
            {cities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  city === c
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-muted hover:border-accent/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex rounded-xl border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            view === "list"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <List className="h-4 w-4" aria-hidden />
          List
        </button>
        <button
          type="button"
          onClick={() => setView("map")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            view === "map"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Map className="h-4 w-4" aria-hidden />
          Map
        </button>
      </div>

      {discoverQuery.isLoading ? (
        <SkeletonList />
      ) : discoverQuery.isError ? (
        <p className="text-sm text-danger" role="alert">
          {(discoverQuery.error as Error)?.message ?? "Could not load providers."}
        </p>
      ) : providers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">Nothing nearby</p>
          <p className="mt-1 text-sm text-muted">
            Try another city, search term, or update your location.
          </p>
        </div>
      ) : view === "map" ? (
        <DiscoverMap
          providers={providers}
          center={coords}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {providers.map((p) => (
            <li key={p.id}>
              <ProviderCard p={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="h-[88px] animate-pulse rounded-2xl border border-border bg-surface"
        />
      ))}
    </ul>
  );
}
