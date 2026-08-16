"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../../../utils/cn";

export interface DashboardCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "bordered" | "premium";
  hoverEffect?: "none" | "lift" | "glow";
  animateDelay?: number;
}

export function DashboardCard({
  children,
  className,
  variant = "default",
  hoverEffect = "lift",
  animateDelay = 0,
  ...props
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: animateDelay }}
      className={cn(
        "rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden select-none",
        {
          "bg-white dark:bg-card border-border dark:border-border/80 shadow-soft": variant === "default",
          "bg-white/60 dark:bg-card/60 backdrop-blur-md border-border/50 dark:border-border/50": variant === "glass",
          "border-border dark:border-border bg-transparent": variant === "bordered",
          "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-card dark:to-indigo-950/20 border-blue-100 dark:border-border/30": variant === "premium",
          
          "hover:-translate-y-1.5 hover:shadow-premium": hoverEffect === "lift",
          "hover:border-primary/40 hover:ring-2 hover:ring-primary/5": hoverEffect === "glow",
        },
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
export default DashboardCard;
