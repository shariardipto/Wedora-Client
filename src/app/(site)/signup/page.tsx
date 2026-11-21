import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { postAuthDestination, safeCallbackUrl } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Join Wedora as a couple planning a wedding or as a wedding service vendor.",
};

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl) || undefined;
  const defaultRole =
    params.role === "vendor" ? "vendor" : params.role === "customer" ? "customer" : undefined;

  const session = await getSession();
  if (session) {
    if (session.user.isBlocked) redirect("/blocked");
    redirect(postAuthDestination(session.user.role, callbackUrl));
  }

  return (
    <AuthShell
      title={defaultRole === "vendor" ? "Grow with Wedora" : "Create your account"}
      description={
        defaultRole === "vendor"
          ? "Publish your services and start receiving booking requests from couples."
          : "Discover trusted vendors and keep every booking request in one place."
      }
      quote={
        defaultRole === "vendor"
          ? "Bring your craft to couples who are planning their most important day."
          : undefined
      }
    >
      <SignUpForm callbackUrl={callbackUrl} defaultRole={defaultRole} />
    </AuthShell>
  );
}
