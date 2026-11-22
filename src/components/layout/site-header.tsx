"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { BrandLogo } from "@/components/brand/logo";
import { UserMenu } from "@/components/auth/user-menu";
import { useSignOut } from "@/components/auth/use-sign-out";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mainNav } from "@/config/site";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";

function isActivePath(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Scroll-driven chrome for the floating navbar:
 * - theme: "dark" over sections marked data-nav-theme="dark", else "light"
 * - scrolled: a slightly stronger shadow once the page moves
 * - hidden: tucks away while scrolling down, returns on any scroll up
 * - --progress: page reading progress for the gold line
 */
function useNavChrome(pathname: string) {
  const pill = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      setScrolled(y > 12);
      if (y < 140) setHidden(false);
      else if (delta > 4) setHidden(true);
      else if (delta < -4) setHidden(false);

      const beneath = document
        .elementsFromPoint(window.innerWidth / 2, 44)
        .find((el) => !el.closest("[data-site-header],[data-page-loader]"));
      setTheme(beneath?.closest<HTMLElement>("[data-nav-theme]")?.dataset.navTheme === "dark" ? "dark" : "light");

      const max = document.documentElement.scrollHeight - window.innerHeight;
      pill.current?.style.setProperty("--progress", (max > 0 ? Math.min(1, y / max) : 0).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Layout can change without any scroll (late content, fonts, hot reload): re-check then too.
    const layout = new ResizeObserver(schedule);
    layout.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      layout.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  const reveal = useCallback(() => setHidden(false), []);
  return { pill, theme, scrolled, hidden, reveal };
}

export function SiteHeader() {
  const pathname = usePathname();
  // Reactive: updates immediately after sign-in, sign-out or profile changes.
  const { data: session, isPending } = authClient.useSession();
  const { signOut, pending: signingOut } = useSignOut();
  const user = session?.user;
  const { pill, theme, scrolled, hidden, reveal } = useNavChrome(pathname);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = mainNav.find((item) => isActivePath(pathname, item.href))?.href ?? null;
  const highlight = hovered ?? active;

  return (
    <header
      data-site-header
      data-theme={theme}
      data-scrolled={scrolled ? "" : undefined}
      onFocusCapture={reveal}
      className="group/nav pointer-events-none sticky top-0 z-50 h-20 md:h-[5.5rem]"
    >
      <div
        className={cn(
          "container-page pt-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:pt-4",
          hidden && "-translate-y-[140%]",
        )}
      >
        <div
          ref={pill}
          className="nav-pill pointer-events-auto relative flex h-14 items-center justify-between gap-3 rounded-full pr-1.5 pl-4 md:h-[3.75rem] md:pr-2 md:pl-5"
        >
          {/* Logo: coloured on light sections, white on dark ones (crossfade). */}
          <Link
            href="/"
            aria-label="Wedora home"
            className="relative inline-flex shrink-0 items-center rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <BrandLogo eager height={48} className="h-10 transition-opacity duration-500 group-data-[theme=dark]/nav:opacity-0 md:h-11" />
            <BrandLogo
              eager
              variant="white"
              alt=""
              height={48}
              className="absolute left-0 h-10 opacity-0 transition-opacity duration-500 group-data-[theme=dark]/nav:opacity-100 md:h-11"
            />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
              {mainNav.map((item) => {
                const isActive = item.href === active;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onMouseEnter={() => setHovered(item.href)}
                      onFocus={() => setHovered(item.href)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        "relative z-0 block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        isActive
                          ? "text-primary group-data-[theme=dark]/nav:text-gold-light"
                          : "text-foreground/75 hover:text-foreground group-data-[theme=dark]/nav:text-background/80 group-data-[theme=dark]/nav:hover:text-background",
                      )}
                    >
                      {highlight === item.href && (
                        <motion.span
                          layoutId="nav-indicator"
                          aria-hidden="true"
                          className="absolute inset-0 -z-10 rounded-full bg-primary/[0.07] ring-1 ring-primary/10 group-data-[theme=dark]/nav:bg-white/10 group-data-[theme=dark]/nav:ring-white/15"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      {item.label}
                      {isActive && (
                        <span aria-hidden="true" className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-gold" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1.5 md:flex">
              {isPending ? (
                <div className="p-0.5" aria-hidden="true">
                  <Skeleton className="size-10 rounded-full" />
                </div>
              ) : user ? (
                <UserMenu user={user} />
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none group-data-[theme=dark]/nav:text-background/85 group-data-[theme=dark]/nav:hover:text-gold-light"
                  >
                    Sign In
                  </Link>
                  <Magnetic strength={0.22}>
                    <Button
                      asChild
                      className="shine h-10 rounded-full px-5 shadow-[0_8px_24px_-10px_rgb(107_45_63/0.7)] group-data-[theme=dark]/nav:bg-gold-light group-data-[theme=dark]/nav:text-night group-data-[theme=dark]/nav:shadow-[0_8px_28px_-10px_rgb(220_191_142/0.7)] group-data-[theme=dark]/nav:hover:bg-gold-light md:h-11"
                    >
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </Magnetic>
                </>
              )}
            </div>
            <MobileMenu
              className="lg:hidden"
              pathname={pathname}
              user={user}
              isPending={isPending}
              signingOut={signingOut}
              onSignOut={() => void signOut()}
            />
          </div>

          <span aria-hidden="true" className="nav-progress" />
        </div>
      </div>
    </header>
  );
}
