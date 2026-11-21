"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toAdminSearch, type AdminServiceQuery } from "@/lib/admin/service-query";
import { SERVICE_CATEGORIES } from "@/lib/categories";

const ALL = "all";

/** URL-driven search + filters for the admin service table. */
export function AdminServiceFilters({ query }: { query: AdminServiceQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(query.q ?? "");
  const latest = useRef(query);
  useEffect(() => {
    latest.current = query;
  }, [query]);

  function navigate(next: Partial<AdminServiceQuery>) {
    const qs = toAdminSearch({ ...latest.current, ...next, page: 1 }).toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  useEffect(() => {
    const value = q.trim() || undefined;
    if (value === latest.current.q) return;
    const timer = setTimeout(() => navigate({ q: value }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-border md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center" role="search">
      <label className="relative block">
        <span className="sr-only">Search services or vendors</span>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search service, location or vendor"
          maxLength={80}
          className="h-11 rounded-full pl-10"
        />
      </label>
      <Select value={query.status ?? ALL} onValueChange={(value) => navigate({ status: value === ALL ? undefined : value })}>
        <SelectTrigger className="h-11! w-full rounded-full" aria-label="Status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          <SelectItem value="pending">Pending review</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Select value={query.category ?? ALL} onValueChange={(value) => navigate({ category: value === ALL ? undefined : value })}>
        <SelectTrigger className="h-11! w-full rounded-full" aria-label="Category">
          <SelectValue />
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
      <span className="flex h-11 w-6 items-center justify-center" aria-live="polite">
        {pending && <Spinner />}
      </span>
    </div>
  );
}
