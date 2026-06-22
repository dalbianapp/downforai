import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/lib/posthog";
import Script from "next/script";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://downforai.com"),
  title: "AI Service Status Monitor for 800+ Tools | DownForAI",
  description:
    "Track outages, status, and response times for 800+ AI services — from major LLMs to niche AI tools most trackers miss.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DownForAI",
    title: "AI Service Status Monitor for 800+ Tools | DownForAI",
    description:
      "Track outages, status, and response times for 800+ AI services — from major LLMs to niche AI tools most trackers miss.",
    url: "https://downforai.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Service Status Monitor for 800+ Tools | DownForAI",
    description:
      "Track outages, status, and response times for 800+ AI services — from major LLMs to niche AI tools most trackers miss.",
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3550609846480994"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
      >
        <PostHogProvider>
          <Header />
          <main className="min-h-screen">
            <div className="max-w-[1200px] mx-auto px-4 py-8">{children}</div>
          </main>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </PostHogProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ERM2ZXFVRY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ERM2ZXFVRY');
          `}
        </Script>
      </body>
    </html>
  );
}
