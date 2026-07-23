"use client";

import React from "react";
import { motion } from "framer-motion";

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "fade";
}

export function RevealOnScroll({
  children,
  delay = 0,
  duration = 0.45,
  direction = "up",
  className,
}: RevealOnScrollProps) {
  const directions = {
    up: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  };

  const anim = directions[direction];

  return (
    <motion.div
      initial={anim.initial}
      whileInView={anim.animate}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
export default RevealOnScroll;
