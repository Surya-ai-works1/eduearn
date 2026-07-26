"use client";

import React from "react";
import { BookOpen, Award, Clock, FileText, CheckCircle, Flame } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

interface DashboardStatsProps {
  stats: {
    enrolledCourses: number;
    completedCourses: number;
    certificatesEarned: number;
    completionRate: number;
    currentLearningStreak: number;
    totalLearningHours: number;
  };
  streak: number;
}

export function DashboardStats({ stats, streak }: DashboardStatsProps) {
  // Sparkline path generators for statistics trend graphs
  const drawSparkline = (points: number[]) => {
    const width = 60;
    const height = 24;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x},${y}`;
    });
    return `M ${coords.join(" L ")}`;
  };

  const metrics = [
    {
      title: "Active Courses",
      value: `${stats.enrolledCourses} Enrolled`,
      icon: BookOpen,
      iconColor: "text-blue-500 bg-blue-500/10",
      trendPoints: [3, 4, 3, 4, 4],
      trend: "+1 this month",
      trendType: "up",
    },
    {
      title: "Completed",
      value: `${stats.completedCourses} Courses`,
      icon: CheckCircle,
      iconColor: "text-emerald-500 bg-emerald-500/10",
      trendPoints: [1, 2, 2, 3, 3],
      trend: "+1 this week",
      trendType: "up",
    },
    {
      title: "Streak Milestones",
      value: `${streak} Days`,
      icon: Flame,
      iconColor: "text-amber-500 bg-amber-500/10",
      trendPoints: [2, 4, 5, 6, 7],
      trend: "Flame active",
      trendType: "up",
    },
    {
      title: "Study Hours",
      value: `${stats.totalLearningHours} Hrs`,
      icon: Clock,
      iconColor: "text-indigo-500 bg-indigo-500/10",
      trendPoints: [8, 10, 11, 12, 14],
      trend: "+2h vs last week",
      trendType: "up",
    },
    {
      title: "Certificates",
      value: `${stats.certificatesEarned} Earned`,
      icon: Award,
      iconColor: "text-purple-500 bg-purple-500/10",
      trendPoints: [1, 1, 1, 2, 2],
      trend: "Blockchain verified",
      trendType: "up",
    },
    {
      title: "Syllabus Progress",
      value: `${stats.completionRate}% Done`,
      icon: FileText,
      iconColor: "text-rose-500 bg-rose-500/10",
      trendPoints: [45, 50, 55, 57, 59],
      trend: "+4% progress increase",
      trendType: "up",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 select-none">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <DashboardCard
            key={idx}
            variant="glass"
            hoverEffect="lift"
            animateDelay={idx * 0.05}
            className="p-4 flex flex-col justify-between min-h-[140px] border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70"
          >
            <div className="flex items-start justify-between">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.iconColor}`}>
                <Icon size={16} />
              </div>
              
              {/* Custom SVG Sparkline trend graph */}
              <svg width="60" height="24" className="overflow-visible opacity-60">
                <path
                  d={drawSparkline(item.trendPoints)}
                  fill="none"
                  stroke={item.trendType === "up" ? "#10B981" : "#EF4444"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="space-y-1 mt-4">
              <span className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                {item.title}
              </span>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {item.value}
              </h4>
              <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                {item.trend}
              </p>
            </div>
          </DashboardCard>
        );
      })}
    </div>
  );
}
export default DashboardStats;
