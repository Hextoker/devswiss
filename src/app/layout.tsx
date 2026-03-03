import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandPalette } from "@/components/CommandPalette";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/utils/siteUrl";

const inter = localFont({
  src: "../../public/fonts/Inter.var.woff2",
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const siteUrl = getSiteUrl();
const isProduction = process.env.NODE_ENV === "production";
const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const umamiScriptSrc = umamiUrl ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DevSwiss",
    template: "%s | DevSwiss",
  },
  description:
    "DevSwiss: La navaja suiza para desarrolladores. Herramientas de utilidad con privacidad total y procesamiento local 100% en el cliente.",
  openGraph: {
    title: "DevSwiss",
    description:
      "DevSwiss: La navaja suiza para desarrolladores. Herramientas de utilidad con privacidad total y procesamiento local 100% en el cliente.",
    url: "https://devswiss.cl",
    siteName: "DevSwiss",
    images: [
      {
        url: "https://devswiss.cl/api/og",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://devswiss.cl/api/og"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DevSwiss",
  description:
    "DevSwiss: La navaja suiza para desarrolladores. Herramientas de utilidad con privacidad total y procesamiento local 100% en el cliente.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: siteUrl,
  featureList: [
    "RUT Validator",
    "JSON Master",
    "Base64 Lab",
    "Cron Generator",
    "Regex Tester",
    "Hash Generator",
    "Glassmorphism Generator",
    "JWT Inspector",
    "Security Audit",
    "CORS Validator",
    "SVG Optimizer",
    "SQL Formatter",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {isProduction && umamiUrl && umamiWebsiteId ? (
          <Script
            data-website-id={umamiWebsiteId}
            src={umamiScriptSrc}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <CommandPalette />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
