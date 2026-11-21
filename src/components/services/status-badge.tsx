import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type ServiceStatus } from "@/lib/services/types";
import { cn } from "@/lib/utils";

const STYLES: Record<ServiceStatus, string> = {
  pending: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  approved: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  rejected: "bg-red-100 text-red-900 hover:bg-red-100",
};

export function ServiceStatusBadge({ status, className }: { status: ServiceStatus; className?: string }) {
  return <Badge className={cn("border-0", STYLES[status], className)}>{STATUS_LABEL[status]}</Badge>;
}

export function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <Badge variant="outline" className={isAvailable ? "text-foreground" : "text-muted-foreground"}>
      {isAvailable ? "Available" : "Paused"}
    </Badge>
  );
}
