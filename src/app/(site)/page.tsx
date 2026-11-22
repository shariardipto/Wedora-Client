import { CategoryGrid } from "@/components/home/category-grid";
import { CategoryMarquee } from "@/components/home/category-marquee";
import { FeaturedServices } from "@/components/home/featured-services";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { VendorCta } from "@/components/home/vendor-cta";
import { WhyChoose } from "@/components/home/why-choose";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryMarquee />
      <FeaturedServices />
      <CategoryGrid />
      <WhyChoose />
      <HowItWorks />
      <VendorCta />
    </>
  );
}
