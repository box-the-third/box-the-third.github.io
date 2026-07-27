"use client";

import { useState } from "react";
import {
  services,
  currencies,
  formatPrice,
  CurrencyCode,
} from "@/content/services";
import { cn } from "@/lib/utils";
import { Reveal, RevealText } from "@/components/ui/Reveal";

export default function Services() {
  const [cur, setCur] = useState<CurrencyCode>("BDT");

  return (
    <section className="section" id="services">
      <div className="container">
        <div className="svc-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              Services & Pricing
            </div>
            <h2 className="sec-title">
              <RevealText text="Every package," as="span" />{" "}
              <em>
                <RevealText text="priced clearly." as="span" delay={0.08} />
              </em>
            </h2>
            <p className="sec-sub" style={{ marginTop: 18 }}>
              No hidden fees. Pick the tier that matches your goal.
            </p>
          </div>

          <div className="cur-toggle" role="group" aria-label="Currency">
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
        </div>

        <div className="svc-grid">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.06}>
              <article className={cn("svc-card", s.featured && "featured")}>
                {s.badge && <span className="svc-badge">{s.badge}</span>}
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
                <div className="svc-tiers">
                  {s.tiers.map((t) => (
                    <div className="tier" key={t.label}>
                      <span className="tier-label">{t.label}</span>
                      <span className="tier-price">
                        from {formatPrice(t.bdt, cur)}
                      </span>
                    </div>
                  ))}
                </div>
                <a href="#contact" className="svc-link" data-cursor="Go">
                  {s.cta} <i>→</i>
                </a>
              </article>
            </Reveal>
          ))}
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
