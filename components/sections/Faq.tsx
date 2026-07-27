"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { faqs } from "@/content/faq";
import { Reveal, RevealText } from "@/components/ui/Reveal";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section" id="faq" style={{ background: "var(--bg-2)" }}>
      <div className="container">
        <div className="faq-layout">
          <div className="faq-head">
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              FAQ
            </div>
            <h2 className="sec-title">
              <RevealText text="Good" as="span" />{" "}
              <em>
                <RevealText text="questions." as="span" delay={0.08} />
              </em>
            </h2>
            <p className="sec-sub" style={{ marginTop: 18 }}>
              Everything you might want to know before we start. Still curious?{" "}
              <a href="#contact" className="faq-inline-link" data-cursor="Ask">
                Just ask →
              </a>
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={item.q} delay={Math.min(i, 6) * 0.04}>
                  <div className={`faq-item ${isOpen ? "open" : ""}`}>
                    <button
                      className="faq-q"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
                      data-cursor={isOpen ? "Close" : "Open"}
                    >
                      <span className="faq-index">{String(i + 1).padStart(2, "0")}</span>
                      <span className="faq-q-text">{item.q}</span>
                      <span className="faq-toggle" aria-hidden>
                        <span />
                        <span />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          className="faq-a-wrap"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <p className="faq-a">
                            {item.a}
                            {item.link && (
                              <>
                                {" "}
                                <a
                                  href={item.link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="faq-inline-link"
                                  data-cursor="Visit ↗"
                                >
                                  {item.link.label} ↗
                                </a>
                              </>
                            )}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
