import { describe, expect, it } from "vitest";
import {
  CATEGORY_SLUGS,
  SERVICE_CATEGORIES,
  categoryHref,
  getCategoryName,
  isCategorySlug,
} from "./categories";

describe("service categories", () => {
  it("contains exactly the six required categories with unique slugs", () => {
    expect(SERVICE_CATEGORIES.map((category) => category.name)).toEqual([
      "Photography & Videography",
      "Wedding Venues",
      "Decoration & Florist",
      "Catering Services",
      "Makeup & Styling",
      "Wedding Fashion",
    ]);
    expect(new Set(CATEGORY_SLUGS).size).toBe(6);
  });

  it("uses URL-safe slugs", () => {
    for (const slug of CATEGORY_SLUGS) {
      expect(slug).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
    }
  });

  it("validates slugs from untrusted input", () => {
    expect(isCategorySlug("venues")).toBe(true);
    expect(isCategorySlug("Venues")).toBe(false);
    expect(isCategorySlug("__proto__")).toBe(false);
    expect(isCategorySlug(undefined)).toBe(false);
  });

  it("maps slugs to names and browse links", () => {
    expect(getCategoryName("catering")).toBe("Catering Services");
    expect(getCategoryName("unknown")).toBeUndefined();
    expect(categoryHref("fashion")).toBe("/services?category=fashion");
  });
});
