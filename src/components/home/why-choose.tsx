import Image from "next/image";
import {
  CalendarCheckIcon,
  HeartHandshakeIcon,
  LayoutGridIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "./section-heading";
import bouquetImage from "@/assets/images/bouquet.jpg";
import ringsImage from "@/assets/images/rings.jpg";

const benefits = [
  {
    icon: ShieldCheckIcon,
    title: "Reviewed before listed",
    body: "Every service is checked by our team before it goes live, so you browse real, approved offers.",
  },
  {
    icon: LayoutGridIcon,
    title: "Everything in one place",
    body: "Compare photographers, venues, caterers and more side by side — by category, location and price.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Clear booking status",
    body: "Send a request in minutes and follow it from pending to accepted on your own dashboard.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Free for couples",
    body: "Browsing and booking requests cost nothing. Vendors choose a plan that fits their business.",
  },
];

export function WhyChoose() {
  return (
    <section
      aria-labelledby="why-title"
      className="section-y overflow-hidden bg-card"
    >
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Arch-framed main photo — a nod to ceremony arches. */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-xl ring-1 ring-black/5">
            <Image
              src={bouquetImage}
              alt="A bride holding a bouquet of peach and white roses"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-2 -bottom-6 aspect-square w-[42%] overflow-hidden rounded-full border-[6px] border-card shadow-lg sm:-right-6">
            <Image
              src={ringsImage}
              alt="Two gold wedding rings"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 18vw, 40vw"
              className="object-cover"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute -top-5 -left-5 -z-10 size-28 rounded-full border border-gold/50"
          />
        </Reveal>

        <div>
          <SectionHeading
            id="why-title"
            align="left"
            eyebrow="Why choose Wedora"
            title={
              <>
                Less searching, more{" "}
                <em className="font-medium text-primary">celebrating</em>
              </>
            }
            description="Wedding planning has a hundred moving parts. Wedora brings the vendors you need into one trusted, organized space."
          />

          <Stagger as="ul" className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
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
