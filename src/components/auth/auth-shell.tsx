import Image from "next/image";
import { AnimatedLogo } from "@/components/brand/animated-logo";
import { FallingPetals } from "@/components/motion/falling-petals";
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
  // my-auto: with no footer below (FooterGate), the panel sits centred in the space under the navbar.
  return (
    <section className="container-page my-auto py-10 sm:py-14">
      <div className="mx-auto grid grid-cols-1 max-w-5xl overflow-hidden rounded-3xl bg-card shadow-[0_24px_60px_-30px_rgb(43_35_38/0.35)] ring-1 ring-border lg:grid-cols-[0.95fr_1.05fr]">
        {/* Photo panel: the brand mark on its own at the top-left, the message at the bottom (the
            classic split; the logo no longer sits squeezed onto the bouquet above the quote). */}
        <div className="relative isolate hidden min-h-[36rem] flex-col justify-between p-10 text-background lg:flex">
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
          {/* A soft shade at the top keeps the logo crisp over the brighter parts of the photo. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-night/60 to-transparent" />
          <FallingPetals count={10} className="-z-5" />
          <AnimatedLogo mode="loop" speed={0.5} afterPageIntro className="h-20 self-start" wordClassName="fill-white" />
          <div>
            <p className="font-display text-3xl leading-snug font-medium">
              {quote ?? "Every beautiful day begins with the right people beside you."}
            </p>
            <p className="mt-3 text-sm text-background/75">
              Trusted vendors · Clear bookings · One calm place
            </p>
          </div>
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
