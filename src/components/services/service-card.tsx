import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price, PriceCaption } from "@/components/shared/price";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryName } from "@/lib/categories";
import type { Service } from "@/lib/services/types";
import { VendorBadge } from "./vendor-badge";

/** Service card: image, name, category, price, location, vendor, View Details. */
export function ServiceCard({ service }: { service: Service }) {
  const href = `/services/${service.id}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-shadow duration-300 hover:shadow-lg">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-muted" tabIndex={-1} aria-hidden="true">
        {service.images[0] && (
          <Image
            src={service.images[0]}
            alt=""
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground shadow-sm backdrop-blur hover:bg-background/90">
          {getCategoryName(service.category) ?? service.category}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-base leading-snug font-semibold tracking-normal">
          <Link href={href} className="line-clamp-2 hover:text-primary focus-visible:underline focus-visible:outline-none">
            {service.serviceName}
          </Link>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{service.location}</span>
        </p>
        <VendorBadge vendor={service.vendor} className="mt-4" />

        <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3 border-t pt-4">
          <div>
            <PriceCaption />
            <p className="mt-1.5 text-[1.75rem] text-primary">
              <Price variant="display" amount={service.price} />
            </p>
          </div>
          <Button asChild size="sm" className="h-9 rounded-full px-4">
            <Link href={href} aria-label={`View details for ${service.serviceName}`}>
              View Details
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        </div>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border" aria-hidden="true">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-7 w-32 rounded-full" />
        <div className="flex items-end justify-between border-t pt-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ServiceGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</ul>
  );
}

export function ServiceGridSkeleton({ count = 8, label = "Loading services" }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-label={label}>
      <ServiceGrid>
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <ServiceCardSkeleton />
          </li>
        ))}
      </ServiceGrid>
      <span className="sr-only">{label}…</span>
    </div>
  );
}
