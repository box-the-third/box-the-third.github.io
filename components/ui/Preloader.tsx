"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";

/**
 * Full-screen intro: a counter races 0→100 while the word list cycles,
 * then the panel slides away to reveal the hero.
 */
export default function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // lock scroll while the loader is up
    document.body.style.overflow = "hidden";
    let n = 0;
    const id = setInterval(() => {
      // ease toward 100 with a little randomness
      n += Math.max(1, Math.round((100 - n) * 0.08));
      if (n >= 100) {
        n = 100;
        clearInterval(id);
        setTimeout(() => setDone(true), 380);
      }
      setCount(n);
    }, 90);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (done) {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("preloader:done"));
    }
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "var(--pad)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 24,
            }}
          >
            {site.name} — Portfolio ’26
          </motion.div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              borderTop: "1px solid var(--line)",
              paddingTop: 20,
            }}
          >
            <span
              className="display"
              style={{ fontSize: "clamp(1.1rem,3.4vw,2.4rem)", color: "var(--ink-dim)" }}
            >
              Loading experience
            </span>
            <span
              className="display"
              style={{
                fontSize: "clamp(2.6rem,12vw,10rem)",
                color: "var(--ink)",
                lineHeight: 0.8,
                marginLeft: "auto",
              }}
            >
              {count}
              <span style={{ color: "var(--accent)" }}>%</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
