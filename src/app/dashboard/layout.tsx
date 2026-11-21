import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Wedora Dashboard" },
  robots: { index: false },
};

/**
 * Every dashboard route: signed in, not blocked, role chosen. Role-specific
 * sub-layouts then enforce customer / vendor / admin.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireUser("/dashboard");
  if (!session.user.role) redirect("/onboarding/role");

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col bg-muted/40">
        <div className="container-page flex-1 py-8 sm:py-10">{children}</div>
      </main>
    </>
  );
}
