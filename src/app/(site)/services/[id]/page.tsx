import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarHeartIcon,
  CircleAlertIcon,
  InfoIcon,
  MapPinIcon,
  PencilIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { BookingRequestDialog } from "@/components/bookings/booking-request-dialog";
import { ServiceGallery } from "@/components/services/service-gallery";
import { Price, PriceCaption } from "@/components/shared/price";
import { VendorBadge } from "@/components/services/vendor-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServerApiError, serverApi } from "@/lib/api-server";
import { requireUser } from "@/lib/auth/session";
import { categoryHref, getCategoryName } from "@/lib/categories";
import { STATUS_LABEL, type Service } from "@/lib/services/types";

export const metadata: Metadata = { title: "Service Details" };

async function loadService(id: string): Promise<Service> {
  try {
    const { data } = await serverApi<Service>(`/api/services/${encodeURIComponent(id)}`, { auth: true });
    return data;
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) notFound();
    throw error;
  }
}

export default async function ServiceDetailsPage({ params }: PageProps<"/services/[id]">) {
  const { id } = await params;
  // Private page: guests are sent to Sign In and brought back here afterwards.
  const { user } = await requireUser(`/services/${id}`);
  if (!user.role) redirect("/onboarding/role");
  const service = await loadService(id);

  const isOwner = user.id === service.vendorId;
  const role = user.role;
  const category = getCategoryName(service.category) ?? service.category;

  return (
    <div className="container-page py-8 sm:py-12">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Back to all services
      </Link>

      {!service.isPublic && (
        <Alert className="mt-6">
          <InfoIcon />
          <AlertTitle>
            {STATUS_LABEL[service.status]}
            {service.status === "approved" && !service.isAvailable ? " · Paused" : ""}
          </AlertTitle>
          <AlertDescription>
            {service.status === "rejected" && service.rejectionReason
              ? `Reason: ${service.rejectionReason}`
              : "Customers can’t see this service right now. Only you and Wedora admins can open this page."}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <ServiceGallery images={service.images} name={service.serviceName} />

        <div className="space-y-6">
          <div>
            <Link href={categoryHref(service.category)}>
              <Badge variant="secondary" className="hover:bg-secondary/80">{category}</Badge>
            </Link>
            <h1 className="mt-3 text-4xl leading-tight font-semibold sm:text-5xl">{service.serviceName}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-muted-foreground">
              <MapPinIcon className="size-4" aria-hidden="true" />
              {service.location}
            </p>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
            <PriceCaption />
            <p className="mt-2 text-5xl text-primary">
              <Price variant="display" amount={service.price} />
            </p>

            <div className="mt-5 border-t pt-5">
              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">This is your service.</p>
                  <Button asChild className="h-11 w-full rounded-full">
                    <Link href={`/dashboard/vendor/services/${service.id}/edit`}>
                      <PencilIcon data-icon="inline-start" />
                      Edit service
                    </Link>
                  </Button>
                </div>
              ) : role === "customer" ? (
                service.isPublic ? (
                  <div className="space-y-3" id="booking">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <CalendarHeartIcon className="size-4 text-gold" aria-hidden="true" />
                      Interested? Send a booking request with your date.
                    </p>
                    <BookingRequestDialog
                      serviceId={service.id}
                      serviceName={service.serviceName}
                      vendorName={service.vendor?.businessName ?? service.vendor?.name ?? "The vendor"}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">This service isn’t accepting bookings right now.</p>
                )
              ) : (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {role === "admin"
                    ? "Admins can’t submit customer booking requests."
                    : "Vendor accounts can’t book services. Sign in with a customer account to book."}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 ring-1 ring-border">
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">Offered by</p>
            <VendorBadge vendor={service.vendor} size="md" className="mt-3" />
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheckIcon className="size-4 text-gold" aria-hidden="true" />
              Listing reviewed by the Wedora team
            </p>
          </div>
        </div>
      </div>

      <section className="mt-12 max-w-3xl" aria-labelledby="about-service">
        <h2 id="about-service" className="text-3xl font-semibold">About this service</h2>
        <p className="mt-4 text-base leading-8 whitespace-pre-line text-foreground/85">{service.description}</p>
      </section>
    </div>
  );
}
