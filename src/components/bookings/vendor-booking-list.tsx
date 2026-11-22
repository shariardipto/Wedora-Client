"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, MailIcon, PhoneIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/auth/user-avatar";
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
import { Spinner } from "@/components/ui/spinner";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { Booking } from "@/lib/bookings/types";
import { formatEventDate } from "@/lib/format";
import { BookingFacts, BookingThumb, serviceTitle } from "./booking-parts";
import { BookingStatusBadge } from "./booking-status-badge";

function RequestCard({ booking, onReject }: { booking: Booking; onReject: (booking: Booking) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    try {
      await apiRequest(`/api/vendor/bookings/${booking.id}`, { method: "PATCH", body: { status: "accepted" } });
      toast.success(`Booking accepted for ${formatEventDate(booking.eventDate)}.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t accept the request. Please try again.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const customer = booking.customer;

  return (
    <li className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <UserAvatar name={customer?.name} image={customer?.image} className="size-11" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{customer?.name ?? "Former customer"}</p>
            <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {customer?.email && (
                <a href={`mailto:${customer.email}`} className="inline-flex max-w-full min-w-0 items-center gap-1.5 hover:text-primary">
                  <MailIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{customer.email}</span>
                </a>
              )}
              {customer?.phone && (
                <a href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                  <PhoneIcon className="size-3.5" aria-hidden="true" />
                  {customer.phone}
                </a>
              )}
            </div>
          </div>
        </div>
        <BookingStatusBadge status={booking.status} className="h-6 shrink-0 px-2.5" />
      </div>

      <div className="mt-4 flex gap-3 rounded-xl bg-muted/50 p-3">
        <BookingThumb booking={booking} className="size-14" />
        <div className="min-w-0 self-center">
          <p className="text-xs text-muted-foreground">Requested service</p>
          {booking.service ? (
            <Link href={`/services/${booking.service.id}`} className="font-medium hover:text-primary">
              {booking.service.serviceName}
            </Link>
          ) : (
            <p className="font-medium text-muted-foreground">{serviceTitle(booking)}</p>
          )}
        </div>
      </div>

      <BookingFacts booking={booking} className="mt-4" />

      {booking.message && (
        <blockquote className="mt-4 border-l-2 border-gold pl-3 text-sm whitespace-pre-line text-foreground/85">
          {booking.message}
        </blockquote>
      )}

      {booking.status === "pending" && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            className="rounded-full text-destructive hover:text-destructive"
            disabled={busy}
            onClick={() => onReject(booking)}
          >
            <XIcon data-icon="inline-start" /> Reject
          </Button>
          <Button className="rounded-full px-5" disabled={busy} onClick={() => void accept()}>
            {busy ? <Spinner /> : <CheckIcon data-icon="inline-start" />}
            Accept
          </Button>
        </div>
      )}
    </li>
  );
}

export function VendorBookingList({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState<Booking | null>(null);

  async function confirmReject() {
    if (!rejecting) return;
    const target = rejecting;
    setRejecting(null);
    const pending = toast.loading("Rejecting request…");
    try {
      await apiRequest(`/api/vendor/bookings/${target.id}`, { method: "PATCH", body: { status: "rejected" } });
      toast.success("Booking request rejected.", { id: pending });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t reject the request.", { id: pending });
    } finally {
      router.refresh();
    }
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {bookings.map((booking) => (
          <RequestCard key={booking.id} booking={booking} onReject={setRejecting} />
        ))}
      </ul>

      <AlertDialog open={rejecting !== null} onOpenChange={(open) => !open && setRejecting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this booking request?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejecting &&
                `${rejecting.customer?.name ?? "The customer"} asked for ${serviceTitle(rejecting)} on ${formatEventDate(rejecting.eventDate)}. `}
              Once rejected, the request can’t be accepted later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep pending</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmReject()}>
              Reject request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
