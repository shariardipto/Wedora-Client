"use client";

import { useEffect, useId, useRef } from "react";
import { usePathname } from "next/navigation";
import { LOGO_LETTERS } from "@/components/brand/animated-logo-data";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";
import { afterIntro } from "@/lib/intro";
import { cn } from "@/lib/utils";

/** The WEDORA letters' box in the logo's units, with room for the hairline. */
const BOX = { x: 498, y: 876, w: 622, h: 105 } as const;
const MID_Y = BOX.y + BOX.h / 2;
const SPOT_RADIUS = 80;

/**
 * The brand's own WEDORA letters, set large across the foot of the page. The hairline outlines write
 * themselves when the word scrolls into view, then a soft liquid-gold light drifts through the letters,
 * and follows the cursor while it's over them. The server renders the finished, static word, which is
 * also what reduced-motion visitors see. Decorative: the footer has its own heading and links.
 */
export function FooterWordmark({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // Set by the animation below: un-writes the word so it writes again (on a new page).
  const resetWord = useRef<(() => void) | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `fw-${name}-${uid}`;
  const letters = LOGO_LETTERS.map((_, index) => id(`l${index}`));

  useGSAP(
    () => {
      const el = root.current;
      const svg = el?.querySelector("svg");
      const spot = el?.querySelector<SVGCircleElement>("[data-spot]");
      const shimmer = el?.querySelector<SVGLinearGradientElement>("[data-shimmer]");
      if (!el || !svg || !spot || !shimmer) return;

      gsap.matchMedia().add(MOTION_OK, () => {
        const q = gsap.utils.selector(el);
        const outlines = q("[data-outline] use");
        const layers = q("[data-base],[data-glow]");

        // 1 · Write the word each time it comes into view.
        gsap.set(outlines, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(layers, { autoAlpha: 0 });
        gsap.set(el, { autoAlpha: 1 });
        // An unhurried pen, about half the pace of a quick reveal (like the logo's 0.5× loops): each
        // letter takes ~5 s and the next starts 0.35 s later, so the word takes ~6.5 s in all.
        const write = gsap
          .timeline({ paused: true })
          // autoRound off: GSAP rounds px values by default, which would snap a 1 → 0 offset in one step.
          .to(outlines, { strokeDashoffset: 0, autoRound: false, duration: 4.8, ease: "sine.inOut", stagger: 0.35 })
          .to(layers, { autoAlpha: 1, duration: 2.2, ease: "power1.out" }, "-=1.8");
        // Writes once per page: once most of the word is on screen (not when its top edge peeks in,
        // which left it half-written by the time it was in view), and never behind the home intro (a
        // reload at the footer restores the scroll position; the word used to finish before the intro
        // opened). Scrolling away and back keeps it written; a reload or another page writes it again.
        let waitForIntro: (() => void) | null = null;
        const writer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting || write.progress() > 0 || waitForIntro) return;
            waitForIntro = afterIntro(() => {
              waitForIntro = null;
              write.play();
            });
          },
          { threshold: 0.6, rootMargin: "0px 0px -10% 0px" },
        );
        writer.observe(el);
        resetWord.current = () => {
          waitForIntro?.();
          waitForIntro = null;
          write.pause(0);
          // Re-observing reports the current state at once, so a word already on screen writes again.
          writer.unobserve(el);
          writer.observe(el);
        };

        // 2 · The light drifts along the word on its own and follows a mouse while it's over the word.
        const drift = { x: BOX.x + 60, y: MID_Y };
        const pointer = { x: drift.x, y: drift.y, pull: 0 };
        const spotAt = { x: drift.x, y: drift.y };
        const loops = [
          gsap.to(drift, { x: BOX.x + BOX.w - 60, duration: 11, ease: "sine.inOut", repeat: -1, yoyo: true }),
          gsap.fromTo(drift, { y: MID_Y - 26 }, { y: MID_Y + 26, duration: 4.5, ease: "sine.inOut", repeat: -1, yoyo: true }),
          // One reflect period of the gradient is the box width, so this loops seamlessly.
          gsap.fromTo(shimmer, { attr: { gradientTransform: "translate(0 0)" } }, { attr: { gradientTransform: `translate(${BOX.w} 0)` }, duration: 14, ease: "none", repeat: -1 }),
        ];
        const follow = () => {
          const targetX = drift.x + (pointer.x - drift.x) * pointer.pull;
          const targetY = drift.y + (pointer.y - drift.y) * pointer.pull;
          spotAt.x += (targetX - spotAt.x) * 0.14;
          spotAt.y += (targetY - spotAt.y) * 0.14;
          spot.setAttribute("cx", spotAt.x.toFixed(1));
          spot.setAttribute("cy", spotAt.y.toFixed(1));
        };

        // Only animate while the word is on screen (the loops start paused below).
        let running = true;
        const run = (on: boolean) => {
          if (on === running) return;
          running = on;
          loops.forEach((tween) => (on ? tween.resume() : tween.pause()));
          if (on) gsap.ticker.add(follow);
          else gsap.ticker.remove(follow);
        };
        run(false);
        const visibility = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
        visibility.observe(el);

        const toWord = (event: PointerEvent) => {
          const matrix = svg.getScreenCTM()?.inverse();
          if (!matrix) return null;
          return new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
        };
        let hovering = false;
        const onMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const point = toWord(event);
          if (!point) return;
          pointer.x = point.x;
          pointer.y = point.y;
          if (!hovering) {
            hovering = true;
            gsap.to(pointer, { pull: 1, duration: 0.6, ease: "power2.out", overwrite: true });
          }
        };
        const onLeave = () => {
          hovering = false;
          gsap.to(pointer, { pull: 0, duration: 1.2, ease: "power2.inOut", overwrite: true });
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);

        return () => {
          run(false);
          resetWord.current = null;
          writer.disconnect();
          waitForIntro?.();
          visibility.disconnect();
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: root },
  );

  // The footer stays mounted across client-side navigation, so a new page un-writes the word here
  // (a reload starts fresh anyway). The first run is the initial page: nothing to reset.
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    resetWord.current?.();
  }, [pathname]);

  const word = (prefix: string) =>
    letters.map((letter) => <use key={`${prefix}-${letter}`} href={`#${letter}`} />);

  return (
    <div ref={root} data-reveal aria-hidden="true" className={cn("select-none", className)}>
      <svg viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`} className="block h-auto w-full overflow-visible">
        <defs>
          {LOGO_LETTERS.map((d, index) => (
            <path key={letters[index]} id={letters[index]} d={d} pathLength={1} />
          ))}
          <linearGradient
            data-shimmer
            id={id("shimmer")}
            gradientUnits="userSpaceOnUse"
            spreadMethod="reflect"
            x1={BOX.x}
            y1={BOX.y}
            x2={BOX.x + BOX.w / 2}
            y2={BOX.y + BOX.h}
          >
            <stop offset="0" stopColor="#b8925a" />
            <stop offset="0.35" stopColor="#f6e3b8" />
            <stop offset="0.55" stopColor="#dcbf8e" />
            <stop offset="0.8" stopColor="#a8803f" />
            <stop offset="1" stopColor="#ecd29f" />
          </linearGradient>
          <radialGradient id={id("light")}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={id("mask")} maskUnits="userSpaceOnUse" x={BOX.x - 100} y={BOX.y - 100} width={BOX.w + 200} height={BOX.h + 200}>
            <circle data-spot cx={BOX.x + BOX.w / 2} cy={MID_Y} r={SPOT_RADIUS} fill={`url(#${id("light")})`} />
          </mask>
        </defs>

        {/* A faint fill so the word always reads. */}
        <g data-base className="fill-gold-light" fillOpacity={0.07}>
          {word("base")}
        </g>
        {/* Liquid gold, shown only where the light is. */}
        <g data-glow fill={`url(#${id("shimmer")})`} mask={`url(#${id("mask")})`}>
          {word("glow")}
        </g>
        {/* Hairline outlines that write themselves. Widths are in the word's units: about 1px on every screen. */}
        <g data-outline fill="none" className="stroke-gold-light stroke-[1.7] sm:stroke-[1.1] lg:stroke-[0.7]" strokeOpacity={0.7}>
          {word("outline")}
        </g>
      </svg>
    </div>
  );
}
