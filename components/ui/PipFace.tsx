"use client";

/** 2D fallback of Temu Bhodbhar (used when WebGL is unavailable). */
export default function PipFace(_: { mood?: "wave" | "idle" }) {
  const ink = "#23200f";
  return (
    <svg viewBox="0 0 100 140" width="100%" height="100%" aria-hidden strokeLinejoin="round" strokeLinecap="round">
      {/* ground shadow */}
      <ellipse cx="50" cy="137" rx="27" ry="3.2" fill="rgba(0,0,0,0.32)" />
      {/* gradients for the shiny watch */}
      <defs>
        <linearGradient id="pipGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.45" stopColor="#f4c542" />
          <stop offset="1" stopColor="#b9851c" />
        </linearGradient>
      </defs>
      {/* trousers */}
      <rect x="37" y="108" width="11" height="22" rx="4" fill="#1f2a44" stroke={ink} strokeWidth="1.5" />
      <rect x="52" y="108" width="11" height="22" rx="4" fill="#1f2a44" stroke={ink} strokeWidth="1.5" />
      {/* shiny black dress shoes: glossy highlight + thin sole */}
      <defs>
        <linearGradient id="pipShoe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4f5c" />
          <stop offset="0.35" stopColor="#14151a" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
      </defs>
      <g className="pip-leg-l">
        <path d="M32 134 C31 127 36 124 42 125 C46 126 48 128 50 131 L51 134 Z" fill="url(#pipShoe)" stroke={ink} strokeWidth="1.5" />
        <rect x="30.5" y="133" width="21" height="3" rx="1.5" fill="#0a0a0c" stroke={ink} strokeWidth="1.2" />
        <path d="M35 129 C38 126.5 42 126.5 45 128" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.85" />
        <circle cx="39" cy="130.5" r="0.9" fill="#ffffff" opacity="0.7" />
      </g>
      <g className="pip-leg-r">
        <path d="M68 134 C69 127 64 124 58 125 C54 126 52 128 50 131 L49 134 Z" fill="url(#pipShoe)" stroke={ink} strokeWidth="1.5" />
        <rect x="48.5" y="133" width="21" height="3" rx="1.5" fill="#0a0a0c" stroke={ink} strokeWidth="1.2" />
        <path d="M65 129 C62 126.5 58 126.5 55 128" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.85" />
        <circle cx="61" cy="130.5" r="0.9" fill="#ffffff" opacity="0.7" />
      </g>
      {/* sleeves + hands */}
      <rect x="20" y="92" width="12" height="25" rx="5.5" fill="#1f2a44" stroke={ink} strokeWidth="1.5" />
      <rect x="68" y="92" width="12" height="25" rx="5.5" fill="#1f2a44" stroke={ink} strokeWidth="1.5" />
      <rect x="21.5" y="113.5" width="9" height="3" rx="1.5" fill="#ffffff" stroke={ink} strokeWidth="1" />
      <rect x="69.5" y="113.5" width="9" height="3" rx="1.5" fill="#ffffff" stroke={ink} strokeWidth="1" />
      <circle cx="26" cy="120" r="4.6" fill="#f2ad8e" stroke={ink} strokeWidth="1.4" />
      <circle cx="74" cy="120" r="4.6" fill="#f2ad8e" stroke={ink} strokeWidth="1.4" />
      {/* shiny watch on the wrist */}
      <rect x="20.5" y="108.5" width="11" height="5.5" rx="2" fill="url(#pipGold)" stroke={ink} strokeWidth="1.1" />
      <circle cx="26" cy="111.3" r="3.5" fill="url(#pipGold)" stroke={ink} strokeWidth="1.1" />
      <circle cx="26" cy="111.3" r="2.2" fill="#fffbe6" stroke="#b9851c" strokeWidth="0.6" />
      <path d="M26 111.3 L26 109.8 M26 111.3 L27.2 111.9" stroke={ink} strokeWidth="0.7" fill="none" />
      <path className="pip-glint" d="M31 104 L32 107 L35 108 L32 109 L31 112 L30 109 L27 108 L30 107 Z" fill="#fff" />
      {/* suit jacket */}
      <path d="M31 92 C31 88 69 88 69 92 L71 116 C71 120 29 120 29 116 Z" fill="#1f2a44" stroke={ink} strokeWidth="1.6" />
      {/* shirt + tie */}
      <path d="M43 90 L50 110 L57 90 Z" fill="#ffffff" stroke={ink} strokeWidth="1.2" />
      <path d="M48.3 93 L51.7 93 L52.6 97 L50 112 L47.4 97 Z" fill="#27d9b8" stroke={ink} strokeWidth="1.1" />
      {/* lapels */}
      <path d="M43 90 L36 104 L46 101 Z" fill="#2c3b5e" stroke={ink} strokeWidth="1.2" />
      <path d="M57 90 L64 104 L54 101 Z" fill="#2c3b5e" stroke={ink} strokeWidth="1.2" />
      {/* pocket square + button */}
      <path d="M58 103 L63 103 L62 107 L59 107 Z" fill="#ffffff" stroke={ink} strokeWidth="0.9" />
      <circle cx="50" cy="116" r="1.2" fill="#c9ced6" stroke={ink} strokeWidth="0.7" />
      {/* horns */}
      <path d="M25 40 C9 38 3 20 8 5 C19 13 30 26 34 42 Z" fill="#5c5648" stroke={ink} strokeWidth="1.6" />
      <path d="M75 40 C91 38 97 20 92 5 C81 13 70 26 66 42 Z" fill="#5c5648" stroke={ink} strokeWidth="1.6" />
      {/* hair */}
      <path d="M22 48 C13 24 32 7 52 8 C72 8 88 24 78 48 C73 34 63 28 50 28 C37 28 28 34 22 48 Z" fill="#dfe58a" stroke={ink} strokeWidth="1.6" />
      <path d="M29 31 C40 13 64 12 72 26 C58 21 44 25 33 40 Z" fill="#eef2a8" stroke={ink} strokeWidth="1.3" />
      {/* braids */}
      <ellipse cx="21" cy="80" rx="6" ry="8" fill="#dfe58a" stroke={ink} strokeWidth="1.5" />
      <ellipse cx="79" cy="80" rx="6" ry="8" fill="#dfe58a" stroke={ink} strokeWidth="1.5" />
      <rect x="17" y="74" width="8" height="4" rx="2" fill="#27d9b8" stroke={ink} strokeWidth="1.2" />
      <rect x="75" y="74" width="8" height="4" rx="2" fill="#27d9b8" stroke={ink} strokeWidth="1.2" />
      {/* face */}
      <path d="M25 46 C25 34 75 34 75 46 L75 66 C75 80 62 88 50 88 C38 88 25 80 25 66 Z" fill="#f2ad8e" stroke={ink} strokeWidth="1.6" />
      <ellipse cx="25" cy="58" rx="4" ry="7" fill="#f2ad8e" stroke={ink} strokeWidth="1.4" />
      <ellipse cx="75" cy="58" rx="4" ry="7" fill="#f2ad8e" stroke={ink} strokeWidth="1.4" />
      {/* headband */}
      <path d="M24 41 L50 31 L76 41 L74 50 L50 43 L26 50 Z" fill="#f4b43a" stroke={ink} strokeWidth="1.6" />
      <path d="M43 35 L50 46 L57 35 L50 32 Z" fill="#2fe6c2" stroke={ink} strokeWidth="1.3" />
      {/* brows */}
      <path d="M30 53 L45 57" stroke="#7a6a22" strokeWidth="3.2" fill="none" />
      <path d="M70 53 L55 57" stroke="#7a6a22" strokeWidth="3.2" fill="none" />
      {/* eyes (blink) */}
      <g className="pip-eyes">
        <ellipse cx="38" cy="62" rx="7" ry="5.6" fill="#fff" stroke={ink} strokeWidth="1.4" />
        <ellipse cx="62" cy="62" rx="7" ry="5.6" fill="#fff" stroke={ink} strokeWidth="1.4" />
        <circle cx="39" cy="62.5" r="3.5" fill={ink} />
        <circle cx="61" cy="62.5" r="3.5" fill={ink} />
        <circle cx="40" cy="61.3" r="1.1" fill="#fff" />
        <circle cx="62" cy="61.3" r="1.1" fill="#fff" />
      </g>
      {/* nose + mouth */}
      <ellipse cx="50" cy="69" rx="4.2" ry="3.2" fill="#e98c78" stroke={ink} strokeWidth="1.2" />
      <ellipse cx="50" cy="82" rx="5" ry="2.6" fill="#e98c78" />
      {/* beard */}
      <path d="M31 80 C33 92 43 98 50 98 C57 98 67 92 69 80 C61 87 39 87 31 80 Z" fill="#dfe58a" stroke={ink} strokeWidth="1.5" />
      {/* moustache */}
      <path d="M21 76 C29 64 43 70 50 72 C57 70 71 64 79 76 C72 85 58 82 50 78 C42 82 28 85 21 76 Z" fill="#e8ee94" stroke={ink} strokeWidth="1.6" />
    </svg>
  );
}

