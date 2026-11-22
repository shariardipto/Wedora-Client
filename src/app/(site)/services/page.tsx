import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CircleAlertIcon, SearchXIcon } from "lucide-react";
import { BrowseFilters } from "@/components/services/browse-filters";
import { ServiceCard, ServiceGrid, ServiceGridSkeleton } from "@/components/services/service-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { Button } from "@/components/ui/button";
import { ServerApiError, serverApi } from "@/lib/api-server";
import { getCategoryName } from "@/lib/categories";
import { parseBrowseQuery, toSearchParams, type BrowseQuery } from "@/lib/services/query";
import type { PageMeta, Service } from "@/lib/services/types";

export const metadata: Metadata = {
  title: "Browse Wedding Services",
  description:
    "Search approved wedding photographers, venues, florists, caterers, stylists and fashion designers on Wedora.",
};

const PAGE_SIZE = 12;

async function Results({ query }: { query: BrowseQuery }) {
  let result: { data: Service[]; meta: PageMeta };
  try {
    result = await serverApi<Service[], PageMeta>("/api/services", {
      searchParams: toSearchParams(query, { limit: String(PAGE_SIZE) }),
    });
  } catch (error) {
    const message = error instanceof ServerApiError ? error.message : "Something went wrong.";
    return (
      <EmptyState
        icon={CircleAlertIcon}
        title="We couldn’t load services"
        description={`${message} Please try again in a moment.`}
        action={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/services">Try again</Link>
          </Button>
        }
      />
    );
  }

  const { data: services, meta } = result;
  if (services.length === 0) {
    const filtered = Boolean(query.q || query.category || query.location);
    return (
      <EmptyState
        icon={SearchXIcon}
        title={filtered ? "No services match your search" : "No services yet"}
        description={
          filtered
            ? "Try a different keyword, another category or a wider location."
            : "Approved wedding services will appear here as vendors join Wedora."
        }
        action={
          filtered ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/services">Clear all filters</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  const start = (meta.page - 1) * meta.limit + 1;
  const end = start + services.length - 1;

  return (
    <div className="space-y-8">
      {/* Keeps headings in order (h1 → h2 → card h3) for screen-reader navigation. */}
      <h2 className="sr-only">Results</h2>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground">{start}–{end}</span> of{" "}
        <span className="font-medium text-foreground">{meta.total}</span> service{meta.total === 1 ? "" : "s"}
      </p>
      <ServiceGrid>
        {services.map((service) => (
          <li key={service.id}>
            <ServiceCard service={service} />
          </li>
        ))}
      </ServiceGrid>
      <PaginationNav
        page={meta.page}
        totalPages={meta.totalPages}
        hrefFor={(page) => {
          const qs = toSearchParams({ ...query, page }).toString();
          return qs ? `/services?${qs}` : "/services";
        }}
      />
    </div>
  );
}

export default async function BrowseServicesPage({ searchParams }: PageProps<"/services">) {
  const query = parseBrowseQuery(await searchParams);
  const categoryName = query.category ? getCategoryName(query.category) : undefined;

  return (
    <div className="container-page section-y pt-10! sm:pt-14!">
      <header className="max-w-2xl">
        <p className="eyebrow">Browse services</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          {categoryName ?? "Find your wedding team"}
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Every listing is reviewed by our team. Search by name, filter by category or location,
          and sort by price.
        </p>
      </header>

      <div className="mt-8">
        <BrowseFilters query={query} />
      </div>

      <div className="mt-8">
        {/* Keyed by the query so each new search shows the loading skeleton. */}
        <Suspense key={toSearchParams(query).toString()} fallback={<ServiceGridSkeleton />}>
          <Results query={query} />
        </Suspense>
      </div>
    </div>
  );
}
