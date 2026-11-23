"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
  /** Extra classes for the title, e.g. a larger size. */
  titleClassName?: string;
  /** Light text for dark sections. */
  tone?: "default" | "light";
};

/** Eyebrow rules draw out, the title rises word by word, the description fades up. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleClassName,
  tone = "default",
}: SectionHeadingProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        const heading = q("h2")[0];
        if (!heading) return;
        gsap.set(heading, { autoAlpha: 1 });
        const split = SplitText.create(heading, { type: "words", wordsClass: "split-word" });
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 86%", once: true },
        });
        tl.from(q("[data-rule]"), { scaleX: 0, duration: 0.8, stagger: 0.1 }, 0)
          .from(q("[data-eyebrow]"), { autoAlpha: 0, y: 8, duration: 0.6 }, 0.05)
          .from(split.words, { yPercent: 80, autoAlpha: 0, filter: "blur(8px)", duration: 0.95, stagger: 0.05, ease: "power4.out", clearProps: "filter,transform" }, 0.1)
          .from(q("[data-description]"), { autoAlpha: 0, y: 16, duration: 0.8 }, 0.45);
        return () => split.revert();
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(gsap.utils.selector(root)("h2"), { autoAlpha: 1 });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("eyebrow inline-flex items-center gap-3", tone === "light" && "text-gold-light!")}>
        <span data-rule aria-hidden="true" className="h-px w-8 origin-right bg-gold" />
        <span data-eyebrow>{eyebrow}</span>
        {align === "center" && <span data-rule aria-hidden="true" className="h-px w-8 origin-left bg-gold" />}
      </p>
      <h2
        id={id}
        data-reveal
        className={cn(
          "mt-4 text-4xl leading-[1.1] font-semibold sm:text-5xl",
          tone === "light" ? "text-background" : "text-foreground",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          data-description
          className={cn(
            "mt-4 text-base leading-7 sm:text-lg",
            tone === "light" ? "text-background/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
