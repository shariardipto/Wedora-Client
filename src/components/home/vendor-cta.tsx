import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { AnimatedLogo } from "@/components/brand/animated-logo";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

const perks: React.ReactNode[] = [
  "Free plan with up to 3 active services",
  "Booking requests in one dashboard",
  <>
    Premium: unlimited services &amp; badge — <Price amount={29} className="font-semibold" />/month
  </>,
];

export function VendorCta() {
  return (
    <section id="for-vendors" aria-labelledby="vendor-cta-title" className="section-y scroll-mt-20">
      <div className="container-page">
        <Reveal className="aurora grain relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground shadow-[0_40px_100px_-40px_rgb(74_31_44/0.7)] sm:px-12 lg:px-16 lg:py-16">
          {/* Oversized, faint brand mark tucked into the corner as texture. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-28 -z-10 text-primary-foreground opacity-[0.08] sm:-right-16 sm:-bottom-24"
          >
            <AnimatedLogo mode="loop" speed={0.5} className="h-72 sm:h-96" wordClassName="fill-white" />
          </div>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-gold-light uppercase">
                For wedding professionals
              </p>
              <h2
                id="vendor-cta-title"
                className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl"
              >
                Bring your services to couples planning their day
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-primary-foreground/80">
                Create a vendor profile, publish your services and manage
                booking requests — then upgrade when you are ready to grow.
              </p>
            </div>
            <div>
              <ul className="space-y-3">
                {perks.map((perk, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold text-night">
                      <CheckIcon className="size-3.5" aria-hidden="true" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <Magnetic className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="shine group h-12 rounded-full bg-background px-7 text-base text-primary hover:bg-background"
                >
                  <Link href="/signup?role=vendor">
                    Become a Vendor
                    <ArrowRightIcon
                      data-icon="inline-end"
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
