"use client";

import { site } from "@/content/site";
import Magnetic from "@/components/ui/Magnetic";
import { RevealText } from "@/components/ui/Reveal";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" id="contact-footer">
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          Let’s build
        </div>
        <div className="footer-cta">
          <a href="#contact" data-cursor="Say hi">
            <RevealText text="Let’s work" as="span" /> <br />
            <RevealText text="together." as="span" delay={0.1} />
          </a>
        </div>

        <div className="footer-bottom">
          <div className="footer-socials">
            {site.socials.map((s) => (
              <Magnetic key={s.href} strength={0.2}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label} ↗
                </a>
              </Magnetic>
            ))}
            <a href={`mailto:${site.email}`}>Email ↗</a>
          </div>

          <div className="footer-meta">
            <a href="#home" className="to-top" data-cursor="Top">
              ↑ Back to top
            </a>
            <div style={{ marginTop: 12 }}>
              © {year} {site.name}
              <br />
              Built with Next.js + Three.js · {site.location}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
