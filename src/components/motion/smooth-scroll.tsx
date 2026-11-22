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

  return null;
}
