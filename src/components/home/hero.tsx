"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CalendarCheckIcon,
  CalendarHeartIcon,
  HeartHandshakeIcon,
  LayoutGridIcon,
} from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { MOTION_OK, gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { afterIntro } from "@/lib/intro";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/images/hero-couple.jpg";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

// What couples actually get, in their words. Every line is true of the product: our team approves
// each listing before it goes live, couples never pay Wedora, and each request shows its live status.
const highlights = [
  { icon: BadgeCheckIcon, label: "Every vendor hand-approved" },
  { icon: HeartHandshakeIcon, label: "No fees for couples" },
  { icon: CalendarCheckIcon, label: "Live status on every request" },
];

/** Mounts the WebGL scene only when it can run well: WebGL available, motion allowed, page idle. */
function useSceneEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Low-end devices keep the static hero (photo + gradient): smooth scrolling matters more.
    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4) return;
    // No real GPU (hardware acceleration off, VMs, headless): browsers fall back to software
    // WebGL, which runs the scene on the CPU and makes the whole page lag. Keep the static hero.
    const probe = document.createElement("canvas");
    const options: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const context: WebGLRenderingContext | WebGL2RenderingContext | null =
      probe.getContext("webgl2", options) ?? probe.getContext("webgl", options);
    if (!context) return;
    let renderer = String(context.getParameter(context.RENDERER) ?? "");
    if (/^webkit webgl$/i.test(renderer)) {
      // Chrome/Safari mask RENDERER; Firefox already returns the real (sanitised) name.
      const debug = context.getExtension("WEBGL_debug_renderer_info");
      if (debug) renderer = String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? "");
    }
    context.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return;
    const enable = () => setEnabled(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(enable, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(enable, 250);
    return () => clearTimeout(id);
  }, []);
  return enabled;
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const sceneEnabled = useSceneEnabled();
  const [sceneReady, setSceneReady] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
        const title = q("#hero-title")[0];
        const split = title ? SplitText.create(title, { type: "words", wordsClass: "split-word" }) : null;

        // Built now (so everything starts hidden), played once the page loader has revealed the page.
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
        tl.from(q("[data-hero-rule]"), { scaleX: 0, transformOrigin: "left center", duration: 0.9 }, 0)
          .from(q("[data-hero-eyebrow]"), { autoAlpha: 0, x: -12, duration: 0.7 }, 0.1)
          .from(
            split?.words ?? [],
            { yPercent: 90, rotationX: -55, autoAlpha: 0, filter: "blur(12px)", duration: 1.15, stagger: 0.065, ease: "power4.out", clearProps: "filter,transform" },
            0.15,
          )
          .from(q("[data-hero-lead]"), { y: 24, autoAlpha: 0, duration: 0.9 }, 0.65)
          .from(q("[data-hero-cta] > *"), { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.09 }, 0.8)
          .from(q("[data-hero-highlights] li"), { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.07 }, 0.95)
          .fromTo(
            q("[data-hero-frame]"),
            { clipPath: "inset(100% 0% 0% 0% round 999px 999px 32px 32px)" },
            { clipPath: "inset(0% 0% 0% 0% round 999px 999px 32px 32px)", duration: 1.5, ease: "power4.inOut" },
            0.1,
          )
          .from(q("[data-hero-photo]"), { scale: 1.25, duration: 1.9, ease: "power3.out" }, 0.1)
          .from(q("[data-hero-chip]"), { y: 24, scale: 0.85, autoAlpha: 0, duration: 0.8, stagger: 0.14, ease: "back.out(1.6)" }, 1.1)
          .from(q("[data-scroll-cue]"), { autoAlpha: 0, y: -8, duration: 0.8 }, 1.4);

        // Idle "wander" on the glass chips: each drifts to a random nearby point (a few px in any
        // direction, a slight tilt) at a random pace, then picks a new one, so the two never move
        // in step or in a fixed rhythm. Starts only after their entrance (which also animates `y`)
        // and pauses while the hero is off-screen.
        const chips = q("[data-hero-chip]");
        const wanders: (gsap.core.Tween | undefined)[] = [];
        let stopped = false;
        let onScreen = true;
        const wander = (index: number) => {
          if (stopped) return;
          wanders[index] = gsap.to(chips[index], {
            x: gsap.utils.random(-7, 7),
            y: gsap.utils.random(-6, 6),
            rotation: gsap.utils.random(-1.2, 1.2),
            duration: gsap.utils.random(2.6, 4.4),
            ease: "sine.inOut",
            paused: !onScreen,
            onComplete: () => wander(index),
          });
        };
        tl.call(() => chips.forEach((_, index) => gsap.delayedCall(index * 0.9, () => wander(index))), [], ">");
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            onScreen = self.isActive;
            for (const tween of wanders) {
              if (onScreen) tween?.resume();
              else tween?.pause();
            }
          },
        });

        // Scroll-out: copy drifts up and fades, the photo sinks a little (parallax depth).
        const scrub = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to(q("[data-hero-copy]"), { yPercent: -14, autoAlpha: 0.15, ease: "none", scrollTrigger: scrub });
        gsap.to(q("[data-hero-visual]"), { yPercent: 12, ease: "none", scrollTrigger: scrub });

        const cancelIntroWait = afterIntro(() => tl.play());

        return () => {
          cancelIntroWait();
          split?.revert();
          // Wander tweens are created after this context ran, so stop them explicitly.
          stopped = true;
          wanders.forEach((tween) => tween?.kill());
        };
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(gsap.utils.selector(root)("[data-reveal]"), { autoAlpha: 1 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      data-nav-theme="dark"
      className="grain relative isolate -mt-20 overflow-hidden bg-night pt-20 text-background md:-mt-[5.5rem] md:pt-[5.5rem]"
    >
      {/* Backdrop: deep wine with a warm golden-hour glow. */}
      <div aria-hidden="true" className="hero-backdrop absolute inset-0 -z-30" />

      {/* Phones and tablets: the photo sits behind the copy. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 lg:hidden">
        <Image
          src={heroImage}
          alt=""
          fill
          preload
          placeholder="blur"
          // Hidden from lg up (the arch photo takes over), so desktops fetch only the tiniest version
          // instead of a full-width copy nobody sees (mirrors the arch photo's "1px" below lg).
          sizes="(min-width: 1024px) 1px, 100vw"
          className="object-cover object-[60%_center] opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/75 to-night/35" />
      </div>

      {/* WebGL layer: above the photo, below the copy. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-10 transition-opacity duration-[1600ms] ease-out",
          sceneReady ? "opacity-100" : "opacity-0",
        )}
      >
        {sceneEnabled && <HeroScene rootRef={root} onReady={() => setSceneReady(true)} />}
      </div>
      <div aria-hidden="true" data-ring-anchor className="absolute top-[7%] right-[-5%] size-36 sm:top-[5%] sm:size-44 lg:hidden" />

      <div className="container-page grid min-h-[min(calc(100svh-5rem),58rem)] grid-cols-1 items-center gap-14 py-16 md:min-h-[min(calc(100svh-5.5rem),58rem)] lg:grid-cols-[1.08fr_0.92fr] lg:py-12">
        <div data-hero-copy className="relative z-20 max-w-2xl">
          <p data-reveal className="inline-flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.2em] text-gold-light uppercase sm:text-xs sm:tracking-[0.28em]">
            <span data-hero-rule aria-hidden="true" className="hidden h-px w-10 bg-gold sm:block" />
            <span data-hero-eyebrow>Wedding planning, beautifully simple</span>
          </p>

          <h1
            id="hero-title"
            data-reveal
            className="hero-title mt-6 text-5xl leading-[1.04] font-semibold [perspective:700px] sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
          >
            Plan the wedding you&rsquo;ve always <em className="text-shimmer font-medium">imagined</em>
          </h1>

          <p data-reveal data-hero-lead className="mt-6 max-w-xl text-base leading-8 text-background/80 sm:text-lg">
            Discover trusted photographers, venues, florists, caterers and stylists — compare their services and send
            booking requests, all from one calm, organized place.
          </p>

          <div data-reveal data-hero-cta className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic>
              <Button
                asChild
                size="lg"
                className="shine group h-12 w-full rounded-full bg-background px-7 text-base text-primary shadow-[0_10px_40px_-10px_rgb(220_191_142/0.6)] hover:bg-background sm:w-auto"
              >
                <Link href="/services">
                  Explore Wedding Services
                  <ArrowRightIcon data-icon="inline-end" className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-background/35 bg-background/5 px-7 text-base text-background backdrop-blur-sm hover:border-gold-light hover:bg-background/10 hover:text-background sm:w-auto"
              >
                <Link href="/signup?role=vendor">Join as a Vendor</Link>
              </Button>
            </Magnetic>
          </div>

          <ul
            data-reveal
            data-hero-highlights
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-background/15 pt-6 text-sm text-background/80"
          >
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-gold" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop visual: arch-framed photo; the 3D rings float over its corner.
            Only the frame gets the scroll parallax, so the chips stay above the WebGL layer. */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto w-full max-w-[26rem]">
            <div data-hero-visual className="relative">
              <div aria-hidden="true" className="absolute -inset-4 rounded-t-[999px] rounded-b-[2.6rem] border border-gold/35" />
              <div
                data-reveal
                data-hero-frame
                className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8)]"
              >
                <Image
                  data-hero-photo
                  src={heroImage}
                  alt="A bride and groom embracing at golden hour"
                  fill
                  preload
                  placeholder="blur"
                  sizes="(min-width: 1024px) 26rem, 1px"
                  className="object-cover object-[62%_center]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/45 via-transparent to-transparent" />
              </div>
            </div>

            <div
              data-reveal
              data-hero-chip
              className="glass-chip absolute top-[16%] -left-16 z-20 flex items-center gap-3 rounded-2xl px-4 py-3"
            >
              <span className="grid size-9 place-items-center rounded-full bg-gold/90 text-night">
                <LayoutGridIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-semibold">From venue to vows</span>
                <span className="text-background/70">Six specialties, one search</span>
              </span>
            </div>
            {/* A glimpse of the product: the update a couple sees when a vendor says yes (illustrative,
                so hidden from assistive tech; the vendor is one from the catalog). */}
            <div
              data-reveal
              data-hero-chip
              aria-hidden="true"
              className="glass-chip absolute -right-12 bottom-[14%] z-20 flex items-center gap-3 rounded-2xl px-4 py-3"
            >
              <span className="grid size-9 place-items-center rounded-full bg-background/90 text-primary">
                <CalendarHeartIcon className="size-4" />
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-semibold">Request accepted</span>
                <span className="flex items-center gap-1.5 text-background/70">
                  Ivory Lens Studio
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  just now
                </span>
              </span>
            </div>
            <div aria-hidden="true" data-ring-anchor className="absolute -bottom-10 -left-14 size-56" />
          </div>
        </div>
      </div>

      <div
        data-scroll-cue
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] tracking-[0.3em] text-background/60 uppercase md:flex"
      >
        Scroll
        <span className="scroll-cue-line h-10 w-px overflow-hidden bg-background/15" />
      </div>
    </section>
  );
}
