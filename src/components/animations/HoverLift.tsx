"use client";

import React from "react";
import { motion } from "framer-motion";

interface HoverLiftProps {
  children: React.ReactNode;
  lift?: number;
  scale?: number;
  className?: string;
}

export function HoverLift({ children, lift = -6, scale = 1.01, className }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: lift, scale }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
export default HoverLift;
