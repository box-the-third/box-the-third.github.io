import { site } from "@/content/site";

export default function Marquee() {
  const items = [...site.marquee, ...site.marquee];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {items.map((t, i) => (
          <span className="marquee-item" key={i}>
            {t}
          </span>
        ))}
      </div>
      <div className="marquee-track" aria-hidden>
        {items.map((t, i) => (
          <span className="marquee-item" key={`b-${i}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
