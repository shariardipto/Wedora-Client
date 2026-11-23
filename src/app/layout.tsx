import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { MotionProvider } from "@/components/motion/motion-provider";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import "./globals.css";
// Plain CSS (no Tailwind directives), imported here so Turbopack tracks it directly.
import "./effects.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Wedding Planning Platform`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // Link previews (WhatsApp, Facebook, LinkedIn, X). No title or description here on purpose: Next.js then
  // takes each page's own, so a shared link previews as that page. The image is app/opengraph-image.jpg
  // (1200×630, kept small for WhatsApp); X reuses it as a large card.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", manrope.variable, cormorant.variable)}
      // html is scroll-smooth (globals.css). This tells Next.js to switch smoothing off while it resets
      // the scroll on navigation, so a new page opens at its top. Without it the reset is animated, gets
      // overridden, and a link clicked in the footer opened the next page at its bottom.
      data-scroll-behavior="smooth"
      // The inline script below adds "js" before hydration.
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint: "js" lets CSS hide GSAP-animated elements only when scripts actually run
            (no flash, no-JS safe); "intro-skip" keeps the home intro hidden when the page is opened at a
            section (e.g. /#how-it-works), see PageLoader. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js');if(location.pathname==='/'&&location.hash.length>1)d.classList.add('intro-skip')})()",
          }}
        />
      </head>
      <body className="flex min-h-svh flex-col">
        <MotionProvider>{children}</MotionProvider>
        {/* Bottom-right keeps toasts clear of the floating navbar pill (full-width at the bottom on phones). */}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
