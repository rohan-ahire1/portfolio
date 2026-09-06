import type { Metadata } from "next";
import { Archivo_Black, Newsreader, Space_Mono } from "next/font/google";
import { site } from "@/lib/content";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Newsreader({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = "https://rohanahire.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rohan Ahire — Builder · Systems · Product",
  description:
    "Personal portfolio: Flaggo, Coachmate, Multibagger, Extracta, WhatsApp Cleaner, Clenow NSE. Games, quant, AI, mobile.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Rohan Ahire — Builder",
    description: "Six selected builds — games, quant, AI, mobile.",
    type: "website",
    url: siteUrl,
    siteName: "Rohan Ahire",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Rohan Ahire — Builder · Systems · Product",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rohan Ahire — Builder",
    description: "Six selected builds — games, quant, AI, mobile.",
    images: ["/og.png"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: siteUrl,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  jobTitle: site.role,
  description: site.tagline,
  sameAs: [site.github, site.linkedin],
  knowsAbout: [
    "Next.js",
    "TypeScript",
    "Python",
    "Polars",
    "Rust",
    "React Native",
    "Quantitative trading",
    "Chess engines",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="grain antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
