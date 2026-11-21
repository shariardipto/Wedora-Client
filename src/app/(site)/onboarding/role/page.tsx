import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { RoleOnboardingForm } from "@/components/auth/role-onboarding-form";
import { dashboardPath } from "@/lib/auth/redirect";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Choose your account type" };

export default async function RoleOnboardingPage() {
  const session = await requireUser("/onboarding/role");
  // Only users without a role belong here (new Google sign-ups).
  if (session.user.role) redirect(dashboardPath(session.user.role));

  const firstName = session.user.name.split(" ")[0];

  return (
    <section className="container-page flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-xl rounded-3xl bg-card p-6 shadow-[0_24px_60px_-30px_rgb(43_35_38/0.35)] ring-1 ring-border sm:p-10">
        <BrandLogo height={64} className="h-14" />
        <h1 className="mt-6 text-4xl font-semibold">Welcome, {firstName}!</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          One last step: tell us whether you’re planning a wedding or offering wedding services.
        </p>
        <div className="mt-8">
          <RoleOnboardingForm />
        </div>
      </div>
    </section>
  );
}
