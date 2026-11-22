import type { Metadata } from "next";
import { CalendarCheckIcon } from "lucide-react";
import { BookingStatusTabs } from "@/components/bookings/status-tabs";
import { VendorBookingList } from "@/components/bookings/vendor-booking-list";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { serverApi } from "@/lib/api-server";
import { countByStatus, isBookingStatus, type Booking } from "@/lib/bookings/types";

export const metadata: Metadata = { title: "Booking Requests" };

export default async function BookingRequestsPage({ searchParams }: PageProps<"/dashboard/vendor/bookings">) {
  const raw = (await searchParams).status;
  const status = raw === "all" ? undefined : isBookingStatus(raw) ? raw : undefined;

  const { data: bookings } = await serverApi<Booking[]>("/api/vendor/bookings", { auth: true });
  const visible = status ? bookings.filter((booking) => booking.status === status) : bookings;
  const counts = countByStatus(bookings);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Vendor"
        title="Booking Requests"
        description={
          counts.pending > 0
            ? `You have ${counts.pending} pending request${counts.pending === 1 ? "" : "s"} waiting for a response.`
            : "Requests from couples for your services appear here. Accept or reject each pending request once."
        }
      />
      <BookingStatusTabs basePath="/dashboard/vendor/bookings" active={status} counts={counts} />
      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarCheckIcon}
          title={status ? "Nothing here right now" : "No booking requests yet"}
          description={
            status
              ? "No requests have this status. Check the other tabs."
              : "When couples request your approved services, their requests will appear here."
          }
        />
      ) : (
        <VendorBookingList bookings={visible} />
      )}
    </div>
  );
}
