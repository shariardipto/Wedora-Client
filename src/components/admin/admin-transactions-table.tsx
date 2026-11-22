import { UserAvatar } from "@/components/auth/user-avatar";
import { TransactionStatusBadge, transactionLabel } from "@/components/billing/transaction-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminTransaction } from "@/lib/billing/types";
import { formatDate, formatMoney } from "@/lib/format";

/** Read-only payment ledger. Admins can review transactions but never change them. */
export function AdminTransactionsTable({ transactions }: { transactions: AdminTransaction[] }) {
  return (
    <>
      {/* Phones and tablets: one card per payment. */}
      <ul className="grid gap-3 md:grid-cols-2 lg:hidden" aria-label="Transactions">
        {transactions.map((transaction) => {
          const vendor = transaction.vendor;
          const title = vendor ? (vendor.businessName ?? vendor.name) : "Deleted vendor";
          return (
            <li key={transaction.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
              <div className="flex items-center gap-3">
                <UserAvatar name={title} image={null} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{title}</p>
                  {vendor && <p className="truncate text-xs text-muted-foreground">{vendor.email}</p>}
                </div>
                <TransactionStatusBadge status={transaction.status} />
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0 text-xs leading-5 text-muted-foreground">
                  <p className="truncate">{transactionLabel(transaction.kind)}</p>
                  <p>{formatDate(transaction.paidAt ?? transaction.createdAt, "short")}</p>
                </div>
                <p className="font-display text-2xl leading-none font-semibold text-foreground tabular-nums">
                  {formatMoney(transaction.amount, transaction.currency)}
                </p>
              </div>
              {transaction.reference && (
                <code
                  className="mt-3 block truncate rounded-lg bg-muted/60 px-2.5 py-1.5 font-mono text-[0.7rem] text-muted-foreground"
                  title={transaction.reference}
                >
                  {transaction.reference}
                </code>
              )}
            </li>
          );
        })}
      </ul>

      {/* Desktop: the full table. */}
      <div className="hidden overflow-hidden rounded-2xl bg-card ring-1 ring-border lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-60 pl-4">Vendor</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="pr-4">Stripe reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const vendor = transaction.vendor;
            const title = vendor ? (vendor.businessName ?? vendor.name) : "Deleted vendor";
            return (
              <TableRow key={transaction.id}>
                <TableCell className="pl-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar name={title} image={null} className="size-8" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{title}</p>
                      {vendor && <p className="truncate text-xs text-muted-foreground">{vendor.email}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{transactionLabel(transaction.kind)}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatMoney(transaction.amount, transaction.currency)}
                </TableCell>
                <TableCell>
                  <TransactionStatusBadge status={transaction.status} />
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                  {formatDate(transaction.paidAt ?? transaction.createdAt, "short")}
                </TableCell>
                <TableCell className="pr-4">
                  {transaction.reference ? (
                    <code className="block max-w-44 truncate font-mono text-xs text-muted-foreground" title={transaction.reference}>
                      {transaction.reference}
                    </code>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </>
  );
}
