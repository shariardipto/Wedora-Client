import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarCheck2Icon,
  CalendarClockIcon,
  CalendarHeartIcon,
  CalendarXIcon,
  SearchIcon,
} from "lucide-react";
import { BookingMiniList } from "@/components/dashboard/booking-mini-list";
import { OverviewHeader, OverviewPanel, PhotoPrompt, StatCard, type HeaderStatus } from "@/components/dashboard/overview-parts";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/api-server";
import { requireRole } from "@/lib/auth/session";
import { countOf } from "@/lib/format";
import type { Booking } from "@/lib/bookings/types";
import type { CustomerStats } from "@/lib/dashboard/types";

export const metadata: Metadata = { title: "Customer Overview" };

const BOOKINGS = "/dashboard/customer/bookings";

/** What needs attention, as the header's status chip. */
function customerStatus(stats: CustomerStats): HeaderStatus {
  if (stats.totalBookings === 0) return { tone: "neutral", label: "No booking requests yet" };
  if (stats.pendingBookings > 0) {
    return { tone: "amber", label: `${countOf(stats.pendingBookings, "request")} awaiting a reply`, href: `${BOOKINGS}?status=pending` };
  }
  if (stats.acceptedBookings > 0) {
    return { tone: "green", label: `${countOf(stats.acceptedBookings, "booking")} confirmed`, href: `${BOOKINGS}?status=accepted` };
  }
  return { tone: "neutral", label: "Every request has an answer" };
}

export default async function CustomerDashboardPage() {
  const { user } = await requireRole("customer");
  const [{ data: stats }, { data: bookings }] = await Promise.all([
    serverApi<CustomerStats>("/api/customer/stats", { auth: true }),
    serverApi<Booking[]>("/api/customer/bookings", { auth: true }),
  ]);

  return (
    <div className="space-y-8">
      <OverviewHeader
        role="customer"
        name={user.name}
        image={user.image}
        status={customerStatus(stats)}
        action={{ label: "Browse Services", href: "/services", icon: SearchIcon }}
      />
      <PhotoPrompt role="customer" image={user.image} />

      <section aria-label="Booking statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total requests" value={stats.totalBookings} icon={CalendarHeartIcon} href={BOOKINGS} hint="Every booking request you’ve sent" />
        <StatCard label="Pending" value={stats.pendingBookings} icon={CalendarClockIcon} tone="amber" href={`${BOOKINGS}?status=pending`} hint="Waiting for the vendor" />
        <StatCard label="Accepted" value={stats.acceptedBookings} icon={CalendarCheck2Icon} tone="green" href={`${BOOKINGS}?status=accepted`} hint="Confirmed by the vendor" />
        <StatCard label="Rejected" value={stats.rejectedBookings} icon={CalendarXIcon} tone="red" href={`${BOOKINGS}?status=rejected`} hint="Declined — try another date or vendor" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <OverviewPanel
          title="Recent booking requests"
          action={
            bookings.length > 0 && (
              <Link href={BOOKINGS} className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            )
          }
        >
          {bookings.length > 0 ? (
            <BookingMiniList bookings={bookings.slice(0, 4)} perspective="customer" href={BOOKINGS} />
          ) : (
            <p className="text-sm text-muted-foreground">
              You haven’t requested any bookings yet. Find a service you love and pick your date.
            </p>
          )}
        </OverviewPanel>

        <OverviewPanel title="Plan your next step" className="bg-primary text-primary-foreground ring-0">
          <p className="text-sm leading-6 text-primary-foreground/80">
            Browse approved photographers, venues, florists, caterers, stylists and fashion — then request your date.
          </p>
          <Button asChild className="mt-5 h-10 rounded-full bg-background px-5 text-primary hover:bg-background/90">
            <Link href="/services">
              <SearchIcon data-icon="inline-start" />
              Browse services
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </OverviewPanel>
      </div>
    </div>
  );
}
