import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StatusMessage } from "@/components/shared/status-message";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Account blocked" };

export default async function BlockedPage() {
  const session = await getSession();
  if (!session) redirect("/signin");
  if (!session.user.isBlocked) redirect("/dashboard");

  return (
    <StatusMessage
      title="Your account is blocked"
      description={`An administrator has restricted this account, so dashboards and bookings are unavailable. If you think this is a mistake, contact us at ${siteConfig.contact.email}.`}
      actions={<SignOutButton />}
    />
  );
}
