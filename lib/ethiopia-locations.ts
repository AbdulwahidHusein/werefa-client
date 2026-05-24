/** Ethiopia's 14 regional states / chartered cities (for filters & business profiles). */
export const ETHIOPIA_REGIONS = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Central Ethiopia",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South Ethiopia",
  "South West Ethiopia Peoples",
  "Tigray",
] as const;

export type EthiopiaRegion = (typeof ETHIOPIA_REGIONS)[number];

/** Cities grouped by region — used for dependent dropdowns in forms & discovery. */
export const CITIES_BY_REGION: Record<EthiopiaRegion, readonly string[]> = {
  "Addis Ababa": ["Addis Ababa"],
  Afar: ["Semera", "Asayita", "Dubti", "Awash"],
  Amhara: [
    "Bahir Dar",
    "Gondar",
    "Dessie",
    "Debre Markos",
    "Kombolcha",
    "Lalibela",
    "Debre Birhan",
    "Woldia",
  ],
  "Benishangul-Gumuz": ["Asosa", "Assosa", "Menge"],
  "Central Ethiopia": ["Hosaena", "Wolkite", "Butajira"],
  "Dire Dawa": ["Dire Dawa"],
  Gambela: ["Gambela", "Itang"],
  Harari: ["Harar"],
  Oromia: [
    "Adama",
    "Jimma",
    "Ambo",
    "Nekemte",
    "Bishoftu",
    "Shashemene",
    "Asella",
    "Burayu",
    "Holeta",
    "Sebeta",
  ],
  Sidama: ["Hawassa", "Yirgalem", "Dilla"],
  Somali: ["Jijiga", "Gode", "Dire Dawa", "Kebri Dehar"],
  "South Ethiopia": ["Arba Minch", "Sodo", "Dilla", "Bonga", "Mizan Teferi"],
  "South West Ethiopia Peoples": ["Bonga", "Mizan Teferi", "Tepi", "Maji"],
  Tigray: ["Mekelle", "Adigrat", "Shire", "Axum", "Humera"],
};

/** Flat sorted list of all cities (25+) for filters when no region is selected. */
export const ALL_ETHIOPIA_CITIES: string[] = [
  ...new Set(
    Object.values(CITIES_BY_REGION).flatMap((cities) => [...cities]),
  ),
].sort((a, b) => a.localeCompare(b));

export function citiesForRegion(region: string): string[] {
  if (!region) return [...ALL_ETHIOPIA_CITIES];
  const list = CITIES_BY_REGION[region as EthiopiaRegion];
  return list ? [...list] : [];
}

export function formatLocation(region?: string | null, city?: string | null): string {
  if (city && region && city !== region) return `${city}, ${region}`;
  return (city || region || "").trim();
}
