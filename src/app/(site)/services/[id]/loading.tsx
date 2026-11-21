import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailsLoading() {
  return (
    <div className="container-page py-8 sm:py-12" role="status" aria-label="Loading service">
      <Skeleton className="h-4 w-40" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <Skeleton className="aspect-[4/3] rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
      <span className="sr-only">Loading service…</span>
    </div>
  );
}
