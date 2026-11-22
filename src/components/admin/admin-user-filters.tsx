"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toAdminUserSearch, type AdminUserQuery } from "@/lib/admin/user-query";

const ALL = "all";

/** URL-driven search + filters for Manage Users. */
export function AdminUserFilters({ query }: { query: AdminUserQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(query.q ?? "");
  const latest = useRef(query);
  useEffect(() => {
    latest.current = query;
  }, [query]);

  function navigate(next: Partial<AdminUserQuery>) {
    const qs = toAdminUserSearch({ ...latest.current, ...next, page: 1 }).toString();
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
    // Phones: search on its own row, the two filters side by side, the spinner inside the search box.
    <div className="grid grid-cols-2 gap-3 rounded-2xl bg-card p-3 ring-1 ring-border sm:p-4 md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center" role="search">
      <label className="relative col-span-2 block md:col-span-1">
        <span className="sr-only">Search by name or email</span>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search by name or email"
          maxLength={80}
          className="h-11 rounded-full pr-10 pl-10 md:pr-3"
        />
        {pending && <Spinner className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground md:hidden" />}
      </label>
      <Select value={query.role ?? ALL} onValueChange={(value) => navigate({ role: value === ALL ? undefined : value })}>
        <SelectTrigger className="h-11! w-full rounded-full" aria-label="Role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All roles</SelectItem>
          <SelectItem value="customer">Customers</SelectItem>
          <SelectItem value="vendor">Vendors</SelectItem>
          <SelectItem value="admin">Admins</SelectItem>
        </SelectContent>
      </Select>
      <Select value={query.status ?? ALL} onValueChange={(value) => navigate({ status: value === ALL ? undefined : value })}>
        <SelectTrigger className="h-11! w-full rounded-full" aria-label="Status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Any status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>
      <span className="hidden h-11 w-6 items-center justify-center md:flex" aria-live="polite">
        {pending && <Spinner />}
      </span>
    </div>
  );
}
