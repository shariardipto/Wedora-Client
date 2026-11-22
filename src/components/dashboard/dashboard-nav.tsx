"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheckIcon,
  CalendarHeartIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  PlusCircleIcon,
  StoreIcon,
  UserCogIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

/** Role-based dashboard navigation (later phases add users and billing). */
export const DASHBOARD_NAV: Record<"customer" | "vendor" | "admin", NavItem[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboardIcon },
    { href: "/dashboard/customer/bookings", label: "My Bookings", icon: CalendarHeartIcon },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCogIcon },
  ],
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboardIcon },
    { href: "/dashboard/vendor/services", label: "My Services", icon: StoreIcon },
    { href: "/dashboard/vendor/services/new", label: "Add Service", icon: PlusCircleIcon },
    { href: "/dashboard/vendor/bookings", label: "Booking Requests", icon: CalendarCheckIcon },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCogIcon },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboardIcon },
    { href: "/dashboard/admin/services", label: "Manage Services", icon: ListChecksIcon },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCogIcon },
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

  return (
    <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <p className="mb-3 hidden px-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase lg:block">
        {ROLE_TITLE[role]} dashboard
      </p>
      <nav aria-label="Dashboard">
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = href === active;
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:rounded-xl lg:px-3 lg:py-2.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-foreground/80 ring-1 ring-border hover:bg-secondary hover:text-primary lg:bg-transparent lg:ring-0",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
