/**
 * Public, non-secret site information used by the layout, footer and metadata.
 * Contact details are demo values for the assignment — replace them with real
 * public business details before launch.
 */
export const siteConfig = {
  name: "Wedora",
  tagline: "Wedding planning, beautifully simple.",
  description:
    "Discover trusted wedding vendors — photographers, venues, florists, caterers and more — and request bookings for your big day in one place.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  contact: {
    email: "support@wedora.app",
    phone: "+1 (512) 555-0147",
    phoneHref: "tel:+15125550147",
    address: "Austin, Texas, United States",
    hours: "Mon – Fri, 9am – 6pm CT",
  },
  socials: [
    { name: "Facebook", href: "https://www.facebook.com/" },
    { name: "Instagram", href: "https://www.instagram.com/" },
    { name: "X", href: "https://x.com/" },
    { name: "YouTube", href: "https://www.youtube.com/" },
  ],
} as const;

export type SocialName = (typeof siteConfig.socials)[number]["name"];

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
] as const;
