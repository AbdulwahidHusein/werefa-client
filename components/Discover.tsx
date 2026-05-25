"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, List, Map, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DiscoverMap } from "./DiscoverMap";
import { LocationPrompt } from "./LocationPrompt";
import { ProviderCard } from "./ProviderCard";
import {
  ALL_ETHIOPIA_CITIES,
  citiesForRegion,
  ETHIOPIA_REGIONS,
} from "@/lib/ethiopia-locations";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import {
  cacheLocation,
  clearCachedLocation,
  type Coords,
  readCachedLocation,
} from "@/lib/geo";

type DiscoveryResponse = components["schemas"]["ProviderDiscoveriesPublic"];
type ViewMode = "list" | "map";

const selectClass =
  "h-10 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

const selectCompact =
  "h-8 w-full min-w-0 max-w-full truncate rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

function ViewToggle({
  view,
  onViewChange,
  className = "",
}: {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 rounded-lg border border-border bg-surface p-0.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => onViewChange("list")}
        className={`flex cursor-pointer items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-xs ${
          view === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <List className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
        List
      </button>
      <button
        type="button"
        onClick={() => onViewChange("map")}
        className={`flex cursor-pointer items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-xs ${
          view === "map"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <Map className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
        Map
      </button>
    </div>
  );
}

const RESULTS_GRID =
  "flex flex-col gap-2 min-w-0 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4";

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
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounced(search.trim(), 300);
  const locationFilterCount = (region ? 1 : 0) + (city ? 1 : 0);

  useEffect(() => {
    setCoords(readCachedLocation());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (city && region && !citiesForRegion(region).includes(city)) {
      setCity("");
    }
  }, [region, city]);

  const cityOptions = useMemo(
    () => (region ? citiesForRegion(region) : ALL_ETHIOPIA_CITIES),
    [region],
  );

  const discoverQuery = useQuery<DiscoveryResponse>({
    enabled: !!coords,
    queryKey: [
      "discover",
      coords?.lat,
      coords?.lng,
      debouncedSearch || null,
      region || null,
      city || null,
    ],
    queryFn: () =>
      api<DiscoveryResponse>("/providers/discover", {
        query: {
          latitude: coords!.lat,
          longitude: coords!.lng,
          query: debouncedSearch || undefined,
          region: region || undefined,
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
  const hasFilters = Boolean(region || city || debouncedSearch);

  function clearAllFilters() {
    setRegion("");
    setCity("");
    setSearch("");
    setFiltersOpen(false);
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 overflow-x-hidden pb-2 sm:gap-4">
      {/* Compact toolbar — ~10% viewport on typical phones */}
      <div className="sticky top-0 z-20 -mx-1 min-w-0 border-b border-border/60 bg-background/95 px-1 pb-1.5 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:backdrop-blur-none">
        <div className="flex min-w-0 gap-1.5">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              type="search"
              inputMode="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses…"
              className="block h-9 w-full min-w-0 rounded-lg border border-border bg-background pl-8 pr-2 text-base placeholder:text-xs placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:h-10 sm:rounded-xl sm:pl-9 sm:placeholder:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              clearCachedLocation();
              setCoords(null);
              clearAllFilters();
            }}
            aria-label="Change location"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-border bg-background text-muted hover:bg-surface hover:text-foreground sm:h-10 sm:w-10 sm:rounded-xl"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden />
          </button>
          {/* <ViewToggle
            view={view}
            onViewChange={setView}
            className="hidden sm:flex"
          /> */}
        </div>

        {/* Mobile: filters + map toggle in one slim row */}
        <div className="mt-1.5 flex min-w-0 gap-1.5 sm:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className="flex h-8 min-w-0 flex-1 cursor-pointer items-center gap-1 overflow-hidden rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-foreground"
          >
            <SlidersHorizontal className="h-3 w-3 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">
              {locationFilterCount > 0
                ? `${region || "Region"}${city ? ` · ${city}` : ""}`
                : "Region & city"}
            </span>
            {locationFilterCount > 0 ? (
              <span className="flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-bold text-accent-foreground">
                {locationFilterCount}
              </span>
            ) : null}
            <ChevronDown
              className={`ml-auto h-3 w-3 shrink-0 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        {filtersOpen ? (
          <div className="mt-1.5 grid min-w-0 grid-cols-2 gap-1.5 overflow-hidden sm:hidden">
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setCity("");
              }}
              className={selectCompact}
              aria-label="Filter by region"
            >
              <option value="">All regions</option>
              {ETHIOPIA_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={selectCompact}
              aria-label="Filter by city"
            >
              <option value="">All cities</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="col-span-2 text-left text-[11px] font-medium text-accent"
              >
                Clear all
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Desktop: filter row */}
        <div className="mt-2 hidden min-w-0 gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <label className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Region
            </span>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setCity("");
              }}
              className={selectClass}
              aria-label="Filter by region"
            >
              <option value="">All regions</option>
              {ETHIOPIA_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              City
            </span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={selectClass}
              aria-label="Filter by city"
            >
              <option value="">All cities</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="flex min-w-0 flex-col justify-end">
            <ViewToggle view={view} onViewChange={setView} className="rounded-xl p-0.5" />
          </div>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-1 hidden text-xs font-medium text-accent hover:underline sm:inline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Results */}
      {discoverQuery.isLoading ? (
        <SkeletonList />
      ) : discoverQuery.isError ? (
        <p className="text-sm text-danger" role="alert">
          {(discoverQuery.error as Error)?.message ?? "Could not load providers."}
        </p>
      ) : providers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center sm:rounded-2xl sm:p-10">
          <p className="text-sm font-medium sm:text-base">Nothing nearby</p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs text-muted sm:mt-2 sm:text-sm">
            Try another region, city, or search term — or update your location.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-muted sm:text-sm">
            <span className="font-medium text-foreground">{providers.length}</span>{" "}
            {providers.length === 1 ? "business" : "businesses"} near you
          </p>

          {view === "map" ? (
            <div className="min-h-0 min-w-0 lg:grid lg:grid-cols-5 lg:gap-6">
              <div className="hidden min-h-0 min-w-0 lg:col-span-2 lg:block">
                <ul className="flex max-h-[calc(100dvh-10rem)] flex-col gap-2 overflow-y-auto overscroll-contain pr-1">
                  {providers.map((p) => (
                    <li key={p.id} className="min-w-0">
                      <ProviderCard p={p} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-w-0 lg:col-span-3 lg:sticky lg:top-4 lg:self-start">
                <DiscoverMap
                  providers={providers}
                  center={coords}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            </div>
          ) : (
            <ul className={RESULTS_GRID}>
              {providers.map((p) => (
                <li key={p.id} className="min-w-0 max-w-full">
                  <ProviderCard p={p} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className={RESULTS_GRID}>
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="h-[72px] animate-pulse rounded-xl border border-border bg-surface sm:h-[188px] sm:rounded-2xl"
        />
      ))}
    </ul>
  );
}
