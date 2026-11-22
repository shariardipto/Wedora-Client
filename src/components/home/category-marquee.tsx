"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const WORDS = ["Photography", "Venues", "Florals", "Catering", "Makeup & Styling", "Bridal Fashion"];

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0 text-gold sm:size-8">
      <path fill="currentColor" d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0Z" />
    </svg>
  );
}

/**
 * Decorative ticker of the six categories. It drifts on its own and speeds up
 * with scroll velocity (reversing when you scroll back up).
 */
export function CategoryMarquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current?.querySelector("[data-track]");
      if (!track) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 42, repeat: -1 });
        loop.totalTime(loop.duration() * 50); // room to run backwards
        const boost = gsap.quickTo(loop, "timeScale", { duration: 0.6, ease: "power2.out" });
        let settle: gsap.core.Tween | undefined;
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const direction = self.direction;
            boost(direction * (1 + Math.min(Math.abs(self.getVelocity()) / 350, 6)));
            settle?.kill();
            settle = gsap.delayedCall(0.15, () => boost(direction));
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" data-nav-theme="dark" className="grain relative overflow-hidden border-y border-gold/20 bg-night py-7 sm:py-9">
      <div data-track className="flex w-max will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {WORDS.map((word, index) => (
              <span key={word} className="flex items-center gap-8 px-6 sm:gap-12 sm:px-8">
                <span
                  className={cn(
                    "font-display text-5xl leading-none font-medium whitespace-nowrap italic sm:text-7xl",
                    index % 2 === 0 ? "text-gold-light" : "text-outline-gold",
                  )}
                >
                  {word}
                </span>
                <Sparkle />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
