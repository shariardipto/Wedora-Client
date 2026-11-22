import Link from "next/link";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { BookingThumb, serviceTitle } from "@/components/bookings/booking-parts";
import type { Booking } from "@/lib/bookings/types";
import { formatEventDate } from "@/lib/format";

/** Compact booking rows for overview panels. `perspective` decides whose name is shown. */
export function BookingMiniList({
  bookings,
  perspective,
  href,
}: {
  bookings: Booking[];
  perspective: "customer" | "vendor";
  href: string;
}) {
  return (
    <ul className="divide-y">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <Link
            href={href}
            className="flex items-center gap-3 rounded-lg py-3 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <BookingThumb booking={booking} className="size-11" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {perspective === "vendor" ? (booking.customer?.name ?? "Customer") : serviceTitle(booking)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {perspective === "vendor" ? serviceTitle(booking) : (booking.vendor?.businessName ?? booking.vendor?.name)}
                {" · "}
                {formatEventDate(booking.eventDate)}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} className="shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
