"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { AvailabilityBadge, ServiceStatusBadge } from "@/components/services/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCategoryName } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { Price } from "@/components/shared/price";
import type { Service } from "@/lib/services/types";

function ServiceRow({ service }: { service: Service }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"availability" | "delete" | null>(null);

  async function toggleAvailability(next: boolean) {
    setBusy("availability");
    try {
      await apiRequest(`/api/vendor/services/${service.id}/availability`, {
        method: "PATCH",
        body: { isAvailable: next },
      });
      toast.success(next ? "Service is available again." : "Service paused — customers won’t see it.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t update availability.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    try {
      await apiRequest(`/api/vendor/services/${service.id}`, { method: "DELETE" });
      toast.success("Service deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t delete the service.");
      setBusy(null);
    }
  }

  const switchId = `availability-${service.id}`;

  return (
    <li className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border sm:flex-row sm:p-5">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44">
        {service.images[0] && (
          <Image src={service.images[0]} alt="" fill sizes="(min-width: 640px) 176px, 100vw" className="object-cover" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ServiceStatusBadge status={service.status} />
          <AvailabilityBadge isAvailable={service.isAvailable} />
          <span className="text-xs text-muted-foreground">Updated {formatDate(service.updatedAt, "short")}</span>
        </div>
        <div>
          <h2 className="font-sans text-lg font-semibold tracking-normal">{service.serviceName}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{getCategoryName(service.category)}</span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" aria-hidden="true" />
              {service.location}
            </span>
            <Price amount={service.price} className="font-semibold text-primary" />
          </p>
        </div>
        {service.status === "rejected" && service.rejectionReason && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
            <span className="font-semibold">Rejected:</span> {service.rejectionReason} Edit the service to resubmit it.
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <label htmlFor={switchId} className="flex items-center gap-2 text-sm">
            <Switch
              id={switchId}
              checked={service.isAvailable}
              disabled={busy !== null || service.status === "rejected"}
              onCheckedChange={(checked) => void toggleAvailability(checked)}
            />
            {busy === "availability" ? <Spinner /> : null}
            {service.isAvailable ? "Accepting bookings" : "Paused"}
          </label>

          <div className="flex gap-1">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href={`/services/${service.id}`}>
                <EyeIcon data-icon="inline-start" /> View
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href={`/dashboard/vendor/services/${service.id}/edit`}>
                <PencilIcon data-icon="inline-start" /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive" disabled={busy !== null}>
                  {busy === "delete" ? <Spinner /> : <Trash2Icon data-icon="inline-start" />} Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{service.serviceName}”?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The service will be removed from Wedora permanently. This can’t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep service</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => void remove()}>
                    Delete service
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </li>
  );
}

export function VendorServiceList({ services }: { services: Service[] }) {
  return (
    <ul className="space-y-4">
      {services.map((service) => (
        <ServiceRow key={service.id} service={service} />
      ))}
    </ul>
  );
}
