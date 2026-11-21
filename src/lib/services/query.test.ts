import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/format";
import { parseBrowseQuery, toSearchParams } from "./query";

describe("parseBrowseQuery", () => {
  it("keeps valid values", () => {
    expect(
      parseBrowseQuery({ q: " photo ", category: "venues", location: "Austin", sort: "price_desc", page: "3" }),
    ).toEqual({ q: "photo", category: "venues", location: "Austin", sort: "price_desc", page: 3 });
  });

  it("drops invalid or hostile values", () => {
    expect(
      parseBrowseQuery({ category: "fireworks", sort: "random", page: "-4", q: "", location: ["Austin", "x"] }),
    ).toEqual({ q: undefined, category: undefined, location: "Austin", sort: "newest", page: 1 });
    expect(parseBrowseQuery({ page: "99999" }).page).toBe(1);
    expect(parseBrowseQuery({ q: "x".repeat(200) }).q).toHaveLength(80);
  });
});

describe("toSearchParams", () => {
  it("omits defaults so URLs stay clean", () => {
    expect(toSearchParams({ sort: "newest", page: 1 }).toString()).toBe("");
    expect(toSearchParams({ q: "dj", category: "catering", sort: "price_asc", page: 2 }).toString()).toBe(
      "q=dj&category=catering&sort=price_asc&page=2",
    );
  });
});

describe("formatPrice", () => {
  it("formats US dollars with standard grouping", () => {
    expect(formatPrice(29)).toBe("$29");
    expect(formatPrice(125000)).toBe("$125,000");
  });
});
