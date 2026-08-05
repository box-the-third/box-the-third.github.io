"use client";

import { site } from "@/content/site";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import StatCounter from "@/components/ui/StatCounter";

export default function About() {
  return (
    <section className="section" id="about" style={{ background: "var(--bg-2)" }}>
      <div className="container">
        <div className="about-grid">
          <Reveal className="about-portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/meman.webp" alt={site.name} loading="lazy" />
          </Reveal>

          <div className="about-body">
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              About
            </div>
            <h2 className="sec-title">
              <RevealText text="Marketing meets" as="span" />
              <br />
              <em>
                <RevealText text="engineering." as="span" delay={0.08} />
              </em>
            </h2>
            <Reveal delay={0.1}>
              <p>{site.intro}</p>
              <p>
                Founder of {site.brand}. From high-converting frontends to UGC video
                campaigns and AI-assisted automation, I turn strategy into systems that
                actually move numbers, for students, brands and myself.
              </p>
            </Reveal>

            <div className="creds">
              {site.credentials.map((c, i) => (
                <Reveal key={c} delay={i * 0.05}>
                  <div className="cred">
                    <span className="idx">0{i + 1}</span>
                    {c}
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <div className="about-actions">
                <a
                  href="/assets/Nahiyan_Ibn_Ershad_Updated_CV_2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn solid"
                  data-cursor="Open"
                >
                  <span>Download CV ↓</span>
                </a>
                <a
                  href="/assets/Nahiyan-IbnErshad-1730667985914-Psychometric.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  data-cursor="Open"
                >
                  <span>Psychometrics ↗</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="stats">
          {site.stats.map((s) => (
            <Reveal key={s.label} className="stat">
              <div className="num">
                <StatCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="lbl">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
