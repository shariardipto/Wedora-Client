import type { Metadata } from "next";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminDashboardPage() {
  const session = await requireRole("admin");
  return <AccountOverview user={session.user} />;
}
