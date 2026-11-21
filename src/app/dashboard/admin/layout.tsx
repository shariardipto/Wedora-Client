import { requireRole } from "@/lib/auth/session";

/** Only admins may open this dashboard; others are sent to their own. */
export default async function AdminDashboardLayout({ children }: LayoutProps<"/dashboard/admin">) {
  await requireRole("admin");
  return children;
}
