"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { safeCallbackUrl } from "@/lib/auth/redirect";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

type GoogleButtonProps = {
  label: string;
  callbackUrl?: string;
  disabled?: boolean;
};

/**
 * Starts Google OAuth. New Google users land on /onboarding/role to pick
 * Customer or Vendor; returning users go to their callback or dashboard.
 */
export function GoogleButton({ label, callbackUrl, disabled }: GoogleButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: safeCallbackUrl(callbackUrl) || "/dashboard",
        newUserCallbackURL: "/onboarding/role",
        errorCallbackURL: "/signin",
      });
      if (error) {
        toast.error(authErrorMessage(error, "Google sign-in couldn’t start. Please try again."));
        setPending(false);
      }
      // On success the browser navigates to Google; keep the spinner.
    } catch {
      toast.error("Google sign-in couldn’t start. Please try again.");
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled || pending}
      className="h-11 w-full rounded-full bg-card text-sm font-medium"
    >
      {pending ? <Spinner /> : <GoogleLogo />}
      {pending ? "Connecting to Google…" : label}
    </Button>
  );
}
