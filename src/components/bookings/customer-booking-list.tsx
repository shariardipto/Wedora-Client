"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { VendorBadge } from "@/components/services/vendor-badge";
import { Price } from "@/components/shared/price";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { Booking } from "@/lib/bookings/types";
import { getCategoryName } from "@/lib/categories";
import { formatDate, formatEventDate } from "@/lib/format";
import { BookingFacts, BookingThumb, serviceTitle } from "./booking-parts";
import { BookingStatusBadge } from "./booking-status-badge";

const STATUS_NOTE: Record<Booking["status"], string> = {
  pending: "Waiting for the vendor to respond.",
  accepted: "The vendor accepted your request — they’ll be in touch to finalize details.",
  rejected: "The vendor couldn’t take this booking. Try another date or vendor.",
  cancelled: "You cancelled this request.",
};

export function CustomerBookingList({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState<Booking | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function confirmCancel() {
    if (!cancelling) return;
    const target = cancelling;
    setCancelling(null);
    setBusyId(target.id);
    try {
      await apiRequest(`/api/customer/bookings/${target.id}/cancel`, { method: "PATCH" });
      toast.success("Booking request cancelled.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t cancel the request. Please try again.");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li key={booking.id} className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border sm:flex-row sm:p-5">
            <BookingThumb booking={booking} className="aspect-[4/3] w-full sm:size-28 sm:aspect-auto" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-sans text-lg font-semibold tracking-normal">
                    {booking.service ? (
                      <Link href={`/services/${booking.service.id}`} className="hover:text-primary">
                        {booking.service.serviceName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{serviceTitle(booking)}</span>
                    )}
                  </h2>
                  <VendorBadge vendor={booking.vendor} className="mt-1.5" />
                </div>
                <BookingStatusBadge status={booking.status} className="h-6 px-2.5" />
              </div>

              <BookingFacts booking={booking} />

              <div className="mt-auto flex flex-wrap justify-end gap-2 border-t pt-3">
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setViewing(booking)}>
                  <EyeIcon data-icon="inline-start" /> View details
                </Button>
                {booking.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-destructive hover:text-destructive"
                    disabled={busyId === booking.id}
                    onClick={() => setCancelling(booking)}
                  >
                    {busyId === booking.id ? <Spinner /> : <XCircleIcon data-icon="inline-start" />}
                    Cancel request
                  </Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Booking details */}
      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{serviceTitle(viewing)}</DialogTitle>
                <DialogDescription>{STATUS_NOTE[viewing.status]}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <BookingStatusBadge status={viewing.status} className="h-6 px-2.5" />
                  {viewing.service && (
                    <span className="text-muted-foreground">
                      {getCategoryName(viewing.service.category)} · from{" "}
                      <Price amount={viewing.service.price} className="font-semibold text-foreground" />
                    </span>
                  )}
                </div>
                <VendorBadge vendor={viewing.vendor} size="md" />
                <BookingFacts booking={viewing} className="rounded-xl bg-muted/60 p-4" />
                <div>
                  <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">Your message</p>
                  <p className="mt-1.5 whitespace-pre-line text-foreground/85">
                    {viewing.message || <span className="text-muted-foreground">No message added.</span>}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Event on {formatEventDate(viewing.eventDate)} · last updated {formatDate(viewing.updatedAt, "short")}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <AlertDialog open={cancelling !== null} onOpenChange={(open) => !open && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking request?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelling && `${serviceTitle(cancelling)} on ${formatEventDate(cancelling.eventDate)}. `}
              The vendor will no longer see it as pending. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep request</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmCancel()}>
              Cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
