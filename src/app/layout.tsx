import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wedora — Wedding Planning Platform",
    template: "%s | Wedora",
  },
  description:
    "Discover trusted wedding vendors, compare services and request bookings — all in one place.",
  applicationName: "Wedora",
};

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
