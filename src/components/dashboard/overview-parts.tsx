import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, CameraIcon, PencilIcon, UserCogIcon, type LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TodayLabel } from "./today-label";

type Role = "customer" | "vendor" | "admin";

const ROLE_LABEL: Record<Role, string> = { customer: "Customer", vendor: "Vendor", admin: "Admin" };

const PHOTO_HINT: Record<Role, string> = {
  customer: "A photo helps vendors recognize you when you send booking requests.",
  vendor: "A photo helps couples recognize and trust your business.",
  admin: "Personalize your admin account with a profile photo.",
};

export type HeaderAction = { label: string; href: string; icon: LucideIcon };

/** What needs attention, as a chip: amber = waiting on you, green = all clear, neutral = nothing yet. */
export type HeaderStatus = { tone: "green" | "amber" | "neutral"; label: string; href?: string };

const STATUS_TONES = {
  green: { chip: "bg-emerald-50 text-emerald-800 ring-emerald-600/20", dot: "bg-emerald-500" },
  amber: { chip: "bg-amber-50 text-amber-900 ring-amber-600/25", dot: "bg-amber-500" },
  neutral: { chip: "bg-secondary text-foreground/75 ring-border", dot: "bg-gold" },
} as const;

function StatusChip({ tone, label, href }: HeaderStatus) {
  const styles = STATUS_TONES[tone];
  const content = (
    <>
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} />
      {label}
      {href && <ArrowRightIcon aria-hidden="true" className="size-3 transition-transform group-hover:translate-x-0.5" />}
    </>
  );
  const className = cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1", styles.chip);
  return href ? (
    <Link
      href={href}
      className={cn(className, "group transition-shadow hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none")}
    >
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}

/**
 * The greeting card at the top of each overview, in two rows that share one left edge:
 * 1. the avatar (opens Profile Settings) and "Welcome back" on the left; the role and today's date on
 *    the right (phones: the role sits above the name);
 * 2. below a hairline: a short detail (e.g. the business name) and a status chip saying what needs
 *    attention (linking to it) on the left; the role's main action and Profile Settings on the right.
 * Static on purpose, like the rest of the dashboard.
 */
export function OverviewHeader({
  role,
  name,
  image,
  detail,
  status,
  action,
}: {
  role: Role;
  name: string;
  image?: string | null;
  detail?: string;
  status?: HeaderStatus;
  action?: HeaderAction;
}) {
  const ActionIcon = action?.icon;
  return (
    <header className="relative isolate overflow-hidden rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-7">
      {/* A soft golden-hour glow in the corner. */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(220_191_142/0.28),transparent)]"
      />

      {/* Row 1: the avatar and the greeting on the left; the role and today's date on the right. */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          {/* The gold ring ties any photo (including Google's colourful default) into the palette. */}
          <Link
            href="/dashboard/profile"
            aria-label="Edit your profile photo and details"
            title="Profile Settings"
            className="group relative shrink-0 rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <UserAvatar
              name={name}
              image={image}
              className="size-14 ring-2 ring-gold/45 ring-offset-2 ring-offset-card transition-shadow group-hover:ring-gold sm:size-16"
              fallbackClassName="text-base sm:text-lg"
            />
            <span className="absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-card transition-transform group-hover:scale-110">
              <PencilIcon className="size-3" aria-hidden="true" />
            </span>
          </Link>
          <div className="min-w-0">
            {/* Phones: no room on the right, so the role sits above the name. */}
            <p className="eyebrow mb-1 sm:hidden">{ROLE_LABEL[role]} dashboard</p>
            <h1 className="text-[1.7rem] leading-tight font-semibold break-words sm:text-4xl">
              Welcome back, {name.split(" ")[0]}
            </h1>
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="eyebrow">{ROLE_LABEL[role]} dashboard</p>
          {/* min-h keeps the line's height while the date (read in the browser) appears. */}
          <p className="mt-1 min-h-7 font-display text-xl text-foreground/80">
            <TodayLabel />
          </p>
        </div>
      </div>

      {/* Row 2, below a fine rule: status on the left, actions on the right. Everything shares the
          avatar's left edge; on phones the actions drop under the status. */}
      <div className="mt-5 flex flex-col gap-4 border-t border-border/70 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          {detail && <p className="text-sm font-medium text-foreground/80">{detail}</p>}
          {status && <StatusChip {...status} />}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
          {action && ActionIcon && (
            <Button asChild className="h-10 rounded-full px-5 shadow-[0_8px_24px_-12px_rgb(107_45_63/0.7)]">
              <Link href={action.href}>
                <ActionIcon data-icon="inline-start" />
                {action.label}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className={cn("h-10 rounded-full px-5", !action && "col-span-2")}>
            <Link href="/dashboard/profile">
              <UserCogIcon data-icon="inline-start" />
              Profile Settings
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/** Shown until the user adds a profile photo (photos are added after sign-in). */
export function PhotoPrompt({ role, image }: { role: Role; image?: string | null }) {
  if (image) return null;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-gold/60 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
          <CameraIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold">Add a profile photo</p>
          <p className="text-sm text-muted-foreground">{PHOTO_HINT[role]}</p>
        </div>
      </div>
      <Button asChild className="h-10 shrink-0 self-start rounded-full px-5 sm:self-auto">
        <Link href="/dashboard/profile">
          <CameraIcon data-icon="inline-start" />
          Upload photo
        </Link>
      </Button>
    </div>
  );
}

const TONES = {
  wine: "bg-secondary text-primary",
  gold: "bg-accent text-gold-strong",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-muted text-muted-foreground",
} as const;

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: React.ReactNode;
  href?: string;
  tone?: keyof typeof TONES;
};

/** One statistic. With `href` the whole card links to the related page. */
export function StatCard({ label, value, icon: Icon, hint, href, tone = "wine" }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:text-xs sm:tracking-[0.14em]">{label}</p>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full sm:size-9", TONES[tone])}>
          <Icon className="size-4 sm:size-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl leading-none font-semibold text-foreground sm:text-4xl">{value}</p>
      {hint && <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>}
      {href && (
        <ArrowUpRightIcon
          className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        />
      )}
    </>
  );
  const className =
    "group relative flex flex-col rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-shadow sm:p-5";
  return href ? (
    <Link
      href={href}
      className={cn(className, "hover:shadow-md hover:ring-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none")}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Small titled panel for overview previews (recent requests, quick actions…). */
export function OverviewPanel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
