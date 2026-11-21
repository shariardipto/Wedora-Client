import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

type SectionHeadingProps = {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="eyebrow inline-flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-8 bg-gold" />
        {eyebrow}
        {align === "center" && (
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
        )}
      </p>
      <h2
        id={id}
        className="mt-4 text-4xl leading-[1.1] font-semibold text-foreground sm:text-5xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
