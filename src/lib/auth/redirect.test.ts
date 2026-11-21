import { describe, expect, it } from "vitest";
import { dashboardPath, postAuthDestination, safeCallbackUrl, signInUrl } from "./redirect";

describe("safeCallbackUrl (open-redirect protection)", () => {
  it.each(["/dashboard", "/services/64b7f0c2a1b2c3d4e5f60718", "/services?category=venues#top"])(
    "keeps same-site path %s",
    (value) => {
      expect(safeCallbackUrl(value)).toBe(value);
    },
  );

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/%2F%2Fevil.example",
    "javascript:alert(1)",
    "/api/auth/sign-out",
    "/signin",
    "/signup?role=vendor",
    " /dashboard",
    undefined,
    42,
  ])("rejects %s", (value) => {
    expect(safeCallbackUrl(value)).toBe("");
    expect(safeCallbackUrl(value, "/")).toBe("/");
  });
});

describe("post-auth routing", () => {
  it("maps each role to its own dashboard", () => {
    expect(dashboardPath("customer")).toBe("/dashboard/customer");
    expect(dashboardPath("vendor")).toBe("/dashboard/vendor");
    expect(dashboardPath("admin")).toBe("/dashboard/admin");
    expect(dashboardPath(null)).toBe("/onboarding/role");
    expect(dashboardPath("superuser")).toBe("/onboarding/role");
  });

  it("prefers a safe callback, falls back to the role dashboard", () => {
    expect(postAuthDestination("customer", "/services/abc")).toBe("/services/abc");
    expect(postAuthDestination("vendor", "https://evil.example")).toBe("/dashboard/vendor");
    expect(postAuthDestination(undefined, "/services/abc")).toBe("/onboarding/role");
  });

  it("builds sign-in links with an encoded callback", () => {
    expect(signInUrl("/services/abc?x=1")).toBe("/signin?callbackUrl=%2Fservices%2Fabc%3Fx%3D1");
    expect(signInUrl("//evil")).toBe("/signin");
  });
});
