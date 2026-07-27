import type { Metadata, Viewport } from "next";
import { Syne, Outfit, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import Preloader from "@/components/ui/Preloader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import "./components.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});
const jb = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}, Marketing Specialist, Growth Engineer & Creator`,
    template: `%s, ${site.name}`,
  },
  description: site.intro,
  keywords: [
    "Nahiyan Ibn Ershad",
    "marketing specialist Dhaka",
    "growth engineer",
    "UGC creator Bangladesh",
    "frontend developer",
    "portfolio",
    "YAS Beyond Education",
    "SOP writing",
    "CV writing",
    "IELTS coaching Dhaka",
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name}, Marketing Specialist, Growth Engineer & Creator`,
    description: site.intro,
    url: site.url,
    locale: "en_US",
    images: [{ url: "/assets/preview.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}, Marketing, Growth & Creative`,
    description: site.intro,
    images: ["/assets/preview.jpg"],
  },
  robots: { index: true, follow: true },
  verification: { google: "xhLQyKSVy3nBcgjJc6GLqrqCZSzmyue6Pd-cX8UMhzs" },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Marketing Specialist & Growth Engineer",
  url: site.url,
  email: `mailto:${site.email}`,
  telephone: site.phone,
  address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
  worksFor: { "@type": "Organization", name: site.brand },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${outfit.variable} ${jb.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Preloader />
        <Cursor />
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
