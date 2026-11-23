"use client";

import Link from "next/link";
import { smoothScrollTo } from "@/components/motion/smooth-scroll";

/**
 * A footer link that still does something when it points at the page you're on. Next.js doesn't
 * scroll for a link to the current URL, so "Home" on the home page (or "Browse Services" on Browse)
 * left you at the footer as if the click had missed. A same-page click now glides back to the top.
 * Hash links (e.g. "/#how-it-works") and modified clicks (new tab, etc.) keep their normal behaviour.
 */
export function FooterLink({ onClick, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        const target = new URL(String(props.href), window.location.href);
        const samePage = target.pathname === window.location.pathname && target.search === window.location.search;
        if (!samePage || target.hash) return;
        event.preventDefault();
        const main = document.getElementById("main-content");
        if (main) smoothScrollTo(main);
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}
