"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapPinIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { SERVICE_CATEGORIES } from "@/lib/categories";
import { SORT_OPTIONS, toSearchParams, type BrowseQuery } from "@/lib/services/query";

const ALL = "all";

/**
 * Search, category, location and price-sort controls. Every change is written
 * to the URL (so results are shareable and survive reloads); text inputs are
 * debounced. Changing a filter resets to page 1.
 */
export function BrowseFilters({ query }: { query: BrowseQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(query.q ?? "");
  const [location, setLocation] = useState(query.location ?? "");
  // Latest query for debounced callbacks (updated after each render, not during it).
  const latest = useRef(query);
  useEffect(() => {
    latest.current = query;
  }, [query]);

  function navigate(next: Partial<BrowseQuery>) {
    const params = toSearchParams({ ...latest.current, ...next, page: 1 });
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Debounce free-text inputs.
  useEffect(() => {
    const value = q.trim() || undefined;
    if (value === (latest.current.q ?? undefined)) return;
    const timer = setTimeout(() => navigate({ q: value }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    const value = location.trim() || undefined;
    if (value === (latest.current.location ?? undefined)) return;
    const timer = setTimeout(() => navigate({ location: value }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const hasFilters = Boolean(query.q || query.category || query.location || query.sort !== "newest");

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-5" role="search" aria-label="Filter services">
      <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:items-center">
        <label className="relative block">
          <span className="sr-only">Search services</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search by name, e.g. photography"
            maxLength={80}
            className="h-11 rounded-full pl-10"
          />
        </label>

        <Select
          value={query.category ?? ALL}
          onValueChange={(value) => navigate({ category: value === ALL ? undefined : (value as BrowseQuery["category"]) })}
        >
          <SelectTrigger className="h-11! w-full rounded-full" aria-label="Category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {SERVICE_CATEGORIES.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="relative block">
          <span className="sr-only">Location</span>
          <MapPinIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location, e.g. New York"
            maxLength={80}
            className="h-11 rounded-full pl-10"
          />
        </label>

        <Select value={query.sort} onValueChange={(value) => navigate({ sort: value as BrowseQuery["sort"] })}>
          <SelectTrigger className="h-11! w-full rounded-full" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(hasFilters || pending) && (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground" aria-live="polite">
            {pending && (
              <>
                <Spinner /> Updating results…
              </>
            )}
          </span>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setQ("");
                setLocation("");
                startTransition(() => router.replace(pathname, { scroll: false }));
              }}
            >
              <XIcon data-icon="inline-start" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
