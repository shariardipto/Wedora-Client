import type { Metadata } from "next";
import Link from "next/link";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Checkout cancelled", robots: { index: false } };

export default async function PaymentCancelPage() {
  await requireRole("vendor", "/payment/cancel");
  return (
    <StatusMessage
      title="Checkout cancelled"
      description="No payment was taken and your plan hasn’t changed. You can upgrade to Premium whenever you’re ready — your checkout stays open for a little while if you change your mind."
      actions={
        <>
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/dashboard/vendor/subscription">Back to plans</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6">
            <Link href="/dashboard/vendor">Go to dashboard</Link>
          </Button>
        </>
      }
    />
  );
}
