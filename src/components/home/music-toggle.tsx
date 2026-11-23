"use client";

import { type RefObject, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { MusicIcon, PauseIcon, PlayIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import { attachMusic, autoplayMusic, getMusicState, getServerMusicState, subscribeMusic, toggleMusic } from "@/lib/background-music";
import { afterIntro } from "@/lib/intro";
import { cn } from "@/lib/utils";

const MUSIC_URL = siteConfig.musicUrl;
const noSubscription = () => () => undefined;
/** The hint appears this long after the intro (if the music is still waiting), and stays this long. */
const HINT_DELAY_MS = 1200;
const HINT_MS = 6000;
/** Space kept beside the button, and above the row's gold rule when it rises (`data-keep-clear`). */
const CLEARANCE = 16;
const RULE_CLEARANCE = 20;

/**
 * How far the fixed corner dock must rise to stay clear of the page's `[data-keep-clear]` row (the
 * footer's closing row: gold rule, copyright, back-to-top seal, account links, credit). When any of its
 * items shares the button's column, the button rises to sit just above the row's gold rule (owner), pushed
 * up ahead of it as it scrolls in; when none does (wide screens), it stays in its corner. Scrolling is
 * only watched while the row is near the screen.
 */
function useKeepClear(dock: RefObject<HTMLElement | null>, active: boolean) {
  const [lift, setLift] = useState(0);
  useEffect(() => {
    const element = dock.current;
    const button = element?.querySelector("button");
    const avoid = document.querySelector<HTMLElement>("[data-keep-clear]");
    if (!active || !element || !button || !avoid) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const { left, right } = button.getBoundingClientRect(); // rising doesn't change these
      let inTheWay = false;
      let top = Infinity; // the highest of the rule (aria-hidden decoration) and the items in the button's column
      for (const item of avoid.children) {
        const box = item.getBoundingClientRect();
        if (!box.width) continue;
        if (item.getAttribute("aria-hidden") === "true") top = Math.min(top, box.top - RULE_CLEARANCE);
        else if (box.right > left - CLEARANCE && box.left < right + CLEARANCE) {
          inTheWay = true;
          top = Math.min(top, box.top - CLEARANCE);
        }
      }
      const resting = parseFloat(getComputedStyle(element).bottom) || 0; // where the dock sits normally
      setLift(inTheWay ? Math.max(0, Math.round(window.innerHeight - top - resting)) : 0);
    };
    const queue = () => {
      frame ||= requestAnimationFrame(measure);
    };
    const watch = (on: boolean) => {
      if (on) {
        window.addEventListener("scroll", queue, { passive: true });
        window.addEventListener("resize", queue);
      } else {
        window.removeEventListener("scroll", queue);
        window.removeEventListener("resize", queue);
      }
    };
    const near = new IntersectionObserver(
      ([entry]) => {
        watch(entry.isIntersecting);
        if (entry.isIntersecting) queue();
        else setLift(0);
      },
      { rootMargin: "0px 0px 160px 0px" },
    );
    near.observe(avoid);
    return () => {
      near.disconnect();
      watch(false);
      cancelAnimationFrame(frame);
    };
  }, [dock, active]);
  return lift;
}

/**
 * The home page's music button, fixed to the bottom-right corner above everything else. It stays
 * faint (30%) until hovered or focused, and appears once the intro has finished. Then the music starts
 * by itself as soon as the browser allows (lib/background-music.ts `autoplayMusic`). Browsers block
 * sound until the visitor's first click, tap or key press, so while it waits for one a short hint
 * beside the button says so, then fades. The button is how a visitor stops the music (WCAG 1.4.2), and
 * a visitor who does is remembered for the visit. The footer's closing row pushes the button up rather
 * than sitting under it. Leaving the home page fades the music out.
 */
export function MusicToggle() {
  const music = useSyncExternalStore(subscribeMusic, getMusicState, getServerMusicState);
  const mounted = useSyncExternalStore(noSubscription, () => true, () => false);
  const [introDone, setIntroDone] = useState(false);
  const [hint, setHint] = useState<"pending" | "shown" | "done">("pending");
  const dock = useRef<HTMLDivElement>(null);
  const lift = useKeepClear(dock, mounted && Boolean(MUSIC_URL));

  useEffect(() => (MUSIC_URL ? attachMusic(MUSIC_URL) : undefined), []);
  useEffect(() => {
    let stopWaiting = () => undefined as void;
    const cancelIntroWait = afterIntro(() => {
      setIntroDone(true);
      if (MUSIC_URL) stopWaiting = autoplayMusic(MUSIC_URL);
    });
    return () => {
      cancelIntroWait();
      stopWaiting();
    };
  }, []);

  // The hint: shown a moment after the intro if the music is still waiting for a gesture, then faded.
  const waiting = introDone && music.waiting && !music.on;
  useEffect(() => {
    if (!waiting) return;
    const show = setTimeout(() => setHint((current) => (current === "pending" ? "shown" : current)), HINT_DELAY_MS);
    const hide = setTimeout(() => setHint("done"), HINT_DELAY_MS + HINT_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [waiting]);

  if (!MUSIC_URL || !mounted) return null;
  const hintShown = waiting && hint === "shown";
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const label = music.failed
    ? "Background music couldn't load. Try again"
    : music.on
      ? "Pause background music"
      : "Play background music";

  return createPortal(
    <div
      ref={dock}
      className="pointer-events-none fixed right-5 bottom-5 z-110 flex items-center gap-2.5 sm:right-6 sm:bottom-6"
      style={lift ? { transform: `translateY(${-lift}px)` } : undefined}
    >
      {/* Visual only: the button's own label already says what it does. */}
      <p
        aria-hidden="true"
        className={cn(
          "flex items-center gap-2 rounded-full border border-gold/30 bg-night/85 px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-gold-light shadow-[0_14px_32px_-14px_rgb(0_0_0/0.7)] backdrop-blur-md transition-[opacity,translate] duration-700",
          hintShown ? "opacity-90" : "translate-x-2 opacity-0",
        )}
      >
        <MusicIcon className="size-3.5" />
        {touch ? "Tap" : "Click"} anywhere for music
      </p>
      <button
        type="button"
        onClick={() => toggleMusic(MUSIC_URL)}
        data-music-control
        aria-label={label}
        title={music.failed ? "Music couldn't load. Click to try again." : undefined}
        inert={!introDone}
        className={cn(
          "relative grid size-12 shrink-0 place-items-center rounded-full border border-gold/45 bg-night/85 text-gold-light shadow-[0_18px_40px_-16px_rgb(0_0_0/0.7)] backdrop-blur-md transition-[opacity,translate] duration-500 focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:outline-none",
          introDone ? "pointer-events-auto opacity-30 hover:opacity-100 focus-visible:opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {music.on && !music.buffering && <span aria-hidden="true" className="music-halo pointer-events-none absolute inset-0 rounded-full" />}
        {music.buffering && (
          <span aria-hidden="true" className="pointer-events-none absolute -inset-1 animate-spin rounded-full border border-transparent border-t-gold-light" />
        )}
        {/* Play crossfades to pause; the triangle sits a pixel right of centre so it looks centred. */}
        <PlayIcon
          aria-hidden="true"
          className={cn("absolute size-4.5 translate-x-px fill-current transition-[opacity,scale] duration-300", music.on && "scale-50 opacity-0")}
        />
        <PauseIcon
          aria-hidden="true"
          className={cn("absolute size-4.5 fill-current transition-[opacity,scale] duration-300", !music.on && "scale-50 opacity-0")}
        />
      </button>
    </div>,
    document.body,
  );
}
