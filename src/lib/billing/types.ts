import type { VendorStats } from "@/lib/dashboard/types";
import type { PageMeta } from "@/lib/services/types";

/** Mirrors the API's billing views. Amounts are in cents. */

export type TransactionStatus = "pending" | "paid" | "failed" | "expired";

export type Transaction = {
  id: string;
  kind: "subscription" | "renewal";
  plan: "premium";
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingStatus = {
  plan: VendorStats["plan"];
  mode: "test" | "live" | null;
  price: { amount: number; currency: string; interval: "month" };
  /** The checkout named by `?session_id=`, when it belongs to this vendor. */
  checkout: Transaction | null;
  transactions: Transaction[];
};

export type AdminTransaction = Transaction & {
  vendor: { id: string; name: string; email: string; businessName: string | null } | null;
};

export type TransactionSummary = {
  revenue: number;
  currency: string;
  paid: number;
  pending: number;
  failed: number;
  expired: number;
};

export type AdminTransactionMeta = PageMeta & { summary: TransactionSummary };

/** Stripe Checkout session ids, e.g. `cs_test_a1B2…` (same rule as the API). */
export const CHECKOUT_SESSION_ID = /^cs_(?:test|live)_[A-Za-z0-9]{10,250}$/;

/** Only ever redirect the browser to Stripe's hosted Checkout. */
export function isStripeCheckoutUrl(value: string): boolean {
  const url = URL.parse(value);
  return url !== null && url.protocol === "https:" && url.hostname === "checkout.stripe.com";
}
