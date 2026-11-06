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

// "Hello" in many languages; cross-fades every few seconds.
const GREETINGS = [
  { t: "Hello", lang: "en", dir: "ltr" },
  { t: "Hallo", lang: "de", dir: "ltr" },
  { t: "مرحبا", lang: "ar", dir: "rtl" },
  { t: "Bonjour", lang: "fr", dir: "ltr" },
  { t: "안녕하세요", lang: "ko", dir: "ltr" },
  { t: "হ্যালো", lang: "bn", dir: "ltr" },
  { t: "你好", lang: "zh", dir: "ltr" },
  { t: "नमस्ते", lang: "hi", dir: "ltr" },
  { t: "Hola", lang: "es", dir: "ltr" },
  { t: "Ciao", lang: "it", dir: "ltr" },
  { t: "こんにちは", lang: "ja", dir: "ltr" },
  { t: "Olá", lang: "pt", dir: "ltr" },
  { t: "Привет", lang: "ru", dir: "ltr" },
  { t: "Merhaba", lang: "tr", dir: "ltr" },
  { t: "سلام", lang: "ur", dir: "rtl" },
  { t: "Γειά σου", lang: "el", dir: "ltr" },
  { t: "שלום", lang: "he", dir: "rtl" },
  { t: "สวัสดี", lang: "th", dir: "ltr" },
  { t: "வணக்கம்", lang: "ta", dir: "ltr" },
  { t: "Jambo", lang: "sw", dir: "ltr" },
  { t: "Halo", lang: "id", dir: "ltr" },
  { t: "Xin chào", lang: "vi", dir: "ltr" },
] as const;

export default function Hero() {
  const [wi, setWi] = useState(0);
  const [gi, setGi] = useState(0);
  const [gShow, setGShow] = useState(true);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const id = setInterval(
      () => setWi((v) => (v + 1) % site.heroWords.length),
      2200
    );
    return () => clearInterval(id);
  }, []);

  // Fade the greeting out, swap the word, fade back in (CSS opacity transition).
  useEffect(() => {
    let swap: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setGShow(false);
      swap = setTimeout(() => {
        setGi((v) => (v + 1) % GREETINGS.length);
        setGShow(true);
      }, 450);
    }, 2800);
    return () => {
      clearInterval(id);
      clearTimeout(swap);
    };
  }, []);

  // Track the theme so the WebGL hero can adapt (fog + hide the blob on light).
  useEffect(() => {
    const apply = () =>
      setTheme(
        document.documentElement.getAttribute("data-theme") === "light"
          ? "light"
          : "dark"
      );
    apply();
    window.addEventListener("themechange", apply);
    return () => window.removeEventListener("themechange", apply);
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
        <HeroCanvas theme={theme} />
      </div>

      <div className="hero-top">
        <span className="hero-hello">
          <span
            className={"hello-word" + (gShow ? " show" : "")}
            lang={GREETINGS[gi].lang}
            dir={GREETINGS[gi].dir}
            aria-live="off"
          >
            {GREETINGS[gi].t}
          </span>
        </span>
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
            <motion.span style={{ display: "block" }} variants={line}>
              that convert with
            </motion.span>
          </span>
          <span className="line-mask">
            <motion.span style={{ display: "block" }} variants={line}>
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
