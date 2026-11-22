import { describe, expect, it } from "vitest";
import {
  LOGO_CYCLE,
  LOGO_END,
  LOGO_HOLD_END,
  LOGO_TIMING,
  easeInOutSine,
  isFullyDrawn,
  legProgress,
  letterStartTimes,
  loopTime,
} from "./logo-timeline";

describe("letterStartTimes (letters follow the two lines)", () => {
  const center = 806;
  const half = 318;
  const centers = [564.4, 676.5, 772.2, 876, 974.8, 1068.9]; // W E D O R A
  const starts = letterStartTimes(centers, center, half);

  it("starts each letter exactly when the growing lines reach its centre", () => {
    starts.forEach((t, i) => {
      const lineReach = easeInOutSine((t - LOGO_TIMING.bars[0]) / LOGO_TIMING.bars[1]) * half;
      expect(lineReach).toBeCloseTo(Math.abs(centers[i] - center), 6);
    });
  });

  it("shows the middle letters first and the outer letters last, all while the lines draw", () => {
    const [D, O, E, R, W, A] = [starts[2], starts[3], starts[1], starts[4], starts[0], starts[5]];
    expect(D).toBeLessThan(O);
    expect(O).toBeLessThan(E);
    expect(E).toBeLessThan(R);
    expect(R).toBeLessThan(W);
    expect(W).toBeLessThan(A);
    expect(A).toBeLessThanOrEqual(LOGO_TIMING.bars[0] + LOGO_TIMING.bars[1]);
  });
});

describe("loopTime (ping-pong)", () => {
  it("writes, holds, un-writes in reverse, pauses, then repeats", () => {
    expect(loopTime(0)).toBe(0);
    expect(loopTime(1000)).toBe(1000);
    expect(loopTime(LOGO_END + 500)).toBe(LOGO_END); // holding the finished logo
    expect(loopTime(LOGO_END + LOGO_HOLD_END + 1000)).toBe(LOGO_END - 1000); // reversing
    expect(loopTime(2 * LOGO_END + LOGO_HOLD_END + 100)).toBe(0); // empty pause
    expect(loopTime(LOGO_CYCLE + 1000)).toBe(1000); // next cycle
  });
});

describe("legProgress", () => {
  const spans = [100, 50, 200];

  it("draws nothing before the pen starts and everything after it ends", () => {
    expect(legProgress(0, spans)).toEqual([0, 0, 0]);
    expect(legProgress(5000, spans)).toEqual([1, 1, 1]);
  });

  it("fills the legs strictly in order", () => {
    for (let t = 0; t <= 2500; t += 50) {
      const p = legProgress(t, spans);
      for (let i = 1; i < p.length; i++) {
        if (p[i] > 0) expect(p[i - 1]).toBe(1);
      }
    }
  });
});

describe("isFullyDrawn", () => {
  it("is false while the pen or the leaves are still drawing", () => {
    expect(isFullyDrawn(1000)).toBe(false);
    expect(isFullyDrawn(2200)).toBe(false); // pen done, last leaf still growing
    expect(isFullyDrawn(2800)).toBe(true);
  });
});
