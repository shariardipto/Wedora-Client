"use client";

import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/** Fades and lifts its content once, when it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds between the entrances of items that reach the screen together (e.g. one row of cards). */
  gap?: number;
  as?: "div" | "ul" | "ol";
};

/**
 * Container whose <StaggerItem> children rise into place as EACH one reaches the screen, with the
 * items arriving together (one row of cards) following one another, left to right. Watching every
 * item on its own matters on phones: a tall one-column grid used to wait for the whole list, then
 * play every card at once, mostly off-screen, so cards seemed to just appear. GSAP drives the
 * motion, like the headings; an IntersectionObserver decides when (it never needs re-measuring
 * when content above streams in). Nothing moves for reduced motion.
 */
export function Stagger({ children, className, gap = 0.1, as = "div" }: StaggerProps) {
  const ref = useRef<HTMLElement>(null);
  const Component = as as React.ElementType;

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        const items = Array.from(root.querySelectorAll<HTMLElement>(":scope > [data-stagger-item]"));
        if (items.length === 0) return;
        gsap.set(items, { autoAlpha: 0, y: 56, scale: 0.97 });

        const observer = new IntersectionObserver(
          (entries) => {
            const arriving = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement);
            if (arriving.length === 0) return;
            arriving.forEach((item) => observer.unobserve(item));
            // Reading order: top to bottom, then left to right.
            const position = (item: HTMLElement) => item.getBoundingClientRect();
            arriving.sort((a, b) => position(a).top - position(b).top || position(a).left - position(b).left);
            gsap.to(arriving, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 1.05,
              ease: "power3.out",
              stagger: gap,
              overwrite: true,
              clearProps: "transform",
            });
          },
          // An item starts once its top is 8% of the screen above the bottom edge.
          { rootMargin: "0px 0px -8% 0px" },
        );
        items.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
      });
    },
    { scope: ref },
  );

  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}

/** One item of a <Stagger>. Hidden until its entrance (only when JS runs and motion is allowed). */
export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Component = as;
  return (
    <Component data-stagger-item data-reveal className={className}>
      {children}
    </Component>
  );
}
