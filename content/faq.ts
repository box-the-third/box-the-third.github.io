// ═══════════════════════════════════════════════════════════════
//  FAQ — edit questions/answers here.
//  `link` (optional) renders an inline link at the end of an answer.
// ═══════════════════════════════════════════════════════════════

export interface FaqItem {
  q: string;
  a: string;
  link?: { label: string; href: string };
}

export const faqs: FaqItem[] = [
  {
    q: "Who is this built for?",
    a: "Students and career professionals who want to stand out with a reliable portfolio that tells their story — built by a human being who understands their value.",
  },
  {
    q: "Why choose you over every other option?",
    a: "At the core of almost every platform is a paywall or a subscription designed to keep taking money out of your pocket. I've built this from scratch with zero payment barriers. It's a lifetime service — you only pay once.",
  },
  {
    q: "What exactly do I get when I pay you?",
    a: "You get a guide and a counselor. Every revision of any product you use is always free — meaning I stay until you no longer need me.",
  },
  {
    q: "How do I discover, buy and receive the product?",
    a: "Fill out the contact form and I'll receive your query. I'll reach out over a meet call if necessary, and we'll brainstorm everything together before I get to work.",
  },
  {
    q: "Are there any refunds?",
    a: "There are no refunds. However, because this is a one-time payment, I'll always ensure your needs are fully met.",
  },
  {
    q: "How can I be sure my data is safe?",
    a: "We comply with all data-protection rights, and your information is always protected.",
  },
  {
    q: "Do you help with student visas?",
    a: "Yes — we help with university and course selection, SOPs, IELTS preparation, visa applications and flight tickets.",
  },
  {
    q: "Can I pay you by bank?",
    a: "We currently operate on a personal account. Any payment modality and details are shared with you after our initial conversation about your needs.",
  },
  {
    q: "Do you provide financial or bank support?",
    a: "We only help students with scholarship essays and full support around that. We don't provide any support regarding finances — but you can always check out local services.",
  },
  {
    q: "Can you guarantee I'll improve my IELTS score?",
    a: "The first 3 classes are free — if you don't feel an improvement, you can opt out. We guarantee improvement in your speaking and listening, because those are the easiest to train. Reading and writing are 100% down to your own practice.",
  },
  {
    q: "What are the AI services for corporate?",
    a: "We provide intensive AI training for corporate offices to enhance existing workflows. Try our website built specifically for business audits:",
    link: { label: "al7ain.com", href: "https://www.al7ain.com" },
  },
  {
    q: "Do you help with domain support?",
    a: "Yes — we're ready to help you acquire your domain. All costs depend on the domain you want.",
  },
];
