"use client";

import { Reveal } from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";

export default function Offer() {
  return (
    <section className="section offer-section" id="offer">
      <div className="container">
        <Reveal>
          <div className="offer">
            <div className="offer-glow" aria-hidden />
            <div className="offer-badge">Right now, on registration</div>

            <div className="offer-body">
              <div className="offer-headline">
                <span className="offer-num">3</span>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 14 }}>
                    Free IELTS Classes
                  </div>
                  <h2 className="offer-title">
                    Your first three classes are <em>completely free.</em>
                  </h2>
                </div>
              </div>

              <p className="offer-sub">
                Register today and your first three IELTS classes cost nothing. Feel a real
                improvement in your speaking and listening from day one. If it is not for
                you, you can opt out any time, no questions asked.
              </p>

              <div className="offer-cta">
                <Magnetic>
                  <a href="/login/" className="btn solid" data-cursor="Register">
                    <span>Register free →</span>
                  </a>
                </Magnetic>
                <Magnetic>
                  <a href="#contact" className="btn" data-cursor="Book">
                    <span>Book a session</span>
                  </a>
                </Magnetic>
              </div>

              <div className="offer-points">
                <span>✓ No card required</span>
                <span>✓ 1-on-1 coaching</span>
                <span>✓ Opt out anytime</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
