import { IconKey } from "@/content/services";

/** Minimal line icons, drawn with currentColor so they inherit the accent. */
export default function ServiceIcon({
  name,
  size = 24,
}: {
  name: IconKey;
  size?: number;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "cv":
      return (
        <svg {...p} aria-hidden>
          <path d="M6 2h8l4 4v16H6z" />
          <path d="M14 2v4h4" />
          <path d="M9 12h6M9 16h6M9 8h2" />
        </svg>
      );
    case "sop":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 20h16" />
          <path d="M15.5 4.5l4 4L8 20l-4 1 1-4z" />
          <path d="M13.5 6.5l4 4" />
        </svg>
      );
    case "ielts":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 12v0M8 8v8M12 5v14M16 8v8M20 12v0" />
        </svg>
      );
    case "content":
      return (
        <svg {...p} aria-hidden>
          <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
          <path d="M10 9l5 3-5 3z" />
        </svg>
      );
    case "web":
      return (
        <svg {...p} aria-hidden>
          <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
          <path d="M2.5 8.5h19" />
          <path d="M5.5 6.3h.01M8 6.3h.01" />
        </svg>
      );
    case "skills":
      return (
        <svg {...p} aria-hidden>
          <path d="M12 3l2.2 5.2L20 10l-5.8 1.8L12 17l-2.2-5.2L4 10l5.8-1.8z" />
          <path d="M18.5 16.5l1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1z" />
        </svg>
      );
    case "card":
      return (
        <svg {...p} aria-hidden>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <circle cx="8" cy="11" r="2" />
          <path d="M13 10h6M13 13.5h4M6 15.5c.6-1.3 3.4-1.3 4 0" />
        </svg>
      );
    case "leads":
      return (
        <svg {...p} aria-hidden>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
