"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Star,
  Activity,
  FileText,
  Calendar,
  Download,
  AlertTriangle,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  HelpCircle,
  Video,
  FileQuestion,
  Search,
  CheckCircle,
  ChevronDown,
  FileDown,
  BookOpen
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import type { TutorCourse, StudentProgress, EarningsBalance } from "./types";

interface AnalyticsProps {
  myCourses: TutorCourse[];
  students: StudentProgress[];
  earningsBalance: EarningsBalance;
}

type SubTabType =
  | "revenue"
  | "students"
  | "courses"
  | "assignments"
  | "live"
  | "resources"
  | "ai";

export const Analytics = React.memo(function Analytics({
  myCourses,
  students,
  earningsBalance,
}: AnalyticsProps) {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("revenue");

  // Filters state
  const [dateRange, setDateRange] = useState("30");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [selectedGroup, setSelectedGroup] = useState("All");

  // Revenue chart filter: daily, weekly, monthly, yearly
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  // Sorting for course analytics
  const [courseSort, setCourseSort] = useState<"popular" | "revenue" | "rating">("popular");

  // Calculations
  const grossSales = useMemo(() => earningsBalance.total / 0.9, [earningsBalance]);
  const avgRating = useMemo(() => {
    const rated = myCourses.filter(c => c.rating > 0);
    if (!rated.length) return 4.8;
    return parseFloat((rated.reduce((a, c) => a + c.rating, 0) / rated.length).toFixed(1));
  }, [myCourses]);

  const completionRate = useMemo(() => {
    if (!students.length) return 82;
    return Math.round((students.filter(s => s.progress === 100).length / students.length) * 100) || 82;
  }, [students]);

  const tokensRemaining = 920;

  // Simulated charts datasets
  const revenueChartData = useMemo(() => {
    if (revenuePeriod === "daily") {
      return [
        { label: "Mon", gross: 12000, net: 10800 },
        { label: "Tue", gross: 15000, net: 13500 },
        { label: "Wed", gross: 18000, net: 16200 },
        { label: "Thu", gross: 22000, net: 19800 },
        { label: "Fri", gross: 25000, net: 22500 },
        { label: "Sat", gross: 30000, net: 27000 },
        { label: "Sun", gross: 35000, net: 31500 }
      ];
    }
    if (revenuePeriod === "weekly") {
      return [
        { label: "Week 1", gross: 85000, net: 76500 },
        { label: "Week 2", gross: 92000, net: 82800 },
        { label: "Week 3", gross: 110000, net: 99000 },
        { label: "Week 4", gross: 125000, net: 112500 }
      ];
    }
    if (revenuePeriod === "yearly") {
      return [
        { label: "2023", gross: 450000, net: 405000 },
        { label: "2024", gross: 780000, net: 702000 },
        { label: "2025", gross: 1200000, net: 1080000 },
        { label: "2026", gross: 1650000, net: 1485000 }
      ];
    }
    // Monthly (Default)
    return [
      { label: "Jan", gross: 42000, net: 37800 },
      { label: "Feb", gross: 55000, net: 49500 },
      { label: "Mar", gross: 68000, net: 61200 },
      { label: "Apr", gross: 80000, net: 72000 },
      { label: "May", gross: 95000, net: 85500 },
      { label: "Jun", gross: 110000, net: 99000 },
      { label: "Jul", gross: 135000, net: 121500 }
    ];
  }, [revenuePeriod]);

  // Simulated Course performance list
  const coursesPerformanceData = useMemo(() => {
    const list = myCourses.map(c => {
      const completion = c.title.includes("Bootcamp") ? 88 : 79;
      const certificates = c.title.includes("Bootcamp") ? 18 : 12;
      const assignmentsCount = c.title.includes("Bootcamp") ? 6 : 4;
      const liveClassesCount = c.title.includes("Bootcamp") ? 12 : 8;

      return {
        id: c.id,
        title: c.title,
        studentsCount: c.studentsCount || 15,
        revenue: (c.studentsCount || 15) * 4500,
        completion,
        rating: c.rating || 4.7,
        assignments: assignmentsCount,
        liveClasses: liveClassesCount,
        certificatesIssued: certificates
      };
    });

    if (courseSort === "revenue") return list.sort((a, b) => b.revenue - a.revenue);
    if (courseSort === "rating") return list.sort((a, b) => b.rating - a.rating);
    return list.sort((a, b) => b.studentsCount - a.studentsCount);
  }, [myCourses, courseSort]);

  // Export handlers
  const handleExportReport = (format: "pdf" | "excel" | "csv") => {
    toast.success(`Exporting detailed tutor performance metrics as ${format.toUpperCase()}...`);
  };

  return (
    <motion.div
      key="tutor-performance-analytics"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Title Header & Report Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Tutor Performance Analytics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidated insights and metrics covering your courses, student completion, and revenue breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleExportReport("csv")}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Download size={14} /> Export CSV
          </Button>
          <Button
            onClick={() => handleExportReport("pdf")}
            size="sm"
            className="h-9 gap-1.5 bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm text-xs"
          >
            <FileDown size={14} /> Download PDF Report
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground block uppercase">Date Range</label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="h-8 rounded-button border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground block uppercase">Course Mapped</label>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="h-8 rounded-button border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="All">All Courses</option>
            {myCourses.map(c => (
              <option key={c.id} value={c.title}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground block uppercase">Batch Mapped</label>
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="h-8 rounded-button border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="All">All Batches</option>
            <option value="Batch A">Batch A</option>
            <option value="Batch B">Batch B</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground block uppercase">Student Group</label>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="h-8 rounded-button border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="All">All Groups</option>
            <option value="Fast Learners">Fast Learners</option>
            <option value="At Risk">At Risk Students</option>
          </select>
        </div>
      </Card>

      {/* Top 6 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Total Revenue", value: `₹${earningsBalance.total.toLocaleString()}`, change: "+12.4%", status: "up" },
          { label: "Active Students", value: students.length || 38, change: "+8.2%", status: "up" },
          { label: "Course Completion", value: `${completionRate}%`, change: "+4.1%", status: "up" },
          { label: "Average Rating", value: `${avgRating} ★`, change: "+0.2", status: "up" },
          { label: "Avg Attendance", value: "91%", change: "-1.5%", status: "down" },
          { label: "Submission Rate", value: "88%", change: "+3.2%", status: "up" }
        ].map((item, idx) => {
          return (
            <Card key={idx} className="p-3 border border-border bg-card shadow-sm flex flex-col justify-between min-h-[85px]">
              <div>
                <p className="text-[9px] font-extrabold text-muted-foreground uppercase">{item.label}</p>
                <h4 className="text-lg font-extrabold text-foreground mt-1">{item.value}</h4>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/20">
                <span className={`text-[8.5px] font-bold flex items-center gap-0.5 ${item.status === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                  {item.status === "up" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {item.change}
                </span>
                <span className="text-[8px] text-muted-foreground">vs last mo</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Auto-Generated Performance Insights Panel */}
      <Card variant="glass" className="p-4 border-l-4 border-l-primary space-y-3">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Zap size={13} className="animate-pulse" /> AI Performance Insights
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-[10.5px] font-semibold text-muted-foreground">
          <div className="p-2 bg-card border border-border/40 rounded">
            <span className="text-muted-foreground block text-[9px] uppercase">Highest Performing</span>
            <span className="text-foreground font-bold truncate block">Full-Stack Bootcamp</span>
          </div>
          <div className="p-2 bg-card border border-border/40 rounded">
            <span className="text-muted-foreground block text-[9px] uppercase">Lowest Performing</span>
            <span className="text-foreground font-bold truncate block">Linear Algebra</span>
          </div>
          <div className="p-2 bg-card border border-border/40 rounded">
            <span className="text-muted-foreground block text-[9px] uppercase">Students At Risk</span>
            <span className="text-rose-500 font-bold block">4 Students flagged</span>
          </div>
          <div className="p-2 bg-card border border-border/40 rounded">
            <span className="text-muted-foreground block text-[9px] uppercase">Best Teaching Month</span>
            <span className="text-foreground font-bold block">July 2026</span>
          </div>
          <div className="p-2 bg-card border border-border/40 rounded">
            <span className="text-muted-foreground block text-[9px] uppercase">Fastest Growing Course</span>
            <span className="text-emerald-500 font-bold block">+28% enrollment</span>
          </div>
        </div>
      </Card>

      {/* Main Tabs Navigation */}
      <div className="flex bg-muted/40 p-0.5 rounded-button text-[10.5px] font-extrabold w-fit max-w-full overflow-x-auto">
        {[
          { id: "revenue", label: "Revenue & Payouts" },
          { id: "students", label: "Student Analytics" },
          { id: "courses", label: "Course metrics" },
          { id: "assignments", label: "Assignments & Marks" },
          { id: "live", label: "Live Classes Insights" },
          { id: "resources", label: "Resource Downloads" },
          { id: "ai", label: "AI Usage & Time Saved" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-button transition-colors whitespace-nowrap cursor-pointer ${
              activeSubTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB SUB-CONTENTS COMPILATIONS */}
      <div className="space-y-6">
        
        {/* REVENUE & PAYOUTS TAB */}
        {activeSubTab === "revenue" && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Chart Area */}
            <Card className="p-5 space-y-4 border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Gross vs Net Revenue Trend</h4>
                <div className="flex bg-muted/30 p-0.5 rounded text-[9.5px]">
                  {["daily", "weekly", "monthly", "yearly"].map(p => (
                    <button
                      key={p}
                      onClick={() => setRevenuePeriod(p as any)}
                      className={`px-2 py-1 rounded capitalize transition-all ${revenuePeriod === p ? "bg-card font-extrabold text-foreground" : "text-muted-foreground"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar simulation */}
              <div className="h-48 flex items-end justify-between px-2 pt-4 border-b border-border/30 relative">
                {revenueChartData.map((d, idx) => {
                  const grossPct = (d.gross / 150000) * 100;
                  const netPct = (d.net / 150000) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end flex-1 relative z-10 group">
                      <div className="flex gap-1.5 items-end justify-center w-full h-full">
                        <div
                          className="w-4 bg-sky-500/80 hover:bg-sky-500 rounded-t transition-all"
                          style={{ height: `${Math.max(grossPct, 6)}%` }}
                          title={`Gross: ₹${d.gross.toLocaleString()}`}
                        />
                        <div
                          className="w-4 bg-primary hover:bg-primary/95 rounded-t transition-all"
                          style={{ height: `${Math.max(netPct, 6)}%` }}
                          title={`Net: ₹${d.net.toLocaleString()}`}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground mt-1.5">{d.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 text-[9.5px] font-bold">
                <span className="flex items-center gap-1.5 text-sky-600"><span className="w-2.5 h-2.5 bg-sky-500/80 rounded" /> Gross sales</span>
                <span className="flex items-center gap-1.5 text-primary"><span className="w-2.5 h-2.5 bg-primary rounded" /> Net payout earnings</span>
              </div>
            </Card>

            {/* Metrics Breakdown */}
            <Card className="p-5 space-y-4 border border-border bg-card shadow-sm text-xs font-semibold">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">
                Revenue Statement
              </h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Gross Sales Revenue</span>
                  <span className="text-foreground font-bold">₹{grossSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center text-rose-500">
                  <span>Platform Commission (10%)</span>
                  <span>-₹{(earningsBalance.total * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center text-rose-500">
                  <span>TDS Deductions (1%)</span>
                  <span>-₹{(earningsBalance.total * 0.01).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-500 font-bold border-t border-border/40 pt-3">
                  <span>Net Payout Earnings</span>
                  <span>₹{earningsBalance.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-muted-foreground">Pending Payouts</span>
                  <span className="text-amber-500 font-bold">₹15,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed Payouts</span>
                  <span className="text-foreground font-bold">₹48,000</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-muted-foreground">Avg Revenue per Student</span>
                  <span className="text-foreground font-bold">₹3,450</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* STUDENT ANALYTICS TAB */}
        {activeSubTab === "students" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Enrollment Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">New Enrollments (This Month)</span>
                  <span className="text-emerald-500 font-bold">+12 students</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Engaged Students</span>
                  <span className="text-foreground font-bold">34 active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Inactive (Dormant) Students</span>
                  <span className="text-rose-500 font-bold">4 dormant</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Academic Completion</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Course Progress</span>
                  <span className="text-foreground font-bold">78.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dropout Rate</span>
                  <span className="text-rose-500 font-bold">2.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Retention Rate</span>
                  <span className="text-emerald-500 font-bold">96.8%</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Progress Buckets</h4>
              <div className="space-y-3">
                {[
                  { range: "0–25% progress", count: 4, pct: 15 },
                  { range: "26–50% progress", count: 8, pct: 30 },
                  { range: "51–75% progress", count: 12, pct: 45 },
                  { range: "76–100% progress", count: 10, pct: 35 }
                ].map(item => (
                  <div key={item.range} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span>{item.range}</span>
                      <span className="font-bold">{item.count} students</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* COURSE ANALYTICS TAB */}
        {activeSubTab === "courses" && (
          <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">Course-wise Breakdown</h4>
              <div className="flex gap-2">
                <select
                  value={courseSort}
                  onChange={e => setCourseSort(e.target.value as any)}
                  className="h-8 rounded border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="revenue">Highest Revenue</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-[10px] font-extrabold uppercase">
                    <th className="py-2.5">Course Title</th>
                    <th>Enrolled Students</th>
                    <th>Gross Revenue</th>
                    <th>Completion %</th>
                    <th>Average Rating</th>
                    <th>Assignments</th>
                    <th>Live Classes</th>
                    <th>Certificates Issued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-semibold text-foreground">
                  {coursesPerformanceData.map(course => (
                    <tr key={course.id} className="hover:bg-muted/15 transition-colors">
                      <td className="py-3 font-bold text-foreground max-w-[200px] truncate">{course.title}</td>
                      <td>{course.studentsCount} students</td>
                      <td className="text-emerald-500 font-bold">₹{course.revenue.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="w-8">{course.completion}%</span>
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${course.completion}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="text-amber-500 font-bold">★ {course.rating}</td>
                      <td>{course.assignments} tasks</td>
                      <td>{course.liveClasses} sessions</td>
                      <td>{course.certificatesIssued} issued</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ASSIGNMENTS & MARKS TAB */}
        {activeSubTab === "assignments" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
            <Card className="p-5 border border-border bg-card shadow-sm space-y-4 col-span-2">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Grading & Submission progress</h4>
              <div className="space-y-4">
                {[
                  { title: "Midterm Algebra Vectors Assignment", submissions: "22 / 24", rate: 91, avg: "82 marks" },
                  { title: "React Props capstone checkout module", submissions: "18 / 25", rate: 72, avg: "88 marks" }
                ].map(item => (
                  <div key={item.title} className="space-y-2 p-3 bg-muted/15 border border-border/30 rounded-card">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-foreground truncate max-w-[250px]">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground">{item.submissions} Submitted</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Submission rate:</span>
                        <span className="font-bold text-foreground">{item.rate}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Average Marks:</span>
                        <span className="font-bold text-emerald-500">{item.avg}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Assignments Metrics</h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Assignments Created</span>
                  <span className="text-foreground font-bold">12 assignments</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Late Submissions</span>
                  <span className="text-rose-500 font-bold">4.2% rate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Grading Progress</span>
                  <span className="text-amber-500 font-bold">92% completed</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-muted-foreground">Top Performing Set</span>
                  <span className="text-primary font-bold">Linear Algebra Quiz</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* LIVE CLASSES TAB */}
        {activeSubTab === "live" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Live Classes Stats</h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Classes Conducted</span>
                  <span className="text-foreground font-bold">38 sessions</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Attendance</span>
                  <span className="text-emerald-500 font-bold">91.4% rate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Duration</span>
                  <span className="text-foreground font-bold">60 minutes</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Engagement</h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Recording Views</span>
                  <span className="text-foreground font-bold">142 total views</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cancelled Sessions</span>
                  <span className="text-rose-500 font-bold">0 sessions</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-muted-foreground font-heading">Most Attended Session</span>
                  <span className="text-primary font-extrabold truncate max-w-[120px] block">React Lifecycle Sync</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-3.5">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Weekly Live classes flow</h4>
              {[
                { day: "Mon", count: 2 },
                { day: "Tue", count: 3 },
                { day: "Wed", count: 2 },
                { day: "Thu", count: 1 }
              ].map(item => (
                <div key={item.day} className="flex items-center justify-between text-[10px]">
                  <span>{item.day}</span>
                  <span className="font-bold">{item.count} classes scheduled</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* RESOURCE DOWNLOADS TAB */}
        {activeSubTab === "resources" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Downloads & Storage</h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total File Downloads</span>
                  <span className="text-foreground font-bold">182 downloads</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Storage Used</span>
                  <span className="text-foreground font-bold">145 MB / 1 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Course Resource Coverage</span>
                  <span className="text-emerald-500 font-bold">100% covered</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Most Downloaded Materials</h4>
              <div className="space-y-3 text-[10px]">
                <div className="flex justify-between items-center">
                  <span>algebra_notes_vectors.pdf</span>
                  <span className="font-bold text-primary">45 downloads</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>react_hooks_flow_chart.png</span>
                  <span className="font-bold text-primary">38 downloads</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* AI UTILS STATS TAB */}
        {activeSubTab === "ai" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Tokens Utilization</h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">AI Requests Sent</span>
                  <span className="text-foreground font-bold">24 calls today</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Remaining Credits Balance</span>
                  <span className="text-primary font-bold">{tokensRemaining} credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estimated Time Saved</span>
                  <span className="text-emerald-500 font-bold">45 hours</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/40 pb-2">Generated Assets</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lesson Plans Generated</span>
                  <span className="text-foreground font-bold">8 plans</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Quizzes Generated</span>
                  <span className="text-foreground font-bold">14 sets</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Assignments Generated</span>
                  <span className="text-foreground font-bold">9 templates</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-4 text-center flex flex-col justify-center items-center gap-2">
              <Zap size={24} className="text-primary animate-pulse" />
              <h5 className="font-bold text-foreground">AI Efficiency Flagged</h5>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                By automating slides structures and homework assignments templates, you saved approximately 12 hours of planning time this week!
              </p>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  );
});
