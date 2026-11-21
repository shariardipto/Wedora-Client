"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusMessage
      title="Something went wrong"
      description="We couldn’t load this page. Please try again — if the problem continues, come back in a little while."
      actions={
        <>
          <Button size="lg" className="h-11 rounded-full px-6" onClick={reset}>
            Try again
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6">
            <Link href="/">Back to Home</Link>
          </Button>
        </>
      }
    />
  );
}
