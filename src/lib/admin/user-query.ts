/** Admin "Manage Users" URL query — shared by the server page and client filters. */
export type AdminUserQuery = { q?: string; role?: string; status?: string; page: number };

const ROLES = new Set(["customer", "vendor", "admin"]);
const STATUSES = new Set(["active", "blocked"]);

type RawParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export function parseAdminUserQuery(raw: RawParams): AdminUserQuery {
  const role = first(raw.role);
  const status = first(raw.status);
  const page = Number.parseInt(first(raw.page) ?? "1", 10);
  return {
    q: first(raw.q)?.slice(0, 80),
    role: role && ROLES.has(role) ? role : undefined,
    status: status && STATUSES.has(status) ? status : undefined,
    page: Number.isFinite(page) && page > 0 && page <= 1000 ? page : 1,
  };
}

export function toAdminUserSearch(query: Partial<AdminUserQuery>) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.role) params.set("role", query.role);
  if (query.status) params.set("status", query.status);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
}
