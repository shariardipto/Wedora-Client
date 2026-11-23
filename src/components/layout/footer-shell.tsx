"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The <footer> element and its entrance: ornament rules draw outward from their centre
 * ([data-f-rule="end"] grows from its right end, "start" from its left), and [data-f-item]
 * blocks rise in turn as they scroll into view. Nothing moves for reduced motion.
 */
export function FooterShell({ children, ...props }: React.ComponentProps<"footer">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        for (const rule of q("[data-f-rule]") as HTMLElement[]) {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.4,
              ease: "power3.inOut",
              transformOrigin: rule.dataset.fRule === "end" ? "right center" : "left center",
              scrollTrigger: { trigger: rule, start: "top bottom-=40", once: true },
            },
          );
        }

        const items = q("[data-f-item]");
        gsap.set(items, { autoAlpha: 0, y: 28 });
        ScrollTrigger.batch(items, {
          start: "top bottom-=40",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, overwrite: true }),
        });
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} {...props}>
      {children}
    </footer>
  );
}
