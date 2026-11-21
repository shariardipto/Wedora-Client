import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { ServiceForm } from "@/components/vendor/service-form";
import { serverApi } from "@/lib/api-server";
import type { Service, VendorServicesMeta } from "@/lib/services/types";

export const metadata: Metadata = { title: "Add Service" };

export default async function AddServicePage() {
  const { meta } = await serverApi<Service[], VendorServicesMeta>("/api/vendor/services", { auth: true });
  const limitReached = meta.activeLimit !== null && meta.activeCount >= meta.activeLimit;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Vendor"
        title="Add Service"
        description="New services start as “Pending review” and go live once a Wedora admin approves them."
      />
      <ServiceForm mode="create" limitReached={limitReached} />
    </div>
  );
}
