import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { oauthErrorMessage } from "@/lib/auth/errors";
import { postAuthDestination, safeCallbackUrl } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Wedora to book wedding services or manage your vendor business.",
};

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl) || undefined;

  // Already signed in? Go where they were headed (or their dashboard).
  const session = await getSession();
  if (session) {
    if (session.user.isBlocked) redirect("/blocked");
    redirect(postAuthDestination(session.user.role, callbackUrl));
  }

  const error = oauthErrorMessage(typeof params.error === "string" ? params.error : undefined);

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue planning — or to manage your wedding services."
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <CircleAlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {callbackUrl && !error && (
        <p className="mb-6 rounded-lg bg-secondary/60 px-4 py-3 text-sm text-secondary-foreground">
          Please sign in to continue.
        </p>
      )}
      <SignInForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
