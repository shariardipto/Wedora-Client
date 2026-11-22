import Link from "next/link";
import {
  ArrowUpIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SocialIcon } from "@/components/brand/social-icon";
import { siteConfig } from "@/config/site";
import { SERVICE_CATEGORIES, categoryHref } from "@/lib/categories";
import { cn } from "@/lib/utils";

type FooterLink = { label: string; href: string };

const EXPLORE_LINKS: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Become a Vendor", href: "/signup?role=vendor" },
];

const CATEGORY_LINKS: FooterLink[] = SERVICE_CATEGORIES.map((category) => ({
  label: category.name,
  href: categoryHref(category.slug),
}));

const ACCOUNT_LINKS: FooterLink[] = [
  { label: "Sign In", href: "/signin" },
  { label: "Create an Account", href: "/signup" },
];

const CONTACT_ITEMS: { icon: LucideIcon; label: string; text: string; href?: string }[] = [
  { icon: MailIcon, label: "Email", text: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
  { icon: PhoneIcon, label: "Phone", text: siteConfig.contact.phone, href: siteConfig.contact.phoneHref },
  { icon: MapPinIcon, label: "Location", text: siteConfig.contact.address },
  { icon: ClockIcon, label: "Hours", text: siteConfig.contact.hours },
];

/** Taller hit areas on phones and tablets (≥ 28px); compact rhythm only on desktop. */
const linkClass =
  "inline-flex rounded-sm py-1 text-sm text-background/70 transition-colors hover:text-gold-light focus-visible:text-gold-light focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline-none lg:py-0.5";

function ColumnHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="font-sans text-xs font-semibold tracking-[0.2em] text-gold-light uppercase">
      {children}
    </h3>
  );
}

function LinkColumn({ id, title, links }: { id: string; title: string; links: FooterLink[] }) {
  return (
    <nav aria-labelledby={id} className="min-w-0">
      <ColumnHeading id={id}>{title}</ColumnHeading>
      <ul className="mt-4 space-y-1.5 lg:mt-5 lg:space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer aria-labelledby="footer-heading" data-nav-theme="dark" className="bg-night text-background">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      <div className="container-page grid grid-cols-1 gap-10 py-12 sm:py-14 lg:grid-cols-12 lg:gap-8 lg:py-16">
        {/* Brand — centered on phones and tablets, a left-aligned column on desktop */}
        <div className="flex flex-col items-center text-center lg:col-span-4 lg:items-start lg:pr-6 lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            {/* While centered, the logo is optically centered on its wordmark (see BrandLogo `centered`). */}
            <Logo variant="white" imageClassName="h-16 -translate-x-[16%] lg:translate-x-0" height={64} />
            <p className="mt-5 max-w-xs text-sm leading-7 text-balance text-background/70 sm:max-w-md lg:max-w-sm lg:text-wrap">
              {siteConfig.description}
            </p>
          </div>
          <ul className="mt-6 flex shrink-0 gap-2.5" aria-label="Wedora on social media">
            {siteConfig.socials.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.name} (opens in a new tab)`}
                  className="grid size-11 place-items-center rounded-full border border-background/15 text-background/80 transition-colors hover:border-gold hover:bg-gold hover:text-night focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none lg:size-10"
                >
                  <SocialIcon name={social.name} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links + contact */}
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-x-6 gap-y-10 border-t border-background/10 pt-10 md:grid-cols-[1fr_1.3fr_1.5fr] md:gap-x-8 lg:col-span-8 lg:grid-cols-[1fr_1.35fr_1.45fr] lg:gap-8 lg:border-0 lg:pt-0">
          <LinkColumn id="footer-explore" title="Explore" links={EXPLORE_LINKS} />
          <LinkColumn id="footer-categories" title="Categories" links={CATEGORY_LINKS} />

          {/* Contact — a soft card on phones and small tablets, a plain column from 768px */}
          <div className="col-span-2 rounded-2xl border border-background/10 bg-background/[0.03] p-5 md:col-span-1 md:rounded-none md:border-0 md:bg-transparent md:p-0">
            <ColumnHeading id="footer-contact">Contact</ColumnHeading>
            <address aria-labelledby="footer-contact" className="mt-4 not-italic lg:mt-5">
              <ul className="space-y-1 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:space-y-0 md:block md:space-y-1 lg:space-y-3">
                {CONTACT_ITEMS.map(({ icon: Icon, label, text, href }) => {
                  const content = (
                    <>
                      <Icon className="mt-[0.2rem] size-4 shrink-0 text-gold" aria-hidden="true" />
                      <span className="sr-only">{label}: </span>
                      <span className="min-w-0 break-words">{text}</span>
                    </>
                  );
                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          className="flex items-start gap-3 rounded-lg py-2 text-sm text-background/70 transition-colors hover:text-gold-light focus-visible:text-gold-light focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline-none lg:py-0"
                        >
                          {content}
                        </a>
                      ) : (
                        <p className="flex items-start gap-3 py-2 text-sm text-background/70 lg:py-0">{content}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar — links first and copyright last on phones */}
      <div className="border-t border-background/10">
        <div className="container-page flex flex-col-reverse items-center gap-3 py-5 text-xs text-background/60 sm:flex-row sm:justify-between sm:gap-4 sm:py-6">
          <p>© {year} Wedora. All rights reserved.</p>
          <nav aria-label="Account and page" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={cn(linkClass, "text-xs")}>
                {link.label}
              </Link>
            ))}
            <a
              href="#main-content"
              className={cn(linkClass, "items-center gap-1 text-xs")}
              aria-label="Back to top of page"
            >
              Back to top
              <ArrowUpIcon className="size-3.5" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
