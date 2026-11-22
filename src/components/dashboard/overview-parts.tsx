import Link from "next/link";
import { ArrowUpRightIcon, CameraIcon, UserCogIcon, type LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "customer" | "vendor" | "admin";

const ROLE_LABEL: Record<Role, string> = { customer: "Customer", vendor: "Vendor", admin: "Admin" };

const PHOTO_HINT: Record<Role, string> = {
  customer: "A photo helps vendors recognize you when you send booking requests.",
  vendor: "A photo helps couples recognize and trust your business.",
  admin: "Personalize your admin account with a profile photo.",
};

/** Avatar + "Welcome back" + Profile Settings shortcut. */
export function OverviewHeader({
  role,
  name,
  image,
  subtitle,
}: {
  role: Role;
  name: string;
  image?: string | null;
  subtitle?: string;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <UserAvatar name={name} image={image} className="size-14" />
        <div className="min-w-0">
          <p className="eyebrow">{ROLE_LABEL[role]} dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Welcome back, {name.split(" ")[0]}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <Button asChild variant="outline" className="h-10 shrink-0 self-start rounded-full px-5 sm:self-auto">
        <Link href="/dashboard/profile">
          <UserCogIcon data-icon="inline-start" />
          Profile Settings
        </Link>
      </Button>
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
