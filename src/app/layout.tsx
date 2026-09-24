import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { Providers } from "@/components/providers/Providers";
import { SITE, SOCIAL } from "@/content/social";
import { en } from "@/i18n/dictionaries/en";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: en.meta.title,
  description: en.meta.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SOCIAL.github.href }],
  creator: SITE.name,
  keywords: [
    "Cristian Molina",
    "software engineer",
    "AI engineer",
    "machine learning",
    "cloud architecture",
    "data engineering",
    "portfolio",
  ],
  alternates: {
    canonical: "/",
    languages: { en: "/", es: "/?lang=es" },
  },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: SITE.name,
    title: en.meta.title,
    description: en.meta.description,
    locale: "en_US",
    alternateLocale: ["es_ES"],
    firstName: "Cristian",
    lastName: "Molina",
  },
  twitter: {
    card: "summary_large_image",
    title: en.meta.title,
    description: en.meta.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030304" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} dark`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
