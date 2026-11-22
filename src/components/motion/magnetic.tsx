"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Pulls its child gently toward a mouse cursor; springs back on leave. Mouse only. */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onPointerMove(event: React.PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse" || reduced()) return;
    const rect = el.getBoundingClientRect();
    gsap.to(el, {
      x: (event.clientX - (rect.left + rect.width / 2)) * strength,
      y: (event.clientY - (rect.top + rect.height / 2)) * strength,
      duration: 0.45,
      ease: "power3.out",
    });
  }

  function onPointerLeave() {
    if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
  }

  return (
    <span
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("inline-flex will-change-transform", className)}
    >
      {children}
    </span>
  );
}
