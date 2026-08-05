// ═══════════════════════════════════════════════════════════════
//  Services — presented as a buyer's journey.
//  Each service walks the visitor through:
//    ① how to do it yourself   ② why work with me   ③ pricing
//  Prices are stored in BDT; the UI converts on the fly.
//  Copy is kept em-dash free, in Nahiyan's own voice.
// ═══════════════════════════════════════════════════════════════

export const currencies = {
  BDT: { symbol: "৳", rate: 1 },
  SAR: { symbol: "﷼", rate: 1 / 32.65 },
  USD: { symbol: "$", rate: 1 / 122.4375 },
} as const;

export type CurrencyCode = keyof typeof currencies;

export type IconKey =
  | "cv"
  | "sop"
  | "ielts"
  | "content"
  | "web"
  | "skills"
  | "card"
  | "leads";

export interface Tier {
  label: string;
  bdt: number;
}

export interface Service {
  id: string;
  verb: string; // action-led title, e.g. "Craft your CV"
  teaser: string; // one line under the title
  blurb: string; // short intro when expanded
  icon: IconKey;
  featured?: boolean;
  badge?: string;
  cta: string;
  diy: string[]; // "Do it yourself" steps
  why: string[]; // "Why work with me" points
  tiers: Tier[];
}

export const services: Service[] = [
  {
    id: "cv_writing",
    verb: "Craft your CV",
    teaser: "ATS-ready, recruiter-approved, and built around you.",
    blurb:
      "A CV that gets past the filters and onto the desk of a human who wants to meet you.",
    icon: "cv",
    featured: true,
    badge: "MOST POPULAR",
    cta: "Craft my CV",
    diy: [
      "Draft your content in Word or Canva first, then move to LaTeX using Overleaf for clean, consistent formatting.",
      "Upload your CV to an AI tool and ask it to make the wording and structure ATS friendly.",
      "Keep iterating with the AI on keywords and layout until it matches the role you want.",
    ],
    why: [
      "I built 160+ CVs last week alone, so repetition makes me fast and precise.",
      "I also help recruit, so I write CVs catered to the exact job you are targeting.",
      "I use the keywords recruiters look for and the metrics that make you stand out.",
    ],
    tiers: [
      { label: "Basic, 1 Page", bdt: 150 },
      { label: "Standard, 2 Pages + Cover Letter", bdt: 350 },
      { label: "Premium, Full Package + LinkedIn", bdt: 750 },
    ],
  },
  {
    id: "sop_writing",
    verb: "Craft your SOP",
    teaser: "The essay that turns an application into an admission.",
    blurb:
      "A Statement of Purpose that reads like you, and says exactly what the committee needs to hear.",
    icon: "sop",
    cta: "Start my SOP",
    diy: [
      "Brain-dump your goals, your story and why this exact program fits before you write a line.",
      "Use an AI tool to shape it into a clear intro, body and closing, then fact-check every claim yourself.",
      "Read it out loud and cut anything that does not move your story forward.",
    ],
    why: [
      "I know what admissions committees actually respond to, and I write straight to that.",
      "We brainstorm your angle together, so the story is genuinely yours and not a template.",
      "Unlimited revisions on the premium tier means we polish until it lands.",
    ],
    tiers: [
      { label: "Draft, 1 revision", bdt: 1500 },
      { label: "Standard, 3 revisions", bdt: 2500 },
      { label: "Premium, Unlimited revisions", bdt: 4500 },
    ],
  },
  {
    id: "ielts_training",
    verb: "Ace your IELTS",
    teaser: "A focused plan to hit your target band, fast.",
    blurb:
      "Practice built around your weak modules, not a generic syllabus, so every session moves your score.",
    icon: "ielts",
    cta: "Book a free session",
    diy: [
      "Take a free practice test to find your real starting band in each of the four modules.",
      "Drill speaking and listening every day with free resources like the British Council app.",
      "Time every reading and writing task, then review your mistakes honestly.",
    ],
    why: [
      "Your first 3 classes are free, so you feel the improvement before you pay anything.",
      "We build the plan around your weakest modules instead of a one-size syllabus.",
      "Speaking and listening improve quickly with the right coaching, and I focus there first.",
    ],
    tiers: [
      { label: "Starter, 4 sessions", bdt: 2000 },
      { label: "Serious, 10 sessions", bdt: 4000 },
      { label: "Premium, 20 sessions + mock tests", bdt: 7000 },
    ],
  },
  {
    id: "content_strategy",
    verb: "Grow your brand",
    teaser: "Videography, SEO and editing that actually converts.",
    blurb:
      "Content engineered to sell, not just to look good, from the first idea to the posted asset.",
    icon: "content",
    cta: "Grow my brand",
    diy: [
      "Pick one platform and post consistently before you worry about being everywhere.",
      "Hook viewers in the first 3 seconds, then batch-film and edit with free tools like CapCut.",
      "Track what performs and double down on the formats that actually work.",
    ],
    why: [
      "I produced 30+ high-converting UGC campaigns, and one hit a 95% conversion rate.",
      "I pair consumer psychology with real analytics, so content is built to convert.",
      "You get strategy and production in one place, from concept to posted asset.",
    ],
    tiers: [
      { label: "Strategy, Roadmap only", bdt: 3600 },
      { label: "Production, 4 pieces per month", bdt: 7200 },
      { label: "Full Campaign, Strategy + Production", bdt: 15000 },
    ],
  },
  {
    id: "portfolio_website",
    verb: "Build your website",
    teaser: "A fast, modern site that makes opportunities come to you.",
    blurb:
      "A high-conversion site designed and built together, optimized for speed and search from day one.",
    icon: "web",
    cta: "Build my site",
    diy: [
      "Sketch the pages you actually need, then start from a template on Framer, Webflow or Next.js.",
      "Keep it fast: compress your images, use clean fonts, and cut anything that does not earn its place.",
      "Write copy that speaks to one clear audience and points to one clear action.",
    ],
    why: [
      "I build high-conversion frontends and tune them for speed and technical SEO.",
      "Design and development happen together, so nothing gets lost in the handoff.",
      "This very site, and 10+ others in my work, are proof of the standard you get.",
    ],
    tiers: [
      { label: "Basic, 3 pages", bdt: 5000 },
      { label: "Standard, 5 pages + blog", bdt: 10000 },
      { label: "Premium, Full site + SEO + maintenance", bdt: 15000 },
    ],
  },
  {
    id: "digital_literacy",
    verb: "Level up your team",
    teaser: "Hands-on training in AI, automation and modern marketing.",
    blurb:
      "Practical modules on the tools your team already pays for, so the skills actually stick.",
    icon: "skills",
    cta: "Train my team",
    diy: [
      "Pick one tool your team uses daily and go deep before adding anything new.",
      "Practice on real tasks, not tutorials, so the skill sticks the first time.",
      "Document the workflow so the whole team can repeat it without you.",
    ],
    why: [
      "I build automated workflows and CRM systems for real businesses, not slideware.",
      "Every module is tailored to your team and the exact tools you already use.",
      "You leave with systems you can run yourself, not a dependency on me.",
    ],
    tiers: [
      { label: "Starter, 1 module", bdt: 500 },
      { label: "Standard, 3 modules", bdt: 1250 },
      { label: "Comprehensive, Full curriculum", bdt: 2500 },
    ],
  },
  {
    id: "digital_cards",
    verb: "Design your card",
    teaser: "Share your whole profile with one tap or scan.",
    blurb:
      "A clean NFC and QR setup with a microsite, built to turn a handshake into a saved contact.",
    icon: "card",
    cta: "Get my card",
    diy: [
      "Grab a free QR generator and point it at a simple, single-purpose landing page.",
      "Keep the card to one clear action, like save contact or book a call.",
      "Test it on a real phone before you print or share anything.",
    ],
    why: [
      "You get a polished NFC and QR profile with a microsite, not just a bare link.",
      "It is built to convert a first meeting into a saved contact or a booking.",
      "Built-in analytics show you who is actually engaging with your card.",
    ],
    tiers: [
      { label: "Basic, QR Card", bdt: 500 },
      { label: "Standard, NFC + Microsite", bdt: 1200 },
      { label: "Premium, Full Profile + Analytics", bdt: 2500 },
    ],
  },
  {
    id: "partnership_outreach",
    verb: "Generate your leads",
    teaser: "AI-powered outreach that fills your pipeline with intent.",
    blurb:
      "Targeted, personalized outreach at scale, so you spend your time talking to the right people.",
    icon: "leads",
    cta: "Generate leads",
    diy: [
      "Define your ideal customer clearly before you send a single message.",
      "Use tools like Clay and Apollo to build a targeted list, then personalize the first line.",
      "Follow up consistently, because most replies come after the second or third touch.",
    ],
    why: [
      "I engineer inbound lead-scoring systems and scaled lead capture by 90% at Global Pathways.",
      "Leads are targeted to your niche and geography, so you reach the right people.",
      "Outreach is personalized at scale, never spray and pray.",
    ],
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

export function minTier(tiers: Tier[]): number {
  return Math.min(...tiers.map((t) => t.bdt));
}
