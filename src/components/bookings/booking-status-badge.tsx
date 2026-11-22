import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/lib/bookings/types";
import { cn } from "@/lib/utils";

const STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  accepted: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  rejected: "bg-red-100 text-red-900 hover:bg-red-100",
  cancelled: "bg-muted text-muted-foreground hover:bg-muted",
};

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return <Badge className={cn("border-0", STYLES[status], className)}>{BOOKING_STATUS_LABEL[status]}</Badge>;
}
