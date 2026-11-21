import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  SERVICE_CATEGORIES,
  categoryHref,
  type ServiceCategorySlug,
} from "@/lib/categories";
import { SectionHeading } from "./section-heading";
import photography from "@/assets/images/categories/photography-videography.jpg";
import venues from "@/assets/images/categories/venues.jpg";
import decoration from "@/assets/images/categories/decoration-florist.jpg";
import catering from "@/assets/images/categories/catering.jpg";
import makeup from "@/assets/images/categories/makeup-styling.jpg";
import fashion from "@/assets/images/categories/fashion.jpg";

const categoryImages: Record<ServiceCategorySlug, StaticImageData> = {
  "photography-videography": photography,
  venues,
  "decoration-florist": decoration,
  catering,
  "makeup-styling": makeup,
  fashion,
};

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-title" className="section-y">
      <div className="container-page">
        <SectionHeading
          id="categories-title"
          eyebrow="Every detail, covered"
          title="Explore wedding services by category"
          description="From the first photo to the last dance — find the right professionals for each part of your celebration."
        />

        <Stagger
          as="ul"
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {SERVICE_CATEGORIES.map((category) => (
            <StaggerItem as="li" key={category.slug}>
              <Link
                href={categoryHref(category.slug)}
                className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-night p-6 text-background shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-ring/60 focus-visible:outline-none sm:aspect-[4/5] lg:aspect-[5/6]"
              >
                <Image
                  src={categoryImages[category.slug]}
                  alt=""
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-night/90 via-night/35 to-transparent"
                />
                <h3 className="font-display text-2xl leading-tight font-semibold sm:text-[1.7rem]">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-background/80">
                  {category.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                  Browse services
                  <ArrowUpRightIcon
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
