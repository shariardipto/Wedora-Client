import { ReceiptIcon } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import type { Transaction } from "@/lib/billing/types";
import { TransactionStatusBadge, transactionLabel } from "./transaction-status-badge";

/** The vendor's own recent payments (newest first). */
export function PaymentHistory({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ReceiptIcon className="size-4" aria-hidden="true" />
        No payments yet. Your Premium payments and renewals will appear here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((transaction) => (
        <li key={transaction.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{transactionLabel(transaction.kind)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(transaction.paidAt ?? transaction.createdAt)}
              {transaction.status === "pending" && " · checkout started, not completed"}
              {transaction.status === "expired" && " · checkout closed, nothing charged"}
              {transaction.status === "failed" && " · payment didn’t go through"}
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums">{formatMoney(transaction.amount, transaction.currency)}</span>
          <TransactionStatusBadge status={transaction.status} />
        </li>
      ))}
    </ul>
  );
}
