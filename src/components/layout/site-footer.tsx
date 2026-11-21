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

const linkClass =
  "rounded-sm text-sm text-background/70 transition-colors hover:text-gold-light focus-visible:text-gold-light focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline-none";

function ColumnHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="font-sans text-xs font-semibold tracking-[0.2em] text-gold-light uppercase">
      {children}
    </h3>
  );
}

function LinkColumn({ id, title, links, className }: { id: string; title: string; links: FooterLink[]; className?: string }) {
  return (
    <nav aria-labelledby={id} className={className}>
      <ColumnHeading id={id}>{title}</ColumnHeading>
      <ul className="mt-5 space-y-3">
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
    <footer aria-labelledby="footer-heading" className="bg-night text-background">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-12 lg:gap-8 lg:py-16">
        {/* Brand */}
        <div className="lg:col-span-4 lg:pr-6">
          <Logo variant="white" imageClassName="h-16" height={64} />
          <p className="mt-5 max-w-sm text-sm leading-7 text-background/70">{siteConfig.description}</p>
          <ul className="mt-6 flex gap-2.5" aria-label="Wedora on social media">
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

        {/* Links + contact: two columns side by side on phones, four-part grid on desktop */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[1fr_1.3fr_1.5fr] lg:col-span-8 lg:grid-cols-[1fr_1.35fr_1.45fr] lg:gap-8">
          <LinkColumn id="footer-explore" title="Explore" links={EXPLORE_LINKS} />
          <LinkColumn id="footer-categories" title="Categories" links={CATEGORY_LINKS} />

          <div className="col-span-2 sm:col-span-1">
            <ColumnHeading id="footer-contact">Contact</ColumnHeading>
            <address aria-labelledby="footer-contact" className="mt-5 not-italic">
              <ul className="space-y-3.5">
                {CONTACT_ITEMS.map(({ icon: Icon, label, text, href }) => (
                  <li key={label} className="flex items-start gap-3 text-sm text-background/70">
                    <Icon className="mt-[0.2rem] size-4 shrink-0 text-gold" aria-hidden="true" />
                    <span className="sr-only">{label}: </span>
                    {href ? (
                      <a href={href} className={cn(linkClass, "break-all sm:break-normal")}>
                        {text}
                      </a>
                    ) : (
                      <span>{text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container-page flex flex-col items-center gap-4 py-6 text-xs text-background/60 sm:flex-row sm:justify-between">
          <p>© {year} Wedora. All rights reserved.</p>
          <nav aria-label="Account and page" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={cn(linkClass, "text-xs")}>
                {link.label}
              </Link>
            ))}
            <a
              href="#main-content"
              className={cn(linkClass, "inline-flex items-center gap-1 text-xs")}
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
