"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LegalDoc } from "@/content/legal";

export default function LegalModal({
  doc,
  onClose,
  onAgree,
}: {
  doc: LegalDoc | null;
  onClose: () => void;
  onAgree?: () => void;
}) {
  // lock scroll + close on Escape while open
  useEffect(() => {
    if (!doc) return;
    document.body.style.overflow = "hidden";
    // Pause the Lenis smooth-scroll so the page behind the modal can't move.
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } })
      .lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [doc, onClose]);

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          className="legal-overlay"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="legal-card"
            role="dialog"
            aria-modal="true"
            aria-label={doc.title}
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="legal-head">
              <div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>
                  Legal
                </div>
                <h2 className="legal-title">{doc.title}</h2>
                <p className="legal-updated">Last updated {doc.updated}</p>
              </div>
              <button className="legal-close" onClick={onClose} aria-label="Close" data-cursor="Close">
                ✕
              </button>
            </div>

            <div className="legal-body">
              <p className="legal-intro">{doc.intro}</p>
              {doc.sections.map((s, i) => (
                <section className="legal-section" key={i}>
                  <h3>{s.heading}</h3>
                  {s.body?.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {s.bullets && (
                    <ul>
                      {s.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <div className="legal-foot">
              <button className="btn" onClick={onClose} data-cursor="Close">
                <span>Close</span>
              </button>
              {onAgree && (
                <button className="btn solid" onClick={onAgree} data-cursor="Agree">
                  <span>I agree</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
