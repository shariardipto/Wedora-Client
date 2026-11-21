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
