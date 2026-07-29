// src/app/admin/dashboard/components/users/UsersTab.tsx

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShieldCheck, Trash2, Mail, ShieldAlert, Award, 
  FileText, CheckCircle2, Sparkles, X, Eye, Video, Calendar, 
  RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal, 
  ExternalLink, User, Check, AlertCircle, Info, Ban, UserCheck,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { AdminUser, TutorVerificationApp as VerificationApp } from "@/lib/types/admin";

interface UsersTabProps {
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  verifications: VerificationApp[];
  setVerifications: React.Dispatch<React.SetStateAction<VerificationApp[]>>;
  onApproveTutor: (id: string) => void;
  onRejectTutor: (id: string) => void;
  logAuditAction: (actionStr: string) => void;
  isLoading?: boolean;
}

export default function UsersTab({
  users,
  setUsers,
  verifications,
  setVerifications,
  logAuditAction,
  isLoading = false
}: UsersTabProps) {
  // Navigation & filter tab state
  const [roleFilter, setRoleFilter] = useState<string>("learner");
  const [userSearch, setUserSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Student Profile states
  const [selectedUserProfile, setSelectedUserProfile] = useState<AdminUser | null>(null);
  const [grantCoinsAmount, setGrantCoinsAmount] = useState<number>(0);
  const [isGrantingCoins, setIsGrantingCoins] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const renderTableSkeletons = (colCount: number, rowCount = 5) => {
    return Array.from({ length: rowCount }).map((_, index) => (
      <tr key={`skeleton-row-${index}`} className="animate-pulse">
        {Array.from({ length: colCount }).map((_, colIndex) => (
          <td key={`skeleton-col-${colIndex}`} className="py-4 px-3">
            <div className="h-4 bg-muted-foreground/10 rounded w-4/5"></div>
          </td>
        ))}
      </tr>
    ));
  };
  
  // Tutor App states
  const [appSearch, setAppSearch] = useState<string>("");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<VerificationApp | null>(null);
  
  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [appPage, setAppPage] = useState(1);
  const itemsPerPage = 8;

  // Decision & Notes states inside Drawer
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Stats derivation
  const totalApps = verifications.length;
  const pendingApps = verifications.filter(v => v.status === "Pending" || v.status === "Under Review").length;
  const approvedApps = verifications.filter(v => v.status === "Approved").length;
  const rejectedApps = verifications.filter(v => v.status === "Rejected").length;
  
  const scoreFilteredApps = verifications.filter(v => v.aiEvaluation?.overall_score);
  const avgAiScore = scoreFilteredApps.length > 0
    ? (scoreFilteredApps.reduce((acc, v) => acc + (v.aiEvaluation?.overall_score || 0), 0) / scoreFilteredApps.length).toFixed(1)
    : "N/A";
  
  const approvalRate = totalApps > 0 
    ? ((approvedApps / totalApps) * 100).toFixed(0) 
    : "0";

  // Toggle user active status
  const toggleUserStatus = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: id, 
          status: users.find(u => u.id === id)?.status === "Active" ? "Suspended" : "Active" 
        })
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

  // Permanently delete user
  const handleDeleteUser = async (u: AdminUser) => {
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
  };

  // Grant coins to a student
  const handleGrantCoins = async (userId: string, amount: number) => {
    setIsGrantingCoins(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, coins: amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grant coins");

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, walletCoins: data.walletCoins } : u)));
      setSelectedUserProfile((prev) => prev ? { ...prev, walletCoins: data.walletCoins } : null);
      logAuditAction(`Granted ${amount} coins to student: ${users.find(u => u.id === userId)?.name}`);
      toast.success(`Successfully set wallet balance to ${amount} coins.`);
      setGrantCoinsAmount(0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsGrantingCoins(false);
    }
  };

  // Reset student password
  const handleResetPassword = (u: AdminUser) => {
    toast.success(`Password reset link dispatched to ${u.email}.`);
    logAuditAction(`Dispatched password reset request for user: ${u.name}`);
  };

  // Issue custom certificate
  const handleIssueCertificate = (u: AdminUser) => {
    toast.success(`Custom qualification certificate issued for ${u.name}.`);
    logAuditAction(`Issued administrative certificate for user: ${u.name}`);
  };

  // Submit admin action for tutor application
  const handleAppAction = async (status: "Approved" | "Rejected" | "Under Review" | "Pending", additionalPayload: any = {}) => {
    if (!selectedApp) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: selectedApp.id,
          status,
          adminNotes: adminNotes || selectedApp.adminNotes,
          ...additionalPayload
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update application status");
      }

      const updatedApp = await res.json();
      
      // Update local state
      setVerifications(prev => prev.map(v => v.id === selectedApp.id ? { ...v, status, ...additionalPayload, adminNotes } : v));
      setSelectedApp(prev => prev ? { ...prev, status, ...additionalPayload, adminNotes } : null);
      
      logAuditAction(`Tutor verification marked as ${status} for ${selectedApp.tutorName}`);
      toast.success(`Tutor application marked as ${status}`);
      
      // Reset forms
      setShowRejectForm(false);
      setShowInterviewForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit verification action");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "ID,Name,Email,Role,Status,Created At,Coins\n";
    const rows = users.map(u => `${u.id},"${u.name}",${u.email},${u.role},${u.status},${u.createdAt},${u.walletCoins}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `eduearn_users_${Date.now()}.csv`);
    a.click();
    toast.success("CSV export completed.");
  };

  // Sorting state for users
  const [sortField, setSortField] = useState<string>("name");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Sorting state for applications
  const [appSortField, setAppSortField] = useState<string>("tutorName");
  const [appSortAsc, setAppSortAsc] = useState<boolean>(true);

  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Clear selections on filter/search change
  React.useEffect(() => {
    setSelectedUserIds([]);
  }, [roleFilter, userSearch, statusFilter]);

  React.useEffect(() => {
    setSelectedAppIds([]);
  }, [appSearch, appStatusFilter]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleAppSort = (field: string) => {
    if (appSortField === field) {
      setAppSortAsc(!appSortAsc);
    } else {
      setAppSortField(field);
      setAppSortAsc(true);
    }
  };

  // Bulk actions handlers
  const handleBulkStatusChange = async (newStatus: "Active" | "Suspended") => {
    if (selectedUserIds.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);
    let successCount = 0;
    const toastId = toast.loading(`Updating ${selectedUserIds.length} users status...`);
    for (const id of selectedUserIds) {
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, status: newStatus })
        });
        if (res.ok) successCount++;
      } catch {}
    }
    setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: newStatus } : u));
    setSelectedUserIds([]);
    toast.success(`Successfully set ${successCount} users to ${newStatus}.`, { id: toastId });
    logAuditAction(`Bulk modified status of ${successCount} users to ${newStatus}`);
    setIsBulkProcessing(false);
  };

  const handleBulkGrantCoins = async (amount: number) => {
    if (selectedUserIds.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);
    let successCount = 0;
    const toastId = toast.loading(`Granting coins to ${selectedUserIds.length} students...`);
    for (const id of selectedUserIds) {
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, coins: amount })
        });
        if (res.ok) successCount++;
      } catch {}
    }
    setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, walletCoins: amount } : u));
    setSelectedUserIds([]);
    toast.success(`Granted ${amount} coins to ${successCount} students.`, { id: toastId });
    logAuditAction(`Bulk granted ${amount} coins to ${successCount} students`);
    setIsBulkProcessing(false);
  };

  const handleBulkExportCSV = () => {
    const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
    const headers = "ID,Name,Email,Role,Status,Created At,Coins\n";
    const rows = selectedUsers.map(u => `${u.id},"${u.name}",${u.email},${u.role},${u.status},${u.createdAt},${u.walletCoins}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `eduearn_selected_users_${Date.now()}.csv`);
    a.click();
    toast.success("CSV export for selected records completed.");
    setSelectedUserIds([]);
  };

  const handleBulkApproveApps = async () => {
    if (selectedAppIds.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);
    let successCount = 0;
    const toastId = toast.loading(`Approving ${selectedAppIds.length} tutor applications...`);
    for (const id of selectedAppIds) {
      try {
        const res = await fetch("/api/admin/verifications", {
          method: "PATCH",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verificationId: id, status: "Approved", adminNotes: "Bulk approved" })
        });
        if (res.ok) successCount++;
      } catch {}
    }
    setVerifications(prev => prev.map(v => selectedAppIds.includes(v.id) ? { ...v, status: "Approved", adminNotes: "Bulk approved" } : v));
    setSelectedAppIds([]);
    toast.success(`Approved ${successCount} tutor applications.`, { id: toastId });
    setIsBulkProcessing(false);
  };

  // Filter & Sort roster
  const filteredUsers = React.useMemo(() => {
    const list = users
      .filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
      .filter((u) => {
        if (roleFilter === "tutor-roster") return u.role === "tutor";
        if (roleFilter === "all") return true;
        return u.role === roleFilter;
      })
      .filter((u) => statusFilter === "all" ? true : u.status === statusFilter);

    return [...list].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortField === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === "email") {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortField === "enrollments") {
        valA = a.enrollments?.length || 0;
        valB = b.enrollments?.length || 0;
      } else if (sortField === "walletCoins") {
        valA = a.walletCoins || 0;
        valB = b.walletCoins || 0;
      } else if (sortField === "status") {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      } else if (sortField === "createdAt") {
        valA = a.createdAt;
        valB = b.createdAt;
      } else if (sortField === "rating") {
        valA = a.tutorDetails?.averageRating || 0;
        valB = b.tutorDetails?.averageRating || 0;
      } else if (sortField === "revenue") {
        valA = a.tutorDetails?.totalRevenue || 0;
        valB = b.tutorDetails?.totalRevenue || 0;
      } else if (sortField === "courses") {
        valA = a.tutorDetails?.publishedCoursesCount || 0;
        valB = b.tutorDetails?.publishedCoursesCount || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [users, userSearch, roleFilter, statusFilter, sortField, sortAsc]);

  // Filter & Sort applications
  const filteredApps = React.useMemo(() => {
    const list = verifications
      .filter((v) => v.tutorName.toLowerCase().includes(appSearch.toLowerCase()) || v.email.toLowerCase().includes(appSearch.toLowerCase()) || v.expertise.toLowerCase().includes(appSearch.toLowerCase()))
      .filter((v) => appStatusFilter === "all" ? true : v.status === appStatusFilter);

    return [...list].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (appSortField === "tutorName") {
        valA = a.tutorName.toLowerCase();
        valB = b.tutorName.toLowerCase();
      } else if (appSortField === "email") {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (appSortField === "expertise") {
        valA = a.expertise.toLowerCase();
        valB = b.expertise.toLowerCase();
      } else if (appSortField === "score") {
        valA = a.aiEvaluation?.overall_score || 0;
        valB = b.aiEvaluation?.overall_score || 0;
      } else if (appSortField === "status") {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      }

      if (valA < valB) return appSortAsc ? -1 : 1;
      if (valA > valB) return appSortAsc ? 1 : -1;
      return 0;
    });
  }, [verifications, appSearch, appStatusFilter, appSortField, appSortAsc]);

  // Paginated user slices
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  // Paginated apps slices
  const totalAppPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((appPage - 1) * itemsPerPage, appPage * itemsPerPage);

  const calculateAge = (dobString?: string) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      
      {/* ── ROLE TAB SWITCHER ── */}
      <div className="flex border-b border-border/40 pb-px gap-4">
        {[
          { id: "learner", label: "Student Roster" },
          { id: "tutor-roster", label: "Tutor Roster" },
          { id: "tutor", label: "Tutor Applications Desk" },
          { id: "admin", label: "Admin Roster" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setRoleFilter(tab.id);
              setUserPage(1);
              setAppPage(1);
            }}
            className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-all relative ${
              roleFilter === tab.id 
                ? 'border-primary text-primary font-extrabold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.id === 'tutor' && pendingApps > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {pendingApps}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TUTOR APPLICATIONS PORTAL VIEW ── */}
      {roleFilter === "tutor" ? (
        <div className="space-y-6">
          
          {/* 1. Analytics Widget Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: "Total Applications", value: totalApps, sub: "All time submitted", color: "text-foreground" },
              { label: "Pending Review", value: pendingApps, sub: "Awaiting action", color: "text-amber-500" },
              { label: "Approved Tutors", value: approvedApps, sub: "Granted access", color: "text-emerald-500" },
              { label: "Rejected Applications", value: rejectedApps, sub: "Unsuccessful", color: "text-rose-500" },
              { label: "Average AI Score", value: avgAiScore !== "N/A" ? `${avgAiScore}%` : "N/A", sub: "Gemini evaluation", color: "text-purple-500" },
              { label: "Approval Rate", value: `${approvalRate}%`, sub: "Applications success", color: "text-blue-500" },
            ].map((card, idx) => (
              <Card key={idx} className="p-4 bg-card border border-border/40 space-y-1 shadow-soft">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{card.label}</span>
                <strong className={`text-2xl font-extrabold tracking-tight ${card.color}`}>{card.value}</strong>
                <span className="text-[10px] text-muted-foreground block">{card.sub}</span>
              </Card>
            ))}
          </div>

          {/* 2. Searching, Filtering, and Table Desk */}
          <Card className="bg-card border border-border/40 p-4 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2 border border-border bg-background px-3 py-2 rounded-xl flex-1 max-w-md">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tutor applicants, email, subjects..."
                  value={appSearch}
                  onChange={(e) => { setAppSearch(e.target.value); setAppPage(1); }}
                  className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-semibold"
                />
              </div>

              <div className="flex items-center gap-3">
                <SlidersHorizontal size={14} className="text-muted-foreground" />
                <select
                  value={appStatusFilter}
                  onChange={(e) => { setAppStatusFilter(e.target.value); setAppPage(1); }}
                  className="border border-border rounded-xl bg-background px-3 py-2 text-xs font-bold focus:outline-none text-foreground"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                    <th className="py-4 px-3">Applicant</th>
                    <th className="py-4 px-3">Expertise / Category</th>
                    <th className="py-4 px-3">Experience</th>
                    <th className="py-4 px-3 text-center">AI Assessment Score</th>
                    <th className="py-4 px-3">Application Date</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs font-semibold">
                  {paginatedApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground">
                        No tutor applications matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedApps.map((app) => {
                      const aiScore = app.aiEvaluation?.overall_score;
                      return (
                        <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {app.tutorName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground">{app.tutorName}</h4>
                              <span className="text-[10px] text-muted-foreground">{app.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 max-w-[200px] truncate">{app.expertise}</td>
                          <td className="py-4 px-3">{app.teachingExperience?.teachingExpYears ? `${app.teachingExperience.teachingExpYears} Years` : "N/A"}</td>
                          <td className="py-4 px-3 text-center">
                            {aiScore !== undefined ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                aiScore >= 80 
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {aiScore}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">No Quiz Taken</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-muted-foreground text-[11px]">
                            {app.created_at ? new Date(app.created_at).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="py-4 px-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                              app.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                              app.status === "Rejected" ? "bg-rose-500/10 text-rose-600" :
                              app.status === "Under Review" ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <Button
                              onClick={() => {
                                setSelectedApp(app);
                                setAdminNotes(app.adminNotes || "");
                                setRejectionReason(app.rejectionReason || "");
                                setShowRejectForm(false);
                                setShowInterviewForm(false);
                              }}
                              className="text-[10px] font-bold h-8 px-3 bg-primary hover:bg-primary/90 text-white flex items-center gap-1 ml-auto"
                            >
                              <Eye size={12} /> Review Application
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalAppPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                <span className="text-xs text-muted-foreground">Showing {(appPage - 1) * itemsPerPage + 1} to {Math.min(appPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} applications</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAppPage(p => Math.max(1, p - 1))}
                    disabled={appPage === 1}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setAppPage(p => Math.min(totalAppPages, p + 1))}
                    disabled={appPage === totalAppPages}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* ── REGULAR USER DIRECTORY LIST ── */
        <div className="space-y-6">
          {/* BULK ACTION BAR */}
          {selectedUserIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs font-bold shadow-soft select-none"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-foreground">Selected {selectedUserIds.length} users</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBulkStatusChange("Active")}
                  size="sm"
                  className="h-8.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white uppercase font-extrabold tracking-wider"
                >
                  Activate Selected
                </Button>
                <Button
                  onClick={() => handleBulkStatusChange("Suspended")}
                  size="sm"
                  className="h-8.5 text-[10px] bg-amber-600 hover:bg-amber-700 text-white uppercase font-extrabold tracking-wider"
                >
                  Suspend Selected
                </Button>
                {roleFilter === "learner" && (
                  <Button
                    onClick={() => {
                      const amt = Number(prompt("Enter amount of coins to grant to selected students:", "100"));
                      if (!isNaN(amt) && amt > 0) handleBulkGrantCoins(amt);
                    }}
                    size="sm"
                    className="h-8.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white uppercase font-extrabold tracking-wider"
                  >
                    Grant Coins
                  </Button>
                )}
                <Button
                  onClick={handleBulkExportCSV}
                  size="sm"
                  variant="outline"
                  className="h-8.5 text-[10px] uppercase font-extrabold tracking-wider border-border bg-card hover:bg-muted"
                >
                  Export Selected
                </Button>
              </div>
            </motion.div>
          )}

          <Card className="bg-card border border-border/40 p-4 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2 border border-border bg-background px-3 py-2 rounded-xl flex-1 max-w-md">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search student or admin directory..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                  className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-semibold"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-bold">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setUserPage(1); }}
                    className="border border-border rounded-xl bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <Button
                  onClick={handleExportCSV}
                  className="text-xs font-bold h-9 bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1.5"
                >
                  <FileText size={12} /> Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider select-none">
                    <th className="py-4 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.includes(u.id))}
                        onChange={() => {
                          const pageUserIds = paginatedUsers.map(u => u.id);
                          const allSelected = pageUserIds.every(id => selectedUserIds.includes(id));
                          if (allSelected) {
                            setSelectedUserIds(prev => prev.filter(id => !pageUserIds.includes(id)));
                          } else {
                            setSelectedUserIds(prev => Array.from(new Set([...prev, ...pageUserIds])));
                          }
                        }}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary animate-none"
                      />
                    </th>
                    {roleFilter === "learner" && (
                      <>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("name")}>
                          Student Name {sortField === "name" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("email")}>
                          Email Address {sortField === "email" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3">Country</th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("enrollments")}>
                          Enrolled {sortField === "enrollments" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3">Avg Progress</th>
                        <th className="py-4 px-3">Certificates</th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("walletCoins")}>
                          Wallet Coins {sortField === "walletCoins" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3">Last Activity</th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("status")}>
                          Status {sortField === "status" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                      </>
                    )}
                    {roleFilter === "tutor-roster" && (
                      <>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("name")}>
                          Tutor Name {sortField === "name" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("email")}>
                          Email Address {sortField === "email" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3">Verification</th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("courses")}>
                          Courses {sortField === "courses" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3">Students Taught</th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("revenue")}>
                          Total Revenue {sortField === "revenue" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("rating")}>
                          Avg Rating {sortField === "rating" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("status")}>
                          Status {sortField === "status" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                      </>
                    )}
                    {roleFilter === "admin" && (
                      <>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("name")}>
                          Admin Name {sortField === "name" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("email")}>
                          Email Address {sortField === "email" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("createdAt")}>
                          Date Joined {sortField === "createdAt" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                        <th className="py-4 px-3">Role</th>
                        <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("status")}>
                          Status {sortField === "status" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </th>
                      </>
                    )}
                    <th className="py-4 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs font-semibold">
                  {isLoading ? (
                    renderTableSkeletons(roleFilter === "tutor-roster" ? 10 : roleFilter === "learner" ? 11 : 7)
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={roleFilter === "tutor-roster" ? 10 : roleFilter === "learner" ? 11 : 7} className="text-center py-12 text-muted-foreground">
                        No roster directory records matched.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      const studentCertsCount = u.enrollments?.filter((e: any) => e.certificateUrl).length || 0;
                      const studentAvgProgress = u.enrollments && u.enrollments.length > 0
                        ? Math.round(u.enrollments.reduce((sum: number, e: any) => sum + (e.progressPercent || 0), 0) / u.enrollments.length)
                        : 0;

                      return (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-3">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(u.id)}
                              onChange={() => {
                                setSelectedUserIds(prev =>
                                  prev.includes(u.id) ? prev.filter(uid => uid !== u.id) : [...prev, u.id]
                                );
                              }}
                              className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                            />
                          </td>
                          <td className="py-4 px-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-bold text-foreground">{u.name}</span>
                          </td>
                          <td className="py-4 px-3">{u.email}</td>

                          {/* STUDENT COLUMN VALUES */}
                          {roleFilter === "learner" && (
                            <>
                              <td className="py-4 px-3 text-muted-foreground">{u.country || "India"}</td>
                              <td className="py-4 px-3">
                                <span className="px-2 py-0.5 rounded bg-muted text-foreground text-[10px]">
                                  {u.enrollments?.length || 0} Enrolled
                                </span>
                              </td>
                              <td className="py-4 px-3">
                                <div className="inline-flex items-center gap-1.5 bg-primary/5 dark:bg-primary/10 text-primary border border-primary/10 rounded-full px-2 py-0.5 text-[10px]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                  <span>{studentAvgProgress}% Progress</span>
                                </div>
                              </td>
                              <td className="py-4 px-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                                  studentCertsCount > 0
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-extrabold"
                                    : "bg-muted text-muted-foreground border border-border/40"
                                }`}>
                                  <Award size={10} className={studentCertsCount > 0 ? "text-emerald-500" : "text-muted-foreground"} />
                                  {studentCertsCount} certs
                                </span>
                              </td>
                              <td className="py-4 px-3 text-amber-500 font-bold">{u.walletCoins || 0}</td>
                              <td className="py-4 px-3 text-muted-foreground truncate max-w-[150px]" title={u.lastActivity}>
                                {u.lastActivity || "Never logged"}
                              </td>
                            </>
                          )}

                          {/* TUTOR COLUMN VALUES */}
                          {roleFilter === "tutor-roster" && (
                            <>
                              <td className="py-4 px-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                                  u.tutorDetails?.verificationStatus === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                                  u.tutorDetails?.verificationStatus === "Rejected" ? "bg-rose-500/10 text-rose-600" :
                                  "bg-amber-500/10 text-amber-600"
                                }`}>
                                  {u.tutorDetails?.verificationStatus || "Approved"}
                                </span>
                              </td>
                              <td className="py-4 px-3">{u.tutorDetails?.publishedCoursesCount || 0} Published</td>
                              <td className="py-4 px-3">{u.tutorDetails?.studentsTaughtCount || 0} Students</td>
                              <td className="py-4 px-3 text-emerald-500 font-bold">₹{u.tutorDetails?.totalRevenue?.toLocaleString() || 0}</td>
                              <td className="py-4 px-3">
                                <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                                  <span className="text-amber-500 font-extrabold text-[10px]">★</span>
                                  <span>{u.tutorDetails?.averageRating ? Number(u.tutorDetails.averageRating).toFixed(1) : "0.0"}</span>
                                </div>
                              </td>
                            </>
                          )}

                          {/* ADMIN COLUMN VALUES */}
                          {roleFilter === "admin" && (
                            <>
                              <td className="py-4 px-3 text-muted-foreground">{u.createdAt}</td>
                              <td className="py-4 px-3 uppercase text-[10px] font-extrabold text-primary">{u.role}</td>
                            </>
                          )}

                          <td className="py-4 px-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                              u.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedUserProfile(u);
                                setGrantCoinsAmount(u.walletCoins || 0);
                              }}
                              className="text-[10px] font-bold h-8 px-2.5 flex items-center gap-1"
                            >
                              <Eye size={12} /> View Profile
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => toggleUserStatus(u.id)}
                              className="text-[10px] font-bold h-8 px-2.5"
                            >
                              {u.status === "Active" ? "Suspend" : "Activate"}
                            </Button>
                            <Button
                              onClick={() => handleDeleteUser(u)}
                              className="text-[10px] font-bold h-8 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalUserPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                <span className="text-xs text-muted-foreground">Showing {(userPage - 1) * itemsPerPage + 1} to {Math.min(userPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                    disabled={userPage === totalUserPages}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── 3. SLIDING REVIEW drawer console ── */}
      <AnimatePresence>
        {selectedApp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-background border-l border-border/80 z-50 overflow-y-auto shadow-2xl flex flex-col justify-between"
            >
              
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Main Panel Content Scroll */}
              <div className="p-6 space-y-8 flex-1">
                
                {/* 1. Profile Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <User size={14} /> Personal Profile Details
                  </h3>
                  <Card className="p-5 bg-card/50 border border-border/40 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Full Name</span>
                        <span className="text-foreground">{selectedApp.personalInfo?.fullName || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Display Name</span>
                        <span className="text-foreground">{selectedApp.personalInfo?.displayName || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Headline</span>
                        <span className="text-foreground">{selectedApp.personalInfo?.headline || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                        <span className="text-foreground">{selectedApp.personalInfo?.phone || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Location</span>
                        <span className="text-foreground">{selectedApp.personalInfo?.city}, {selectedApp.personalInfo?.state}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Age / DOB</span>
                        <span className="text-foreground">{selectedApp.personalInfo?.dob || "N/A"} ({calculateAge(selectedApp.personalInfo?.dob)} Years Old)</span>
                      </div>
                    </div>

                    {selectedApp.personalInfo?.bio && (
                      <div className="border-t border-border/30 pt-3 text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground block mb-0.5 text-[10px] uppercase font-bold text-slate-500">Bio Description</strong>
                        &quot;{selectedApp.personalInfo.bio}&quot;
                      </div>
                    )}
                  </Card>
                </div>

                {/* 2. Academics */}
                {selectedApp.academicQualifications && selectedApp.academicQualifications.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Award size={14} /> Academic Qualifications
                    </h3>
                    <Card className="p-4 bg-card/50 border border-border/40">
                      <div className="space-y-3">
                        {selectedApp.academicQualifications.map((edu: any, idx: number) => (
                          <div key={edu.id} className="flex justify-between items-start text-xs font-semibold border-b border-border/10 pb-2 last:border-b-0 last:pb-0">
                            <div>
                              <h4 className="text-foreground font-bold">{edu.degree}</h4>
                              <p className="text-muted-foreground text-[10px] mt-0.5">{edu.college}</p>
                            </div>
                            <span className="text-muted-foreground text-[11px]">Year: {edu.passingYear}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* 3. Mentoring & Experience */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <SlidersHorizontal size={14} /> Teaching Setup & Experience
                  </h3>
                  <Card className="p-4 bg-card/50 border border-border/40 space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Mentoring Experience</span>
                        <span className="text-foreground">{selectedApp.teachingExperience?.teachingExpYears || "0"} Years</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Languages Spoken</span>
                        <span className="text-foreground">{selectedApp.teachingExperience?.languages?.join(", ") || "English"}</span>
                      </div>
                    </div>

                    {selectedApp.teachingExperience?.achievements && (
                      <div className="border-t border-border/30 pt-3">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Achievements & Background</span>
                        <p className="text-muted-foreground leading-relaxed">&quot;{selectedApp.teachingExperience.achievements}&quot;</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* 4. Subject Selection */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <CheckCircle2 size={14} /> Subject Specializations
                  </h3>
                  <Card className="p-4 bg-card/50 border border-border/40 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.subjectSelection?.selectedCategories?.map((cat: string) => (
                        <span key={cat} className="px-2.5 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                          {cat}
                        </span>
                      ))}
                    </div>

                    {selectedApp.subjectSelection?.skillProficiencies && selectedApp.subjectSelection.skillProficiencies.length > 0 && (
                      <div className="border-t border-border/30 pt-3">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold mb-2">Skill Proficiencies</span>
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                          {selectedApp.subjectSelection.skillProficiencies.map((skill: any, idx: number) => (
                            <div key={idx} className="flex justify-between p-2 bg-background border border-border rounded-lg">
                              <span className="text-foreground">{skill.skill}</span>
                              <span className="text-primary text-[10px] font-extrabold uppercase">{skill.level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* 5. Document Uploads */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <FileText size={14} /> Uploaded Documents
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Government ID", url: selectedApp.govIdUrl },
                      { label: "Degree Certificate", url: selectedApp.degreeUrl },
                      { label: "Additional Certificates", url: selectedApp.certificatesUrl },
                      { label: "Tutor Resume", url: selectedApp.resumeUrl },
                    ].map((doc, idx) => {
                      if (!doc.url) return null;
                      return (
                        <Card key={idx} className="p-4 bg-card border border-border/40 flex items-center justify-between font-semibold text-xs shadow-soft">
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">{doc.label}</span>
                            <span className="text-foreground text-[11px] truncate max-w-[150px] block">{doc.url.split('/').pop() || "view-doc.pdf"}</span>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-muted text-primary hover:bg-primary hover:text-white transition-all"
                            title={`Open ${doc.label}`}
                          >
                            <ExternalLink size={14} />
                          </a>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Teaching Demo Video */}
                {selectedApp.videoDemoUrl && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Video size={14} /> Teaching Demo Video
                    </h3>
                    <Card className="p-2 bg-black border border-border/40 rounded-2xl overflow-hidden aspect-video shadow-lg">
                      <video
                        src={selectedApp.videoDemoUrl}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      />
                    </Card>
                  </div>
                )}

                {/* 7. Gemini AI Assessment Report */}
                {selectedApp.aiEvaluation && Object.keys(selectedApp.aiEvaluation).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Brain size={14} /> Gemini AI Verification Report
                    </h3>
                    <Card className="p-5 border border-primary/20 bg-primary/5 space-y-4 shadow-[0_0_15px_rgba(37,99,235,0.05)]">
                      <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                        <span className="text-xs font-extrabold text-primary flex items-center gap-1">
                          <Sparkles size={14} className="animate-pulse" /> Pedagogical Assessment
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                          selectedApp.aiEvaluation.overall_score && selectedApp.aiEvaluation.overall_score >= 80
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          Overall Score: {selectedApp.aiEvaluation.overall_score || 0}% ({selectedApp.aiEvaluation.recommendation})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-semibold">
                        <div className="p-2.5 bg-background rounded-lg border border-border">
                          <span className="text-slate-500 text-[10px] block font-bold uppercase leading-none mb-1">Subject</span>
                          <strong className="text-foreground">{selectedApp.aiEvaluation.knowledge_score || 0}%</strong>
                        </div>
                        <div className="p-2.5 bg-background rounded-lg border border-border">
                          <span className="text-slate-500 text-[10px] block font-bold uppercase leading-none mb-1">Comms</span>
                          <strong className="text-foreground">{selectedApp.aiEvaluation.communication_score || 0}%</strong>
                        </div>
                        <div className="p-2.5 bg-background rounded-lg border border-border">
                          <span className="text-slate-500 text-[10px] block font-bold uppercase leading-none mb-1">Confidence</span>
                          <strong className="text-foreground">{selectedApp.aiEvaluation.confidence_score || 0}%</strong>
                        </div>
                        <div className="p-2.5 bg-background rounded-lg border border-border">
                          <span className="text-slate-500 text-[10px] block font-bold uppercase leading-none mb-1">Reasoning</span>
                          <strong className="text-foreground">{selectedApp.aiEvaluation.reasoning_score || 0}%</strong>
                        </div>
                        <div className="p-2.5 bg-background rounded-lg border border-border">
                          <span className="text-slate-500 text-[10px] block font-bold uppercase leading-none mb-1">Style</span>
                          <strong className="text-foreground truncate block">{selectedApp.aiEvaluation.teaching_style || "Interactive"}</strong>
                        </div>
                      </div>

                      {selectedApp.aiEvaluation.summary && (
                        <div className="text-xs text-muted-foreground leading-relaxed italic border-t border-primary/10 pt-3">
                          &quot;{selectedApp.aiEvaluation.summary}&quot;
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold border-t border-primary/10 pt-3">
                        {selectedApp.aiEvaluation.strengths && selectedApp.aiEvaluation.strengths.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-emerald-500 text-[10px] uppercase font-bold block">Key Strengths</span>
                            <ul className="list-disc pl-4 text-slate-400 space-y-0.5">
                              {selectedApp.aiEvaluation.strengths.map((str: string, idx: number) => <li key={idx}>{str}</li>)}
                            </ul>
                          </div>
                        )}
                        {selectedApp.aiEvaluation.weaknesses && selectedApp.aiEvaluation.weaknesses.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-rose-500 text-[10px] uppercase font-bold block">Areas to Improve</span>
                            <ul className="list-disc pl-4 text-slate-400 space-y-0.5">
                              {selectedApp.aiEvaluation.weaknesses.map((weak: string, idx: number) => <li key={idx}>{weak}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>

                      {selectedApp.aiEvaluation.improvement_plan && (
                        <div className="text-xs text-muted-foreground border-t border-primary/10 pt-3 leading-relaxed">
                          <strong className="text-foreground block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Pedagogical Improvement Plan</strong>
                          {selectedApp.aiEvaluation.improvement_plan}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* 8. Live Interview Schedule details */}
                {selectedApp.liveInterviewDetails?.interviewDate && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Calendar size={14} /> Scheduled Live Interview details
                    </h3>
                    <Card className="p-4 border border-blue-500/20 bg-blue-500/5 text-xs font-semibold space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Date / Time</span>
                          <span className="text-foreground">{selectedApp.liveInterviewDetails.interviewDate} at {selectedApp.liveInterviewDetails.interviewTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Meeting Link</span>
                          <a href={selectedApp.liveInterviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            Join Link <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                      {selectedApp.liveInterviewDetails.additionalNotes && (
                        <div className="border-t border-blue-500/10 pt-2 text-[11px] text-muted-foreground">
                          <strong>Admin Notes:</strong> {selectedApp.liveInterviewDetails.additionalNotes}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* Admin Notes form */}
                <div className="space-y-2 border-t border-border/40 pt-6">
                  <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Admin Verification Notes</label>
                  <textarea
                    placeholder="Enter internal verification remarks, review status updates..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full text-xs p-3 bg-background border border-border rounded-xl resize-none text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                  />
                </div>

                {/* Rejection Form Box */}
                {showRejectForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3"
                  >
                    <label className="text-[10px] uppercase font-extrabold text-rose-500 tracking-wider block">Reason for Rejection (Visible to Candidate)</label>
                    <textarea
                      placeholder="Specify reasons (e.g. invalid credentials, low reasoning scores)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full text-xs p-3 bg-background border border-rose-500/20 rounded-xl resize-none text-foreground focus:outline-none"
                      rows={2}
                      required
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setShowRejectForm(false)} className="h-8 text-[10px] font-bold">Cancel</Button>
                      <Button size="sm" onClick={() => handleAppAction("Rejected", { rejectionReason })} className="h-8 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white" disabled={isSubmittingAction}>
                        Confirm Rejection
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Interview Form Box */}
                {showInterviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4"
                  >
                    <span className="text-[10px] uppercase font-extrabold text-blue-500 tracking-wider block">Schedule Interview & Request Additional Docs</span>
                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Interview Date</label>
                        <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Interview Time</label>
                        <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Meeting Link (Zoom / Meet)</label>
                      <input type="url" placeholder="https://meet.google.com/..." value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setShowInterviewForm(false)} className="h-8 text-[10px] font-bold">Cancel</Button>
                      <Button size="sm" onClick={() => handleAppAction("Under Review", { 
                        liveInterviewDetails: { 
                          interviewDate, 
                          interviewTime, 
                          meetingLink,
                          additionalNotes: "Interview requested, please verify qualifications." 
                        } 
                      })} className="h-8 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmittingAction}>
                        Schedule & Notify
                      </Button>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Bottom Actions desk */}
              <div className="p-6 border-t border-border/40 bg-card flex flex-wrap gap-3 select-none">
                
                {selectedApp.status === "Pending" || selectedApp.status === "Under Review" ? (
                  <>
                    <Button
                      onClick={() => handleAppAction("Approved")}
                      disabled={isSubmittingAction}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 flex items-center gap-1.5 rounded-xl"
                    >
                      <UserCheck size={14} /> Approve Candidate
                    </Button>
                    
                    <Button
                      onClick={() => { setShowRejectForm(true); setShowInterviewForm(false); }}
                      disabled={isSubmittingAction}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-10 flex items-center gap-1.5 rounded-xl"
                    >
                      <Ban size={14} /> Reject Application
                    </Button>

                    <Button
                      onClick={() => { setShowInterviewForm(true); setShowRejectForm(false); }}
                      disabled={isSubmittingAction}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-10 flex items-center gap-1.5 rounded-xl px-4"
                    >
                      <Calendar size={14} /> Schedule Interview
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleAppAction("Pending")}
                      disabled={isSubmittingAction}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-10 flex items-center gap-1.5 rounded-xl"
                    >
                      <RefreshCw size={14} className="animate-spin-slow" /> Reset to Pending Review
                    </Button>
                  </>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 4. SLIDING USER PROFILE drawer console ── */}
      <AnimatePresence>
        {selectedUserProfile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserProfile(null)}
              className="fixed inset-0 bg-black z-45 cursor-pointer"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border/80 z-50 overflow-y-auto shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/40 flex items-center justify-between bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {selectedUserProfile.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground">{selectedUserProfile.name}</h2>
                    <p className="text-xs text-muted-foreground">{selectedUserProfile.email} · Joined {selectedUserProfile.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                    selectedUserProfile.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {selectedUserProfile.status}
                  </span>
                  <button
                    onClick={() => setSelectedUserProfile(null)}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 space-y-6 flex-1 text-xs font-semibold text-left">
                {/* 1. Account Details */}
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Account Roster Details</h3>
                  <Card className="p-4 bg-card border border-border/40 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">User Role</span>
                        <span className="text-foreground uppercase">{selectedUserProfile.role}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Nationality</span>
                        <span className="text-foreground">{selectedUserProfile.country || "India"}</span>
                      </div>
                    </div>
                    {selectedUserProfile.bio && (
                      <div className="border-t border-border/20 pt-2 text-muted-foreground leading-relaxed">
                        <strong>Bio:</strong> &quot;{selectedUserProfile.bio}&quot;
                      </div>
                    )}
                  </Card>
                </div>

                {/* STUDENT ENROLLMENTS AND PROGRESS */}
                {selectedUserProfile.role === "learner" && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Enrolled Courses &amp; Progress</h3>
                    <Card className="p-4 bg-card border border-border/40 space-y-3">
                      {!selectedUserProfile.enrollments || selectedUserProfile.enrollments.length === 0 ? (
                        <span className="text-muted-foreground text-xs">No active course enrollments.</span>
                      ) : (
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                          {selectedUserProfile.enrollments.map((enr) => (
                            <div key={enr.courseId} className="space-y-1.5 border-b border-border/30 pb-2 last:border-0 last:pb-0">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-foreground truncate max-w-[200px]">{enr.courseTitle}</span>
                                <span className="text-primary font-bold">{enr.progressPercent}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-full transition-all" style={{ width: `${enr.progressPercent}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                <span>Enrolled on {enr.enrolledAt}</span>
                                {enr.certificateUrl && (
                                  <a
                                    href={enr.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-500 font-extrabold hover:underline flex items-center gap-0.5"
                                  >
                                    🏆 View Certificate
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* TUTOR PORTFOLIO & STATISTICS */}
                {selectedUserProfile.role === "tutor" && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Tutor Portfolio &amp; Performance</h3>
                    <Card className="p-4 bg-card border border-border/40 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-border/30">
                        <div>
                          <span className="text-muted-foreground text-[9px] uppercase">Students</span>
                          <strong className="block text-foreground text-sm font-black">{selectedUserProfile.tutorDetails?.studentsTaughtCount || 0}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[9px] uppercase">Revenue</span>
                          <strong className="block text-emerald-500 text-sm font-black">₹{selectedUserProfile.tutorDetails?.totalRevenue?.toLocaleString() || 0}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[9px] uppercase">Avg Rating</span>
                          <strong className="block text-amber-500 text-sm font-black">★ {selectedUserProfile.tutorDetails?.averageRating || "0.0"}</strong>
                        </div>
                      </div>
                      {!selectedUserProfile.tutorDetails?.courses || selectedUserProfile.tutorDetails.courses.length === 0 ? (
                        <span className="text-muted-foreground text-xs">No courses created yet.</span>
                      ) : (
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 pt-1">
                          {selectedUserProfile.tutorDetails.courses.map((course) => (
                            <div key={course.id} className="flex justify-between items-center text-xs border-b border-border/30 pb-2 last:border-0 last:pb-0">
                              <div className="space-y-0.5">
                                <span className="font-bold text-foreground truncate max-w-[180px] block">{course.title}</span>
                                <span className="text-muted-foreground text-[10px] block">{course.enrollmentCount} enrollments · Price: ₹{course.price}</span>
                              </div>
                              <strong className="text-emerald-500">₹{course.revenue.toLocaleString()}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* 2. Wallet & Coins Management */}
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Wallet &amp; Platform Coins</h3>
                  <Card className="p-4 bg-card border border-border/40 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Current Balance</span>
                        <span className="text-lg font-black text-amber-500">{selectedUserProfile.walletCoins || 0} Coins</span>
                      </div>
                    </div>

                    <div className="border-t border-border/20 pt-3 space-y-2">
                      <label className="text-[10px] text-muted-foreground block">Update Wallet Balance</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={grantCoinsAmount}
                          onChange={(e) => setGrantCoinsAmount(Number(e.target.value))}
                          className="h-9 rounded border border-border bg-background px-3 focus:outline-none text-xs w-28 text-foreground"
                          min="0"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleGrantCoins(selectedUserProfile.id, grantCoinsAmount)}
                          disabled={isGrantingCoins}
                          className="h-9 px-4 text-xs font-bold"
                        >
                          {isGrantingCoins ? "Updating..." : "Update Balance"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 3. Platform Administration Actions */}
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Administrative Commands</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleResetPassword(selectedUserProfile)}
                      className="w-full h-10 font-bold text-xs justify-start px-4 border-border hover:bg-muted"
                    >
                      ✉️ Reset Password Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleIssueCertificate(selectedUserProfile)}
                      className="w-full h-10 font-bold text-xs justify-start px-4 border-border hover:bg-muted"
                    >
                      🏆 Issue Custom Qualification Certificate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toggleUserStatus(selectedUserProfile.id);
                        setSelectedUserProfile(prev => prev ? { ...prev, status: prev.status === "Active" ? "Suspended" : "Active" } : null);
                      }}
                      className="w-full h-10 font-bold text-xs justify-start px-4 border-border hover:bg-muted"
                    >
                      {selectedUserProfile.status === "Active" ? "🔒 Suspend User Session" : "🔓 Reactivate User Session"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border/40 bg-card flex gap-2.5">
                <Button
                  onClick={() => {
                    handleDeleteUser(selectedUserProfile);
                    setSelectedUserProfile(null);
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-10 flex items-center justify-center gap-1.5 rounded-xl shadow-soft"
                >
                  <Trash2 size={14} /> Permanently Terminate Account
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
