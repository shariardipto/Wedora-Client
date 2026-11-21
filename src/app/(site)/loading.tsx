import { RingsLoader } from "@/components/shared/rings-loader";

export default function SiteLoading() {
  return (
    <div className="grid flex-1 place-items-center py-32">
      <RingsLoader label="Loading page" />
    </div>
  );
}
