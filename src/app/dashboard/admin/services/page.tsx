import type { Metadata } from "next";
import { ListChecksIcon } from "lucide-react";
import { AdminServiceFilters } from "@/components/admin/admin-service-filters";
import { AdminServicesTable } from "@/components/admin/admin-services-table";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { toAdminSearch, type AdminServiceQuery } from "@/lib/admin/service-query";
import { serverApi } from "@/lib/api-server";
import { isCategorySlug } from "@/lib/categories";
import type { PageMeta, Service } from "@/lib/services/types";

export const metadata: Metadata = { title: "Manage Services" };

const STATUSES = new Set(["pending", "approved", "rejected"]);
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export default async function ManageServicesPage({ searchParams }: PageProps<"/dashboard/admin/services">) {
  const raw = await searchParams;
  const status = first(raw.status);
  const category = first(raw.category);
  const page = Number.parseInt(first(raw.page) ?? "1", 10);
  const query: AdminServiceQuery = {
    q: first(raw.q)?.slice(0, 80),
    status: status && STATUSES.has(status) ? status : undefined,
    category: isCategorySlug(category) ? category : undefined,
    page: Number.isFinite(page) && page > 0 && page <= 1000 ? page : 1,
  };

  const { data: services, meta } = await serverApi<Service[], PageMeta>("/api/admin/services", {
    auth: true,
    searchParams: toAdminSearch(query),
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Manage Services"
        description="Review new submissions, approve or reject them, and remove inappropriate listings. Only approved, available services appear on Browse Services."
      />
      <AdminServiceFilters query={query} />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {meta.total} service{meta.total === 1 ? "" : "s"}
        {query.status ? ` · ${query.status}` : ""}
      </p>
      {services.length === 0 ? (
        <EmptyState
          icon={ListChecksIcon}
          title={query.q || query.status || query.category ? "No services match these filters" : "No services submitted yet"}
          description="New vendor submissions will appear here for review."
        />
      ) : (
        <AdminServicesTable services={services} />
      )}
      <PaginationNav
        page={meta.page}
        totalPages={meta.totalPages}
        hrefFor={(p) => {
          const qs = toAdminSearch({ ...query, page: p }).toString();
          return qs ? `/dashboard/admin/services?${qs}` : "/dashboard/admin/services";
        }}
      />
    </div>
  );
}
