/** Admin "Manage Services" URL query — shared by the server page and client filters. */
export type AdminServiceQuery = { q?: string; status?: string; category?: string; page: number };

export function toAdminSearch(query: Partial<AdminServiceQuery>) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.category) params.set("category", query.category);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
}
