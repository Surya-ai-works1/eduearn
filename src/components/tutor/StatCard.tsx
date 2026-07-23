"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
  delay?: number;
}

export const StatCard = React.memo(function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  trend,
  trendUp,
  onClick,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`flex flex-col justify-between border border-border bg-card p-5 rounded-card shadow-soft transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] sm:text-xs font-extrabold text-muted-foreground uppercase tracking-wider truncate pr-2 select-none">
          {label}
        </span>
        <div className={`p-2 rounded-lg border ${colorClass} shrink-0`}>
          <Icon size={15} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl sm:text-2xl font-heading font-extrabold text-foreground leading-none">
          {value}
        </span>
        {trend && (
          <span className={`text-[9px] font-extrabold ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
            {trendUp ? "▲" : "▼"} {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
});
