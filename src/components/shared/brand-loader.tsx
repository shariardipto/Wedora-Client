import { BrandLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/** Branded loading indicator: the Wedora logo gently pulsing. */
export function BrandLoader({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center gap-4", className)}
    >
      <BrandLogo centered alt="" height={64} className="h-14 animate-pulse motion-reduce:animate-none" />
      <span className="text-sm text-muted-foreground">{label}…</span>
    </div>
  );
}
