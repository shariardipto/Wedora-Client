import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <SiteShell>
      <StatusMessage
        code="404"
        title="This page wandered off"
        description="The page you are looking for doesn’t exist or may have moved. Let’s get you back to planning."
        actions={
          <>
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6">
              <Link href="/services">Browse Services</Link>
            </Button>
          </>
        }
      />
    </SiteShell>
  );
}
