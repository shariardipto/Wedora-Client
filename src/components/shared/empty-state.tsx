import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed bg-card/60 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
