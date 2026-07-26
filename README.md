# Nahiyan Ibn Ershad — Portfolio

A modern, animated personal portfolio built with **Next.js 14 (App Router)**, **Three.js / React-Three-Fiber**, **Framer Motion** and **Lenis** smooth scrolling. Statically exported and deployed to **GitHub Pages** at [box-the-third.github.io](https://box-the-third.github.io).

## Tech
- **Next.js** (`output: "export"`) → static HTML, no server needed
- **Three.js + @react-three/fiber + drei** → WebGL hero (distorted blob + particle field)
- **Framer Motion** → reveal animations, kinetic type, page transitions
- **Lenis** → buttery smooth scrolling
- Custom cursor, magnetic buttons, preloader, animated counters

## Local development
```bash
npm install
npm run dev        # http://localhost:3000
```

## Build (static export)
```bash
npm run build      # outputs the static site to ./out
npm run serve      # preview the exported ./out locally
```

## ✏️ Editing content
All copy lives in plain data files under [`content/`](content/):

| File | What it controls |
| --- | --- |
| `content/site.ts` | Name, roles, socials, stats, hero words, credentials, contact |
| `content/portfolio.ts` | **Your work** — YouTube / Instagram / design items |
| `content/services.ts` | Services, pricing tiers, testimonials, currency rates |

### Adding portfolio work
Open [`content/portfolio.ts`](content/portfolio.ts) and add entries to the `work` array:

```ts
// YouTube — thumbnail is fetched automatically
{ id: "yt-4", kind: "youtube", title: "…", meta: "…", year: "2026",
  youtube: "https://www.youtube.com/watch?v=VIDEO_ID" },

// Instagram — add a cover image in /public/assets (IG blocks hotlinking)
{ id: "ig-4", kind: "instagram", title: "…", meta: "…",
  instagram: "https://www.instagram.com/reel/XXXX/", cover: "/assets/my-cover.jpg" },

// Design — image opens in a lightbox
{ id: "dz-5", kind: "design", title: "…", meta: "…",
  cover: "/assets/my-design.png", link: "https://optional-live-link.com" },
```

Drop any images into `public/assets/` and reference them as `/assets/filename.ext`.

## Deployment
Pushing to `master` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm run build`
and publishes `./out` to GitHub Pages. No manual build step required.

## Preserved legacy pages
The original static business pages still ship as-is inside `public/`:
- `/dashboard.html` — Supabase client dashboard
- `/StudyAbroadPage.html` — study-abroad landing page
- Auth logic in `public/assets/js/` (Supabase)

The previous single-file site is archived under [`legacy/`](legacy/) for reference.
