// ═══════════════════════════════════════════════════════════════
//  WORK PORTFOLIO
//  ---------------------------------------------------------------
//  This is the ONE file you edit to manage your portfolio.
//
//  • YouTube  → set `kind: "youtube"` and paste the video URL or ID.
//               The thumbnail is fetched automatically from YouTube.
//  • Instagram→ set `kind: "instagram"` and paste the reel/post URL.
//               Add a `cover` image (a screenshot/thumbnail you drop
//               in /public/assets) because Instagram blocks hotlinking.
//  • Design   → set `kind: "design"` and point `cover` at an image
//               in /public/assets. Opens in a lightbox.
//
//  Reorder freely, the first item in each category can be "featured"
//  by setting `featured: true` (renders larger in the grid).
// ═══════════════════════════════════════════════════════════════

export type WorkCategory = "youtube" | "instagram" | "design";

export interface WorkItem {
  id: string;
  kind: WorkCategory;
  title: string;
  /** Short role / context line, e.g. "UGC · Global Pathways" */
  meta: string;
  year?: string;
  featured?: boolean;
  tags?: string[];

  // youtube: paste the full URL or the 11-char id.
  youtube?: string;
  // instagram: paste the full reel/post URL.
  instagram?: string;
  // design + instagram: image in /public/assets (path starts with /assets/…)
  cover?: string;
  // optional external link for a design piece (Behance, Dribbble, live site…)
  link?: string;
}

export const categories: { id: WorkCategory | "all"; label: string }[] = [
  { id: "all", label: "All Work" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "design", label: "Design" },
];

// ───────────────────────────────────────────────────────────────
//  ⬇️  PASTE YOUR REAL LINKS HERE. These are placeholders wired to
//     assets already in your repo so the section looks complete.
// ───────────────────────────────────────────────────────────────
export const work: WorkItem[] = [
  // ── YouTube ──────────────────────────────────────────────────
  {
    id: "yt-1",
    kind: "youtube",
    title: "UGC Campaign, Reel Edit",
    meta: "Videography · Global Pathways",
    year: "2025",
    featured: true,
    tags: ["UGC", "Editing"],
    // TODO: replace with your real YouTube URL, e.g.
    // youtube: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    youtube: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  },
  {
    id: "yt-2",
    kind: "youtube",
    title: "Brand Story, Short Form",
    meta: "Direction · Editing",
    year: "2025",
    tags: ["Story", "Short-form"],
    youtube: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  },
  {
    id: "yt-3",
    kind: "youtube",
    title: "Explainer, Product Walkthrough",
    meta: "Script · Edit",
    year: "2024",
    tags: ["Explainer"],
    youtube: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  },

  // ── Instagram ────────────────────────────────────────────────
  {
    id: "ig-1",
    kind: "instagram",
    title: "Reel, YAS Beyond Education",
    meta: "UGC · @yasbeyondedu",
    year: "2025",
    featured: true,
    tags: ["Reel", "UGC"],
    instagram: "https://www.instagram.com/yasbeyondedu/",
    cover: "/assets/video1-thumbnail.jpg",
  },
  {
    id: "ig-2",
    kind: "instagram",
    title: "Reel, Study Abroad Tips",
    meta: "Content · @yasbeyondedu",
    year: "2025",
    tags: ["Reel", "Education"],
    instagram: "https://www.instagram.com/yasbeyondedu/",
    cover: "/assets/video2-thumbnail.jpg",
  },
  {
    id: "ig-3",
    kind: "instagram",
    title: "Reel, Behind the Scenes",
    meta: "BTS · @yasbeyondedu",
    year: "2024",
    tags: ["Reel", "BTS"],
    instagram: "https://www.instagram.com/yasbeyondedu/",
    cover: "/assets/video3-thumbnail.jpg",
  },

  // ── Design ───────────────────────────────────────────────────
  {
    id: "dz-1",
    kind: "design",
    title: "BelaCosmetics, UI System",
    meta: "Product UI · Pricing analytics",
    year: "2024",
    featured: true,
    tags: ["UI", "Web"],
    cover: "/assets/BelaCosmetics.png",
  },
  {
    id: "dz-2",
    kind: "design",
    title: "Baryonn, Brand & Interface",
    meta: "Brand · Interface",
    year: "2024",
    tags: ["Brand", "UI"],
    cover: "/assets/BARYONN.png",
  },
  {
    id: "dz-3",
    kind: "design",
    title: "Search Experience, Dhaka",
    meta: "Product Design",
    year: "2024",
    tags: ["UX", "Product"],
    cover: "/assets/SearchScreenDHK.png",
  },
  {
    id: "dz-4",
    kind: "design",
    title: "SuperDrib, Concept",
    meta: "Visual Design",
    year: "2023",
    tags: ["Concept", "Visual"],
    cover: "/assets/SuperDrib.png",
  },
];
