import { describe, expect, it } from "vitest";
import { planShrink, shrinkImage } from "./shrink-image";

describe("planShrink", () => {
  it("centre-crops a portrait photo to a square and scales it down", () => {
    expect(planShrink(3024, 4032, { maxEdge: 512, square: true })).toEqual({
      sx: 0,
      sy: 504,
      sw: 3024,
      sh: 3024,
      width: 512,
      height: 512,
    });
  });

  it("keeps the aspect ratio when not cropping", () => {
    expect(planShrink(4000, 2000, { maxEdge: 1600 })).toMatchObject({ sx: 0, sy: 0, width: 1600, height: 800 });
  });

  it("never upscales a small image", () => {
    expect(planShrink(300, 200, { maxEdge: 512, square: true })).toMatchObject({ sx: 50, sw: 200, width: 200, height: 200 });
  });
});

describe("shrinkImage", () => {
  it("returns the original file when the browser can't process it (here: no DOM)", async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "me.jpg", { type: "image/jpeg" });
    expect(await shrinkImage(file, { maxEdge: 512, square: true })).toBe(file);
  });
});
