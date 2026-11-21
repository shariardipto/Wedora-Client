"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboardIcon, LogOutIcon, MenuIcon, UserCogIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { UserAvatar } from "@/components/auth/user-avatar";
import { UserMenu } from "@/components/auth/user-menu";
import { useSignOut } from "@/components/auth/use-sign-out";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { mainNav } from "@/config/site";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // Reactive: updates immediately after sign-in, sign-out or profile changes.
  const { data: session, isPending } = authClient.useSession();
  const { signOut, pending: signingOut } = useSignOut();
  const user = session?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md transition-shadow duration-300 supports-backdrop-filter:bg-background/75",
        scrolled
          ? "border-border shadow-[0_6px_24px_-12px_rgb(43_35_38/0.25)]"
          : "border-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-18">
        <Logo eager />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      active ? "text-primary" : "text-foreground/80",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-4 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-300",
                        active ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden min-w-44 items-center justify-end gap-2 md:flex">
          {isPending ? (
            <div className="flex items-center gap-2.5" aria-hidden="true">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button asChild variant="ghost" className="h-10 rounded-full px-5">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild className="h-10 rounded-full px-5">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              className="rounded-full md:hidden"
              aria-label="Open menu"
            >
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] max-w-sm bg-background p-0">
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle className="font-display text-2xl">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation and account links
              </SheetDescription>
            </SheetHeader>

            {user && (
              <div className="flex items-center gap-3 border-b px-6 py-4">
                <UserAvatar name={user.name} image={user.image} className="size-11" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}

            <nav aria-label="Mobile" className="px-3 pt-2">
              <ul className="flex flex-col">
                {mainNav.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted",
                            active ? "bg-secondary text-primary" : "text-foreground",
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
                {user && (
                  <>
                    <li>
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium hover:bg-muted"
                        >
                          <LayoutDashboardIcon className="size-4 text-muted-foreground" />
                          Dashboard
                        </Link>
                      </SheetClose>
                    </li>
                    <li>
                      <SheetClose asChild>
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium hover:bg-muted"
                        >
                          <UserCogIcon className="size-4 text-muted-foreground" />
                          Profile Settings
                        </Link>
                      </SheetClose>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            <div className="mt-auto grid gap-2 border-t p-6">
              {user ? (
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="h-11 rounded-full"
                    disabled={signingOut}
                    onClick={() => void signOut()}
                  >
                    <LogOutIcon data-icon="inline-start" />
                    {signingOut ? "Signing out…" : "Logout"}
                  </Button>
                </SheetClose>
              ) : (
                !isPending && (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="h-11 rounded-full">
                        <Link href="/signin">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="h-11 rounded-full">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </>
                )
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
