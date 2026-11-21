import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BriefcaseIcon,
  CalendarHeartIcon,
  CrownIcon,
  MailIcon,
  ShieldCheckIcon,
  UserCogIcon,
} from "lucide-react";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionUser } from "@/lib/auth/server";

const ROLE_COPY = {
  customer: {
    label: "Customer",
    intro: "Find the right vendors and keep track of every booking request.",
    action: { label: "Browse wedding services", href: "/services" },
    icon: CalendarHeartIcon,
  },
  vendor: {
    label: "Vendor",
    intro: "Publish your services and respond to couples’ booking requests.",
    action: { label: "Browse the marketplace", href: "/services" },
    icon: BriefcaseIcon,
  },
  admin: {
    label: "Admin",
    intro: "Review services, manage users and monitor platform transactions.",
    action: { label: "View public services", href: "/services" },
    icon: ShieldCheckIcon,
  },
} as const;

function formatDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(value),
  );
}

/** Account summary shown on each role's overview (P5 adds statistics). */
export function AccountOverview({ user }: { user: SessionUser }) {
  const role = (user.role ?? "customer") as keyof typeof ROLE_COPY;
  const copy = ROLE_COPY[role];
  const expires = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
  const isPremium = user.subscriptionPlan === "premium" && expires !== null && expires > new Date();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} image={user.image} className="size-14" />
          <div>
            <p className="eyebrow">{copy.label} dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
          </div>
        </div>
        <Button asChild variant="outline" className="h-10 rounded-full px-5">
          <Link href="/dashboard/profile">
            <UserCogIcon data-icon="inline-start" />
            Profile Settings
          </Link>
        </Button>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-sans text-base">Your account</CardTitle>
            <CardDescription>{copy.intro}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <MailIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{user.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <copy.icon className="size-4 text-muted-foreground" aria-hidden="true" />
              <Badge variant="secondary">{copy.label}</Badge>
            </p>
            {formatDate(user.createdAt) && (
              <p className="text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
            )}
          </CardContent>
        </Card>

        {role === "vendor" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Business & plan</CardTitle>
              <CardDescription>
                {user.businessName ? user.businessName : "Add your business name in Profile Settings."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                {isPremium ? (
                  <CrownIcon className="size-4 text-gold" aria-hidden="true" />
                ) : (
                  <BadgeCheckIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="font-medium">{isPremium ? "Premium plan" : "Free plan"}</span>
              </p>
              <p className="text-muted-foreground">
                {isPremium
                  ? `Unlimited active services · renews or ends on ${formatDate(expires)}`
                  : "Up to 3 active services. Upgrade to Premium for unlimited services."}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-primary text-primary-foreground ring-0">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-semibold">Start exploring</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              See every approved wedding service on Wedora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="h-10 rounded-full bg-background px-5 text-primary hover:bg-background/90"
            >
              <Link href={copy.action.href}>
                {copy.action.label}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
