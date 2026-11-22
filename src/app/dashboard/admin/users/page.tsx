import type { Metadata } from "next";
import { UsersIcon } from "lucide-react";
import { AdminUserFilters } from "@/components/admin/admin-user-filters";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { parseAdminUserQuery, toAdminUserSearch } from "@/lib/admin/user-query";
import { serverApi } from "@/lib/api-server";
import { requireRole } from "@/lib/auth/session";
import type { AdminUser } from "@/lib/dashboard/types";
import type { PageMeta } from "@/lib/services/types";

export const metadata: Metadata = { title: "Manage Users" };

export default async function ManageUsersPage({ searchParams }: PageProps<"/dashboard/admin/users">) {
  const { user } = await requireRole("admin");
  const query = parseAdminUserQuery(await searchParams);
  const { data: users, meta } = await serverApi<AdminUser[], PageMeta>("/api/admin/users", {
    auth: true,
    searchParams: toAdminUserSearch(query),
  });
  const filtered = Boolean(query.q || query.role || query.status);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Manage Users"
        description="Search customers and vendors, check their details, and block accounts when necessary. Admin accounts are protected."
      />
      <AdminUserFilters query={query} />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {meta.total} user{meta.total === 1 ? "" : "s"}
        {filtered ? " match your filters" : " registered"}
      </p>
      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="Try a different name or email, or clear the role and status filters."
        />
      ) : (
        <AdminUsersTable users={users} currentUserId={user.id} />
      )}
      <PaginationNav
        page={meta.page}
        totalPages={meta.totalPages}
        hrefFor={(page) => {
          const qs = toAdminUserSearch({ ...query, page }).toString();
          return qs ? `/dashboard/admin/users?${qs}` : "/dashboard/admin/users";
        }}
      />
    </div>
  );
}
