import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { SearchXIcon } from "lucide-react";

export default function EditServiceNotFound() {
  return (
    <EmptyState
      icon={SearchXIcon}
      title="Service not found"
      description="This service doesn’t exist or doesn’t belong to your account."
      action={
        <Button asChild className="rounded-full">
          <Link href="/dashboard/vendor/services">Back to My Services</Link>
        </Button>
      }
    />
  );
}
