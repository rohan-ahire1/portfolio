import type { Metadata } from "next";
import { Archivo_Black, Newsreader, Space_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Rohan Ahire — Builder · Systems · Product",
  description:
    "Personal portfolio: Flaggo, Coachmate, Multibagger, Extracta, WhatsApp Cleaner, Clenow NSE. Games, quant, AI, mobile.",
  openGraph: {
    title: "Rohan Ahire — Builder",
    description: "Six selected builds — games, quant, AI, mobile.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="grain antialiased">{children}</body>
    </html>
  );
}
