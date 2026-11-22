import type { Metadata } from "next";
import { CalendarClockIcon, CrownIcon, FlaskConicalIcon, HistoryIcon } from "lucide-react";
import { PaymentHistory } from "@/components/billing/payment-history";
import { PlanCards } from "@/components/billing/plan-cards";
import { SubscriptionActions } from "@/components/billing/subscription-actions";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { OverviewPanel } from "@/components/dashboard/overview-parts";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { PlanUsage } from "@/components/vendor/plan-usage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { serverApi } from "@/lib/api-server";
import { requireRole } from "@/lib/auth/session";
import type { BillingStatus } from "@/lib/billing/types";
import type { VendorStats } from "@/lib/dashboard/types";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Subscription" };

export default async function SubscriptionPage() {
  await requireRole("vendor", "/dashboard/vendor/subscription");
  const [{ data: billing }, { data: stats }] = await Promise.all([
    serverApi<BillingStatus>("/api/billing/status", { auth: true }),
    serverApi<VendorStats>("/api/vendor/stats", { auth: true }),
  ]);
  const { plan } = billing;
  const lapsed = !plan.isPremium && plan.expiresAt !== null && new Date(plan.expiresAt) <= new Date();

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Vendor"
        title="Subscription"
        description="Choose the plan that fits your business. Payments are processed securely by Stripe — Wedora never sees your card details."
      />

      <section
        aria-label="Your plan"
        className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-gold-strong">
            {plan.isPremium ? <CrownIcon className="size-5" aria-hidden="true" /> : <CalendarClockIcon className="size-5" aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold">
              {plan.isPremium ? "You’re on Premium" : "You’re on the Free plan"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {plan.isPremium && plan.expiresAt
                ? plan.cancelAtPeriodEnd
                  ? `Cancelled — you keep Premium until ${formatDate(plan.expiresAt)}, then return to Free.`
                  : `Renews on ${formatDate(plan.expiresAt)} for $29. Cancel anytime.`
                : lapsed
                  ? `Your Premium plan ended on ${formatDate(plan.expiresAt)}. Upgrade again any time.`
                  : "Up to 3 active services. Upgrade for unlimited services and the Premium crown."}
            </p>
          </div>
        </div>
        {plan.isPremium && (
          <div className="shrink-0">
            <SubscriptionActions cancelAtPeriodEnd={plan.cancelAtPeriodEnd} expiresAt={plan.expiresAt} />
          </div>
        )}
      </section>

      <PlanUsage meta={{ activeCount: stats.activeServices, activeLimit: plan.activeLimit, isPremium: plan.isPremium }} />

      {billing.mode === "test" && !plan.isPremium && (
        <Alert>
          <FlaskConicalIcon />
          <AlertTitle>Stripe test mode</AlertTitle>
          <AlertDescription>
            No real money moves. Pay with card <span className="font-mono font-medium whitespace-nowrap text-foreground">4242 4242 4242 4242</span>,
            any future expiry date, any CVC and any ZIP code.
          </AlertDescription>
        </Alert>
      )}

      <PlanCards current={plan.name} premiumAction={plan.isPremium ? undefined : <UpgradeButton />} />

      <OverviewPanel
        title="Payment history"
        action={<HistoryIcon className="size-4 text-muted-foreground" aria-hidden="true" />}
      >
        <PaymentHistory transactions={billing.transactions} />
      </OverviewPanel>
    </div>
  );
}
