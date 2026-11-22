import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { isUserRole } from "@/lib/auth/validation";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Wedora Dashboard" },
  robots: { index: false },
};

/**
 * Every dashboard route: signed in, not blocked, role chosen. Role-specific
 * sub-layouts then enforce customer / vendor / admin. The sidebar shows only
 * the signed-in role's pages.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireUser("/dashboard");
  const role = session.user.role;
  if (!isUserRole(role)) redirect("/onboarding/role");

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col bg-muted/40">
        <div className="container-page grid flex-1 grid-cols-[minmax(0,1fr)] gap-6 py-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 lg:py-10">
          <DashboardNav role={role} />
          <main id="main-content" className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
