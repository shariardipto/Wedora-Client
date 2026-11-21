import { describe, expect, it } from "vitest";
import { sniffImageType, validateImageFile } from "./image-upload";

const bytes = (...values: number[]) => new Uint8Array([...values, ...new Array(16).fill(0)]);

describe("sniffImageType", () => {
  it("detects JPEG, PNG and WebP by magic bytes", () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47))).toBe("image/png");
    const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");
    expect(sniffImageType(webp)).toBe("image/webp");
  });

  it("rejects disguised files", () => {
    expect(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode("GIF89a......"))).toBeNull();
  });
});

describe("validateImageFile", () => {
  it("rejects missing, oversized and unsupported files", () => {
    expect(validateImageFile(null)).toMatchObject({ ok: false, code: "NO_FILE" });
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.jpg", { type: "image/jpeg" });
    expect(validateImageFile(big)).toMatchObject({ ok: false, code: "FILE_TOO_LARGE" });
    const svg = new File(["<svg/>"], "x.svg", { type: "image/svg+xml" });
    expect(validateImageFile(svg)).toMatchObject({ ok: false, code: "UNSUPPORTED_TYPE" });
  });

  it("accepts a reasonable image", () => {
    const ok = new File([bytes(0xff, 0xd8, 0xff)], "a.jpg", { type: "image/jpeg" });
    expect(validateImageFile(ok)).toBeNull();
  });
});
