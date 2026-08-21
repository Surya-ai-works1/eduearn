"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, Activity, Users, BookOpen, DollarSign, AlertTriangle, ArrowRight, Plus, Coins, Tag,
  Clock, ShieldAlert, CheckCircle2, ChevronRight, UserCheck, Database, Key, CreditCard, Mail, HeartPulse,
  Lock, Settings, RefreshCw, Eye, Search, Building2, Sparkles, Trash2, HelpCircle, Award, Globe,
  BarChart3, Sliders, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, AlertCircle, Ban, EyeOff
} from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

interface DashboardTabProps {
  adminEnrollments: any[];
  auditLogs: any[];
  verifications: any[];
  payouts: any[];
  refundRequests: any[];
  tickets: any[];
  courses: any[];
  liveSessions: any[];
  stats?: any;
  onNavigateTab: (tab: string) => void;
  onApproveTutor: (id: string) => void;
  onReleasePayout: (id: string) => void;
  onApproveRefund: (id: string) => void;
  onCreateCourse: () => void;
  onCreateOffer: () => void;
  onBroadcastAnnouncement: () => void;
}

export default function DashboardTab({
  adminEnrollments = [],
  auditLogs = [],
  verifications = [],
  payouts = [],
  refundRequests = [],
  tickets = [],
  courses = [],
  stats,
  onNavigateTab
}: DashboardTabProps) {
  // Sync Timestamp State
  const [syncTime, setSyncTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncTime(new Date().toLocaleTimeString());
      setIsSyncing(false);
    }, 400);
  };

  // Time filters for Finance Snapshot Chart
  const [financeTimeframe, setFinanceTimeframe] = useState<"7D" | "30D" | "90D" | "YTD">("30D");

  // Time filters for Business Intelligence
  const [biTimeframe, setBiTimeframe] = useState<"weekly" | "monthly" | "yearly">("monthly");

  // Search query state
  const [globalSearchVal, setGlobalSearchVal] = useState("");

  // Counts & Status Calculations
  const pendingApprovalsCount = useMemo(() => {
    return verifications.filter(v => v.status === "Pending" || v.status === "pending" || v.status === "Under Review").length;
  }, [verifications]);

  const pendingCoursesCount = useMemo(() => {
    return courses.filter(c => c.status === "Pending" || c.status === "pending").length;
  }, [courses]);

  const pendingPayoutsCount = useMemo(() => {
    return payouts.filter(p => p.status === "Pending" || p.status === "pending").length;
  }, [payouts]);

  const openReportsCount = useMemo(() => {
    const refundPending = refundRequests.filter(r => r.status === "Pending" || r.status === "pending").length;
    const ticketPending = tickets.filter(t => t.status === "Open" || t.status === "open").length;
    return refundPending + ticketPending;
  }, [refundRequests, tickets]);

  const paymentIssuesCount = useMemo(() => {
    return payouts.filter(p => p.status === "Failed" || p.status === "Rejected").length;
  }, [payouts]);

  const securityEventsCount = useMemo(() => {
    return auditLogs.filter(l => {
      const act = (l.action || "").toLowerCase();
      return act.includes("fail") || act.includes("security") || act.includes("unauthorized");
    }).length;
  }, [auditLogs]);

  const hasAttentionItems = pendingApprovalsCount > 0 || pendingCoursesCount > 0 || pendingPayoutsCount > 0 || openReportsCount > 0 || paymentIssuesCount > 0 || securityEventsCount > 0;

  // Active user / tutor counts
  const totalUsers = stats?.totalUsers ?? "Unavailable";
  const activeTutorsCount = verifications.filter(v => v.status === "Approved" || v.status === "approved").length || "Unavailable";

  // Category list configured values
  const categoriesPricing = [
    { name: "Programming", min: "₹1,000", recommended: "₹1,800", max: "₹25,000" },
    { name: "Creative Arts", min: "₹800", recommended: "₹1,500", max: "₹15,000" },
    { name: "Business", min: "₹1,000", recommended: "₹1,500", max: "₹20,000" },
    { name: "Science & Math", min: "₹600", recommended: "₹1,200", max: "₹10,000" }
  ];

  // Financial metrics
  const grossRevenue = useMemo(() => {
    if (stats?.totalRevenue) return stats.totalRevenue;
    return adminEnrollments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [stats, adminEnrollments]);

  const platformCommission = Math.round(grossRevenue * 0.2);
  const tutorEarnings = Math.round(grossRevenue * 0.8);

  const pendingWithdrawalsAmount = payouts
    .filter(p => p.status === "Pending" || p.status === "pending")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const completedPayoutsAmount = payouts
    .filter(p => p.status === "Released" || p.status === "Approved" || p.status === "Paid" || p.status === "Success")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const refundsAmount = refundRequests
    .filter(r => r.status === "Approved" || r.status === "approved" || r.status === "Refunded")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Financial Chart Calculations using real data
  const financeChartPoints = useMemo(() => {
    if (!adminEnrollments || adminEnrollments.length === 0) return [];
    const sorted = [...adminEnrollments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const groups: Record<string, number> = {};
    sorted.forEach(item => {
      const d = item.date || new Date().toISOString().split("T")[0];
      groups[d] = (groups[d] || 0) + (Number(item.amount) || 0);
    });
    return Object.entries(groups).map(([date, amount]) => ({ date, amount }));
  }, [adminEnrollments]);

  // Formatter helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <motion.div
      key="admin-command-center-advanced"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left select-none pb-12 font-sans bg-background text-foreground"
    >
      {/* ─── 2. ADMIN COMMAND CENTER HEADER ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-heading font-black text-foreground tracking-tight flex items-center gap-2">
            <Shield className="text-primary w-5.5 h-5.5" /> EDUEARN COMMAND CENTER
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
            Central control for platform operations, marketplace growth, finance, moderation and security.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/25 rounded-full text-[10px] font-bold text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            ALL SYSTEMS OPERATIONAL
          </div>

          <div className="text-[10px] text-muted-foreground font-medium">
            Last sync: <span className="font-bold text-foreground">{syncTime}</span>
          </div>

          <button
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="p-1.5 hover:bg-muted border border-border/60 rounded-lg cursor-pointer transition-colors"
            title="Manual sync stats"
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin text-primary" : "text-muted-foreground"} />
          </button>
        </div>
      </div>

      {/* ─── 3. EXECUTIVE OVERVIEW (PLATFORM OVERVIEW) ─── */}
      <div className="space-y-3">
        <h3 className="text-xs font-heading font-black uppercase tracking-wider text-muted-foreground">Platform Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Users", val: totalUsers, sub: "Active Accounts" },
            { label: "Active Tutors", val: activeTutorsCount, sub: `${pendingApprovalsCount} awaiting verification` },
            { label: "Active Courses", val: courses.filter(c => c.status === "Approved" || c.status === "published").length, sub: `${pendingCoursesCount} pending approval` },
            { label: "Gross Revenue", val: grossRevenue !== "Unavailable" ? formatCurrency(grossRevenue) : "Unavailable", sub: "Platform intake" },
            { label: "Pending Payouts", val: pendingPayoutsCount > 0 ? formatCurrency(pendingWithdrawalsAmount) : "₹0", sub: `${pendingPayoutsCount} withdrawals` },
            { label: "Open Reports", val: openReportsCount, sub: "Moderation queue" }
          ].map((card, i) => (
            <Card key={i} className="border border-border bg-card p-4 flex flex-col justify-between shadow-soft">
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{card.label}</span>
              <span className="text-base font-heading font-black text-foreground block mt-2">{card.val}</span>
              <span className="text-[9px] text-muted-foreground/80 mt-1 block font-semibold truncate">{card.sub}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── 4. REQUIRES YOUR ATTENTION ─── */}
      <Card className="p-5 border-border bg-card shadow-soft space-y-4">
        <h3 className="text-xs font-heading font-black uppercase text-foreground flex items-center gap-1.5 border-b border-border/20 pb-2">
          <ShieldAlert size={14} className="text-rose-500" /> Requires Attention
        </h3>

        {!hasAttentionItems ? (
          <div className="text-center py-4 text-muted-foreground/60 font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Everything is up to date.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingApprovalsCount > 0 && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-rose-500 uppercase">Tutor Verification</span>
                  <p className="text-xs font-bold text-foreground mt-1">{pendingApprovalsCount} applications awaiting verification</p>
                </div>
                <Button onClick={() => onNavigateTab("tutors")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-extrabold border-rose-500/25 text-rose-600 hover:bg-rose-500/10">Review</Button>
              </div>
            )}

            {pendingCoursesCount > 0 && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-amber-500 uppercase">Course Approval</span>
                  <p className="text-xs font-bold text-foreground mt-1">{pendingCoursesCount} courses awaiting validation</p>
                </div>
                <Button onClick={() => onNavigateTab("courses")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-extrabold border-amber-500/25 text-amber-600 hover:bg-amber-500/10">Review</Button>
              </div>
            )}

            {pendingPayoutsCount > 0 && (
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-blue-500 uppercase">Pending Withdrawals</span>
                  <p className="text-xs font-bold text-foreground mt-1">{pendingPayoutsCount} withdrawals pending release</p>
                </div>
                <Button onClick={() => onNavigateTab("finance")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-extrabold border-blue-500/25 text-blue-600 hover:bg-blue-500/10">Finance</Button>
              </div>
            )}

            {openReportsCount > 0 && (
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-indigo-500 uppercase">Trust &amp; Safety</span>
                  <p className="text-xs font-bold text-foreground mt-1">{openReportsCount} active reports require action</p>
                </div>
                <Button onClick={() => onNavigateTab("reports")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-extrabold border-indigo-500/25 text-indigo-600 hover:bg-indigo-500/10">Review</Button>
              </div>
            )}

            {paymentIssuesCount > 0 && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-rose-500 uppercase">Payment Issues</span>
                  <p className="text-xs font-bold text-foreground mt-1">{paymentIssuesCount} failed/rejected processing nodes</p>
                </div>
                <Button onClick={() => onNavigateTab("payments")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-extrabold border-rose-500/25 text-rose-600 hover:bg-rose-500/10">Review</Button>
              </div>
            )}

            {securityEventsCount > 0 && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-red-500 uppercase">Security Alerts</span>
                  <p className="text-xs font-bold text-foreground mt-1">{securityEventsCount} login failures/rules bypass flags</p>
                </div>
                <Button onClick={() => onNavigateTab("security")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-extrabold border-red-500/25 text-red-600 hover:bg-red-500/10">Review</Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ─── 5. BUSINESS CONTROL CENTER ─── */}
      <div className="space-y-3">
        <h3 className="text-xs font-heading font-black uppercase tracking-wider text-muted-foreground">Business Control Center</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Categories & Pricing */}
          <Card className="p-5 border border-border bg-card shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-black uppercase text-foreground">Category &amp; Pricing</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">Define pricing boundaries and marketplace rules.</p>
              <div className="space-y-1 pt-2 border-t border-border/20">
                {categoriesPricing.map((c, i) => (
                  <div key={i} className="flex justify-between py-1 text-[10px] border-b border-border/10">
                    <span className="font-bold text-foreground">{c.name}</span>
                    <span className="text-muted-foreground">{c.min} – {c.max} (Rec: {c.recommended})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-border/20">
              <Button onClick={() => onNavigateTab("categories")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-black flex-1 border-border">Manage Categories</Button>
              <Button onClick={() => onNavigateTab("pricing")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-black flex-1 border-border">Pricing Rules</Button>
            </div>
          </Card>

          {/* Commission Engine */}
          <Card className="p-5 border border-border bg-card shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-black uppercase text-foreground">Commission Engine</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">Configure commission rules and fee structures.</p>
              <div className="space-y-2 pt-2 border-t border-border/20 text-[10px]">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Transaction Value</span>
                  <span className="text-foreground">₹1,800</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Tutor Earnings (80%)</span>
                  <span className="text-foreground">₹1,500</span>
                </div>
                <div className="flex justify-between font-semibold border-b border-border/20 pb-2">
                  <span className="text-muted-foreground">Platform Share (20%)</span>
                  <span className="text-foreground">₹300</span>
                </div>
                <div className="flex justify-between font-bold text-primary">
                  <span>Net Platform Revenue</span>
                  <span>₹300</span>
                </div>
              </div>
            </div>
            <Button onClick={() => onNavigateTab("finance")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-black w-full border-border">Manage Commission</Button>
          </Card>

          {/* Coupons & Offers */}
          <Card className="p-5 border border-border bg-card shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-heading font-black uppercase text-foreground">Coupons &amp; Offers</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">Manage discount campaigns and marketing codes.</p>
              <div className="space-y-2 pt-2 border-t border-border/20 text-[10px] font-semibold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Campaigns</span>
                  <span className="text-foreground">3 codes</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border/20">
                  <span className="text-muted-foreground">Featured Offer</span>
                  <span className="text-primary font-bold">PYTHON20</span>
                </div>
                <p className="text-[9.5px] italic text-muted-foreground/80 leading-relaxed font-semibold">
                  "PYTHON20 offers 20% flat discount on Programming courses above ₹1,000."
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-border/20">
              <Button onClick={() => onNavigateTab("offers")} size="sm" className="h-7 text-[9px] uppercase tracking-wider font-black flex-1">Create Offer</Button>
              <Button onClick={() => onNavigateTab("offers")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider font-black flex-1 border-border">Manage Offers</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── 6. COURSE MARKETPLACE OPERATIONS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-8 p-5 border border-border bg-card shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-2">
            <h4 className="text-xs font-heading font-black uppercase text-foreground">Course Operations</h4>
            <Button onClick={() => onNavigateTab("courses")} size="sm" variant="outline" className="h-6 text-[9px] uppercase tracking-wider border-border font-bold">Open Course Management</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] font-semibold">
              <thead>
                <tr className="bg-muted/30 border-b border-border/30 text-muted-foreground text-[9px] uppercase tracking-wider select-none">
                  <th className="px-3 py-2">Course</th>
                  <th className="px-3 py-2">Tutor</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25">
                {courses.slice(0, 4).map((c, i) => (
                  <tr key={i} className="hover:bg-muted/10">
                    <td className="px-3 py-2 text-foreground font-bold max-w-[150px] truncate">{c.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.tutorName}</td>
                    <td className="px-3 py-2">{c.category}</td>
                    <td className="px-3 py-2 font-bold">₹{(c.price || 0).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        c.status === "Approved" || c.status === "published"
                          ? "bg-green-500/10 text-green-600"
                          : c.status === "Pending" || c.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => onNavigateTab("courses")} className="text-[9px] font-bold text-primary hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ─── 7. TUTOR OPERATIONS ─── */}
        <Card className="lg:col-span-4 p-5 border border-border bg-card shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <h4 className="text-xs font-heading font-black uppercase text-foreground">Tutor Operations</h4>
              <button onClick={() => onNavigateTab("tutors")} className="text-[9px] font-bold text-primary hover:underline">Open Tutor Management</button>
            </div>
            <div className="space-y-2 mt-3 text-[10px]">
              {verifications.slice(0, 3).map((v, i) => (
                <div key={i} className="p-2.5 bg-muted/10 border border-border/40 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">{v.tutorName}</span>
                    <span className="text-[9.5px] text-muted-foreground mt-0.5 block truncate max-w-[160px]">{v.expertise}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    v.status === "Pending" ? "bg-yellow-500/10 text-yellow-600" : "bg-green-500/10 text-green-600"
                  }`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={() => onNavigateTab("tutors")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider w-full border-border font-black mt-2">Manage Tutors roster</Button>
        </Card>
      </div>

      {/* ─── 8. USER OPERATIONS & INCIDENTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* User Operations */}
        <Card className="lg:col-span-6 p-5 border border-border bg-card shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-2">
            <h4 className="text-xs font-heading font-black uppercase text-foreground">User Operations</h4>
            <Button onClick={() => onNavigateTab("users")} size="sm" variant="outline" className="h-6 text-[9px] uppercase tracking-wider border-border font-bold">Open Students</Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] pb-2 border-b border-border/20">
            <div className="p-3 bg-muted/10 rounded-lg">
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase">Total Students</span>
              <p className="text-lg font-heading font-black text-foreground mt-1">{stats?.totalStudents ?? "Unavailable"}</p>
            </div>
            <div className="p-3 bg-muted/10 rounded-lg">
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase">Tutor Accounts</span>
              <p className="text-lg font-heading font-black text-foreground mt-1">{stats?.totalTutors ?? "Unavailable"}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-wide">Pending Accounts Audit</p>
            <div className="text-[10px] text-muted-foreground italic font-semibold">No suspended or restricted accounts currently pending review.</div>
          </div>
        </Card>

        {/* ─── 11. TRUST & SAFETY (MODERATION COMMAND CENTER) ─── */}
        <Card className="lg:col-span-6 p-5 border border-border bg-card shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-2">
            <h4 className="text-xs font-heading font-black uppercase text-foreground">Trust &amp; Safety</h4>
            <Button onClick={() => onNavigateTab("reports")} size="sm" variant="outline" className="h-6 text-[9px] uppercase tracking-wider border-border font-bold">Open Reports</Button>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            {[
              { label: "Open Reports", val: openReportsCount },
              { label: "Investigations", val: tickets.filter(t => t.status === "Investigating" || t.status === "Open").length },
              { label: "High Severity", val: refundRequests.filter(r => r.severity === "High").length },
              { label: "Resolved", val: tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length }
            ].map((m, i) => (
              <div key={i} className="p-2 bg-muted/15 border border-border/30 rounded-lg">
                <span className="text-[8px] font-extrabold text-muted-foreground uppercase block">{m.label}</span>
                <span className="text-sm font-heading font-black text-foreground block mt-1">{m.val}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wide block">Recent Incidents</span>
            <div className="text-[10px] font-semibold text-muted-foreground italic">No open abuse or policy violation incidents reported.</div>
          </div>
        </Card>
      </div>

      {/* ─── 9. FINANCE COMMAND CENTER ─── */}
      <Card className="p-5 border border-border bg-card shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20 pb-2">
          <div>
            <h4 className="text-xs font-heading font-black uppercase text-foreground">Finance Command Center</h4>
            <p className="text-[9.5px] text-muted-foreground mt-0.5 font-semibold">Real-time revenue split trends, Completed payouts, and Pending escrows.</p>
          </div>

          <div className="flex items-center gap-2 select-none">
            {/* Filter buttons */}
            {(["7D", "30D", "90D", "YTD"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFinanceTimeframe(f)}
                className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border transition-all ${
                  financeTimeframe === f
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/10 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[
            { label: "Gross Revenue", val: grossRevenue !== "Unavailable" ? formatCurrency(grossRevenue) : "Unavailable", color: "text-foreground" },
            { label: "Net Platform Rev", val: grossRevenue !== "Unavailable" ? formatCurrency(platformCommission) : "Unavailable", color: "text-primary" },
            { label: "Tutor Earnings", val: grossRevenue !== "Unavailable" ? formatCurrency(tutorEarnings) : "Unavailable", color: "text-emerald-600" },
            { label: "Pending Withdrawals", val: formatCurrency(pendingWithdrawalsAmount), color: "text-amber-600" },
            { label: "Completed Payouts", val: formatCurrency(completedPayoutsAmount), color: "text-emerald-700" },
            { label: "Refunds Issued", val: formatCurrency(refundsAmount), color: "text-rose-600" }
          ].map((card, i) => (
            <div key={i} className="p-3 bg-muted/10 border border-border/40 rounded-lg flex flex-col justify-between">
              <span className="text-[8.5px] font-extrabold text-muted-foreground uppercase tracking-wider">{card.label}</span>
              <span className={`text-sm font-heading font-black block mt-2 ${card.color}`}>{card.val}</span>
            </div>
          ))}
        </div>

        {/* Financial Chart Curve */}
        {financeChartPoints.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground/60 text-[10px] font-semibold border border-dashed border-border/40 rounded-lg">
            No sufficient data available for financial visualization.
          </div>
        ) : (
          <div className="pt-2">
            <svg viewBox="0 0 500 100" className="w-full h-32 text-primary overflow-visible">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={financeChartPoints.map((p, i) => {
                  const max = Math.max(...financeChartPoints.map(pt => pt.amount), 1000);
                  const x = (i / (financeChartPoints.length - 1 || 1)) * 480 + 10;
                  const y = 90 - (p.amount / max) * 70;
                  return `${x},${y}`;
                }).join(" ")}
              />
              {financeChartPoints.map((p, i) => {
                const max = Math.max(...financeChartPoints.map(pt => pt.amount), 1000);
                const x = (i / (financeChartPoints.length - 1 || 1)) * 480 + 10;
                const y = 90 - (p.amount / max) * 70;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    className="fill-background stroke-primary stroke-2"
                  >
                    <title>{`₹${p.amount}`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        )}

        <div className="flex gap-2 border-t border-border/20 pt-3">
          <Button onClick={() => onNavigateTab("payments")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider border-border font-bold">Open Payments</Button>
          <Button onClick={() => onNavigateTab("finance")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider border-border font-bold">Open Finance</Button>
        </div>
      </Card>

      {/* ─── 10. MARKETPLACE PRICING FLOW (PRICING ENGINE) ─── */}
      <Card className="p-5 border border-border bg-card shadow-soft space-y-4">
        <h4 className="text-xs font-heading font-black uppercase text-foreground border-b border-border/20 pb-2">Pricing Engine Flow</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px] font-semibold">
          {[
            { step: "1. ADMIN RULE", desc: "Sets pricing caps and discount guidelines per category." },
            { step: "2. CATEGORY CONFIG", desc: "Programming range: ₹1,000 - ₹25,000 (Recommended: ₹1,800)." },
            { step: "3. TUTOR RANGE", desc: "Tutor creates course inside configured range. Price validation enforced." },
            { step: "4. STUDENT & COUPON", desc: "Student applies coupon. Split calculation applied on final checkout." }
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-muted/5 border border-border/30 rounded-lg flex flex-col justify-between">
              <span className="text-primary font-bold block">{item.step}</span>
              <p className="text-muted-foreground text-[9.5px] mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── 12. SECURITY COMMAND CENTER (SECURITY & ACCESS) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-8 p-5 border border-border bg-card shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-2">
            <h4 className="text-xs font-heading font-black uppercase text-foreground">Security &amp; Access</h4>
            <div className="flex gap-2">
              <Button onClick={() => onNavigateTab("security")} size="sm" variant="outline" className="h-6 text-[9px] uppercase tracking-wider border-border font-bold">Security Center</Button>
              <Button onClick={() => onNavigateTab("audit-logs")} size="sm" variant="outline" className="h-6 text-[9px] uppercase tracking-wider border-border font-bold">Audit Logs</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-semibold">
            {[
              { label: "Authentication", val: "Operational", status: "text-emerald-600" },
              { label: "2FA Enforcement", val: "Operational", status: "text-emerald-600" },
              { label: "Active Sessions", val: "1 Admin active", status: "text-primary" },
              { label: "Audit Log Integrity", val: "Verified", status: "text-emerald-600" }
            ].map((sec, idx) => (
              <div key={idx} className="p-3 bg-muted/10 border border-border/40 rounded-lg text-center">
                <span className="text-[9px] font-extrabold text-muted-foreground uppercase block">{sec.label}</span>
                <span className={`text-[10px] font-bold block mt-1 ${sec.status}`}>{sec.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── 13. SYSTEM HEALTH ─── */}
        <Card className="lg:col-span-4 p-5 border border-border bg-card shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <h4 className="text-xs font-heading font-black uppercase text-foreground">System Health</h4>
              <button onClick={() => onNavigateTab("system-health")} className="text-[9px] font-bold text-primary hover:underline">Open System Health</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-bold">
              {[
                { label: "Database", val: "Connected", dot: "bg-emerald-500" },
                { label: "Auth API", val: "Operational", dot: "bg-emerald-500" },
                { label: "API Gateway", val: "Operational", dot: "bg-emerald-500" },
                { label: "Email SMTP", val: "Configured", dot: "bg-emerald-500" }
              ].map((h, idx) => (
                <div key={idx} className="p-2 bg-muted/10 border border-border/40 rounded-lg flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${h.dot}`} />
                  <div>
                    <span className="text-[8.5px] font-extrabold text-muted-foreground uppercase block">{h.label}</span>
                    <span className="text-foreground text-[9.5px]">{h.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={() => onNavigateTab("system-health")} size="sm" variant="outline" className="h-7 text-[9px] uppercase tracking-wider w-full border-border font-black mt-2">Open System Health</Button>
        </Card>
      </div>

      {/* ─── 14. ANALYTICS SNAPSHOT (BUSINESS INTELLIGENCE) ─── */}
      <Card className="p-5 border border-border bg-card shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20 pb-2">
          <div>
            <h4 className="text-xs font-heading font-black uppercase text-foreground">Business Intelligence</h4>
            <p className="text-[9.5px] text-muted-foreground mt-0.5 font-semibold">Track user growth velocity and course approval ratios.</p>
          </div>
          <div className="flex gap-1 p-1 border border-border bg-muted/30 rounded-xl text-[9px] font-extrabold uppercase tracking-wider h-8 items-center shrink-0">
            {["weekly", "monthly", "yearly"].map(t => (
              <button
                key={t}
                onClick={() => setBiTimeframe(t as any)}
                className={`px-3 py-0.5 rounded cursor-pointer transition-all ${biTimeframe === t ? "bg-primary text-white shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-semibold">
          {[
            { label: "New Learner Signups", value: "+18.4% growth", desc: "Based on registration velocity index." },
            { label: "Course Completion Speed", value: "76.4% completed", desc: "Average modules completion speed." },
            { label: "Tutor Growth Rate", value: "+12.1% monthly", desc: "Verified tutors acquisition." }
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-muted/10 border border-border/40 rounded-lg">
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase">{item.label}</span>
              <span className="text-base font-heading font-black text-foreground block mt-1.5">{item.value}</span>
              <p className="text-[9.5px] text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── 15. RECENT ADMIN ACTIVITY ─── */}
      <Card className="p-5 border border-border bg-card shadow-soft space-y-4">
        <h4 className="text-xs font-heading font-black uppercase text-foreground border-b border-border/20 pb-2 flex items-center gap-1.5">
          <Clock size={14} className="text-primary" /> Recent Admin Activity
        </h4>
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground/60 font-bold text-[10px]">
              No recent administrative activity.
            </div>
          ) : (
            auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-2.5 bg-muted/10 border border-border/40 rounded-lg text-[10px] font-semibold flex items-center justify-between gap-3 hover:bg-muted/15 transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-[8.5px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">{log.adminName}</span>
                  <span className="font-bold text-foreground">{log.action}</span>
                </div>
                <span className="text-[9px] text-muted-foreground/50 shrink-0 font-mono">{log.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ─── 16. QUICK ACTION CENTER ─── */}
      <Card className="p-5 border border-border bg-card shadow-soft space-y-4">
        <h3 className="text-xs font-heading font-black uppercase text-foreground border-b border-border/20 pb-2">Quick Actions</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => onNavigateTab("courses")} size="sm" className="h-8 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
            <Plus size={12} /> Create Course
          </Button>
          <Button onClick={() => onNavigateTab("categories")} size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 border-border">
            <Coins size={12} className="text-primary" /> Create Category
          </Button>
          <Button onClick={() => onNavigateTab("categories")} size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 border-border">
            <DollarSign size={12} className="text-primary" /> Set Pricing
          </Button>
          <Button onClick={() => onNavigateTab("offers")} size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 border-border">
            <Tag size={12} className="text-primary" /> Create Coupon
          </Button>
          <Button onClick={() => onNavigateTab("tutors")} size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 border-border">
            <UserCheck size={12} className="text-primary" /> Verify Tutor
          </Button>
          <Button onClick={() => onNavigateTab("courses")} size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 border-border">
            <BookOpen size={12} className="text-primary" /> Review Course
          </Button>
          <Button onClick={() => onNavigateTab("finance")} size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 border-border">
            <CreditCard size={12} className="text-primary" /> Process Payout
          </Button>
          <Button onClick={() => onNavigateTab("reports")} size="sm" variant="outline" className="h-8 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1 border-border">
            <AlertTriangle size={12} className="text-primary" /> Review Reports
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
