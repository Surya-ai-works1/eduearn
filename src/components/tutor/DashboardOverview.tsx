"use client";

import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  Clock,
  Users,
  BookOpenCheck,
  Calendar,
  FileText,
  Heart,
  Wallet,
  HardDrive,
  Brain,
  Activity,
  Plus,
  Sparkles,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { StatCard } from "./StatCard";
import { NoClasses } from "./EmptyState";
import type { TutorCourse, StudentProgress, LiveSession, Review, EarningsBalance } from "./types";
import { navigateToClassroom } from "../../features/classroom/utils/navigation";
import { useRouter } from "next/navigation";
import type { PaymentService } from "../../features/payments/services/paymentService";
import type { TutorDashboardStatistics, RecentEnrollment, RecentActivity } from "../../lib/types/tutorDashboard";

interface DashboardOverviewProps {
  user: { fullName: string } | null;
  myCourses: TutorCourse[];
  students: StudentProgress[];
  liveSessions: LiveSession[];
  reviews: Review[];
  earningsBalance: EarningsBalance;
  aiTokensUsed: number;
  platformConfig: { aiCredits: number; storageLimit: number; freeTrialDays: number };
  trialDaysRemaining: number;
  onTabChange: (tab: string) => void;
  onCreateCourse: () => void;
  onScheduleLive: () => void;
  statistics?: TutorDashboardStatistics;
  recentEnrollments?: RecentEnrollment[];
  recentActivities?: RecentActivity[];
}

export const DashboardOverview = React.memo(function DashboardOverview({
  user,
  myCourses,
  students,
  liveSessions,
  reviews,
  earningsBalance,
  aiTokensUsed,
  platformConfig,
  trialDaysRemaining,
  onTabChange,
  onCreateCourse,
  onScheduleLive,
  statistics,
  recentEnrollments,
  recentActivities,
}: DashboardOverviewProps) {
  const router = useRouter();

  const stats = useMemo(() => {
    if (statistics) {
      return [
        {
          label: "Monthly Revenue",
          value: `₹${statistics.monthlyRevenue.toLocaleString()}`,
          icon: Coins,
          colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        },
        {
          label: "Active Students",
          value: `${statistics.activeStudents}`,
          icon: Users,
          colorClass: "text-primary bg-primary/10 border-primary/20",
        },
        {
          label: "Published Courses",
          value: `${statistics.publishedCourses}`,
          icon: BookOpenCheck,
          colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        },
        {
          label: "Total Revenue",
          value: `₹${statistics.totalRevenue.toLocaleString()}`,
          icon: Wallet,
          colorClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        },
        {
          label: "Pending Assignments",
          value: `${statistics.pendingAssignments}`,
          icon: FileText,
          colorClass: "text-sky-500 bg-sky-500/10 border-sky-500/20",
        },
        {
          label: "Pending Reviews",
          value: `${statistics.pendingReviews}`,
          icon: Heart,
          colorClass: "text-pink-500 bg-pink-500/10 border-pink-500/20",
        },
        {
          label: "Total Students",
          value: `${statistics.totalStudents}`,
          icon: Users,
          colorClass: "text-teal-500 bg-teal-500/10 border-teal-500/20",
        },
        {
          label: "Draft Courses",
          value: `${statistics.draftCourses}`,
          icon: FileText,
          colorClass: "text-slate-500 bg-slate-500/10 border-slate-500/20",
        },
      ];
    }

    return [
      {
        label: "Monthly Revenue",
        value: `₹${earningsBalance.total.toLocaleString()}`,
        icon: Coins,
        colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        trend: "12%",
        trendUp: true,
      },
      {
        label: "Active Students",
        value: `${students.length}`,
        icon: Users,
        colorClass: "text-primary bg-primary/10 border-primary/20",
        trend: "3 new",
        trendUp: true,
      },
      {
        label: "Published Courses",
        value: `${myCourses.filter((c) => c.status === "published").length}`,
        icon: BookOpenCheck,
        colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      },
      {
        label: "Avg Rating",
        value: reviews.length > 0
          ? `${(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)} ★`
          : "—",
        icon: Heart,
        colorClass: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      },
      {
        label: "Pending Reviews",
        value: `${students.filter((s) => s.assignmentStatus === "Submitted").length}`,
        icon: FileText,
        colorClass: "text-sky-500 bg-sky-500/10 border-sky-500/20",
      },
      {
        label: "Available Balance",
        value: `₹${earningsBalance.available.toLocaleString()}`,
        icon: Wallet,
        colorClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      },
      {
        label: "Live Classes",
        value: `${liveSessions.filter((s) => s.status === "Scheduled").length} scheduled`,
        icon: Calendar,
        colorClass: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      },
      {
        label: "Pending Payout",
        value: `₹${earningsBalance.pending.toLocaleString()}`,
        icon: Clock,
        colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      },
    ];
  }, [statistics, earningsBalance, students, myCourses, reviews, liveSessions]);

  const pendingReviewStudents = useMemo(
    () => students.filter((s) => s.assignmentStatus === "Submitted"),
    [students]
  );

  const handleLaunchClass = useCallback(
    (id: string) => navigateToClassroom(router, id),
    [router]
  );

  return (
    <motion.div
      key="tutor-dashboard"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <Card
        variant="glass"
        className="p-6 border-primary/10 bg-gradient-to-br from-primary/5 to-primary/[0.02] flex items-center justify-between relative overflow-hidden"
      >
        <div className="space-y-2 relative z-10">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary">
            Welcome back
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
            Hey, {user?.fullName?.split(" ")[0] || "Tutor"}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold max-w-md leading-relaxed">
            You&apos;ve earned{" "}
            <strong className="text-foreground">₹{earningsBalance.total.toLocaleString()}</strong>{" "}
            this month. Keep publishing to grow your reach.
          </p>
        </div>
        <Sparkles size={44} className="text-primary/15 shrink-0 hidden sm:block" />
      </Card>

      {/* Managed Tutor Allocation & Status Pipeline Banner */}
      <Card variant="glass" className="p-5 border-primary/20 bg-muted/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-3">
          <div>
            <h3 className="text-sm font-heading font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="text-primary animate-pulse" size={18} />
              Managed Tutor Status Pipeline &amp; Student Allocation
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              EduEarn manages course pricing, student enrollment, and batch creation so you can focus 100% on teaching.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              70% Payout Share
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Batch Cap: 25 Students
            </span>
          </div>
        </div>

        {/* Pipeline Step Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 select-none">
          {[
            { label: "1. Approved", active: true, done: true },
            { label: "2. Awaiting Course", active: true, done: true },
            { label: "3. Course Assigned", active: true, done: true },
            { label: "4. Students Allocated", active: true, done: true },
            { label: "5. Teaching Active", active: true, done: true },
          ].map((st, idx) => (
            <div key={idx} className={`p-2.5 rounded-lg border text-left flex flex-col justify-between ${
              st.done ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-card border-border/60 text-muted-foreground"
            }`}>
              <span className="text-[9px] font-extrabold uppercase tracking-wider">{st.label}</span>
              <span className="text-[10px] font-bold mt-1 flex items-center gap-1">
                {st.done ? "✓ Active" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.colorClass}
            trend={stat.trend}
            trendUp={stat.trendUp}
            delay={idx * 0.03}
          />
        ))}
      </div>

      {/* Pending assignment alerts */}
      {pendingReviewStudents.length > 0 && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-card p-4 flex items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <FileText size={15} />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
              <strong>{pendingReviewStudents.length}</strong> assignment
              {pendingReviewStudents.length > 1 ? "s" : ""} waiting for your review
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTabChange("assignments")}
            className="h-8 text-xs shrink-0 font-bold"
          >
            Review Now
          </Button>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6">
        <div className="space-y-8">
          {/* Upcoming live sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-heading font-extrabold uppercase tracking-wider text-foreground">
                Today&apos;s Schedule
              </h3>
              <button
                onClick={() => onTabChange("live-classes")}
                className="text-xs font-extrabold text-primary hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>
            {liveSessions.length === 0 ? (
              <NoClasses onAction={onScheduleLive} />
            ) : (
              <div className="space-y-3">
                {liveSessions.slice(0, 3).map((live) => (
                  <div
                    key={live.id}
                    className="card-surface p-3.5 rounded-card flex items-center justify-between gap-3 shadow-soft"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                        <Calendar size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{live.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{live.time}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleLaunchClass(live.id)}
                      size="sm"
                      className="h-7 text-[10px] shrink-0 font-bold"
                    >
                      Launch
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-heading font-extrabold uppercase tracking-wider text-foreground">
                  Recent Reviews
                </h3>
                <button
                  onClick={() => onTabChange("reviews")}
                  className="text-xs font-extrabold text-primary hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
              {reviews.slice(0, 2).map((rev) => (
                <div key={rev.id} className="card-surface p-4 rounded-card space-y-2 shadow-soft">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-foreground">{rev.authorName}</span>
                    <span className="font-black text-amber-500">⭐ {rev.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">{rev.courseTitle}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recent Enrollments Table */}
          {recentEnrollments && (
            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-heading font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <span>🎓</span> Recent Enrollments
                </h3>
              </div>
              {recentEnrollments.length === 0 ? (
                <Card className="p-6 text-center text-xs text-muted-foreground bg-card/50">
                  No recent enrollments.
                </Card>
              ) : (
                <div className="border border-border rounded-card overflow-hidden bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Course</th>
                          <th className="p-3">Enrolled At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {recentEnrollments.map((e) => (
                          <tr key={e.id} className="hover:bg-muted/30">
                            <td className="p-3 font-bold text-foreground">{e.studentName}</td>
                            <td className="p-3 text-muted-foreground">{e.courseName}</td>
                            <td className="p-3 text-muted-foreground/80">
                              {new Date(e.enrolledAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Quick Actions + Resource Usage */}
        <div className="space-y-6">
          <Card variant="default" className="p-5 shadow-soft">
            <h4 className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2 mb-4">
              Quick Actions
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Create Course", action: onCreateCourse, icon: BookOpenCheck, primary: true },
                { label: "Upload Lesson", tab: "courses", icon: Calendar },
                { label: "Create Assignment", tab: "assignments", icon: FileText },
                { label: "Create Quiz", tab: "courses", icon: Brain },
                { label: "View Students", tab: "students", icon: Users },
                { label: "Analytics", tab: "analytics", icon: Activity },
                { label: "Earnings", tab: "finance", icon: Wallet },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item.action) item.action();
                      else if (item.tab) onTabChange(item.tab);
                    }}
                    className={`w-full py-2 px-3.5 rounded-button text-xs font-extrabold flex items-center justify-between cursor-pointer focus:outline-none transition-all ${
                      item.primary
                        ? "bg-primary text-white hover:opacity-90 shadow-soft"
                        : "bg-muted hover:bg-muted/70 text-foreground"
                    }`}
                  >
                    <span>{item.label}</span>
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity Feed */}
          {recentActivities && (
            <Card variant="glass" className="p-5 space-y-4">
              <h4 className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                Recent Student Activity
              </h4>
              {recentActivities.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent activity.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentActivities.map((a) => (
                    <div
                      key={a.id}
                      className="text-xs flex items-start gap-2.5 border-b border-border/10 pb-2.5 last:border-0 last:pb-0"
                    >
                      <span className="mt-0.5 select-none text-sm leading-none">
                        {a.type === "enrollment" ? "🎓" : a.type === "submission" ? "📝" : "⭐"}
                      </span>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-bold text-foreground leading-snug break-words">{a.title}</p>
                        <span className="text-[8px] text-muted-foreground/80 block mt-0.5">
                          {new Date(a.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Resource usage */}
          <Card variant="glass" className="p-5 space-y-4">
            <h4 className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
              Usage
            </h4>
            {[
              { label: "Storage", icon: HardDrive, current: "152 MB", max: `${platformConfig.storageLimit} GB`, pct: 3 },
              { label: "AI Credits", icon: Brain, current: `${aiTokensUsed}`, max: `${platformConfig.aiCredits}`, pct: (aiTokensUsed / platformConfig.aiCredits) * 100 },
              { label: "Bandwidth", icon: Activity, current: "1.2 GB", max: "25 GB", pct: 4.8 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] sm:text-xs font-bold">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Icon size={13} className="text-primary shrink-0" />
                      {item.label}
                    </span>
                    <span className="text-foreground">{item.current} / {item.max}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.pct > 80 ? "bg-rose-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(item.pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </motion.div>
  );
});
