"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PaymentService } from "../../../features/payments/services/paymentService";
import { MarketplaceService, EcosystemSync } from "../../../features/payments/services/marketplaceService";
import { RequireAdmin } from "../../../features/auth/components/RouteGuard";
import { useAuth } from "../../../hooks/useAuth";
import { AiGeneratorModal } from "../../../features/ai/components/AiGeneratorModal";

// Sub-components refactored
import DashboardLayout from "./DashboardLayout";
import DashboardTab from "./components/dashboard/DashboardTab";
import UsersTab from "./components/users/UsersTab";
import CategoriesTab from "./components/categories/CategoriesTab";
import CoursesTab from "./components/courses/CoursesTab";
import LiveClassesTab from "./components/courses/LiveClassesTab";
import FinanceTab from "./components/finance/FinanceTab";
import OffersTab from "./components/offers/OffersTab";
import CMSTab from "./components/cms/CMSTab";
import AiControlTab from "./components/ai/AiControlTab";
import AnalyticsTab from "./components/analytics/AnalyticsTab";
import CommunicationTab from "./components/communication/CommunicationTab";
import SettingsTab from "./components/settings/SettingsTab";
import RoleTab from "./components/roles/RoleTab";
import AuditLogsTab from "./components/audit/AuditLogsTab";

// TYPES & INTERFACES
import { AdminUser, TutorVerificationApp as VerificationApp, AdminCourse, AdminActivityLog as AuditLog } from "@/lib/types/admin";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Load Tab from search queries
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 1. Audit Security Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logIdCounter, setLogIdCounter] = useState(2);

  const logAuditAction = (actionStr: string) => {
    const nextId = logIdCounter + 1;
    setLogIdCounter(nextId);
    const newLog: AuditLog = {
      id: `log-${nextId}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      adminName: user?.fullName || "Admin",
      action: actionStr
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 2. Users (Students & Tutors)
  const [users, setUsers] = useState<AdminUser[]>([]);

  // 3. Tutor Applications (Verification)
  const [verifications, setVerifications] = useState<VerificationApp[]>([]);

  // 4. Course Moderation states
  const [courses, setCourses] = useState<AdminCourse[]>([]);

  // Dynamic admin purchases sync
  const [adminEnrollments] = useState<any[]>([]);

  // Live Class Monitoring states
  const [adminLiveSessions, setAdminLiveSessions] = useState<any[]>([]);

  const [stats, setStats] = useState<any>(null);

  const saveAdminLiveSessions = (sessions: any[]) => {
    setAdminLiveSessions(sessions);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_live_classes", JSON.stringify(sessions));
    }
  };

  // Tutor Payouts & Escrows list
  const [payouts, setPayouts] = useState<any[]>([]);

  // ─── ECOSYSTEM CONNECTED WORKFLOW SYNC ───────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncAdminEcosystem = () => {
      try {
        const enrollments = EcosystemSync.getEnrollments();
        const sessionsList = EcosystemSync.getSessions();

        // 1. Map Sessions to Admin Live Sessions list
        if (sessionsList.length > 0) {
          const mappedSessions = sessionsList.map((ses: any) => ({
            id: ses.id,
            title: ses.courseTitle,
            tutorName: ses.tutorName,
            time: ses.dateTime,
            countdown: "Scheduled",
            meetingLink: ses.meetingLink,
            platform: "Google Meet",
            status: "Scheduled",
            studentsCount: enrollments.filter((e: any) => e.courseTitle === ses.courseTitle).length || 1,
            attendanceCount: enrollments.filter((e: any) => e.courseTitle === ses.courseTitle).length || 1,
          }));
          setAdminLiveSessions(mappedSessions);
        }

        // 2. Map Payout Status based on completed enrollments/released payouts
        const mappedPayouts = enrollments.map((enr: any, idx: number) => ({
          id: `po-eco-${idx}`,
          tutorName: enr.tutorName || "Rahul Sharma",
          amount: Math.round(1500 * 0.7), // 70% share of ₹1,500
          pendingWallet: enr.payoutStatus === "Released" ? 0 : Math.round(1500 * 0.7),
          status: enr.payoutStatus === "Released" ? "Approved" : "Pending",
          date: new Date().toISOString().substring(0, 10),
          method: "UPI",
          bankDetails: "tutor@upi"
        }));
        if (mappedPayouts.length > 0) {
          setPayouts(prev => {
            const filteredPrev = prev.filter(p => !p.id.startsWith("po-eco"));
            return [...mappedPayouts, ...filteredPrev];
          });
        }
      } catch (err) {
        console.warn("Admin Ecosystem sync failed:", err);
      }
    };

    syncAdminEcosystem();
    window.addEventListener("storage", syncAdminEcosystem);
    return () => window.removeEventListener("storage", syncAdminEcosystem);
  }, []);

  const [refundRequests] = useState(() => PaymentService.getRefundRequests());
  const [tickets, setTickets] = useState<any[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAdminData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingData(true);
    }
    try {
      // 1. Fetch Users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersList = await usersRes.json();
        setUsers(usersList);
      }

      // 2. Fetch Tutor Verifications
      const verifsRes = await fetch("/api/admin/verifications");
      if (verifsRes.ok) {
        const verifsList = await verifsRes.json();
        setVerifications(verifsList);
      }

      // 3. Fetch Courses
      const coursesRes = await fetch("/api/admin/courses");
      if (coursesRes.ok) {
        const coursesList = await coursesRes.json();
        setCourses(coursesList);
      }

      // 4. Fetch Payments & Payouts
      const paymentsRes = await fetch("/api/admin/payments");
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayouts(paymentsData.payouts || []);
      }

      // 5. Fetch Tickets
      const ticketsRes = await fetch("/api/admin/tickets");
      if (ticketsRes.ok) {
        const ticketsList = await ticketsRes.json();
        setTickets(ticketsList);
      }

      // 6. Fetch Dashboard Stats & Audit Logs
      const dbRes = await fetch("/api/admin/dashboard");
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setStats(dbData);
        setAuditLogs(dbData.recentActivity || []);
      }
      
      if (isManualRefresh) {
        toast.success("Operational database sync completed successfully.");
      }
    } catch (err) {
      console.error("Failed to load admin data from backend APIs:", err);
      toast.error("Failed to sync live operational data.");
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  };

  // Backend API synchronization effect
  useEffect(() => {
    loadAdminData();
  }, []);

  // Sync course moderation status back to localStorage tutor courses
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCoursesStr = localStorage.getItem("eduearn_tutor_courses");
    if (!savedCoursesStr) return;
    try {
      const savedCourses = JSON.parse(savedCoursesStr) as any[];
      let updated = false;
      const newSavedCourses = savedCourses.map((sc) => {
        const matchedAdmin = courses.find((ac) => ac.id === sc.id);
        if (matchedAdmin) {
          const nextStatus = matchedAdmin.status === "Approved" ? "published" : matchedAdmin.status === "Rejected" ? "archived" : "pending";
          if (sc.status !== nextStatus || sc.price !== matchedAdmin.price || sc.category !== matchedAdmin.category) {
            updated = true;
            if (sc.status !== nextStatus) {
              if (nextStatus === "published") {
                PaymentService.addNotification("Course Approved & Published", `Your course '${sc.title}' has been approved and is now live.`, "course");
              } else if (nextStatus === "archived") {
                PaymentService.addNotification("Course Rejected", `Your course '${sc.title}' has been rejected by administration check.`, "course");
              }
            }
            return { ...sc, status: nextStatus, price: matchedAdmin.price, category: matchedAdmin.category };
          }
        }
        return sc;
      });
      if (updated) {
        localStorage.setItem("eduearn_tutor_courses", JSON.stringify(newSavedCourses));
      }
    } catch (e) {
      console.error("Error syncing courses to localStorage", e);
    }
  }, [courses]);

  // 10. AI Modal overlays
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalConfig, setAiModalConfig] = useState({ title: "", template: "", placeholder: "" });

  const triggerTutorVerification = async (id: string, approve: boolean) => {
    const nextStatus = approve ? "Approved" : "Rejected";
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId: id, status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update verification status");

      setVerifications(prev => prev.map(v => (v.id === id ? { ...v, status: nextStatus } : v)));
      logAuditAction(`${approve ? "Approved" : "Rejected"} tutor application verification for ID: ${id}`);
      toast.success(`Tutor verification marked as ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const syncPayoutsState = () => {
    if (typeof window === "undefined") return;
    const withdrawHistory = PaymentService.getWithdrawalHistory();
    const dynamicPayouts = withdrawHistory.map((w) => ({
      id: w.id,
      tutorName: "Applied Tutor",
      amount: w.amount,
      pendingWallet: 0,
      status: w.status === "Pending" ? "Pending" : w.status === "Approved" ? "Released" : w.status === "Rejected" ? "Rejected" : "On Hold",
      date: w.date,
      method: w.method,
      bankDetails: w.bankDetails || "",
      isDynamic: true
    }));
    setPayouts(prev => {
      const nonDynamic = prev.filter(p => !p.isDynamic);
      return [...dynamicPayouts, ...nonDynamic];
    });
  };

  return (
    <RequireAdmin>
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={() => loadAdminData(true)}
        isRefreshing={isRefreshing}
      >
        
        {/* TAB CONTROLS RENDERING */}
        {activeTab === "dashboard" && (
          <DashboardTab
            adminEnrollments={adminEnrollments}
            auditLogs={auditLogs}
            verifications={verifications}
            payouts={payouts}
            refundRequests={refundRequests}
            tickets={tickets}
            courses={courses}
            liveSessions={adminLiveSessions}
            stats={stats}
            onNavigateTab={setActiveTab}
            onApproveTutor={(id) => triggerTutorVerification(id, true)}
            onReleasePayout={(id) => {
              PaymentService.approveWithdrawal(id);
              logAuditAction(`Approved withdrawal release: ID ${id}`);
              syncPayoutsState();
              toast.success("Payout released successfully.");
            }}
            onApproveRefund={(id) => {
              toast.success(`Refund request ${id} approved.`);
              logAuditAction(`Approved student refund request: ${id}`);
            }}
            onCreateCourse={() => setActiveTab("courses")}
            onCreateOffer={() => setActiveTab("offers")}
            onBroadcastAnnouncement={() => setActiveTab("communication")}
          />
        )}

        {(activeTab === "users" || activeTab === "students" || activeTab === "tutors" || activeTab === "tutor-verification") && (
          <UsersTab
            users={users}
            setUsers={setUsers}
            verifications={verifications}
            setVerifications={setVerifications}
            onApproveTutor={(id) => triggerTutorVerification(id, true)}
            onRejectTutor={(id) => triggerTutorVerification(id, false)}
            logAuditAction={logAuditAction}
            isLoading={isLoadingData}
            activeTab={activeTab}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesTab logAuditAction={logAuditAction} />
        )}

        {activeTab === "courses" && (
          <CoursesTab
            courses={courses}
            setCourses={setCourses as any}
            logAuditAction={logAuditAction}
            isLoading={isLoadingData}
          />
        )}

        {activeTab === "live-classes" && (
          <LiveClassesTab
            adminLiveSessions={adminLiveSessions}
            saveAdminLiveSessions={saveAdminLiveSessions}
            logAuditAction={logAuditAction}
          />
        )}

        {(activeTab === "payments" || activeTab === "pricing") && (
          <FinanceTab logAuditAction={logAuditAction} />
        )}

        {activeTab === "offers" && (
          <OffersTab logAuditAction={logAuditAction} />
        )}

        {activeTab === "cms" && (
          <CMSTab logAuditAction={logAuditAction} />
        )}

        {activeTab === "ai" && (
          <AiControlTab logAuditAction={logAuditAction} />
        )}

        {activeTab === "communication" && (
          <CommunicationTab
            tickets={tickets}
            setTickets={setTickets}
            logAuditAction={logAuditAction}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab logAuditAction={logAuditAction} />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab />
        )}

        {activeTab === "roles" && (
          <RoleTab logAuditAction={logAuditAction} />
        )}

        {activeTab === "audit-logs" && (
          <AuditLogsTab />
        )}

      </DashboardLayout>

      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title={aiModalConfig.title}
        promptTemplate={aiModalConfig.template}
        placeholder={aiModalConfig.placeholder}
        onGenerateSuccess={() => toast.success("AI Generation Complete!")}
      />
    </RequireAdmin>
  );
}
