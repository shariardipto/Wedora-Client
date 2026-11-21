import { requireRole } from "@/lib/auth/session";

/** Only customers may open this dashboard; others are sent to their own. */
export default async function CustomerDashboardLayout({ children }: LayoutProps<"/dashboard/customer">) {
  await requireRole("customer");
  return children;
}
