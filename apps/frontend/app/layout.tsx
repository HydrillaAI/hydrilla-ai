// Touch this app so its Vercel project builds again.
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ClientProviders } from "../components/ClientProviders";
import { ConditionalNavbar } from "../components/layout/ConditionalNavbar";
import { CLERK_JS_VERSION, clerkPreconnectHost } from "@/lib/clerkConfig";
import { DM_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
// Variable DM Sans — same family as Google Fonts
// (ital, opsz 9–40, wght 100–1000). Self-hosted by next/font.
// Omit `weight` so the wght axis stays open; `opsz` tracks font-size.
const dmSans = DM_Sans({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});
// Italic is only used on article/research pages, so it is not preloaded:
// a 76 KB preload on every page competes with the hero on slow mobile networks.
const dmSansItalic = DM_Sans({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  variable: "--font-dm-sans-italic",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hydrillaai",
    creator: "@hydrillaai",
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const clerkHost = clerkPreconnectHost();

  return (
    <ClerkProvider
      clerkJSVersion={CLERK_JS_VERSION}
      appearance={{
        elements: {
          footer: "hidden",
          footerPages: "hidden",
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/app/studio"
      signUpFallbackRedirectUrl="/app/studio"
    >
    <html lang="en" className={`${dmSans.variable} ${dmSansItalic.variable} ${GeistSans.variable}`} suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
          {/* S3 outputs only load in the app, so warm DNS only (a full preconnect goes unused on marketing pages). */}
          <link rel="dns-prefetch" href="https://hydrilla-outputs-1.s3.amazonaws.com" />
          {/* No crossorigin: Clerk's chunks and credentialed API calls use the non-CORS connection pool. */}
          <link rel="preconnect" href={clerkHost} />
          <link rel="dns-prefetch" href={clerkHost} />
        </head>
        <body className="min-h-screen">
          <ClientProviders>
            <ConditionalNavbar />
            <main>{children}</main>
          </ClientProviders>
          <Analytics />
          <SpeedInsights />
          <GoogleAnalytics />
      </body>
    </html>
    </ClerkProvider>
  );
}
