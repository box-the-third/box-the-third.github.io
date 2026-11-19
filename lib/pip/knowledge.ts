// ═══════════════════════════════════════════════════════════════
//  Temu Bhodbhar's knowledge: what he can answer about the site.
//  Every answer is built from the content files (site, services, FAQ,
//  courses), so editing the copy there keeps his answers up to date.
//  Anything he can't match falls back to Nahiyan's email.
// ═══════════════════════════════════════════════════════════════

import { site } from "@/content/site";
import { services, formatPrice, minTier } from "@/content/services";
import { faqs } from "@/content/faq";
import { courses } from "@/content/courses";

export type PipLink = { label: string; href: string };
export interface PipAnswer {
  text: string;
  links?: PipLink[];
}

interface Intent {
  /** single words (weight 2) or multi-word phrases (weight 3) */
  keys: string[];
  answer: () => PipAnswer;
  /** added when any key matches, so a named service beats generic words like "price" */
  boost?: number;
}

const faq = (startsWith: string) => faqs.find((f) => f.q.startsWith(startsWith))?.a ?? "";
const bdt = (n: number) => formatPrice(n, "BDT");
const emailLink: PipLink = { label: site.email, href: `mailto:${site.email}` };
/** wa.me chat link to Nahiyan's WhatsApp, optionally with a prefilled message. */
const whatsappLink = (message = ""): PipLink => ({
  label: "Chat on WhatsApp",
  href: `https://wa.me/${site.phone.replace(/\D/g, "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`,
});

// Search keywords for each service id.
const SERVICE_KEYS: Record<string, string[]> = {
  cv_writing: ["cv", "cvs", "resume", "resumes", "cover letter", "ats", "linkedin"],
  sop_writing: ["sop", "sops", "statement of purpose", "personal statement", "essay", "motivation letter"],
  ielts_training: ["ielts", "band", "band score", "speaking", "listening", "english test"],
  content_strategy: ["content", "ugc", "brand", "branding", "video", "videos", "videography", "seo", "editing", "social media", "marketing"],
  portfolio_website: ["website", "websites", "web", "portfolio website", "landing page", "web development"],
  digital_literacy: ["training", "train", "team", "workshop", "digital literacy", "automation training", "ai training"],
  digital_cards: ["card", "cards", "nfc", "business card", "qr", "digital card"],
  partnership_outreach: ["leads", "lead", "outreach", "lead generation", "pipeline", "prospects", "b2b"],
};

const serviceIntents: Intent[] = services.map((s) => ({
  keys: SERVICE_KEYS[s.id] ?? [],
  boost: 1,
  answer: () => ({
    text:
      `${s.verb}: ${s.blurb} ` +
      `Plans: ${s.tiers.map((t) => `${t.label} ${bdt(t.bdt)}`).join(" · ")}.` +
      (s.id === "ielts_training" ? " Your first 3 classes are free." : "") +
      " You can switch prices to SAR or USD in the Services section.",
    links: [{ label: "See it in Services", href: "/#services" }],
  }),
}));

const intents: Intent[] = [
  {
    keys: ["hi", "hello", "hey", "salam", "assalamualaikum", "yo", "hola"],
    answer: () => ({
      text: "Hi! 👋 Ask me about services and prices, the free IELTS classes, the Agent Studio, Nahiyan's work or how to get in touch.",
    }),
  },
  {
    keys: ["thanks", "thank", "thx", "great", "awesome", "cool"],
    answer: () => ({ text: "Anytime! I'm right here if anything else comes up. 😊" }),
  },
  {
    keys: ["download cv", "download the cv", "download your", "your cv", "your resume", "nahiyan cv", "nahiyans cv", "nahiyan resume", "download resume", "his cv", "her cv", "their cv"],
    boost: 2, // "your CV" must beat the CV-writing service
    answer: () => ({
      text: "Here is Nahiyan's latest CV. It opens as a PDF.",
      links: [{ label: "Open the CV", href: site.cv }],
    }),
  },
  {
    keys: ["who", "nahiyan", "about", "background", "experience", "yourself", "owner", "founder", "credentials", "qualified", "certified"],
    answer: () => ({
      text: `${site.intro} Highlights: ${site.credentials.slice(0, 4).join(", ")}.`,
      links: [{ label: "Read About", href: "/#about" }],
    }),
  },
  {
    keys: ["contact", "email", "mail", "phone", "number", "call", "whatsapp", "reach", "talk", "touch", "message", "hire", "book"],
    answer: () => ({
      text: `Email ${site.email} or call/WhatsApp ${site.phone}. You can also send a message from the contact form. The first consultation is always free.`,
      links: [whatsappLink(), emailLink, { label: "Contact form", href: "/#contact" }],
    }),
  },
  {
    keys: ["services", "service", "offer", "offers", "provide", "what do you do", "what do you offer"],
    answer: () => ({
      text: `Here's everything on offer: ${services.map((s) => s.verb).join(", ")}. Open any service to see how to do it yourself, why to hire Nahiyan, and the prices.`,
      links: [{ label: "Browse Services", href: "/#services" }],
    }),
  },
  {
    keys: ["price", "prices", "pricing", "cost", "costs", "how much", "fee", "fees", "rate", "rates", "charge", "cheap", "budget", "expensive"],
    answer: () => ({
      text: `Starting prices: ${services.map((s) => `${s.verb.replace(/^\w+ your /i, "")} from ${bdt(minTier(s.tiers))}`).join(", ")}. Ask me about one service for the full plans.`,
      links: [{ label: "See all prices", href: "/#services" }],
    }),
  },
  {
    keys: ["free", "trial", "demo", "no cost"],
    answer: () => ({
      text: "Free stuff: your first 3 IELTS classes, the first consultation on any project, and the Agent Studio's 10 AI helpers.",
      links: [{ label: "Free IELTS offer", href: "/#offer" }, { label: "Open the Studio", href: "/studio/" }],
    }),
  },
  {
    keys: ["studio", "agent", "agents", "ai tool", "ai tools", "invoice", "invoices", "ai helpers", "chatbot"],
    answer: () => ({
      text: "The Agent Studio has 10 free AI helpers that write CVs, SOPs and outreach emails, make invoices and more. Your work saves on your device.",
      links: [{ label: "Open the Studio", href: "/studio/" }],
    }),
  },
  {
    keys: ["work", "portfolio", "projects", "project", "clients", "examples", "samples", "case study", "case studies"],
    answer: () => ({
      text: "The Work section shows brand identities, websites and UGC videos. Filter by client work or personal work to find what fits you.",
      links: [{ label: "See the Work", href: "/#work" }],
    }),
  },
  {
    keys: ["course", "courses", "learn", "tutorial", "n8n", "autopilot", "lesson", "lessons"],
    answer: () => ({
      text: `Courses: ${courses.map((c) => `${c.title} (${c.blurb})`).join(" ")}`,
      links: courses.map((c) => ({ label: c.title, href: `/courses/${c.slug}/` })),
    }),
  },
  {
    keys: ["where", "location", "located", "based", "dhaka", "bangladesh", "country", "remote", "online"],
    answer: () => ({ text: `Nahiyan is based in ${site.location} and works with clients online, worldwide.` }),
  },
  {
    keys: ["pay", "payment", "payments", "bkash", "bank", "card payment", "transfer", "paypal"],
    answer: () => ({ text: faq("Can I pay you with bank") }),
  },
  {
    keys: ["refund", "refunds", "money back", "guarantee"],
    answer: () => ({ text: `${faq("Are there any refunds")} ${faq("Can you guarantee")}` }),
  },
  {
    keys: ["revision", "revisions", "changes", "edit", "edits"],
    answer: () => ({ text: faq("What exactly do they get") }),
  },
  {
    keys: ["visa", "abroad", "study abroad", "university", "universities", "admission", "scholarship", "scholarships", "flight", "uk", "canada", "australia"],
    answer: () => ({
      text: faq("Do you help with student visa"),
      links: [{ label: "Study abroad guide", href: "/StudyAbroadPage.html" }],
    }),
  },
  {
    keys: ["data", "privacy", "safe", "secure", "security", "gdpr"],
    answer: () => ({ text: faq("How can I ensure") }),
  },
  {
    keys: ["corporate", "company", "business audit", "enterprise", "office"],
    answer: () => {
      const f = faqs.find((x) => x.q.startsWith("What are the AI services"));
      return { text: `${f?.a ?? ""} ${f?.link?.label ?? ""}`.trim(), links: f?.link ? [f.link] : undefined };
    },
  },
  {
    keys: ["domain", "domains", "hosting"],
    answer: () => ({ text: faq("Do you help with domain") }),
  },
  {
    keys: ["account", "sign up", "signup", "login", "log in", "sign in", "register", "dashboard"],
    answer: () => ({
      text: "Create a free account to track your orders, consultations and free revisions in one place.",
      links: [{ label: "Sign in", href: "/login/" }],
    }),
  },
  {
    keys: ["cart", "order", "orders", "buy", "purchase", "checkout"],
    answer: () => ({
      text: "Add a plan from any service in Services, then open your cart to send the request. Nahiyan reaches out to plan everything before work starts.",
      links: [{ label: "Browse Services", href: "/#services" }],
    }),
  },
  {
    keys: ["process", "how does it work", "how it works", "steps", "get started", "start"],
    answer: () => ({ text: faq("How will the customer discover") }),
  },
  {
    keys: ["currency", "sar", "usd", "dollar", "dollars", "riyal", "taka", "bdt"],
    answer: () => ({ text: "Prices are set in BDT, and the Services section can show them in SAR or USD too." }),
  },
];

const ALL: Intent[] = [...serviceIntents, ...intents];

const norm = (s: string) =>
  ` ${s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9ঀ-৿\s]/g, " ").replace(/\s+/g, " ").trim()} `;

const score = (q: string, it: Intent) => {
  const s = it.keys.reduce((n, k) => (q.includes(` ${k} `) ? n + (k.includes(" ") ? 3 : 2) : n), 0);
  return s > 0 ? s + (it.boost ?? 0) : 0;
};

/** Best local answer, or null when nothing on the page covers the question. */
export function answerLocal(question: string): PipAnswer | null {
  const q = norm(question);
  let best: Intent | null = null;
  let top = 0;
  for (const it of ALL) {
    const s = score(q, it);
    if (s > top) {
      top = s;
      best = it;
    }
  }
  return best && top >= 2 ? best.answer() : null;
}

/** What Temu Bhodbhar says when the page doesn't have the answer. */
export const unknownAnswer = (question = ""): PipAnswer => ({
  text: `I don't know that one yet. Email Nahiyan at ${site.email} or ask on WhatsApp, and you'll get a proper answer.`,
  links: [emailLink, whatsappLink(question ? `Hi Nahiyan, I have a question from your website: ${question}` : "")],
});
