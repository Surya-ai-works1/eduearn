"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import {
  GraduationCap,
  Briefcase,
  Settings,
  Rocket,
  ArrowUpRight,
  Moon,
  Sun,
  Trash2,
  RefreshCw,
  LayoutGrid,
  Terminal,
  FileText,
  Copy,
} from "lucide-react";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function DevLauncherPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isDev) {
    return notFound();
  }

  if (!mounted) {
    return null;
  }

  const handleOpen = (role: string) => {
    window.open(`/dev/${role}`, "_blank");
  };

  const handleOpenAll = () => {
    window.open("/dev/student", "_blank");
    window.open("/dev/tutor", "_blank");
    window.open("/dev/admin", "_blank");
    toast.success("Launching all three role panels simultaneously...");
  };

  // Toolbox Handlers
  const handleClearLocalStorage = () => {
    localStorage.clear();
    toast.success("Cleared Local Storage!");
  };

  const handleClearSessionStorage = () => {
    sessionStorage.clear();
    toast.success("Cleared Session Storage!");
  };

  const handleClearCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    toast.success("Cleared all cookies!");
  };

  const handleResetMockDB = () => {
    localStorage.removeItem("eduearn_mock_session");
    localStorage.removeItem("eduearn_coins");
    localStorage.removeItem("eduearn_notifications");
    localStorage.removeItem("eduearn_wishlist");
    localStorage.removeItem("eduearn_downloads");
    document.cookie = "eduearn-bypass-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    useAuth.setState({ user: null, isAuthenticated: false });
    toast.success("Mock database configuration reset successfully!");
  };

  const handleResetNotifications = () => {
    localStorage.removeItem("eduearn_notifications");
    toast.success("Mock notifications list has been reset.");
  };

  const handleResetWishlist = () => {
    localStorage.removeItem("eduearn_wishlist");
    toast.success("Mock wishlist has been reset.");
  };

  const handleResetAttendance = () => {
    localStorage.removeItem("eduearn_attendance");
    toast.success("Mock attendance log has been reset.");
  };

  const handleResetCourseProgress = () => {
    localStorage.removeItem("eduearn_course_progress");
    toast.success("Mock course learning progress has been reset.");
  };

  const handleResetDashboard = () => {
    localStorage.removeItem("eduearn_mock_session");
    localStorage.removeItem("eduearn_coins");
    localStorage.removeItem("eduearn_notifications");
    localStorage.removeItem("eduearn_wishlist");
    localStorage.removeItem("eduearn_downloads");
    localStorage.removeItem("eduearn_attendance");
    localStorage.removeItem("eduearn_course_progress");
    document.cookie = "eduearn-bypass-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    useAuth.setState({ user: null, isAuthenticated: false });
    toast.success("All mock configurations and dashboard variables reset.");
  };

  const handleOpenMobilePreview = () => {
    window.open("/", "_blank", "width=375,height=812");
    toast.success("Simulated mobile preview window opened.");
  };

  const handleCopyMockSession = () => {
    const currentSession = localStorage.getItem("eduearn_mock_session");
    if (currentSession) {
      navigator.clipboard.writeText(currentSession);
      toast.success("Active mock session JSON payload copied to clipboard!");
    } else {
      toast.error("No active mock session exists to copy.");
    }
  };

  return (
    <PageWrapper>
      <section className="w-full py-16 min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden select-none">
        {/* Decorative ambient blur background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <Container className="max-w-5xl relative z-10 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-[9px] uppercase tracking-widest font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/25">
              EduEarn Internal Developer Console
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground mt-3 tracking-tight">
              Multi-Role Workspace Preview
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Launch and test Student, Tutor, and Admin classified dashboards simultaneously under a single Next.js local host dev server.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Student Card */}
            <Card
              variant="glass"
              className="p-5 border-border/80 hover:border-blue-500/25 transition-all flex flex-col justify-between gap-5 text-left group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-black text-foreground group-hover:text-blue-500 transition-colors">
                    👨🎓 Student
                  </h3>
                  <span className="text-[9px] font-mono text-muted-foreground/80 block mt-0.5">student@eduearn.com</span>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed mt-2.5 font-medium">
                    Preview mock student workflows, attendance logs, saved certificates, and AI study outlines.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleOpen("student")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] uppercase tracking-wider py-3 flex items-center justify-center gap-1 shadow-soft"
              >
                Open Student Panel <ArrowUpRight size={12} />
              </Button>
            </Card>

            {/* Tutor Card */}
            <Card
              variant="glass"
              className="p-5 border-border/80 hover:border-emerald-500/25 transition-all flex flex-col justify-between gap-5 text-left group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-black text-foreground group-hover:text-emerald-500 transition-colors">
                    👩🏫 Tutor
                  </h3>
                  <span className="text-[9px] font-mono text-muted-foreground/80 block mt-0.5">tutor@eduearn.com</span>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed mt-2.5 font-medium">
                    Inspect tutor studio, course creator guidelines, active cohorts, and earnings dashboards.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleOpen("tutor")}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider py-3 flex items-center justify-center gap-1 shadow-soft"
              >
                Open Tutor Panel <ArrowUpRight size={12} />
              </Button>
            </Card>

            {/* Admin Card */}
            <Card
              variant="glass"
              className="p-5 border-border/80 hover:border-purple-500/25 transition-all flex flex-col justify-between gap-5 text-left group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-black text-foreground group-hover:text-purple-500 transition-colors">
                    🛠 Admin
                  </h3>
                  <span className="text-[9px] font-mono text-muted-foreground/80 block mt-0.5">admin@eduearn.com</span>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed mt-2.5 font-medium">
                    Access administrative moderation menus, course approvals, user reports, and analytics metrics.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleOpen("admin")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[9px] uppercase tracking-wider py-3 flex items-center justify-center gap-1 shadow-soft"
              >
                Open Admin Panel <ArrowUpRight size={12} />
              </Button>
            </Card>

            {/* Launch All Card */}
            <Card
              variant="default"
              className="p-5 border-primary/20 bg-primary/5 transition-all flex flex-col justify-between gap-5 text-left group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <Rocket size={20} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-black text-foreground group-hover:text-primary transition-colors">
                    🚀 Open All
                  </h3>
                  <span className="text-[9px] font-mono text-muted-foreground/80 block mt-0.5">3 Roles · 1 Dev Server</span>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed mt-2.5 font-medium">
                    Click to launch all Student, Tutor, and Admin preview panels simultaneously in separate tabs.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOpenAll}
                className="w-full font-bold text-[9px] uppercase tracking-wider py-3 flex items-center justify-center gap-1 shadow-premium bg-primary text-white"
              >
                Open All Panels <ArrowUpRight size={12} />
              </Button>
            </Card>
          </div>

          {/* Developer Toolbox Section */}
          <div className="space-y-6 pt-6 border-t border-border/40 text-left">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-primary" />
              <h2 className="text-base font-heading font-black text-foreground uppercase tracking-wider">
                Developer Preview Toolbox
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Reset Controls */}
              <Card variant="glass" className="p-5 space-y-4 border-border bg-card">
                <h4 className="text-xs font-bold text-foreground border-b border-border/40 pb-2 mb-2 flex items-center gap-1.5">
                  <Trash2 size={13} className="text-destructive" /> Reset Controls
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleResetMockDB}
                    className="px-2.5 py-2 border border-border/80 hover:border-destructive/20 hover:bg-destructive/5 rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left"
                  >
                    Reset Mock DB
                  </button>
                  <button
                    type="button"
                    onClick={handleResetNotifications}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left"
                  >
                    Reset Notifications
                  </button>
                  <button
                    type="button"
                    onClick={handleResetWishlist}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left"
                  >
                    Reset Wishlist
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAttendance}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left"
                  >
                    Reset Attendance
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCourseProgress}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left"
                  >
                    Reset Progress
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDashboard}
                    className="px-2.5 py-2 border border-border/80 hover:border-destructive/30 hover:bg-destructive/5 text-destructive rounded-lg text-[9.5px] font-bold transition-all cursor-pointer text-left col-span-2"
                  >
                    Full Dashboard Reset
                  </button>
                </div>
              </Card>

              {/* Utility Tools */}
              <Card variant="glass" className="p-5 space-y-4 border-border bg-card">
                <h4 className="text-xs font-bold text-foreground border-b border-border/40 pb-2 mb-2 flex items-center gap-1.5">
                  <LayoutGrid size={13} className="text-primary" /> Utility Controls
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left flex items-center gap-1"
                  >
                    <Moon size={11} /> Toggle Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left flex items-center gap-1"
                  >
                    <Sun size={11} /> Toggle Light
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenMobilePreview}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left col-span-2"
                  >
                    Open Mobile Preview (375x812)
                  </button>
                  <button
                    type="button"
                    onClick={handleClearLocalStorage}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left"
                  >
                    Clear LocalStorage
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSessionStorage}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left"
                  >
                    Clear SessionStorage
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCookies}
                    className="px-2.5 py-2 border border-border/80 hover:bg-muted rounded-lg text-[9.5px] font-bold text-foreground transition-all cursor-pointer text-left col-span-2"
                  >
                    Clear All Browser Cookies
                  </button>
                </div>
              </Card>

              {/* Recommended Testing Layout */}
              <Card variant="glass" className="p-5 space-y-4 border-border bg-card">
                <h4 className="text-xs font-bold text-foreground border-b border-border/40 pb-2 mb-2 flex items-center gap-1.5">
                  📐 Recommended Testing Layout
                </h4>
                <div className="space-y-2 text-[10px] text-muted-foreground font-semibold">
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-blue-500">Monitor</span>
                    <span className="text-foreground font-bold">Student Panel</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-500">Laptop Left</span>
                    <span className="text-foreground font-bold">Tutor Panel</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-purple-500">Laptop Right</span>
                    <span className="text-foreground font-bold">Admin Panel</span>
                  </div>
                </div>
              </Card>

              {/* Session Payload & Diagnostics */}
              <Card variant="glass" className="p-5 space-y-4 border-border bg-card flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground border-b border-border/40 pb-2 mb-2 flex items-center gap-1.5">
                    <FileText size={13} className="text-primary" /> Diagnostics & Info
                  </h4>
                  <div className="space-y-2 text-[10px] text-muted-foreground font-semibold">
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span>Current Environment:</span>
                      <span className="text-foreground lowercase font-mono">development</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span>Build Status:</span>
                      <span className="text-emerald-500 font-bold">Ready</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span>Current Theme:</span>
                      <span className="text-foreground capitalize">{theme || "system"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span>Current Mock User:</span>
                      <span className="text-foreground font-bold">{user ? user.fullName : "None"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleCopyMockSession}
                    disabled={!user}
                    className="w-full px-2.5 py-2.5 bg-primary text-white border-none rounded-lg text-[9.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Copy size={11} /> Copy Current Session JSON
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
