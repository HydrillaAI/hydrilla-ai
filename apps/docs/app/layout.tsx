// Touch this app so its Vercel project builds again.
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DocsChrome } from "@/components/DocsChrome";
import { SITE } from "@/lib/site";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  adjustFontFallback: true,
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.docsUrl),
  title: {
    default: "Hydrilla AI Developer API Documentation",
    template: "%s · Hydrilla API Docs",
  },
  description:
    "Official developer documentation for Hydrilla AI: 3D reconstruction, text-to-3D and image-to-3D pipelines, 2D concept generation, and account APIs.",
  applicationName: "Hydrilla API Docs",
  icons: {
    icon: "/favicon.png?v=2",
    shortcut: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  },
  openGraph: {
    type: "website",
    siteName: "Hydrilla API Docs",
    url: SITE.docsUrl,
    title: "Hydrilla AI Developer API Documentation",
    description:
      "Official developer documentation for Hydrilla AI: 3D reconstruction, text-to-3D and image-to-3D pipelines, 2D concept generation, and account APIs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hydrilla AI Developer API Documentation",
    description: "Build 3D and 2D generation into your product with the Hydrilla API.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem("hyd-theme")||"system";var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var d=t==="dark"||(t==="system"&&m);document.documentElement.setAttribute("data-theme",d?"dark":"light");document.documentElement.classList.toggle("dark",d);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.png?v=2" type="image/png" />
      </head>
      <body className={sans.className}>
        <DocsChrome>{children}</DocsChrome>
      </body>
    </html>
  );
}
