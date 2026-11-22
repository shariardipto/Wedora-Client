"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Moves its children vertically while the parent scrolls through the viewport.
 * The parent must be `relative overflow-hidden`; the layer is 20% taller so
 * edges never show.
 */
export function ParallaxLayer({
  children,
  amount = 8,
  className,
}: {
  children: React.ReactNode;
  /** Travel in percent of the layer's height, each way. */
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el?.parentElement) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={cn("absolute inset-x-0 -inset-y-[10%] will-change-transform", className)}>
      {children}
    </div>
  );
}

/** A decorative line that draws itself as its section scrolls into view. */
export function DrawLine({ className, vertical = false }: { className?: string; vertical?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo(
          el,
          vertical ? { scaleY: 0 } : { scaleX: 0 },
          {
            ...(vertical ? { scaleY: 1 } : { scaleX: 1 }),
            transformOrigin: vertical ? "top center" : "left center",
            ease: "none",
            scrollTrigger: { trigger: el.closest("section") ?? el, start: "top 75%", end: "center 45%", scrub: 0.6 },
          },
        );
      });
    },
    { scope: ref },
  );
  return <span ref={ref} aria-hidden="true" className={className} />;
}
