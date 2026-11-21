import { requireRole } from "@/lib/auth/session";

/** Only vendors may open this dashboard; others are sent to their own. */
export default async function VendorDashboardLayout({ children }: LayoutProps<"/dashboard/vendor">) {
  await requireRole("vendor");
  return children;
}
