import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react";
import { AnimatedLogo } from "@/components/brand/animated-logo";
import { SocialIcon } from "@/components/brand/social-icon";
import { SectionHeading } from "@/components/home/section-heading";
import { GoldDust } from "@/components/motion/gold-dust";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { SERVICE_CATEGORIES, categoryHref } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { FooterShell } from "./footer-shell";
import { FooterWordmark } from "./footer-wordmark";

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

/** A four-point gold star, the ornament between the invitation and the links. */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z"
      />
    </svg>
  );
}

function ColumnHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="flex items-center gap-2.5 font-sans text-xs font-semibold tracking-[0.22em] text-gold-light uppercase"
    >
      <span aria-hidden="true" className="size-1.5 rotate-45 bg-gold" />
      {children}
    </h3>
  );
}

function LinkColumn({ id, title, links, className }: { id: string; title: string; links: FooterLink[]; className?: string }) {
  return (
    <nav data-reveal data-f-item aria-labelledby={id} className={cn("min-w-0", className)}>
      <ColumnHeading id={id}>{title}</ColumnHeading>
      <ul className="mt-5 space-y-1.5 lg:space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {/* Hover: a gold dash slides in and the label steps aside (styles in effects.css). */}
            <Link href={link.href} className="footer-link py-1 text-sm lg:py-0.5">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * "Back to top" as a seal on the closing rule: lettering turns slowly around a gold arrow. The
 * lettering is a decorative sibling laid over the link (not inside it), so the link's name is just
 * "Back to top" and the whole seal stays clickable.
 */
function BackToTop({ className }: { className?: string }) {
  return (
    <Magnetic strength={0.3} className={cn("group relative size-[5.5rem]", className)}>
      <a
        href="#main-content"
        className="grid size-full place-items-center rounded-full bg-night ring-1 ring-gold/30 transition-shadow duration-500 hover:shadow-[0_0_44px_-6px_rgb(220_191_142/0.55)] focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none"
      >
        <span className="grid size-10 place-items-center rounded-full bg-gold-light text-night shadow-[0_8px_24px_-8px_rgb(220_191_142/0.8)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
          <ArrowUpIcon className="size-4" aria-hidden="true" />
        </span>
        <span className="sr-only">Back to top</span>
      </a>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="footer-seal-ring pointer-events-none absolute inset-0 size-full">
        <defs>
          <path id="footer-seal-path" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" />
        </defs>
        <text className="fill-gold-light font-sans text-[9.5px] font-semibold uppercase">
          <textPath href="#footer-seal-path" textLength="231" lengthAdjust="spacing">
            Back to top · Back to top ·
          </textPath>
        </text>
      </svg>
    </Magnetic>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <FooterShell
      aria-labelledby="footer-heading"
      data-nav-theme="dark"
      className="grain relative isolate overflow-hidden rounded-t-[2rem] bg-night text-background sm:rounded-t-[3rem] lg:rounded-t-[4.5rem]"
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      {/* Backdrop: the hero's golden-hour palette, slow glows, twinkling dust and a gold edge-light. */}
      <div aria-hidden="true" className="footer-backdrop absolute inset-0 -z-10" />
      <span aria-hidden="true" className="orb orb-gold -top-56 left-1/2 size-[30rem] -translate-x-1/2 sm:size-[44rem]" />
      <span aria-hidden="true" className="orb orb-blush -bottom-48 -left-48 size-[30rem] opacity-25!" />
      <GoldDust count={22} className="bottom-auto -z-10 h-[55%]" />
      <span aria-hidden="true" className="footer-edge" />

      {/* 1 · The closing invitation */}
      <div className="container-page pt-20 sm:pt-24 lg:pt-28">
        <SectionHeading
          eyebrow="Begin your story"
          title={
            <>
              Every love story deserves a <span className="text-shimmer italic">beautiful</span> beginning
            </>
          }
          description={siteConfig.description}
          tone="light"
          className="max-w-3xl"
          titleClassName="lg:text-6xl"
        />
        <div
          data-reveal
          data-f-item
          className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
        >
          <Magnetic>
            <Button
              asChild
              size="lg"
              className="shine group h-12 w-full rounded-full bg-gold-light px-7 text-base text-night shadow-[0_10px_40px_-12px_rgb(220_191_142/0.75)] hover:bg-gold-light sm:w-auto"
            >
              <Link href="/services">
                Explore Vendors
                <ArrowRightIcon data-icon="inline-end" className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-background/25 bg-background/5 px-7 text-base text-background backdrop-blur-sm hover:border-gold-light hover:bg-background/10 hover:text-background sm:w-auto"
            >
              <Link href="/#how-it-works">How It Works</Link>
            </Button>
          </Magnetic>
        </div>
      </div>

      {/* Ornament: two rules draw outward from a gold star. */}
      <div aria-hidden="true" className="container-page mt-16 flex items-center gap-4 sm:mt-20">
        <span data-f-rule="end" className="h-px flex-1 bg-linear-to-l from-gold/60 to-transparent" />
        <Sparkle className="footer-star size-4 text-gold" />
        <span data-f-rule="start" className="h-px flex-1 bg-linear-to-r from-gold/60 to-transparent" />
      </div>

      {/* 2 · Brand, links and contact */}
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-12 py-14 sm:py-16 md:grid-cols-3 md:gap-x-8 lg:grid-cols-12 lg:gap-8 lg:py-20">
        {/* Brand: centred on phones, a row on tablets, a column on desktop. */}
        <div
          data-reveal
          data-f-item
          className="col-span-2 flex flex-col items-center text-center md:col-span-3 md:flex-row md:justify-between md:text-left lg:col-span-4 lg:flex-col lg:items-start lg:justify-start lg:pr-4"
        >
          <div className="flex flex-col items-center md:items-start">
            {/* Animated logo, looping at half speed (pauses off-screen). While centred, it is optically
                centred on its wordmark (the flourish makes the artwork asymmetric). */}
            <Link
              href="/"
              aria-label="Wedora home"
              className="inline-flex shrink-0 items-center rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <AnimatedLogo
                mode="loop"
                speed={0.5}
                className="h-16 -translate-x-[16%] md:translate-x-0"
                wordClassName="fill-white"
              />
            </Link>
            <p className="mt-4 font-display text-xl text-gold-light/90 italic lg:text-lg xl:text-xl">{siteConfig.tagline}</p>
          </div>
          <ul className="mt-6 flex shrink-0 gap-2.5 md:mt-0 lg:mt-8" aria-label="Wedora on social media">
            {siteConfig.socials.map((social) => (
              <li key={social.name}>
                <Magnetic strength={0.35}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.name} (opens in a new tab)`}
                    className="grid size-11 place-items-center rounded-full border border-background/15 bg-background/[0.04] text-background/80 transition-[color,background-color,border-color,box-shadow] duration-300 hover:border-gold-light hover:bg-gold-light hover:text-night hover:shadow-[0_10px_30px_-10px_rgb(220_191_142/0.8)] focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none"
                  >
                    <SocialIcon name={social.name} />
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </div>

        <LinkColumn id="footer-explore" title="Explore" links={EXPLORE_LINKS} className="lg:col-span-2" />
        <LinkColumn id="footer-categories" title="Categories" links={CATEGORY_LINKS} className="lg:col-span-3" />

        {/* Contact: email and phone are links; each row has a gold icon chip. */}
        <div data-reveal data-f-item className="col-span-2 min-w-0 md:col-span-1 lg:col-span-3">
          <ColumnHeading id="footer-contact">Get in touch</ColumnHeading>
          <address aria-labelledby="footer-contact" className="mt-5 not-italic">
            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-1">
              {CONTACT_ITEMS.map(({ icon: Icon, label, text, href }) => {
                const content = (
                  <>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold-light ring-1 ring-gold/25 transition-colors duration-300 group-hover/contact:bg-gold-light group-hover/contact:text-night">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.65rem] font-semibold tracking-[0.18em] text-background/55 uppercase">
                        {label}
                      </span>
                      <span className="block text-sm break-words text-background/80 transition-colors duration-300 group-hover/contact:text-gold-light">
                        {text}
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className="group/contact flex items-center gap-3 rounded-2xl focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none"
                      >
                        {content}
                      </a>
                    ) : (
                      <p className="flex items-center gap-3">{content}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </address>
        </div>
      </div>

      {/* 3 · The brand's own letters, written large */}
      <div className="container-page">
        <FooterWordmark />
      </div>

      {/* 4 · The closing rule with the back-to-top seal; account links and copyright beside it */}
      <div className="container-page pt-10 pb-8 sm:pt-14 sm:pb-10">
        <div className="relative grid grid-cols-1 justify-items-center gap-5 text-xs text-background/60 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-6">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[2.75rem] h-px bg-linear-to-r from-transparent via-gold/35 to-transparent"
          />
          <p className="order-3 sm:order-none sm:justify-self-start">© {year} Wedora. All rights reserved.</p>
          <BackToTop className="relative" />
          <nav
            aria-label="Account"
            className="order-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 sm:order-none sm:justify-self-end"
          >
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="footer-link py-1 text-xs">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </FooterShell>
  );
}
