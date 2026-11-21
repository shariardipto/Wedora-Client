import { cn } from "@/lib/utils";

type PriceProps = {
  amount: number;
  className?: string;
  /**
   * "display": elegant serif figures with a small raised gold $ — for cards,
   * details and marketing. "plain": compact sans figures — for tables and lists.
   */
  variant?: "display" | "plain";
};

/** A US-dollar amount, e.g. $12,500. */
export function Price({ amount, className, variant = "plain" }: PriceProps) {
  const digits = Math.round(amount).toLocaleString("en-US");

  if (variant === "display") {
    return (
      <span
        className={cn(
          "inline-flex items-start font-display leading-none font-semibold tracking-tight whitespace-nowrap lining-nums",
          className,
        )}
      >
        <span className="sr-only">${digits}</span>
        <span aria-hidden="true" className="mt-[0.14em] mr-[0.06em] text-[0.52em] font-semibold text-gold-strong">
          $
        </span>
        <span aria-hidden="true">{digits}</span>
      </span>
    );
  }

  return (
    <span className={cn("font-sans whitespace-nowrap tabular-nums lining-nums", className)}>${digits}</span>
  );
}

/** Small letter-spaced caption that sits above a display price. */
export function PriceCaption({ children = "Starting from", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase", className)}>
      {children}
    </p>
  );
}
