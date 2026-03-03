import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://downforai.com"),
  title: "DownForAI — Real-Time AI Service Status Monitor",
  description:
    "Real-time status monitoring for 200+ AI services. Check if ChatGPT, Claude, Gemini, Midjourney, and more are down right now.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DownForAI",
    title: "DownForAI — Real-Time AI Service Status Monitor",
    description: "Real-time status monitoring for 200+ AI services.",
    url: "https://downforai.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "DownForAI — Real-Time AI Service Status Monitor",
    description: "Real-time status monitoring for 200+ AI services.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>↓</text></svg>",
  },
  verification: {
    google: 'LP46Cg3vInGMNfgJiWuY5T0lkt3Saxl05UP0n8nB_Xo',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} antialiased`}
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
      >
        <Header />
        <main className="min-h-screen">
          <div className="max-w-[1200px] mx-auto px-4 py-8">{children}</div>
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
