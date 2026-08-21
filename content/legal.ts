// ═══════════════════════════════════════════════════════════════
//  Legal documents shown on the login screen (Privacy + Terms).
//  Plain, readable, em-dash free. Update `updated` when you change them.
//  Note: this is a solid, honest starting point, not formal legal advice.
//  Have a professional review it for your jurisdiction before relying on it.
// ═══════════════════════════════════════════════════════════════

export interface LegalSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  id: "privacy" | "terms";
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const CONTACT = "nahiyanibnershad@gmail.com";
const BRAND = "YAS Beyond Education";
const SITE = "box-the-third.github.io";

export const privacyPolicy: LegalDoc = {
  id: "privacy",
  title: "Privacy Policy",
  updated: "21 August 2026",
  intro: `This Privacy Policy explains what information ${BRAND} ("we", "us", "our"), run by Nahiyan Ibn Ershad, collects when you use ${SITE} and our services, how we use it, and the choices you have. By creating an account or using the site, you agree to this policy.`,
  sections: [
    {
      heading: "1. Information we collect",
      body: ["We only collect what we need to provide our services:"],
      bullets: [
        "Account details: your name, email address and password. Passwords are handled by our authentication provider and stored only in a hashed, encrypted form. We never see your raw password.",
        "Service selections: the packages or consultations you choose, and their status, so we can deliver and track your order.",
        "Messages you send: anything you submit through the contact form or share with us directly, such as documents for a CV, SOP or application.",
        "Technical data: basic information your browser provides, such as device and general usage, used to keep the site working and secure.",
        "Local storage: small values kept in your browser for your login session and your light or dark theme preference.",
      ],
    },
    {
      heading: "2. How we use your information",
      bullets: [
        "To create and manage your account and deliver the services you request.",
        "To respond to your enquiries and provide support and consultations.",
        "To keep the site secure, prevent abuse and fix problems.",
        "To improve our services and communicate important updates about your orders.",
      ],
    },
    {
      heading: "3. How we share information",
      body: [
        "We do not sell your personal information. We share it only with the trusted providers that power this site, and only as needed to operate it:",
      ],
      bullets: [
        "Supabase, our authentication and database provider, which securely stores your account and service selections.",
        "Formspree, which delivers contact form submissions to our email.",
        "Embedded content such as YouTube or Instagram may load from those services when you view it, subject to their own privacy policies.",
        "Analytics tools may be used to understand site usage in aggregate. These are only active if enabled, and are configured to respect your privacy.",
        "We may disclose information if required by law or to protect our rights and the safety of others.",
      ],
    },
    {
      heading: "4. Data retention",
      body: [
        "We keep your information for as long as your account is active or as needed to provide our services and meet legal obligations. You can ask us to delete your account and associated data at any time.",
      ],
    },
    {
      heading: "5. Security",
      body: [
        "We use reputable providers and industry standard measures to protect your information, including encryption in transit and hashed password storage. No method of transmission or storage is completely secure, so we cannot guarantee absolute security, but we work hard to protect your data.",
      ],
    },
    {
      heading: "6. Your rights",
      body: [
        `You can request to access, correct, export or delete your personal information. To make a request, email us at ${CONTACT} from the address linked to your account and we will respond within a reasonable time.`,
      ],
    },
    {
      heading: "7. International storage",
      body: [
        "Our providers may store and process data on servers located outside your country. Where that happens, we rely on those providers safeguards to protect your information.",
      ],
    },
    {
      heading: "8. Children",
      body: [
        "This site is not directed to children under 13, and we do not knowingly collect their personal information. If you believe a child has provided us data, contact us and we will remove it.",
      ],
    },
    {
      heading: "9. Changes to this policy",
      body: [
        "We may update this policy from time to time. When we do, we will change the date at the top. Continued use of the site after an update means you accept the revised policy.",
      ],
    },
    {
      heading: "10. Contact",
      body: [
        `Questions about this policy or your data? Email ${CONTACT}. We are based in Dhaka, Bangladesh.`,
      ],
    },
  ],
};

export const termsOfService: LegalDoc = {
  id: "terms",
  title: "Terms of Service",
  updated: "21 August 2026",
  intro: `These Terms govern your use of ${SITE} and the services offered by ${BRAND}, run by Nahiyan Ibn Ershad. By creating an account or using the site, you agree to these Terms. If you do not agree, please do not use the site.`,
  sections: [
    {
      heading: "1. Who we are and what we offer",
      body: [
        "We provide creative and educational services, including CV writing, Statement of Purpose and university application help, IELTS coaching, content strategy and production, website development, digital literacy training, digital business cards, partnership outreach and study abroad guidance. Details and pricing are shown on the site and confirmed with you before any work begins.",
      ],
    },
    {
      heading: "2. Your account",
      bullets: [
        "You must provide accurate information and keep your login details secure.",
        "You are responsible for activity that happens under your account.",
        "Your account exists solely to track the services you order and consultations you book.",
        "Tell us promptly if you believe your account has been used without your permission.",
      ],
    },
    {
      heading: "3. Consultations and free sessions",
      body: [
        "Your first consultation is free. For IELTS training, the first three classes are free, and if you do not feel an improvement you can opt out. We will always work to meet your needs, and every revision of a product you order from us is free until it is right.",
      ],
    },
    {
      heading: "4. Payments and refunds",
      bullets: [
        "Our services are a one time payment, not a subscription. You pay once for what you order.",
        "Payment methods and details are shared with you after we have discussed your needs.",
        "There are no refunds. Because it is a one time payment, we instead commit to fulfilling your needs and revising until you are satisfied.",
      ],
    },
    {
      heading: "5. Acceptable use",
      body: ["When using the site and services, you agree not to:"],
      bullets: [
        "Break the law or infringe anyone else's rights.",
        "Submit content you do not have the right to share.",
        "Attempt to disrupt, attack or gain unauthorized access to the site or its systems.",
        "Misrepresent your identity or another person.",
      ],
    },
    {
      heading: "6. Intellectual property",
      body: [
        "The site design, text, graphics and portfolio work are owned by Nahiyan Ibn Ershad unless stated otherwise, and may not be copied or reused without permission. Deliverables we create for you become yours to use for their intended purpose once payment is complete. You keep ownership of the materials you provide to us.",
      ],
    },
    {
      heading: "7. Results and disclaimers",
      body: [
        "We put real effort and expertise into every project, but we cannot guarantee specific outcomes such as admission, a visa, a job or a particular exam score, because those decisions rest with third parties and with your own effort. For IELTS, improvement in reading and writing depends heavily on your practice. Services are provided on an as is basis to the fullest extent permitted by law.",
      ],
    },
    {
      heading: "8. Third party links and content",
      body: [
        "The site may link to or embed third party content and websites we do not control. We are not responsible for their content or practices, and your use of them is at your own risk.",
      ],
    },
    {
      heading: "9. Limitation of liability",
      body: [
        "To the fullest extent permitted by law, we are not liable for any indirect or consequential loss arising from your use of the site or services. Our total liability for any claim is limited to the amount you paid us for the service in question.",
      ],
    },
    {
      heading: "10. Termination",
      body: [
        "You may stop using the site and request account deletion at any time. We may suspend or end access if these Terms are breached or if required to protect the site and other users.",
      ],
    },
    {
      heading: "11. Governing law",
      body: [
        "These Terms are governed by the laws of Bangladesh, and any disputes will be handled by the courts of Dhaka, Bangladesh.",
      ],
    },
    {
      heading: "12. Changes and contact",
      body: [
        `We may update these Terms and will change the date above when we do. Continued use after an update means you accept the changes. Questions? Email ${CONTACT}.`,
      ],
    },
  ],
};

export const legalDocs = { privacy: privacyPolicy, terms: termsOfService };
