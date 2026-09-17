"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  services,
  currencies,
  formatPrice,
  minTier,
  CurrencyCode,
} from "@/content/services";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import { useAuth } from "@/components/providers/AuthProvider";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import ServiceIcon from "@/components/ui/ServiceIcon";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Services() {
  const [openId, setOpenId] = useState<string | null>(services[0].id);
  const [pricingId, setPricingId] = useState<string | null>(null);
  const [cur, setCur] = useState<CurrencyCode>("BDT");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { session } = useAuth();

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
    setPricingId(null); // pricing always starts collapsed on a fresh open
  };

  // Seed the "added" ticks from the visitor's existing cart (if signed in).
  useEffect(() => {
    if (!session) {
      setAdded(new Set());
      return;
    }
    let alive = true;
    getSupabase()
      .from("selections")
      .select("package_id")
      .eq("user_id", session.user.id)
      .then(({ data }) => {
        if (data && alive) {
          setAdded(new Set(data.map((r) => r.package_id).filter(Boolean) as string[]));
        }
      });
    return () => {
      alive = false;
    };
  }, [session]);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  async function handleAdd(id: string) {
    if (busyId) return;
    setBusyId(id);
    const res = await addToCart(id, session);
    setBusyId(null);
    if (res.status === "added" || res.status === "exists") {
      setAdded((prev) => new Set(prev).add(id));
    }
    if (res.status === "needs-auth") {
      window.dispatchEvent(new Event("auth:open"));
    }
    showToast(res.message, res.status === "error" ? "err" : "ok");
  }

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
              me, and the price. Add a plan to your cart and send your request from
              the dashboard.
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
                                        >
                                          {c} {currencies[c].symbol}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="svc-tiers2">
                                      {s.tiers.map((t) => {
                                        const isAdded = added.has(t.id);
                                        return (
                                          <div className="svc-tier" key={t.id}>
                                            <span className="svc-tier-label">{t.label}</span>
                                            <span className="svc-tier-right">
                                              <span className="svc-tier-price">
                                                {formatPrice(t.bdt, cur)}
                                              </span>
                                              <button
                                                className={cn("svc-add", isAdded && "added")}
                                                onClick={() => handleAdd(t.id)}
                                                disabled={busyId === t.id}
                                                aria-label={
                                                  isAdded
                                                    ? `${t.label} added to cart`
                                                    : `Add ${t.label} to cart`
                                                }
                                                title={isAdded ? "In your cart" : "Add to cart"}
                                              >
                                                {isAdded ? "✓" : "+"}
                                              </button>
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <p className="svc-cart-note">
                                      Added plans land in your{" "}
                                      <a href="/dashboard/">dashboard cart</a>, where you
                                      can send {s.cta.toLowerCase().startsWith("book") ? "your booking" : "your request"}.
                                    </p>
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
          <a href="/StudyAbroadPage.html" className="btn solid">
            <span>Explore Study Abroad →</span>
          </a>
        </div>
      </Reveal>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={cn("cart-toast", toast.kind)}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            role="status"
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
