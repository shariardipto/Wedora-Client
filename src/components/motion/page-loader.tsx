"use client";

import { useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/logo";
import { GoldDust } from "@/components/motion/gold-dust";
import { markIntroDone } from "@/lib/intro";
import { gsap, useGSAP } from "@/lib/gsap";

const MIN_VISIBLE_MS = 1200;
const MAX_WAIT_MS = 4000;

function pageReady(): Promise<void> {
  const loaded = new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });
  const fonts = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();
  const cap = new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT_MS));
  return Promise.race([Promise.all([loaded, fonts]).then(() => undefined), cap]);
}

/**
 * Full-page intro shown on every full load / refresh of public pages:
 * the white logo rises on deep wine while a gold line counts to 100, then the
 * logo fades out in the centre as the whole panel morphs into the floating navbar.
 *
 * Server-rendered so it covers the page from the first paint; CSS keeps it
 * hidden without JavaScript or with reduced motion, and a 7 s CSS fallback
 * removes it if a script ever fails.
 */
export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const html = document.documentElement;
      const finish = () => {
        html.classList.remove("intro-active");
        markIntroDone();
        setFinished(true);
      };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }

      html.classList.add("intro-active");
      const q = gsap.utils.selector(el);
      const logo = q("[data-loader-logo]")[0];
      const bar = q("[data-loader-bar]")[0];
      const count = q("[data-loader-count]")[0];
      const progress = { value: 0 };
      const render = () => {
        if (count) count.textContent = String(Math.round(progress.value)).padStart(3, "0");
        if (bar) bar.style.transform = `scaleX(${progress.value / 100})`;
      };

      // Enter: logo rises out of its mask, meta fades in, progress climbs while the page loads.
      gsap
        .timeline()
        .fromTo(logo ?? [], { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1, ease: "power4.out" }, 0.1)
        .fromTo(q("[data-loader-meta]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.35)
        .to(progress, { value: 86, duration: 1.1, ease: "power2.out", onUpdate: render }, 0.2);

      const minimum = new Promise<void>((resolve) => window.setTimeout(resolve, MIN_VISIBLE_MS));
      let cancelled = false;
      void Promise.all([minimum, pageReady()]).then(() => {
        if (cancelled) return;
        const exit = gsap.timeline({ onComplete: finish });
        exit
          .to(progress, { value: 100, duration: 0.35, ease: "power1.out", onUpdate: render, overwrite: true })
          .to(q("[data-loader-meta]"), { autoAlpha: 0, y: -8, duration: 0.3, ease: "power2.in" }, ">-0.05");

        // Morph target: the floating navbar pill. The logo stays centred and fades out.
        const pill = document.querySelector<HTMLElement>("[data-site-header] .nav-pill");
        const pillRect = pill?.getBoundingClientRect();
        if (pillRect && pillRect.width > 0 && pillRect.top >= 0) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const radius = pillRect.height / 2;
          exit.fromTo(
            el,
            { clipPath: "inset(0px 0px 0px 0px round 0px)" },
            {
              clipPath: `inset(${pillRect.top}px ${vw - pillRect.right}px ${vh - pillRect.bottom}px ${pillRect.left}px round ${radius}px)`,
              duration: 1.05,
              ease: "expo.inOut",
            },
            ">-0.1",
          );
          if (logo) {
            exit.to(logo, { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: "power2.in" }, "<");
          }
          exit.to(el, { autoAlpha: 0, duration: 0.35, ease: "power1.out" }, ">-0.05");
        } else {
          // Navbar not on screen (e.g. restored mid-page): lift the curtain instead.
          if (logo) exit.to(logo, { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: "power2.in" }, ">-0.1");
          exit.to(el, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "<");
        }
      });

      return () => {
        cancelled = true;
        html.classList.remove("intro-active");
      };
    },
    { scope: root },
  );

  if (finished) return null;

  return (
    <div ref={root} data-page-loader aria-hidden="true" className="page-loader grain fixed inset-0 z-[100] overflow-hidden text-background">
      {/* The hero's golden-hour palette (see .page-loader) with twinkling CSS gold dust — no second WebGL canvas. */}
      <GoldDust count={56} />
      <div className="relative overflow-hidden px-6 pb-3">
        <div data-loader-logo className="page-loader-logo">
          <BrandLogo variant="white" alt="" eager height={160} className="h-24 sm:h-32" />
        </div>
      </div>
      <div data-loader-meta className="page-loader-meta mt-8 flex w-56 flex-col items-center gap-3">
        <div className="relative h-px w-full overflow-hidden bg-white/15">
          <span data-loader-bar className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-gold to-gold-light" />
        </div>
        <div className="flex w-full items-center justify-between text-[0.65rem] tracking-[0.3em] text-background/60 uppercase">
          <span>Wedora</span>
          <span data-loader-count className="font-semibold text-gold-light tabular-nums">000</span>
        </div>
      </div>
    </div>
  );
}
