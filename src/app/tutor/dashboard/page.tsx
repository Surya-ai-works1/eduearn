"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── Auth & Infrastructure ────────────────────────────────────────────────────
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { RequireTutor } from "../../../features/auth/components/RouteGuard";
import { useAuth } from "../../../hooks/useAuth";
import { AiGeneratorModal } from "../../../features/ai/components/AiGeneratorModal";
import {
  PaymentService,
  WithdrawalRequest,
} from "../../../features/payments/services/paymentService";
import { lmsDb } from "../../../lib/lmsDb";
import { createClient } from "../../../lib/supabase";
import { EcosystemSync } from "../../../features/payments/services/marketplaceService";

// ─── Tutor Components ─────────────────────────────────────────────────────────
import { TutorSidebar } from "../../../components/tutor/Sidebar";
import { TutorHeader } from "../../../components/tutor/Header";
import { DashboardOverview } from "../../../components/tutor/DashboardOverview";
import { CourseManager } from "../../../components/tutor/CourseManager";
import { StudentManager } from "../../../components/tutor/StudentManager";
import { LiveClasses } from "../../../components/tutor/LiveClasses";
import { Assignments } from "../../../components/tutor/Assignments";
import { Finance } from "../../../components/tutor/Finance";
import { Analytics } from "../../../components/tutor/Analytics";
import { Reviews } from "../../../components/tutor/Reviews";
import { Settings } from "../../../components/tutor/Settings";
import { CalendarView } from "../../../components/tutor/Calendar";
import { Resources } from "../../../components/tutor/Resources";
import { Messages } from "../../../components/tutor/Messages";
import { Community } from "../../../components/tutor/Community";
import TutorNotifications from "../../../components/tutor/TutorNotifications";

// ─── Types ────────────────────────────────────────────────────────────────────
import type {
  TutorCourse,
  CurriculumModule,
  CurriculumLesson,
  MediaFile,
  StudentProgress,
  LiveSession,
  Review,
  EarningsBalance,
} from "../../../components/tutor/types";

// ─── AI Studio Section ────────────────────────────────────────────────────────
import { AIStudio } from "../../../components/tutor/AIStudio";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ORCHESTRATOR PAGE
// All state and business logic lives here. UI is delegated to components.
// ─────────────────────────────────────────────────────────────────────────────
export default function TutorDashboardPage() {
  const { user, logout, completeProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Navigation ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      if (tab === "earnings") {
        setActiveTab("finance");
      } else {
        setActiveTab(tab);
      }
    } else {
      setActiveTab("dashboard");
    }
  }, [searchParams]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    router.push(`/tutor/dashboard?tab=${tab}`);
  }, [router]);

  // Sync body classes for sidebar state
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
    document.body.classList.toggle("sidebar-expanded", !isSidebarCollapsed);
    return () => {
      document.body.classList.remove("sidebar-collapsed", "sidebar-expanded");
    };
  }, [isSidebarCollapsed]);

  // ─── App Status ────────────────────────────────────────────────────────────
  const [appStatus, setAppStatus] = useState<
    "approved" | "pending" | "rejected" | "suspended" | "blacklisted"
  >("approved");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tutor_application_status");
      if (saved) setAppStatus(saved as "approved" | "pending" | "rejected" | "suspended" | "blacklisted");
    }
  }, []);

  // ─── Course Management ─────────────────────────────────────────────────────
  const [myCourses, setMyCourses] = useState<TutorCourse[]>([]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "Programming",
    price: 999,
    level: "beginner",
    duration: "10 hours",
    seoKeywords: "",
    subtitle: "",
    description: "",
    language: "English",
    thumbnail: "",
    status: "draft",
    tags: [] as string[],
  });
  const [courseSelCatId, setCourseSelCatId] = useState("");
  const [courseSelSubName, setCourseSelSubName] = useState("");

  const [courseSearch, setCourseSearch] = useState("");
  const [courseCategoryFilter, setCourseCategoryFilter] = useState("All");
  const [coursePage, setCoursePage] = useState(1);
  const [courseTotalPages, setCourseTotalPages] = useState(1);

  useEffect(() => {
    let calculatedPrice = 999;
    if (courseForm.level === "intermediate") calculatedPrice = 1299;
    if (courseForm.level === "advanced") calculatedPrice = 1499;
    if (courseForm.category?.toLowerCase().includes("ai")) calculatedPrice = 1999;
    if (courseForm.price !== calculatedPrice) {
      setCourseForm((prev) => ({ ...prev, price: calculatedPrice }));
    }
  }, [courseForm.category, courseForm.level, courseForm.price]);

  // ─── Curriculum Builder ────────────────────────────────────────────────────
  const [activeBuilderCourseId, setActiveBuilderCourseId] = useState<string | null>(null);
  const [curriculumModules, setCurriculumModules] = useState<CurriculumModule[]>([
    { id: "module-t1", title: "Module 1: Sandbox Workspace Configuration", lessons: [
      { id: "les-t1", title: "Overview of Syllabus Milestones", type: "Video", duration: "10 mins", preview: true },
      { id: "les-t2", title: "Downloading Core Worksheets", type: "PDF", duration: "2 mins", preview: false },
    ]},
  ]);
  const [newModuleName, setNewModuleName] = useState("");
  const [activeModuleIdForLesson, setActiveModuleIdForLesson] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", type: "Video" as "Video" | "PDF" | "Quiz" | "Assignment", duration: "5 mins" });
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // ─── Media / Resources ─────────────────────────────────────────────────────
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    { id: "media-1", name: "calculus-syllabus-outline.pdf", size: "2.4 MB", type: "PDF" },
    { id: "media-2", name: "figma-grids-preview.zip", size: "12.8 MB", type: "Zip" },
  ]);

  // ─── Students ──────────────────────────────────────────────────────────────
  const [students, setStudents] = useState<StudentProgress[]>([
    { id: "stud-1", name: "Rahul Verma", courseTitle: "Introduction to Calculus & Geometry Applications", progress: 68, assignmentStatus: "Submitted", submittedFile: "derivatives-worksheet.pdf", attendance: 88, quizScore: "B+", certificateEarned: false },
    { id: "stud-2", name: "Sneha Roy", courseTitle: "UI/UX Figma Design: Layouts & Grids Essentials", progress: 100, assignmentStatus: "Graded", submittedFile: "figma-navigation-sidebar.zip", grade: "A", feedback: "Spectacular layouts!", attendance: 98, quizScore: "A+", certificateEarned: true },
  ]);
  const [activeGradingStudentId, setActiveGradingStudentId] = useState<string | null>(null);
  const [gradingForm, setGradingForm] = useState({ grade: "A", feedback: "", score: "" });
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilterCourse, setStudentFilterCourse] = useState("All");
  const [studentFilterProgress, setStudentFilterProgress] = useState("All");
  const [studentSortBy, setStudentSortBy] = useState("name-asc");

  // ─── Live Classes ──────────────────────────────────────────────────────────
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => {
    if (typeof window === "undefined") return [{ id: "live-t1", title: "Interactive Q&A Session: Linear Algebra Doubts", time: "Today, 5:00 PM IST", countdown: "Starts in 2 hours", meetingLink: "https://meet.eduearn.com/tutor-algebra", platform: "Google Meet", status: "Scheduled", studentsCount: 3, attendanceCount: 3 }];
    try {
      const saved = localStorage.getItem("eduearn_live_classes");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: "live-t1", title: "Interactive Q&A Session: Linear Algebra Doubts", time: "Today, 5:00 PM IST", countdown: "Starts in 2 hours", meetingLink: "https://meet.eduearn.com/tutor-algebra", platform: "Google Meet", status: "Scheduled", studentsCount: 3, attendanceCount: 3 }];
  });
  const [isSchedulingLive, setIsSchedulingLive] = useState(false);
  const [liveForm, setLiveForm] = useState<{ title: string; time: string; platform: "Google Meet" | "Zoom" | "Microsoft Teams"; link: string; password?: string; recordingUrl?: string; attachments?: string; notes?: string; }>({ title: "", time: "", link: "", platform: "Google Meet", password: "", recordingUrl: "", attachments: "", notes: "" });

  // ─── Finance ───────────────────────────────────────────────────────────────
  const [earningsBalanceState, setEarningsBalanceState] = useState<EarningsBalance>(() => PaymentService.getTutorEarnings());
  const [withdrawalsState, setWithdrawalsState] = useState<WithdrawalRequest[]>(() => PaymentService.getWithdrawalHistory());
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "UPI", bankDetails: "" });

  // ─── Platform Config & Gating ──────────────────────────────────────────────
  const platformConfig = useMemo(() => PaymentService.getPlatformConfig(), []);
  const [tutorProSubscribed, setTutorProSubscribed] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("tutor_pro_subscribed") === "true";
    return false;
  });
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(() => {
    if (typeof window === "undefined") return 22;
    const savedDate = localStorage.getItem("tutor_application_date");
    if (!savedDate) {
      const d = new Date();
      d.setDate(d.getDate() - 8);
      localStorage.setItem("tutor_application_date", d.toISOString().substring(0, 10));
      return 22;
    }
    const diff = Math.floor((Date.now() - new Date(savedDate).getTime()) / 86400000);
    return Math.max(platformConfig.freeTrialDays - diff, 0);
  });

  const isGateTriggered = useMemo(() =>
    !tutorProSubscribed && (
      trialDaysRemaining <= 0 ||
      students.length >= platformConfig.studentLimit ||
      earningsBalanceState.total >= platformConfig.earningsLimit
    ),
    [tutorProSubscribed, trialDaysRemaining, students.length, platformConfig, earningsBalanceState.total]
  );

  // ─── Reviews ───────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([
    { id: "rev-1", courseTitle: "Introduction to Calculus & Geometry Applications", authorName: "Rahul Verma", rating: 5.0, comment: "Outstanding lessons! Explained difficult derivations very simply." },
  ]);
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // ─── Verification ──────────────────────────────────────────────────────────
  const [verificationTimeline, setVerificationTimeline] = useState("uploaded");
  const [isIdUploaded, setIsIdUploaded] = useState(false);

  // ─── Tutor Dashboard API Data ──────────────────────────────────────────────
  const [statistics, setStatistics] = useState<any | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // ─── Lesson Management API Data ────────────────────────────────────────────
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // ─── AI Studio ─────────────────────────────────────────────────────────────
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalConfig, setAiModalConfig] = useState({ title: "", template: "", placeholder: "" });
  const [aiTokensUsed, setAiTokensUsed] = useState(() => {
    if (typeof window === "undefined") return 35;
    return Number(localStorage.getItem("eduearn_tutor_ai_tokens_used") || "35");
  });

  // ─── Settings ──────────────────────────────────────────────────────────────
  const [tutorProfileForm, setTutorProfileForm] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    skills: "React, Next.js, UI/UX Layouts, Figma, Linear Algebra",
    languages: user?.language || "English, Hindi",
    bankName: "HDFC Bank",
    accountNo: "XXXXXXXXXX",
    ifscCode: "HDFC0000XXX",
    upiId: "yourid@upi",
    taxId: "ABCDE1234F",
  });
  const [activeSettingAccordion, setActiveSettingAccordion] = useState("profile");

  // ─── ECOSYSTEM CONNECTED WORKFLOW SYNC ───────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncTutorEcosystem = () => {
      try {
        const enrollments = EcosystemSync.getEnrollments();
        const assignmentsList = EcosystemSync.getAssignments();
        const sessionsList = EcosystemSync.getSessions();

        // 1. Map Student Progress & Assignment Submission/Grading Statuses
        const mappedStudents: StudentProgress[] = [];
        enrollments.forEach((enr: any) => {
          const matchedAsg = assignmentsList.find((a: any) => a.studentName === enr.studentName && a.courseTitle === enr.courseTitle);
          mappedStudents.push({
            id: enr.id,
            name: enr.studentName,
            courseTitle: enr.courseTitle,
            progress: enr.progressPercent,
            assignmentStatus: matchedAsg ? matchedAsg.status : "Pending",
            submittedFile: matchedAsg?.status === "Submitted" ? "workspace-solution.zip" : undefined,
            grade: matchedAsg?.grade,
            feedback: matchedAsg?.feedback,
            attendance: enr.attendancePercent,
            quizScore: enr.progressPercent >= 90 ? "A+" : "B",
            certificateEarned: enr.progressPercent === 100,
          });
        });
        if (mappedStudents.length > 0) {
          setStudents(mappedStudents);
        }

        // 2. Map sessions to Live Classes
        if (sessionsList.length > 0) {
          const mappedSessions: LiveSession[] = sessionsList.map((ses: any) => ({
            id: ses.id,
            title: ses.courseTitle,
            time: ses.dateTime,
            countdown: "Scheduled",
            meetingLink: ses.meetingLink,
            platform: "Google Meet",
            status: "Scheduled",
            studentsCount: enrollments.filter((e: any) => e.courseTitle === ses.courseTitle).length || 1,
            attendanceCount: enrollments.filter((e: any) => e.courseTitle === ses.courseTitle).length || 1,
          }));
          setLiveSessions(mappedSessions);
        }
      } catch (err) {
        console.warn("Tutor Ecosystem sync failed:", err);
      }
    };

    syncTutorEcosystem();
    window.addEventListener("storage", syncTutorEcosystem);
    return () => window.removeEventListener("storage", syncTutorEcosystem);
  }, []);

  // ─── Supabase Database Load ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const fetchDbData = async () => {
      try {
        const supabase = createClient();
        
        // Courses are now managed dynamically by the fetchCoursesList hook below
        const { data: tutorCoursesData } = await supabase
          .from("courses")
          .select("id")
          .eq("tutor_id", user.id);
        const courseIds = tutorCoursesData ? tutorCoursesData.map((c: any) => c.id) : [];

        // 2. Fetch live sessions
        const { data: liveData } = await supabase
          .from("live_classes")
          .select("*")
          .eq("tutor_id", user.id);
        
        if (liveData) {
          const mappedLive: LiveSession[] = liveData.map((l: any) => ({
            id: l.id,
            title: l.title,
            time: new Date(l.scheduled_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            countdown: "Starts soon",
            meetingLink: l.meeting_link,
            platform: l.meeting_link.includes("zoom") ? "Zoom" : l.meeting_link.includes("teams") ? "Microsoft Teams" : "Google Meet",
            status: "Scheduled",
            studentsCount: 0,
            attendanceCount: 0,
          }));
          setLiveSessions(mappedLive);
        }

        // 3. Fetch reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*, courses(title)")
          .in("course_id", courseIds.length > 0 ? courseIds : ["00000000-0000-0000-0000-000000000000"]);
        
        if (reviewsData) {
          const mappedReviews: Review[] = reviewsData.map((r: any) => ({
            id: r.id,
            courseTitle: (r.courses as any)?.title || "Course Module",
            authorName: "Course Student",
            rating: r.rating,
            comment: r.comment,
            reply: r.reply_text || undefined,
          }));
          setReviews(mappedReviews);
        }

        // 4. Fetch earnings
        const resEarnings = await fetch("/api/tutor/finance/earnings");
        if (resEarnings.ok) {
          const dbEarnings = await resEarnings.json();
          setEarningsBalanceState({
            total: dbEarnings.total || 0,
            available: dbEarnings.available || 0,
            withdrawn: dbEarnings.withdrawn || 0,
            pending: dbEarnings.pending || 0,
            commission: dbEarnings.commission || 10,
          });
        }

        // 5. Fetch withdrawals
        const resWithdrawals = await fetch("/api/tutor/finance/withdrawals");
        if (resWithdrawals.ok) {
          const dbWithdrawals = await resWithdrawals.json();
          const mappedWithdrawals: WithdrawalRequest[] = dbWithdrawals.map((w: any) => ({
            id: w.id,
            amount: w.amount,
            method: w.method as "UPI" | "Bank",
            status: w.status as "Pending" | "Approved" | "Rejected",
            date: w.date,
            bankDetails: w.bankDetails || "upiId",
          }));
          setWithdrawalsState(mappedWithdrawals);
        }

        // 6. Fetch students list dynamically from enrollments table
        const { data: enrollmentsList } = await supabase
          .from("enrollments")
          .select("*, profiles(full_name), courses(title)")
          .in("course_id", courseIds.length > 0 ? courseIds : ["00000000-0000-0000-0000-000000000000"]);
        
        if (enrollmentsList) {
          const mappedStudents: StudentProgress[] = enrollmentsList.map((e: any) => ({
            id: e.id,
            name: (e.profiles as any)?.full_name || "Enrolled Student",
            courseTitle: (e.courses as any)?.title || "Course Module",
            progress: e.progress || 0,
            assignmentStatus: "Pending",
            attendance: 100,
            quizScore: "N/A",
            certificateEarned: !!e.certificate_url,
          }));
          setStudents(mappedStudents);
        }

      } catch (err) {
        console.error("Error fetching tutor DB data:", err);
      }
    };

    fetchDbData();
  }, [user]);

  // ─── Fetch Dynamic Tutor Dashboard API Data ────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const fetchDashboardApiData = async () => {
      try {
        setDashboardLoading(true);
        const res = await fetch("/api/tutor/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.statistics) {
            setStatistics(data.statistics);
          }
          if (data.recentEnrollments) {
            setRecentEnrollments(data.recentEnrollments);
          }
          if (data.recentActivities) {
            setRecentActivities(data.recentActivities);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch tutor dashboard API data:", err);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardApiData();
  }, [user]);

  // ─── Fetch Dynamic Tutor Courses API Data ──────────────────────────────────
  const fetchCoursesList = useCallback(async () => {
    if (!user) return;
    try {
      let url = `/api/tutor/courses?page=${coursePage}&limit=6`;
      if (courseSearch) {
        url += `&search=${encodeURIComponent(courseSearch)}`;
      }
      if (courseCategoryFilter && courseCategoryFilter !== "All") {
        url += `&category=${encodeURIComponent(courseCategoryFilter)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.courses) {
          const mapped = data.courses.map((c: any) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            price: Number(c.price || 0),
            level: c.level,
            duration: c.duration || "10 hours",
            studentsCount: c.studentsCount || 0,
            rating: c.rating || 5.0,
            status: c.status,
            subtitle: c.subtitle || "",
            description: c.description || "",
            language: c.language || "English",
            thumbnail: c.thumbnail || "",
            tags: c.tags || [],
          }));
          setMyCourses(mapped);
          if (data.pagination) {
            setCourseTotalPages(data.pagination.pages || 1);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch tutor courses list:", err);
    }
  }, [user, coursePage, courseSearch, courseCategoryFilter]);

  useEffect(() => {
    fetchCoursesList();
  }, [fetchCoursesList]);

  // ─── Fetch Lessons for Selected Course ─────────────────────────────────────
  useEffect(() => {
    if (activeBuilderCourseId) {
      const loadLessons = async () => {
        try {
          setLessonsLoading(true);
          const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/lessons`);
          if (res.ok) {
            const data = await res.json();
            setLessons(data);
          }
        } catch (err) {
          console.warn("Failed to load lessons:", err);
        } finally {
          setLessonsLoading(false);
        }
      };
      loadLessons();
    } else {
      setLessons([]);
    }
  }, [activeBuilderCourseId]);
  useEffect(() => {
    if (user) {
      setTutorProfileForm((p) => ({
        ...p,
        fullName: user.fullName || "",
        bio: user.bio || "",
        skills: Array.isArray(user.skills) ? user.skills.join(", ") : (user.skills || "React, Next.js, UI/UX Layouts, Figma, Linear Algebra"),
        languages: user.language || "English, Hindi",
      }));
    }
  }, [user]);

  // ─── Business Logic Handlers ──────────────────────────────────────────────

  const triggerAutoSave = useCallback(() => {
    setIsAutoSaving(true);
    setTimeout(() => { setIsAutoSaving(false); toast.success("Auto-saved."); }, 1000);
  }, []);

  const calculateTotalMediaSizeMB = useCallback(() => {
    return mediaFiles.reduce((total, file) => {
      if (!file.size) return total;
      const s = file.size.toUpperCase().trim();
      const n = parseFloat(s);
      if (isNaN(n)) return total;
      if (s.includes("KB")) return total + n / 1024;
      if (s.includes("GB")) return total + n * 1024;
      return total + n;
    }, 0);
  }, [mediaFiles]);

  const handleAddModule = useCallback(() => {
    if (!newModuleName.trim()) return;
    const newMod: CurriculumModule = { id: `module-${Date.now()}`, title: newModuleName, lessons: [] };
    setCurriculumModules((prev) => [...prev, newMod]);
    setNewModuleName("");
    triggerAutoSave();
  }, [newModuleName, triggerAutoSave]);

  const handleAddLesson = useCallback((moduleId: string) => {
    if (!lessonForm.title.trim()) return;
    setCurriculumModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const newLes: CurriculumLesson = { id: `les-${Date.now()}`, title: lessonForm.title, type: lessonForm.type, duration: lessonForm.duration, preview: false };
        return { ...mod, lessons: [...mod.lessons, newLes] };
      })
    );
    setLessonForm({ title: "", type: "Video", duration: "5 mins" });
    setActiveModuleIdForLesson(null);
    triggerAutoSave();
  }, [lessonForm, triggerAutoSave]);

  // ─── Fetch Submissions for Grading ─────────────────────────────────────────
  const fetchSubmissionsList = useCallback(async () => {
    try {
      const res = await fetch("/api/tutor/assignments/submissions");
      if (res.ok) {
        const data: any[] = await res.json();
        const mappedFromSubmissions = data.map((s: any) => ({
          id: s.id, // submission ID
          studentId: s.studentId,
          name: s.studentName || "Student",
          courseTitle: s.courseTitle || "Course Module",
          progress: 100,
          attendance: 95,
          assignmentStatus: (s.grade ? "Graded" : "Submitted") as "Pending" | "Submitted" | "Graded",
          submittedFile: s.fileUrl || "Attachment URL",
          grade: s.grade || "",
          feedback: s.feedback || "",
          quizScore: "N/A",
          certificateEarned: false,
        }));
        setStudents(mappedFromSubmissions);
      }
    } catch (err) {
      console.warn("Failed to load submissions:", err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "assignments") {
      fetchSubmissionsList();
    }
  }, [activeTab, fetchSubmissionsList]);

  const handleSubmitGrade = useCallback(async (submissionId: string) => {
    try {
      const res = await fetch("/api/tutor/assignments/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          grade: gradingForm.grade,
          feedback: gradingForm.feedback,
        }),
      });

      if (res.ok) {
        toast.success("Grade submitted successfully.");
        setActiveGradingStudentId(null);
        setGradingForm({ grade: "A", feedback: "", score: "" });
        fetchSubmissionsList();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to submit grade.");
      }
    } catch (err) {
      toast.error("Error submitting grade.");
    }
  }, [gradingForm, fetchSubmissionsList]);

  const handleIssueCertificate = useCallback(async (enrollmentId: string) => {
    try {
      const res = await fetch("/api/tutor/students/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });

      if (res.ok) {
        toast.success("Certificate issued successfully.");
        setStudents((prev) =>
          prev.map((s) => (s.id === enrollmentId ? { ...s, certificateEarned: true } : s))
        );
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to issue certificate.");
      }
    } catch (err) {
      toast.error("Error issuing certificate.");
    }
  }, []);

  const handleScheduleLive = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!liveForm.title.trim()) return;

    if (myCourses.length === 0) {
      toast.error("Please create a course in the Studio before scheduling a live class.");
      return;
    }

    try {
      const courseId = myCourses[0].id;
      
      const scheduledAt = new Date();
      scheduledAt.setHours(scheduledAt.getHours() + 2);
      
      const dbSession = await lmsDb.addLiveClass(courseId, user.id, {
        title: liveForm.title,
        description: liveForm.notes || "Live class session",
        scheduled_at: scheduledAt.toISOString(),
        duration: 60,
        meeting_link: liveForm.link || "https://meet.google.com/sandbox-room",
      });

      const newSession: LiveSession = {
        id: dbSession.id,
        title: dbSession.title,
        time: new Date(dbSession.scheduled_at).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        countdown: "Starts soon",
        meetingLink: dbSession.meeting_link,
        platform: liveForm.platform,
        password: liveForm.password || undefined,
        recordingUrl: liveForm.recordingUrl || undefined,
        attachments: liveForm.attachments || undefined,
        notes: liveForm.notes || undefined,
        studentsCount: 0,
        attendanceCount: 0,
        status: "Scheduled",
      };

      setLiveSessions((prev) => [...prev, newSession]);
      setLiveForm({ title: "", time: "", link: "", platform: "Google Meet", password: "", recordingUrl: "", attachments: "", notes: "" });
      setIsSchedulingLive(false);
      toast.success("Live class scheduled successfully.");
    } catch (err: any) {
      console.error("Failed to schedule live class:", err);
      toast.error("Failed to schedule live class in database.");
    }
  }, [liveForm, user, myCourses]);

  const handleWithdrawalRequest = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = Number(withdrawForm.amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount."); return; }
    if (amt > earningsBalanceState.available) { toast.error("Insufficient balance."); return; }
    if (!withdrawForm.bankDetails.trim()) { toast.error("Enter UPI ID or bank details."); return; }

    try {
      const res = await fetch("/api/tutor/finance/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          method: withdrawForm.method,
          bankDetails: withdrawForm.bankDetails,
        }),
      });

      if (res.ok) {
        const dbWth = await res.json();
        const newWth: WithdrawalRequest = {
          id: dbWth.id,
          amount: dbWth.amount,
          method: dbWth.method as "UPI" | "Bank",
          status: dbWth.status as "Pending" | "Approved" | "Rejected",
          date: dbWth.date,
          bankDetails: dbWth.bankDetails || withdrawForm.bankDetails,
        };

        setWithdrawalsState((prev) => [newWth, ...prev]);
        setEarningsBalanceState((prev) => ({
          ...prev,
          available: prev.available - amt,
          pending: prev.pending + amt,
        }));
        toast.success("Withdrawal request submitted successfully!");
        setWithdrawForm({ amount: "", method: "UPI", bankDetails: "" });
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to submit withdrawal request.");
      }
    } catch (err: any) {
      console.error("Withdrawal request failed:", err);
      toast.error("Error submitting withdrawal request.");
    }
  }, [withdrawForm, earningsBalanceState.available, user]);

  // ─── Computed values ───────────────────────────────────────────────────────
  const pendingAssignments = useMemo(() => students.filter((s) => s.assignmentStatus === "Submitted").length, [students]);
  const pendingReviewsCount = useMemo(() => reviews.filter((r) => !r.reply).length, [reviews]);
  const sidebarOffset = isSidebarCollapsed ? "md:ml-[4.5rem]" : "md:ml-64";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <RequireTutor>
      <PageWrapper>
        <div className="min-h-screen bg-background flex">
          {/* Sidebar */}
          <TutorSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((p) => !p)}
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            user={user ? { fullName: user.fullName || "Tutor", role: "tutor" } : null}
            onLogout={logout}
            pendingAssignments={pendingAssignments}
            pendingReviews={pendingReviewsCount}
            pendingNotifications={0}
          />

          {/* Main content */}
          <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOffset}`}>
            {/* Header */}
            <TutorHeader
              activeTab={activeTab}
              isCurriculumBuilderOpen={!!activeBuilderCourseId}
              onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
              onTabChange={handleTabChange}
              notificationCount={pendingAssignments + pendingReviewsCount}
            />

            {/* Page content */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Dashboard */}
                {activeTab === "dashboard" && (
                  <DashboardOverview
                    user={user ? { fullName: user.fullName || "Tutor" } : null}
                    myCourses={myCourses}
                    students={students}
                    liveSessions={liveSessions}
                    reviews={reviews}
                    earningsBalance={earningsBalanceState}
                    aiTokensUsed={aiTokensUsed}
                    platformConfig={platformConfig}
                    trialDaysRemaining={trialDaysRemaining}
                    onTabChange={handleTabChange}
                    onCreateCourse={() => { handleTabChange("courses"); setIsCreatingCourse(true); }}
                    onScheduleLive={() => { handleTabChange("live-classes"); setIsSchedulingLive(true); }}
                    statistics={statistics || undefined}
                    recentEnrollments={recentEnrollments}
                    recentActivities={recentActivities}
                  />
                )}

                {/* Courses */}
                {activeTab === "courses" && (
                  <CourseManager
                    myCourses={myCourses}
                    setMyCourses={setMyCourses}
                    isCreatingCourse={isCreatingCourse}
                    setIsCreatingCourse={setIsCreatingCourse}
                    activeBuilderCourseId={activeBuilderCourseId}
                    setActiveBuilderCourseId={setActiveBuilderCourseId}
                    curriculumModules={curriculumModules}
                    setCurriculumModules={setCurriculumModules}
                    newModuleName={newModuleName}
                    setNewModuleName={setNewModuleName}
                    activeModuleIdForLesson={activeModuleIdForLesson}
                    setActiveModuleIdForLesson={setActiveModuleIdForLesson}
                    lessonForm={lessonForm}
                    setLessonForm={setLessonForm}
                    isAutoSaving={isAutoSaving}
                    courseForm={courseForm}
                    setCourseForm={setCourseForm}
                    editingCourseId={editingCourseId}
                    setEditingCourseId={setEditingCourseId}
                    courseSelCatId={courseSelCatId}
                    setCourseSelCatId={setCourseSelCatId}
                    courseSelSubName={courseSelSubName}
                    setCourseSelSubName={setCourseSelSubName}
                    appStatus={appStatus}
                    handleAddModule={handleAddModule}
                    handleAddLesson={handleAddLesson}
                    triggerAutoSave={triggerAutoSave}
                    courseSearch={courseSearch}
                    setCourseSearch={setCourseSearch}
                    courseCategoryFilter={courseCategoryFilter}
                    setCourseCategoryFilter={setCourseCategoryFilter}
                    coursePage={coursePage}
                    setCoursePage={setCoursePage}
                    courseTotalPages={courseTotalPages}
                    lessons={lessons}
                    setLessons={setLessons}
                    lessonsLoading={lessonsLoading}
                  />
                )}

                {/* Students */}
                {activeTab === "students" && (
                  <StudentManager
                    students={students}
                    myCourses={myCourses}
                    studentSearch={studentSearch}
                    setStudentSearch={setStudentSearch}
                    studentFilterCourse={studentFilterCourse}
                    setStudentFilterCourse={setStudentFilterCourse}
                    studentFilterProgress={studentFilterProgress}
                    setStudentFilterProgress={setStudentFilterProgress}
                    studentSortBy={studentSortBy}
                    setStudentSortBy={setStudentSortBy}
                    onIssueCertificate={handleIssueCertificate}
                  />
                )}

                {/* Live Classes */}
                {activeTab === "live-classes" && (
                  <LiveClasses
                    liveSessions={liveSessions}
                    setLiveSessions={setLiveSessions}
                    isSchedulingLive={isSchedulingLive}
                    setIsSchedulingLive={setIsSchedulingLive}
                    liveForm={liveForm}
                    setLiveForm={setLiveForm}
                    handleScheduleLive={handleScheduleLive}
                    isGateTriggered={isGateTriggered}
                  />
                )}

                {/* Assignments */}
                {activeTab === "assignments" && (
                  <Assignments
                    students={students}
                    activeGradingStudentId={activeGradingStudentId}
                    setActiveGradingStudentId={setActiveGradingStudentId}
                    gradingForm={gradingForm}
                    setGradingForm={setGradingForm}
                    handleSubmitGrade={handleSubmitGrade}
                  />
                )}

                {/* Calendar */}
                {activeTab === "calendar" && (
                  <CalendarView
                    onScheduleLive={() => { handleTabChange("live-classes"); setIsSchedulingLive(true); }}
                    liveSessions={liveSessions}
                  />
                )}

                {/* Resources */}
                {activeTab === "resources" && (
                  <Resources
                    mediaFiles={mediaFiles}
                    setMediaFiles={setMediaFiles}
                    platformConfig={platformConfig}
                    calculateTotalMediaSizeMB={calculateTotalMediaSizeMB}
                  />
                )}

                {/* AI Studio */}
                {activeTab === "ai-studio" && (
                  <AIStudio
                    myCourses={myCourses}
                    aiTokensUsed={aiTokensUsed}
                    platformConfig={platformConfig}
                    setIsAiModalOpen={setIsAiModalOpen}
                    setAiModalConfig={setAiModalConfig}
                  />
                )}

                {/* Analytics */}
                {activeTab === "analytics" && (
                  <Analytics
                    myCourses={myCourses}
                    students={students}
                    earningsBalance={earningsBalanceState}
                  />
                )}

                {/* Finance (replaces wallet + earnings) */}
                {activeTab === "finance" && (
                  <Finance
                    earningsBalance={earningsBalanceState}
                    withdrawalsState={withdrawalsState}
                    withdrawForm={withdrawForm}
                    setWithdrawForm={setWithdrawForm}
                    handleWithdrawalRequest={handleWithdrawalRequest}
                  />
                )}

                {/* Reviews */}
                {activeTab === "reviews" && (
                  <Reviews
                    reviews={reviews}
                    setReviews={setReviews}
                    activeReplyReviewId={activeReplyReviewId}
                    setActiveReplyReviewId={setActiveReplyReviewId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                  />
                )}


                {/* Notifications */}
                {activeTab === "notifications" && <TutorNotifications />}

                {/* Messages */}
                {activeTab === "messages" && <Messages />}

                {/* Community */}
                {activeTab === "community" && <Community />}

                {/* Settings */}
                {activeTab === "settings" && (
                  <Settings
                    tutorProfileForm={tutorProfileForm}
                    setTutorProfileForm={setTutorProfileForm}
                    activeSettingAccordion={activeSettingAccordion}
                    setActiveSettingAccordion={setActiveSettingAccordion}
                    completeProfile={completeProfile}
                    verificationTimeline={verificationTimeline}
                    setVerificationTimeline={setVerificationTimeline}
                    isIdUploaded={isIdUploaded}
                    setIsIdUploaded={setIsIdUploaded}
                    appStatus={appStatus}
                  />
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>

        {/* AI Generator Modal (global, shared) */}
        <AiGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          title={aiModalConfig.title}
          promptTemplate={aiModalConfig.template}
          placeholder={aiModalConfig.placeholder}
          onGenerateSuccess={() => {
            setAiTokensUsed((prev) => prev + 1);
          }}
        />
      </PageWrapper>
    </RequireTutor>
  );
}
