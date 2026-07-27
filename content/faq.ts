// ═══════════════════════════════════════════════════════════════
//  FAQ, edit questions/answers here.
//  `link` (optional) renders an inline link at the end of an answer.
//  Answers are kept verbatim in Nahiyan's own words.
// ═══════════════════════════════════════════════════════════════

export interface FaqItem {
  q: string;
  a: string;
  link?: { label: string; href: string };
}

export const faqs: FaqItem[] = [
  {
    q: "Who is this specifically built for?",
    a: "Students and Career Professionals who want to stand out with a reliable portfolio that tells their story. Built by a human being that understands their value.",
  },
  {
    q: "Why should they choose me instead of every other option available?",
    a: "At the core of every page lies a paywall or a subscription system that's designed to take money out of their pocket. I have built my portfolio from scratch with zero payment. This is a lifetime service, meaning they only pay once.",
  },
  {
    q: "What exactly do they get when they pay me?",
    a: "They get a guide, a counselor, and all revisions of any product they use is always free. Meaning I'll stay until they no longer need me to.",
  },
  {
    q: "How will the customer discover, buy and receive my product?",
    a: "The customer will fill up the contact form, I will receive their query, reach out to them over a meet call if necessary and we'll brainstorm everything before I get to work.",
  },
  {
    q: "Are there any refunds?",
    a: "There will not be any refunds. However, I will always ensure that the needs are fulfilled because this is a one time payment.",
  },
  {
    q: "How can I ensure that my data is safe?",
    a: "We comply with all data protection rights there are and your information is always protected.",
  },
  {
    q: "Do you help with student visa?",
    a: "Yes we help with university, course selection, SOP, IELTS Preparation, Visa Application and Flight Tickets.",
  },
  {
    q: "Can I pay you with bank?",
    a: "Currently we operate on a personal account, Any modality of payment details will be shared with you after we have the initial conversation of your need.",
  },
  {
    q: "Do you provide bank support?",
    a: "We only aide students with scholarship essays and full support regarding that, We do not provide any support regarding finances, however you can always check out local services.",
  },
  {
    q: "Can you guarantee that I can improve my IELTS Score?",
    a: "The first 3 classes are free, if you don't feel an improvement, you can always opt out. We guarantee an improvement in your speaking and listening skills because those are easy to train. For the reading and writing classes, it is 100% up to your practice which will get you the results.",
  },
  {
    q: "What are the AI services for corporate?",
    a: "We provide intensive AI training for corporate offices to enhance the current workflow. Try out our website built specifically for business audits on",
    link: { label: "www.al7ain.com", href: "https://www.al7ain.com" },
  },
  {
    q: "Do you help with domain support?",
    a: "We are ready to help acquire your domain, however, all costs will depend on which you want.",
  },
];
