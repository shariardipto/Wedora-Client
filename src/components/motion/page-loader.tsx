"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatedLogo } from "@/components/brand/animated-logo";
import { GoldDust } from "@/components/motion/gold-dust";
import { gsap, useGSAP } from "@/lib/gsap";
import { introStartHolds, markIntroDone, startIntro } from "@/lib/intro";

/** The longest the logo waits, before writing, for work held for it (the 3D hero's set-up). */
const MAX_HOLD_MS = 1500;
/** Before writing, the logo waits for the page's start-up work (the 3D hero), at most MAX_HOLD_MS. */
const waitForHeldWork = () => introStartHolds(MAX_HOLD_MS);

/**
 * After the logo's shine (seconds): the logo softens away, and the page starts opening this far into
 * that fade, unhurried (owner: opening at once felt too fast; the old 1.3–3.2 s wait, too slow).
 */
const LOGO_FADE = 0.6;
const OPEN_AT = 0.3;
const OPEN_DURATION = 1.2;

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
 * Full-page intro for the HOME page: it plays every time the plain home page is shown (a full load,
 * a reload, or navigating to Home from another page). Opening the home page at a section
 * (/#how-it-works, /#for-vendors) goes straight there, and other pages never show it.
 */
export function PageLoader() {
  const pathname = usePathname();
  // Leaving "/" unmounts the intro, so arriving at "/" again mounts (and plays) a fresh one.
  return pathname === "/" ? <HomeIntro /> : null;
}

/**
 * The intro itself:
 * the Wedora logo writes itself on deep wine (the approved animation, at full speed). Heavy start-up
 * work (the hero's 3D scene) is done before the first stroke, while only the gold dust shows. The
 * moment the logo's shine ends, the page opens from the centre outward through a soft-edged circle
 * while the logo softens away and the panel dissolves.
 *
 * Server-rendered so it covers the page from the first paint; CSS keeps it
 * hidden without JavaScript or with reduced motion, and a 9 s CSS fallback
 * removes it if a script ever fails.
 */
function HomeIntro() {
  const root = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);
  // The logo's "once" animation reports when it has finished writing (it may finish before this effect subscribes).
  const logoWritten = useRef(false);
  const onLogoWritten = useRef<(() => void) | null>(null);

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
      // Opened at a section (e.g. "How It Works" from another page): skip straight to it. This runs
      // before the first paint, so the loader never shows; then lift the full-load guard so a later
      // plain Home click gets its intro.
      const atSection = window.location.hash.length > 1;
      if (atSection || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        html.classList.remove("intro-skip");
        return;
      }
      html.classList.remove("intro-skip");

      // Entrance animations on the page (afterIntro) wait for this intro, also on a repeat visit.
      startIntro();
      html.classList.add("intro-active");
      // The script is running and ends the intro itself, so the no-script fallback (hide at 9 s) moves
      // later: the logo may wait up to MAX_HOLD_MS for the 3D scene before it starts writing.
      el.style.animationDelay = "15s";
      const logo = gsap.utils.selector(el)("[data-loader-logo]")[0];
      // Enter: the logo writes itself (AnimatedLogo, once, at full speed).
      gsap.set(logo ?? [], { autoAlpha: 1 });

      const written = logoWritten.current
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            onLogoWritten.current = resolve;
          });
      let cancelled = false;
      // The exit starts as soon as the logo is written (its shine has just ended) and the page is ready.
      // Nothing else is waited for here: the 3D scene was set up before the writing began.
      void Promise.all([written, pageReady()]).then(() => {
        if (cancelled) return;
        const exit = gsap.timeline({ onComplete: finish });
        exit
          // The finished logo softens and fades in place, in the centre.
          .to(logo ?? [], { autoAlpha: 0, scale: 1.05, filter: "blur(6px)", duration: LOGO_FADE, ease: "power2.in" }, 0)
          // Part-way through, the page opens from the centre outward: a soft-edged circle grows (CSS mask
          // driven by --iris, see .page-loader-exit) while the panel dissolves. The page's own entrance
          // starts with it.
          .call(
            () => {
              el.classList.add("page-loader-exit");
              markIntroDone();
            },
            [],
            OPEN_AT,
          )
          .fromTo(el, { "--iris": "0vmax" }, { "--iris": "95vmax", duration: OPEN_DURATION, ease: "power2.inOut" }, OPEN_AT)
          .to(el, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, OPEN_AT + OPEN_DURATION - 0.5);
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
      <div className="relative px-6">
        <div data-loader-logo className="page-loader-logo">
          {/* Optically centred: the artwork's box is centred in its frame, but its weight isn't. The thin
              flourish fills the left while the W, the white wordmark and the leaves sit right of centre
              (contrast-weighted centre of the ink ≈ 9.5% of the width right, ≈ 2% low). Shifting by that
              puts the W on the centre line. Uses `translate` (not `transform`), so it never fights the
              GSAP scale on the wrapper during the exit. */}
          <AnimatedLogo
            mode="once"
            speed={1}
            waitForIdle
            startAfter={waitForHeldWork}
            className="h-24 -translate-x-[10%] -translate-y-[2%] sm:h-32"
            wordClassName="fill-white"
            onComplete={() => {
              logoWritten.current = true;
              onLogoWritten.current?.();
            }}
          />
        </div>
      </div>
    </div>
  );
}
