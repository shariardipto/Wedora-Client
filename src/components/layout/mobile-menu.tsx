"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRightIcon, LayoutDashboardIcon, LogOutIcon, UserCogIcon, XIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { UserAvatar } from "@/components/auth/user-avatar";
import { FallingPetals } from "@/components/motion/falling-petals";
import { smoothScrollTo } from "@/components/motion/smooth-scroll";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type MenuUser = { name: string; email: string; image?: string | null };

function isActivePath(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Full-screen menu for phones and tablets (Radix Sheet: focus trap, Escape, scroll lock). */
export function MobileMenu({
  pathname,
  user,
  isPending,
  signingOut,
  onSignOut,
  className,
}: {
  pathname: string;
  user: MenuUser | null | undefined;
  isPending: boolean;
  signingOut: boolean;
  onSignOut: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  // Same-page section links: close first, then scroll once the page is unlocked.
  function onNavigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const [path, hash] = href.split("#");
    if (!hash || pathname !== (path || "/")) return;
    event.preventDefault();
    setOpen(false);
    window.setTimeout(() => {
      const target = document.getElementById(hash);
      if (target) smoothScrollTo(target);
    }, 380);
  }

  const reveal = (index: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.08 + index * 0.06, duration: 0.6, ease: EASE },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={cn(
            "group/burger relative grid size-11 place-items-center rounded-full transition-colors hover:bg-primary/8 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none group-data-[theme=dark]/nav:hover:bg-white/10",
            className,
          )}
        >
          <span aria-hidden="true" className="absolute h-0.5 w-5 -translate-y-1 rounded-full bg-current transition-all duration-300 group-hover/burger:w-6" />
          <span aria-hidden="true" className="absolute h-0.5 w-3.5 -translate-x-[3px] translate-y-1 rounded-full bg-current transition-all duration-300 group-hover/burger:w-6 group-hover/burger:translate-x-0" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="grain w-full max-w-none gap-0 overflow-x-hidden overflow-y-auto border-0 bg-night p-0 text-background data-[side=right]:w-full data-[side=right]:sm:max-w-none"
      >
        {/* Glows are clipped to the panel so they can never create sideways scrolling. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <span className="orb orb-gold -top-24 -right-24 size-80" />
          <span className="orb orb-blush bottom-10 -left-24 size-72" />
        </div>
        <FallingPetals count={9} className="-z-10" />

        <div className="relative flex min-h-full flex-col px-6 pt-5 pb-8 sm:px-10">
          <div className="flex items-center justify-between">
            <BrandLogo variant="white" height={48} className="h-10" />
            <SheetClose asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 transition-colors hover:border-gold-light hover:text-gold-light focus-visible:ring-3 focus-visible:ring-gold-light/50 focus-visible:outline-none"
              >
                <XIcon className="size-5" />
              </button>
            </SheetClose>
          </div>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation and account links</SheetDescription>

          <nav aria-label="Mobile" className="mt-12">
            <ul className="flex flex-col">
              {mainNav.map((item, index) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <motion.li key={item.href} {...reveal(index)} className="border-b border-white/10">
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        onClick={(event) => onNavigate(event, item.href)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-4 py-4 font-display text-4xl leading-none font-medium transition-colors focus-visible:text-gold-light focus-visible:outline-none sm:text-5xl",
                          active ? "text-gold-light" : "text-background hover:text-gold-light",
                        )}
                      >
                        <span className="w-6 font-sans text-xs font-semibold tracking-widest text-gold-light/80 tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        <ArrowUpRightIcon
                          className="size-5 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </Link>
                    </SheetClose>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <motion.div {...reveal(mainNav.length)} className="mt-10">
            {user ? (
              <div className="space-y-3">
                <div className="glass-chip flex items-center gap-3 rounded-2xl p-3">
                  <UserAvatar name={user.name} image={user.image} className="size-11" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-background/70">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SheetClose asChild>
                    <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-medium transition-colors hover:border-gold-light hover:text-gold-light">
                      <LayoutDashboardIcon className="size-4" aria-hidden="true" />
                      Dashboard
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/dashboard/profile" className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-medium transition-colors hover:border-gold-light hover:text-gold-light">
                      <UserCogIcon className="size-4" aria-hidden="true" />
                      Profile
                    </Link>
                  </SheetClose>
                </div>
                <SheetClose asChild>
                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={onSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/15 disabled:opacity-60"
                  >
                    <LogOutIcon className="size-4" aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Logout"}
                  </button>
                </SheetClose>
              </div>
            ) : (
              !isPending && (
                <div className="grid grid-cols-2 gap-3">
                  <SheetClose asChild>
                    <Link href="/signin" className="flex h-12 items-center justify-center rounded-full border border-white/20 text-sm font-semibold transition-colors hover:border-gold-light hover:text-gold-light">
                      Sign In
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/signup" className="shine flex h-12 items-center justify-center rounded-full bg-gold-light text-sm font-semibold text-night">
                      Sign Up
                    </Link>
                  </SheetClose>
                </div>
              )
            )}
          </motion.div>

          <motion.p {...reveal(mainNav.length + 1)} className="mt-auto pt-10 text-sm text-background/60">
            Questions? <a href={`mailto:${siteConfig.contact.email}`} className="text-gold-light underline-offset-4 hover:underline">{siteConfig.contact.email}</a>
          </motion.p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
