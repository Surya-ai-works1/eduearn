"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface AnimatedGradientProps {
  children?: React.ReactNode;
  className?: string;
  colors?: string[]; // CSS gradient stops
}

export function AnimatedGradient({
  children,
  className,
  colors = ["#2563EB", "#7C3AED", "#10B981", "#2563EB"],
}: AnimatedGradientProps) {
  const gradientString = `linear-gradient(270deg, ${colors.join(", ")})`;

  return (
    <motion.div
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        backgroundImage: gradientString,
        backgroundSize: "300% 300%",
      }}
      className={cn("w-full h-full", className)}
    >
      {children}
    </motion.div>
  );
}
export default AnimatedGradient;
