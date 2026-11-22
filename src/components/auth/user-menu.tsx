"use client";

import Link from "next/link";
import { LayoutDashboardIcon, LogOutIcon, UserCogIcon } from "lucide-react";
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

/** Navbar profile dropdown: name + photo, Dashboard, Profile Settings, Logout. */
export function UserMenu({ user }: { user: MenuUser }) {
  const { signOut, pending } = useSignOut();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-muted group-data-[theme=dark]/nav:text-background group-data-[theme=dark]/nav:hover:bg-white/10 group-data-[theme=dark]/nav:data-[state=open]:bg-white/10"
      >
        {/* The accessible name comes from the content, so it always includes the visible name (WCAG 2.5.3). */}
        <span className="sr-only">Account menu for </span>
        <span aria-hidden="true">
          <UserAvatar name={user.name} image={user.image} />
        </span>
        <span className="max-w-32 truncate text-sm font-medium">{user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <UserAvatar name={user.name} image={user.image} className="size-10" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
            {user.role && (
              <Badge variant="secondary" className="mt-1 h-5 px-2 text-[0.65rem]">
                {ROLE_LABEL[user.role] ?? user.role}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboardIcon />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <UserCogIcon />
              Profile Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            void signOut();
          }}
        >
          <LogOutIcon />
          {pending ? "Signing out…" : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
