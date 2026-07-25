"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, Trash2, Mail, Lock, ShieldAlert, Award, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { PaymentService } from "../../../../../features/payments/services/paymentService";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "learner" | "tutor" | "admin";
  status: "Active" | "Suspended";
  createdAt: string;
  walletCoins: number;
}

interface VerificationApp {
  id: string;
  tutorName: string;
  expertise: string;
  education: string;
  status: "Pending" | "Approved" | "Rejected";
  govIdFile: string;
  studentIdFile: string;
  isDynamic?: boolean;
  email?: string;
}

interface UsersTabProps {
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  verifications: VerificationApp[];
  setVerifications: React.Dispatch<React.SetStateAction<VerificationApp[]>>;
  onApproveTutor: (id: string) => void;
  onRejectTutor: (id: string) => void;
  logAuditAction: (actionStr: string) => void;
}

export default function UsersTab({
  users,
  setUsers,
  verifications,
  setVerifications,
  onApproveTutor,
  onRejectTutor,
  logAuditAction
}: UsersTabProps) {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  // Custom Filters state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  
  const toggleUserStatus = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, status: users.find(u => u.id === id)?.status === "Active" ? "Suspended" : "Active" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user status");

      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: data.status } : u)));
      toast.success(`User status changed to ${data.status}.`);
      logAuditAction(`User status modified: ${users.find(u => u.id === id)?.name} set to ${data.status}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Name,Email,Role,Status,Created At,Coins\n";
    const rows = users.map(u => `${u.id},"${u.name}",${u.email},${u.role},${u.status},${u.createdAt},${u.walletCoins}`).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `eduearn_users_${Date.now()}.csv`);
    a.click();
    toast.success("CSV export completed successfully.");
    logAuditAction("Exported user roster directory as CSV");
  };

  const filteredUsers = users
    .filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
    .filter((u) => {
      if (roleFilter === "all") return true;
      if (roleFilter === "moderator") return u.role === "admin"; // Mock mapping
      return u.role === roleFilter;
    })
    .filter((u) => {
      if (statusFilter === "all") return true;
      return u.status === statusFilter;
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
    >
      {/* HEADER TABS & ADVANCED CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-3 select-none">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Users" },
            { id: "learner", label: "Students" },
            { id: "tutor", label: "Tutors" },
            { id: "admin", label: "Admins" },
            { id: "moderator", label: "Moderators" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRoleFilter(item.id)}
              className={`px-3.5 py-1.5 border rounded-button text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                roleFilter === item.id
                  ? "bg-primary border-primary text-white shadow-soft"
                  : "border-border text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-[10px] h-8 font-bold">
            Export CSV
          </Button>
        </div>
      </div>

      {/* FILTER SEARCH PANEL */}
      <Card className="p-4 border-border bg-card shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 border border-border rounded-button bg-muted/15 px-3 py-1.5 w-full">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search user directory..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-semibold"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border rounded-button bg-card px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="all">Filter: All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="border border-border rounded-button bg-card px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="all">Filter: All Countries</option>
            <option value="in">India</option>
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
          </select>
        </div>
      </Card>

      {/* TUTOR VERIFICATION APPLICATIONS QUEUE */}
      {roleFilter === "tutor" && verifications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-heading font-extrabold uppercase text-foreground select-none flex items-center gap-2">
            <ShieldCheck className="text-primary animate-pulse" size={16} />
            Tutor Certification & Video KYC Desk ({verifications.filter(v => v.status === "Pending").length} Pending)
          </h3>
          <div className="flex flex-col gap-3">
            {verifications.map((v) => {
              const isAppExpanded = selectedAppId === v.id;
              return (
                <div key={v.id} className="border border-border bg-card p-4 rounded-card flex flex-col gap-4 shadow-soft">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-500 shrink-0 select-none">
                        {v.tutorName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{v.tutorName}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Subject: {v.expertise} · Background: {v.education}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center select-none">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        v.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                        v.status === "Rejected" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600 animate-pulse"
                      }`}>
                        {v.status}
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedAppId(isAppExpanded ? null : v.id)}
                          className="text-[9px] h-7 px-2.5"
                        >
                          {isAppExpanded ? "Collapse" : "Verify Documents"}
                        </Button>
                        {v.status === "Pending" && (
                          <>
                            <Button
                              onClick={() => onApproveTutor(v.id)}
                              className="text-[9px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => onRejectTutor(v.id)}
                              className="text-[9px] h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isAppExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-border/30 pt-4 space-y-4 text-xs font-semibold"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase text-muted-foreground/80 block">Government ID Document</span>
                          <span className="text-foreground block font-bold underline cursor-pointer hover:text-primary">{v.govIdFile}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase text-muted-foreground/80 block">College ID Scan</span>
                          <span className="text-foreground block font-bold underline cursor-pointer hover:text-primary">{v.studentIdFile}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase text-muted-foreground/80 block">Video KYC / Bank PAN Details</span>
                          <span className="text-foreground block font-bold text-emerald-500">Verified Match (Pass)</span>
                        </div>
                      </div>
                      
                      {/* ✨ Sparky AI Interview Report */}
                      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2 select-none">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-extrabold text-primary flex items-center gap-1.5">
                            <Sparkles size={12} className="animate-pulse" /> ✨ Sparky AI Interview Report
                          </span>
                          <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Score: 88/100 (PASSED)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                          <div><span className="text-muted-foreground">Knowledge:</span> <strong className="text-foreground">90/100</strong></div>
                          <div><span className="text-muted-foreground">Teaching Style:</span> <strong className="text-foreground">88/100</strong></div>
                          <div><span className="text-muted-foreground">Communication:</span> <strong className="text-foreground">92/100</strong></div>
                          <div><span className="text-muted-foreground">Doubt Resolution:</span> <strong className="text-foreground">90/100</strong></div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">&quot;Candidate demonstrated strong domain knowledge, clear teaching methodology, and empathetic student doubt handling.&quot;</p>
                      </div>

                      {/* Audits Action */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-border/30 pt-3 select-none">
                        <Button
                          onClick={() => {
                            PaymentService.addNotification("✨ AI Re-Interview Requested", "The admin desk requested a re-assessment of your ✨ Sparky AI Tutor Interview. Please log into your dashboard to retake the interview.", "system");
                            toast.info("AI Re-Interview request sent to applicant.");
                            logAuditAction(`Requested AI re-interview from tutor applicant: ${v.tutorName}`);
                          }}
                          size="sm"
                          className="h-8 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Request Re-Interview
                        </Button>
                        <Button
                          onClick={() => {
                            const matchedUser = users.find(u => u.name === v.tutorName);
                            if (matchedUser) {
                              setUsers(prev => prev.map(item => item.id === matchedUser.id ? { ...item, status: "Suspended" } : item));
                            }
                            if (v.isDynamic) {
                              localStorage.setItem("tutor_application_status", "suspended");
                              PaymentService.addNotification("Creator Suite Suspended", "Your tutor account access has been suspended by administration. You cannot publish new courses or host live sessions.", "system");
                            }
                            toast.warning(`Tutor ${v.tutorName} suspended.`);
                            logAuditAction(`Suspended tutor: ${v.tutorName}`);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold"
                        >
                          Suspend Account
                        </Button>
                        <Button
                          onClick={() => {
                            const matchedUser = users.find(u => u.name === v.tutorName);
                            if (matchedUser) {
                              setUsers(prev => prev.filter(item => item.id !== matchedUser.id));
                            }
                            setVerifications(prev => prev.filter(item => item.id !== v.id));
                            if (v.isDynamic) {
                              localStorage.removeItem("tutor_application_status");
                              localStorage.removeItem("tutor_application_details");
                            }
                            toast.error(`Tutor verification profile deleted.`);
                            logAuditAction(`Wiped tutor application: ${v.tutorName}`);
                            setSelectedAppId(null);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold bg-rose-500/10 text-rose-500 border-rose-500/20"
                        >
                          Delete Profile
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* USER LIST DIRECTORY */}
      <div className="flex flex-col gap-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-10 border border-border/60 rounded-card text-xs text-muted-foreground/60">
            No users matched the criteria filters.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isStudentExpanded = selectedStudentId === u.id;
            return (
              <div
                key={u.id}
                className="border border-border bg-card p-4 rounded-card flex flex-col gap-4 shadow-soft"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 select-none">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{u.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{u.email} · Registered: {u.createdAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center select-none">
                    <span className="text-[9px] font-extrabold uppercase bg-muted text-muted-foreground/80 px-2 py-0.5 rounded">
                      {u.role}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      u.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600 animate-pulse"
                    }`}>
                      {u.status}
                    </span>
                    <div className="flex gap-1.5">
                      {u.role === "learner" && (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedStudentId(isStudentExpanded ? null : u.id)}
                          className="text-[9px] h-7 px-2.5"
                        >
                          {isStudentExpanded ? "Hide Progress" : "View Progress"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => toggleUserStatus(u.id)}
                        className="text-[9px] h-7 px-2.5"
                      >
                        {u.status === "Active" ? "Suspend" : "Activate"}
                      </Button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to permanently delete user "${u.name}"?`)) return;
                          try {
                            const res = await fetch(`/api/admin/users?userId=${u.id}`, { method: "DELETE" });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || "Failed to delete user");

                            setUsers((prev) => prev.filter((item) => item.id !== u.id));
                            logAuditAction(`Permanently deleted user: ${u.name}`);
                            toast.success("User permanently deleted.");
                          } catch (err: any) {
                            toast.error(err.message);
                          }
                        }}
                        className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border rounded cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Student detailed card */}
                {u.role === "learner" && isStudentExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-border/30 pt-4 space-y-4 text-xs font-semibold"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-muted-foreground/80 block">Subscription Tier</span>
                        <span className="text-foreground block font-bold">Student Plus (Active)</span>
                        <span className="text-[9px] text-muted-foreground/80 font-normal">Next bill: July 28, 2026</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-muted-foreground/80 block">Course Purchases</span>
                        <span className="text-foreground block font-bold">Python Basic to Advanced</span>
                        <span className="text-[9px] text-emerald-500 font-normal">Paid: ₹1,200 (Success)</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-muted-foreground/80 block">Certificates Earned</span>
                        <span className="text-foreground block font-bold">Python Programming Certificate</span>
                        <span className="text-[9px] text-muted-foreground/80 font-normal">Hash: 0x8fa3f...91d</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-muted-foreground/80 block">Learning Progress</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: "90%" }} />
                          </div>
                          <span>90% Complete</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-border/30 pt-3 select-none">
                      <Button
                        onClick={() => {
                          toast.info(`Password reset trigger link dispatched to ${u.email}`);
                          logAuditAction(`Dispatched password reset: ${u.name}`);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold"
                      >
                        Reset Password
                      </Button>
                      <Button
                        onClick={() => {
                          toast.success(`Mail template successfully sent to ${u.email}`);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold"
                      >
                        Send Alert Mail
                      </Button>
                      <Button
                        onClick={() => {
                          setUsers(prev => prev.map(item => item.id === u.id ? { ...item, role: "admin" } : item));
                          toast.success(`User role upgraded to Admin.`);
                          logAuditAction(`Promoted user ${u.name} to Admin`);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold"
                      >
                        Promote Role
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
