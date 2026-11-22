import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutStatus } from "@/components/billing/checkout-status";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { CHECKOUT_SESSION_ID } from "@/lib/billing/types";

export const metadata: Metadata = { title: "Payment status", robots: { index: false } };

/**
 * Stripe returns here after payment. The page only DISPLAYS status (BR-15):
 * Premium is switched on by the verified webhook, never by this request.
 */
export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  const raw = (await searchParams).session_id;
  const sessionId = typeof raw === "string" ? raw : undefined;
  await requireRole(
    "vendor",
    sessionId ? `/payment/success?session_id=${encodeURIComponent(sessionId)}` : "/payment/success",
  );

  if (!sessionId || !CHECKOUT_SESSION_ID.test(sessionId)) {
    return (
      <StatusMessage
        title="We couldn’t find this checkout"
        description="This page needs a valid payment reference from Stripe. Your subscription page shows your current plan and every payment."
        actions={
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/dashboard/vendor/subscription">Go to subscription</Link>
          </Button>
        }
      />
    );
  }

  return <CheckoutStatus key={sessionId} sessionId={sessionId} />;
}
