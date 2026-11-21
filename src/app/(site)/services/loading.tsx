import { ServiceGridSkeleton } from "@/components/services/service-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <div className="container-page section-y pt-10! sm:pt-14!">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-12 w-80 max-w-full" />
      <Skeleton className="mt-4 h-5 w-[32rem] max-w-full" />
      <Skeleton className="mt-8 h-20 w-full rounded-2xl" />
      <div className="mt-8">
        <ServiceGridSkeleton />
      </div>
    </div>
  );
}
