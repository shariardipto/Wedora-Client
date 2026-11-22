/** Admin "Transactions" URL query — shared by the server page and client filters. */
export type AdminTransactionQuery = { q?: string; status?: string; page: number };

const STATUSES = new Set(["pending", "paid", "failed", "expired"]);

type RawParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export function parseAdminTransactionQuery(raw: RawParams): AdminTransactionQuery {
  const status = first(raw.status);
  const page = Number.parseInt(first(raw.page) ?? "1", 10);
  return {
    q: first(raw.q)?.slice(0, 80),
    status: status && STATUSES.has(status) ? status : undefined,
    page: Number.isFinite(page) && page > 0 && page <= 1000 ? page : 1,
  };
}

export function toAdminTransactionSearch(query: Partial<AdminTransactionQuery>) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
}
