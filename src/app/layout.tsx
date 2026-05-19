import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smilefinder.example"),
  title: {
    default: "SmileFinder — US Dentist Directory",
    template: "%s | SmileFinder",
  },
  description:
    "Find the right dentist for you. Browse verified US dentists by city, state, and specialty. Read reviews and book with practices accepting new patients today.",
  keywords: [
    "dentist directory",
    "find a dentist",
    "dental care",
    "orthodontist",
    "pediatric dentist",
    "cosmetic dentistry",
  ],
  openGraph: {
    title: "SmileFinder — US Dentist Directory",
    description:
      "Find the right dentist for you. Browse verified US dentists by city, state, and specialty.",
    url: "https://smilefinder.example",
    siteName: "SmileFinder",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmileFinder — US Dentist Directory",
    description:
      "Find the right dentist for you. Browse verified US dentists by city, state, and specialty.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "kW8RL0-67PA5yx1WXf9OGDhAa1y0fj1dqE5KkgvOAVM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
