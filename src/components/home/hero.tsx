"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  HeartIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/images/hero-couple.jpg";

const EASE = [0.22, 1, 0.36, 1] as const;

const highlights = [
  { icon: ShieldCheckIcon, label: "Admin-reviewed vendors" },
  { icon: HeartIcon, label: "Free for couples" },
  { icon: CalendarCheckIcon, label: "Track every request" },
];

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[min(100svh-4rem,52rem)] items-center overflow-hidden bg-night"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <Image
          src={heroImage}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
      </motion.div>
      {/* Readability overlays: stronger on the text side and at the bottom on mobile. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-night/90 via-night/55 to-night/20 md:bg-gradient-to-r md:from-night/90 md:via-night/55 md:to-night/5"
      />

      <motion.div
        className="container-page py-20 md:py-28"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
        }}
      >
        <div className="max-w-2xl text-background">
          <motion.p
            variants={item}
            className="inline-flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.2em] text-gold-light uppercase sm:text-xs sm:tracking-[0.28em]"
          >
            <span aria-hidden="true" className="hidden h-px w-10 bg-gold sm:block" />
            Wedding planning, beautifully simple
          </motion.p>

          <motion.h1
            id="hero-title"
            variants={item}
            className="mt-6 text-5xl leading-[1.02] font-semibold sm:text-6xl lg:text-7xl"
          >
            Plan the wedding you&rsquo;ve always{" "}
            <em className="font-medium text-gold">imagined</em>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-8 text-background/80 sm:text-lg"
          >
            Discover trusted photographers, venues, florists, caterers and
            stylists — compare their services and send booking requests, all
            from one calm, organized place.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-full bg-background px-7 text-base text-primary hover:bg-background/90"
            >
              <Link href="/services">
                Explore Wedding Services
                <ArrowRightIcon
                  data-icon="inline-end"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-background/40 bg-transparent px-7 text-base text-background hover:border-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/signup?role=vendor">Join as a Vendor</Link>
            </Button>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-background/15 pt-6 text-sm text-background/80"
          >
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-gold" aria-hidden="true" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  );
}
