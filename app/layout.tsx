import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nebiyu Haile - Portfolio",
    template: "%s | Nebiyu Haile",
  },
  description:
    "Software Engineer & Data Science Researcher - Interactive orbital portfolio showcasing projects, experience, and skills in 3D web development, machine learning, and modern frontend technologies.",
  keywords: [
    "Software Engineer",
    "Data Science",
    "React",
    "Three.js",
    "Portfolio",
    "3D Web Development",
    "Machine Learning",
    "Frontend Developer",
    "TypeScript",
    "Next.js",
  ],
  authors: [{ name: "Nebiyu Haile" }],
  creator: "Nebiyu Haile",
  publisher: "Nebiyu Haile",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL("https://nebiyu-portfolio.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nebiyu-portfolio.vercel.app",
    title: "Nebiyu Haile - Software Engineer & Data Science Researcher",
    description:
      "Interactive orbital portfolio showcasing projects, experience, and skills in 3D web development, machine learning, and modern frontend technologies.",
    siteName: "Nebiyu Haile Portfolio",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Nebiyu Haile - Software Engineer Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nebiyu Haile - Software Engineer & Data Science Researcher",
    description:
      "Interactive orbital portfolio showcasing projects, experience, and skills in 3D web development and machine learning.",
    images: ["/og-image.png"],
    creator: "@nebiyu_haile",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: { google: "your-google-verification-code" },
  category: "technology",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Nebiyu Haile",
              jobTitle: "Software Engineer & Data Science Researcher",
              description:
                "Software Engineer specializing in 3D web development, machine learning, and modern frontend technologies.",
              url: "https://nebiyu-portfolio.vercel.app",
              sameAs: [
                "https://linkedin.com/in/nebiyu-haile",
                "https://github.com/nebiyu-haile",
                "https://twitter.com/nebiyu_haile",
              ],
              knowsAbout: [
                "Software Engineering",
                "Data Science",
                "Machine Learning",
                "3D Web Development",
                "React",
                "Three.js",
                "TypeScript",
                "Next.js",
              ],
            }),
          }}
        />
      </head>
      {/* Orbital view owns its viewport; Scroll view uses document flow. */}
      <body
        className={`min-h-dvh w-full bg-[#0b1220] text-white antialiased ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
