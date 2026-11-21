"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearApiToken } from "@/lib/api-client";
import { authClient } from "@/lib/auth/client";

/** Signs out, clears the cached API token and returns to the home page. */
export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = useCallback(async () => {
    setPending(true);
    clearApiToken();
    const { error } = await authClient.signOut();
    setPending(false);
    if (error) {
      toast.error("We couldn’t sign you out. Please try again.");
      return;
    }
    toast.success("You’ve been signed out.");
    router.replace("/");
    router.refresh();
  }, [router]);

  return { signOut, pending };
}
