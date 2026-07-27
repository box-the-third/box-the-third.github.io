"use client";

import { testimonials } from "@/content/services";
import { Reveal, RevealText } from "@/components/ui/Reveal";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Testimonials() {
  return (
    <section className="section" id="testimonials" style={{ background: "var(--bg-2)" }}>
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          Social Proof
        </div>
        <h2 className="sec-title">
          <RevealText text="What clients" as="span" />{" "}
          <em>
            <RevealText text="say." as="span" delay={0.08} />
          </em>
        </h2>

        <div className="testi-grid">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 4) * 0.06}>
              <figure className="testi">
                <div className="stars">★★★★★</div>
                <blockquote>
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="who">
                  <span className="avatar">{initials(t.name)}</span>
                  <span>
                    <span className="name">{t.name}</span>
                    <br />
                    <span className="role">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
