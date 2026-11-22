import { AnimatedLogo } from "@/components/brand/animated-logo";
import { cn } from "@/lib/utils";

type StatusMessageProps = {
  code?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
};

/** Centered message used by 404, error and (later) empty or forbidden states. */
export function StatusMessage({
  code,
  title,
  description,
  actions,
  className,
}: StatusMessageProps) {
  return (
    <section
      className={cn(
        "container-page flex flex-1 flex-col items-center justify-center py-24 text-center",
        className,
      )}
    >
      {/* Optically centered on its wordmark (the flourish makes the artwork asymmetric). */}
      <AnimatedLogo mode="loop" speed={0.5} afterPageIntro className="h-20 -translate-x-[16%] sm:h-24" wordClassName="fill-primary" />
      {code && (
        <p className="mt-6 font-display text-7xl leading-none font-semibold text-gold-strong sm:text-8xl">
          {code}
        </p>
      )}
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
        {description}
      </p>
      {actions && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
      )}
    </section>
  );
}
