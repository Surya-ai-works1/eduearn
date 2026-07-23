"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "../../components/ui/card";
import type { TutorCourse, StudentProgress, EarningsBalance } from "./types";

interface AnalyticsProps {
  myCourses: TutorCourse[];
  students: StudentProgress[];
  earningsBalance: EarningsBalance;
}

// Sample weekly data — replace with real API data when available
const WEEKLY_DATA = [
  { day: "Mon", sales: 2 },
  { day: "Tue", sales: 5 },
  { day: "Wed", sales: 3 },
  { day: "Thu", sales: 8 },
  { day: "Fri", sales: 6 },
  { day: "Sat", sales: 12 },
  { day: "Sun", sales: 15 },
] as const;

// Max students per course for progress bar scaling
const MAX_STUDENTS_SCALE = 50;

export const Analytics = React.memo(function Analytics({
  myCourses,
  students,
  earningsBalance,
}: AnalyticsProps) {
  const maxSales = Math.max(...WEEKLY_DATA.map((d) => d.sales));

  const avgRating = useMemo(() => {
    const rated = myCourses.filter((c) => c.rating > 0);
    if (!rated.length) return null;
    return (rated.reduce((a, c) => a + c.rating, 0) / rated.length).toFixed(1);
  }, [myCourses]);

  const completionRate = useMemo(() => {
    if (!students.length) return 0;
    return Math.round(
      (students.filter((s) => s.progress === 100).length / students.length) * 100
    );
  }, [students]);

  const engagementRate = useMemo(() => {
    if (!students.length) return 0;
    const avgProgress =
      students.reduce((a, s) => a + s.progress, 0) / students.length;
    return avgProgress.toFixed(1);
  }, [students]);

  const studentsByProgress = useMemo(() => {
    const buckets = { "0–25%": 0, "26–50%": 0, "51–75%": 0, "76–100%": 0 };
    students.forEach((s) => {
      if (s.progress <= 25) buckets["0–25%"]++;
      else if (s.progress <= 50) buckets["26–50%"]++;
      else if (s.progress <= 75) buckets["51–75%"]++;
      else buckets["76–100%"]++;
    });
    return buckets;
  }, [students]);

  // Gross = net / 0.9 (platform takes 10%)
  const grossSales = earningsBalance.total / 0.9;

  return (
    <motion.div
      key="tutor-analytics"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-heading font-extrabold text-foreground">Analytics</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Revenue &amp; engagement insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Filter by course"
            className="h-9 rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option>All Courses</option>
            {myCourses.map((c) => (
              <option key={c.id}>{c.title}</option>
            ))}
          </select>
          <select
            aria-label="Filter by time range"
            className="h-9 rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
            <option value="365">This Year</option>
          </select>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `₹${earningsBalance.total.toLocaleString()}` },
          { label: "Active Students", value: `${students.length}` },
          { label: "Completion Rate", value: `${completionRate}%` },
          { label: "Avg Rating", value: avgRating ? `${avgRating} ★` : "—" },
        ].map((item) => (
          <div key={item.label} className="card-surface p-4 rounded-card shadow-soft min-h-[72px] flex flex-col justify-between">
            <p className="text-[9px] font-bold uppercase text-muted-foreground">{item.label}</p>
            <p className="text-xl font-heading font-extrabold text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <Card variant="glass" className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground">
              Weekly Sales Volume
            </h4>
            <span className="text-[9px] text-muted-foreground/60 font-semibold italic">Sample data</span>
          </div>
          <div className="h-44 flex items-end justify-between px-2 pt-4 border-b border-border/30 relative">
            {/* Y-axis gridlines */}
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <div
                key={pct}
                className="absolute left-0 right-0 border-t border-border/20"
                style={{ bottom: `${pct * 100}%` }}
              />
            ))}
            {WEEKLY_DATA.map((d) => {
              const barPct = (d.sales / (maxSales || 1)) * 100;
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 h-full justify-end flex-1 relative z-10">
                  <span className="text-[8px] font-bold text-muted-foreground">{d.sales}</span>
                  <div
                    className="w-8 bg-primary hover:bg-primary/80 rounded-t transition-all cursor-default"
                    style={{ height: `${Math.max(barPct, 5)}%` }}
                    title={`${d.day}: ${d.sales} sales`}
                  />
                  <span className="text-[9px] font-bold text-muted-foreground">{d.day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Course Performance */}
        <Card variant="glass" className="p-5">
          <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground border-b border-border/60 pb-1.5 mb-4">
            Course Performance
          </h4>
          <div className="space-y-4">
            {myCourses.slice(0, 4).map((course) => (
              <div key={course.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground truncate pr-2">{course.title}</span>
                  <span className="text-amber-500 shrink-0">
                    {course.rating ? `⭐ ${course.rating}` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          ((course.studentsCount || 0) / MAX_STUDENTS_SCALE) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {course.studentsCount} enrolled
                  </span>
                </div>
              </div>
            ))}
            {myCourses.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No courses published yet.</p>
            )}
          </div>
        </Card>

        {/* Student Progress Distribution */}
        <Card variant="glass" className="p-5">
          <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground border-b border-border/60 pb-1.5 mb-4">
            Student Progress Distribution
          </h4>
          {students.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No students enrolled yet.
            </p>
          ) : (
            <div className="space-y-3">
              {(Object.entries(studentsByProgress) as [string, number][]).map(([range, count]) => (
                <div key={range} className="flex items-center gap-3 text-xs">
                  <span className="w-16 text-muted-foreground font-semibold shrink-0">{range}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${students.length ? (count / students.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-5 text-foreground font-bold shrink-0 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Income Breakdown */}
        <Card variant="glass" className="p-5">
          <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground border-b border-border/60 pb-1.5 mb-4">
            Income Breakdown
          </h4>
          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gross Sales Revenue</span>
              <span className="text-foreground font-bold">
                ₹{grossSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-destructive">
              <span>Platform Commission (10%)</span>
              <span>-₹{(earningsBalance.total * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center text-destructive">
              <span>TDS (1%)</span>
              <span>-₹{(earningsBalance.total * 0.01).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-500 font-bold border-t border-border/40 pt-3">
              <span>Net Earnings</span>
              <span>₹{earningsBalance.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-heading font-extrabold text-primary">
                  {engagementRate}%
                </span>
                <p className="text-[9px] text-muted-foreground mt-0.5">Avg. student progress</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-500 font-bold block">
                  {completionRate}%
                </span>
                <span className="text-[9px] text-muted-foreground">Completion Rate</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
});
