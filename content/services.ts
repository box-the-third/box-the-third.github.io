// ═══════════════════════════════════════════════════════════════
//  Services & pricing  (ported 1:1 from the legacy site).
//  Prices are stored in BDT; the UI converts on the fly.
// ═══════════════════════════════════════════════════════════════

export const currencies = {
  BDT: { symbol: "৳", rate: 1 },
  SAR: { symbol: "﷼", rate: 1 / 32.65 },
  USD: { symbol: "$", rate: 1 / 122.4375 },
} as const;

export type CurrencyCode = keyof typeof currencies;

export interface Tier {
  label: string;
  bdt: number;
}

export interface Service {
  id: string;
  title: string;
  blurb: string;
  featured?: boolean;
  badge?: string;
  cta: string;
  tiers: Tier[];
}

export const services: Service[] = [
  {
    id: "cv_writing",
    title: "CV Writing",
    blurb:
      "ATS-ready CVs with quantifiable metrics, 100% human-built after a personal consultation. We do everything we can to get you interviews.",
    featured: true,
    badge: "MOST POPULAR",
    cta: "Get My CV Done",
    tiers: [
      { label: "Basic, 1 Page", bdt: 150 },
      { label: "Standard, 2 Pages + Cover Letter", bdt: 350 },
      { label: "Premium, Full Package + LinkedIn", bdt: 750 },
    ],
  },
  {
    id: "sop_writing",
    title: "University App & SOP",
    blurb:
      "A winning Statement of Purpose is the gateway to scholarships abroad. We brainstorm, draft, and polish your story until it lands.",
    cta: "Start My SOP",
    tiers: [
      { label: "Draft, 1 revision", bdt: 1500 },
      { label: "Standard, 3 revisions", bdt: 2500 },
      { label: "Premium, Unlimited revisions", bdt: 4500 },
    ],
  },
  {
    id: "ielts_training",
    title: "IELTS Training",
    blurb:
      "Practice all four modules, Listening, Reading, Writing and Speaking, with a personalized study plan built around your target score.",
    cta: "Book a Free Session",
    tiers: [
      { label: "Starter, 4 sessions", bdt: 2000 },
      { label: "Serious, 10 sessions", bdt: 4000 },
      { label: "Premium, 20 sessions + mock tests", bdt: 7000 },
    ],
  },
  {
    id: "content_strategy",
    title: "Content Strategy & Creation",
    blurb:
      "Videography, SEO, video editing and analytics, a 360° approach to digital storytelling that actually converts.",
    cta: "Grow My Brand",
    tiers: [
      { label: "Strategy, Roadmap only", bdt: 3600 },
      { label: "Production, 4 pieces/month", bdt: 7200 },
      { label: "Full Campaign, Strategy + Production", bdt: 15000 },
    ],
  },
  {
    id: "portfolio_website",
    title: "Portfolio Website",
    blurb:
      "Custom-built, responsive, modern sites that showcase your work and attract opportunities. Design + development included.",
    cta: "Build My Site",
    tiers: [
      { label: "Basic, 3 pages", bdt: 5000 },
      { label: "Standard, 5 pages + blog", bdt: 10000 },
      { label: "Premium, Full site + SEO + maintenance", bdt: 15000 },
    ],
  },
  {
    id: "digital_literacy",
    title: "Digital Literacy",
    blurb:
      "Digital marketing, AI tools, automation, custom CRM and partnership outreach, hands-on modules tailored to your team.",
    cta: "Train Your Team",
    tiers: [
      { label: "Starter, 1 module", bdt: 500 },
      { label: "Standard, 3 modules", bdt: 1250 },
      { label: "Comprehensive, Full curriculum", bdt: 2500 },
    ],
  },
  {
    id: "digital_cards",
    title: "Digital Business Cards",
    blurb:
      "Professional digital cards with QR codes, NFC-enabled profiles and a full online presence setup. Share instantly.",
    cta: "Get My Card",
    tiers: [
      { label: "Basic, QR Card", bdt: 500 },
      { label: "Standard, NFC + Microsite", bdt: 1200 },
      { label: "Premium, Full Profile + Analytics", bdt: 2500 },
    ],
  },
  {
    id: "partnership_outreach",
    title: "Partnership Outreach",
    blurb:
      "AI-powered lead generation targeting your niche and geography. High-intent leads with personalized outreach strategies.",
    cta: "Generate Leads",
    tiers: [
      { label: "Startup, 50 leads", bdt: 5000 },
      { label: "Growth, 150 leads", bdt: 12000 },
      { label: "Enterprise, 500+ leads", bdt: 30000 },
    ],
  },
];

export const testimonials = [
  {
    quote:
      "My SOP was completely transformed. Nahiyan understood exactly what the admission committee wanted. Got into my first-choice university in the UK.",
    name: "Alifa Z.",
    role: "BA, University of Greenwich",
  },
  {
    quote: "The CV he built me landed me that promotion. It was on the money.",
    name: "Arif H.",
    role: "Software Engineer, Dhaka",
  },
  {
    quote:
      "The IELTS prep was focused and no-nonsense. Hit my target band of 7.5 on the first attempt. Couldn't have done it without your help!",
    name: "Fatima A.",
    role: "Medical Professional, Riyadh",
  },
  {
    quote:
      "Multiple revisions until my CV stood out. Got me an interview at my dream company!",
    name: "Jabid",
    role: "Student, Jeddah",
  },
];

export function formatPrice(bdt: number, code: CurrencyCode): string {
  const { symbol, rate } = currencies[code];
  const val = bdt * rate;
  const rounded = code === "BDT" ? Math.round(val) : Math.round(val * 100) / 100;
  return `${symbol}${rounded.toLocaleString("en-US", {
    minimumFractionDigits: code === "BDT" ? 0 : 2,
    maximumFractionDigits: code === "BDT" ? 0 : 2,
  })}`;
}
