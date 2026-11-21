import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logoColored from "@/assets/brand/logo-colored.png";
import logoWhite from "@/assets/brand/logo-white.png";

/** Intrinsic aspect ratio of the logo artwork (1200 × 674). */
const RATIO = logoColored.width / logoColored.height;

export type LogoVariant = "colored" | "white";

type BrandLogoProps = {
  /** "colored" for light backgrounds, "white" for dark ones (white wordmark). */
  variant?: LogoVariant;
  /**
   * Largest rendered height in CSS px. Used to request a right-sized image
   * (1x/2x) — set the visible height with `className` (e.g. "h-12 md:h-14").
   */
  height?: number;
  className?: string;
  /** Above-the-fold logos (navbar) load eagerly. */
  eager?: boolean;
  alt?: string;
  /**
   * Optical centering for centered layouts. The left flourish makes the
   * artwork asymmetric: the "W"/WEDORA wordmark sits at 66% of the width,
   * so the image is shifted left by 16% to put the wordmark on the axis.
   */
  centered?: boolean;
};

/** The Wedora monogram + wordmark artwork. */
export function BrandLogo({
  variant = "colored",
  height = 56,
  className,
  eager,
  alt = "Wedora",
  centered = false,
}: BrandLogoProps) {
  return (
    <Image
      src={variant === "white" ? logoWhite : logoColored}
      alt={alt}
      height={height}
      width={Math.round(height * RATIO)}
      loading={eager ? "eager" : undefined}
      draggable={false}
      className={cn("w-auto max-w-none select-none", centered && "-translate-x-[16%]", className)}
    />
  );
}

type LogoProps = {
  className?: string;
  variant?: LogoVariant;
  /** Visible logo height classes. */
  imageClassName?: string;
  height?: number;
  eager?: boolean;
};

/** Logo linking home — used in the navbar and footer. */
export function Logo({
  className,
  variant = "colored",
  imageClassName = "h-12 md:h-14",
  height = 56,
  eager,
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Wedora home"
      className={cn(
        "inline-flex shrink-0 items-center rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <BrandLogo variant={variant} height={height} className={imageClassName} eager={eager} />
    </Link>
  );
}
