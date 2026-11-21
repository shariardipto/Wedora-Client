import type { Metadata } from "next";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Customer Overview" };

export default async function CustomerDashboardPage() {
  const session = await requireRole("customer");
  return <AccountOverview user={session.user} />;
}
