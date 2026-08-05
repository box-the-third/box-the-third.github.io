"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  services,
  currencies,
  formatPrice,
  minTier,
  CurrencyCode,
} from "@/content/services";
import { cn } from "@/lib/utils";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import ServiceIcon from "@/components/ui/ServiceIcon";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Services() {
  const [openId, setOpenId] = useState<string | null>(services[0].id);
  const [pricingId, setPricingId] = useState<string | null>(null);
  const [cur, setCur] = useState<CurrencyCode>("BDT");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
    setPricingId(null); // pricing always starts collapsed on a fresh open
  };

  return (
    <section className="section" id="services">
      <div className="container">
        <div className="svc-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              Services
            </div>
            <h2 className="sec-title">
              <RevealText text="Know exactly" as="span" />{" "}
              <em>
                <RevealText text="what you get." as="span" delay={0.08} />
              </em>
            </h2>
            <p className="sec-sub" style={{ marginTop: 18 }}>
              Every service is a walk-through: how to do it yourself, why work with
              me, and the price. No surprises before you commit.
            </p>
          </div>
        </div>

        <div className="svc-list">
          {services.map((s, i) => {
            const open = openId === s.id;
            const showPrice = pricingId === s.id;
            return (
              <Reveal key={s.id} delay={Math.min(i, 5) * 0.04}>
                <article className={cn("svc-panel", open && "open", s.featured && "featured")}>
                  <button
                    className="svc-panel-head"
                    onClick={() => toggle(s.id)}
                    aria-expanded={open}
                    data-cursor={open ? "Close" : "Open"}
                  >
                    <span className="svc-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="svc-icon">
                      <ServiceIcon name={s.icon} size={26} />
                    </span>
                    <span className="svc-headtext">
                      <span className="svc-verb">
                        {s.verb}
                        {s.badge && <em className="svc-badge">{s.badge}</em>}
                      </span>
                      <span className="svc-teaser">{s.teaser}</span>
                    </span>
                    <span className="svc-from">
                      from {formatPrice(minTier(s.tiers), cur)}
                    </span>
                    <span className="svc-toggle" aria-hidden>
                      <span />
                      <span />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        className="svc-body-wrap"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: easeOut }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="svc-body">
                          <div className="svc-watermark" aria-hidden>
                            <ServiceIcon name={s.icon} size={240} />
                          </div>

                          <p className="svc-blurb">{s.blurb}</p>

                          <div className="svc-cols">
                            <div className="svc-block">
                              <div className="svc-block-label">
                                <span className="svc-step-n">01</span> Do it yourself
                              </div>
                              <ol className="svc-steps">
                                {s.diy.map((d, idx) => (
                                  <li key={idx}>{d}</li>
                                ))}
                              </ol>
                            </div>
                            <div className="svc-block">
                              <div className="svc-block-label">
                                <span className="svc-step-n">02</span> Why work with me
                              </div>
                              <ul className="svc-why">
                                {s.why.map((w, idx) => (
                                  <li key={idx}>{w}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="svc-pricing">
                            <button
                              className={cn("svc-price-btn", showPrice && "active")}
                              onClick={() => setPricingId(showPrice ? null : s.id)}
                              aria-expanded={showPrice}
                              data-cursor={showPrice ? "Hide" : "Pricing"}
                            >
                              <span className="svc-step-n">03</span>
                              {showPrice ? "Hide pricing" : "See pricing"}
                              <span className={cn("svc-caret", showPrice && "up")}>▾</span>
                            </button>

                            <AnimatePresence initial={false}>
                              {showPrice && (
                                <motion.div
                                  className="svc-price-reveal"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.4, ease: easeOut }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <div className="svc-price-inner">
                                    <div className="svc-cur" role="group" aria-label="Currency">
                                      {(Object.keys(currencies) as CurrencyCode[]).map((c) => (
                                        <button
                                          key={c}
                                          className={cn(cur === c && "active")}
                                          onClick={() => setCur(c)}
                                          data-cursor={c}
                                        >
                                          {c} {currencies[c].symbol}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="svc-tiers2">
                                      {s.tiers.map((t) => (
                                        <div className="svc-tier" key={t.label}>
                                          <span className="svc-tier-label">{t.label}</span>
                                          <span className="svc-tier-price">
                                            {formatPrice(t.bdt, cur)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <Magnetic>
                                      <a href="#contact" className="btn solid svc-cta" data-cursor="Start">
                                        <span>{s.cta} →</span>
                                      </a>
                                    </Magnetic>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Study abroad band */}
      <Reveal>
        <div className="abroad">
          <div>
            <div className="flags">🇬🇧 🇨🇦 🇦🇺 🇩🇪 🇰🇷</div>
            <h3>
              Planning to study <em>abroad?</em>
            </h3>
            <p>
              Dedicated guidance for the UK, Canada, Australia, Germany and beyond.
              SOPs, visa counseling and university selection, all in one place.
            </p>
          </div>
          <a href="/StudyAbroadPage.html" className="btn solid" data-cursor="Explore">
            <span>Explore Study Abroad →</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
