import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationNavProps = {
  page: number;
  totalPages: number;
  /** Builds the href for a page number (keeps the current filters). */
  hrefFor: (page: number) => string;
  className?: string;
};

function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) result.push("…");
    result.push(p);
  });
  return result;
}

/** Link-based pagination: every page is a real URL (shareable, reload-safe). */
export function PaginationNav({ page, totalPages, hrefFor, className }: PaginationNavProps) {
  if (totalPages <= 1) return null;
  const item =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(item, "hover:bg-muted")} aria-label="Previous page">
          <ChevronLeftIcon className="size-4" />
        </Link>
      ) : (
        <span className={cn(item, "text-muted-foreground/50")} aria-hidden="true">
          <ChevronLeftIcon className="size-4" />
        </span>
      )}
      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">…</span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(item, p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={cn(item, "hover:bg-muted")} aria-label="Next page">
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span className={cn(item, "text-muted-foreground/50")} aria-hidden="true">
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  );
}
