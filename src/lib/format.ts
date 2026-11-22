/** US-dollar prices with standard grouping, e.g. $12,500. */
export function formatPrice(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatDate(value: string | Date | null | undefined, style: "long" | "short" = "long"): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Event dates are calendar dates ("2027-03-15"), stored as UTC midnight.
 * Formatting in UTC keeps the same day for every visitor, in every timezone.
 */
export function formatEventDate(dateOnly: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateOnly}T00:00:00Z`));
}

/** Stripe amounts are in the smallest unit (cents): 2900 → "$29.00". */
export function formatMoney(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}
