import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flash-Scarcity | Urgency-driven Shopify discounts",
  description: "Launch countdown campaigns that create urgency, increase conversions, and turn attention into revenue for Shopify stores.",
  metadataBase: new URL("https://flash-scarcity.com"),
  applicationName: "Flash-Scarcity",
  keywords: ["Shopify discounts", "urgency marketing", "countdown discount codes", "conversion optimization"],
  openGraph: {
    title: "Flash-Scarcity",
    description: "Convert more shoppers with time-sensitive discount campaigns built for Shopify.",
    type: "website",
    siteName: "Flash-Scarcity",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flash-Scarcity",
    description: "Urgency-driven Shopify promotions that convert attention into checkout.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#006d77",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
