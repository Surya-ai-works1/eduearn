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

interface AdminCourse {
  id: string;
  title: string;
  tutorName: string;
  category: string;
  price: number;
  tutorEarnings: number;
  platformEarnings: number;
  status: "Pending" | "Approved" | "Rejected" | "Draft" | "Need Changes" | "Archived";
  featured: boolean;
  hidden: boolean;
  assignedSkill: string;
  isDynamic?: boolean;
  
  // Visibility Extensions
  trending?: boolean;
  popular?: boolean;
  recommended?: boolean;
  newest?: boolean;
  bestSeller?: boolean;
  homepageHero?: boolean;
  homepageCarousel?: boolean;
  categoryHero?: boolean;
  landingPageFeatured?: boolean;
}

interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
}

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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "log-1", timestamp: "2026-07-01 09:30", adminName: "Surya (Admin)", action: "System login authorized." },
    { id: "log-2", timestamp: "2026-07-01 10:15", adminName: "Surya (Admin)", action: "Released payout of ₹15,000 for Rohan Das." }
  ]);
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
  const [users, setUsers] = useState<AdminUser[]>([
    { id: "u-1", name: "Rahul Verma", email: "rahul@eduearn.com", role: "learner", status: "Active", createdAt: "2026-06-01", walletCoins: 120 },
    { id: "u-2", name: "Amit Verma", email: "amit@eduearn.com", role: "tutor", status: "Active", createdAt: "2026-05-15", walletCoins: 450 },
    { id: "u-3", name: "Priya Patel", email: "priya@eduearn.com", role: "tutor", status: "Active", createdAt: "2026-05-20", walletCoins: 310 },
    { id: "u-4", name: "Sanjay Dutt", email: "sanjay@eduearn.com", role: "admin", status: "Active", createdAt: "2026-04-10", walletCoins: 0 },
    { id: "u-5", name: "Surya K", email: "surya@learner.com", role: "learner", status: "Active", createdAt: "2026-06-25", walletCoins: 280 }
  ]);

  // 3. Tutor Applications (Verification)
  const [verifications, setVerifications] = useState<VerificationApp[]>(() => {
    const defaults: VerificationApp[] = [
      { id: "v-1", tutorName: "Rohan Das", expertise: "Mathematics & Geometry", education: "IIT Bombay, Math undergrad", status: "Pending", govIdFile: "rohan-aadhaar.jpg", studentIdFile: "rohan-college-id.jpg", email: "rohan@example.com" },
      { id: "v-2", tutorName: "Sneha Iyer", expertise: "UI/UX Figma Layouts", education: "NID Design undergrad", status: "Pending", govIdFile: "sneha-passport.jpg", studentIdFile: "sneha-college-id.jpg", email: "sneha@example.com" }
    ];
    if (typeof window === "undefined") return defaults;
    const savedStatus = localStorage.getItem("tutor_application_status");
    const savedDetails = localStorage.getItem("tutor_application_details");
    
    if (savedStatus && savedDetails) {
      try {
        const details = JSON.parse(savedDetails);
        const expertiseStr = Array.isArray(details.selectedSkills) ? details.selectedSkills.join(", ") : details.selectedSkills || "General Expertise";
        const educationStr = Array.isArray(details.educationList) && details.educationList.length > 0 ? `${details.educationList[0].degree} at ${details.educationList[0].school}` : "Undergrad credentials";

        const dynamicApp: VerificationApp = {
          id: details.code || "v-user",
          tutorName: details.fullName || "Applied User",
          expertise: expertiseStr,
          education: educationStr,
          status: savedStatus === "pending" ? "Pending" : savedStatus === "approved" ? "Approved" : savedStatus === "rejected" ? "Rejected" : "Pending",
          govIdFile: details.govIdFile || "aadhaar.jpg",
          studentIdFile: details.profileImage || "avatar.png",
          isDynamic: true,
          email: details.email || "tutor@example.com"
        };
        return [dynamicApp, ...defaults];
      } catch (e) {
        console.error("Error parsing tutor application details", e);
      }
    }
    return defaults;
  });

  // 4. Course Moderation states
  const [courses, setCourses] = useState<AdminCourse[]>(() => {
    const defaults: AdminCourse[] = [
      { id: "c-1", title: "Mastering React Native Hooks & Layouts", tutorName: "Amit Verma", category: "Coding", price: 1200, tutorEarnings: 960, platformEarnings: 240, status: "Approved", featured: true, hidden: false, assignedSkill: "React" },
      { id: "c-2", title: "Kuchipudi Mudras & Coordination Masterclass", tutorName: "Priya Patel", category: "Dance", price: 1500, tutorEarnings: 1200, platformEarnings: 300, status: "Approved", featured: false, hidden: false, assignedSkill: "Kuchipudi" },
      { id: "c-3", title: "Double-Entry Accounting & Taxation Basics", tutorName: "Priya Patel", category: "Academics", price: 999, tutorEarnings: 799, platformEarnings: 200, status: "Pending", featured: false, hidden: true, assignedSkill: "Accounting" }
    ];
    if (typeof window === "undefined") return defaults;
    
    const savedCoursesStr = localStorage.getItem("eduearn_tutor_courses");
    if (!savedCoursesStr) return defaults;
    
    try {
      const savedCourses = JSON.parse(savedCoursesStr) as any[];
      const config = PaymentService.getPlatformConfig();
      const dynamicCourses = savedCourses.map((c) => {
        const platformShare = Math.round((c.price * config.commission) / 100);
        const tutorShare = c.price - platformShare;
        
        return {
          id: c.id,
          title: c.title,
          tutorName: "Applied Tutor",
          category: c.category,
          price: c.price,
          tutorEarnings: tutorShare,
          platformEarnings: platformShare,
          status: (c.status === "published" ? "Approved" : c.status === "pending" ? "Pending" : c.status === "archived" ? "Rejected" : "Pending") as any,
          featured: false,
          hidden: c.status === "draft" || c.status === "archived",
          assignedSkill: c.category,
          isDynamic: true
        };
      });
      
      const filteredDefaults = defaults.filter(d => !dynamicCourses.some(dc => dc.id === d.id));
      return [...dynamicCourses, ...filteredDefaults];
    } catch {
      return defaults;
    }
  });

  // Dynamic admin purchases sync
  const [adminEnrollments] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eduearn_admin_enrollments");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Live Class Monitoring states
  const [adminLiveSessions, setAdminLiveSessions] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("eduearn_live_classes");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: "live-t1", title: "Interactive Q&A Session: Linear Algebra Doubts", time: "Today, 5:00 PM IST", countdown: "Starts in 2 hours", meetingLink: "https://meet.eduearn.com/tutor-algebra", platform: "Google Meet", status: "Scheduled", studentsCount: 3, attendanceCount: 3 }
    ];
  });

  const saveAdminLiveSessions = (sessions: any[]) => {
    setAdminLiveSessions(sessions);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_live_classes", JSON.stringify(sessions));
    }
  };

  // Tutor Payouts & Escrows list
  const [payouts, setPayouts] = useState<any[]>(() => {
    const defaults = [
      { id: "po-1", tutorName: "Amit Verma", amount: 18400, pendingWallet: 9600, status: "Pending", date: "2026-06-30", method: "Bank", bankDetails: "A/C: ****1234" },
      { id: "po-2", tutorName: "Priya Patel", amount: 12000, pendingWallet: 3000, status: "On Hold", date: "2026-06-28", method: "UPI", bankDetails: "priya@upi" }
    ];
    if (typeof window === "undefined") return defaults;
    
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
    return [...dynamicPayouts, ...defaults];
  });

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
  const [tickets, setTickets] = useState([
    { id: "tick-1", type: "Refund Request", title: "Course double billing refund", user: "Rahul Verma", status: "Open", assignedTo: "Support Agent A" },
    { id: "tick-2", type: "Tutor Complaint", title: "Whiteboard disconnect during Algebra session", user: "Amit Verma", status: "Open", assignedTo: "Tech Lead" }
  ]);

  // Supabase Database synchronization effect
  useEffect(() => {
    async function loadAdminData() {
      try {
        const { createClient } = await import("../../../lib/supabase");
        const supabase = createClient();

        // 1. Fetch Users
        const { data: profilesList } = await supabase
          .from("profiles")
          .select("id, display_name, role, updated_at");
        
        if (profilesList) {
          const mappedUsers = profilesList.map((p: any) => ({
            id: p.id,
            name: p.display_name || "EduEarn User",
            email: `${p.role || "learner"}@eduearn.com`,
            role: (p.role || "learner") as "learner" | "tutor" | "admin",
            status: "Active" as const,
            createdAt: new Date(p.updated_at || Date.now()).toISOString().substring(0, 10),
            walletCoins: p.role === "tutor" ? 450 : 120
          }));
          setUsers(mappedUsers);
        }

        // 2. Fetch Tutor Verifications
        const { data: verifs } = await supabase
          .from("tutor_verifications")
          .select("*");
        
        if (verifs) {
          const mappedVerifs = verifs.map((v: any) => ({
            id: v.id,
            tutorName: v.tutor_name || "Tutor Candidate",
            expertise: v.expertise || "General Subject",
            education: v.education || "Undergrad credentials",
            status: (v.status || "Pending") as "Pending" | "Approved" | "Rejected",
            govIdFile: v.gov_id_file || "id.jpg",
            studentIdFile: v.student_id_file || "profile.png",
            email: v.email || "tutor@eduearn.com"
          }));
          setVerifications(mappedVerifs);
        }

        // 3. Fetch Courses
        const { data: coursesList } = await supabase
          .from("courses")
          .select("*");

        if (coursesList) {
          const config = PaymentService.getPlatformConfig();
          const mappedCourses = coursesList.map((c: any) => {
            const platformShare = Math.round((c.price * config.commission) / 100);
            const tutorShare = c.price - platformShare;

            return {
              id: c.id,
              title: c.title,
              tutorName: c.tutor_name || "Tutor Member",
              category: c.category || "General",
              price: c.price || 0,
              tutorEarnings: tutorShare,
              platformEarnings: platformShare,
              status: (c.status === "published" ? "Approved" : c.status === "pending" ? "Pending" : "Draft") as any,
              featured: c.featured || false,
              hidden: c.hidden || false,
              assignedSkill: c.category || "General"
            };
          });
          setCourses(mappedCourses);
        }

        // 4. Fetch Live Classes
        const { data: liveList } = await supabase
          .from("live_classes")
          .select("*");

        if (liveList) {
          const mappedLive = liveList.map((l: any) => ({
            id: l.id,
            title: l.title,
            time: new Date(l.start_time).toLocaleString(),
            countdown: "Scheduled",
            meetingLink: l.meeting_link || "https://meet.eduearn.com",
            platform: "EduEarn Classroom",
            status: l.status || "Scheduled",
            studentsCount: 3,
            attendanceCount: 3
          }));
          setAdminLiveSessions(mappedLive);
        }

        // 5. Fetch Payouts
        const { data: payoutsList } = await supabase
          .from("withdrawal_requests")
          .select("*");

        if (payoutsList) {
          const mappedPayouts = payoutsList.map((p: any) => ({
            id: p.id,
            tutorName: p.tutor_name || "Tutor Partner",
            amount: p.amount || 0,
            pendingWallet: 0,
            status: p.status || "Pending",
            date: new Date(p.created_at).toISOString().substring(0, 10),
            method: "Bank",
            bankDetails: "A/C: ****1234"
          }));
          setPayouts(mappedPayouts);
        }

        // 6. Fetch Audit Logs
        const { data: logsList } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (logsList) {
          const mappedLogs = logsList.map((l: any) => ({
            id: l.id,
            timestamp: new Date(l.created_at).toLocaleString(),
            adminName: "System Admin",
            action: l.action
          }));
          setAuditLogs(mappedLogs);
        }

      } catch (err) {
        console.error("Failed to load live admin data from Supabase:", err);
      }
    }

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
    try {
      const { createClient } = await import("../../../lib/supabase");
      const supabase = createClient();
      
      const nextStatus = approve ? "Approved" : "Rejected";
      const { error } = await supabase
        .from("tutor_verifications")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw error;

      setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: nextStatus } : v));
      const app = verifications.find(v => v.id === id);
      if (app) {
        logAuditAction(`${approve ? "Approved" : "Rejected"} tutor application verification for: ${app.tutorName}`);
        
        // Save audit log to database
        await supabase.from("audit_logs").insert({
          action: `${approve ? "Approved" : "Rejected"} tutor application verification for: ${app.tutorName}`,
          details: `Verification ID: ${id}`
        });

        toast.success(`Tutor verification marked as ${nextStatus}`);
      }
    } catch (err) {
      console.error("Failed to update tutor verification status:", err);
      toast.error("Failed to update verification in database.");
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
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        
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
          />
        )}

        {activeTab === "categories" && (
          <CategoriesTab logAuditAction={logAuditAction} />
        )}

        {activeTab === "courses" && (
          <CoursesTab
            courses={courses}
            setCourses={setCourses}
            logAuditAction={logAuditAction}
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
          <AuditLogsTab
            auditLogs={auditLogs}
            setAuditLogs={setAuditLogs}
          />
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
