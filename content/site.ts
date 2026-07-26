// ═══════════════════════════════════════════════════════════════
//  Global site content — edit copy, links and stats here.
// ═══════════════════════════════════════════════════════════════

export const site = {
  name: "Nahiyan Ibn Ershad",
  shortName: "Nahiyan",
  brand: "YAS Beyond Education",
  roles: ["Marketing Specialist", "Growth Engineer", "Frontend Developer", "UGC Creator"],
  tagline: "I build brands that convert — through content, code and strategy.",
  location: "Dhaka, Bangladesh",
  email: "nahiyanibnershad@gmail.com",
  phone: "+8801300984267",
  url: "https://box-the-third.github.io",

  intro:
    "Marketing Specialist & Growth Engineer with a Computer Science background — blending consumer psychology with technical execution to build high-converting campaigns, scale organic reach, and engineer automated workflows that drive revenue.",

  socials: [
    { label: "Instagram", handle: "@yasbeyondedu", href: "https://www.instagram.com/yasbeyondedu/", icon: "instagram" },
    { label: "LinkedIn", handle: "in/nahiyanibnershad", href: "https://www.linkedin.com/in/nahiyanibnershad/", icon: "linkedin" },
    { label: "Facebook", handle: "YAS Beyond Education", href: "https://www.facebook.com/profile.php?id=61584417686122", icon: "facebook" },
  ],

  nav: [
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ],

  stats: [
    { value: 30, suffix: "+", label: "UGC campaigns produced" },
    { value: 95, suffix: "%", label: "Peak conversion rate" },
    { value: 1200, suffix: "+", label: "People helped" },
    { value: 5, suffix: "yr", label: "Building & shipping" },
  ],

  // Rolling word list used in the hero headline.
  heroWords: ["content.", "code.", "strategy.", "growth.", "stories."],

  credentials: [
    "British Council Certified UK Education Counselor",
    "Guinness World Records Holder",
    "HubSpot Digital Marketing Certified",
    "Microsoft Copilot — AI Prompt Engineer",
    "IELTS 7.5 — British Council",
    "1st Runner Up — Hult Prize",
  ],

  // Marquee strip under the hero.
  marquee: [
    "Content Strategy",
    "UGC Production",
    "Frontend Development",
    "Technical SEO",
    "Marketing Automation",
    "Brand Growth",
    "Video Editing",
    "AI Workflows",
  ],

  // Contact form — public Formspree endpoint (same as the legacy site).
  formspreeEndpoint: "https://formspree.io/f/mjkarwza",

  cta: {
    label: "Start a project",
    href: "#contact",
  },
} as const;

export type Social = (typeof site.socials)[number];
