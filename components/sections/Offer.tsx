"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import BookingModal from "@/components/ui/BookingModal";

export default function Offer() {
  const [booking, setBooking] = useState(false);
  return (
    <section className="section offer-section" id="offer">
      <div className="container">
        <Reveal>
          <div className="offer">
            <div className="offer-glow" aria-hidden />

            <div className="offer-body">
              <h2 className="offer-title offer-title-one">
                Book your <em>FREE</em> IELTS session in 5 minutes and get a personalized plan
              </h2>
              <p className="offer-line">First 3 classes are completely free.</p>

              <div className="offer-cta">
                <Magnetic>
                  <a href="/login/" className="btn solid" data-cursor="Register">
                    <span>Register free →</span>
                  </a>
                </Magnetic>
                <Magnetic>
                  <button type="button" className="btn" data-cursor="Book" onClick={() => setBooking(true)}>
                    <span>Book a session</span>
                  </button>
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
      <BookingModal open={booking} onClose={() => setBooking(false)} />
    </section>
  );
}
