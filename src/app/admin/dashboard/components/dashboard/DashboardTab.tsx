"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Sparkles, TrendingUp, Users, BookOpen, Video, DollarSign,
  AlertTriangle, ArrowRight, PlusCircle, UserCheck, CheckCircle, HelpCircle,
  FileText, Clock, Award, ShieldAlert, Lock, Trash2, ArrowUpRight, ArrowDownRight,
  Download, RefreshCw, Eye, Check, X, ShieldCheck, Building2, ClipboardList, Database, Play
} from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";
import { PlatformEventBus, SystemHealthCenter, DataConsistencyValidator, PlatformEvent } from "../../../../../lib/services/PlatformIntegrationEngine";

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
  adminEnrollments,
  auditLogs: propAuditLogs,
  verifications,
  payouts,
  refundRequests,
  tickets,
  courses,
  liveSessions,
  stats: propStats,
  onNavigateTab,
  onApproveTutor,
  onReleasePayout,
  onApproveRefund,
  onCreateCourse,
  onCreateOffer,
  onBroadcastAnnouncement
}: DashboardTabProps) {
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [localAuditLogs, setLocalAuditLogs] = useState<any[]>([]);
  const [organizationsCount, setOrganizationsCount] = useState(3);
  const [payoutsCount, setPayoutsCount] = useState(2);

  const loadOperationalData = () => {
    setEvents(PlatformEventBus.getEvents());
    setLocalAuditLogs(PlatformEventBus.getAuditLogs().slice(0, 10));
    
    if (typeof window !== "undefined") {
      const storedTenants = localStorage.getItem("eduearn_tenants");
      if (storedTenants) {
        try {
          const list = JSON.parse(storedTenants);
          setOrganizationsCount(list.length);
        } catch {}
      }
      
      const storedPayouts = localStorage.getItem("eduearn_withdrawals");
      if (storedPayouts) {
        try {
          const list = JSON.parse(storedPayouts);
          setPayoutsCount(list.length);
        } catch {}
      }
    }
  };

  useEffect(() => {
    loadOperationalData();
    const interval = setInterval(loadOperationalData, 5000);
    return () => clearInterval(interval);
  }, []);

  const health = SystemHealthCenter.getDiagnostics();

  // Metrics Calculation from real database state
  const totalRevenue = propStats?.totalRevenue ?? adminEnrollments.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalStudents = propStats?.totalStudents ?? 0;
  const totalTutors = propStats?.totalTutors ?? 0;
  const totalCourses = courses.length;
  const certificatesCount = propStats?.certificatesIssued ?? 0;
  const pendingApprovalsCount = verifications.filter(v => v.status === "Pending" || v.status === "pending" || v.status === "Under Review").length;
  const pendingPaymentsCount = payouts.filter(p => p.status === "Pending" || p.status === "pending").length;
  const openReportsCount = refundRequests.filter(r => r.status === "Pending").length + tickets.filter(t => t.status === "Open").length;

  const topMetrics = [
    { label: "Students", val: String(totalStudents), sub: "Active registered learners", icon: Users, color: "text-blue-500 bg-blue-500/10 border-blue-500/10" },
    { label: "Tutors", val: String(totalTutors), sub: "Educators pool", icon: Users, color: "text-purple-500 bg-purple-500/10 border-purple-500/10" },
    { label: "Courses", val: String(totalCourses), sub: "Active catalog inventory", icon: BookOpen, color: "text-amber-500 bg-amber-500/10 border-amber-500/10" },
    { label: "Revenue", val: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: "Gross platform volume", icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" },
  ];

  const secondRowMetrics = [
    { label: "Pending Approvals", val: `${pendingApprovalsCount} Requests`, sub: "Tutor credential applications", icon: UserCheck, color: "text-teal-500 bg-teal-500/10 border-teal-500/10" },
    { label: "Pending Payments", val: `${pendingPaymentsCount} Payouts`, sub: "Withdrawals clearance queue", icon: FileText, color: "text-orange-500 bg-orange-500/10 border-orange-500/10" },
    { label: "Certificates", val: String(certificatesCount), sub: "Issued credentials", icon: Award, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/10" },
    { label: "Open Reports", val: `${openReportsCount} Items`, sub: "Pending issues & tickets", icon: AlertTriangle, color: "text-rose-400 bg-rose-400/10 border-rose-400/10" },
  ];

  const triggerQuickAction = (actionName: string, desc: string) => {
    PlatformEventBus.emit({
      type: actionName,
      actor: "Super Admin",
      role: "admin",
      module: "Dashboard",
      // eslint-disable-next-line react-hooks/purity
      targetId: `act-${Date.now()}`,
      targetName: actionName,
      severity: "Medium",
      description: desc
    });
    toast.success(`Action Executed: ${actionName}`);
    loadOperationalData();
  };

  return (
    <motion.div
      key="admin-executive-dashboard"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8 text-left select-none pb-12"
    >
      {/* Dashboard Executive Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 select-none">
            <Sparkles size={13} className="animate-pulse" /> Platform Operations
          </span>
          <h2 className="text-xl font-heading font-black text-foreground tracking-tight mt-1 select-none">
            Platform Executive Cockpit
          </h2>
        </div>
      </div>

      {/* Row 1: Top Metrics Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-heading font-extrabold uppercase tracking-wider text-muted-foreground">Overview Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetrics.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className="border border-border bg-card p-5 rounded-card flex flex-col justify-between shadow-soft hover:shadow-md transition-all duration-200">
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
      </div>

      {/* Row 2: Operational Action Metrics Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-heading font-extrabold uppercase tracking-wider text-muted-foreground">Operational Action Items</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondRowMetrics.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className="border border-border bg-card p-5 rounded-card flex flex-col justify-between shadow-soft hover:shadow-md transition-all duration-200">
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
      </div>

      {/* Main Operations section with Timeline & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Timeline */}
        <Card className="lg:col-span-2 p-6 space-y-4 border-border/80 bg-card/60 shadow-soft">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-2">
              <Clock size={16} className="text-primary" /> Recent Activity Timeline
            </h3>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground/60 select-none font-bold">
                Timeline is currently empty.
              </div>
            ) : (
              events.map(e => {
                const sevColor = e.severity === "High" ? "bg-rose-500/10 text-rose-500 border border-rose-500/10" :
                                 e.severity === "Medium" ? "bg-amber-500/10 text-amber-500 border border-amber-500/10" :
                                 "bg-slate-500/10 text-slate-500 border border-slate-500/10";
                return (
                  <div key={e.id} className="p-3 bg-muted/15 border border-border/40 rounded-lg text-xs font-semibold flex items-center justify-between gap-3 hover:bg-muted/20 transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${sevColor}`}>{e.severity}</span>
                      <div>
                        <span className="font-extrabold text-foreground">{e.type}</span>
                        <span className="text-[10px] text-muted-foreground/60 block mt-0.5">{e.description} &bull; Actor: {e.actor}</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] text-muted-foreground/50 shrink-0 font-mono select-none">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="p-6 space-y-4 border-border/80 bg-card shadow-soft">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-2">
              <PlusCircle size={16} className="text-primary" /> Operational Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold select-none">
            {[
              { label: "Review Tutors", desc: "Review pending educator credentials & applications", tab: "tutors" },
              { label: "Review Courses", desc: "Inspect submitted course curricula & approve publication", tab: "courses" },
              { label: "Review Payments", desc: "Verify escrow transactions & authorize pending payouts", tab: "payments" },
              { label: "View Reports", desc: "Investigate moderation flags & user support tickets", tab: "reports" },
              { label: "Manage Categories", desc: "Organize course taxonomy & subject skills", tab: "categories" },
              { label: "Check System Health", desc: "Monitor database latency & operational services", tab: "system-health" }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => onNavigateTab(action.tab)}
                className="w-full text-left px-3.5 py-3 rounded-lg border border-border bg-muted/20 hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-bold flex justify-between items-center group cursor-pointer"
              >
                <div>
                  <span className="text-foreground block">{action.label}</span>
                  <span className="text-[10px] text-muted-foreground font-normal mt-0.5 block">{action.desc}</span>
                </div>
                <span className="text-primary group-hover:translate-x-1 transition-transform shrink-0 ml-2">&rarr;</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Audit Logs */}
        <Card className="lg:col-span-3 p-6 space-y-4 border-border/80 bg-card/60 shadow-soft">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" /> Recent System Audit Logs
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-extrabold uppercase text-[9px] tracking-wider select-none">
                  <th className="pb-3 pl-2">User (Role)</th>
                  <th className="pb-3">Operational Module</th>
                  <th className="pb-3">Action Details</th>
                  <th className="pb-3">IP Host</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {localAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground/60 font-semibold select-none">
                      No recent audits registered in database.
                    </td>
                  </tr>
                ) : (
                  localAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-extrabold text-foreground">{log.user}</div>
                        <div className="text-[9.5px] text-muted-foreground/50 font-bold uppercase mt-0.5">{log.role}</div>
                      </td>
                      <td className="py-3 font-semibold text-primary/95">{log.module}</td>
                      <td className="py-3 font-bold text-foreground">{log.action}</td>
                      <td className="py-3 font-mono text-muted-foreground">{log.ip}</td>
                      <td className="py-3 text-right text-muted-foreground/80 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </motion.div>
  );
}
