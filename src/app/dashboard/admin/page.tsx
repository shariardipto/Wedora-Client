import type { Metadata } from "next";
import Link from "next/link";
import {
  BriefcaseIcon,
  CreditCardIcon,
  HeartIcon,
  HourglassIcon,
  ListChecksIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";
import { OverviewHeader, OverviewPanel, PhotoPrompt, StatCard } from "@/components/dashboard/overview-parts";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/api-server";
import { requireRole } from "@/lib/auth/session";
import type { AdminStats } from "@/lib/dashboard/types";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminDashboardPage() {
  const { user } = await requireRole("admin");
  const { data: stats } = await serverApi<AdminStats>("/api/admin/stats", { auth: true });

  return (
    <div className="space-y-8">
      <OverviewHeader role="admin" name={user.name} image={user.image} subtitle="Platform health at a glance." />
      <PhotoPrompt role="admin" image={user.image} />

      <section aria-label="Platform statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Registered users"
          value={stats.totalUsers}
          icon={UsersIcon}
          href="/dashboard/admin/users"
          hint={stats.blockedUsers ? `${stats.blockedUsers} blocked` : "No blocked accounts"}
        />
        <StatCard label="Vendors" value={stats.totalVendors} icon={BriefcaseIcon} tone="gold" href="/dashboard/admin/users?role=vendor" hint="Offering wedding services" />
        <StatCard label="Customers" value={stats.totalCustomers} icon={HeartIcon} tone="green" href="/dashboard/admin/users?role=customer" hint="Couples planning weddings" />
        <StatCard label="Total services" value={stats.totalServices} icon={StoreIcon} href="/dashboard/admin/services" hint="All submissions, any status" />
        <StatCard
          label="Pending services"
          value={stats.pendingServices}
          icon={HourglassIcon}
          tone="amber"
          href="/dashboard/admin/services?status=pending"
          hint={stats.pendingServices ? "Waiting for your review" : "Review queue is empty"}
        />
        <StatCard label="Transactions" value={stats.totalTransactions} icon={CreditCardIcon} tone="slate" hint="Premium subscription payments" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewPanel title="Review queue">
          <p className="text-sm text-muted-foreground">
            {stats.pendingServices
              ? `${stats.pendingServices} service${stats.pendingServices === 1 ? " is" : "s are"} waiting for approval. Only approved services appear on Browse Services.`
              : "Nothing to review right now. New vendor submissions will show up here."}
          </p>
          <Button asChild className="mt-4 h-10 rounded-full px-5">
            <Link href="/dashboard/admin/services?status=pending">
              <ListChecksIcon data-icon="inline-start" /> Review services
            </Link>
          </Button>
        </OverviewPanel>
        <OverviewPanel title="People">
          <p className="text-sm text-muted-foreground">
            Search users, check their activity, and block accounts that break the rules. Blocked users are signed out
            immediately.
          </p>
          <Button asChild variant="outline" className="mt-4 h-10 rounded-full px-5">
            <Link href="/dashboard/admin/users">
              <UsersIcon data-icon="inline-start" /> Manage users
            </Link>
          </Button>
        </OverviewPanel>
      </div>
    </div>
  );
}
