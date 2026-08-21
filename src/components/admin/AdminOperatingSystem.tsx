"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users, BookOpenCheck, DollarSign, RefreshCw, Search,
  TrendingUp, ShieldCheck, Award, Activity, ShieldAlert,
  Cpu, Key, Building2, FileSpreadsheet, Terminal, Shield,
  FileCheck, Layers, Sparkles, ArrowUpRight, AlertTriangle,
  CheckCircle2, Clock, XCircle, Circle, Info
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  GlobalSearchIndex,
  PlatformEventBus,
  PlatformEvent,
} from "../../lib/services/PlatformIntegrationEngine";
import { toast } from "sonner";

import type {
  AdminUser,
  TutorVerificationApp,
  AdminCourse,
  AdminPayout,
  AdminTransaction,
  SupportTicket,
  AdminReport,
  AdminActivityLog,
} from "../../lib/types/admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: "Operational" | "Degraded" | "Offline" | "Unavailable" | "Attention" }) {
  const colors: Record<string, string> = {
    Operational: "bg-emerald-500",
    Degraded: "bg-amber-500",
    Attention: "bg-amber-500 animate-pulse",
    Offline: "bg-rose-500",
    Unavailable: "bg-slate-400",
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status] ?? "bg-slate-400"}`} />;
}

function SeverityBadge({ level }: { level: "HIGH" | "NORMAL" | "LOW" }) {
  const styles: Record<string, string> = {
    HIGH: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    NORMAL: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    LOW: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${styles[level]}`}>
      {level}
    </span>
  );
}

function formatRelative(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const diffMs = Date.now() - d.getTime();
    const m = Math.floor(diffMs / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdminOperatingSystem() {
  const router = useRouter();
  const { user } = useAuth();

  // Telemetry State
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [verifications, setVerifications] = useState<TutorVerificationApp[]>([]);
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [events, setEvents] = useState<PlatformEvent[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState("");

  type HealthState = "Operational" | "Degraded" | "Offline" | "Unavailable";
  const [health, setHealth] = useState<Record<string, HealthState>>({
    webApp: "Operational",
    database: "Unavailable",
    apis: "Unavailable",
    auth: "Unavailable",
    payments: "Unavailable",
    storage: "Unavailable",
    notifications: "Unavailable",
    ai: "Unavailable",
    audit: "Unavailable",
  });

  const [commandQuery, setCommandQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ module: string; id: string; name: string; info: string }[]>([]);

  // ── Data Loading ─────────────────────────────────────────────────────────────

  const loadTelemetry = useCallback(
    async (manual = false) => {
      manual ? setIsRefreshing(true) : setIsLoading(true);

      const safeGet = async <T,>(url: string): Promise<T | null> => {
        try {
          const r = await fetch(url);
          return r.ok ? ((await r.json()) as T) : null;
        } catch {
          return null;
        }
      };

      try {
        const [dashData, userList, courseList, verList, payData, tickList, repList] =
          await Promise.all([
            safeGet<any>("/api/admin/dashboard"),
            safeGet<AdminUser[]>("/api/admin/users"),
            safeGet<AdminCourse[]>("/api/admin/courses"),
            safeGet<TutorVerificationApp[]>("/api/admin/verifications"),
            safeGet<{ payouts: AdminPayout[]; transactions: AdminTransaction[] }>("/api/admin/payments"),
            safeGet<SupportTicket[]>("/api/admin/tickets"),
            safeGet<AdminReport[]>("/api/admin/reports"),
          ]);

        if (dashData) setStats(dashData);
        if (userList) setUsers(userList);
        if (courseList) setCourses(courseList);
        if (verList) setVerifications(verList);
        if (payData) {
          setPayouts(payData.payouts ?? []);
          setTransactions(payData.transactions ?? []);
        }
        if (tickList) setTickets(tickList);
        if (repList) setReports(repList);
        setEvents(PlatformEventBus.getEvents());

        const now = new Date();
        setLastSynced(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
            " · " +
            now.toISOString().slice(0, 10)
        );

        setHealth({
          webApp: "Operational",
          database: userList || courseList ? "Operational" : "Offline",
          apis: dashData ? "Operational" : "Offline",
          auth: user ? "Operational" : "Offline",
          payments: payData ? "Operational" : "Offline",
          storage:
            typeof window !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL
              ? "Operational"
              : "Unavailable",
          notifications: "Operational",
          ai: "Operational",
          audit: dashData?.recentActivity ? "Operational" : "Offline",
        });

        if (manual) toast.success("Control plane synchronised.");
      } catch {
        toast.error("Telemetry sync failed.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    loadTelemetry();
  }, [loadTelemetry]);

  // Command search
  useEffect(() => {
    setSearchResults(commandQuery.trim() ? GlobalSearchIndex.query(commandQuery) : []);
  }, [commandQuery]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("admin-command-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const nav = (tab: string) => router.push(`/admin/dashboard?tab=${tab}`);

  // ── Derived metrics ───────────────────────────────────────────────────────────

  const pendingVerifications = useMemo(
    () => verifications.filter((v) => v.status === "Pending" || v.status === "Under Review"),
    [verifications]
  );
  const pendingCourses = useMemo(() => courses.filter((c) => c.status === "Pending"), [courses]);
  const pendingPayouts = useMemo(() => payouts.filter((p) => p.status === "Pending"), [payouts]);
  const openTickets = useMemo(() => tickets.filter((t) => t.status === "Open"), [tickets]);
  const pendingReports = useMemo(() => reports.filter((r) => r.status === "Pending"), [reports]);

  const totalPendingActions = pendingVerifications.length + pendingCourses.length + pendingPayouts.length;

  const adminCount = useMemo(
    () => users.filter((u) => u.role === "admin" || u.role === "super-admin").length,
    [users]
  );
  const tutorCount = useMemo(() => users.filter((u) => u.role === "tutor").length, [users]);
  const studentCount = useMemo(
    () => users.filter((u) => u.role === "learner" || u.role === "student").length,
    [users]
  );
  const categoryCount = useMemo(() => new Set(courses.map((c) => c.category)).size, [courses]);

  const grossRevenue = stats?.totalRevenue ?? null;
  const platformShare = grossRevenue !== null ? Math.round(grossRevenue * 0.1) : null;
  const tutorShare = grossRevenue !== null ? Math.round(grossRevenue * 0.9) : null;

  // ── Attention queue ───────────────────────────────────────────────────────────

  const attentionQueue = useMemo(() => {
    const q: Array<{
      id: string;
      severity: "HIGH" | "NORMAL" | "LOW";
      domain: string;
      title: string;
      actor: string;
      timestamp: string;
      status: string;
      tab: string;
    }> = [];

    pendingVerifications.forEach((v) =>
      q.push({
        id: v.id,
        severity: "HIGH",
        domain: "TUTOR",
        title: `Tutor verification: ${v.tutorName}`,
        actor: v.tutorName,
        timestamp: v.created_at || new Date().toISOString(),
        status: v.status,
        tab: "tutor-verification",
      })
    );

    pendingCourses.forEach((c) =>
      q.push({
        id: c.id,
        severity: "HIGH",
        domain: "COURSE",
        title: `Course approval: ${c.title}`,
        actor: c.tutorName || "Tutor",
        timestamp: c.created_at || new Date().toISOString(),
        status: "Pending Approval",
        tab: "courses",
      })
    );

    pendingPayouts.forEach((p) =>
      q.push({
        id: p.id,
        severity: "NORMAL",
        domain: "FINANCE",
        title: `Withdrawal request: ₹${p.amount}`,
        actor: p.tutorName,
        timestamp: p.date || new Date().toISOString(),
        status: p.status,
        tab: "finance",
      })
    );

    openTickets.forEach((t) =>
      q.push({
        id: t.id,
        severity: t.priority === "High" ? "HIGH" : "NORMAL",
        domain: "SUPPORT",
        title: `Support ticket: ${t.title}`,
        actor: t.user,
        timestamp: t.date || new Date().toISOString(),
        status: `${t.priority} Priority`,
        tab: "communication",
      })
    );

    pendingReports.forEach((r) =>
      q.push({
        id: r.id,
        severity: "NORMAL",
        domain: "TRUST",
        title: `Moderation report: ${r.reason}`,
        actor: r.reporterName,
        timestamp: r.date || new Date().toISOString(),
        status: "Pending Review",
        tab: "reports",
      })
    );

    return q.sort((a) => (a.severity === "HIGH" ? -1 : 1));
  }, [pendingVerifications, pendingCourses, pendingPayouts, openTickets, pendingReports]);

  // ── Command strip ─────────────────────────────────────────────────────────────

  const commands = useMemo(
    () => [
      { label: "+ Add Course", icon: BookOpenCheck, tab: "courses" },
      { label: "Approve Tutors", icon: ShieldCheck, tab: "tutor-verification", badge: pendingVerifications.length },
      { label: "Review Courses", icon: FileCheck, tab: "courses", badge: pendingCourses.length },
      { label: "Manage Users", icon: Users, tab: "users" },
      { label: "Payments", icon: FileSpreadsheet, tab: "payments" },
      { label: "Withdrawals", icon: DollarSign, tab: "finance", badge: pendingPayouts.length },
      { label: "Reports", icon: ShieldAlert, tab: "reports", badge: pendingReports.length },
      { label: "Organizations", icon: Building2, tab: "organizations" },
      { label: "Certificates", icon: Award, tab: "certificates" },
      { label: "Live Classes", icon: Activity, tab: "live-classes" },
      { label: "AI Features", icon: Sparkles, tab: "ai" },
      { label: "Settings", icon: Key, tab: "settings" },
    ],
    [pendingVerifications.length, pendingCourses.length, pendingPayouts.length, pendingReports.length]
  );

  // ── Tab Map for search ────────────────────────────────────────────────────────

  const searchTabMap: Record<string, string> = {
    Course: "courses",
    User: "users",
    Student: "users",
    Tutor: "users",
    Category: "categories",
    Payment: "payments",
    Certificate: "certificates",
    Organization: "organizations",
    "Audit Log": "audit-logs",
    "Support Ticket": "communication",
    Report: "reports",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      id="admin-os-root"
      className="w-full bg-[#f6f8fb] dark:bg-[#080c14] text-slate-900 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800/70 font-sans antialiased"
    >
      <div className="w-[min(96vw,1700px)] mx-auto py-8 md:py-10 flex flex-col gap-7">

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 1 — OS IDENTITY HEADER
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest block">
              Central Platform Control Plane
            </span>
            <h1 className="text-3xl md:text-[38px] font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 leading-none">
              <Terminal size={28} className="text-blue-600 shrink-0" />
              EduEarn Admin OS
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mt-1">
              Operate users, learning, commerce, AI, security, community and platform infrastructure from one central control layer.
            </p>
          </div>

          {/* Status panel */}
          <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-0 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0 shadow-inner text-xs">
            {[
              { label: "ACTIVE ADMIN", value: user?.fullName || user?.email || "—" },
              { label: "CLEARANCE", value: (user?.role || "ADMIN").toUpperCase() },
              { label: "STATUS", value: "ACTIVE", valueClass: "text-emerald-500 flex items-center gap-1" },
              { label: "LAST SYNC", value: lastSynced ? lastSynced.split(" ")[0] : "—", valueClass: "font-mono" },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0 flex flex-col gap-0.5 min-w-[100px]">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{item.label}</span>
                <span className={`font-extrabold text-slate-900 dark:text-white truncate max-w-[130px] ${item.valueClass ?? ""}`}>
                  {item.label === "STATUS" ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse mr-1" />
                      ACTIVE
                    </>
                  ) : (
                    item.value
                  )}
                </span>
              </div>
            ))}
            <button
              onClick={() => loadTelemetry(true)}
              disabled={isRefreshing}
              className="px-4 py-3 flex flex-col items-center justify-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50 min-w-[64px]"
            >
              <RefreshCw size={14} className={`text-blue-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="text-[10px] font-black text-slate-400 uppercase">SYNC</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 2 — COMMAND SEARCH
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="relative">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 rounded-xl h-[56px] px-4 gap-3 shadow-sm transition">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              id="admin-command-search"
              type="text"
              placeholder="Search users, tutors, courses, payments, reports, settings..."
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-[14px] font-medium focus:outline-none placeholder-slate-400 text-slate-900 dark:text-white"
            />
            <kbd className="hidden sm:inline-flex h-6 items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 font-mono text-[11px] font-medium text-slate-400 shrink-0">
              ⌘K
            </kbd>
            {commandQuery && (
              <button onClick={() => setCommandQuery("")} className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
                ESC
              </button>
            )}
            <span className="text-xs font-black text-blue-600 shrink-0 select-none tracking-wider hidden sm:block">EXECUTE</span>
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-[60px] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                {searchResults.length} results
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { setCommandQuery(""); nav(searchTabMap[r.module] ?? "dashboard"); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-800 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {r.module}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{r.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{r.info}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 3 — EXECUTIVE PULSE (4-column)
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* USER PULSE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">User Pulse</span>
              <StatusDot status="Operational" />
            </div>
            <div>
              <p className="text-[34px] font-extrabold leading-none text-slate-900 dark:text-white">
                {isLoading ? "—" : users.length}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                {studentCount} students · {tutorCount} tutors · {adminCount} admins
              </p>
            </div>
            <button onClick={() => nav("users")} className="text-[11px] font-black text-blue-600 hover:underline flex items-center gap-0.5 mt-auto cursor-pointer border-none bg-transparent">
              VIEW USERS <ArrowUpRight size={11} />
            </button>
          </div>

          {/* LEARNING PULSE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Learning Pulse</span>
              <StatusDot status={pendingCourses.length > 0 ? "Attention" : "Operational"} />
            </div>
            <div>
              <p className="text-[34px] font-extrabold leading-none text-slate-900 dark:text-white">
                {isLoading ? "—" : courses.length}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                {courses.filter((c) => c.status === "Approved").length} published ·{" "}
                <span className={pendingCourses.length > 0 ? "text-amber-500" : ""}>{pendingCourses.length} pending</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{stats?.activeEnrollments ?? "—"} enrollments</p>
            </div>
            <button onClick={() => nav("courses")} className="text-[11px] font-black text-blue-600 hover:underline flex items-center gap-0.5 mt-auto cursor-pointer border-none bg-transparent">
              VIEW LEARNING <ArrowUpRight size={11} />
            </button>
          </div>

          {/* COMMERCIAL PULSE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Commercial Pulse</span>
              <StatusDot status="Operational" />
            </div>
            <div>
              <p className="text-[34px] font-extrabold leading-none text-slate-900 dark:text-white">
                {isLoading ? "—" : grossRevenue !== null ? `₹${grossRevenue.toLocaleString()}` : "N/A"}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                ₹{platformShare?.toLocaleString() ?? "—"} platform · ₹{tutorShare?.toLocaleString() ?? "—"} tutors
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingPayouts.length > 0 ? (
                  <span className="text-amber-500">{pendingPayouts.length} payout{pendingPayouts.length > 1 ? "s" : ""} pending</span>
                ) : (
                  "₹0 pending payouts"
                )}
              </p>
            </div>
            <button onClick={() => nav("finance")} className="text-[11px] font-black text-blue-600 hover:underline flex items-center gap-0.5 mt-auto cursor-pointer border-none bg-transparent">
              VIEW FINANCE <ArrowUpRight size={11} />
            </button>
          </div>

          {/* GOVERNANCE PULSE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Governance Pulse</span>
              <StatusDot status={totalPendingActions > 0 ? "Attention" : "Operational"} />
            </div>
            <div>
              <p className="text-[34px] font-extrabold leading-none text-slate-900 dark:text-white">
                {isLoading ? "—" : totalPendingActions}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-semibold">pending actions</p>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className={pendingReports.length > 0 ? "text-rose-500" : ""}>{pendingReports.length} reports</span>
                {" · "}
                <span className={openTickets.length > 0 ? "text-blue-500" : ""}>{openTickets.length} tickets</span>
                {" · 0 incidents"}
              </p>
            </div>
            <button onClick={() => nav("reports")} className="text-[11px] font-black text-blue-600 hover:underline flex items-center gap-0.5 mt-auto cursor-pointer border-none bg-transparent">
              VIEW GOVERNANCE <ArrowUpRight size={11} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 4 — LIVE OPERATIONS SNAPSHOT
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" />
              Live Operations
            </h2>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Real-time snapshot</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-100 dark:divide-slate-800">
            {[
              { label: "Active Users", value: users.filter(u => u.status === "Active").length || users.length, note: "profiles" },
              { label: "Live Classes", value: stats?.liveClasses ?? "N/A", note: "in session" },
              { label: "Pending Actions", value: totalPendingActions, note: "require review", highlight: totalPendingActions > 0 },
              { label: "Support Tickets", value: openTickets.length, note: "open", highlight: openTickets.length > 0 },
              { label: "Security Alerts", value: 0, note: "incidents" },
              { label: "Payment Issues", value: pendingPayouts.length, note: "withdrawals pending", highlight: pendingPayouts.length > 0 },
            ].map((item, i) => (
              <div key={i} className="px-5 py-4 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{item.label}</span>
                <span className={`text-2xl font-extrabold ${item.highlight ? "text-amber-500" : "text-slate-900 dark:text-white"}`}>
                  {isLoading ? "—" : item.value}
                </span>
                <span className="text-[10px] text-slate-400">{item.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 5 — OPERATIONS QUEUE
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu size={16} className="text-blue-600" />
              Operations Queue
            </h2>
            <span className="text-[11px] font-bold text-slate-400">What requires action right now</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
            {[
              { label: "Tutor Approvals", count: pendingVerifications.length, tab: "tutor-verification", severity: pendingVerifications.length > 0 ? "HIGH" : "OK" },
              { label: "Course Approvals", count: pendingCourses.length, tab: "courses", severity: pendingCourses.length > 0 ? "HIGH" : "OK" },
              { label: "Payment Issues", count: pendingPayouts.length, tab: "finance", severity: pendingPayouts.length > 0 ? "NORMAL" : "OK" },
              { label: "Support Tickets", count: openTickets.length, tab: "communication", severity: openTickets.length > 0 ? "NORMAL" : "OK" },
              { label: "Mod. Reports", count: pendingReports.length, tab: "reports", severity: pendingReports.length > 0 ? "NORMAL" : "OK" },
              { label: "Refund Requests", count: 0, tab: "payments", severity: "OK" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => nav(item.tab)}
                className="px-5 py-4 flex flex-col gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 transition text-left cursor-pointer"
              >
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{item.label}</span>
                <span className={`text-xl font-extrabold ${item.count > 0 ? "text-amber-500" : "text-slate-900 dark:text-white"}`}>
                  {item.count}
                </span>
                <span className={`text-[10px] font-black uppercase ${item.severity === "OK" ? "text-emerald-500" : item.severity === "HIGH" ? "text-rose-500" : "text-amber-500"}`}>
                  {item.severity === "OK" ? "CLEAR" : item.severity}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 6 — WHAT NEEDS YOUR ATTENTION
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-500" />
              What Needs Your Attention
            </h2>
            {attentionQueue.length > 5 && (
              <button onClick={() => nav("dashboard")} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer border-none bg-transparent">
                View all {attentionQueue.length} →
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="px-5 py-3 text-left w-24">Severity</th>
                  <th className="px-5 py-3 text-left w-24">Domain</th>
                  <th className="px-5 py-3 text-left">Action Item</th>
                  <th className="px-5 py-3 text-left w-36">Actor</th>
                  <th className="px-5 py-3 text-left w-28">Time</th>
                  <th className="px-5 py-3 text-left w-32">Status</th>
                  <th className="px-5 py-3 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">Loading queue...</td></tr>
                ) : attentionQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <CheckCircle2 size={22} className="text-emerald-500" />
                        <span className="font-extrabold text-sm">No outstanding operational issues</span>
                        <span className="text-xs">All queues are clear</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  attentionQueue.slice(0, 6).map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition h-[58px]">
                      <td className="px-5 py-2"><SeverityBadge level={item.severity} /></td>
                      <td className="px-5 py-2 font-mono text-[11px] font-bold text-slate-400">{item.domain}</td>
                      <td className="px-5 py-2 font-extrabold text-slate-900 dark:text-white text-[13px]">{item.title}</td>
                      <td className="px-5 py-2 text-slate-500 text-[13px] truncate max-w-[130px]">{item.actor}</td>
                      <td className="px-5 py-2 text-slate-400 font-mono text-xs">{formatRelative(item.timestamp)}</td>
                      <td className="px-5 py-2">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.severity === "HIGH" ? "bg-amber-500 animate-pulse" : "bg-slate-300"}`} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-right">
                        <button
                          onClick={() => nav(item.tab)}
                          className="bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-slate-200 dark:border-slate-700 hover:border-blue-600 text-slate-700 dark:text-slate-300 rounded-lg px-3.5 h-8 text-xs font-black uppercase transition cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 7 — QUICK COMMANDS
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4">
          <h2 className="text-[13px] font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
            <Terminal size={13} className="text-blue-600" />
            Quick Commands
          </h2>
          <div className="flex flex-wrap gap-2">
            {commands.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={i}
                  onClick={() => nav(cmd.tab)}
                  className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-slate-200 dark:border-slate-800 hover:border-blue-600 text-slate-700 dark:text-slate-300 rounded-lg px-4 h-10 text-[13px] font-extrabold transition cursor-pointer"
                >
                  <Icon size={14} className="shrink-0" />
                  {cmd.label}
                  {!!cmd.badge && (
                    <span className="ml-1 bg-blue-600 text-white text-[10px] font-mono rounded-full px-1.5 py-0.5 leading-none">
                      {cmd.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 8 — PLATFORM OPERATING DOMAINS
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={16} className="text-indigo-500" />
              Platform Operating Domains
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="px-5 py-3 text-left" style={{width:"22%"}}>Domain</th>
                  <th className="px-5 py-3 text-left" style={{width:"14%"}}>Status</th>
                  <th className="px-5 py-3 text-left" style={{width:"15%"}}>Live Count</th>
                  <th className="px-5 py-3 text-left" style={{width:"16%"}}>Pending Queue</th>
                  <th className="px-5 py-3 text-left" style={{width:"20%"}}>Last Activity</th>
                  <th className="px-5 py-3 text-right" style={{width:"13%"}}>Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { name: "User Operations", status: "Operational" as const, count: `${users.length} profiles`, pending: "0 pending", time: "—", tab: "users" },
                  { name: "Learning Operations", status: (pendingCourses.length > 0 ? "Attention" : "Operational") as any, count: `${courses.length} courses`, pending: `${pendingCourses.length} pending`, time: "—", tab: "courses" },
                  { name: "Business Operations", status: "Operational" as const, count: grossRevenue !== null ? `₹${grossRevenue.toLocaleString()}` : "Unavailable", pending: `${pendingPayouts.length} payouts`, time: "—", tab: "finance" },
                  { name: "Community Operations", status: "Unavailable" as const, count: "No data yet", pending: "—", time: "—", tab: "organizations" },
                  { name: "AI Operations", status: "Operational" as const, count: "2 features active", pending: "Analytics unavail.", time: "—", tab: "ai" },
                  { name: "Security Operations", status: (pendingReports.length > 0 ? "Attention" : "Operational") as any, count: `${reports.length} total reviews`, pending: `${pendingReports.length} reports`, time: "—", tab: "reports" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition h-[52px]">
                    <td className="px-5 py-2 font-extrabold text-slate-900 dark:text-white text-[13px]">
                      <div className="flex items-center gap-2">
                        <StatusDot status={row.status} />
                        {row.name}
                      </div>
                    </td>
                    <td className="px-5 py-2">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${
                        row.status === "Operational" ? "text-emerald-500" :
                        row.status === "Attention" ? "text-amber-500" : "text-slate-400"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-2 font-mono text-slate-600 dark:text-slate-400 text-[13px]">{row.count}</td>
                    <td className="px-5 py-2 font-mono text-[12px] text-slate-400">{row.pending}</td>
                    <td className="px-5 py-2 text-slate-400 font-mono text-xs">{row.time}</td>
                    <td className="px-5 py-2 text-right">
                      <button onClick={() => nav(row.tab)} className="text-blue-600 dark:text-blue-500 hover:underline font-bold text-xs cursor-pointer border-none bg-transparent uppercase">
                        Open →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 9 — PLATFORM HEALTH (3-column grid)
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" />
              Platform Health
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {[
              [
                { key: "webApp", label: "Web Application", provider: "Client / Next.js" },
                { key: "database", label: "Database", provider: "Supabase" },
                { key: "apis", label: "Platform APIs", provider: "Next.js API Routes" },
              ],
              [
                { key: "auth", label: "Authentication", provider: "Supabase Auth" },
                { key: "payments", label: "Payments", provider: "Razorpay" },
                { key: "storage", label: "Storage", provider: "Supabase Storage" },
              ],
              [
                { key: "notifications", label: "Notifications", provider: "SMTP / Email" },
                { key: "ai", label: "AI Services", provider: "Gemini 2.5 Flash" },
                { key: "audit", label: "Audit Logging", provider: "System Trace" },
              ],
            ].map((col, ci) => (
              <div key={ci} className="divide-y divide-slate-100 dark:divide-slate-800">
                {col.map((svc, si) => {
                  const s = health[svc.key];
                  return (
                    <div key={si} className="flex items-center justify-between px-5 h-[52px] hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition">
                      <div>
                        <p className="text-[13px] font-extrabold text-slate-900 dark:text-white">{svc.label}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{svc.provider}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={s} />
                        <span className={`text-[11px] font-black uppercase ${
                          s === "Operational" ? "text-emerald-500" :
                          s === "Degraded" ? "text-amber-500" :
                          s === "Offline" ? "text-rose-500" : "text-slate-400"
                        }`}>
                          {s}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 10 — BUSINESS + LEARNING (2-column)
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Financial Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-500" />
                Business Control Center
              </h2>
              <button onClick={() => nav("finance")} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer border-none bg-transparent">
                Finance Center →
              </button>
            </div>
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              {/* KPIs */}
              <div className="p-5 flex flex-col gap-4 sm:w-2/5">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Gross Revenue</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {grossRevenue !== null ? `₹${grossRevenue.toLocaleString()}` : "Unavailable"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Platform Share</p>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200">₹{platformShare?.toLocaleString() ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Tutor Share</p>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200">₹{tutorShare?.toLocaleString() ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Pending Payouts</p>
                    <p className={`font-extrabold ${pendingPayouts.length > 0 ? "text-amber-500" : "text-slate-700 dark:text-slate-200"}`}>
                      ₹{pendingPayouts.reduce((s, p) => s + p.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Refund Requests</p>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200">0</p>
                  </div>
                </div>
              </div>
              {/* Ledger table */}
              <div className="sm:w-3/5 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="px-4 py-2.5 text-left">Segment</th>
                      <th className="px-4 py-2.5 text-right">Count</th>
                      <th className="px-4 py-2.5 text-right">Value</th>
                      <th className="px-4 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
                    {[
                      { label: "Transactions", cnt: transactions.length, val: grossRevenue !== null ? `₹${grossRevenue.toLocaleString()}` : "—", stat: "Active" },
                      { label: "Refunds", cnt: 0, val: "₹0", stat: "Clear" },
                      { label: "Withdrawals", cnt: payouts.length, val: payouts.length ? `₹${payouts.reduce((s, p) => s + p.amount, 0).toLocaleString()}` : "₹0", stat: `${pendingPayouts.length} pending` },
                      { label: "Coupons / Offers", cnt: 3, val: "—", stat: "Active" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition">
                        <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">{row.label}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-500">{row.cnt}</td>
                        <td className="px-4 py-2.5 text-right font-extrabold text-slate-900 dark:text-white font-mono">{row.val}</td>
                        <td className="px-4 py-2.5 text-right text-slate-400 font-mono text-[11px]">{row.stat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Learning Ecosystem */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpenCheck size={16} className="text-indigo-500" />
                Learning Ecosystem
              </h2>
              <button onClick={() => nav("courses")} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer border-none bg-transparent">
                Manage Courses →
              </button>
            </div>
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              {/* KPIs */}
              <div className="p-5 flex flex-col gap-4 sm:w-2/5">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Courses</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{courses.length}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Published</p>
                    <p className="font-extrabold text-emerald-500">{courses.filter(c => c.status === "Approved").length}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Pending</p>
                    <p className={`font-extrabold ${pendingCourses.length > 0 ? "text-amber-500" : "text-slate-700 dark:text-slate-200"}`}>{pendingCourses.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Enrollments</p>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200">{stats?.activeEnrollments ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Certificates</p>
                    <p className="font-extrabold text-slate-700 dark:text-slate-200">{stats?.certificatesIssued ?? "—"}</p>
                  </div>
                </div>
              </div>
              {/* Table */}
              <div className="sm:w-3/5 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="px-4 py-2.5 text-left">Segment</th>
                      <th className="px-4 py-2.5 text-right">Count</th>
                      <th className="px-4 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
                    {[
                      { label: "Approval Queue", val: pendingCourses.length, stat: pendingCourses.length > 0 ? "Pending" : "Clear" },
                      { label: "Live Classes", val: stats?.liveClasses ?? "N/A", stat: "Active" },
                      { label: "Certificates Issued", val: stats?.certificatesIssued ?? "—", stat: "Active" },
                      { label: "Course Quality Audit", val: "—", stat: "Operational" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition">
                        <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">{row.label}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-500">{row.val}</td>
                        <td className="px-4 py-2.5 text-right text-slate-400 font-mono text-[11px]">{row.stat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 11 — USER & ORGANIZATION CONTROL
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              User & Organization Control
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Active</th>
                  <th className="px-5 py-3 text-right">Pending</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { cat: "Student Profiles", total: studentCount, active: users.filter(u => (u.role === "learner" || u.role === "student") && u.status === "Active").length, pending: 0, status: "Operational", tab: "users" },
                  { cat: "Tutors Registry", total: tutorCount, active: users.filter(u => u.role === "tutor" && u.status === "Active").length, pending: pendingVerifications.length, status: "Operational", tab: "tutors" },
                  { cat: "Platform Administrators", total: adminCount, active: adminCount, pending: 0, status: "Operational", tab: "roles" },
                  { cat: "Ecosystem Organizations", total: "—", active: "—", pending: "—", status: "Unavailable", tab: "organizations" },
                  { cat: "Academy Categories", total: categoryCount, active: categoryCount, pending: 0, status: "Operational", tab: "categories" },
                  { cat: "Communities / Clubs / Events", total: "—", active: "—", pending: "—", status: "Unavailable", tab: "organizations" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition h-[50px]">
                    <td className="px-5 py-2 font-extrabold text-slate-900 dark:text-white text-[13px]">{row.cat}</td>
                    <td className="px-5 py-2 text-right font-mono text-slate-600 dark:text-slate-400 text-[13px]">{row.total}</td>
                    <td className="px-5 py-2 text-right font-mono font-extrabold text-slate-900 dark:text-white text-[13px]">{row.active}</td>
                    <td className="px-5 py-2 text-right font-mono text-[13px]">
                      <span className={typeof row.pending === "number" && row.pending > 0 ? "text-amber-500 font-extrabold" : "text-slate-400"}>
                        {row.pending}
                      </span>
                    </td>
                    <td className="px-5 py-2">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${row.status === "Operational" ? "text-emerald-500" : "text-slate-400"}`}>
                        {row.status === "Unavailable" ? "Unavailable / No data yet" : row.status}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-right">
                      <button onClick={() => nav(row.tab)} className="text-blue-600 hover:underline font-bold text-xs cursor-pointer border-none bg-transparent uppercase">
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 12 — TRUST + AI + TENANT (3-column)
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Trust & Safety */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={15} className="text-rose-500" />
                Trust & Safety
              </h2>
              <button onClick={() => nav("reports")} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer border-none bg-transparent">Open →</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
              {[
                { label: "Active Moderation Reports", val: pendingReports.length, alert: pendingReports.length > 0 },
                { label: "Pending Course Reviews", val: pendingCourses.length, alert: pendingCourses.length > 0 },
                { label: "Suspended User Accounts", val: users.filter(u => u.status === "Suspended").length, alert: false },
                { label: "Open Support Tickets", val: openTickets.length, alert: openTickets.length > 0 },
                { label: "Security Incidents", val: 0, alert: false },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center px-5 py-2.5">
                  <span className="text-slate-500">{row.label}</span>
                  <span className={`font-extrabold font-mono ${row.alert ? "text-amber-500" : "text-slate-700 dark:text-slate-300"}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Control Center */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={15} className="text-blue-600" />
                AI Control Center
              </h2>
              <button onClick={() => nav("ai")} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer border-none bg-transparent">Configure →</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
              {[
                { label: "AI Service Status", val: "Operational", valClass: "text-emerald-500" },
                { label: "Configured Model", val: "gemini-2.5-flash", valClass: "font-mono" },
                { label: "Active AI Features", val: "Course Gen, Doubt Solver" },
                { label: "System Availability", val: "100%", valClass: "text-emerald-500" },
                { label: "AI Analytics / Token Trace", val: "Unavailable", valClass: "text-slate-400 uppercase text-[11px]" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center px-5 py-2.5 gap-2">
                  <span className="text-slate-500 shrink-0">{row.label}</span>
                  <span className={`font-extrabold text-right truncate max-w-[150px] ${row.valClass ?? "text-slate-700 dark:text-slate-300"}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant Operations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={15} className="text-indigo-500" />
                Tenant / Community Ops
              </h2>
              <button onClick={() => nav("organizations")} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer border-none bg-transparent">Portal →</button>
            </div>
            <div className="p-5 flex flex-col items-center justify-center gap-3 h-[calc(100%-52px)]">
              <div className="w-full border border-dashed border-slate-200 dark:border-slate-700 rounded-lg py-6 px-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unavailable / No data yet</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Organization, club and community data will appear here once configured.
                </p>
              </div>
              <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400 pt-1">
                <span>Organizations: 0</span>
                <span>Clubs: 0</span>
                <span>Events: 0</span>
              </div>
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 13 — LIVE ACTIVITY + DECISIONS (2-column)
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Live Platform Activity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" />
                Live Platform Activity
              </h2>
            </div>
            {events.length === 0 ? (
              <div className="px-5 py-10 text-center flex flex-col items-center gap-2 text-slate-400">
                <Circle size={20} className="text-slate-300" />
                <p className="font-extrabold text-sm text-slate-500">No recent platform activity</p>
                <p className="text-xs">New platform events will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="px-5 py-2.5 text-left w-16">Time</th>
                      <th className="px-5 py-2.5 text-left w-24">Actor</th>
                      <th className="px-5 py-2.5 text-left">Action</th>
                      <th className="px-5 py-2.5 text-left w-20">Module</th>
                      <th className="px-5 py-2.5 text-right w-20">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {events.slice(0, 5).map((evt, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition h-[46px]">
                        <td className="px-5 py-2 text-slate-400">{new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="px-5 py-2 font-extrabold text-blue-600">{evt.actor.split(" ")[0]}</td>
                        <td className="px-5 py-2 text-slate-700 dark:text-slate-300 font-sans font-semibold">{evt.type}</td>
                        <td className="px-5 py-2 uppercase text-slate-400 text-[10px]">{evt.module}</td>
                        <td className="px-5 py-2 text-right text-emerald-500 font-extrabold text-[10px] uppercase">Done</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Admin Decisions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck size={16} className="text-blue-600" />
                Recent Admin Decisions
              </h2>
            </div>
            {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
              <div className="px-5 py-10 text-center flex flex-col items-center gap-2 text-slate-400">
                <Circle size={20} className="text-slate-300" />
                <p className="font-extrabold text-sm text-slate-500">No decisions recorded</p>
                <p className="text-xs">Admin actions will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="px-5 py-2.5 text-left w-24">Admin</th>
                      <th className="px-5 py-2.5 text-left">Decision</th>
                      <th className="px-5 py-2.5 text-left w-20">Module</th>
                      <th className="px-5 py-2.5 text-left w-24">Time</th>
                      <th className="px-5 py-2.5 text-right w-20">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.recentActivity.slice(0, 5).map((log: AdminActivityLog, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition h-[46px]">
                        <td className="px-5 py-2 font-extrabold text-blue-600">{log.adminName.split(" ")[0]}</td>
                        <td className="px-5 py-2 text-slate-700 dark:text-slate-300 font-sans font-semibold">{log.action}</td>
                        <td className="px-5 py-2 uppercase text-slate-400 text-[10px]">SYSTEM</td>
                        <td className="px-5 py-2 text-slate-400">{(log.timestamp || "").split(" ")[1] ?? log.timestamp}</td>
                        <td className="px-5 py-2 text-right text-emerald-500 font-extrabold text-[10px] uppercase">Success</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 14 — PLATFORM GROWTH INTELLIGENCE (compact)
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="font-extrabold text-[14px] text-slate-900 dark:text-white">Platform Growth Intelligence</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Historical growth analytics will appear after sufficient platform telemetry has been collected.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-850">
              <Info size={11} className="text-slate-400" />
              Insufficient data · 14 days required
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 15 — ADMIN OS FOOTER
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
          <div>
            <p className="font-black uppercase text-[10px] tracking-wider text-slate-500">EduEarn Admin OS</p>
            <p className="mt-0.5">System operational · Last synchronized: {lastSynced || "Pending initial sync"}</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-bold text-slate-400">
            {[
              { label: "Admin Dashboard", tab: "dashboard" },
              { label: "Settings", tab: "settings" },
              { label: "Audit Logs", tab: "audit-logs" },
              { label: "Security", tab: "reports" },
              { label: "Support", tab: "communication" },
            ].map((link, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-300 dark:text-slate-700">·</span>}
                <button
                  onClick={() => nav(link.tab)}
                  className="hover:text-blue-600 cursor-pointer border-none bg-transparent"
                >
                  {link.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
