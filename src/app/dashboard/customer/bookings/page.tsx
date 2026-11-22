import type { Metadata } from "next";
import Link from "next/link";
import { CalendarHeartIcon } from "lucide-react";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { BookingStatusTabs } from "@/components/bookings/status-tabs";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/api-server";
import { countByStatus, isBookingStatus, type Booking } from "@/lib/bookings/types";

export const metadata: Metadata = { title: "My Bookings" };

export default async function MyBookingsPage({ searchParams }: PageProps<"/dashboard/customer/bookings">) {
  const raw = (await searchParams).status;
  const status = isBookingStatus(raw) ? raw : undefined;

  // One request for all bookings: counts for every tab + the filtered list.
  const { data: bookings } = await serverApi<Booking[]>("/api/customer/bookings", { auth: true });
  const visible = status ? bookings.filter((booking) => booking.status === status) : bookings;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Customer"
        title="My Bookings"
        description="Every booking request you’ve sent, with its latest status. You can cancel requests that are still pending."
      />
      <BookingStatusTabs basePath="/dashboard/customer/bookings" active={status} counts={countByStatus(bookings)} />
      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarHeartIcon}
          title={status ? "No bookings with this status" : "No booking requests yet"}
          description={
            status
              ? "Try another filter to see the rest of your requests."
              : "Find a service you love and request your wedding date — it will show up here."
          }
          action={
            <Button asChild className="rounded-full">
              <Link href="/services">Browse services</Link>
            </Button>
          }
        />
      ) : (
        <CustomerBookingList bookings={visible} />
      )}
    </div>
  );
}
