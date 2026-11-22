"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Page header with a word-by-word title reveal and soft drifting light orbs.
 * Give it a `key` that changes with the title so React never edits split text.
 */
export function PageIntro({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        const heading = q("h1")[0];
        if (!heading) return;
        gsap.set(heading, { autoAlpha: 1 });
        const split = SplitText.create(heading, { type: "words", wordsClass: "split-word" });
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(q("[data-eyebrow]"), { autoAlpha: 0, x: -10, duration: 0.6 }, 0)
          .from(split.words, { yPercent: 80, autoAlpha: 0, filter: "blur(8px)", duration: 0.9, stagger: 0.06, ease: "power4.out", clearProps: "filter,transform" }, 0.05)
          .from(q("[data-description]"), { autoAlpha: 0, y: 12, duration: 0.7 }, 0.35);
        return () => split.revert();
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(gsap.utils.selector(root)("h1"), { autoAlpha: 1 });
      });
    },
    { scope: root },
  );

  return (
    <header ref={root} className={cn("relative isolate max-w-2xl", className)}>
      <span aria-hidden="true" className="orb orb-gold -top-24 -left-24 size-72" />
      <span aria-hidden="true" className="orb orb-blush top-0 left-1/2 size-60" />
      {/* gold-ink keeps the small eyebrow above 4.5:1 even over the warm glow. */}
      <p data-eyebrow className="eyebrow text-gold-ink!">
        {eyebrow}
      </p>
      <h1 data-reveal className="mt-3 text-4xl font-semibold sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      {description && (
        <p data-description className="mt-3 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
