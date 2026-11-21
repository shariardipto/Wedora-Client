import { cn } from "@/lib/utils";

/** Branded loading indicator: two rings gently pulsing. */
export function RingsLoader({
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
      <svg viewBox="0 0 48 32" className="h-10 w-auto" fill="none" aria-hidden="true">
        <circle
          cx="17"
          cy="16"
          r="11"
          stroke="var(--gold)"
          strokeWidth="3"
          className="origin-center animate-pulse"
        />
        <circle
          cx="31"
          cy="16"
          r="11"
          stroke="var(--primary)"
          strokeWidth="3"
          className="origin-center animate-pulse [animation-delay:300ms]"
        />
      </svg>
      <span className="text-sm text-muted-foreground">{label}…</span>
    </div>
  );
}
