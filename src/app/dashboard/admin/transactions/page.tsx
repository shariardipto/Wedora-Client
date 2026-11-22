import type { Metadata } from "next";
import { BanknoteIcon, CircleCheckIcon, CircleXIcon, ClockIcon, ReceiptIcon } from "lucide-react";
import { AdminTransactionFilters } from "@/components/admin/admin-transaction-filters";
import { AdminTransactionsTable } from "@/components/admin/admin-transactions-table";
import { StatCard } from "@/components/dashboard/overview-parts";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { parseAdminTransactionQuery, toAdminTransactionSearch } from "@/lib/admin/transaction-query";
import { serverApi } from "@/lib/api-server";
import { requireRole } from "@/lib/auth/session";
import type { AdminTransaction, AdminTransactionMeta } from "@/lib/billing/types";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Transactions" };

const BASE = "/dashboard/admin/transactions";

export default async function TransactionsPage({ searchParams }: PageProps<"/dashboard/admin/transactions">) {
  await requireRole("admin", BASE);
  const query = parseAdminTransactionQuery(await searchParams);
  const { data: transactions, meta } = await serverApi<AdminTransaction[], AdminTransactionMeta>(
    "/api/admin/transactions",
    { auth: true, searchParams: toAdminTransactionSearch(query) },
  );
  const { summary } = meta;
  const filtered = Boolean(query.q || query.status);
  const href = (next: Partial<typeof query>) => {
    const qs = toAdminTransactionSearch({ ...query, ...next }).toString();
    return qs ? `${BASE}?${qs}` : BASE;
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Transactions"
        description="Every Premium payment recorded from Stripe — first payments and monthly renewals. This ledger is read-only."
      />

      <section aria-label="Payment totals" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatMoney(summary.revenue, summary.currency)} icon={BanknoteIcon} tone="gold" hint="All paid transactions" />
        <StatCard label="Paid" value={summary.paid} icon={CircleCheckIcon} tone="green" href={href({ status: "paid", page: 1 })} hint="Successful payments" />
        <StatCard label="Pending" value={summary.pending} icon={ClockIcon} tone="amber" href={href({ status: "pending", page: 1 })} hint="Checkouts not completed yet" />
        <StatCard
          label="Failed / expired"
          value={summary.failed + summary.expired}
          icon={CircleXIcon}
          tone="slate"
          href={href({ status: summary.failed > 0 ? "failed" : "expired", page: 1 })}
          hint={`${summary.failed} failed · ${summary.expired} expired`}
        />
      </section>

      <AdminTransactionFilters query={query} />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {meta.total} transaction{meta.total === 1 ? "" : "s"}
        {filtered ? " match your filters" : " recorded"}
      </p>

      {transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptIcon}
          title={filtered ? "No matching transactions" : "No transactions yet"}
          description={
            filtered
              ? "Try another vendor name or email, or clear the status filter."
              : "When a vendor upgrades to Premium, the payment is recorded here automatically."
          }
        />
      ) : (
        <AdminTransactionsTable transactions={transactions} />
      )}

      <PaginationNav page={meta.page} totalPages={meta.totalPages} hrefFor={(page) => href({ page })} />
    </div>
  );
}
