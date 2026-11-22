import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SERVICE_GRID_CLASS, ServiceCard, ServiceGridSkeleton } from "@/components/services/service-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/api-server";
import type { Service } from "@/lib/services/types";
import { SectionHeading } from "./section-heading";

async function FeaturedList() {
  let services: Service[] = [];
  try {
    services = (await serverApi<Service[]>("/api/services/featured", {
      searchParams: new URLSearchParams({ limit: "8" }),
    })).data;
  } catch {
    services = [];
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={SparklesIcon}
        title="New services are on their way"
        description="Vendors are setting up their listings. Check back soon — or explore every category below."
      />
    );
  }

  // Same grid as Browse, with the cards fading in one after another.
  return (
    <Stagger as="ul" gap={0.07} className={SERVICE_GRID_CLASS}>
      {services.map((service) => (
        <StaggerItem as="li" key={service.id}>
          <ServiceCard service={service} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/** Dynamic section 1: newest approved & available services from the database. */
export function FeaturedServices() {
  return (
    <section aria-labelledby="featured-title" className="section-y bg-card">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="featured-title"
            align="left"
            eyebrow="Featured wedding services"
            title="Loved by couples, reviewed by us"
            description="Fresh, approved listings from Wedora vendors — open any one to see photos, details and pricing."
          />
          <Button asChild variant="outline" className="h-11 shrink-0 self-start rounded-full px-5 md:self-auto">
            <Link href="/services">
              View all services
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <div className="mt-12">
          <Suspense fallback={<ServiceGridSkeleton count={8} label="Loading featured services" />}>
            <FeaturedList />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
