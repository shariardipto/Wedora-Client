export const siteConfig = {
  name: "Wedora",
  tagline: "Wedding planning, beautifully simple.",
  description:
    "Discover trusted wedding vendors — photographers, venues, florists, caterers and more — and request bookings for your big day in one place.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  contact: {
    email: "support@wedora.app",
    phone: "+1 (512) 123-1234",
    phoneHref: "tel:+15121231234",
    address: "Austin, Texas, United States",
    hours: "Mon – Fri, 9am – 6pm CT",
  },
  socials: [
    { name: "Facebook", href: "https://www.facebook.com/TheCodeWorkStudio" },
    { name: "Instagram", href: "https://www.instagram.com/TheCodeWorkStudio" },
    { name: "X", href: "https://x.com/TheCodeWorkStudio" },
    // YouTube channel links use the @handle form.
    { name: "YouTube", href: "https://www.youtube.com/@TheCodeWorkStudio" },
  ],
} as const;

export type SocialName = (typeof siteConfig.socials)[number]["name"];

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Vendors", href: "/#for-vendors" },
] as const;
