"use client";

import { usePathname } from "next/navigation";

/** Focused pages that end with their own panel rather than the site footer. */
const WITHOUT_FOOTER = ["/signin", "/signup"];

/**
 * Leaves the footer out on sign-in and sign-up, where a full closing scene under the form looked odd.
 * Decided from the path while rendering (also on the server), so the footer never flashes in. The
 * shell stays mounted across pages, so the intro doesn't replay (a separate layout would remount it).
 */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = WITHOUT_FOOTER.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  return hidden ? null : children;
}
