"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // positive or negative multiplier
  className?: string;
}

export function Parallax({ children, speed = 0.15, className }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map scroll progress to transform coordinates
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 150}%`]);

  return (
    <div ref={containerRef} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
export default Parallax;
