import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, StoreIcon } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { PlanUsage } from "@/components/vendor/plan-usage";
import { VendorServiceList } from "@/components/vendor/vendor-service-list";
import { serverApi } from "@/lib/api-server";
import type { Service, VendorServicesMeta } from "@/lib/services/types";

export const metadata: Metadata = { title: "My Services" };

export default async function MyServicesPage() {
  const { data: services, meta } = await serverApi<Service[], VendorServicesMeta>("/api/vendor/services", {
    auth: true,
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Vendor"
        title="My Services"
        description="Track approval status, pause or resume bookings, and keep your listings up to date."
        actions={
          <Button asChild className="h-11 rounded-full px-5">
            <Link href="/dashboard/vendor/services/new">
              <PlusIcon data-icon="inline-start" />
              Add Service
            </Link>
          </Button>
        }
      />
      <PlanUsage meta={meta} />
      {services.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title="No services yet"
          description="Add your first wedding service. Our team reviews every listing before couples can see it."
          action={
            <Button asChild className="rounded-full">
              <Link href="/dashboard/vendor/services/new">Add your first service</Link>
            </Button>
          }
        />
      ) : (
        <VendorServiceList services={services} />
      )}
    </div>
  );
}
