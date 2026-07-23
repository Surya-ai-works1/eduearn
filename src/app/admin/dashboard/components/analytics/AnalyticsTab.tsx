"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Users, Award, Play, Activity } from "lucide-react";
import { Card } from "../../../../../components/ui/card";

export default function AnalyticsTab() {
  const [timeframe, setTimeframe] = useState<"monthly" | "weekly" | "yearly">("monthly");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8 text-left"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5 select-none">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight">
            Analytics Intelligence Center
          </h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Evaluate cohort revenue splits, student completion velocities, retention statistics, and active watch time.
          </p>
        </div>
        <div className="flex gap-1 p-1 border border-border bg-muted/30 rounded-xl text-[10px] font-extrabold uppercase tracking-wider h-9 items-center shrink-0">
          {["weekly", "monthly", "yearly"].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t as any)}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all duration-150 ${timeframe === t ? "bg-primary text-white shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        {[
          { label: "Cohort Course Sales", val: "₹4,12,000", sub: "+18.4% vs last cycle", icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" },
          { label: "Student Watch Time", val: "42.8 hours/mo", sub: "+2.5 hours vs last cycle", icon: Play, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/10" },
          { label: "Completion Rate", val: "76.4%", sub: "+5.1% completion velocity", icon: Award, color: "text-amber-500 bg-amber-500/10 border-amber-500/10" },
          { label: "AI Helper Queries", val: "8,943 prompts", sub: "99.2% satisfaction rating", icon: BarChart3, color: "text-rose-500 bg-rose-500/10 border-rose-500/10" }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="border border-border bg-card p-5 rounded-card flex flex-col justify-between shadow-soft hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center gap-3">
                <span className="text-[10px] sm:text-xs font-extrabold text-muted-foreground uppercase tracking-wider truncate">
                  {stat.label}
                </span>
                <span className={`p-2 rounded-xl border shrink-0 ${stat.color}`}>
                  <Icon size={14} />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight block">{stat.val}</span>
                <span className="text-[10px] text-muted-foreground font-semibold mt-1 block">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED SVG GRAPH CURVES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        {/* Monthly Revenue splits */}
        <Card variant="glass" className="p-5 space-y-4 shadow-soft">
          <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2">
            Monthly Platform Gross Revenue Split
          </h4>
          <div className="h-48 w-full flex items-end relative pt-2">
            <svg className="w-full h-full text-primary" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="var(--border)" strokeWidth="0.1" strokeDasharray="2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border)" strokeWidth="0.1" strokeDasharray="2" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="var(--border)" strokeWidth="0.1" strokeDasharray="2" />
              {/* Curve path */}
              <path d="M0,38 Q15,22 30,30 T60,14 T90,24 T100,8" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M0,38 Q15,22 30,30 T60,14 T90,24 T100,8 L100,40 L0,40 Z" fill="url(#area-blue)" />
            </svg>
            <div className="absolute top-2 left-2 text-[10px] text-muted-foreground font-extrabold bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40 uppercase tracking-wider">
              Platform Gross Revenue (INR)
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-extrabold border-t border-border/20 pt-2 px-1">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </Card>

        {/* Course completion velocity */}
        <Card variant="glass" className="p-5 space-y-4 shadow-soft">
          <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2">
            Student Course Completion Velocity
          </h4>
          <div className="h-48 w-full flex items-end relative pt-2">
            <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-indigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="var(--border)" strokeWidth="0.1" strokeDasharray="2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border)" strokeWidth="0.1" strokeDasharray="2" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="var(--border)" strokeWidth="0.1" strokeDasharray="2" />
              {/* Curve path */}
              <path d="M0,35 Q20,10 40,28 T80,12 T100,5" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M0,35 Q20,10 40,28 T80,12 T100,5 L100,40 L0,40 Z" fill="url(#area-indigo)" />
            </svg>
            <div className="absolute top-2 left-2 text-[10px] text-muted-foreground font-extrabold bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40 uppercase tracking-wider">
              Avg. Completion Rate (%)
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-extrabold border-t border-border/20 pt-2 px-1">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </Card>
      </div>

      {/* PLATFORM METRICS MATRIX */}
      <Card className="p-5 border border-border bg-card shadow-soft space-y-4">
        <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2">
          Platform Performance Metrics Overview
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none pt-2">
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[10px] font-extrabold uppercase tracking-wider">Renewal Retention Rate</span>
            <span className="text-foreground text-lg sm:text-xl font-heading font-extrabold block">88.2%</span>
            <p className="text-[10px] text-muted-foreground font-semibold">Calculated based on monthly student subscription packages.</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[10px] font-extrabold uppercase tracking-wider">Cohort Course Refund Rate</span>
            <span className="text-red-500 text-lg sm:text-xl font-heading font-extrabold block">1.4%</span>
            <p className="text-[10px] text-muted-foreground font-semibold">Calculated relative to total platform gross sales.</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[10px] font-extrabold uppercase tracking-wider">Average Course Rating</span>
            <span className="text-amber-500 text-lg sm:text-xl font-heading font-extrabold block">4.85 ★</span>
            <p className="text-[10px] text-muted-foreground font-semibold">Aggregated across all approved student reviews.</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
