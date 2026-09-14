"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

export default function Work() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [active, setActive] = useState<WorkItem | null>(null);

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

        <div className="work-grid">
          {items.map((item, i) => {
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
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5% 0px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (i % 6) * 0.05 }}
                  className={cardClass}
                  onClick={() => openItem(item)}
                  data-cursor={cursor}
                >
                  <div className="work-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover(item)} alt={item.title} loading="lazy" />
                  </div>

                  {(item.kind === "youtube" || item.kind === "instagram") && (
                    <div className="work-play" aria-hidden>
                      <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor">
                        <path d="M0 0l20 11L0 22z" />
                      </svg>
                    </div>
                  )}

                  <div className="work-overlay">
                    <div className="work-top">
                      <span className="work-kind">{kindLabel[item.kind]}</span>
                      {item.year && <span className="work-year">{item.year}</span>}
                    </div>
                    <div className="work-info">
                      <h3>{item.title}</h3>
                      <p>{item.meta}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
        </div>
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
