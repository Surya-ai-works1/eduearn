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
          "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft": variant === "default",
          "bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50": variant === "glass",
          "border-slate-200 dark:border-slate-800 bg-transparent": variant === "bordered",
          "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 border-blue-100 dark:border-indigo-900/30": variant === "premium",
          
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
