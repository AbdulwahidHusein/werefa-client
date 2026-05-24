/** Provider business categories (shared by setup + profile). */
export const PROVIDER_CATEGORIES = [
  "clinic",
  "dental",
  "pharmacy",
  "hospital",
  "salon",
  "barbershop",
  "bank",
  "telecom",
  "government",
  "university",
  "school",
  "restaurant",
  "hotel",
  "laundry",
  "fitness",
  "legal",
  "accounting",
  "auto",
  "other",
] as const;

export function formatCategoryLabel(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
