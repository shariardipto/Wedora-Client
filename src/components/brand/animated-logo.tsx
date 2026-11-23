"use client";

import { useEffect, useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { afterIntro } from "@/lib/intro";
import {
  LOGO_END,
  LOGO_HOLD_END,
  LOGO_HOLD_START,
  LOGO_TIMING,
  easeInOutSine,
  easeOutCubic,
  isFullyDrawn,
  legProgress,
  letterStartTimes,
  progressIn,
} from "@/lib/logo-timeline";
import { cn } from "@/lib/utils";
import {
  LOGO_ASPECT,
  LOGO_BAR_SPAN,
  LOGO_BARS,
  LOGO_LEAVES,
  LOGO_LETTER_CENTERS,
  LOGO_LETTERS,
  LOGO_ROUTE,
  LOGO_SHAPES,
  LOGO_VIEWBOX,
} from "./animated-logo-data";

/** When each WEDORA letter starts rising: as the two lines reach it. */
const LETTER_STARTS = letterStartTimes(LOGO_LETTER_CENTERS, LOGO_BAR_SPAN.center, LOGO_BAR_SPAN.half);

type AnimatedLogoProps = {
  /** "once" writes the logo and stops (then calls `onComplete`); "loop" writes, holds, un-writes and repeats. */
  mode: "once" | "loop";
  /** 1 = the approved timing (about 3.6 s per write); 0.5 = half speed. */
  speed?: number;
  /** Start only after the full-page intro has revealed the page. */
  afterPageIntro?: boolean;
  /**
   * Start at the first idle moment (at most 0.7 s later; start-up work measured at about 0.3–0.45 s),
   * so the first strokes don't compete with the page's start-up. Used by the full-page intro, which
   * plays while the page is loading.
   */
  waitForIdle?: boolean;
  onComplete?: () => void;
  /** Size classes for the logo, e.g. "h-10 md:h-11". */
  className?: string;
  /** Fill classes for the WEDORA wordmark, e.g. "fill-primary" or "fill-white". */
  wordClassName?: string;
};

const MASK = { maskUnits: "userSpaceOnUse", x: 90, y: 580, width: 1110, height: 640 } as const;
const PEN = { fill: "none", stroke: "#fff", strokeLinecap: "round", strokeLinejoin: "round", pathLength: 1, strokeDasharray: "1 2" } as const;
const BAR_STYLE = { transformBox: "fill-box", transformOrigin: "50% 50%" } as const;

/**
 * The Wedora logo writing itself: the bars draw out, the W is written as one continuous pen stroke
 * (passing behind the wordmark band for each bowl), WEDORA rises, the leaves grow and a gold glint
 * sweeps across. Pure SVG + GSAP. The server renders the finished logo; with reduced motion it stays
 * static. Loops pause while off-screen.
 */
export function AnimatedLogo({
  mode,
  speed = 1,
  afterPageIntro = false,
  waitForIdle = false,
  onComplete,
  className,
  wordClassName,
}: AnimatedLogoProps) {
  const svg = useRef<SVGSVGElement>(null);
  const done = useRef(onComplete);
  useEffect(() => {
    done.current = onComplete;
  }, [onComplete]);

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `alogo-${uid}-${name}`;
  const ref = (name: string) => `url(#${id(name)})`;

  useGSAP(
    () => {
      const el = svg.current;
      if (!el) return;
      const legs = LOGO_ROUTE.map((leg) => ({
        el: el.querySelector<SVGPathElement>(`[data-leg="${leg.id}"]`),
        span: leg.len * leg.weight,
      }));
      const spans = legs.map((leg) => leg.span);
      const bars = [...el.querySelectorAll<SVGPolygonElement>("[data-bar]")];
      const letters = [...el.querySelectorAll<SVGUseElement>("[data-letter]")];
      const leafTop = el.querySelector<SVGPathElement>('[data-leaf="LT"]');
      const leafBottom = el.querySelector<SVGPathElement>('[data-leaf="LB"]');
      const glint = el.querySelector<SVGRectElement>("[data-glint]");
      const masked = [...el.querySelectorAll<SVGUseElement>("[data-masked]")];

      const stroke = (path: SVGPathElement | null, p: number) => {
        if (!path) return;
        path.style.strokeDashoffset = String(1 - p);
        path.style.opacity = p > 0 ? "1" : "0";
      };
      let masksOn = false;
      const render = (t: number) => {
        const b = easeInOutSine(progressIn(t, LOGO_TIMING.bars));
        for (const bar of bars) bar.style.transform = `scaleX(${b})`;
        legProgress(t, spans).forEach((p, i) => stroke(legs[i].el, p));
        // Each letter rises as the two lines pass over it (and drops back as they retract).
        letters.forEach((letter, i) => {
          const p = easeOutCubic(progressIn(t, [LETTER_STARTS[i], LOGO_TIMING.letterRise]));
          letter.style.transform = `translateY(${(1 - p) * 118}px)`;
        });
        stroke(leafTop, easeInOutSine(progressIn(t, LOGO_TIMING.leafTopRight)));
        stroke(leafBottom, easeInOutSine(progressIn(t, LOGO_TIMING.leafBottomLeft)));
        if (glint) {
          const g = progressIn(t, LOGO_TIMING.glint);
          glint.style.opacity = String(g <= 0 || g >= 1 ? 0 : Math.min(1, g * 8, (1 - g) * 8));
          glint.style.transform = `translateX(${easeInOutSine(g) * 1650}px) skewX(-18deg)`;
        }
        // Masks only matter while drawing; afterwards the plain vector shapes are shown (pixel-exact).
        const needMasks = !isFullyDrawn(t);
        if (needMasks !== masksOn) {
          for (const use of masked) {
            if (needMasks) use.setAttribute("mask", use.dataset.masked ?? "");
            else use.removeAttribute("mask");
          }
          masksOn = needMasks;
        }
      };
      const reveal = () => el.removeAttribute("data-alogo-pending");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        render(LOGO_END);
        reveal();
        done.current?.();
        return;
      }

      render(0);
      reveal();
      const clock = { t: 0 };
      const draw = () => render(clock.t);
      const seconds = LOGO_END / 1000;
      const timeline =
        mode === "once"
          ? gsap.timeline({ paused: true, onComplete: () => done.current?.() }).to(clock, { t: LOGO_END, duration: seconds, ease: "none", onUpdate: draw })
          : gsap
              .timeline({ paused: true, repeat: -1 })
              .to(clock, { t: LOGO_END, duration: seconds, ease: "none", onUpdate: draw })
              .to({}, { duration: LOGO_HOLD_END / 1000 })
              .to(clock, { t: 0, duration: seconds, ease: "none", onUpdate: draw })
              .to({}, { duration: LOGO_HOLD_START / 1000 });
      // The timeline is driven from the ticker in capped steps instead of running on wall-clock time:
      // when the main thread is blocked (page start-up, decoding), the drawing pauses for a beat rather
      // than jumping ahead and skipping strokes. (GSAP's own lag smoothing is off site-wide for Lenis.)
      let ticking = false;
      const step = (_time: number, deltaMs: number) => {
        timeline.totalTime(timeline.totalTime() + (Math.min(deltaMs, 34) / 1000) * speed);
        if (mode === "once" && timeline.progress() >= 1) stop();
      };
      const play = () => {
        if (ticking) return;
        ticking = true;
        gsap.ticker.add(step);
      };
      function stop() {
        if (!ticking) return;
        ticking = false;
        gsap.ticker.remove(step);
      }

      let started = false;
      let onScreen = true;
      const start = () => {
        started = true;
        if (onScreen) play();
      };
      let idle = 0;
      const begin = () => {
        if (waitForIdle && "requestIdleCallback" in window) idle = window.requestIdleCallback(start, { timeout: 700 });
        else start();
      };
      const cancelStart = afterPageIntro ? afterIntro(begin) : (begin(), () => undefined);

      // Loops pause while scrolled out of view.
      let observer: IntersectionObserver | undefined;
      if (mode === "loop" && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting;
          if (!started) return;
          if (onScreen) play();
          else stop();
        });
        observer.observe(el);
      }
      return () => {
        cancelStart();
        if (idle) window.cancelIdleCallback(idle);
        observer?.disconnect();
        stop();
        timeline.kill();
      };
    },
    { scope: svg, dependencies: [mode, speed, afterPageIntro, waitForIdle] },
  );

  return (
    <svg
      ref={svg}
      viewBox={LOGO_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      data-animated-logo=""
      data-alogo-pending=""
      className={cn("w-auto overflow-visible", className)}
      style={{ aspectRatio: LOGO_ASPECT }}
    >
      <defs>
        <path id={id("top")} d={LOGO_SHAPES.top} />
        <path id={id("bottom")} d={LOGO_SHAPES.bottom} />
        <path id={id("leaf-tr")} d={LOGO_SHAPES.leafTopRight} />
        <path id={id("leaf-bl")} d={LOGO_SHAPES.leafBottomLeft} />
        {LOGO_LETTERS.map((d, i) => (
          <path key={i} id={id(`letter-${i}`)} d={d} />
        ))}
        {LOGO_ROUTE.filter((leg) => leg.exclude).map((leg) => (
          <clipPath key={leg.id} id={id(`ex-${leg.id}`)}>
            <path clipRule="evenodd" d={`M90 580 H1200 V1220 H90 Z ${leg.exclude}`} />
          </clipPath>
        ))}
        {(["top", "bottom"] as const).map((shape) => (
          <mask key={shape} id={id(`m-${shape}`)} {...MASK}>
            <polygon data-bar points={LOGO_BARS[shape]} fill="#fff" style={BAR_STYLE} />
            {LOGO_ROUTE.filter((leg) => leg.shape === shape).map((leg) => (
              <path
                key={leg.id}
                data-leg={leg.id}
                d={leg.d}
                strokeWidth={leg.width}
                clipPath={leg.exclude ? ref(`ex-${leg.id}`) : undefined}
                {...PEN}
              />
            ))}
          </mask>
        ))}
        {LOGO_LEAVES.map((leaf) => (
          <mask key={leaf.id} id={id(`m-${leaf.id}`)} {...MASK}>
            <path data-leaf={leaf.id} d={leaf.d} strokeWidth={leaf.width} {...PEN} />
          </mask>
        ))}
        <mask id={id("m-all")} {...MASK}>
          <g fill="#fff">
            <use href={`#${id("top")}`} />
            <use href={`#${id("bottom")}`} />
            <use href={`#${id("leaf-tr")}`} />
            <use href={`#${id("leaf-bl")}`} />
            {LOGO_LETTERS.map((_, i) => (
              <use key={i} href={`#${id(`letter-${i}`)}`} />
            ))}
          </g>
        </mask>
        <clipPath id={id("band")}>
          <rect x="480" y="864" width="680" height="122" />
        </clipPath>
        <linearGradient id={id("glint")} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff8e6" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Server render = the finished logo; the masks are attached only while it is being drawn. */}
      <g className="fill-gold">
        <use href={`#${id("top")}`} data-masked={ref("m-top")} />
        <use href={`#${id("bottom")}`} data-masked={ref("m-bottom")} />
        <use href={`#${id("leaf-tr")}`} data-masked={ref("m-LT")} />
        <use href={`#${id("leaf-bl")}`} data-masked={ref("m-LB")} />
      </g>
      <g clipPath={ref("band")} className={cn("transition-[fill] duration-500", wordClassName)}>
        {LOGO_LETTERS.map((_, i) => (
          <use key={i} data-letter href={`#${id(`letter-${i}`)}`} />
        ))}
      </g>
      <g mask={ref("m-all")}>
        <rect data-glint x="-330" y="560" width="240" height="700" fill={ref("glint")} opacity={0} />
      </g>
    </svg>
  );
}
