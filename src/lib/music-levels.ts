/**
 * The music visualizer's maths (components/home/music-burst.tsx), kept pure so it can be tested: which
 * frequencies each bar shows, how loud it reads, and the still shape shown with reduced motion.
 */

export type Band = readonly [fromHz: number, toHz: number];

/**
 * `count` log-spaced bands (each the same musical width) covering where songs carry their energy.
 * Above ~5 kHz there is little to show: the current track has almost nothing past 3 kHz.
 */
export function bandEdges(count: number, lowHz = 45, highHz = 5_000): Band[] {
  const ratio = highHz / lowHz;
  return Array.from({ length: count }, (_, index) => [lowHz * ratio ** (index / count), lowHz * ratio ** ((index + 1) / count)] as const);
}

/**
 * Each band's raw level (0–1) from an analyser's byte spectrum, whose bins spread evenly from 0 Hz to
 * half the sample rate. A band narrower than one bin (deep bass) reads the bin it falls in.
 */
export function bandLevels(
  spectrum: ArrayLike<number>,
  sampleRate: number,
  bands: readonly Band[],
  out = new Float32Array(bands.length),
): Float32Array {
  const binHz = sampleRate / 2 / spectrum.length;
  bands.forEach(([from, to], index) => {
    const first = Math.min(spectrum.length - 1, Math.floor(from / binHz));
    const last = Math.min(spectrum.length, Math.max(first + 1, Math.ceil(to / binHz)));
    let sum = 0;
    for (let bin = first; bin < last; bin++) sum += spectrum[bin];
    out[index] = sum / (last - first) / 255;
  });
  return out;
}

/** Below this spread a band is treated as near-silent, so its noise never fills a bar. */
const MIN_RANGE = 0.15;
/** How fast a band's remembered loudest and quietest levels drift back towards the current one (s). */
const PEAK_RELEASE = 4;
const FLOOR_RELEASE = 6;

/**
 * Scales each band against its own recent range, so every bar moves across its full height whatever
 * the track: bass always reads loud on a spectrum and treble quiet, so one fixed scale would leave the
 * outer bars flat. The loudest and quietest levels jump to new extremes and relax back over seconds.
 */
export class LevelNormalizer {
  private readonly peak: Float32Array;
  private readonly floor: Float32Array;

  constructor(count: number) {
    this.peak = new Float32Array(count);
    this.floor = new Float32Array(count).fill(1);
  }

  normalize(levels: ArrayLike<number>, seconds: number, out = new Float32Array(levels.length)): Float32Array {
    const peakEase = 1 - Math.exp(-seconds / PEAK_RELEASE);
    const floorEase = 1 - Math.exp(-seconds / FLOOR_RELEASE);
    for (let index = 0; index < out.length; index++) {
      const level = levels[index];
      this.peak[index] = level > this.peak[index] ? level : this.peak[index] + (level - this.peak[index]) * peakEase;
      this.floor[index] = level < this.floor[index] ? level : this.floor[index] + (level - this.floor[index]) * floorEase;
      const range = Math.max(MIN_RANGE, this.peak[index] - this.floor[index]);
      out[index] = Math.min(1, Math.max(0, (level - this.floor[index]) / range));
    }
    return out;
  }
}

/**
 * The level at `position` (0–1) along the bands, blended between the two nearest, so a visualizer with
 * more bars than bands still has a smooth outline.
 */
export function sampleBands(levels: ArrayLike<number>, position: number): number {
  const last = levels.length - 1;
  if (last <= 0) return levels[0] ?? 0;
  const at = Math.min(1, Math.max(0, position)) * last;
  const index = Math.min(last - 1, Math.floor(at));
  return levels[index] + (levels[index + 1] - levels[index]) * (at - index);
}

/**
 * A bar's length when the bars can't move (reduced motion), as a share of the full length: a still,
 * uneven fringe that reads as sound rather than a solid outline. Fixed per bar, between about a fifth
 * and two thirds.
 */
export const restingLength = (index: number) =>
  0.2 + 0.46 * (0.5 + 0.3 * Math.sin(index * 0.83) + 0.2 * Math.sin(index * 2.71 + 1.3));
