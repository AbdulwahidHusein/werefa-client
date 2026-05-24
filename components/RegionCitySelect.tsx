"use client";

import {
  ALL_ETHIOPIA_CITIES,
  citiesForRegion,
  ETHIOPIA_REGIONS,
} from "@/lib/ethiopia-locations";

const selectClass =
  "block h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

type Props = {
  region: string;
  city: string;
  onRegionChange: (region: string) => void;
  onCityChange: (city: string) => void;
  regionName?: string;
  cityName?: string;
  required?: boolean;
  disabled?: boolean;
  /** Use canonical Ethiopia lists instead of free text */
  useCanonicalLists?: boolean;
};

export function RegionCitySelect({
  region,
  city,
  onRegionChange,
  onCityChange,
  regionName = "region",
  cityName = "city",
  required = false,
  disabled = false,
  useCanonicalLists = true,
}: Props) {
  const cityOptions = useCanonicalLists
    ? citiesForRegion(region)
    : ALL_ETHIOPIA_CITIES;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Region
          {required ? <span className="text-danger"> *</span> : null}
        </label>
        {useCanonicalLists ? (
          <select
            name={regionName}
            value={region}
            disabled={disabled}
            required={required}
            onChange={(e) => {
              const next = e.target.value;
              onRegionChange(next);
              if (city && !citiesForRegion(next).includes(city)) {
                onCityChange("");
              }
            }}
            className={selectClass}
          >
            <option value="">Select region…</option>
            {ETHIOPIA_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={regionName}
            value={region}
            disabled={disabled}
            required={required}
            onChange={(e) => onRegionChange(e.target.value)}
            className={selectClass}
            placeholder="Oromia"
            maxLength={100}
          />
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          City
          {required ? <span className="text-danger"> *</span> : null}
        </label>
        {useCanonicalLists ? (
          <select
            name={cityName}
            value={city}
            disabled={disabled || (!region && cityOptions.length > 30)}
            required={required}
            onChange={(e) => onCityChange(e.target.value)}
            className={selectClass}
          >
            <option value="">
              {region ? "Select city…" : "Select region first…"}
            </option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={cityName}
            value={city}
            disabled={disabled}
            required={required}
            onChange={(e) => onCityChange(e.target.value)}
            className={selectClass}
            placeholder="Addis Ababa"
            maxLength={100}
          />
        )}
      </div>
    </div>
  );
}
