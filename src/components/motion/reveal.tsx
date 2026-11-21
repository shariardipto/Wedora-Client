"use client";

import { motion, type Variants } from "motion/react";

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
  /** Seconds between each child's entrance. */
  gap?: number;
  as?: "div" | "ul" | "ol";
};

/** Container that reveals its <StaggerItem> children one after another. */
export function Stagger({
  children,
  className,
  gap = 0.08,
  as = "div",
}: StaggerProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Component = motion[as];
  return (
    <Component className={className} variants={fadeUp}>
      {children}
    </Component>
  );
}
