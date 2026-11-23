"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

let activeLenis: Lenis | null = null;

/** Scrolls to an element through Lenis when it's running (honours scroll-margin), natively otherwise. */
export function smoothScrollTo(target: HTMLElement) {
  if (activeLenis) activeLenis.scrollTo(target);
  else target.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Lenis smooth scrolling for the public site, driven by GSAP's ticker so
 * ScrollTrigger animations stay perfectly in sync. Disabled for visitors who
 * prefer reduced motion and for touch scrolling (native feels better there).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      lerp: 0.1,
      // Let dialogs, menus and listboxes scroll natively.
      prevent: (node) =>
        node instanceof Element &&
        node.closest("[data-lenis-prevent],[role=dialog],[role=alertdialog],[role=listbox],[role=menu]") !== null,
    });
    activeLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Pause Lenis while Radix dialogs lock the page (data-scroll-locked on <body>)
    // or the full-page intro is playing (html.intro-active).
    const syncLock = () => {
      const locked =
        document.body.hasAttribute("data-scroll-locked") ||
        document.documentElement.classList.contains("intro-active");
      if (locked) lenis.stop();
      else lenis.start();
    };
    syncLock();
    const lockObserver = new MutationObserver(syncLock);
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
    lockObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      lockObserver.disconnect();
      gsap.ticker.remove(tick);
      if (activeLenis === lenis) activeLenis = null;
      lenis.destroy();
    };
  }, []);

  // New page, new layout: recalculate every scroll-driven animation.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Arriving at "/page#section": Next.js scrolls to the section, but content streamed in above it
  // afterwards (e.g. the featured services replacing their placeholder) pushes it down the screen.
  // Keep the section in place while the layout settles: until the visitor scrolls, or 3 s pass.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const realign = () => {
      const target = document.getElementById(id);
      if (!target) return;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const drift = target.getBoundingClientRect().top - margin;
      if (Math.abs(drift) < 2) return;
      const top = window.scrollY + drift;
      if (activeLenis) {
        // Re-measure first: Lenis clamps to the page height it last measured, which may still be the
        // previous (shorter) page's.
        activeLenis.resize();
        activeLenis.scrollTo(top, { immediate: true, force: true });
      } else {
        window.scrollTo({ top, behavior: "instant" });
      }
    };
    const layout = new ResizeObserver(realign);
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    let timer = 0;
    const stop = () => {
      layout.disconnect();
      window.clearTimeout(timer);
      events.forEach((type) => window.removeEventListener(type, stop));
    };
    layout.observe(document.body);
    events.forEach((type) => window.addEventListener(type, stop, { passive: true }));
    timer = window.setTimeout(stop, 3000);
    return stop;
  }, [pathname]);

  return null;
}
