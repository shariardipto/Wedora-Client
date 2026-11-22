"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, LogOutIcon, UserCogIcon, type LucideIcon } from "lucide-react";
import { DASHBOARD_NAV } from "@/components/dashboard/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSignOut } from "./use-sign-out";
import { UserAvatar } from "./user-avatar";

export type MenuUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
};

const PROFILE_HREF = "/dashboard/profile";

type MenuLink = { href: string; label: string; icon: LucideIcon };

/** The role's dashboard pages (Overview reads as "Dashboard" here); Profile Settings sits by Logout. */
function dashboardLinks(role?: string | null): MenuLink[] {
  if (role !== "customer" && role !== "vendor" && role !== "admin") {
    return [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon }];
  }
  return DASHBOARD_NAV[role]
    .filter((item) => item.href !== PROFILE_HREF)
    .map((item, index) => (index === 0 ? { ...item, label: "Dashboard" } : item));
}

const rowClass = "h-9 gap-2.5 rounded-lg px-2.5 text-[0.84rem]";
const linkClass = cn(
  rowClass,
  "text-foreground/85 [&_svg]:text-muted-foreground aria-[current=page]:bg-secondary aria-[current=page]:font-medium aria-[current=page]:text-primary aria-[current=page]:[&_svg]:text-primary",
);

/** Navbar profile dropdown: photo-only trigger; identity card, role shortcuts, Profile Settings, Logout. */
export function UserMenu({ user }: { user: MenuUser }) {
  const { signOut, pending } = useSignOut();
  const pathname = usePathname();
  const links = dashboardLinks(user.role);

  const linkItem = ({ href, label, icon: Icon }: MenuLink) => (
    <DropdownMenuItem key={href} asChild className={linkClass}>
      <Link href={href} aria-current={pathname === href ? "page" : undefined}>
        <Icon />
        {label}
      </Link>
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="rounded-full p-0.5 ring-2 ring-transparent transition-[box-shadow] hover:ring-primary/25 focus-visible:ring-ring/60 focus-visible:outline-none data-[state=open]:ring-primary/40 group-data-[theme=dark]/nav:hover:ring-gold-light/50 group-data-[theme=dark]/nav:data-[state=open]:ring-gold-light/70">
        <span className="sr-only">Account menu for {user.name}</span>
        <span aria-hidden="true">
          <UserAvatar name={user.name} image={user.image} className="size-10" />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 rounded-2xl p-1.5 shadow-[0_24px_60px_-20px_rgb(43_22_31/0.45)] ring-foreground/8"
      >
        <DropdownMenuLabel className="mb-1 flex items-center gap-3 rounded-xl bg-linear-to-br from-secondary via-secondary/70 to-accent/60 p-3 font-normal">
          <UserAvatar name={user.name} image={user.image} className="size-12 shadow-sm ring-2 ring-card" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            {user.role && (
              <Badge variant="outline" className="mt-1.5 h-5 border-border bg-card px-2 text-[0.65rem] text-gold-ink">
                {ROLE_LABEL[user.role] ?? user.role}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup>{links.map(linkItem)}</DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuGroup>
          {linkItem({ href: PROFILE_HREF, label: "Profile Settings", icon: UserCogIcon })}
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            className={rowClass}
            onSelect={(event) => {
              event.preventDefault();
              void signOut();
            }}
          >
            <LogOutIcon />
            {pending ? "Signing out…" : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
