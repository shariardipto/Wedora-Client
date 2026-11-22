"use client";

import { useState } from "react";
import { CrownIcon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, apiRequest } from "@/lib/api-client";
import { isStripeCheckoutUrl } from "@/lib/billing/types";
import { cn } from "@/lib/utils";

/**
 * Asks the API for a Checkout session (price and vendor are decided there) and
 * sends the browser to Stripe. Nothing is activated here — only the webhook can.
 */
export function UpgradeButton({ className }: { className?: string }) {
  const [redirecting, setRedirecting] = useState(false);

  async function upgrade() {
    setRedirecting(true);
    try {
      const { url } = await apiRequest<{ url: string }>("/api/billing/checkout", { method: "POST" });
      if (!isStripeCheckoutUrl(url)) throw new Error("Unexpected checkout link");
      window.location.assign(url);
      // Keep the spinner while the browser leaves for Stripe.
    } catch (error) {
      setRedirecting(false);
      toast.error(
        error instanceof ApiError ? error.message : "We couldn’t start checkout. Please try again in a moment.",
      );
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        size="lg"
        onClick={() => void upgrade()}
        disabled={redirecting}
        aria-busy={redirecting}
        className="h-11 w-full rounded-full text-base"
      >
        {redirecting ? <Spinner data-icon="inline-start" /> : <CrownIcon data-icon="inline-start" />}
        {redirecting ? "Opening secure checkout…" : "Upgrade to Premium"}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <LockIcon className="size-3" aria-hidden="true" />
        Secure payment by Stripe · cancel anytime
      </p>
    </div>
  );
}
