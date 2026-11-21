"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type Variants,
} from "framer-motion";
import { work, WorkItem, WorkCategory } from "@/content/portfolio";
import { youTubeThumb, youTubeEmbed, cn } from "@/lib/utils";
import { RevealText } from "@/components/ui/Reveal";

const kindLabel: Record<WorkCategory, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  design: "Design",
  web: "Live Site",
};

type FilterId = "all" | "client" | "personal" | WorkCategory;

// Display order in mixed views: client (web) first, then youtube, instagram, design.
const KIND_ORDER: Record<WorkCategory, number> = {
  web: 0,
  youtube: 1,
  instagram: 2,
  design: 3,
};

function inFilter(filter: FilterId, kind: WorkCategory): boolean {
  if (filter === "all") return true;
  if (filter === "client") return kind === "web";
  if (filter === "personal") return kind !== "web";
  return kind === filter;
}

function cover(item: WorkItem): string {
  if (item.kind === "youtube" && item.youtube) return youTubeThumb(item.youtube);
  return item.cover || "/assets/work.webp";
}


// ─── Scroll animation ──────────────────────────────────────────────
// Entrance: the card opens out of a rounded window while tipping forward from 3D, the image
// settles from a zoom, then the label, title and caption rise in turn. Columns cascade left to
// right. While scrolling, each image drifts inside its frame (parallax); on hover the card tilts
// toward the pointer with a moving glare.
const EASE = [0.16, 1, 0.3, 1] as const;

const cardV: Variants = {
  hidden: {
    opacity: 0,
    y: 90,
    rotateX: 16,
    scale: 0.92,
    clipPath: "inset(22% 9% 22% 9% round 32px)",
  },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    clipPath: "inset(-12% -12% -12% -12% round 0px)",
    transition: {
      delay,
      duration: 1.15,
      ease: EASE,
      opacity: { delay, duration: 0.5 },
      delayChildren: delay + 0.45,
      staggerChildren: 0.09,
    },
  }),
};
const mediaV: Variants = {
  hidden: { scale: 1.45, filter: "blur(10px)" },
  show: (delay: number) => ({
    scale: 1.12,
    filter: "blur(0px)",
    transition: { delay, duration: 1.5, ease: EASE },
  }),
};
const lineV: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function WorkCard({
  item,
  className,
  cursor,
  onOpen,
  still,
}: {
  item: WorkItem;
  className: string;
  cursor: string;
  onOpen: () => void;
  still: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [delay, setDelay] = useState(0);

  // Column cascade: cards further right start a beat later.
  useLayoutEffect(() => {
    const el = ref.current;
    const grid = el?.parentElement;
    if (!el || !grid) return;
    const col = Math.round(el.offsetLeft / Math.max(1, el.offsetWidth));
    setDelay(Math.min(col, 3) * 0.12);
  }, []);

  // Parallax: the image drifts as the card travels through the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  // Hover tilt + glare.
  const rx = useSpring(0, { stiffness: 170, damping: 18, mass: 0.6 });
  const ry = useSpring(0, { stiffness: 170, damping: 18, mass: 0.6 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glareOn = useSpring(0, { stiffness: 200, damping: 25 });
  const glare = useMotionTemplate`radial-gradient(520px circle at ${gx}% ${gy}%, rgba(255,255,255,0.2), rgba(255,255,255,0) 42%)`;

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (still || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 12);
    rx.set(-(py - 0.5) * 10);
    gx.set(px * 100);
    gy.set(py * 100);
    glareOn.set(1);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    glareOn.set(0);
  };

  const inner = (
    <motion.article
      className={className}
      onClick={onOpen}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor={cursor}
      style={still ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
    >
      <div className="work-media">
        <motion.div
          className="work-parallax"
          variants={still ? undefined : mediaV}
          custom={delay}
          style={still ? undefined : { y: drift }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover(item)} alt={item.title} loading="lazy" />
        </motion.div>
      </div>

      {(item.kind === "youtube" || item.kind === "instagram") && (
        <div className="work-play" aria-hidden>
          <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor">
            <path d="M0 0l20 11L0 22z" />
          </svg>
        </div>
      )}

      <div className="work-overlay">
        <motion.div className="work-top" variants={still ? undefined : lineV}>
          <span className="work-kind">{kindLabel[item.kind]}</span>
          {item.year && <span className="work-year">{item.year}</span>}
        </motion.div>
        <div className="work-info">
          <motion.h3 variants={still ? undefined : lineV}>{item.title}</motion.h3>
          <motion.p variants={still ? undefined : lineV}>{item.meta}</motion.p>
        </div>
      </div>
      {!still && <motion.div className="work-glare" style={{ background: glare, opacity: glareOn }} aria-hidden />}
    </motion.article>
  );

  return (
    <motion.div
      ref={ref}
      className="work-cell"
      variants={still ? undefined : cardV}
      custom={delay}
      initial={still ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      style={still ? undefined : { transformPerspective: 1200, transformOrigin: "50% 100%" }}
    >
      {inner}
    </motion.div>
  );
}

export default function Work() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [active, setActive] = useState<WorkItem | null>(null);
  const still = useReducedMotion() ?? false;

  // The whole grid leans a touch into fast scrolls, then springs back.
  const { scrollY } = useScroll();
  const speed = useVelocity(scrollY);
  const lean = useSpring(useTransform(speed, [-3000, 0, 3000], [1.5, 0, -1.5], { clamp: true }), {
    stiffness: 260,
    damping: 38,
  });

  const items = useMemo(
    () =>
      work
        .map((w, i) => ({ w, i }))
        .filter(({ w }) => inFilter(filter, w.kind))
        .sort((a, b) => KIND_ORDER[a.w.kind] - KIND_ORDER[b.w.kind] || a.i - b.i)
        .map(({ w }) => w),
    [filter]
  );

  const openItem = (item: WorkItem) => {
    if (item.kind === "web" && item.link) {
      window.open(item.link, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.kind === "instagram" && item.instagram) {
      window.open(item.instagram, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.kind === "design" && item.link) {
      window.open(item.link, "_blank", "noopener,noreferrer");
      return;
    }
    setActive(item); // youtube → embed, design → image lightbox
  };

  return (
    <section className="section" id="work">
      <div className="container">
        <div className="work-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              Selected Work
            </div>
            <h2 className="sec-title">
              <RevealText text="Things I’ve" as="span" />{" "}
              <em>
                <RevealText text="made." as="span" delay={0.08} />
              </em>
            </h2>
          </div>

          <div className="work-filters">
            <div className="work-filter-row">
              <button
                className={cn("work-filter", filter === "all" && "active")}
                onClick={() => setFilter("all")}
                data-cursor="Filter"
              >
                All Work
              </button>
              <button
                className={cn("work-filter", filter === "client" && "active")}
                onClick={() => setFilter("client")}
                data-cursor="Filter"
              >
                Client Work
              </button>
              <button
                className={cn("work-filter", filter === "personal" && "active")}
                onClick={() => setFilter("personal")}
                data-cursor="Filter"
              >
                Personal Work
              </button>
            </div>

            <div className="work-filter-row work-subrow">
              <span className="work-sub-label">Personal</span>
              {(["youtube", "instagram", "design"] as WorkCategory[]).map((k) => (
                <button
                  key={k}
                  className={cn("work-filter work-subfilter", filter === k && "active")}
                  onClick={() => setFilter(k)}
                  data-cursor="Filter"
                >
                  {kindLabel[k]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            className="work-grid"
            style={still ? undefined : { skewY: lean }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25 }}
          >
            {items.map((item) => {
              const cardClass = cn(
                "work-card",
                item.kind === "youtube" && "fixed",
                item.featured && "featured"
              );
              const cursor =
                item.kind === "web"
                  ? "Visit ↗"
                  : item.kind === "design"
                    ? "View"
                    : item.kind === "instagram"
                      ? "Open ↗"
                      : "Play";
              return (
                <WorkCard
                  key={item.id}
                  item={item}
                  className={cardClass}
                  cursor={cursor}
                  onOpen={() => openItem(item)}
                  still={still}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="lightbox-inner"
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="lightbox-close"
                onClick={() => setActive(null)}
                aria-label="Close"
              >
                ✕
              </button>
              {active.kind === "youtube" ? (
                <div className="lightbox-frame">
                  <iframe
                    src={youTubeEmbed(active.youtube!)}
                    title={active.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img className="lightbox-img" src={cover(active)} alt={active.title} />
              )}
              <div className="lightbox-cap">
                {active.title}, {active.meta}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
