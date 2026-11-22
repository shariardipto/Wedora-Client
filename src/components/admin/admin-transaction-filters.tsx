"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toAdminTransactionSearch, type AdminTransactionQuery } from "@/lib/admin/transaction-query";

const ALL = "all";

/** URL-driven vendor search + status filter for Transactions. */
export function AdminTransactionFilters({ query }: { query: AdminTransactionQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(query.q ?? "");
  const latest = useRef(query);
  useEffect(() => {
    latest.current = query;
  }, [query]);

  function navigate(next: Partial<AdminTransactionQuery>) {
    const qs = toAdminTransactionSearch({ ...latest.current, ...next, page: 1 }).toString();
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
    <div className="grid grid-cols-1 gap-3 rounded-2xl bg-card p-4 ring-1 ring-border md:grid-cols-[1.6fr_1fr_auto] md:items-center" role="search">
      <label className="relative block">
        <span className="sr-only">Search by vendor name, business or email</span>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search by vendor name, business or email"
          maxLength={80}
          className="h-11 rounded-full pl-10"
        />
      </label>
      <Select value={query.status ?? ALL} onValueChange={(value) => navigate({ status: value === ALL ? undefined : value })}>
        <SelectTrigger className="h-11! w-full rounded-full" aria-label="Payment status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Any status</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>
      <span className="flex h-11 w-6 items-center justify-center" aria-live="polite">
        {pending && <Spinner />}
      </span>
    </div>
  );
}
