"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const sideClasses = {
    top: "bottom-full left-50 -translate-x-50 mb-2",
    bottom: "top-full left-50 -translate-x-50 mt-2",
    left: "right-full top-50 -translate-y-50 mr-2",
    right: "left-full top-50 -translate-y-50 ml-2",
  };

  return (
    <div
      className="relative inline-block w-fit select-none"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute z-55 px-2.5 py-1.5 rounded bg-foreground/90 border border-foreground/10 text-[10px] font-bold text-background whitespace-nowrap shadow-soft pointer-events-none",
              sideClasses[side],
              className
            )}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Tooltip;
