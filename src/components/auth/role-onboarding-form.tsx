"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, apiRequest } from "@/lib/api-client";
import { authClient } from "@/lib/auth/client";
import { dashboardPath } from "@/lib/auth/redirect";
import type { SelfServiceRole } from "@/lib/auth/validation";
import { RoleChoice } from "./role-choice";

/** One-time account type choice for Google sign-ups (saved by Express, BR-02). */
export function RoleOnboardingForm() {
  const router = useRouter();
  const [role, setRole] = useState<SelfServiceRole | undefined>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!role) {
      setError("Choose Customer or Vendor to continue.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiRequest("/api/me/role", { method: "POST", body: { role } });
      // Refresh the cached session so the navbar and guards see the new role.
      await authClient.getSession({ query: { disableCookieCache: true } });
      authClient.$store.notify("$sessionSignal");
      toast.success(role === "vendor" ? "Welcome aboard! Let’s set up your business." : "You’re all set — happy planning!");
      router.replace(dashboardPath(role));
      router.refresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "ROLE_ALREADY_SET") {
        toast.info("Your account type is already set.");
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      toast.error(cause instanceof ApiError ? cause.message : "We couldn’t save your choice. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-2">
        <p id="onboarding-role-label" className="text-sm font-medium">
          How will you use Wedora?
        </p>
        <RoleChoice
          value={role}
          onChange={(value) => {
            setRole(value);
            setError(null);
          }}
          disabled={pending}
          invalid={!!error}
          aria-labelledby="onboarding-role-label"
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          This choice is permanent for this account.
        </p>
      </div>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-full">
        {pending && <Spinner />}
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
