import { CrownIcon } from "lucide-react";
import type { VendorServicesMeta } from "@/lib/services/types";
import { cn } from "@/lib/utils";

/** "2 of 3 active services" meter for free vendors; a badge for Premium. */
export function PlanUsage({ meta }: { meta: VendorServicesMeta }) {
  if (meta.isPremium || meta.activeLimit === null) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
        <CrownIcon className="size-5 text-gold" aria-hidden="true" />
        <p className="text-sm">
          <span className="font-semibold">Premium vendor</span> · {meta.activeCount} active service
          {meta.activeCount === 1 ? "" : "s"} · unlimited
        </p>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((meta.activeCount / meta.activeLimit) * 100));
  const full = meta.activeCount >= meta.activeLimit;
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p>
          <span className="font-semibold">Free plan</span> · {meta.activeCount} of {meta.activeLimit} active services
        </p>
        <p className="text-muted-foreground">
          {full ? "Limit reached — upgrade to Premium for unlimited services." : "Pending and approved services that are available count."}
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={meta.activeLimit}
        aria-valuenow={meta.activeCount}
        aria-label="Active services used"
      >
        <div className={cn("h-full rounded-full", full ? "bg-gold" : "bg-primary")} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
