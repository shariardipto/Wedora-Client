/**
 * Timing of the animated Wedora logo (milliseconds at 1× speed). Pure functions so the
 * animation is deterministic: the component draws the frame for any time `t`.
 */
export type Span = readonly [start: number, duration: number];

export const LOGO_TIMING = {
  /** The two lines grow outward from their centre. */
  bars: [0, 550] as Span,
  pen: [150, 2000] as Span,
  /** How long each WEDORA letter takes to rise (it starts as the lines pass over it). */
  letterRise: 450,
  leafTopRight: [2050, 650] as Span,
  leafBottomLeft: [2150, 650] as Span,
  glint: [2800, 850] as Span,
} as const;

/** One full write, glint included. */
export const LOGO_END = 3650;
/** Loop: how long the finished logo holds, and the empty pause before it writes again. */
export const LOGO_HOLD_END = 1400;
export const LOGO_HOLD_START = 450;
export const LOGO_CYCLE = 2 * LOGO_END + LOGO_HOLD_END + LOGO_HOLD_START;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const progressIn = (t: number, [start, duration]: Span) => clamp01((t - start) / duration);
/** The pen starts and lands softly. */
export const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;
export const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;

/** Ping-pong loop: write (start -> end), hold, un-write (end -> start), short pause, repeat. */
export function loopTime(elapsed: number): number {
  const c = ((elapsed % LOGO_CYCLE) + LOGO_CYCLE) % LOGO_CYCLE;
  if (c < LOGO_END) return c;
  if (c < LOGO_END + LOGO_HOLD_END) return LOGO_END;
  if (c < 2 * LOGO_END + LOGO_HOLD_END) return LOGO_END - (c - LOGO_END - LOGO_HOLD_END);
  return 0;
}

/**
 * How much of each pen leg is drawn (0..1) at time `t`. The pen moves along the legs in order;
 * `spans` are their time-weighted lengths, so it keeps a steady pace across the whole route.
 */
export function legProgress(t: number, spans: readonly number[]): number[] {
  const total = spans.reduce((sum, span) => sum + span, 0);
  let travelled = easeInOutSine(progressIn(t, LOGO_TIMING.pen)) * total;
  return spans.map((span) => {
    const p = span > 0 ? clamp01(travelled / span) : travelled > 0 ? 1 : 0;
    travelled -= span;
    return p;
  });
}

/**
 * When each WEDORA letter starts rising: the moment the two lines, growing outward from `barCenter`
 * with the bars' easing, reach the letter's centre. So the middle letters appear first, the outer
 * ones last, and in the reverse loop they drop away exactly as the lines retract past them.
 */
export function letterStartTimes(centers: readonly number[], barCenter: number, barHalf: number): number[] {
  const [start, duration] = LOGO_TIMING.bars;
  return centers.map((center) => {
    const reach = clamp01(Math.abs(center - barCenter) / barHalf); // share of the half-length the lines must cover
    return start + (Math.acos(1 - 2 * reach) / Math.PI) * duration; // inverse of easeInOutSine
  });
}

/** True once every brush has finished: the reveal masks can be dropped (pixel-exact final logo). */
export function isFullyDrawn(t: number): boolean {
  const end = (span: Span) => span[0] + span[1];
  return t >= end(LOGO_TIMING.pen) && t >= end(LOGO_TIMING.leafBottomLeft);
}
