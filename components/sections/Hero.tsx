"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";
import Magnetic from "@/components/ui/Magnetic";

// WebGL is client-only; skip it during static export prerender.
const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), {
  ssr: false,
});

export default function Hero() {
  const [wi, setWi] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setInterval(
      () => setWi((v) => (v + 1) % site.heroWords.length),
      2200
    );
    return () => clearInterval(id);
  }, []);

  // Delay text intro until the preloader is gone.
  useEffect(() => {
    const done = () => setReady(true);
    window.addEventListener("preloader:done", done);
    const t = setTimeout(done, 3200); // safety net
    return () => {
      window.removeEventListener("preloader:done", done);
      clearTimeout(t);
    };
  }, []);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const line = {
    hidden: { y: "110%" },
    show: { y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="hero" id="home">
      <div className="hero-canvas">
        <HeroCanvas />
      </div>

      <div className="hero-top">
        <span>
          <span className="dot">◍</span> Available for projects — 2026
        </span>
        <span>{site.location}</span>
      </div>

      <div className="hero-inner">
        <motion.h1
          className="hero-h1"
          variants={container}
          initial="hidden"
          animate={ready ? "show" : "hidden"}
        >
          <span className="line-mask">
            <motion.span style={{ display: "block" }} variants={line}>
              I build brands
            </motion.span>
          </span>
          <span className="line-mask">
            <motion.span
              style={{ display: "flex", gap: "0.3em", alignItems: "baseline", flexWrap: "wrap" }}
              variants={line}
            >
              that convert with{" "}
              <span
                className="rotate"
                style={{ position: "relative", display: "inline-block", minWidth: "5ch" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={site.heroWords[wi]}
                    initial={{ y: "60%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-60%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "inline-block" }}
                  >
                    {site.heroWords[wi]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.span>
          </span>
        </motion.h1>

        <motion.div
          className="hero-meta"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <p className="hero-p">{site.intro}</p>
          <div className="hero-cta">
            <Magnetic>
              <a href="#work" className="btn solid" data-cursor="View">
                <span>See my work</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn" data-cursor="Talk">
                <span>Start a project</span>
              </a>
            </Magnetic>
          </div>
        </motion.div>
      </div>

      <div className="hero-scroll">
        Scroll
        <span className="bar" />
      </div>
    </section>
  );
}
