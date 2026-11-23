"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { getMusicState, getServerMusicState, musicHasLevels, readMusicSpectrum, subscribeMusic } from "@/lib/background-music";
import { cn } from "@/lib/utils";
import { LevelNormalizer, bandEdges, bandLevels, restingLength, sampleBands } from "@/lib/music-levels";

const BANDS = 24;
/** Distance between neighbouring bars along the frame, and each bar's thickness (CSS pixels). */
const PITCH = 8;
const BAR_WIDTH = 2;
/** The bars start this far outside the frame's gold outline. */
const GAP = 10;
/** The bars run down the sides to this share of the outline's height (above what sits at its foot). */
const SIDE_REACH = 0.8;
/** Each bar is drawn in segments that fade towards its tip: where they end (share of the length), and their strength. */
const TIP_STOPS = [0.45, 0.75, 1];
const TIP_ALPHA = [1, 0.55, 0.2];
/** How long the bars take to grow out of the frame when the music starts (and to sink back when it stops). */
const PRESENCE_SECONDS = 0.5;
/** The longest a bar grows with the music, as a share of its full length (see `advance`). */
const LOUDEST = 0.72;
/** Bars stop at least this far short of whatever clips them (the section's edge, the screen's edge). */
const EDGE_MARGIN = 6;
/** A bar keeps its full length up to this share of the room in front of it, then eases into the rest. */
const KNEE = 0.6;

/** Colours (root → tip of the side fade) and strength, per background. */
const TONES = {
  /** Cream on the dark hero. */
  light: { stops: ["rgba(240,226,200,1)", "rgba(232,212,176,0.85)", "rgba(220,191,142,0)"], shown: "opacity-[0.05]" },
  /** Deeper gold on light sections, where cream would vanish; a little stronger for the same faint look. */
  gold: { stops: ["rgba(168,120,58,1)", "rgba(184,138,78,0.85)", "rgba(201,155,94,0)"], shown: "opacity-[0.14]" },
} as const;

/** A bar's length, eased so it never passes `room` (unchanged while well inside it). */
function fit(length: number, room: number) {
  if (room <= 0) return 0;
  const knee = room * KNEE;
  if (length <= knee) return length;
  const rest = room - knee;
  return knee + rest * Math.tanh((length - knee) / rest);
}

/** An element's layout position in the page: offsets, so transforms (entrance, parallax) don't count. */
function pagePosition(element: HTMLElement): [number, number] {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = element; node; ) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const parent: Element | null = node.offsetParent;
    node = parent instanceof HTMLElement ? parent : null;
    if (node) {
      x += node.clientLeft;
      y += node.clientTop;
    }
  }
  return [x, y];
}

/**
 * Where the page cuts the canvas off, in the canvas's own pixels: the nearest ancestors that hide
 * overflow (the section) and the screen's width. Only the left, right and top matter: bars never point down.
 */
function clipBox(canvas: HTMLCanvasElement) {
  const [canvasX, canvasY] = pagePosition(canvas);
  let left = -canvasX;
  let right = document.documentElement.clientWidth - canvasX;
  let top = -Infinity;
  let foundX = false;
  let foundY = false;
  for (let node = canvas.parentElement; node && node !== document.documentElement && !(foundX && foundY); node = node.parentElement) {
    const style = getComputedStyle(node);
    const clipsX = !foundX && style.overflowX !== "visible";
    const clipsY = !foundY && style.overflowY !== "visible";
    if (!clipsX && !clipsY) continue;
    const [x, y] = pagePosition(node);
    if (clipsX) {
      foundX = true;
      left = Math.max(left, x + node.clientLeft - canvasX);
      right = Math.min(right, x + node.clientLeft + node.clientWidth - canvasX);
    }
    if (clipsY) {
      foundY = true;
      top = y + node.clientTop - canvasY;
    }
  }
  return { left, right, top };
}

type MusicBurstProps = {
  tone?: keyof typeof TONES;
  /** Where the canvas sits: it must reach past the frame on every side, as far as the bars may go. */
  className?: string;
};

/**
 * A music visualizer for an arch-framed photo: thin bars standing out from the frame's gold outline
 * (the sibling marked `data-music-outline`), round its top and down its sides, very faint. Render it
 * inside the photo's positioned wrapper, so it moves with the frame. It shows only while the music
 * plays: the bars grow out of the frame as the canvas fades in, follow the music calmly (bass at the top
 * of the arch, highs down the sides, mirrored), and sink back and fade when it stops. Nothing is drawn
 * while paused, hidden or off screen. With reduced motion the bars hold one still shape while playing.
 */
export function MusicBurst({ tone = "light", className }: MusicBurstProps) {
  const music = useSyncExternalStore(subscribeMusic, getMusicState, getServerMusicState);
  const playing = music.on && !music.buffering;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  const wake = useRef<() => void>(() => undefined);

  useEffect(() => {
    playingRef.current = playing;
    wake.current();
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours = TONES[tone].stops;

    const bands = bandEdges(BANDS);
    const raw = new Float32Array(BANDS);
    const levels = new Float32Array(BANDS);
    const normalizer = new LevelNormalizer(BANDS);
    // Bars for one half of the frame, from the top of the arch down the right side; the left mirrors it.
    let half = 0;
    let shown = new Float32Array(0);
    // Per bar: where it starts (x from the centre line, y) and the outward direction (x, y).
    let roots = new Float32Array(0);
    // Per bar: how far it may reach before the page's side edges cut it off (Infinity: no limit), and its drawn length.
    let rooms = new Float32Array(0);
    let lengths = new Float32Array(0);
    let fade: CanvasGradient | null = null;
    let width = 0;
    let height = 0;
    let centreX = 0;
    let span = 0; // a bar's full length
    let presence = 0; // 0 hidden … 1 fully grown: scales every bar
    let onScreen = false;
    let frame = 0;
    let last = 0;
    let clock = 0;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (!half || !fade || presence < 0.001) return;
      for (let index = 0; index < half; index++) lengths[index] = fit(span * presence * shown[index], rooms[index]);
      context.strokeStyle = fade;
      context.lineWidth = BAR_WIDTH;
      context.lineCap = "butt";
      let from = 0;
      TIP_STOPS.forEach((to, segment) => {
        context.globalAlpha = TIP_ALPHA[segment];
        context.beginPath();
        for (let index = 0; index < half; index++) {
          const length = lengths[index];
          const at = index * 4;
          const [x, y, outX, outY] = [roots[at], roots[at + 1], roots[at + 2], roots[at + 3]];
          for (const side of [1, -1]) {
            context.moveTo(centreX + side * (x + outX * length * from), y + outY * length * from);
            context.lineTo(centreX + side * (x + outX * length * to), y + outY * length * to);
          }
        }
        context.stroke();
        from = to;
      });
      context.globalAlpha = 1;
    };

    // Moves each bar towards its target; true while anything still moves.
    const advance = (seconds: number) => {
      const isPlaying = playingRef.current;
      const spectrum = isPlaying ? readMusicSpectrum() : null;
      if (spectrum) normalizer.normalize(bandLevels(spectrum.data, spectrum.sampleRate, bands, raw), seconds, levels);
      const imitate = isPlaying && !spectrum && !musicHasLevels();
      presence += ((isPlaying ? 1 : 0) - presence) * (1 - Math.exp(-seconds / PRESENCE_SECONDS));
      let moving = Math.abs((isPlaying ? 1 : 0) - presence) > 0.001;
      for (let index = 0; index < half; index++) {
        const position = (index + 0.5) / half;
        let target = shown[index]; // while stopping, keep the shape and let `presence` sink it
        // The track is soft, so the bars stay calm: a short base, and only the louder moments reach far.
        if (spectrum) target = 0.08 + (LOUDEST - 0.08) * sampleBands(levels, position) ** 1.4;
        // Plain-element fallback: no real levels, so a gentle, uneven sway.
        else if (imitate) target = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(clock * (1.2 + (index % 7) * 0.21) + index * 1.3));
        // Eased both ways (a little quicker to rise), so the outline breathes rather than flickers.
        const ease = 1 - Math.exp(-seconds / (target > shown[index] ? 0.14 : 0.45));
        shown[index] += (target - shown[index]) * ease;
        if (Math.abs(target - shown[index]) > 0.002) moving = true;
      }
      return moving || isPlaying;
    };

    const holdStill = () => {
      presence = playingRef.current ? 1 : 0;
      for (let index = 0; index < half; index++) shown[index] = restingLength(index) * 0.75;
      draw();
    };

    const tick = (now: number) => {
      frame = 0;
      const seconds = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      clock += seconds;
      const moving = advance(seconds);
      draw();
      if (moving) schedule();
      else last = 0; // settled: the next start measures from its own first frame
    };

    function schedule() {
      if (reducedMotion) return holdStill();
      if (frame || !onScreen) return;
      if (!last) last = performance.now();
      frame = requestAnimationFrame(tick);
    }

    const stopDrawing = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };

    const layout = () => {
      // Layout positions (offset*), not getBoundingClientRect: entrance and parallax transforms don't count.
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      const wrapper = canvas.parentElement;
      const outline = wrapper?.querySelector<HTMLElement>(":scope > [data-music-outline]");
      const [left, top, outlineWidth, outlineHeight] = outline
        ? [outline.offsetLeft, outline.offsetTop, outline.offsetWidth, outline.offsetHeight]
        : [0, 0, wrapper?.offsetWidth ?? 0, wrapper?.offsetHeight ?? 0];
      // The outline's top-left corner, in canvas pixels.
      const edgeX = left - canvas.offsetLeft;
      const edgeY = top - canvas.offsetTop;
      const clip = clipBox(canvas);
      span = Math.min(edgeX, edgeY) - GAP - 2;
      // Every bar shortened alike so even the loudest stops short of what clips the top (on phones, the
      // section's top edge): they keep their rise and fall rather than flattening against it.
      span = Math.min(span, (edgeY - GAP - clip.top - EDGE_MARGIN) / LOUDEST);
      if (!width || !outlineWidth || span <= 4) {
        half = 0; // hidden (the hero's frame below `lg`), or no room for bars
        draw();
        return;
      }
      const ratio = Math.min(2, window.devicePixelRatio || 1); // thin bars need the sharper canvas
      const [pixelsWide, pixelsHigh] = [Math.round(width * ratio), Math.round(height * ratio)];
      // Resizing clears the canvas; skip it when only the room changed (e.g. a phone's address bar).
      if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) [canvas.width, canvas.height] = [pixelsWide, pixelsHigh];
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      // The outline is a semicircle over straight sides; the bars stand on a copy of it GAP further out.
      centreX = edgeX + outlineWidth / 2;
      const centreY = edgeY + outlineWidth / 2; // the arch's centre
      const radius = outlineWidth / 2 + GAP;
      const arc = (Math.PI * radius) / 2;
      const sideLength = Math.max(0, edgeY + outlineHeight * SIDE_REACH - centreY);

      const count = Math.max(8, Math.round((arc + sideLength) / PITCH));
      if (count !== half) {
        half = count;
        shown = new Float32Array(half);
        roots = new Float32Array(half * 4);
        rooms = new Float32Array(half);
        lengths = new Float32Array(half);
      }
      const step = (arc + sideLength) / half;
      for (let index = 0; index < half; index++) {
        const along = (index + 0.5) * step;
        const at = index * 4;
        if (along < arc) {
          const angle = along / radius; // from the top, clockwise
          roots.set([Math.sin(angle) * radius, centreY - Math.cos(angle) * radius, Math.sin(angle), -Math.cos(angle)], at);
        } else {
          roots.set([radius, centreY + along - arc, 1, 0], at);
        }
      }

      // Each bar's room before the page's side edges cut it off, on both mirrored sides. On phones the photo
      // nearly fills the width, so the bars ease shorter towards the sides and vanish where there's no
      // room, rather than being sliced at the screen's edge.
      for (let index = 0; index < half; index++) {
        const [x, outX] = [roots[index * 4], roots[index * 4 + 2]];
        rooms[index] = outX > 0.001 ? Math.min(clip.right - centreX - x, centreX - x - clip.left) / outX - EDGE_MARGIN : Infinity;
      }

      // Full strength round the arch, fading out down the sides.
      fade = context.createLinearGradient(0, centreY, 0, centreY + sideLength);
      fade.addColorStop(0, colours[0]);
      fade.addColorStop(0.45, colours[1]);
      fade.addColorStop(1, colours[2]);
      if (reducedMotion) holdStill();
      else draw();
    };

    wake.current = schedule;
    layout();
    const resize = new ResizeObserver(layout);
    resize.observe(canvas);
    // The room can change while the frame keeps its size (a centred frame in a wider window).
    window.addEventListener("resize", layout, { passive: true });
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) schedule();
      else stopDrawing();
    });
    visibility.observe(canvas);

    return () => {
      wake.current = () => undefined;
      stopDrawing();
      resize.disconnect();
      window.removeEventListener("resize", layout);
      visibility.disconnect();
    };
  }, [tone]);

  if (!siteConfig.musicUrl) return null;
  // A canvas is a replaced element: positioning alone won't stretch it, so it gets an explicit size
  // (7rem past the frame on every side by default; layout() reads the room back). It fades with the music.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -top-28 -left-28 h-[calc(100%+14rem)] w-[calc(100%+14rem)] transition-opacity duration-1400 ease-out",
        playing ? TONES[tone].shown : "opacity-0",
        className,
      )}
    />
  );
}
