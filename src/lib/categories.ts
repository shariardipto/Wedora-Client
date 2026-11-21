/**
 * The six fixed wedding service categories (assignment requirement).
 * `slug` is the value stored on services and used in `/services?category=…`.
 * The server keeps the same list for validation.
 */
export const SERVICE_CATEGORIES = [
  {
    slug: "photography-videography",
    name: "Photography & Videography",
    description: "Capture every vow, glance and dance floor moment.",
  },
  {
    slug: "venues",
    name: "Wedding Venues",
    description: "Garden pavilions, grand halls and intimate settings.",
  },
  {
    slug: "decoration-florist",
    name: "Decoration & Florist",
    description: "Stages, aisles and blooms styled to your story.",
  },
  {
    slug: "catering",
    name: "Catering Services",
    description: "Menus and service your guests will remember.",
  },
  {
    slug: "makeup-styling",
    name: "Makeup & Styling",
    description: "Bridal looks, hair and grooming for the whole party.",
  },
  {
    slug: "fashion",
    name: "Wedding Fashion",
    description: "Gowns, suits, tuxedos and finishing touches.",
  },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
export type ServiceCategorySlug = ServiceCategory["slug"];

export const CATEGORY_SLUGS = SERVICE_CATEGORIES.map(
  (category) => category.slug,
) as ServiceCategorySlug[];

export function isCategorySlug(value: unknown): value is ServiceCategorySlug {
  return (
    typeof value === "string" &&
    (CATEGORY_SLUGS as readonly string[]).includes(value)
  );
}

export function getCategoryName(slug: string): string | undefined {
  return SERVICE_CATEGORIES.find((category) => category.slug === slug)?.name;
}

export function categoryHref(slug: ServiceCategorySlug): string {
  return `/services?category=${slug}`;
}
