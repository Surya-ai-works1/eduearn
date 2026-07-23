"use client";

import React from "react";
import { motion } from "framer-motion";

interface FloatingAnimationProps {
  children: React.ReactNode;
  duration?: number;
  yRange?: number;
  className?: string;
}

export function FloatingAnimation({ children, duration = 4, yRange = 8, className }: FloatingAnimationProps) {
  return (
    <motion.div
      animate={{ y: [0, -yRange, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
export default FloatingAnimation;
