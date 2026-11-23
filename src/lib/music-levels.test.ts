import { describe, expect, it } from "vitest";
import { LevelNormalizer, bandEdges, bandLevels, restingLength, sampleBands } from "./music-levels";

describe("bandEdges", () => {
  it("splits the range into contiguous, equally wide (log-spaced) bands", () => {
    const bands = bandEdges(12, 45, 5_000);
    expect(bands).toHaveLength(12);
    expect(bands[0][0]).toBeCloseTo(45);
    expect(bands.at(-1)?.[1]).toBeCloseTo(5_000);
    bands.slice(1).forEach(([from], index) => expect(from).toBeCloseTo(bands[index][1]));
    const ratios = bands.map(([from, to]) => to / from);
    ratios.forEach((ratio) => expect(ratio).toBeCloseTo(ratios[0]));
  });
});

describe("bandLevels", () => {
  // 512 bins over 0–24 kHz: about 47 Hz per bin.
  const sampleRate = 48_000;
  const bands = bandEdges(10);

  it("reads the band that holds a tone loudest", () => {
    const spectrum = new Uint8Array(512);
    spectrum[Math.round(1_000 / (sampleRate / 2 / 512))] = 255;
    const levels = [...bandLevels(spectrum, sampleRate, bands)];
    const loudest = levels.indexOf(Math.max(...levels));
    expect(bands[loudest][0]).toBeLessThanOrEqual(1_000);
    expect(bands[loudest][1]).toBeGreaterThan(1_000);
  });

  it("gives silence as zeros, and never NaN for bands narrower than one bin", () => {
    expect([...bandLevels(new Uint8Array(512), sampleRate, bands)]).toEqual(new Array(10).fill(0));
    const full = bandLevels(new Uint8Array(512).fill(255), sampleRate, bandEdges(40));
    full.forEach((level) => expect(level).toBeCloseTo(1));
  });
});

describe("LevelNormalizer", () => {
  const settle = (normalizer: LevelNormalizer, level: number, seconds = 10) => {
    for (let elapsed = 0; elapsed < seconds; elapsed += 0.05) normalizer.normalize([level], 0.05);
  };

  it("spreads a band's usual range over the full bar height", () => {
    const normalizer = new LevelNormalizer(1);
    // Bass typically swings between about 0.5 and 0.8 on the analyser's scale.
    for (let elapsed = 0; elapsed < 3; elapsed += 0.05) normalizer.normalize([elapsed % 0.5 < 0.25 ? 0.5 : 0.8], 0.05);
    expect(normalizer.normalize([0.8], 0.05)[0]).toBeGreaterThan(0.9);
    expect(normalizer.normalize([0.5], 0.05)[0]).toBeLessThan(0.1);
  });

  it("keeps a near-silent band low instead of amplifying its noise", () => {
    const normalizer = new LevelNormalizer(1);
    settle(normalizer, 0.01);
    expect(normalizer.normalize([0.03], 0.05)[0]).toBeLessThan(0.2);
  });

  it("stays within 0–1", () => {
    const normalizer = new LevelNormalizer(2);
    for (const level of [0, 1, 0.3, 0.9, 0, 1]) {
      normalizer.normalize([level, 1 - level], 0.05).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    }
  });
});

describe("sampleBands", () => {
  it("hits each band exactly at its own position and blends between neighbours", () => {
    const levels = [0, 1, 0.5];
    expect(sampleBands(levels, 0)).toBe(0);
    expect(sampleBands(levels, 0.5)).toBe(1);
    expect(sampleBands(levels, 1)).toBe(0.5);
    expect(sampleBands(levels, 0.25)).toBeCloseTo(0.5);
    expect(sampleBands(levels, 0.75)).toBeCloseTo(0.75);
  });

  it("clamps out-of-range positions and copes with one or no bands", () => {
    expect(sampleBands([0.2, 0.8], -1)).toBe(0.2);
    expect(sampleBands([0.2, 0.8], 2)).toBe(0.8);
    expect(sampleBands([0.4], 0.7)).toBe(0.4);
    expect(sampleBands([], 0.5)).toBe(0);
  });
});

describe("restingLength", () => {
  it("is fixed per bar, uneven, and stays between a fifth and two thirds", () => {
    const lengths = Array.from({ length: 60 }, (_, index) => restingLength(index));
    lengths.forEach((length) => {
      expect(length).toBeGreaterThanOrEqual(0.2);
      expect(length).toBeLessThanOrEqual(0.66);
    });
    expect(restingLength(7)).toBe(restingLength(7));
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeGreaterThan(0.25);
  });
});
