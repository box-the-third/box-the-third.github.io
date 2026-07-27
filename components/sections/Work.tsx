"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { work, categories, WorkItem, WorkCategory } from "@/content/portfolio";
import { youTubeThumb, youTubeEmbed, cn } from "@/lib/utils";
import { RevealText } from "@/components/ui/Reveal";

const kindLabel: Record<WorkCategory, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  design: "Design",
};

function cover(item: WorkItem): string {
  if (item.kind === "youtube" && item.youtube) return youTubeThumb(item.youtube);
  return item.cover || "/assets/work.png";
}

export default function Work() {
  const [filter, setFilter] = useState<WorkCategory | "all">("all");
  const [active, setActive] = useState<WorkItem | null>(null);

  const items = useMemo(
    () => (filter === "all" ? work : work.filter((w) => w.kind === filter)),
    [filter]
  );

  const openItem = (item: WorkItem) => {
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
            {categories.map((c) => (
              <button
                key={c.id}
                className={cn("work-filter", filter === c.id && "active")}
                onClick={() => setFilter(c.id)}
                data-cursor="Filter"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="work-grid">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => {
              const cardClass = cn(
                "work-card",
                item.featured && "featured",
                item.kind === "instagram" && "tall"
              );
              const cursor =
                item.kind === "design" ? "View" : item.kind === "instagram" ? "Open ↗" : "Play";
              return (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                  className={cardClass}
                  onClick={() => openItem(item)}
                  data-cursor={cursor}
                >
                  <div className="work-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover(item)} alt={item.title} loading="lazy" />
                  </div>

                  {item.kind !== "design" && (
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
          </AnimatePresence>
        </motion.div>
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
