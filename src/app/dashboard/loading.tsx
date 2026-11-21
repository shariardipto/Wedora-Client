import { BrandLoader } from "@/components/shared/brand-loader";

export default function SiteLoading() {
  return (
    <div className="grid flex-1 place-items-center py-32">
      <BrandLoader label="Loading page" />
    </div>
  );
}
