import type { ServiceCategorySlug } from "@/lib/categories";
import type { VendorSummary } from "@/lib/services/types";

export const BOOKING_STATUSES = ["pending", "accepted", "rejected", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Mirrors the API's BookingView. */
export type Booking = {
  id: string;
  serviceId: string;
  vendorId: string;
  customerId: string;
  /** YYYY-MM-DD */
  eventDate: string;
  eventLocation: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    serviceName: string;
    category: ServiceCategorySlug;
    image: string | null;
    price: number;
    location: string;
  } | null;
  vendor: VendorSummary | null;
  customer: { id: string; name: string; email: string; image: string | null; phone: string | null } | null;
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === "string" && (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function countByStatus(bookings: Booking[]): Record<BookingStatus | "all", number> {
  const counts = { all: bookings.length, pending: 0, accepted: 0, rejected: 0, cancelled: 0 };
  for (const booking of bookings) counts[booking.status] += 1;
  return counts;
}
