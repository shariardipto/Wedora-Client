import Link from "next/link";
import { cn } from "@/lib/utils";

/** Two interlocking rings with a small diamond — the Wedora mark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 40"
      className={cn("h-7 w-auto", className)}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="17" cy="23" r="12" stroke="var(--gold)" strokeWidth="3.2" />
      <circle cx="31" cy="23" r="12" stroke="currentColor" strokeWidth="3.2" />
      <path d="M31 2.5 34 6l-3 3.5L28 6z" fill="var(--gold)" />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  /** "light" for dark backgrounds such as the footer. */
  tone?: "dark" | "light";
};

export function Logo({ className, tone = "dark" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Wedora home"
      className={cn(
        "inline-flex items-center gap-2 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        tone === "dark" ? "text-primary" : "text-background",
        className,
      )}
    >
      <LogoMark />
      <span
        className={cn(
          "font-display text-[1.75rem] leading-none font-semibold tracking-tight",
          tone === "dark" ? "text-foreground" : "text-background",
        )}
      >
        Wedora
      </span>
    </Link>
  );
}
