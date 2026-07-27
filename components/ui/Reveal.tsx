"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

/** Fade + rise on scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Splits text into words and reveals them line-by-line with a mask,
 * the signature editorial headline animation.
 */
export function RevealText({
  text,
  className,
  as: Tag = "span",
  delay = 0,
  stagger = 0.04,
}: {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  const MotionTag = motion[Tag as "span"] as typeof motion.span;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      style={{ display: "inline" }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="line-mask"
          style={{ display: "inline-block", verticalAlign: "top" }}
        >
          <motion.span
            style={{ display: "inline-block", willChange: "transform" }}
            variants={{
              hidden: { y: "110%" },
              show: {
                y: 0,
                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
