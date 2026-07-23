"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Sparkles,
  TrendingUp,
  Users,
  BookOpen,
  Video,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  UserCheck,
  CheckCircle,
  HelpCircle,
  FileText,
  Clock
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
  onNavigateTab: (tab: string) => void;
  onApproveTutor: (id: string) => void;
  onReleasePayout: (id: string) => void;
  onApproveRefund: (id: string) => void;
  onCreateCourse: () => void;
  onCreateOffer: () => void;
  onBroadcastAnnouncement: () => void;
}

export default function DashboardTab({
  adminEnrollments,
  auditLogs,
  verifications,
  payouts,
  refundRequests,
  tickets,
  courses,
  liveSessions,
  onNavigateTab,
  onApproveTutor,
  onReleasePayout,
  onApproveRefund,
  onCreateCourse,
  onCreateOffer,
  onBroadcastAnnouncement
}: DashboardTabProps) {
  
  // Calculate revenue
  const totalRevenue = 1540000 + adminEnrollments.reduce((sum, item) => sum + (item.amount || 0), 0);
  const commissionEarned = 28000 + adminEnrollments.reduce((sum, item) => sum + (item.commission || 0), 0);
  
  const pendingTutors = verifications.filter(v => v.status === "Pending");
  const pendingPayouts = payouts.filter(p => p.status === "Pending" || p.status === "On Hold");
  const pendingRefunds = refundRequests.filter(r => r.status === "Pending");
  const openTickets = tickets.filter(t => t.status === "Open");

  return (
    <motion.div
      key="admin-dashboard-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8 text-left"
    >
      {/* CEO COMMAND BANNER & HEALTH MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        <Card variant="glass" className="lg:col-span-2 p-7 border-primary/20 bg-primary/5 flex items-center justify-between relative overflow-hidden shadow-soft">
          <div className="space-y-3 relative z-10">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles size={13} className="animate-pulse shrink-0" /> CEO Operations Control Room
            </span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
              Platform Command &amp; Operating Center
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold max-w-lg leading-relaxed">
              Synchronize payment flows, approve tutor applications, moderate courses, configure global pricing rules, and run live diagnostics.
            </p>
          </div>
          <Sparkles size={44} className="text-primary/20 shrink-0 hidden sm:block relative z-10" />
        </Card>

        <Card variant="glass" className="p-7 border-border/60 bg-muted/10 flex flex-col justify-between shadow-soft">
          <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-2">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Infrastructure Health
            </span>
            <Activity size={16} className="text-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 text-xs font-bold space-y-2 text-muted-foreground/80">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-muted-foreground">API Gateway Latency</span>
              <span className="text-foreground font-black">12ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-muted-foreground">Database Cluster</span>
              <span className="text-emerald-500 font-extrabold uppercase tracking-wider text-[10px]">Healthy (Active)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-muted-foreground">Storage Bucket</span>
              <span className="text-foreground font-black">1.2 GB / 50.0 GB</span>
            </div>
          </div>
        </Card>
      </div>

      {/* QUICK ACTION BAR */}
      <Card className="p-5 border border-border bg-card shadow-soft select-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
            Operational Quick Actions
          </span>
          <div className="flex flex-wrap gap-2.5">
            <Button size="md" onClick={onCreateCourse} className="text-xs font-extrabold gap-1.5 h-10 px-4 uppercase tracking-wider">
              <PlusCircle size={14} /> Create Course
            </Button>
            <Button size="md" onClick={() => onNavigateTab("users")} variant="outline" className="text-xs font-extrabold gap-1.5 h-10 px-4 uppercase tracking-wider bg-card hover:bg-muted/80">
              <UserCheck size={14} /> Verify Tutor
            </Button>
            <Button size="md" onClick={onCreateOffer} variant="outline" className="text-xs font-extrabold gap-1.5 h-10 px-4 uppercase tracking-wider bg-card hover:bg-muted/80">
              <DollarSign size={14} /> Create Offer
            </Button>
            <Button size="md" onClick={onBroadcastAnnouncement} variant="outline" className="text-xs font-extrabold gap-1.5 h-10 px-4 uppercase tracking-wider bg-card hover:bg-muted/80">
              <ArrowRight size={14} /> Broadcast Update
            </Button>
          </div>
        </div>
      </Card>

      {/* SYSTEM PERFORMANCE KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 select-none">
        {[
          { label: "Total Platform Revenue", val: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: "Gross payments volume", icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" },
          { label: "Net Commission Earned", val: `₹${commissionEarned.toLocaleString("en-IN")}`, sub: "10% platform share", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10 border-blue-500/10" },
          { label: "Total Students Registered", val: String(1045 + adminEnrollments.length), sub: "Active platform learners", icon: Users, color: "text-purple-500 bg-purple-500/10 border-purple-500/10" },
          { label: "Approved Cohort Courses", val: String(courses.length), sub: "Published inventory", icon: BookOpen, color: "text-amber-500 bg-amber-500/10 border-amber-500/10" },
          { label: "Live Classes Today", val: `${5 + adminEnrollments.length} Active`, sub: "Linked classrooms online", icon: Video, color: "text-rose-500 bg-rose-500/10 border-rose-500/10" },
          { label: "Pending Tutor Audits", val: `${pendingTutors.length} Profiles`, sub: "Verification queue", icon: UserCheck, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/10" },
          { label: "Escrow Releases Pending", val: `${pendingPayouts.length} Requests`, sub: "Tutor withdrawal cycle", icon: DollarSign, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/10" },
          { label: "Refund Requests Queue", val: `${pendingRefunds.length} Claims`, sub: "Awaiting approval", icon: AlertTriangle, color: "text-orange-500 bg-orange-500/10 border-orange-500/10" }
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="border border-border bg-card p-5 rounded-card flex flex-col justify-between shadow-soft hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center gap-3">
                <span className="text-[10px] sm:text-xs font-extrabold text-muted-foreground uppercase tracking-wider truncate">
                  {kpi.label}
                </span>
                <span className={`p-2 rounded-xl border shrink-0 ${kpi.color}`}>
                  <Icon size={14} />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight block">{kpi.val}</span>
                <span className="text-[10px] text-muted-foreground font-semibold mt-1 block">{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* VELOCITY CHART DIAGRAMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        <Card variant="glass" className="p-6 space-y-4 shadow-soft">
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <span>Hourly Transaction Velocity</span>
            <span className="text-primary font-extrabold font-heading">₹12,450 Today</span>
          </div>
          <div className="h-32 w-full flex items-end">
            <svg className="w-full h-full text-primary" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,25 Q15,10 30,18 T60,8 T90,14 T100,5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M0,25 Q15,10 30,18 T60,8 T90,14 T100,5 L100,30 L0,30 Z" fill="currentColor" fillOpacity="0.05" />
            </svg>
          </div>
        </Card>

        <Card variant="glass" className="p-6 space-y-4 shadow-soft">
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <span>Educator Registration Velocity</span>
            <span className="text-emerald-500 font-extrabold font-heading">+5 New Educators</span>
          </div>
          <div className="h-32 w-full flex items-end">
            <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,28 Q20,20 40,22 T80,10 T100,4" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M0,28 Q20,20 40,22 T80,10 T100,4 L100,30 L0,30 Z" fill="currentColor" fillOpacity="0.05" />
            </svg>
          </div>
        </Card>
      </div>

      {/* OPERATIONS QUEUE: APPROVALS, REFUNDS, PAYOUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tutor Verification Queue */}
        <Card variant="glass" className="p-6 space-y-4 shadow-soft">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <h3 className="text-xs sm:text-sm font-heading font-extrabold uppercase text-foreground flex items-center gap-2">
              <UserCheck size={16} className="text-primary" /> Tutor Verification Queue
            </h3>
            <Button variant="outline" size="sm" onClick={() => onNavigateTab("users")} className="text-[10px] font-bold uppercase tracking-wider h-8 px-3">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {pendingTutors.length === 0 ? (
              <div className="text-xs text-muted-foreground/60 py-6 text-center select-none font-semibold">
                All tutor applications reviewed! Great job.
              </div>
            ) : (
              pendingTutors.slice(0, 3).map((v) => (
                <div key={v.id} className="p-4 bg-muted/20 border border-border/45 rounded-card flex items-center justify-between text-xs font-semibold gap-3">
                  <div>
                    <h4 className="font-extrabold text-foreground text-xs sm:text-sm">{v.tutorName}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-1">{v.expertise}</p>
                  </div>
                  <Button size="sm" onClick={() => onApproveTutor(v.id)} className="h-8.5 px-3.5 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-wider shadow-soft">
                    Approve
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Escrow Release & Withdrawals Queue */}
        <Card variant="glass" className="p-6 space-y-4 shadow-soft">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <h3 className="text-xs sm:text-sm font-heading font-extrabold uppercase text-foreground flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" /> Pending Payout Releases
            </h3>
            <Button variant="outline" size="sm" onClick={() => onNavigateTab("finance")} className="text-[10px] font-bold uppercase tracking-wider h-8 px-3">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {pendingPayouts.length === 0 ? (
              <div className="text-xs text-muted-foreground/60 py-6 text-center select-none font-semibold">
                All tutor earnings up to date!
              </div>
            ) : (
              pendingPayouts.slice(0, 3).map((p) => (
                <div key={p.id} className="p-4 bg-muted/20 border border-border/45 rounded-card flex items-center justify-between text-xs font-semibold gap-3">
                  <div>
                    <h4 className="font-extrabold text-foreground text-xs sm:text-sm">{p.tutorName}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-1">₹{p.amount.toLocaleString()} &bull; Method: {p.method}</p>
                  </div>
                  <Button size="sm" onClick={() => onReleasePayout(p.id)} className="h-8.5 px-3.5 text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white uppercase tracking-wider shadow-soft">
                    Release
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* RECENT PLATFORM AUDIT ACTIONS */}
      <div className="space-y-4 select-none pt-2">
        <h3 className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Clock size={16} /> Recent Audit Actions
        </h3>
        <div className="flex flex-col gap-3">
          {auditLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="border border-border bg-card p-4 rounded-card text-xs font-semibold flex items-center justify-between shadow-soft hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-[9.5px] font-extrabold bg-muted text-muted-foreground px-2 py-1 rounded uppercase tracking-wider border border-border/30">
                  {log.adminName}
                </span>
                <span className="font-bold text-foreground pr-2">{log.action}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
