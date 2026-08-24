"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageWrapper } from "../components/layout/PageWrapper";
import { HeroLayout } from "../components/layout/HeroLayout";
import { HeroIllustration } from "../components/layout/HeroIllustration";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
// Homepage Sections (Phase 2.2)
import { TrustedBy } from "../components/layout/TrustedBy";
import { ExploreCategories } from "../components/layout/ExploreCategories";
import { FeaturedCourses } from "../components/layout/FeaturedCourses";
import { LearningPaths } from "../components/layout/LearningPaths";
import { StatsGrid } from "../components/layout/StatsGrid";
import { WhyEduEarn } from "../components/layout/WhyEduEarn";

// Homepage Sections (Phase 2.3)
import { TopTutors } from "../components/layout/TopTutors";
import { LiveClasses } from "../components/layout/LiveClasses";
import { AiFeatures } from "../components/layout/AiFeatures";
import { BecomeTutor } from "../components/layout/BecomeTutor";
import { SuccessStories } from "../components/layout/SuccessStories";
import { MobileAppPreview } from "../components/layout/MobileAppPreview";
import { FaqSection } from "../components/layout/FaqSection";
import { Newsletter } from "../components/layout/Newsletter";
import { useAuth } from "../hooks/useAuth";
import { Tuitions } from "../components/layout/Tuitions";
import { AdminOperatingSystem } from "../components/admin/AdminOperatingSystem";
import { cn } from "../utils/cn";
import { TutorProvider, useTutor } from "../context/TutorContext";
import { useMemo } from "react";
import { 
  BookOpen, 
  Video, 
  Users, 
  TrendingUp, 
  Wallet, 
  Clock, 
  Plus, 
  Calendar, 
  Award, 
  FileText, 
  Activity, 
  ArrowUpRight, 
  Edit, 
  BarChart3, 
  CheckCircle,
  HelpCircle,
  Heart
} from "lucide-react";

import {
  HoverLift,
  FloatingAnimation,
  AnimatedCounter,
  RevealOnScroll,
} from "../components/animations";

function TutorHomepageWorkspace() {
  const {
    myCourses = [],
    students = [],
    liveSessions = [],
    earningsBalanceState = { total: 0, available: 0, pending: 0 },
    recentActivities = [],
  } = useTutor();
  const router = useRouter();

  // Metrics calculations
  const totalCourses = myCourses.length;
  const activeStudents = students.length;
  const totalEarnings = earningsBalanceState.total || 0;
  const averageRating = useMemo(() => {
    const rated = myCourses.filter(c => c.rating > 0);
    if (rated.length === 0) return 4.8;
    return Number((rated.reduce((sum, c) => sum + c.rating, 0) / rated.length).toFixed(1));
  }, [myCourses]);

  const recentActivitiesList = useMemo(() => {
    if (recentActivities && recentActivities.length > 0) return recentActivities;
    return [
      { id: "act-1", title: "New enrollment in Python Basics", type: "enrollment", detail: "Aarav Sharma enrolled", time: "2 hours ago" },
      { id: "act-2", title: "Student completed lesson", type: "progress", detail: "Meera Nair finished 'Control Flow'", time: "4 hours ago" },
      { id: "act-3", title: "New student question", type: "question", detail: "Kabir Dev asked about 'OOP Polymorphism'", time: "1 day ago" },
      { id: "act-4", title: "New review received", type: "review", detail: "5 stars from Ishaan Gupta on Web Dev", time: "2 days ago" },
      { id: "act-5", title: "Certificate issued", type: "certificate", detail: "Riya Verma completed React Masterclass", time: "3 days ago" },
    ];
  }, [recentActivities]);

  const upcomingClasses = useMemo(() => {
    if (liveSessions && liveSessions.length > 0) {
      return liveSessions.filter(s => s.status === "Scheduled");
    }
    return [
      { 
        id: "live-1", 
        title: "Python Advanced OOP Doubt Clearing", 
        time: "04:00 PM (2026-08-20)", 
        studentsCount: 18, 
        maxParticipants: 25, 
        status: "Scheduled" as const,
        countdown: "",
        meetingLink: "",
        platform: "Google Meet" as const
      },
      { 
        id: "live-2", 
        title: "React State Management Live Q&A", 
        time: "06:00 PM (2026-08-22)", 
        studentsCount: 22, 
        maxParticipants: 25, 
        status: "Scheduled" as const,
        countdown: "",
        meetingLink: "",
        platform: "Google Meet" as const
      },
    ];
  }, [liveSessions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* 1. Quick Actions & Earnings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Card */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-soft flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Financial Summary</span>
            <h3 className="text-2xl font-extrabold text-foreground">Earnings Wallet</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 my-6">
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Revenue</p>
              <p className="text-xl font-extrabold text-foreground mt-0.5">₹{totalEarnings.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Available Balance</p>
              <p className="text-xl font-extrabold text-emerald-500 mt-0.5">₹{earningsBalanceState.available.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Pending Payout</p>
              <p className="text-sm font-extrabold text-amber-500 mt-0.5">₹{earningsBalanceState.pending.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">This Month</p>
              <p className="text-sm font-extrabold text-foreground mt-0.5">₹{(totalEarnings * 0.45).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/tutor/wallet")}
            className="w-full py-2 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-button transition flex items-center justify-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <Wallet size={13} />
            <span>Open Wallet View</span>
          </button>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-soft flex flex-col justify-between col-span-2">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Shortcuts</span>
            <h3 className="text-2xl font-extrabold text-foreground">Creator Actions</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
            {[
              { label: "Create Course", icon: Plus, path: "/tutor/studio/create" },
              { label: "Upload Lesson", icon: FileText, path: "/tutor/studio" },
              { label: "Schedule Live Class", icon: Video, path: "/tutor/live-classes" },
              { label: "View Students", icon: Users, path: "/tutor/students" },
              { label: "View Analytics", icon: BarChart3, path: "/tutor/analytics" },
              { label: "Open Wallet", icon: Wallet, path: "/tutor/wallet" },
            ].map((act, i) => {
              const Icon = act.icon;
              return (
                <button
                  key={i}
                  onClick={() => router.push(act.path)}
                  className="p-3 border border-border/80 hover:border-primary/40 bg-muted/10 hover:bg-muted/30 rounded-lg text-left transition flex flex-col gap-2 group cursor-pointer focus:outline-none bg-transparent"
                >
                  <Icon size={16} className="text-primary group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-foreground leading-tight">{act.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold">Quick access routes to managed Tutor studio features.</p>
        </div>
      </div>

      {/* 2. Tutor Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Courses Created", value: `${totalCourses} Courses`, icon: BookOpen, color: "text-primary bg-primary/10 border-primary/20" },
          { label: "Active Students", value: `${activeStudents} Pupils`, icon: Users, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Total Earnings", value: `₹${totalEarnings.toLocaleString()}`, icon: Wallet, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
          { label: "Average Rating", value: `${averageRating} ★`, icon: Award, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-card border border-border p-4 rounded-xl shadow-soft flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10.5px] font-bold text-muted-foreground uppercase">{item.label}</p>
                <h4 className="text-xl font-extrabold text-foreground">{item.value}</h4>
              </div>
              <span className={`p-2 rounded-lg shrink-0 ${item.color}`}><Icon size={16} /></span>
            </div>
          );
        })}
      </div>

      {/* 3. My Courses & Live Classes (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 select-none font-heading">
              <BookOpen size={16} className="text-primary" />
              Manage My Courses
            </h3>
            <button
              onClick={() => router.push("/tutor/studio")}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
            >
              <span>Tutor Studio</span>
              <ArrowUpRight size={11} />
            </button>
          </div>

          <div className="space-y-3.5">
            {myCourses.length === 0 ? (
              <div className="border border-border rounded-xl p-8 text-center text-xs text-muted-foreground/60 bg-muted/5">
                No courses created yet. Let&apos;s build one!
              </div>
            ) : (
              myCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="bg-card border border-border hover:border-primary/20 p-4 rounded-xl transition flex flex-col justify-between gap-4 shadow-sm">
                  <div className="flex justify-between items-start gap-4 text-left">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          course.status === "published" 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                            : course.status === "draft"
                            ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {course.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold bg-muted/40 px-2 py-0.5 rounded">
                          {course.studentsCount} Enrolled
                        </span>
                        <span className="text-[9px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                          {course.status === "draft" ? "Draft Stage" : "Active Cohort"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-foreground leading-snug">{course.title}</h4>
                      <p className="text-[10.5px] text-muted-foreground font-semibold">
                        Category: {course.category} • Level: {course.level} • <span className="text-foreground">12 Lessons (10h 30m)</span>
                      </p>
                    </div>
                    {course.rating > 0 && (
                      <span className="text-[10px] font-black text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/15 shrink-0 select-none">
                        {course.rating} ★
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 border-t border-border/40 pt-3 select-none">
                    <button
                      onClick={() => router.push(`/tutor/studio/manage/${course.id}`)}
                      className="px-3 py-1.5 bg-primary text-white text-[10.5px] font-bold rounded hover:opacity-95 transition flex items-center gap-1 cursor-pointer border-none"
                    >
                      <Edit size={11} />
                      <span>Edit Curriculum</span>
                    </button>
                    <button
                      onClick={() => router.push(`/tutor/studio/manage/${course.id}?tab=settings`)}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10.5px] font-bold rounded transition cursor-pointer border-none"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => router.push("/tutor/analytics")}
                      className="px-3 py-1.5 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground text-[10.5px] font-bold rounded transition ml-auto cursor-pointer border-none"
                    >
                      Analytics
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Classes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 select-none font-heading">
              <Video size={16} className="text-rose-500" />
              Hosting Timetable
            </h3>
            <button
              onClick={() => router.push("/tutor/live-classes")}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
            >
              <span>Cohort Calendar</span>
              <ArrowUpRight size={11} />
            </button>
          </div>

          <div className="space-y-3.5">
            {upcomingClasses.length === 0 ? (
              <div className="border border-border rounded-xl p-8 text-center text-xs text-muted-foreground/60 bg-muted/5">
                No active live classrooms scheduled.
              </div>
            ) : (
              upcomingClasses.slice(0, 3).map((session) => (
                <div key={session.id} className="bg-card border border-border hover:border-rose-500/20 p-4 rounded-xl transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-rose-500/10 text-rose-500 border-rose-500/20">
                        {session.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">Registered: {session.studentsCount || 0}/{session.maxParticipants || 25}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground leading-snug">{session.title}</h4>
                    <p className="text-[10.5px] text-muted-foreground font-bold flex items-center gap-1">
                      <Clock size={11} className="text-primary" />
                      <span>{session.time}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 select-none w-full sm:w-auto justify-end sm:justify-start">
                    <button
                      onClick={() => {
                        toast.success("Connecting securely to Google Meet portal...");
                        router.push("/tutor/live-classes");
                      }}
                      className="px-3 py-1.5 bg-rose-500 text-white text-[10.5px] font-bold rounded hover:opacity-95 transition flex items-center gap-1 cursor-pointer border-none"
                    >
                      <Play size={11} className="fill-white" />
                      <span>Launch Room</span>
                    </button>
                    <button
                      onClick={() => router.push("/tutor/live-classes")}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10.5px] font-bold rounded transition cursor-pointer border-none"
                    >
                      Timetable
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Student Activity & Performance Analytics (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Activity Log */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 select-none font-heading">
            <Activity size={16} className="text-emerald-500 animate-pulse" />
            Concise Student Activity
          </h3>

          <div className="bg-card border border-border rounded-xl divide-y divide-border/40 overflow-hidden shadow-sm text-left">
            {recentActivitiesList.slice(0, 5).map((act, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition">
                <div className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-lg shrink-0 border ${
                    act.type === "enrollment" 
                      ? "text-primary bg-primary/10 border-primary/20" 
                      : act.type === "progress"
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : act.type === "question"
                      ? "text-sky-500 bg-sky-500/10 border-sky-500/20"
                      : act.type === "review"
                      ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      : "text-purple-500 bg-purple-500/10 border-purple-500/20"
                  }`}>
                    {act.type === "enrollment" && <Users size={13} />}
                    {act.type === "progress" && <CheckCircle size={13} />}
                    {act.type === "question" && <HelpCircle size={13} />}
                    {act.type === "review" && <Heart size={13} />}
                    {act.type === "certificate" && <Award size={13} />}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground leading-snug">{act.title}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">{act.detail}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 select-none font-heading">
            <BarChart3 size={16} className="text-indigo-500" />
            Course Performance
          </h3>

          <div className="bg-card border border-border p-5 rounded-xl space-y-4 shadow-sm text-left">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Student Engagement Metrics</span>
            <div className="space-y-3.5">
              {[
                { label: "Course Views", value: "1,245 Views", pct: 75, color: "bg-primary" },
                { label: "Total Enrollments", value: `${students.length} Enrollments`, pct: 60, color: "bg-emerald-500" },
                { label: "Completion Rate", value: "84% Complete", pct: 84, color: "bg-indigo-500" },
                { label: "Avg Star Rating", value: "4.8 / 5.0 Rating", pct: 96, color: "bg-amber-500" },
              ].map((metric, i) => (
                <div key={i} className="space-y-1 text-xs font-semibold">
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="text-foreground">{metric.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted/65 rounded-full overflow-hidden">
                    <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Student Feedback Review Highlight */}
            <div className="border-t border-border/40 pt-4 mt-2 space-y-2">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Feedback Spotlight</span>
              <div className="p-3 bg-muted/10 border border-border/50 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-[9.5px]">
                  <span className="text-foreground">Aarav M. (Python OOP)</span>
                  <span className="text-amber-500">★★★★★</span>
                </div>
                <p className="text-[9.5px] text-muted-foreground italic leading-relaxed">
                  "The hands-on coding exercises are great! Nudge alerts keep me right on track."
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/tutor/analytics")}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-button transition flex items-center justify-center gap-1 cursor-pointer border-none"
            >
              <span>Detailed Analytics Panel</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RootLandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isPublicView, setIsPublicView] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsPublicView(params.get("public") === "true");
    }
  }, []);
  
  // Redirect incomplete users to onboarding steps, allow completed users/admins to view public landing page at "/"
  useEffect(() => {
    if (user) {
      if (!user.complete) {
        if (user.role === "tutor") {
          router.replace("/tutor/onboarding");
        } else {
          router.replace("/complete-profile");
        }
      }
    }
  }, [user, router]);

  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [heroSubtitle, setHeroSubtitle] = useState("Learn from Students. Teach Students. Grow Together. India's AI-Powered Student-to-Student Learning Marketplace.");

  useEffect(() => {
    const loadCms = () => {
      try {
        const stored = localStorage.getItem("eduearn_landing_cms");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.heroSubtitle) setHeroSubtitle(parsed.heroSubtitle);
        }
      } catch {}
    };
    loadCms();
    window.addEventListener("storage", loadCms);
    return () => window.removeEventListener("storage", loadCms);
  }, []);

  // Active index for headline words highlight cycling (0: Learn, 1: Teach, 2: Earn)
  const [activeHeadlineIndex, setActiveHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeadlineIndex((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Left column smooth-cycling animated header
  const animatedTitle = (
    <div
      className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight select-none leading-[1.05] flex flex-col items-start gap-1"
    >
      <span
        style={{
          transform: activeHeadlineIndex === 0 ? "translateX(6px) scale(1.025)" : "translateX(0px) scale(1)",
          filter: activeHeadlineIndex === 0 ? "brightness(1.15)" : "brightness(1)",
          transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform, filter",
        }}
        className="text-blue-600 dark:text-blue-500 inline-block origin-left"
      >
        {user?.role === "tutor" ? "Build." : "Learn."}
      </span>
      <span
        style={{
          transform: activeHeadlineIndex === 1 ? "translateX(6px) scale(1.025)" : "translateX(0px) scale(1)",
          filter: activeHeadlineIndex === 1 ? "brightness(1.15)" : "brightness(1)",
          transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform, filter",
        }}
        className="text-slate-900 dark:text-white inline-block origin-left"
      >
        Teach.
      </span>
      <span
        style={{
          transform: activeHeadlineIndex === 2 ? "translateX(6px) scale(1.025)" : "translateX(0px) scale(1)",
          filter: activeHeadlineIndex === 2 ? "brightness(1.15)" : "brightness(1)",
          transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform, filter",
        }}
        className="text-emerald-600 dark:text-emerald-400 inline-block origin-left"
      >
        Earn.
      </span>
    </div>
  );

  // Floating badge widgets positioned around the hero illustration
  const floatingWidgets = (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-20">

      {/* AI Verified Badge (Top-Left) */}
      <div className="absolute top-[5%] left-[-20px] sm:left-[-40px] pointer-events-auto">
        <FloatingAnimation duration={3.4} yRange={5}>
          <HoverLift lift={-4}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/50 dark:border-border/50 shadow-sm text-slate-800 dark:text-white font-extrabold text-[10px]">
              <span className="text-emerald-500">✓</span>
              <span>AI Verified</span>
            </div>
          </HoverLift>
        </FloatingAnimation>
      </div>

      {/* Live Classes (Top-Right) */}
      <div className="absolute top-[2%] right-[-20px] sm:right-[-40px] pointer-events-auto">
        <FloatingAnimation duration={4.2} yRange={6}>
          <HoverLift lift={-4}>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/50 dark:border-border/50 shadow-sm text-slate-800 dark:text-white font-extrabold text-[10px]">
              <span>🎥</span>
              <span>Live Classes</span>
            </div>
          </HoverLift>
        </FloatingAnimation>
      </div>

      {/* Tutor Earnings (Bottom-Left) */}
      <div className="absolute bottom-[20%] left-[-30px] sm:left-[-50px] pointer-events-auto">
        <FloatingAnimation duration={4.0} yRange={5}>
          <HoverLift lift={-4}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/50 dark:border-border/50 shadow-sm text-slate-800 dark:text-white font-extrabold text-[10px]">
              <span>💰</span>
              <span>Tutor Earnings</span>
            </div>
          </HoverLift>
        </FloatingAnimation>
      </div>

      {/* Certificate Earned (Bottom-Right) */}
      <div className="absolute bottom-[8%] right-[-25px] sm:right-[-45px] pointer-events-auto">
        <FloatingAnimation duration={3.8} yRange={5}>
          <HoverLift lift={-4}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/50 dark:border-border/50 shadow-sm text-slate-800 dark:text-white font-extrabold text-[10px]">
              <span>🏆</span>
              <span>Certificate Earned</span>
            </div>
          </HoverLift>
        </FloatingAnimation>
      </div>

    </div>
  );

  if (user?.role === "tutor" && !isPublicView) {
    return (
      <TutorProvider>
        <div className="w-full relative min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden pt-6">
          <TutorHomepageWorkspace />
        </div>
      </TutorProvider>
    );
  }

  return (
    <div className="w-full relative min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      {/* 1. Landing Page Hero Grid */}
      <HeroLayout
        title={animatedTitle}
        subtitle={heroSubtitle}
        illustration={<HeroIllustration />}
        floatingWidgets={floatingWidgets}
        ctas={
          <div className="flex flex-wrap items-center gap-3.5">
            <Button
              onClick={() => {
                router.push("/courses");
              }}
              size="md"
            >
              Explore Skills
            </Button>
            <Button
              onClick={() => setIsDemoOpen(true)}
              variant="ghost"
              size="md"
              className="flex items-center gap-2 text-foreground font-bold hover:bg-muted"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Play size={10} className="fill-primary ml-0.5" />
              </div>
              Watch Demo
            </Button>
          </div>
        }
        statistics={[
          {
            value: (
              <span className="flex items-baseline">
                <AnimatedCounter value={5000} />+
              </span>
            ),
            label: "Learners",
          },
          {
            value: (
              <span className="flex items-baseline">
                <AnimatedCounter value={200} />+
              </span>
            ),
            label: "Tutors",
          },
          {
            value: (
              <span className="flex items-baseline">
                <AnimatedCounter value={250} />+
              </span>
            ),
            label: "Skill Categories",
          },
          {
            value: (
              <span className="flex items-baseline">
                <AnimatedCounter value={150} />+
              </span>
            ),
            label: "Live Classes",
          },
        ]}
      />

      {/* 2. Conditionally render Admin OS or Student Homepage sections */}
      {user?.role === "admin" || user?.role === "super-admin" ? (
        <AdminOperatingSystem />
      ) : (
        <>
          {/* 2. Trusted By logo wall */}
          <RevealOnScroll direction="fade" delay={0.1}>
            <TrustedBy />
          </RevealOnScroll>
          {/* 2.5. Tuitions (Online Learning Packages) Section */}
          <RevealOnScroll direction="up" delay={0.15}>
            <Tuitions />
          </RevealOnScroll>

          {/* 3. Explore Categories Grid */}
          <RevealOnScroll direction="up" delay={0.15}>
            <ExploreCategories />
          </RevealOnScroll>

          {/* 4. Featured Courses catalog */}
          <RevealOnScroll direction="up" delay={0.15}>
            <FeaturedCourses />
          </RevealOnScroll>

          {/* 5. Learning Paths roadmaps */}
          <RevealOnScroll direction="up" delay={0.15}>
            <LearningPaths />
          </RevealOnScroll>

          {/* 6. Top-Rated Tutors Grid */}
          <RevealOnScroll direction="up" delay={0.15}>
            <TopTutors />
          </RevealOnScroll>

          {/* 7. Live Classes Doubt Sessions */}
          <RevealOnScroll direction="up" delay={0.15}>
            <LiveClasses />
          </RevealOnScroll>

          {/* 8. AI Innovation Capabilities */}
          <RevealOnScroll direction="up" delay={0.15}>
            <AiFeatures />
          </RevealOnScroll>

          {/* 9. Become a Tutor CTA */}
          <RevealOnScroll direction="up" delay={0.15}>
            <BecomeTutor />
          </RevealOnScroll>

          {/* 10. Success Stories Testimonials */}
          <RevealOnScroll direction="fade" delay={0.1}>
            <SuccessStories />
          </RevealOnScroll>

          {/* 11. Stats Achievements counters */}
          <RevealOnScroll direction="fade" delay={0.1}>
            <StatsGrid />
          </RevealOnScroll>

          {/* 12. Why Choose EduEarn Feature Grid */}
          <RevealOnScroll direction="up" delay={0.15}>
            <WhyEduEarn />
          </RevealOnScroll>

          {/* 13. Mobile App Preview mockup */}
          <RevealOnScroll direction="up" delay={0.15}>
            <MobileAppPreview />
          </RevealOnScroll>

          {/* 14. Interactive FAQ Accordion */}
          <RevealOnScroll direction="up" delay={0.15}>
            <FaqSection />
          </RevealOnScroll>

          {/* 15. Newsletter Subscribe Card */}
          <RevealOnScroll direction="fade" delay={0.1}>
            <Newsletter />
          </RevealOnScroll>
        </>
      )}

      {/* Watch Demo Mock Dialog Popup */}
      <Dialog
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        title="EduEarn Platform Demo Video"
        className="max-w-2xl"
      >
        <div className="flex flex-col gap-4 text-xs select-none">
          {/* Mock Video Canvas */}
          <div className="relative w-full aspect-video bg-slate-900 border border-border rounded-card flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient opacity-10" />
            <div className="flex flex-col items-center justify-center gap-3 text-center z-10 p-6">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-premium">
                <Play size={22} className="fill-white ml-1" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">EduEarn Overview</h4>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  A peer learning network helping students teach and earn, while offering high-quality courses for kids, parents, and young learners.
                </p>
              </div>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              0:00 / 1:45
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
            <span className="text-[10px] text-muted-foreground font-semibold">Ready to start? Discover student tutor options.</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsDemoOpen(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsDemoOpen(false);
                  router.push("/tutor/onboarding");
                }}
              >
                Become a Tutor
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
