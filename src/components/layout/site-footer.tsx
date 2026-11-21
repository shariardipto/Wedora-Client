import Link from "next/link";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SocialIcon } from "@/components/brand/social-icon";
import { siteConfig } from "@/config/site";
import { SERVICE_CATEGORIES, categoryHref } from "@/lib/categories";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Sign In", href: "/signin" },
  { label: "Create an Account", href: "/signup" },
  { label: "Become a Vendor", href: "/signup?role=vendor" },
];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-sans text-xs font-semibold tracking-[0.2em] text-gold uppercase">
      {children}
    </h2>
  );
}

const linkClass =
  "text-sm text-background/70 transition-colors hover:text-background focus-visible:text-background focus-visible:outline-none focus-visible:underline";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-background">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.3fr] lg:gap-10">
        <div className="max-w-xs">
          <Logo variant="white" imageClassName="h-16" height={64} />
          <p className="mt-5 text-sm leading-7 text-background/70">
            {siteConfig.description}
          </p>
          <ul className="mt-6 flex gap-2" aria-label="Social media">
            {siteConfig.socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.name} (opens in a new tab)`}
                  className="grid size-10 place-items-center rounded-full border border-background/15 text-background/80 transition-colors hover:border-gold hover:bg-gold hover:text-night focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none"
                >
                  <SocialIcon name={social.name} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-labelledby="footer-explore">
          <FooterHeading>
            <span id="footer-explore">Explore</span>
          </FooterHeading>
          <ul className="mt-5 space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-categories">
          <FooterHeading>
            <span id="footer-categories">Categories</span>
          </FooterHeading>
          <ul className="mt-5 space-y-3">
            {SERVICE_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link href={categoryHref(category.slug)} className={linkClass}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <FooterHeading>Contact</FooterHeading>
          <address className="mt-5 space-y-4 text-sm not-italic text-background/70">
            <p className="flex gap-3">
              <MailIcon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <a href={`mailto:${siteConfig.contact.email}`} className={linkClass}>
                {siteConfig.contact.email}
              </a>
            </p>
            <p className="flex gap-3">
              <PhoneIcon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <a href={siteConfig.contact.phoneHref} className={linkClass}>
                {siteConfig.contact.phone}
              </a>
            </p>
            <p className="flex gap-3">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{siteConfig.contact.address}</span>
            </p>
            <p className="flex gap-3">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{siteConfig.contact.hours}</span>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-background/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Wedora. All rights reserved.</p>
          <p>Made with care for couples and wedding professionals.</p>
        </div>
      </div>
    </footer>
  );
}
