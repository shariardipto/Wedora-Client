"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangleIcon, CrownIcon, HourglassIcon, RefreshCwIcon, SearchXIcon } from "lucide-react";
import { FallingPetals } from "@/components/motion/falling-petals";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { BillingStatus } from "@/lib/billing/types";
import { formatDate, formatMoney } from "@/lib/format";

/** BR-15: poll about every 2 s, for about 30 s. */
const POLL_INTERVAL_MS = 2000;
const POLL_CAP_MS = 30_000;

type Phase = "checking" | "active" | "failed" | "expired" | "missing" | "slow" | "error";

/** Decides what the page shows. It only reads state — activation is the webhook's job. */
function phaseOf({ plan, checkout }: BillingStatus): Phase {
  if (!checkout) return "missing";
  if (checkout.status === "failed") return "failed";
  if (checkout.status === "expired") return "expired";
  // Premium is on once the webhook lands (the subscription event can beat the checkout event).
  if (plan.isPremium) return "active";
  return "checking";
}

const SUBSCRIPTION = "/dashboard/vendor/subscription";

export function CheckoutStatus({ sessionId }: { sessionId: string }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let received = false;

    async function poll() {
      try {
        const data = await apiRequest<BillingStatus>(
          `/api/billing/status?session_id=${encodeURIComponent(sessionId)}`,
          { signal: controller.signal },
        );
        received = true;
        setStatus(data);
        const next = phaseOf(data);
        if (next !== "checking") {
          setPhase(next);
          return;
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        // A 4xx won't fix itself by waiting (bad reference, wrong account…).
        if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 401) {
          setPhase("missing");
          return;
        }
      }
      if (Date.now() - started >= POLL_CAP_MS) {
        setPhase(received ? "slow" : "error");
        return;
      }
      timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
    }

    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [sessionId, round]);

  function checkAgain() {
    setPhase("checking");
    setRound((value) => value + 1);
  }

  const expiresAt = status?.plan.expiresAt;
  const amount = status?.checkout ? formatMoney(status.checkout.amount, status.checkout.currency) : "$29.00";

  return (
    <section className="container-page flex flex-1 items-center justify-center py-16 sm:py-24">
      <div
        className="relative isolate w-full max-w-lg overflow-hidden rounded-3xl bg-card px-6 py-10 text-center shadow-sm ring-1 ring-border sm:px-10"
        aria-live="polite"
        aria-busy={phase === "checking"}
      >
        {phase === "checking" && (
          <>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary">
              <Spinner className="size-7" />
            </span>
            <h1 className="mt-6 text-3xl font-semibold">Confirming your payment…</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Stripe is letting us know your payment went through. This usually takes a few seconds — please keep
              this page open.
            </p>
          </>
        )}

        {phase === "active" && (
          <>
            <FallingPetals count={14} className="-z-10" />
            <motion.span
              initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="mx-auto grid size-20 place-items-center rounded-full bg-gold text-night shadow-lg ring-8 ring-accent"
            >
              <CrownIcon className="size-9" aria-hidden="true" />
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <p className="eyebrow mt-7">Payment received</p>
              <h1 className="mt-2 text-4xl font-semibold">Welcome to Premium</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {amount} paid. You can now keep unlimited services active, and your listings show the Premium
                crown.
                {expiresAt && ` Your plan renews on ${formatDate(expiresAt)}.`}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild className="h-11 rounded-full px-6">
                  <Link href="/dashboard/vendor/services/new">Add a service</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full px-6">
                  <Link href={SUBSCRIPTION}>View subscription</Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {(phase === "failed" || phase === "expired") && (
          <>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-red-100 text-red-800">
              <AlertTriangleIcon className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-3xl font-semibold">
              {phase === "failed" ? "Your payment didn’t go through" : "This checkout has closed"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {phase === "failed"
                ? "Stripe couldn’t complete the payment, so you haven’t been charged. You can try again with another card."
                : "The checkout expired before payment was completed, so you haven’t been charged. You can start a new one any time."}
            </p>
            <Button asChild className="mt-8 h-11 rounded-full px-6">
              <Link href={SUBSCRIPTION}>Try again</Link>
            </Button>
          </>
        )}

        {phase === "missing" && (
          <>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary">
              <SearchXIcon className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-3xl font-semibold">We couldn’t find this checkout</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This payment link doesn’t match a checkout on your account. Your subscription page shows your current
              plan and every payment.
            </p>
            <Button asChild className="mt-8 h-11 rounded-full px-6">
              <Link href={SUBSCRIPTION}>Go to subscription</Link>
            </Button>
          </>
        )}

        {(phase === "slow" || phase === "error") && (
          <>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-amber-100 text-amber-900">
              <HourglassIcon className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-3xl font-semibold">
              {phase === "slow" ? "Still processing" : "We couldn’t check right now"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {phase === "slow"
                ? "Your payment is taking longer than usual to confirm. There’s no need to pay again — Premium switches on automatically as soon as Stripe confirms it."
                : "We couldn’t reach Wedora to confirm your payment. Check your connection — there’s no need to pay again."}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button type="button" onClick={checkAgain} className="h-11 rounded-full px-6">
                <RefreshCwIcon data-icon="inline-start" />
                Check again
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full px-6">
                <Link href={SUBSCRIPTION}>Go to subscription</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
