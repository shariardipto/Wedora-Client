import Link from "next/link";
import { BOOKING_STATUS_LABEL, BOOKING_STATUSES, type BookingStatus } from "@/lib/bookings/types";
import { cn } from "@/lib/utils";

/** URL-driven status filter with counts (reload-safe, shareable). */
export function BookingStatusTabs({
  basePath,
  active,
  counts,
}: {
  basePath: string;
  active: BookingStatus | undefined;
  counts: Record<BookingStatus | "all", number>;
}) {
  const tabs: { value: BookingStatus | undefined; label: string; count: number }[] = [
    { value: undefined, label: "All", count: counts.all },
    ...BOOKING_STATUSES.map((status) => ({ value: status, label: BOOKING_STATUS_LABEL[status], count: counts[status] })),
  ];

  return (
    <nav aria-label="Filter by status" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2">
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <li key={tab.label}>
              <Link
                href={tab.value ? `${basePath}?status=${tab.value}` : basePath}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground/80 ring-1 ring-border hover:bg-secondary hover:text-primary",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    isActive ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
