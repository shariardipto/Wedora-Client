import type { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function ProfileSettingsPage() {
  const { user } = await requireUser("/dashboard/profile");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Profile Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update how you appear on Wedora. Your account type and plan can’t be changed here.
        </p>
      </header>
      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          role: user.role ?? null,
          businessName: user.businessName ?? null,
          phone: user.phone ?? null,
          subscriptionPlan: user.subscriptionPlan ?? "free",
        }}
      />
    </div>
  );
}
