// ═══════════════════════════════════════════════════════════════
//  WORK PORTFOLIO
//  ---------------------------------------------------------------
//  This is the ONE file you edit to manage your portfolio.
//
//  • YouTube  : set kind "youtube" and paste the video URL or ID.
//               The thumbnail is fetched automatically from YouTube.
//  • Instagram: set kind "instagram" and paste the reel/post URL.
//               Add a `cover` image (a screenshot you drop in
//               /public/assets) because Instagram blocks hotlinking.
//  • Design   : set kind "design" and point `cover` at an image in
//               /public/assets. Opens in a lightbox.
//
//  The grid is masonry, so each photo keeps its natural ratio.
// ═══════════════════════════════════════════════════════════════

export type WorkCategory = "youtube" | "instagram" | "design" | "web";

export interface WorkItem {
  id: string;
  kind: WorkCategory;
  title: string;
  /** Short role / context line, e.g. "Videography, Direction" */
  meta: string;
  year?: string;
  featured?: boolean;
  tags?: string[];

  // youtube: paste the full URL or the 11-char id.
  youtube?: string;
  // instagram: paste the full reel/post URL.
  instagram?: string;
  // design + instagram: optimized image in /public/assets (WebP)
  cover?: string;
  // optional external link for a design piece (Behance, Dribbble, live site)
  link?: string;
}

export const categories: { id: WorkCategory | "all"; label: string }[] = [
  { id: "all", label: "All Work" },
  { id: "web", label: "Sites" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "design", label: "Design" },
];

const IG = "https://www.instagram.com/yasbeyondedu/";

export const work: WorkItem[] = [
  // ── YouTube ──────────────────────────────────────────────────
  {
    id: "yt-1",
    kind: "youtube",
    title: "Featured Film",
    meta: "Videography, Direction",
    year: "2025",
    featured: true,
    tags: ["Video", "Edit"],
    youtube: "https://youtu.be/EyQnvjdegbc",
  },
  {
    id: "yt-2",
    kind: "youtube",
    title: "Brand Story",
    meta: "Editing, Motion",
    year: "2025",
    tags: ["Video"],
    youtube: "https://youtu.be/2HP6hwdBweE",
  },

  // ── Websites I've built (live) ───────────────────────────────
  {
    id: "web-alhainai",
    kind: "web",
    title: "Alhain AI",
    meta: "AI Platform, Frontend",
    year: "2025",
    featured: true,
    tags: ["Next.js", "AI"],
    link: "https://www.al7ain.com/",
    cover: "/assets/site_alhainai.jpg",
  },
  {
    id: "web-msw",
    kind: "web",
    title: "My Saudi Wellness",
    meta: "Corporate Wellness, Web",
    year: "2025",
    featured: true,
    tags: ["Web", "Bilingual"],
    link: "https://box-the-third.github.io/msw/",
    cover: "/assets/site_msw.jpg",
  },
  {
    id: "web-white",
    kind: "web",
    title: "White",
    meta: "E-commerce, 3D",
    year: "2025",
    tags: ["Web", "Three.js"],
    link: "https://box-the-third.github.io/white/",
    cover: "/assets/site_white.jpg",
  },
  {
    id: "web-northstar",
    kind: "web",
    title: "Northstar",
    meta: "Investment App, PWA",
    year: "2025",
    tags: ["React", "PWA"],
    link: "https://box-the-third.github.io/northstar/",
    cover: "/assets/site_northstar.jpg",
  },
  {
    id: "web-ibdafarida",
    kind: "web",
    title: "Ibda Farida",
    meta: "Contracting Site, Arabic RTL",
    year: "2025",
    tags: ["Web", "Bilingual"],
    link: "https://www.ibdafarida.com/",
    cover: "/assets/site_ibdafarida.jpg",
  },
  {
    id: "web-fawtara",
    kind: "web",
    title: "Fawtara",
    meta: "SaaS, Invoicing",
    year: "2025",
    tags: ["SaaS", "Web"],
    link: "https://box-the-third.github.io/fawtara/",
    cover: "/assets/site_fawtara.jpg",
  },
  {
    id: "web-farzana",
    kind: "web",
    title: "Farzana Sultana",
    meta: "Consultant Portfolio",
    year: "2025",
    tags: ["Web", "Portfolio"],
    link: "https://farzana-apparel.github.io/portfolio/",
    cover: "/assets/site_farzana.jpg",
  },
  {
    id: "web-nowfelnation",
    kind: "web",
    title: "NowfelNation",
    meta: "AI Consulting, Web",
    year: "2025",
    tags: ["Web", "AI"],
    link: "https://nowfelibnmizan.github.io/NowfelNation/",
    cover: "/assets/site_nowfelnation.jpg",
  },
  {
    id: "web-ecommerce",
    kind: "web",
    title: "eCommerce Frontend",
    meta: "Storefront UI",
    year: "2024",
    tags: ["Web", "UI"],
    link: "https://box-the-third.github.io/eCommerce-frontend/",
    cover: "/assets/site_ecommerce.jpg",
  },
  {
    id: "web-takerinc",
    kind: "web",
    title: "Taker Inc",
    meta: "Brand Site",
    year: "2024",
    tags: ["Web", "Brand"],
    link: "https://box-the-third.github.io/TakerInc/",
    cover: "/assets/site_takerinc.jpg",
  },
  {
    id: "web-superdrib",
    kind: "web",
    title: "SuperDrib",
    meta: "Web App",
    year: "2024",
    tags: ["Web", "App"],
    link: "https://box-the-third.github.io/SuperDrib/",
    cover: "/assets/site_superdrib.jpg",
  },

  // ── Instagram ────────────────────────────────────────────────
  {
    id: "ig-1",
    kind: "instagram",
    title: "Study Abroad Tips",
    meta: "Reel, @yasbeyondedu",
    year: "2025",
    tags: ["Reel", "Education"],
    instagram: IG,
    cover: "/assets/reelstudyabroadtipsplaceholder.webp",
  },
  {
    id: "ig-2",
    kind: "instagram",
    title: "YAS Beyond Reel",
    meta: "Reel, @yasbeyondedu",
    year: "2025",
    tags: ["Reel", "UGC"],
    instagram: IG,
    cover: "/assets/yasbeyondreelplaceholder.webp",
  },
  {
    id: "ig-3",
    kind: "instagram",
    title: "On Set",
    meta: "Reel, @yasbeyondedu",
    year: "2025",
    tags: ["Reel", "BTS"],
    instagram: IG,
    cover: "/assets/unnamed.webp",
  },

  // ── Design ───────────────────────────────────────────────────
  {
    id: "dz-1",
    kind: "design",
    title: "Banner Design",
    meta: "Graphic Design",
    year: "2025",
    featured: true,
    tags: ["Design"],
    cover: "/assets/bannerdesign.webp",
  },
  {
    id: "dz-2",
    kind: "design",
    title: "Colour Study",
    meta: "Visual Design",
    year: "2024",
    tags: ["Visual"],
    cover: "/assets/colorxx.webp",
  },
  {
    id: "dz-3",
    kind: "design",
    title: "Campaign Visual",
    meta: "Art Direction",
    year: "2024",
    tags: ["Editorial"],
    cover: "/assets/inbound.webp",
  },
  {
    id: "dz-4",
    kind: "design",
    title: "Bruce Lee",
    meta: "Poster Art",
    year: "2024",
    tags: ["Poster"],
    cover: "/assets/bruce-lee.webp",
  },
  {
    id: "dz-5",
    kind: "design",
    title: "Naruto & Sasuke",
    meta: "Illustration",
    year: "2024",
    tags: ["Illustration"],
    cover: "/assets/naruto-sasuke.webp",
  },
  {
    id: "dz-6",
    kind: "design",
    title: "Space",
    meta: "Concept Art",
    year: "2023",
    tags: ["Concept"],
    cover: "/assets/space.webp",
  },
  {
    id: "dz-7",
    kind: "design",
    title: "Box the Third",
    meta: "Brand Mark",
    year: "2023",
    tags: ["Brand"],
    cover: "/assets/boxthethirddd.webp",
  },
];
