"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  colorClass?: string;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
  delay?: number;
}

export const StatCard = React.memo(function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  onClick,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.15 }}
      onClick={onClick}
      className={`flex flex-col justify-between border border-border bg-card p-4 rounded-card shadow-sm hover:shadow-md transition-all duration-150 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium text-muted-foreground select-none">
          {label}
        </span>
        <div className="text-primary shrink-0">
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-end justify-between mt-1">
        <span className="text-2xl font-bold text-foreground tracking-tight leading-none">
          {value}
        </span>
        {trend && (
          <span className={`text-[11px] font-semibold ${trendUp ? "text-emerald-600" : "text-rose-600"}`}>
            {trendUp ? "▲" : "▼"} {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
});
