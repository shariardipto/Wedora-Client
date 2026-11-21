import Image from "next/image";
import { BrandLogo } from "@/components/brand/logo";
import heroImage from "@/assets/images/hero-couple.jpg";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Short line shown over the photo panel. */
  quote?: string;
};

/** Two-panel layout for Sign In / Sign Up: photo on the left, form on the right. */
export function AuthShell({ title, description, children, quote }: AuthShellProps) {
  return (
    <section className="container-page py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-card shadow-[0_24px_60px_-30px_rgb(43_35_38/0.35)] ring-1 ring-border lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative isolate hidden min-h-[36rem] flex-col justify-end p-10 text-background lg:flex">
          <Image
            src={heroImage}
            alt=""
            fill
            placeholder="blur"
            sizes="40vw"
            className="-z-20 object-cover object-[62%_center]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-night/90 via-night/40 to-night/10"
          />
          <BrandLogo variant="white" height={72} className="h-16 self-start" />
          <p className="mt-6 font-display text-3xl leading-snug font-medium">
            {quote ?? "Every beautiful day begins with the right people beside you."}
          </p>
          <p className="mt-3 text-sm text-background/75">
            Trusted vendors · Clear bookings · One calm place
          </p>
        </div>

        <div className="px-5 py-10 sm:px-10 lg:px-12">
          <h1 className="text-4xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
