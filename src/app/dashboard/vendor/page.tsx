import type { Metadata } from "next";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Vendor Overview" };

export default async function VendorDashboardPage() {
  const session = await requireRole("vendor");
  return <AccountOverview user={session.user} />;
}
