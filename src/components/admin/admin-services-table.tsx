"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  EyeIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCategoryName } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { Price } from "@/components/shared/price";
import type { Service, ServiceStatus } from "@/lib/services/types";

const SUCCESS: Record<ServiceStatus, string> = {
  approved: "Service approved — customers can now see it.",
  rejected: "Service rejected. The vendor will see your reason.",
  pending: "Service moved back to review.",
};

export function AdminServicesTable({ services }: { services: Service[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  async function setStatus(service: Service, status: ServiceStatus, rejectionReason?: string) {
    setBusyId(service.id);
    try {
      await apiRequest(`/api/admin/services/${service.id}/status`, {
        method: "PATCH",
        body: rejectionReason ? { status, rejectionReason } : { status },
      });
      toast.success(SUCCESS[status]);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t update the service.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function confirmReject() {
    if (!rejecting) return;
    if (reason.trim().length < 5) {
      setReasonError("Give the vendor a short reason (at least 5 characters).");
      return;
    }
    const ok = await setStatus(rejecting, "rejected", reason.trim());
    if (ok) {
      setRejecting(null);
      setReason("");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    setBusyId(target.id);
    try {
      await apiRequest(`/api/admin/services/${target.id}`, { method: "DELETE" });
      toast.success("Service deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t delete the service.");
    } finally {
      setBusyId(null);
    }
  }

  /** Approve (while pending) + the "more actions" menu. Shared by the cards and the table. */
  const actions = (service: Service) => (
    <div className="flex items-center justify-end gap-1">
      {service.status === "pending" && (
        <Button
          size="sm"
          className="rounded-full"
          disabled={busyId === service.id}
          onClick={() => void setStatus(service, "approved")}
        >
          {busyId === service.id ? <Spinner /> : <CheckIcon data-icon="inline-start" />}
          Approve
        </Button>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label={`Actions for ${service.serviceName}`} disabled={busyId === service.id}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/services/${service.id}`}>
              <EyeIcon /> View details
            </Link>
          </DropdownMenuItem>
          {service.status !== "approved" && (
            <DropdownMenuItem onSelect={() => void setStatus(service, "approved")}>
              <CheckIcon /> Approve
            </DropdownMenuItem>
          )}
          {service.status !== "rejected" && (
            <DropdownMenuItem
              onSelect={() => {
                setReason("");
                setReasonError(null);
                setRejecting(service);
              }}
            >
              <XIcon /> Reject…
            </DropdownMenuItem>
          )}
          {service.status !== "pending" && (
            <DropdownMenuItem onSelect={() => void setStatus(service, "pending")}>
              <RotateCcwIcon /> Move to review
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(service)}>
            <Trash2Icon /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <>
      {/* Phones, tablets and small laptops (below 1280px, where a full table can't fit beside the
          sidebar): one card per service, every detail and action visible without sideways scrolling. */}
      <ul className="grid gap-3 md:grid-cols-2 xl:hidden" aria-label="Services">
        {services.map((service) => (
          <li key={service.id} className="flex flex-col rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="flex gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {service.images[0] && <Image src={service.images[0]} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 leading-snug font-medium">{service.serviceName}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{service.location}</p>
                <p className="truncate text-xs text-muted-foreground">
                  by {service.vendor?.businessName ?? service.vendor?.name ?? "—"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pb-3">
              <ServiceStatusBadge status={service.status} />
              {!service.isAvailable && <AvailabilityBadge isAvailable={false} />}
              <span className="text-xs text-muted-foreground">{getCategoryName(service.category)}</span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
              <div className="min-w-0">
                {/* Same price style as the public service cards: serif figures with a small gold $. */}
                <p className="text-[1.75rem] text-primary">
                  <Price variant="display" amount={service.price} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Submitted {formatDate(service.createdAt, "short")}</p>
              </div>
              {actions(service)}
            </div>
          </li>
        ))}
      </ul>

      {/* 1280px and up: a table that fits its panel (952px at most) with nothing cut off. The vendor
          sits under the service name, status badges stack, and the service column takes the rest
          (names shorten with …). */}
      <div className="hidden overflow-hidden rounded-2xl bg-card ring-1 ring-border xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-full pl-4">Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                {/* max-w-0 + the header's w-full let this column shrink, so long text truncates. */}
                <TableCell className="max-w-0 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {service.images[0] && (
                        <Image src={service.images[0]} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{service.serviceName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {service.vendor?.businessName ?? service.vendor?.name ?? "—"} · {service.location}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {getCategoryName(service.category)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <Price amount={service.price} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <ServiceStatusBadge status={service.status} />
                    {!service.isAvailable && <AvailabilityBadge isAvailable={false} />}
                  </div>
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {formatDate(service.createdAt, "short")}
                </TableCell>
                <TableCell className="pr-4 text-right">{actions(service)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={rejecting !== null} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject “{rejecting?.serviceName}”</DialogTitle>
            <DialogDescription>
              The service will be hidden from customers. The vendor sees your reason and can edit and resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              rows={4}
              maxLength={300}
              value={reason}
              aria-invalid={!!reasonError}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError(null);
              }}
              placeholder="e.g. Please upload real photos of your work."
            />
            {reasonError && (
              <p role="alert" className="text-sm text-destructive">
                {reasonError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={busyId === rejecting?.id}
              onClick={() => void confirmReject()}
            >
              {busyId === rejecting?.id && <Spinner />}
              Reject service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.serviceName}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Use this for inappropriate listings. The service is removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmDelete()}>
              Delete service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
