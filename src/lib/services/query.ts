import { isCategorySlug, type ServiceCategorySlug } from "@/lib/categories";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type BrowseQuery = {
  q?: string;
  category?: ServiceCategorySlug;
  location?: string;
  sort: SortValue;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

/** Normalizes untrusted URL search params into a safe browse query. */
export function parseBrowseQuery(params: RawParams): BrowseQuery {
  const category = first(params.category);
  const sort = first(params.sort);
  const page = Number.parseInt(first(params.page) ?? "1", 10);
  return {
    q: first(params.q)?.slice(0, 80),
    category: isCategorySlug(category) ? category : undefined,
    location: first(params.location)?.slice(0, 80),
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as SortValue) : "newest",
    page: Number.isFinite(page) && page >= 1 && page <= 1000 ? page : 1,
  };
}

/** Serializes a query for both the browser URL and the API call (defaults omitted). */
export function toSearchParams(query: Partial<BrowseQuery>, extra: Record<string, string> = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.location) params.set("location", query.location);
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  return params;
}
