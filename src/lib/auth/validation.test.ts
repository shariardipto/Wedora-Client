import { describe, expect, it } from "vitest";
import {
  isTrustedImageUrl,
  passwordSchema,
  profileUpdateSchema,
  signUpSchema,
} from "./validation";

const validSignUp = {
  name: "Emily Carter",
  email: "Emily@Example.com",
  password: "Wedding1",
  accountType: "customer" as const,
};

describe("password rules (assignment: 6+, upper, lower)", () => {
  it.each(["Abcdef", "weddingPlan", "XyZ12345"])("accepts %s", (value) => {
    expect(passwordSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["Abc12", "at least 6"],
    ["abcdefg", "uppercase"],
    ["ABCDEFG", "lowercase"],
  ])("rejects %s (%s)", (value, reason) => {
    const result = passwordSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(reason);
  });
});

describe("signUpSchema", () => {
  it("normalizes email and accepts customer/vendor", () => {
    const parsed = signUpSchema.parse(validSignUp);
    expect(parsed.email).toBe("emily@example.com");
    expect(signUpSchema.safeParse({ ...validSignUp, accountType: "vendor" }).success).toBe(true);
  });

  it("never allows admin as an account type", () => {
    expect(signUpSchema.safeParse({ ...validSignUp, accountType: "admin" }).success).toBe(false);
  });

  it("requires a name and a valid email", () => {
    expect(signUpSchema.safeParse({ ...validSignUp, name: "A" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...validSignUp, email: "not-an-email" }).success).toBe(false);
  });
});

describe("profileUpdateSchema (BR-12)", () => {
  it("accepts editable fields", () => {
    expect(
      profileUpdateSchema.safeParse({
        name: "New Name",
        phone: "+1 (512) 555-0147",
        businessName: "Golden Hour",
        image: "https://i.ibb.co/abc/photo.jpg",
      }).success,
    ).toBe(true);
    expect(profileUpdateSchema.safeParse({ image: null, phone: "" }).success).toBe(true);
  });

  it.each([{ role: "admin" }, { isBlocked: false }, { subscriptionPlan: "premium" }, { email: "x@y.z" }])(
    "rejects protected field %j",
    (body) => {
      expect(profileUpdateSchema.safeParse(body).success).toBe(false);
    },
  );

  it("only accepts images hosted by ImgBB or Google", () => {
    expect(isTrustedImageUrl("https://i.ibb.co/x/y.png")).toBe(true);
    expect(isTrustedImageUrl("https://lh3.googleusercontent.com/a/abc")).toBe(true);
    expect(isTrustedImageUrl("http://i.ibb.co/x/y.png")).toBe(false);
    expect(isTrustedImageUrl("https://evil.example/i.ibb.co.png")).toBe(false);
    expect(isTrustedImageUrl("https://i.ibb.co.evil.example/x.png")).toBe(false);
  });
});
