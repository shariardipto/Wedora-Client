import { describe, expect, it } from "vitest";
import { getInitials } from "./user-avatar";

describe("getInitials", () => {
  it("uses the first letters of the first two words", () => {
    expect(getInitials("Chloe Customer")).toBe("CC");
    expect(getInitials("  maya   thompson ")).toBe("MT");
    expect(getInitials("Ivory Lens Studio")).toBe("IL");
  });

  it("skips words that don't start with a letter or digit", () => {
    expect(getInitials("Petal & Twine Florals")).toBe("PT");
    expect(getInitials("— Glow + Grace")).toBe("GG");
    expect(getInitials("Élodie Ångström")).toBe("ÉÅ");
  });

  it("falls back to W", () => {
    expect(getInitials("")).toBe("W");
    expect(getInitials(null)).toBe("W");
    expect(getInitials("& —")).toBe("W");
  });
});
