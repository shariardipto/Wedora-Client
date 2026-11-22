"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcwIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, apiRequest } from "@/lib/api-client";
import { formatDate } from "@/lib/format";

/** Cancel at period end (with confirmation) or undo a scheduled cancellation. */
export function SubscriptionActions({
  cancelAtPeriodEnd,
  expiresAt,
}: {
  cancelAtPeriodEnd: boolean;
  expiresAt: string | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const until = expiresAt ? formatDate(expiresAt) : "the end of this billing period";

  async function run(action: "cancel" | "resume") {
    setConfirming(false);
    setBusy(true);
    try {
      await apiRequest(`/api/billing/${action}`, { method: "POST" });
      toast.success(
        action === "cancel"
          ? `Your subscription is cancelled. You’ll keep Premium until ${until}.`
          : "Your subscription will renew as usual.",
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We couldn’t update your subscription. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (cancelAtPeriodEnd) {
    return (
      <Button type="button" onClick={() => void run("resume")} disabled={busy} className="h-10 rounded-full px-5">
        {busy ? <Spinner data-icon="inline-start" /> : <RotateCcwIcon data-icon="inline-start" />}
        Keep my subscription
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirming(true)}
        disabled={busy}
        className="h-10 rounded-full px-5"
      >
        {busy ? <Spinner data-icon="inline-start" /> : <XCircleIcon data-icon="inline-start" />}
        Cancel subscription
      </Button>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your Premium subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You won’t be charged again, and you’ll keep Premium until {until}. After that your plan returns to
              Free: existing services stay, but only 3 can be active. You can change your mind before then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Premium</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void run("cancel")}>
              Cancel subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
