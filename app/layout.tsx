import type { Metadata, Viewport } from "next";
import { Syne, Outfit, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import Preloader from "@/components/ui/Preloader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Analytics from "@/components/Analytics";
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

// SEO: title kept to 48 chars, description to ~155 chars.
const seoTitle = "Nahiyan Ibn Ershad | Marketing & Growth Engineer";
const seoDescription =
  "Nahiyan Ibn Ershad, marketing specialist and growth engineer in Dhaka. I build high-converting websites, UGC video and marketing automation that drive revenue.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: seoTitle,
    template: "%s | Nahiyan Ibn Ershad",
  },
  description: seoDescription,
  keywords: [
    "Nahiyan Ibn Ershad",
    "marketing specialist Dhaka",
    "growth engineer",
    "UGC creator Bangladesh",
    "frontend developer Dhaka",
    "web design Bangladesh",
    "marketing strategy",
    "YAS Beyond Education",
    "SOP writing",
    "IELTS coaching Dhaka",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: seoTitle,
    description: seoDescription,
    url: site.url,
    locale: "en_US",
    images: [{ url: "/assets/preview.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: ["/assets/preview.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  } as Metadata["robots"],
  verification: {
    google: [
      "xhLQyKSVy3nBcgjJc6GLqrqCZSzmyue6Pd-cX8UMhzs",
      "4-A312FWmX0qV6cOmVcSnbFz4wNiDPLFVio_6Y78m6s",
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a1628" },
    { media: "(prefers-color-scheme: light)", color: "#f3f5fa" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Runs before paint to set the saved/system theme with no flash of the wrong mode.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Marketing Specialist & Growth Engineer",
  description: seoDescription,
  url: site.url,
  image: `${site.url}/assets/meman.webp`,
  email: `mailto:${site.email}`,
  telephone: site.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  worksFor: { "@type": "Organization", name: site.brand, url: site.url },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Independent University, Bangladesh",
  },
  knowsAbout: [
    "Digital Marketing",
    "Growth Engineering",
    "Frontend Development",
    "Content Strategy",
    "Marketing Automation",
    "Technical SEO",
  ],
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${outfit.variable} ${jb.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
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
