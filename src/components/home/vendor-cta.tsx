import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
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
    <section aria-labelledby="vendor-cta-title" className="section-y">
      <div className="container-page">
        <Reveal className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 lg:px-16 lg:py-16">
          {/* Oversized, faint brand mark tucked into the corner as texture. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-28 -z-10 text-primary-foreground opacity-[0.08] sm:-right-16 sm:-bottom-24"
          >
            <BrandLogo variant="white" alt="" height={384} className="h-72 sm:h-96" />
          </div>
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
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
              <Button
                asChild
                size="lg"
                className="group mt-8 h-12 rounded-full bg-background px-7 text-base text-primary hover:bg-background/90"
              >
                <Link href="/signup?role=vendor">
                  Become a Vendor
                  <ArrowRightIcon
                    data-icon="inline-end"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
