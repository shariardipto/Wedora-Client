import Image from "next/image";
import {
  CalendarCheckIcon,
  HeartHandshakeIcon,
  LayoutGridIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ParallaxLayer } from "@/components/motion/scroll-effects";
import { SectionHeading } from "./section-heading";
import bouquetImage from "@/assets/images/bouquet.jpg";
import ringsImage from "@/assets/images/rings.jpg";

// Benefits in a couple's terms. Each is true of the product: listings are approved by the team and a
// significant edit sends one back for review; couples only see approved, available services with
// "starting from" prices; requests and answers live on the dashboard; couples never pay.
const benefits = [
  {
    icon: ShieldCheckIcon,
    title: "Vetted by real people",
    body: "Our team reviews every listing before it goes live, and checks it again after major changes. What you see is what vendors actually offer.",
  },
  {
    icon: LayoutGridIcon,
    title: "Compare at a glance",
    body: "Photographers, venues, florists, caterers, stylists and bridal fashion side by side, with starting prices shown up front.",
  },
  {
    icon: CalendarCheckIcon,
    title: "No more chasing replies",
    body: "Send your date and details in one short request, then find each vendor’s answer on your dashboard, not buried in your inbox.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Free for couples, always",
    body: "Planning with Wedora costs you nothing. Vendors support the platform through optional Premium plans.",
  },
];

export function WhyChoose() {
  return (
    <section
      aria-labelledby="why-title"
      className="section-y overflow-hidden bg-card"
    >
      <div className="container-page grid grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* isolate: the frame below sits behind the photo (-z-10) but must stay above the section's
            background. The entrance animation's transform made that true only while it played, so
            the old decorative ring vanished once the photo had faded in. */}
        <Reveal className="relative isolate mx-auto w-full max-w-md lg:max-w-none">
          {/* A fine gold arch drawn just outside the photo, the same frame as the hero's arch photo. */}
          <div
            aria-hidden="true"
            className="absolute -inset-3 -z-10 rounded-t-[999px] rounded-b-[2.25rem] border border-gold/50 sm:-inset-4 sm:rounded-b-[2.5rem]"
          />
          {/* Arch-framed main photo — a nod to ceremony arches. */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-xl ring-1 ring-black/5">
            <ParallaxLayer amount={6}>
              <Image
                src={bouquetImage}
                alt="A bride holding a bouquet of peach and white roses"
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </ParallaxLayer>
          </div>
          <div className="absolute -right-2 -bottom-6 aspect-square w-[42%] overflow-hidden rounded-full border-[6px] border-card shadow-lg sm:-right-6">
            <ParallaxLayer amount={12}>
              <Image
                src={ringsImage}
                alt="Two gold wedding rings"
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 18vw, 40vw"
                className="object-cover"
              />
            </ParallaxLayer>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            id="why-title"
            align="left"
            eyebrow="Why couples choose Wedora"
            title={
              <>
                Less searching, more{" "}
                <em className="font-medium text-primary">celebrating</em>
              </>
            }
            description="Planning a wedding means juggling dozens of vendors, quotes and dates. Wedora brings trusted professionals into one place, so you can compare honestly and book with confidence."
          />

          <Stagger as="ul" className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, body }) => (
              <StaggerItem as="li" key={title} className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-sans text-base font-semibold tracking-normal text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
