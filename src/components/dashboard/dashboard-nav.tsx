"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheckIcon,
  CalendarHeartIcon,
  CreditCardIcon,
  CrownIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  PlusCircleIcon,
  StoreIcon,
  UserCogIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** `short` is the compact label used by the phone/tablet tab bar; `label` everywhere else. */
type NavItem = { href: string; label: string; short: string; icon: LucideIcon };

/** Role-based dashboard navigation. */
export const DASHBOARD_NAV: Record<"customer" | "vendor" | "admin", NavItem[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", short: "Overview", icon: LayoutDashboardIcon },
    { href: "/dashboard/customer/bookings", label: "My Bookings", short: "Bookings", icon: CalendarHeartIcon },
    { href: "/dashboard/profile", label: "Profile Settings", short: "Profile", icon: UserCogIcon },
  ],
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", short: "Overview", icon: LayoutDashboardIcon },
    { href: "/dashboard/vendor/services", label: "My Services", short: "Services", icon: StoreIcon },
    { href: "/dashboard/vendor/services/new", label: "Add Service", short: "Add", icon: PlusCircleIcon },
    { href: "/dashboard/vendor/bookings", label: "Booking Requests", short: "Requests", icon: CalendarCheckIcon },
    { href: "/dashboard/vendor/subscription", label: "Subscription", short: "Plan", icon: CrownIcon },
    { href: "/dashboard/profile", label: "Profile Settings", short: "Profile", icon: UserCogIcon },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", short: "Overview", icon: LayoutDashboardIcon },
    { href: "/dashboard/admin/users", label: "Manage Users", short: "Users", icon: UsersIcon },
    { href: "/dashboard/admin/services", label: "Manage Services", short: "Services", icon: ListChecksIcon },
    { href: "/dashboard/admin/transactions", label: "Transactions", short: "Payments", icon: CreditCardIcon },
    { href: "/dashboard/profile", label: "Profile Settings", short: "Profile", icon: UserCogIcon },
  ],
};

const ROLE_TITLE = { customer: "Customer", vendor: "Vendor", admin: "Admin" } as const;

/** The most specific item whose href matches the current path is active. */
function activeHref(items: NavItem[], pathname: string) {
  return items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function DashboardNav({ role }: { role: keyof typeof DASHBOARD_NAV }) {
  const pathname = usePathname();
  const items = DASHBOARD_NAV[role];
  const active = activeHref(items, pathname);
  // Six tabs (vendor) need slightly smaller labels and tighter spacing to fit 360 px phones.
  const dense = items.length > 5;

  return (
    <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <p className="mb-3 hidden px-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase lg:block">
        {ROLE_TITLE[role]} dashboard
      </p>
      <nav aria-label="Dashboard">
        {/* Phones/tablets: one row of equal tabs (icon over a short label), every section visible at
            once. Desktop: the sidebar list with full labels. */}
        <ul
          className={cn(
            "grid rounded-2xl bg-card p-1 shadow-[0_8px_24px_-16px_rgb(43_35_38/0.35)] ring-1 ring-border lg:flex lg:flex-col lg:gap-1 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0",
            dense ? "gap-0.5 sm:gap-1" : "gap-1",
          )}
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map(({ href, label, short, icon: Icon }) => {
            const isActive = href === active;
            return (
              <li key={href} className="min-w-0">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 text-center font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:px-1 sm:text-xs lg:min-h-0 lg:flex-row lg:justify-start lg:gap-2.5 lg:px-3 lg:py-2.5 lg:text-left lg:text-sm",
                    // Size first, then line height: a later font-size class would drop an earlier `leading-*`.
                    dense ? "px-0.5 text-[0.64rem] leading-tight" : "px-1 text-[0.7rem] leading-tight",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/75 hover:bg-secondary hover:text-primary",
                  )}
                >
                  <Icon className="size-5 shrink-0 lg:size-4" aria-hidden="true" />
                  <span className="w-full truncate lg:hidden">{short}</span>
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
