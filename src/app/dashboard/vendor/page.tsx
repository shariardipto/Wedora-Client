import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheckIcon,
  CalendarCheck2Icon,
  CalendarClockIcon,
  CrownIcon,
  InboxIcon,
  PlusCircleIcon,
  StoreIcon,
} from "lucide-react";
import { BookingMiniList } from "@/components/dashboard/booking-mini-list";
import { OverviewHeader, OverviewPanel, PhotoPrompt, StatCard } from "@/components/dashboard/overview-parts";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/api-server";
import { requireRole } from "@/lib/auth/session";
import type { Booking } from "@/lib/bookings/types";
import type { VendorStats } from "@/lib/dashboard/types";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Vendor Overview" };

const REQUESTS = "/dashboard/vendor/bookings";

export default async function VendorDashboardPage() {
  const { user } = await requireRole("vendor");
  const [{ data: stats }, { data: pending }] = await Promise.all([
    serverApi<VendorStats>("/api/vendor/stats", { auth: true }),
    serverApi<Booking[]>("/api/vendor/bookings", { auth: true, searchParams: new URLSearchParams({ status: "pending" }) }),
  ]);
  const { plan } = stats;
  const atLimit = plan.activeLimit !== null && stats.activeServices >= plan.activeLimit;

  return (
    <div className="space-y-8">
      <OverviewHeader
        role="vendor"
        name={user.name}
        image={user.image}
        subtitle={user.businessName ?? "Add your business name in Profile Settings."}
      />
      <PhotoPrompt role="vendor" image={user.image} />

      <section aria-label="Business statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          label="Total services"
          value={stats.totalServices}
          icon={StoreIcon}
          href="/dashboard/vendor/services"
          hint={`${stats.liveServices} live · ${stats.pendingReviewServices} in review`}
        />
        <StatCard
          label="Active services"
          value={plan.activeLimit === null ? stats.activeServices : `${stats.activeServices}/${plan.activeLimit}`}
          icon={BadgeCheckIcon}
          tone={atLimit ? "amber" : "green"}
          href="/dashboard/vendor/services"
          hint={plan.activeLimit === null ? "Unlimited on Premium" : atLimit ? "Free plan limit reached" : "Pending or approved, and available"}
        />
        <StatCard
          label="Pending requests"
          value={stats.pendingBookings}
          icon={CalendarClockIcon}
          tone="amber"
          href={`${REQUESTS}?status=pending`}
          hint={stats.pendingBookings ? "Waiting for your response" : "You’re all caught up"}
        />
        <StatCard
          label="Accepted bookings"
          value={stats.acceptedBookings}
          icon={CalendarCheck2Icon}
          tone="green"
          href={`${REQUESTS}?status=accepted`}
          hint="Confirmed with couples"
        />
        <StatCard
          label="Current plan"
          value={plan.isPremium ? "Premium" : "Free"}
          icon={CrownIcon}
          tone="gold"
          hint={
            plan.isPremium && plan.expiresAt
              ? `${plan.cancelAtPeriodEnd ? "Ends" : "Renews"} ${formatDate(plan.expiresAt, "short")}`
              : "Up to 3 active services"
          }
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <OverviewPanel
          title="Requests waiting for you"
          action={
            pending.length > 0 && (
              <Link href={`${REQUESTS}?status=pending`} className="text-sm font-medium text-primary hover:underline">
                Review all
              </Link>
            )
          }
        >
          {pending.length > 0 ? (
            <BookingMiniList bookings={pending.slice(0, 4)} perspective="vendor" href={`${REQUESTS}?status=pending`} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <InboxIcon className="size-4" aria-hidden="true" />
              No pending requests. New requests from couples will appear here.
            </p>
          )}
        </OverviewPanel>

        <OverviewPanel title="Quick actions">
          <div className="grid gap-2">
            <Button asChild className="h-10 justify-start rounded-full px-4">
              <Link href="/dashboard/vendor/services/new">
                <PlusCircleIcon data-icon="inline-start" /> Add a service
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 justify-start rounded-full px-4">
              <Link href="/dashboard/vendor/services">
                <StoreIcon data-icon="inline-start" /> Manage my services
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 justify-start rounded-full px-4">
              <Link href={REQUESTS}>
                <CalendarClockIcon data-icon="inline-start" /> Booking requests
              </Link>
            </Button>
          </div>
          {atLimit && (
            <p className="mt-3 text-xs text-muted-foreground">
              You’ve reached the Free plan’s 3 active services. Upgrade to Premium for unlimited services.
            </p>
          )}
        </OverviewPanel>
      </div>
    </div>
  );
}
