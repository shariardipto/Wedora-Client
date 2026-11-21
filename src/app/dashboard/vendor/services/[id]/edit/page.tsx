import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { ServiceStatusBadge } from "@/components/services/status-badge";
import { ServiceForm } from "@/components/vendor/service-form";
import { ServerApiError, serverApi } from "@/lib/api-server";
import { requireRole } from "@/lib/auth/session";
import type { Service } from "@/lib/services/types";

export const metadata: Metadata = { title: "Edit Service" };

export default async function EditServicePage({ params }: PageProps<"/dashboard/vendor/services/[id]/edit">) {
  const { id } = await params;
  const { user } = await requireRole("vendor");

  let service: Service;
  try {
    service = (await serverApi<Service>(`/api/services/${encodeURIComponent(id)}`, { auth: true })).data;
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) notFound();
    throw error;
  }
  // Vendors may only edit their own services (the API enforces this too).
  if (service.vendorId !== user.id) notFound();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Vendor"
        title="Edit Service"
        description={service.serviceName}
        actions={<ServiceStatusBadge status={service.status} className="h-7 px-3" />}
      />
      <ServiceForm mode="edit" service={service} />
    </div>
  );
}
