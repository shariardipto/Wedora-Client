import { Badge } from "@/components/ui/badge";
import type { TransactionStatus } from "@/lib/billing/types";
import { cn } from "@/lib/utils";

export const TRANSACTION_STATUS_LABEL: Record<TransactionStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
};

const STYLES: Record<TransactionStatus, string> = {
  pending: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  paid: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  failed: "bg-red-100 text-red-900 hover:bg-red-100",
  expired: "bg-muted text-muted-foreground hover:bg-muted",
};

export function TransactionStatusBadge({ status, className }: { status: TransactionStatus; className?: string }) {
  return <Badge className={cn("border-0", STYLES[status], className)}>{TRANSACTION_STATUS_LABEL[status]}</Badge>;
}

/** "Premium · first month" / "Premium · renewal". */
export function transactionLabel(kind: "subscription" | "renewal") {
  return kind === "renewal" ? "Premium · monthly renewal" : "Premium · first month";
}
