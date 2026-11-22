import Image from "next/image";
import { CalendarIcon, ClockIcon, MapPinIcon, StoreIcon } from "lucide-react";
import type { Booking } from "@/lib/bookings/types";
import { formatDate, formatEventDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Square service thumbnail, or a placeholder when the service was deleted. */
export function BookingThumb({ booking, className }: { booking: Booking; className?: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-xl bg-muted", className)}>
      {booking.service?.image ? (
        <Image src={booking.service.image} alt="" fill sizes="160px" className="object-cover" />
      ) : (
        <div className="grid size-full place-items-center text-muted-foreground">
          <StoreIcon className="size-6" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

/** Event date, location and request date — the facts both sides need. */
export function BookingFacts({ booking, className }: { booking: Booking; className?: string }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2", className)}>
      <div className="flex items-start gap-2">
        <dt className="sr-only">Event date</dt>
        <CalendarIcon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
        <dd className="font-medium">{formatEventDate(booking.eventDate)}</dd>
      </div>
      <div className="flex min-w-0 items-start gap-2">
        <dt className="sr-only">Event location</dt>
        <MapPinIcon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
        <dd className="min-w-0 break-words">{booking.eventLocation}</dd>
      </div>
      <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
        <dt className="sr-only">Requested on</dt>
        <ClockIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {/* Local-time date may differ between server and browser render; the browser value wins. */}
        <dd suppressHydrationWarning>Requested {formatDate(booking.createdAt, "short")}</dd>
      </div>
    </dl>
  );
}

export function serviceTitle(booking: Booking) {
  return booking.service?.serviceName ?? "Service no longer available";
}
