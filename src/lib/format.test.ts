import { describe, expect, it } from "vitest";
import { formatDate, formatEventDate, formatMoney, formatPrice, countOf } from "./format";

describe("formatDate", () => {
  it("formats in UTC, so server and browser print the same day (no hydration mismatch)", () => {
    // 19:30 UTC is already the next day in Dhaka (UTC+6); the output must not depend on it.
    expect(formatDate("2026-11-22T19:30:00Z")).toBe("November 22, 2026");
    expect(formatDate("2026-11-22T19:30:00Z", "short")).toBe("Nov 22, 2026");
    expect(formatDate(new Date("2026-01-01T00:00:00Z"), "short")).toBe("Jan 1, 2026");
  });

  it("returns an empty string for missing values", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });
});

describe("other formatters", () => {
  it("formats event dates, prices and Stripe amounts", () => {
    expect(formatEventDate("2027-04-17")).toBe("Sat, Apr 17, 2027");
    expect(formatPrice(12500)).toBe("$12,500");
    expect(formatMoney(2900)).toBe("$29.00");
  });
});

describe("countOf", () => {
  it("uses the singular only for exactly one", () => {
    expect(countOf(1, "request")).toBe("1 request");
    expect(countOf(0, "request")).toBe("0 requests");
    expect(countOf(3, "service")).toBe("3 services");
    expect(countOf(2, "person", "people")).toBe("2 people");
  });
});
