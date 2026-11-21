import { CategoryGrid } from "@/components/home/category-grid";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { VendorCta } from "@/components/home/vendor-cta";
import { WhyChoose } from "@/components/home/why-choose";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* P3: Featured Wedding Services (6+ approved & active from the database) goes here. */}
      <CategoryGrid />
      <WhyChoose />
      <HowItWorks />
      <VendorCta />
    </>
  );
}
