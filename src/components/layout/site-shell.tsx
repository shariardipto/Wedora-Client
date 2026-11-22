import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Public page chrome: skip link, sticky navbar, main landmark, footer and smooth scrolling. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <a
        href="#main-content"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 scroll-mt-24 flex-col overflow-x-clip">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
