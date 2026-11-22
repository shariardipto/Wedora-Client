import { describe, expect, it } from "vitest";
import { parseAdminTransactionQuery, toAdminTransactionSearch } from "@/lib/admin/transaction-query";
import { formatMoney } from "@/lib/format";
import { CHECKOUT_SESSION_ID, isStripeCheckoutUrl } from "./types";

describe("billing helpers", () => {
  it("formats Stripe cents as dollars", () => {
    expect(formatMoney(2900)).toBe("$29.00");
    expect(formatMoney(123456, "usd")).toBe("$1,234.56");
  });

  it("only trusts Stripe-hosted Checkout links", () => {
    expect(isStripeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_abc")).toBe(true);
    expect(isStripeCheckoutUrl("http://checkout.stripe.com/c/pay/cs_test_abc")).toBe(false);
    expect(isStripeCheckoutUrl("https://checkout.stripe.com.evil.example/c/pay")).toBe(false);
    expect(isStripeCheckoutUrl("javascript:alert(1)")).toBe(false);
  });

  it("recognises Checkout session ids", () => {
    expect(CHECKOUT_SESSION_ID.test("cs_test_a1B2c3D4e5F6g7")).toBe(true);
    expect(CHECKOUT_SESSION_ID.test("cs_test_{CHECKOUT_SESSION_ID}")).toBe(false);
    expect(CHECKOUT_SESSION_ID.test("pi_123")).toBe(false);
  });
});

describe("admin transaction query", () => {
  it("keeps valid filters and drops invalid ones", () => {
    expect(parseAdminTransactionQuery({ q: " vera ", status: "paid", page: "2" })).toEqual({ q: "vera", status: "paid", page: 2 });
    expect(parseAdminTransactionQuery({ status: "refunded", page: "abc" })).toEqual({ q: undefined, status: undefined, page: 1 });
  });

  it("serializes without defaults", () => {
    expect(toAdminTransactionSearch({ page: 1 }).toString()).toBe("");
    expect(toAdminTransactionSearch({ q: "vera", status: "failed", page: 2 }).toString()).toBe("q=vera&status=failed&page=2");
  });
});
