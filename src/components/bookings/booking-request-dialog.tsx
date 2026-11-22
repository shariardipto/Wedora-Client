"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarHeartIcon, CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { Booking } from "@/lib/bookings/types";
import {
  bookingFormSchema,
  maxEventDate,
  minEventDate,
  type BookingFormValues,
} from "@/lib/bookings/validation";
import { formatEventDate } from "@/lib/format";

type Props = {
  serviceId: string;
  serviceName: string;
  vendorName: string;
};

/**
 * Booking Request form (event date, event location, message). The API
 * identifies the customer from the session and the vendor from the service.
 */
export function BookingRequestDialog({ serviceId, serviceName, vendorName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<Booking | null>(null);
  const schema = useMemo(() => bookingFormSchema(), []);
  const limits = useMemo(() => ({ min: minEventDate(), max: maxEventDate() }), []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { eventDate: "", eventLocation: "", message: "" },
  });
  const message = useWatch({ control, name: "message" }) ?? "";

  async function onSubmit(values: BookingFormValues) {
    try {
      const booking = await apiRequest<Booking>("/api/bookings", {
        method: "POST",
        body: { serviceId, ...values },
      });
      setSent(booking);
      setOpen(false);
      reset();
      toast.success("Booking request sent!", {
        description: `${vendorName} will review your request for ${formatEventDate(booking.eventDate)}.`,
        action: { label: "My Bookings", onClick: () => router.push("/dashboard/customer/bookings") },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        for (const detail of error.details ?? []) {
          if (detail.field === "eventDate" || detail.field === "eventLocation" || detail.field === "message") {
            setError(detail.field, { message: detail.message });
          }
        }
        if (error.code === "DUPLICATE_BOOKING") setError("eventDate", { message: error.message });
        toast.error(error.message);
        if (error.code === "SERVICE_UNAVAILABLE") router.refresh();
      } else {
        toast.error("Your request couldn’t be sent. Please try again.");
      }
    }
  }

  return (
    <div className="space-y-3">
      {sent && (
        <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900" role="status">
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Request sent for <strong>{formatEventDate(sent.eventDate)}</strong>.{" "}
            <Link href="/dashboard/customer/bookings" className="font-semibold underline underline-offset-4">
              Track it in My Bookings
            </Link>
          </span>
        </p>
      )}

      <Dialog open={open} onOpenChange={(next) => !isSubmitting && setOpen(next)}>
        <DialogTrigger asChild>
          <Button className="h-12 w-full rounded-full text-base">
            <CalendarHeartIcon data-icon="inline-start" />
            {sent ? "Request another date" : "Request Booking"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Request a booking</DialogTitle>
            <DialogDescription>
              {serviceName} · {vendorName}. The vendor will accept or decline your request — nothing is charged.
            </DialogDescription>
          </DialogHeader>

          <form id="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-5">
              <Field data-invalid={!!errors.eventDate}>
                <FieldLabel htmlFor="booking-date">Event date</FieldLabel>
                <Input
                  id="booking-date"
                  type="date"
                  min={limits.min}
                  max={limits.max}
                  className="h-11"
                  aria-invalid={!!errors.eventDate}
                  disabled={isSubmitting}
                  {...register("eventDate")}
                />
                <FieldError errors={[errors.eventDate]} />
              </Field>

              <Field data-invalid={!!errors.eventLocation}>
                <FieldLabel htmlFor="booking-location">Event location</FieldLabel>
                <Input
                  id="booking-location"
                  placeholder="e.g. The Grand Hall, Austin, TX"
                  autoComplete="off"
                  className="h-11"
                  aria-invalid={!!errors.eventLocation}
                  disabled={isSubmitting}
                  {...register("eventLocation")}
                />
                <FieldError errors={[errors.eventLocation]} />
              </Field>

              <Field data-invalid={!!errors.message}>
                <FieldLabel htmlFor="booking-message">
                  Message <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Textarea
                  id="booking-message"
                  rows={4}
                  placeholder="Guest count, timing, style or anything the vendor should know…"
                  aria-invalid={!!errors.message}
                  disabled={isSubmitting}
                  {...register("message")}
                />
                <FieldDescription className="text-right text-xs" aria-live="polite">
                  {message.length}/1000
                </FieldDescription>
                <FieldError errors={[errors.message]} />
              </Field>
            </FieldGroup>
          </form>

          <DialogFooter>
            <Button variant="ghost" className="rounded-full" disabled={isSubmitting} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="booking-form" className="rounded-full px-6" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Sending request…" : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
