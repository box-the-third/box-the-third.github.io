// ═══════════════════════════════════════════════════════════════
//  COURSES
//  One entry per course. The nav "Courses" dropdown and the
//  /courses index are both generated from this list.
// ═══════════════════════════════════════════════════════════════

export interface Course {
  /** URL slug → /courses/<slug>/ */
  slug: string;
  /** Short label used in the nav dropdown */
  label: string;
  /** Full course title */
  title: string;
  /** One-line summary for the dropdown + index card */
  blurb: string;
  /** Small mono tag, e.g. the stack */
  tag: string;
  /** Rough time-to-build / difficulty, shown on the index card */
  meta: string;
}

export const courses: Course[] = [
  {
    slug: "automation",
    label: "Automation",
    title: "Social Autopilot",
    blurb:
      "Build a self-hosted n8n automation that writes, human-approves and posts to LinkedIn, Instagram, Facebook, Telegram and email — once a day.",
    tag: "n8n · No-code",
    meta: "Build tutorial · Intermediate",
  },
];
