import { CrownIcon } from "lucide-react";
import { UserAvatar } from "@/components/auth/user-avatar";
import type { VendorSummary } from "@/lib/services/types";
import { cn } from "@/lib/utils";

/** Vendor avatar + business/name, with the Premium crown when applicable. */
export function VendorBadge({
  vendor,
  className,
  size = "sm",
}: {
  vendor: VendorSummary | null;
  className?: string;
  size?: "sm" | "md";
}) {
  if (!vendor) return null;
  const title = vendor.businessName ?? vendor.name;
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <UserAvatar name={title} image={vendor.image} className={size === "md" ? "size-11" : "size-7"} />
      <div className="min-w-0">
        <p className={cn("flex items-center gap-1 truncate font-medium", size === "md" ? "text-base" : "text-xs")}>
          <span className="truncate">{title}</span>
          {vendor.isPremium && (
            <CrownIcon className="size-3.5 shrink-0 text-gold" aria-label="Premium vendor" />
          )}
        </p>
        {size === "md" && vendor.businessName && (
          <p className="truncate text-sm text-muted-foreground">by {vendor.name}</p>
        )}
      </div>
    </div>
  );
}
