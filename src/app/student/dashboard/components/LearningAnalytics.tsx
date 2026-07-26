"use client";

import React, { useMemo } from "react";
import { TrendingUp, BarChart2, ShieldCheck, Flame, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalytics } from "../hooks/useAnalytics";
import { DashboardCard } from "./DashboardCard";

interface LearningAnalyticsProps {
  enrolledCourses: any[];
  stats: any;
}

export function LearningAnalytics({ enrolledCourses, stats }: LearningAnalyticsProps) {
  const { weeklyHours, subjectDistribution, goals } = useAnalytics(enrolledCourses, stats);

  // SVG bar chart parameters
  const chartHeight = 80;
  const chartWidth = 280;
  const barWidth = 14;
  const gap = 20;

  // Max value helper to scale SVG heights correctly
  const maxVal = useMemo(() => {
    const vals = weeklyHours.map((d) => Math.max(d.hours, d.prevHours));
    return Math.max(...vals, 5);
  }, [weeklyHours]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-2">
        <BarChart2 size={14} className="text-primary" />
        <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
          Learning Analytics &amp; Productivity
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Study Hours comparative double SVG bar chart */}
        <DashboardCard variant="default" hoverEffect="lift" className="p-5 border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Weekly Study Hours</span>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-250 flex items-center gap-1">
              {goals.hoursLogged} Hours <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">Goal: 15h</span>
            </h4>
          </div>

          {/* SVG Comparative chart */}
          <div className="relative w-full flex justify-center py-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-24 overflow-visible">
              {weeklyHours.map((d, index) => {
                const xPos = index * (barWidth * 2 + gap) + 20;
                
                // Calculate comparative scaling heights
                const bar1Height = (d.hours / maxVal) * chartHeight;
                const bar2Height = (d.prevHours / maxVal) * chartHeight;

                return (
                  <g key={d.day}>
                    {/* Previous week bar */}
                    <rect
                      x={xPos}
                      y={chartHeight - bar2Height}
                      width={barWidth}
                      height={bar2Height}
                      rx="3"
                      className="fill-slate-200 dark:fill-slate-850"
                    />
                    {/* Active week bar */}
                    <rect
                      x={xPos + 6}
                      y={chartHeight - bar1Height}
                      width={barWidth}
                      height={bar1Height}
                      rx="3"
                      className="fill-primary"
                    />
                    {/* Text Label */}
                    <text
                      x={xPos + 7}
                      y={chartHeight + 14}
                      textAnchor="middle"
                      className="fill-slate-400 dark:fill-slate-500 font-bold text-[9px]"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-bold text-slate-450 dark:text-slate-500 mt-2 border-t border-slate-100 dark:border-slate-800/40 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              <span>This Week</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-850 inline-block" />
              <span>Last Week</span>
            </div>
          </div>
        </DashboardCard>

        {/* Circular Progress Syllabus completion rate ring */}
        <DashboardCard variant="default" hoverEffect="lift" className="p-5 border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Syllabus Completion</span>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-250">Syllabus Mastery Rate</h4>
          </div>

          <div className="flex items-center justify-around py-2">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-slate-100 dark:stroke-slate-850"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${goals.completedSyllabusPercent}, 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="stroke-primary"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-black text-slate-800 dark:text-slate-150">{goals.completedSyllabusPercent}%</span>
                <span className="text-[7px] text-slate-400 font-extrabold uppercase">Complete</span>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-450">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Attendance: {goals.attendanceRate}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-450">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse" />
                <span>Streaks: Level Up Goal</span>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-800/40 pt-2">
            You completed 6 of 8 scheduled learning tasks this week.
          </p>
        </DashboardCard>

        {/* Subject breakdown details and progress bars */}
        <DashboardCard variant="default" hoverEffect="lift" className="p-5 border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Subject Breakdown</span>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-250">Academic Distribution</h4>
          </div>

          <div className="space-y-3 py-1">
            {subjectDistribution.slice(0, 3).map((sub, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-650 dark:text-slate-400">
                  <span>{sub.subject}</span>
                  <span>{sub.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-800/40 pt-2">
            Calculated dynamically based on your active course enrollment categories.
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
export default LearningAnalytics;
