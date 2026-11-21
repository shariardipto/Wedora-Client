import Link from "next/link";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";

export default function ServiceNotFound() {
  return (
    <StatusMessage
      title="Service not found"
      description="This service doesn’t exist, or it’s no longer available for booking. Explore other wedding services instead."
      actions={
        <Button asChild size="lg" className="h-11 rounded-full px-6">
          <Link href="/services">Browse Services</Link>
        </Button>
      }
    />
  );
}
