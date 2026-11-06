"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  title: string;
  value: ReactNode;
  note?: string;
  icon: ReactNode;
  tone?: "teal" | "amber" | "violet" | "emerald";
};

/** Glass stat tile. Lifts 5px on hover, like the "Glassy Dashboard" reference. */
export default function StatsCard({ title, value, note, icon, tone = "teal" }: Props) {
  return (
    <motion.div
      className={`glass-card glass-stat tone-${tone}`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="glass-stat-row">
        <div>
          <p className="glass-stat-title">{title}</p>
          <h2 className="glass-stat-value">{value}</h2>
          {note && (
            <p className="glass-stat-note">
              <ArrowUpRight /> {note}
            </p>
          )}
        </div>
        <span className="glass-stat-icon" aria-hidden>
          {icon}
        </span>
      </div>
    </motion.div>
  );
}

/* ── tiny inline icons (lucide-style strokes, no extra dependency) ── */
const svg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ArrowUpRight = () => (
  <svg {...svg} width={14} height={14}>
    <path d="M7 17 17 7M7 7h10v10" />
  </svg>
);
export const BagIcon = () => (
  <svg {...svg}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
  </svg>
);
export const CoinIcon = () => (
  <svg {...svg}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9h4.5a2 2 0 0 1 0 4H9v4M9 13h6" />
  </svg>
);
export const ClockIcon = () => (
  <svg {...svg}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const ChatIcon = () => (
  <svg {...svg}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />
  </svg>
);
export const HomeIcon = () => (
  <svg {...svg} width={15} height={15}>
    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);
export const SendIcon = () => (
  <svg {...svg} width={15} height={15}>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
  </svg>
);
export const UserIcon = () => (
  <svg {...svg} width={15} height={15}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const CartIcon = () => (
  <svg {...svg} width={15} height={15}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" />
  </svg>
);
