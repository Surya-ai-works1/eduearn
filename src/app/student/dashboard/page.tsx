"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlayCircle,
  BookOpen,
  TrendingUp,
  Award,
  Heart,
  FileText,
  HelpCircle,
  Briefcase,
  Download,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Flame,
  Clock,
  Gift,
  BookOpenCheck,
  Calendar,
  Share2,
  Search,
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  BookMarked,
  Trash2,
  Check,
  ChevronDown,
  Wallet,
  Receipt,
  Trophy,
  Shield,
  QrCode,
  Zap,
  Star,
  Activity,
  UserCheck,
  Notebook,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentService, PurchaseHistoryItem } from "../../../features/payments/services/paymentService";
import { EcosystemSync } from "../../../features/payments/services/marketplaceService";
import { InvoiceView } from "../../../features/payments/components/InvoiceView";
import { cn } from "../../../utils/cn";
import { AiService } from "../../../features/ai/services/aiService";

import { PageWrapper } from "../../../components/layout/PageWrapper";
import { useTheme } from "next-themes";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { RequireLearner } from "../../../features/auth/components/RouteGuard";
import { useAuth } from "../../../hooks/useAuth";
import { CalendarView, CalendarEvent } from "../../../components/ui/CalendarView";
import { AgendaView } from "../../../components/ui/AgendaView";
import { navigateToClassroom } from "../../../features/classroom/utils/navigation";
import { MOCK_COURSES } from "../../../constants/mockData";
import { getCourseThumbnail } from "../../../lib/courseThumbnailRegistry";
import { Skeleton } from "../../../components/ui/skeleton";
import { EmptyState } from "../../../components/ui/empty-state";

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────

interface EnrolledCourse {
  id: string;
  title: string;
  tutorName: string;
  thumbnail: string;
  progress: number;
  lessonsCount: number;
  completedLessons: number;
  duration: string;
  estimatedCompletion: string;
  category: string;
  lastStudied: string;
}

interface LiveClass {
  id: string;
  title: string;
  tutorName: string;
  time: string;
  countdown: string;
  duration: string;
  isEnrolled?: boolean;
  hasLink?: boolean;
  meetingLink?: string;
  platform?: string;
}

interface Certificate {
  id: string;
  courseTitle: string;
  serialNumber: string;
  issueDate: string;
  qrCode: string;
  courseImage?: string;
  tutorName?: string;
  blockchainHash?: string;
  courseId?: string;
}

interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Graded";
  grade?: string;
  feedback?: string;
  prompt: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIdx: number;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  questionsCount: number;
  timeLimit: string;
  rewardCoins: number;
  questions: QuizQuestion[];
}

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  badges: string[];
  isCurrentUser?: boolean;
}

// ─── WEEKLY QUIZZES DATA ──────────────────────────────────────────────────────
const WEEKLY_QUIZZES: Quiz[] = [
  {
    id: "wq-math",
    title: "Derivatives & Calculus Challenge",
    subject: "Mathematics",
    difficulty: "Intermediate",
    questionsCount: 3,
    timeLimit: "3 mins",
    rewardCoins: 50,
    questions: [
      { question: "What is the derivative of f(x) = x^2?", options: ["x", "2x", "x^2", "2"], correctAnswerIdx: 1 },
      { question: "If 3x - 7 = 8, solve for x:", options: ["x = 3", "x = 4", "x = 5", "x = 6"], correctAnswerIdx: 2 },
      { question: "What is the value of limit as x approaches 0 of sin(x)/x?", options: ["0", "1", "undefined", "infinity"], correctAnswerIdx: 1 },
    ],
  },
  {
    id: "wq-python",
    title: "Python Control Flow & Loops",
    subject: "Python Programming",
    difficulty: "Beginner",
    questionsCount: 3,
    timeLimit: "2 mins",
    rewardCoins: 40,
    questions: [
      { question: "Which keyword is used to start a function definition in Python?", options: ["func", "def", "function", "lambda"], correctAnswerIdx: 1 },
      { question: "What is the output of len([1, 2, [3, 4]])?", options: ["3", "4", "2", "Error"], correctAnswerIdx: 0 },
      { question: "Which loop is used when the number of iterations is fixed?", options: ["while", "for", "do-while", "foreach"], correctAnswerIdx: 1 },
    ],
  },
  {
    id: "wq-ai",
    title: "AI & Prompt Engineering Basics",
    subject: "AI Prompt Engineering",
    difficulty: "Advanced",
    questionsCount: 3,
    timeLimit: "3 mins",
    rewardCoins: 60,
    questions: [
      { question: "What does 'Few-shot prompting' involve?", options: ["Zero examples", "Providing 1-5 examples in prompt", "Updating model weights", "Writing short questions"], correctAnswerIdx: 1 },
      { question: "Which parameter controls prompt response randomness?", options: ["Top P", "Max tokens", "Temperature", "Presence Penalty"], correctAnswerIdx: 2 },
      { question: "What is the main advantage of Chain of Thought prompting?", options: ["Fewer tokens", "Model shows step-by-step reasoning", "Faster latency", "Direct responses"], correctAnswerIdx: 1 },
    ],
  },
  {
    id: "wq-photo",
    title: "Camera Exposure & Composition",
    subject: "Photography",
    difficulty: "Intermediate",
    questionsCount: 3,
    timeLimit: "3 mins",
    rewardCoins: 50,
    questions: [
      { question: "What aperture setting yields the shallowest depth of field?", options: ["f/16", "f/8", "f/2.8", "f/22"], correctAnswerIdx: 2 },
      { question: "What does ISO measure in photography?", options: ["Lens focal length", "Sensor sensitivity to light", "Shutter speed delay", "Color temperature"], correctAnswerIdx: 1 },
      { question: "Which rule splits the frame into a 3x3 grid for framing subjects?", options: ["Rule of Halves", "Rule of Thirds", "Golden Ratio", "Leading Lines"], correctAnswerIdx: 1 },
    ],
  },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  return (
    <RequireLearner>
      <StudentDashboardContent />
    </RequireLearner>
  );
}

function StudentDashboardContent() {
  const { user, logout, completeProfile } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 4,
    completedCourses: 3,
    certificatesEarned: 2,
    completionRate: 59,
    currentLearningStreak: 7,
    totalLearningHours: 14,
  });

  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eduearn_notification_prefs");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return { email: true, push: false, reminders: true };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // ─── REWARDS & GAMIFICATION STATES (LOCAL STORAGE) ──────────────────────────
  const [coins, setCoins] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("eduearn_coins") || "450");
    }
    return 450;
  });

  const [xp, setXp] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("eduearn_xp") || "1850");
    }
    return 1850;
  });

  const [streak, setStreak] = useState(7);

  const [rewardsHistory, setRewardsHistory] = useState(() => [
    { id: "r-1", reason: "Daily Learning Streak Bonus", coins: 15, date: "Today" },
    { id: "r-2", reason: "Weekly Math Quiz Accomplished", coins: 50, date: "Yesterday" },
    { id: "r-3", reason: "Assignment 1 Submission", coins: 100, date: "2 days ago" },
    { id: "r-4", reason: "Referral Invite Verified", coins: 150, date: "Last week" },
  ]);

  // Continue Learning: Every category support
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([
    {
      id: "course-python",
      title: "Python Programming Masterclass",
      tutorName: "Vikram Rathore",
      thumbnail: "/images/categories/coding-v2.webp",
      progress: 90,
      lessonsCount: 10,
      completedLessons: 9,
      duration: "8 hours",
      estimatedCompletion: "1 lesson left",
      category: "💻 Coding",
      lastStudied: "1 hour ago",
    },
    {
      id: "course-keyboard",
      title: "Fundamentals of Keyboard & Chords",
      tutorName: "Aarav Sharma",
      thumbnail: getCourseThumbnail({ title: "Fundamentals of Keyboard & Chords", subjectId: "music" }),
      progress: 40,
      lessonsCount: 15,
      completedLessons: 6,
      duration: "12 hours",
      estimatedCompletion: "9 lessons left",
      category: "🎹 Music",
      lastStudied: "Yesterday",
    },
    {
      id: "course-kuchipudi",
      title: "Kuchipudi Dance: Mudras & Coordination",
      tutorName: "Sneha Iyer",
      thumbnail: getCourseThumbnail({ title: "Kuchipudi Dance: Mudras & Coordination", subjectId: "dance" }),
      progress: 10,
      lessonsCount: 10,
      completedLessons: 1,
      duration: "10 hours",
      estimatedCompletion: "9 lessons left",
      category: "💃 Dance",
      lastStudied: "Yesterday",
    },
    {
      id: "course-prompt",
      title: "AI Prompt Engineering 101",
      tutorName: "Karan Malhotra",
      thumbnail: getCourseThumbnail({ title: "AI Prompt Engineering 101", subjectId: "ai" }),
      progress: 60,
      lessonsCount: 10,
      completedLessons: 6,
      duration: "6 hours",
      estimatedCompletion: "4 lessons left",
      category: "🤖 Artificial Intelligence",
      lastStudied: "2 days ago",
    },
    {
      id: "course-drawing",
      title: "Pencil Sketching & Drawing",
      tutorName: "Priya Patel",
      thumbnail: getCourseThumbnail({ title: "Pencil Sketching & Drawing", subjectId: "drawing" }),
      progress: 85,
      lessonsCount: 12,
      completedLessons: 10,
      duration: "9 hours",
      estimatedCompletion: "2 lessons left",
      category: "🎨 Creative Arts",
      lastStudied: "3 days ago",
    },
    {
      id: "course-photography",
      title: "Advanced DSLR Photography",
      tutorName: "Anjali Deshmukh",
      thumbnail: getCourseThumbnail({ title: "Advanced DSLR Photography", subjectId: "photography" }),
      progress: 50,
      lessonsCount: 12,
      completedLessons: 6,
      duration: "8 hours",
      estimatedCompletion: "6 lessons left",
      category: "📸 Photography",
      lastStudied: "Last week",
    },
  ]);

  // Certificates list
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "cert-1",
      courseTitle: "Pencil Sketching & Drawing Masterclass",
      serialNumber: "EE-CERT-904128",
      issueDate: "June 14, 2026",
      qrCode: "EE-QR-904128",
      courseImage: "/images/courses/arts.png",
      tutorName: "Priya Patel",
      blockchainHash: "0x892a...c01f",
    },
  ]);

  // Wishlist list
  const [wishlist, setWishlist] = useState<typeof MOCK_COURSES>([MOCK_COURSES[2], MOCK_COURSES[8]]);

  // Applied Jobs list
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);

  // Assignments list
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "assign-1",
      courseTitle: "Python Programming Basics",
      title: "Write a CLI Calculator Script",
      dueDate: "14 Jul 2026",
      status: "Pending",
      prompt: "Write a python script that prompts user for two integers and an operator (+, -, *, /) and outputs the calculated result. Handle division by zero exceptions.",
    },
    {
      id: "assign-2",
      courseTitle: "Calculus Fundamentals",
      title: "Calculus Derivatives Worksheet",
      dueDate: "July 05, 2026",
      status: "Pending",
      prompt: "Solve the derivatives question set 2.5 and submit your derivation worksheets in PDF format.",
    },
  ]);

  // Notifications list (typed from API)
  type NotifItem = { id: string | number; title: string; text: string; time: string; read: boolean; type: string; actionUrl?: string };
  type ActivityItem = { id: string; type: string; title: string; description: string; createdAt: string };
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Downloads list
  const [downloads, setDownloads] = useState([
    { id: 1, title: "Keyboard chords progressions diagram.pdf", size: "4.8 MB", type: "PDF" },
    { id: 2, title: "Python Advanced Algorithms Handbook.pdf", size: "12 MB", type: "PDF" },
  ]);

  const addCoins = (amount: number, reason: string) => {
    setCoins((prev) => {
      const next = prev + amount;
      if (typeof window !== "undefined") {
        localStorage.setItem("eduearn_coins", String(next));
      }
      return next;
    });
    setXp((prev) => {
      const next = prev + amount * 3;
      if (typeof window !== "undefined") {
        localStorage.setItem("eduearn_xp", String(next));
      }
      return next;
    });
    setRewardsHistory((prev) => [
      { id: `r-${Date.now()}`, reason, coins: amount, date: "Just now" },
      ...prev,
    ]);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All marked as read.");
    try {
      await fetch("/api/student/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    }
  };

  const handleMarkOneRead = async (id: any) => {
    setNotifications((p) => p.map((item) => item.id === id ? { ...item, read: true } : item));
    try {
      await fetch(`/api/student/notifications/${id}`, { method: "PATCH" });
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  };

  const handleDeleteNotification = async (id: any) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    toast.success("Notification deleted.");
    try {
      await fetch(`/api/student/notifications/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete notification:", err);
    }
  };

  // Load live Supabase data on mount/user change
  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    async function loadSupabaseData() {
      try {
        const { createClient } = await import("../../../lib/supabase");
        const supabase = createClient();
        const { lmsDb } = await import("../../../lib/lmsDb");

        // 1. Enrolled Courses
        const enrolled = await lmsDb.getEnrolledCourses(userId);
        if (enrolled && enrolled.length > 0) {
          const mapped = enrolled.map((c: any) => ({
            id: c.id,
            title: c.title,
            tutorName: "Tutor Instructor",
            thumbnail: c.thumbnail || "/images/courses/coding.png",
            progress: c.progress || 0,
            lessonsCount: c.lessons?.length || 10,
            completedLessons: Math.round(((c.progress || 0) / 100) * (c.lessons?.length || 10)),
            duration: "8 hours",
            estimatedCompletion: c.progress === 100 ? "Completed" : "In Progress",
            category: c.category,
            lastStudied: "Recently",
          }));
          setEnrolledCourses(mapped);
        }

        // 2. Wishlist
        const { data: dbWishlist } = await supabase
          .from("wishlist")
          .select("*, courses(*)")
          .eq("user_id", userId);
        if (dbWishlist && dbWishlist.length > 0) {
          const mappedWish = dbWishlist.map((w: any) => ({
            id: w.courses.id,
            title: w.courses.title,
            tutorId: w.courses.tutor_id,
            tutorName: "Tutor Instructor",
            category: w.courses.category,
            categoryId: w.courses.category.toLowerCase().replace(/\s+/g, "-"),
            subjectId: w.courses.category.toLowerCase().replace(/\s+/g, "-"),
            subjectName: w.courses.category,
            price: Number(w.courses.price),
            rating: 4.8,
            duration: "10 hours",
            lessonsCount: 10,
            studentsCount: 150,
            thumbnail: w.courses.thumbnail || "",
            level: w.courses.level || "Beginner",
            language: "English",
            createdAt: w.courses.created_at,
            description: w.courses.description || w.courses.subtitle || "",
            status: w.courses.status || "published",
          }));
          setWishlist(mappedWish as any);
        }

        // 3. Notifications + Activities via Service API
        try {
          setNotificationsLoading(true);
          const notiRes = await fetch("/api/student/notifications");
          if (notiRes.ok) {
            const notiData = await notiRes.json();
            if (notiData.notifications && notiData.notifications.length > 0) {
              setNotifications(
                notiData.notifications.map((n: any) => ({
                  id: n.id,
                  title: n.title,
                  text: n.message,
                  time: new Date(n.createdAt).toLocaleDateString(),
                  read: n.isRead,
                  type: n.type || "System",
                  actionUrl: n.actionUrl,
                }))
              );
            }
            if (notiData.activities) {
              setActivities(notiData.activities);
            }
          }
        } finally {
          setNotificationsLoading(false);
        }

        // 4. Certificates (derived from enrollments that have certificate_url)
        const { data: certEnrollments } = await supabase
          .from("enrollments")
          .select("*, courses(*)")
          .eq("learner_id", userId)
          .not("certificate_url", "is", null);
        if (certEnrollments && certEnrollments.length > 0) {
          const mappedCerts = certEnrollments.map((e: any) => ({
            id: e.id,
            courseTitle: e.courses.title,
            serialNumber: `EE-CERT-${e.id.substring(0, 8).toUpperCase()}`,
            issueDate: new Date(e.created_at).toLocaleDateString(),
            qrCode: `EE-QR-${e.id.substring(0, 8).toUpperCase()}`,
            courseImage: e.courses.thumbnail || "/images/courses/arts.png",
            tutorName: "Tutor Instructor",
            blockchainHash: `0x${e.id.replace(/-/g, "").substring(0, 16)}`,
          }));
          setCertificates(mappedCerts);
        }
      } catch (err) {
        console.warn("Failed to load live student data from Supabase:", err);
      }
    }

    loadSupabaseData();
  }, [user]);

  // ─── LEVEL DERIVATION ──────────────────────────────────────────────────────
  const learningLevel = useMemo(() => {
    if (xp < 1000) return "Beginner";
    if (xp < 2500) return "Intermediate";
    if (xp < 5000) return "Advanced";
    if (xp < 10000) return "Expert";
    return "Master";
  }, [xp]);

  const nextLevelXp = useMemo(() => {
    if (xp < 1000) return 1000;
    if (xp < 2500) return 2500;
    if (xp < 5000) return 5000;
    if (xp < 10000) return 10000;
    return 20000;
  }, [xp]);

  const levelProgressPercent = useMemo(() => {
    const prevBoundary = nextLevelXp === 1000 ? 0 : nextLevelXp === 2500 ? 1000 : nextLevelXp === 5000 ? 2500 : nextLevelXp === 10000 ? 5000 : 10000;
    const progress = xp - prevBoundary;
    const range = nextLevelXp - prevBoundary;
    return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }, [xp, nextLevelXp]);

  // ─── ACTIVE NAVIGATION TABS ────────────────────────────────────────────────
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [notificationFilter, setNotificationFilter] = useState<string>("All");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Toggle body classes for sidebar state to sync global navbar positioning
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isSidebarCollapsed) {
        document.body.classList.add("sidebar-collapsed");
        document.body.classList.remove("sidebar-expanded");
      } else {
        document.body.classList.add("sidebar-expanded");
        document.body.classList.remove("sidebar-collapsed");
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("sidebar-collapsed");
        document.body.classList.remove("sidebar-expanded");
      }
    };
  }, [isSidebarCollapsed]);

  // ─── CHECKOUT & INVOICE STATES ─────────────────────────────────────────────
  const [purchaseHistoryState, setPurchaseHistoryState] = useState(() => PaymentService.getPurchaseHistory());
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseHistoryItem | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundCourseId, setRefundCourseId] = useState("");
  const [refundCourseTitle, setRefundCourseTitle] = useState("");
  const [refundCourseAmount, setRefundCourseAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");

  // ─── DYNAMIC TIMING GREETING ───────────────────────────────────────────────
  const welcomeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // ─── DYNAMIC JOIN COUNTDOWN TIMER ──────────────────────────────────────────
  const [countdownSeconds, setCountdownSeconds] = useState(4520); // 1h 15m 20s
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedCountdown = useMemo(() => {
    const h = Math.floor(countdownSeconds / 3600);
    const m = Math.floor((countdownSeconds % 3600) / 60);
    const s = countdownSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [countdownSeconds]);

  // Selected date for weekly calendar and agenda
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Interactive calendar logic - date mapping
  const dateEventsList = useMemo(() => {
    const day = selectedDate.getDate();
    const today = new Date().getDate();
    if (day === today) {
      return [
        { title: "🎹 Keyboard live class with Aarav Sharma", time: "6:00 PM IST", type: "Live Class" },
        { title: "Weekly Derivatives & Calculus Challenge ends", time: "11:59 PM", type: "Quiz" },
      ];
    } else if (day === today + 1) {
      return [
        { title: "Calculus Limit assignment deadline", time: "5:00 PM", type: "Assignment" },
        { title: "💃 Kuchipudi Dance theory discussion", time: "4:00 PM IST", type: "Workshop" },
      ];
    }
    return [{ title: "No scheduled classes or events. Enjoy self-paced study!", time: "Flexible", type: "Free Slot" }];
  }, [selectedDate]);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      {
        id: "live-1",
        title: "Keyboard Live Practice Session",
        tutorName: "Aarav Sharma",
        time: "6:00 PM IST",
        date: today,
        type: "live",
        color: "blue",
      },
      {
        id: "live-2",
        title: "Kuchipudi Dance Mudras Session",
        tutorName: "Sneha Iyer",
        time: "4:00 PM IST",
        date: tomorrow,
        type: "live",
        color: "rose",
      },
    ];
  }, []);

  // Search/Filters states
  const [courseSearch, setCourseSearch] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // ─── PLAYABLE QUIZ STATES ──────────────────────────────────────────────────
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // ─── AI PLAYGROUND HUB DIALOG STATES ───────────────────────────────────────
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantType, setAiAssistantType] = useState<"study" | "homework" | "quiz" | "roadmap" | "career" | null>(null);
  const [aiInputText, setAiInputText] = useState("");
  const [aiResultText, setAiResultText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim()) return;
    setAiLoading(true);
    setAiResultText("");

    try {
      const response = await AiService.chat(aiInputText, {
        module: aiAssistantType === "study" ? "study" :
                aiAssistantType === "homework" ? "doubt" :
                aiAssistantType === "quiz" ? "quiz" :
                aiAssistantType === "roadmap" ? "roadmap" : "doubt"
      });
      setAiResultText(response);
    } catch (err) {
      console.error("AI action query failure:", err);
      setAiResultText("⚠️ Sparky AI failed to load. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };;

  // ─── ASSIGNMENT SUBMISSION STATES ──────────────────────────────────────────
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // ─── REDEEM REWARDS MODAL STATES ───────────────────────────────────────────
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>([]);

  // ─── PROFILE EDIT FORM STATES ──────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "Surya",
    username: user?.username || "surya_learner",
    bio: user?.bio || "Enthusiastic developer learning keyboard, coding, and choreography.",
    country: user?.country || "India",
    language: user?.language || "English",
  });
  const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "Surya",
        username: user.username || "surya_learner",
        bio: user.bio || "Enthusiastic developer learning keyboard, coding, and choreography.",
        country: user.country || "India",
        language: user.language || "English",
      });
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  // ─── MOCK DATABASE STRUCTURES ──────────────────────────────────────────────


  // Live classes countdown card details
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([
    {
      id: "live-keyboard",
      title: "Interactive Practice: Keyboard Mudras & Chords",
      tutorName: "Aarav Sharma",
      time: "Today, 6:00 PM IST",
      countdown: "Starts in 1h 15m",
      duration: "60 mins",
      isEnrolled: true,
      hasLink: true,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      platform: "Google Meet",
    },
    {
      id: "live-physics",
      title: "Class 12 Physics: Electromagnetism Tuition Batch",
      tutorName: "Aarav Sharma",
      time: "Today, 7:30 PM IST",
      countdown: "Starts in 2h 45m",
      duration: "90 mins",
      isEnrolled: false,
      hasLink: true,
      meetingLink: "https://zoom.us/j/123456789",
      platform: "Zoom",
    },
    {
      id: "live-maths",
      title: "IIT-JEE Calculus Advanced Batch",
      tutorName: "Sneha Iyer",
      time: "Today, 8:45 PM IST",
      countdown: "Starts in 4h",
      duration: "60 mins",
      isEnrolled: true,
      hasLink: false,
      meetingLink: "",
      platform: "Google Meet",
    }
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eduearn_bookings");
      if (stored) {
        try {
          const booked = JSON.parse(stored);
          const mapped = booked.map((b: any, idx: number) => ({
            id: `booked-${idx}-${Date.now()}`,
            title: `Trial Session: ${b.courseTitle || "1-on-1 Mentorship"}`,
            tutorName: b.tutorName,
            time: `${b.date} @ ${b.time}`,
            countdown: "Scheduled Trial",
            duration: "60 mins",
            isEnrolled: true,
            hasLink: true,
            meetingLink: "https://meet.google.com/abc-defg-hij",
            platform: "Google Meet",
          }));
          setLiveClasses(prev => {
            // Filter out any duplicates based on title and time
            const filteredPrev = prev.filter(p => !mapped.some((m: any) => m.title === p.title && m.time === p.time));
            return [...mapped, ...filteredPrev];
          });
        } catch {}
      }
    }
  }, [user]);

  // ─── ECOSYSTEM CONNECTED WORKFLOW SYNC ───────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncEcosystemData = () => {
      try {
        const enrollments = EcosystemSync.getEnrollments();
        const assignmentsList = EcosystemSync.getAssignments();
        const sessionsList = EcosystemSync.getSessions();

        // 1. Map Enrollments
        if (enrollments.length > 0) {
          const mapped = enrollments.map((enr: any) => ({
            id: enr.courseId,
            title: enr.courseTitle,
            tutorName: enr.tutorName || "Rahul Sharma",
            thumbnail: "/images/categories/coding-v2.webp",
            progress: enr.progressPercent,
            lessonsCount: 10,
            completedLessons: Math.round((enr.progressPercent / 100) * 10),
            duration: "8 hours",
            estimatedCompletion: enr.progressPercent === 100 ? "Completed" : "In Progress",
            category: "💻 Coding",
            lastStudied: "Recently",
          }));
          setEnrolledCourses(mapped);
        }

        // 2. Map Assignments (Fetch from unified assignment service API)
        fetch("/api/student/assignments")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.assignments) {
              const mapped = data.assignments.map((item: any) => {
                const sub = item.submission || {};
                return {
                  id: item.id,
                  title: item.title,
                  courseTitle: item.courseTitle || "Enrolled Course",
                  dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No deadline",
                  status: sub.status || "Pending",
                  grade: sub.grade,
                  feedback: sub.feedback,
                  prompt: item.description || "Complete the practice challenge.",
                };
              });
              setAssignments(mapped);
            }
          })
          .catch((err) => console.warn("Failed to sync assignments:", err));

        // Sync Quizzes from API
        fetch("/api/student/quizzes")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.quizzes) {
              const mapped = data.quizzes.map((q: any) => ({
                id: q.id,
                title: q.title,
                subject: q.courseTitle || "General",
                difficulty: q.level || "Intermediate",
                questionsCount: q.totalQuestions || q.questions?.length || 3,
                timeLimit: `${q.duration || 5} mins`,
                rewardCoins: 50,
                questions: q.questions,
                latestAttempt: q.latestAttempt,
                passingScore: q.passingScore,
              }));
              setQuizzes(mapped);
            }
          })
          .catch((err) => console.warn("Failed to sync quizzes:", err));

        // Sync Certificates from API
        fetch("/api/student/certificates")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.certificates) {
              const mapped = data.certificates.map((cert: any) => ({
                id: cert.id,
                courseId: cert.courseId,
                courseTitle: cert.courseTitle || "Course Title",
                serialNumber: cert.certificateNumber,
                issueDate: new Date(cert.issuedAt).toLocaleDateString(),
                qrCode: cert.verificationCode,
                courseImage: "/images/courses/arts.png",
                tutorName: cert.instructor || "Tutor Instructor",
                blockchainHash: cert.pdfUrl,
              }));
              setCertificates(mapped);
            }
          })
          .catch((err) => console.warn("Failed to sync certificates:", err));

        // 3. Map Live Sessions
        if (sessionsList.length > 0) {
          const mappedSessions = sessionsList.map((ses: any) => ({
            id: ses.id,
            title: ses.courseTitle,
            tutorName: ses.tutorName,
            time: ses.dateTime,
            countdown: "Scheduled",
            duration: "60 mins",
            isEnrolled: true,
            hasLink: true,
            meetingLink: ses.meetingLink,
            platform: "Google Meet",
          }));
          setLiveClasses(mappedSessions);
        }

        // Sync Profile & Stats from API
        fetch("/api/student/profile")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              if (data.profile) {
                setProfileForm({
                  fullName: data.profile.fullName || "Rahul Sharma",
                  username: data.profile.username || "rahul_learner",
                  bio: data.profile.bio || "",
                  country: data.profile.country || "India",
                  language: data.profile.language || "English",
                });
                if (data.profile.avatarUrl) {
                  setAvatarPreview(data.profile.avatarUrl);
                }
              }
              if (data.stats) {
                setStats(data.stats);
                if (data.stats.currentLearningStreak) {
                  setStreak(data.stats.currentLearningStreak);
                }
              }
            }
          })
          .catch((err) => console.warn("Failed to sync profile and stats:", err));

      } catch (err) {
        console.warn("Ecosystem sync failed:", err);
      }
    };

    syncEcosystemData();
    window.addEventListener("storage", syncEcosystemData);
    return () => window.removeEventListener("storage", syncEcosystemData);
  }, []);

  const upcomingClasses: LiveClass[] = [
    {
      id: "live-dance",
      title: "Kuchipudi Dance: Mudras Coordination",
      tutorName: "Sneha Iyer",
      time: "Tomorrow, 4:00 PM IST",
      countdown: "Starts in 22h 15m",
      duration: "45 mins",
    },
    {
      id: "live-python",
      title: "Advanced Python Algorithms & recursion",
      tutorName: "Vikram Rathore",
      time: "Friday, 5:00 PM IST",
      countdown: "Starts in 2 days",
      duration: "90 mins",
    },
  ];

  const pastClasses = [
    { title: "Calculus Derivatives & Limits Set", tutorName: "Priya Patel", date: "June 28, 2026", status: "Completed" },
    { title: "Figma Autolayout and responsive grids", tutorName: "Karan Malhotra", date: "June 25, 2026", status: "Completed" },
  ];

  const recordedSessions = [
    { title: "Keyboard Session: Minor scale progressions", tutor: "Aarav Sharma", duration: "48 mins", id: "rec-1" },
    { title: "Photography Session: Mastering Exposure values", tutor: "Anjali Deshmukh", duration: "55 mins", id: "rec-2" },
    { title: "Python Basics: Dictionaries & comprehension", tutor: "Vikram Rathore", duration: "62 mins", id: "rec-3" },
  ];

  // Interactive Quiz Start
  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setQuizResult(null);

    const saved = localStorage.getItem(`eduearn_quiz_progress_${quiz.id}`);
    if (saved) {
      try {
        setSelectedAnswers(JSON.parse(saved));
        toast.info(`Resumed ${quiz.title}`);
      } catch {
        setSelectedAnswers({});
        toast.info(`Started ${quiz.title}`);
      }
    } else {
      setSelectedAnswers({});
      toast.info(`Started ${quiz.title}`);
    }

    const duration = quiz.duration || (quiz.timeLimit ? parseInt(quiz.timeLimit) : 5);
    setTimeLeft(duration * 60);
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (!activeQuiz) return;
    const q = activeQuiz.questions[currentQuestionIdx];
    let updatedVal: any;

    if (q.type === "multiple") {
      const current = Array.isArray(selectedAnswers[currentQuestionIdx])
        ? (selectedAnswers[currentQuestionIdx] as any as number[])
        : [];
      if (current.includes(optionIdx)) {
        updatedVal = current.filter((idx) => idx !== optionIdx);
      } else {
        updatedVal = [...current, optionIdx];
      }
    } else {
      updatedVal = optionIdx;
    }

    const updated = {
      ...selectedAnswers,
      [currentQuestionIdx]: updatedVal,
    };
    setSelectedAnswers(updated);
    localStorage.setItem(`eduearn_quiz_progress_${activeQuiz.id}`, JSON.stringify(updated));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsUploading(true);
    try {
      const res = await fetch(`/api/student/quizzes/${activeQuiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit quiz.");
      }

      const data = await res.json();
      const attempt = data.attempt;

      setQuizResult({
        score: attempt.score,
        totalQuestions: activeQuiz.questionsCount || activeQuiz.questions.length,
        percentage: attempt.percentage,
        passed: attempt.passed,
        submitted: true,
      });

      localStorage.removeItem(`eduearn_quiz_progress_${activeQuiz.id}`);

      if (attempt.passed) {
        addCoins(50, `Completed Quiz: ${activeQuiz.title}`);
        toast.success(`Passed! You earned 50 EduEarn Coins and XP!`);
      } else {
        toast.info(`Quiz completed. Score: ${attempt.percentage}%. Passing score is ${activeQuiz.passingScore}%.`);
      }

      const quizRes = await fetch("/api/student/quizzes");
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        const mapped = quizData.quizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          subject: q.courseTitle || "General",
          difficulty: q.level || "Intermediate",
          questionsCount: q.totalQuestions || q.questions?.length || 3,
          timeLimit: `${q.duration || 5} mins`,
          rewardCoins: 50,
          questions: q.questions,
          latestAttempt: q.latestAttempt,
          passingScore: q.passingScore,
        }));
        setQuizzes(mapped);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit quiz.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (timeLeft === null || !activeQuiz || quizResult) return;
    if (timeLeft <= 0) {
      toast.warning("Time is up! Auto-submitting your quiz.");
      handleSubmitQuiz();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, activeQuiz, quizResult]);

  const handleUploadAssignment = async (id: string) => {
    if (!selectedFile) {
      toast.error("Please enter a file name to submit.");
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch(`/api/student/assignments/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionUrl: selectedFile, submissionType: "file" }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit assignment.");
      }

      // Reload assignments list
      const listRes = await fetch("/api/student/assignments");
      if (listRes.ok) {
        const data = await listRes.json();
        const mapped = (data.assignments || []).map((item: any) => {
          const sub = item.submission || {};
          return {
            id: item.id,
            title: item.title,
            courseTitle: item.courseTitle || "Enrolled Course",
            dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No deadline",
            status: sub.status || "Pending",
            grade: sub.grade,
            feedback: sub.feedback,
            prompt: item.description || "Complete the practice challenge.",
          };
        });
        setAssignments(mapped);
      }

      setIsUploading(false);
      setSelectedFile("");
      setExpandedAssignmentId(null);
      addCoins(100, `Assignment Submission: ${id}`);
      toast.success("Assignment submitted successfully! +100 Coins added.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit assignment.");
      setIsUploading(false);
    }
  };

  const handleClaimCertificate = async (courseId: string) => {
    setIsUploading(true);
    try {
      const res = await fetch("/api/student/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate certificate.");
      }

      toast.success("Congratulations! Certificate generated successfully!");

      // Reload certificates list
      const certRes = await fetch("/api/student/certificates");
      if (certRes.ok) {
        const certData = await certRes.json();
        const mapped = certData.certificates.map((cert: any) => ({
          id: cert.id,
          courseId: cert.courseId,
          courseTitle: cert.courseTitle || "Course Title",
          serialNumber: cert.certificateNumber,
          issueDate: new Date(cert.issuedAt).toLocaleDateString(),
          qrCode: cert.verificationCode,
          courseImage: "/images/courses/arts.png",
          tutorName: cert.instructor || "Tutor Instructor",
          blockchainHash: cert.pdfUrl,
        }));
        setCertificates(mapped);
      }
      setActiveTab("certificates");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to claim certificate.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile.");
      }

      const data = await res.json();
      
      // Update global completeProfile state too
      await completeProfile(profileForm, avatarFile || undefined);
      
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile.");
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.new || passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    toast.success("Password updated securely!");
    setPasswordForm({ old: "", new: "", confirm: "" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRedeem = (cost: number, code: string, rewardName: string) => {
    if (coins < cost) {
      toast.error("Insufficient EduEarn Coins balance!");
      return;
    }
    setCoins((prev) => {
      const next = prev - cost;
      if (typeof window !== "undefined") {
        localStorage.setItem("eduearn_coins", String(next));
      }
      return next;
    });
    setRedeemedCodes((prev) => [...prev, code]);
    toast.success(`Successfully redeemed ${rewardName}! Code: ${code}`);
  };

  const enrollWishlist = (course: typeof MOCK_COURSES[number]) => {
    setWishlist((prev) => prev.filter((c) => c.id !== course.id));
    const newEnrolled: EnrolledCourse = {
      id: course.id,
      title: course.title,
      tutorName: course.tutorName,
      thumbnail: course.thumbnail,
      progress: 0,
      lessonsCount: 12,
      completedLessons: 0,
      duration: course.duration || "10 hours",
      estimatedCompletion: course.duration || "10 hours left",
      category: course.category,
      lastStudied: "Just now",
    };
    setEnrolledCourses((prev) => [...prev, newEnrolled]);
    toast.success(`Enrolled in ${course.title}! Welcome to the course.`);
  };

  // ─── NAV ITEMS ─────────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-courses", label: "My Courses & Batches", icon: BookOpen },
    { id: "live-classes", label: "Today's Live Classes", icon: Calendar },
    { id: "ai-hub", label: "Sparky AI Hub", icon: Sparkles },
    { id: "notes", label: "My Notes Library", icon: Notebook },
    { id: "quizzes", label: "Quizzes", icon: HelpCircle },
    { id: "attendance", label: "Attendance Record", icon: CheckCircle },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "downloads", label: "Downloads", icon: Download },
    { id: "career-hub", label: "Career Hub", icon: Briefcase },
    { id: "referral", label: "Refer & Earn", icon: Gift },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Profile & Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex select-none text-left relative">
      {/* 1. SIDEBAR (Collapsible Desktop / Mobile Drawer) */}
      <aside
        className={`sidebar-surface backdrop-blur-md hidden md:flex flex-col transition-all duration-300 fixed top-0 left-0 bottom-0 h-screen z-50 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 bg-primary text-white border border-primary/20 rounded-full p-1 cursor-pointer hover:opacity-90 shadow-soft focus:outline-none z-50"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className="p-4 border-b border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 relative overflow-hidden select-none">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profileForm.fullName.charAt(0)
            )}
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <h4 className="text-sm font-heading font-extrabold truncate">{profileForm.fullName}</h4>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                Level {learningLevel === "Beginner" ? "1" : learningLevel === "Intermediate" ? "2" : learningLevel === "Advanced" ? "3" : learningLevel === "Expert" ? "4" : "5"} ({learningLevel})
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-button text-xs font-semibold cursor-pointer transition-colors focus:outline-none w-full ${
                  isActive
                    ? "bg-primary text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/40">
          <button
            onClick={async () => {
              await logout();
              toast.success("Signed out securely.");
              router.push("/login");
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-button text-xs font-semibold text-destructive hover:bg-destructive/5 transition-colors cursor-pointer w-full focus:outline-none"
          >
            <X size={16} className="shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER NAVIGATION */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 flex flex-col md:hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      profileForm.fullName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{profileForm.fullName}</h4>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary">
                      {learningLevel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-button cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-button text-xs font-semibold cursor-pointer transition-colors w-full ${
                        isActive
                          ? "bg-primary text-white shadow-soft"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className={`flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300 pt-20 ${
        isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
      }`}>
        {/* Top dashboard header bar */}
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between navbar-surface-blur relative z-30 shrink-0 select-none">
          <div className="flex items-center gap-3 md:gap-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-muted rounded-button cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-heading font-extrabold tracking-tight capitalize">
              {activeTab.replace("-", " ")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* XP Coins Badge info */}
            <div className="flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary rounded-full px-2.5 py-1 text-xs font-bold shadow-soft">
              <Award size={13} className="text-primary fill-current" />
              <span>Level {learningLevel === "Beginner" ? "1" : learningLevel === "Intermediate" ? "2" : learningLevel === "Advanced" ? "3" : learningLevel === "Expert" ? "4" : "5"}</span>
            </div>

            <div className="flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2.5 py-1 text-xs font-bold shadow-soft animate-pulse">
              <Flame size={13} className="fill-current" />
              <span>{streak} Day Streak</span>
            </div>

            <div className="flex items-center gap-1.5 border border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full px-2.5 py-1 text-xs font-bold shadow-soft">
              <Wallet size={13} className="fill-current" />
              <span>{coins} Coins</span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background relative z-10 scroll-smooth">
          <AnimatePresence mode="wait">
            {/* TAB: DASHBOARD HOME (DEFAULT) */}
            {activeTab === "dashboard" && isLoading && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="xl:col-span-2 h-44 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
                  <div className="h-44 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="h-20 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-5 w-40 bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="h-36 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
                    <div className="h-36 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
                    <div className="h-36 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dashboard" && !isLoading && (
              <motion.div
                key="tab-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* 1. PERSONALIZED DASHBOARD */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <Card variant="glass" className="xl:col-span-2 p-6 welcome-card-surface flex items-center justify-between relative overflow-hidden">
                    <div className="space-y-3.5 relative z-10">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary">
                        {welcomeGreeting}
                      </span>
                      <h2 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
                        {welcomeGreeting}, {profileForm.fullName} 👋
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 mt-2 border-t border-border/30 pt-4 text-xs font-semibold text-muted-foreground">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-extrabold block">Today&apos;s Goal</span>
                          <span className="text-foreground font-bold text-xs mt-0.5 block">Complete Python Module 3</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-extrabold block">Next Live Class</span>
                          <span className="text-foreground font-bold text-xs mt-0.5 block">Today • 6:00 PM (1h 15m left)</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-extrabold block">Next Assignment Due</span>
                          <span className="text-foreground font-bold text-xs mt-0.5 block">Task 2: Calculus Limits due in 2 days</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-extrabold block">Weekly Progress</span>
                          <span className="text-foreground font-bold text-xs mt-0.5 block">6 of 8 activities completed</span>
                        </div>
                      </div>
                    </div>
                    <Sparkles size={48} className="text-primary/20 shrink-0 hidden sm:block relative z-10" />
                  </Card>

                  {/* Level Progress Gauge */}
                  <Card variant="glass" className="p-6 border-primary/15 bg-card flex flex-col justify-between shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary">
                        Level Progression
                      </span>
                      <span className="text-xs font-extrabold text-foreground">{learningLevel}</span>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-[10px] font-bold text-muted-foreground">{xp} / {nextLevelXp} XP</span>
                        <span className="text-[10px] font-bold text-primary">{levelProgressPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${levelProgressPercent}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-1">Complete quizzes &amp; view lessons to level up.</p>
                    </div>
                  </Card>
                </div>

                {/* 1.5 STUDENT STATS METRICS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 select-none">
                  <Card variant="glass" className="p-4 flex flex-col items-center justify-center text-center shadow-soft border-border/50 bg-card">
                    <span className="text-lg">🏆</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-wider mt-1.5">Completed</span>
                    <span className="text-sm font-black text-foreground mt-0.5">{stats.completedCourses} Courses</span>
                  </Card>
                  <Card variant="glass" className="p-4 flex flex-col items-center justify-center text-center shadow-soft border-border/50 bg-card">
                    <span className="text-lg">📚</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-wider mt-1.5">Active</span>
                    <span className="text-sm font-black text-foreground mt-0.5">{stats.enrolledCourses} Courses</span>
                  </Card>
                  <Card variant="glass" className="p-4 flex flex-col items-center justify-center text-center shadow-soft border-border/50 bg-card">
                    <span className="text-lg">✅</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-wider mt-1.5">Streak</span>
                    <span className="text-sm font-black text-foreground mt-0.5">{streak} Days</span>
                  </Card>
                  <Card variant="glass" className="p-4 flex flex-col items-center justify-center text-center shadow-soft border-border/50 bg-card">
                    <span className="text-lg">⏱️</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-wider mt-1.5">Hours</span>
                    <span className="text-sm font-black text-foreground mt-0.5">{stats.totalLearningHours} Hrs</span>
                  </Card>
                  <Card variant="glass" className="p-4 flex flex-col items-center justify-center text-center shadow-soft border-border/50 bg-card">
                    <span className="text-lg">📝</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-wider mt-1.5">Assignments</span>
                    <span className="text-sm font-black text-foreground mt-0.5">{assignments.filter(a => a.status !== "Pending").length} Done</span>
                  </Card>
                  <Card variant="glass" className="p-4 flex flex-col items-center justify-center text-center shadow-soft border-border/50 bg-card">
                    <span className="text-lg">📜</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-wider mt-1.5">Certificates</span>
                    <span className="text-sm font-black text-foreground mt-0.5">{stats.certificatesEarned} Earned</span>
                  </Card>
                  <Card variant="glass" className="p-4 flex flex-col items-center justify-center text-center shadow-soft border-border/50 bg-card">
                    <span className="text-lg">📅</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-wider mt-1.5">Quizzes</span>
                    <span className="text-sm font-black text-foreground mt-0.5">{quizzes.filter(q => !!q.latestAttempt).length} Passed</span>
                  </Card>
                  <Card variant="glass" className="p-4 flex flex-col items-center justify-center text-center shadow-soft border-border/50 bg-card">
                    <span className="text-lg">📈</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-wider mt-1.5">Overall Progress</span>
                    <span className="text-sm font-black text-foreground mt-0.5">{stats.completionRate}%</span>
                  </Card>
                </div>

                {/* 2. CONTINUE LEARNING */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                      Continue Learning
                    </h3>
                    <Button onClick={() => setActiveTab("my-courses")} variant="ghost" size="sm" className="text-xs text-primary font-bold">
                      View all courses
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledCourses.slice(0, 3).map((course) => (
                      <div
                        key={course.id}
                        className="card-surface p-4 rounded-card flex flex-col gap-3 hover:shadow-floating hover:translate-y-[-2px] transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 relative overflow-hidden select-none">
                            <BookOpen size={20} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[8px] font-extrabold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              {course.category}
                            </span>
                            <h4 className="text-xs font-bold truncate mt-1 text-foreground" title={course.title}>
                              {course.title}
                            </h4>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Tutor: {course.tutorName} · Last Studied: {course.lastStudied}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                            <span>Progress: {course.progress}%</span>
                            <span>{course.completedLessons}/{course.lessonsCount} lessons</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-1">
                          <span className="text-[9px] font-bold text-muted-foreground/80 bg-muted px-2 py-0.5 rounded">
                            {course.estimatedCompletion}
                          </span>
                          <Button
                            onClick={() => router.push(`/student/courses/${course.id}/learn`)}
                            size="sm"
                            className="h-8 gap-1"
                          >
                            <PlayCircle size={13} />
                            Resume
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. SPARKY AI ANALYTICS & INSIGHTS (Phase 11.3 / 11.4) */}
                <Card variant="glass" className="p-6 border-primary/20 bg-card space-y-4 text-left shadow-soft">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-primary animate-pulse" />
                      <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                        ✨ Sparky AI Learning Analytics & Recommendations
                      </h3>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black">
                      AI Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Weekly Study Hours & Attendance Trend */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground">📈 Study Hours & Attendance Trends</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                          <span>Weekly Goal: 15 Hrs</span>
                          <span>12 Hrs Logged (80%)</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "80%" }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground font-semibold pt-1">
                          <span>Mon: 2h</span>
                          <span>Tue: 3h</span>
                          <span>Wed: 4h</span>
                          <span>Thu: 1h</span>
                          <span>Fri: 2h</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Attendance rate is at 91.6% — exceeding class requirements.</p>
                    </div>

                    {/* Weak Topic Detection */}
                    <div className="space-y-3 border-t lg:border-t-0 lg:border-x border-border/30 pt-4 lg:pt-0 lg:px-6">
                      <h4 className="text-xs font-bold text-foreground">⚠️ Weak-Topic Detection & Quiz Performance</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-foreground">Recursion Base Cases</span>
                          <span className="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded text-[8px] font-bold">Needs Focus (45%)</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-foreground">React useEffect cleanup</span>
                          <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded text-[8px] font-bold">Review (68%)</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-foreground">Python Dict comprehensions</span>
                          <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[8px] font-bold">Mastered (90%)</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Personalized Recommendation */}
                    <div className="space-y-3 pt-4 lg:pt-0">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        💡 Sparky Recommendations
                      </h4>
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-[10px] leading-relaxed text-muted-foreground">
                        <strong className="text-foreground block mb-1">🎯 Action Item:</strong>
                        Take the 5-minute quiz on <strong>Recursion Base Cases</strong> today to boost your mastery to Intermediate. We recommend scheduling a 1-on-1 session with tutor Sneha Iyer if you need extra guidance.
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Dashboard bottom layout cards split */}
                <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6">
                  {/* Left block: Live classes countdown & interactive calendar */}
                  <div className="space-y-6">
                    {/* Live Countdown & Join card */}
                    <Card variant="glass" className="p-5 border border-rose-500/25 dark:bg-card/65 bg-card flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-soft">
                      <div className="space-y-1.5 text-left">
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded inline-block">
                          Starts In
                        </span>
                        <h4 className="text-xl font-heading font-extrabold text-foreground mt-1">
                          {formattedCountdown}
                        </h4>
                        <p className="text-xs text-muted-foreground font-semibold">
                          🎹 Keyboard Practice Session with Aarav Sharma
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-2 font-medium">
                          <span>Teacher: Aarav Sharma</span>
                          <span>·</span>
                          <span>Duration: 60 mins</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                        <Button onClick={() => navigateToClassroom(router, "live-keyboard")} className="bg-rose-500 hover:bg-rose-600 border-rose-500 text-white gap-2 text-xs h-10 w-full md:w-auto">
                          <Calendar size={14} /> Join Live Class
                        </Button>
                        <span className="text-[9px] text-muted-foreground text-center flex items-center justify-center gap-1 font-semibold">
                          <Activity size={10} className="text-emerald-500" /> Hosted on Google Meet classroom
                        </span>
                      </div>
                    </Card>

                    {/* Interactive Calendar view details */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                        Interactive Calendar
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CalendarView 
                          events={calendarEvents} 
                          selectedDate={selectedDate} 
                          onSelectDate={setSelectedDate} 
                        />
                        
                        {/* Custom date events render panel */}
                        <Card variant="default" className="p-5 flex flex-col gap-4 text-left border-border bg-card">
                          <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground border-b border-border/60 pb-1.5">
                            Events for {selectedDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </h4>
                          <div className="flex flex-col gap-3 grow overflow-y-auto">
                            {dateEventsList.map((evt, idx) => (
                              <div key={idx} className="p-3 event-row-surface rounded-card flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-extrabold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                    {evt.type}
                                  </span>
                                  <span className="text-[9px] font-semibold text-muted-foreground">{evt.time}</span>
                                </div>
                                <span className="text-xs font-bold text-foreground mt-1 leading-snug">{evt.title}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Right block: Quick actions & Hackathons */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card variant="default" className="p-5 shadow-soft border-border bg-card flex flex-col gap-4">
                      <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Button onClick={() => router.push("/courses")} size="sm" variant="outline" className="w-full justify-between font-bold text-xs h-9">
                          Explore Skills <ArrowUpRight size={14} />
                        </Button>
                        <Button onClick={() => setActiveTab("live-classes")} size="sm" variant="outline" className="w-full justify-between font-bold text-xs h-9">
                          Join Live Class <ArrowUpRight size={14} />
                        </Button>
                        <Button onClick={() => router.push("/tutors")} size="sm" variant="outline" className="w-full justify-between font-bold text-xs h-9">
                          Browse Tutors <ArrowUpRight size={14} />
                        </Button>
                        <Button onClick={() => setActiveTab("quizzes")} size="sm" variant="outline" className="w-full justify-between font-bold text-xs h-9">
                          Attempt Weekly Quiz <ArrowUpRight size={14} />
                        </Button>
                        <Button onClick={() => router.push("/tutor/onboarding")} size="sm" variant="outline" className="w-full justify-between font-bold text-xs h-9">
                          Become Tutor <ArrowUpRight size={14} />
                        </Button>
                        <Button onClick={() => setActiveTab("certificates")} size="sm" variant="outline" className="w-full justify-between font-bold text-xs h-9">
                          View Certificates <ArrowUpRight size={14} />
                        </Button>
                      </div>
                    </Card>

                    {/* Hackathons & Updates */}
                    <Card variant="default" className="p-5 shadow-soft border-border bg-card flex flex-col gap-4">
                      <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
                        Hackathons &amp; Updates
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[8px] font-extrabold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Event
                          </span>
                          <h5 className="text-[11px] font-bold text-foreground leading-snug">
                            EduEarn Hackathon 2026 registration open
                          </h5>
                          <p className="text-[9px] text-muted-foreground">Form peer groups of 3 and build coding widgets to win ₹50,000 cash prizes.</p>
                        </div>
                        <div className="h-px w-full bg-border/40" />
                        <div className="space-y-1">
                          <span className="text-[8px] font-extrabold uppercase bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                            Reward
                          </span>
                          <h5 className="text-[11px] font-bold text-foreground leading-snug">
                            Leaderboard reset on the 1st of every month
                          </h5>
                          <p className="text-[9px] text-muted-foreground">Resets at 00:00 AM IST. Top 3 students receive custom verified badges &amp; 500 Coins.</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* 10. RECOMMENDED LEARNING */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-primary fill-current" />
                    <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                      Recommended Learning
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "DSLR Photography Masterclass", category: "📸 Photography", tutor: "Anjali Deshmukh", reason: "Because you completed Pencil Sketching & Drawing", subjectId: "photography" },
                      { title: "Advanced Python Algorithms", category: "💻 Python Programming", tutor: "Vikram Rathore", reason: "Because you enrolled in AI Prompt Engineering", subjectId: "python" },
                      { title: "Kuchipudi Dance: Advanced Mudras", category: "💃 Kuchipudi Dance", tutor: "Sneha Iyer", reason: "Because you viewed Kuchipudi Dance Performance", subjectId: "kuchipudi" },
                    ].map((item, i) => {
                      const matchedCourse = MOCK_COURSES.find((c) => c.subjectId === item.subjectId);
                      const targetId = matchedCourse ? matchedCourse.id : "course-1";
                      return (
                        <Card
                          key={i}
                          variant="glass"
                          className="p-4 shadow-soft border hover:border-primary/50 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/courses/${targetId}`)}
                        >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                        <div className="space-y-1">
                          <span className="text-[8px] font-extrabold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block">
                            {item.category}
                          </span>
                          <h3 className="font-heading font-bold text-xs text-foreground mt-1.5 line-clamp-1">{item.title}</h3>
                          <p className="text-[10px] text-muted-foreground">Tutor: {item.tutor}</p>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-2 italic font-semibold">{item.reason}</p>
                        <Button className="w-full text-[10px] h-8 mt-1 z-10 shadow-soft gap-1">
                          Explore Course <ArrowUpRight size={13} />
                        </Button>
                      </Card>
                    );
                  })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: MY COURSES */}
            {activeTab === "my-courses" && (
              <motion.div
                key="tab-my-courses"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-2 border border-border rounded-button bg-card px-3 py-1.5 w-full sm:max-w-xs shadow-soft">
                    <Search size={16} className="text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Search enrolled courses..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 select-none">
                    {[
                      { id: "all", label: "All" },
                      { id: "in-progress", label: "In Progress" },
                      { id: "completed", label: "Completed" },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setCourseFilter(btn.id)}
                        className={`px-3 py-1.5 border rounded-button text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                          courseFilter === btn.id
                            ? "bg-primary border-primary text-white"
                            : "border-border text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledCourses
                    .filter((c) => c.title.toLowerCase().includes(courseSearch.toLowerCase()))
                    .filter((c) => {
                      if (courseFilter === "in-progress") return c.progress < 100;
                      if (courseFilter === "completed") return c.progress === 100;
                      return true;
                    })
                    .map((course) => (
                      <div
                        key={course.id}
                        className="card-surface p-4 rounded-card flex flex-col gap-3 hover:translate-y-[-2px] transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 relative overflow-hidden">
                            <BookOpen size={20} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-extrabold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              {course.category}
                            </span>
                            <h4 className="text-xs font-bold truncate mt-1.5 text-foreground" title={course.title}>
                              {course.title}
                            </h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">by {course.tutorName}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                            <span>Progress: {course.progress}%</span>
                            <span>{course.completedLessons}/{course.lessonsCount} lessons</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-1">
                          <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                            <Clock size={11} />
                            {course.duration}
                          </span>
                          <div className="flex gap-1.5">
                            {course.progress === 100 && !certificates.some((cert) => cert.courseId === course.id || cert.id === course.id) && (
                              <Button
                                onClick={() => handleClaimCertificate(course.id)}
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold"
                              >
                                Claim Cert
                              </Button>
                            )}
                            <Button
                              onClick={() => router.push(`/student/courses/${course.id}/learn`)}
                              size="sm"
                              className="h-8 gap-1 text-[10px]"
                            >
                              View Course
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* TAB: LIVE CLASSES */}
            {activeTab === "live-classes" && (
              <motion.div
                key="tab-live-classes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Countdown classroom join card */}
                {liveClasses.length === 0 ? (
                  <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Calendar size={32} className="text-muted-foreground/60" />
                    <h3 className="text-xs font-bold text-foreground">No classes scheduled today.</h3>
                    <Link href="/courses">
                      <Button size="sm" className="text-[10px] font-bold">Browse Monthly Tuition</Button>
                    </Link>
                  </Card>
                ) : (
                  liveClasses.map((item) => {
                    const isEnrolled = item.isEnrolled;
                    return (
                      <Card key={item.id} variant="glass" className={`p-6 border ${isEnrolled ? "border-rose-500/25" : "border-border/80"} dark:bg-card/65 bg-card flex flex-col gap-6 relative overflow-hidden shadow-soft text-left`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isEnrolled ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                                {isEnrolled ? "Enrolled Batch" : "Featured Live Batch"}
                              </span>
                              {!isEnrolled && (
                                <span className="text-[9px] font-bold text-primary">₹599/month</span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-foreground mt-1">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2 font-semibold">
                              <span>Tutor: {item.tutorName}</span>
                              <span>·</span>
                              <span>Duration: {item.duration}</span>
                              <span>·</span>
                              <span>Time: {item.time}</span>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto text-center items-center justify-center">
                            {isEnrolled ? (
                              item.hasLink ? (
                                <>
                                  <a href={item.meetingLink} target="_blank" rel="noreferrer">
                                    <Button className="bg-rose-500 hover:bg-rose-600 border-rose-500 text-white gap-2 w-full md:w-auto text-xs font-bold px-4 py-2 shadow-soft">
                                      Join Class
                                    </Button>
                                  </a>
                                  <span className="text-[9px] text-muted-foreground font-semibold">
                                    Live on {item.platform}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded text-center max-w-[200px] leading-tight">
                                  Meet link will be published 10m before class
                                </span>
                              )
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => toast.success(`Redirected to enrollment details for ${item.title}`)}
                                className="bg-primary hover:bg-primary/95 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 shadow-soft"
                              >
                                Enroll Now
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Condition-specific detailed section */}
                        {isEnrolled ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/30 text-xs">
                            <div className="p-2.5 bg-muted/15 border border-border/40 rounded-xl">
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground block">Countdown</span>
                              <span className="font-bold text-foreground mt-0.5 block">{item.countdown || "Today"}</span>
                            </div>
                            <div className="p-2.5 bg-muted/15 border border-border/40 rounded-xl">
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground block">Attendance Rate</span>
                              <span className="font-bold text-emerald-500 mt-0.5 block">94.5%</span>
                            </div>
                            <div className="p-2.5 bg-muted/15 border border-border/40 rounded-xl">
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground block">Pending Assignment</span>
                              <span className="font-bold text-amber-500 mt-0.5 block">1 Homework</span>
                            </div>
                            <div className="p-2.5 bg-muted/15 border border-border/40 rounded-xl flex items-center justify-between gap-1">
                              <div className="text-left">
                                <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground block">Study Notes</span>
                                <span className="text-[9px] font-bold text-foreground mt-0.5 block">Download PDF</span>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => toast.success("Study notes downloaded!")} className="h-6 px-1 text-[10px] text-primary">
                                Get
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/30 text-xs font-semibold text-muted-foreground">
                            <div>🗓️ Schedule: Mon, Wed, Fri</div>
                            <div>📚 Syllabus: 12 Modules</div>
                            <div>🤝 Peer Group: 15 Active Learners</div>
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}

                {/* Upcoming classes grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                    Upcoming Classes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingClasses.map((item) => (
                      <Card key={item.id} variant="default" className="p-5 border-border bg-card flex flex-col justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-extrabold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Upcoming
                          </span>
                          <h4 className="text-xs font-bold text-foreground mt-1">{item.title}</h4>
                          <p className="text-[10px] text-muted-foreground">Tutor: {item.tutorName} · Time: {item.time}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-1 text-[10px] font-semibold text-muted-foreground">
                          <span>Duration: {item.duration}</span>
                          <Button size="sm" variant="outline" onClick={() => toast.success(`Reminder set for ${item.title}`)} className="h-8">
                            Set Reminder
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Past Classes & Recorded Sessions lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card variant="default" className="p-5 border-border bg-card flex flex-col gap-4">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
                      Past Class History
                    </h4>
                    <div className="flex flex-col gap-3">
                      {pastClasses.map((item, idx) => (
                        <div key={idx} className="p-3 bg-muted/40 border border-border/60 rounded-card flex items-center justify-between select-none">
                          <div className="text-left">
                            <span className="text-[10px] font-bold text-foreground block">{item.title}</span>
                            <span className="text-[8px] text-muted-foreground mt-0.5 block">Tutor: {item.tutorName} · {item.date}</span>
                          </div>
                          <span className="text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card variant="default" className="p-5 border-border bg-card flex flex-col gap-4">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
                      Recorded Archives
                    </h4>
                    <div className="flex flex-col gap-3">
                      {recordedSessions.map((item) => (
                        <div key={item.id} className="p-3 bg-muted/40 border border-border/60 rounded-card flex items-center justify-between select-none">
                          <div className="text-left">
                            <span className="text-[10px] font-bold text-foreground block">{item.title}</span>
                            <span className="text-[8px] text-muted-foreground mt-0.5 block">Tutor: {item.tutor} · Duration: {item.duration}</span>
                          </div>
                          <Button size="sm" onClick={() => toast.success(`Loading recorded video player for ${item.title}...`)} className="h-7 text-[8px] px-2">
                            <PlayCircle size={10} /> Play
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* TAB: AI LEARNING HUB */}
            {activeTab === "ai-hub" && (
              <motion.div
                key="tab-ai-hub"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: "study", title: "AI Study Assistant", desc: "Ask custom queries on your enrolled subjects and receive peer-style conceptual tutoring explanations.", icon: <Sparkles size={20} className="text-primary" /> },
                    { id: "homework", title: "AI Homework Helper", desc: "Input assignment problems and worksheets to generate hints, checklists, and outline suggestions.", icon: <FileText size={20} className="text-sky-500" /> },
                    { id: "quiz", title: "AI Quiz Generator", desc: "Input any syllabus topic (e.g. recursion, Mudras) and generate a custom 3-question MCQ mock quiz.", icon: <HelpCircle size={20} className="text-emerald-500" /> },
                    { id: "roadmap", title: "AI Learning Roadmap", desc: "Build a structured weeks-wise pathway to master coding libraries, dance, photography, or music.", icon: <TrendingUp size={20} className="text-purple-500" /> },
                    { id: "career", title: "AI Career Guidance", desc: "Analyze your progress, check industry salary values, and suggest student-tutoring or internship roles.", icon: <Award size={20} className="text-amber-500" /> },
                  ].map((item) => (
                    <Card key={item.id} variant="default" className="p-5 border-border bg-card flex flex-col justify-between h-full hover:translate-y-[-2px] transition-all duration-300 shadow-soft">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <h4 className="text-xs font-bold text-foreground mt-2">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                      <Button
                        onClick={() => {
                          setAiAssistantType(item.id as "study" | "homework" | "quiz" | "roadmap" | "career");
                          setAiInputText("");
                          setAiResultText("");
                          setAiAssistantOpen(true);
                        }}
                        size="sm"
                        className="mt-4 text-[10px] h-8 gap-1.5"
                      >
                        Launch Tool <ArrowUpRight size={13} />
                      </Button>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: MY NOTES LIBRARY */}
            {activeTab === "notes" && (
              <motion.div
                key="tab-notes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <Card variant="glass" className="p-6 border-primary/20 bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-6 select-none">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary">
                      AI Study Companion
                    </span>
                    <h3 className="text-base font-heading font-extrabold text-foreground">
                      Personal Notes Library & Workspace
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">
                      Review all saved flashcards, quizzes, study notes, and conceptual breakdown summaries generated by the AI Learning Hub. Export your notes to PDF or edit them anytime.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/notes")}
                    className="gap-1.5 h-10 px-5 shrink-0"
                  >
                    Open Notes Library <ArrowUpRight size={14} />
                  </Button>
                </Card>

                {/* Empty State for saved study notes */}
                <EmptyState
                  type="default"
                  title="No saved study notes in local cache"
                  description="Generate conceptual breakdowns or flashcard summaries inside the Sparky AI Hub and save them to your workspace."
                  action={
                    <Button onClick={() => setActiveTab("ai-hub")}>
                      Go to Sparky AI Hub
                    </Button>
                  }
                />
              </motion.div>
            )}

            {/* TAB: WEEKLY QUIZZES */}
            {activeTab === "quizzes" && (
              <motion.div
                key="tab-quizzes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {!activeQuiz ? (
                  <div className="space-y-4">
                    <Card variant="glass" className="p-5 border border-amber-500/20 dark:bg-amber-500/5 bg-white select-none">
                      <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        Weekly Challenge
                      </span>
                      <h4 className="text-sm font-heading font-extrabold text-foreground mt-1">
                        Attempt Quiz Challenges to Earn EduEarn Coins!
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        Earn up to 60 EduEarn Coins per perfect quiz. Resets every week. Maximize learning streak!
                      </p>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(quizzes.length > 0 ? quizzes : WEEKLY_QUIZZES).map((quiz) => {
                        const inProgress = typeof window !== "undefined" && localStorage.getItem(`eduearn_quiz_progress_${quiz.id}`);
                        const completed = quiz.latestAttempt && quiz.latestAttempt.status === "Submitted";
                        return (
                          <div
                            key={quiz.id}
                            className="card-surface p-5 rounded-card flex flex-col justify-between gap-4"
                          >
                            <div className="space-y-2 text-left">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-extrabold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  {quiz.subject}
                                </span>
                                {completed ? (
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                    quiz.latestAttempt.passed
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-rose-500/10 text-rose-600"
                                  }`}>
                                    {quiz.latestAttempt.passed ? "Passed" : "Failed"}: {quiz.latestAttempt.percentage}%
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black text-yellow-600 dark:text-yellow-400">
                                    🪙 {quiz.rewardCoins || 50} Coins
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-foreground mt-1.5">{quiz.title}</h4>
                              <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-semibold">
                                <span>Difficulty: {quiz.difficulty || "Intermediate"}</span>
                                <span>·</span>
                                <span>{quiz.questionsCount || quiz.questions?.length || 3} questions</span>
                                <span>·</span>
                                <span>Time: {quiz.timeLimit}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleStartQuiz(quiz)}
                              disabled={completed}
                              size="sm"
                              className={`h-8 text-[10px] w-full ${completed ? "bg-muted text-muted-foreground" : ""}`}
                            >
                              {completed ? "Completed" : (inProgress ? "Resume Quiz" : "Start Quiz")}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Card variant="glass" className="p-6 max-w-xl mx-auto shadow-floating text-left">
                    {quizResult ? (
                      <div className="text-center space-y-5 py-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                          quizResult.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        }`}>
                          <CheckCircle size={28} className="fill-current bg-white rounded-full" />
                        </div>
                        <div>
                          <h3 className="text-base font-heading font-extrabold text-foreground">
                            {quizResult.passed ? "Quiz Passed!" : "Quiz Failed"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {quizResult.passed ? "Excellent job! You passed the evaluation." : "You did not score enough to pass this attempt. Try reviewing the material."}
                          </p>
                        </div>
                        <span className="text-3xl font-heading font-extrabold text-primary block">
                          Score: {quizResult.score}/{quizResult.totalQuestions} ({quizResult.percentage}%)
                        </span>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => setActiveQuiz(null)} size="sm" variant="outline">
                            Back to Quizzes
                          </Button>
                          <Button onClick={() => setActiveTab("rewards")} size="sm">
                            View Coins Wallet
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3 select-none">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold text-foreground truncate max-w-[250px]">{activeQuiz.title}</span>
                            {timeLeft !== null && (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded animate-pulse">
                                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                            Reward: 🪙 {activeQuiz.rewardCoins || 50} Coins
                          </span>
                        </div>

                        <div className="space-y-1.5 select-none text-left">
                          <span className="text-[9px] font-extrabold text-muted-foreground uppercase block">
                            Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                          </span>
                          <p className="text-xs font-bold text-foreground">
                            {activeQuiz.questions[currentQuestionIdx].question}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          {activeQuiz.questions[currentQuestionIdx].options.map((opt: string, idx: number) => {
                            const isSelected = activeQuiz.questions[currentQuestionIdx].type === "multiple"
                              ? (Array.isArray(selectedAnswers[currentQuestionIdx]) && (selectedAnswers[currentQuestionIdx] as number[]).includes(idx))
                              : selectedAnswers[currentQuestionIdx] === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectAnswer(idx)}
                                className={`w-full p-3 border rounded-input text-left text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                                  isSelected
                                    ? "bg-primary border-primary text-white shadow-soft"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                          <Button
                            variant="ghost"
                            disabled={currentQuestionIdx === 0}
                            onClick={() => setCurrentQuestionIdx((p) => p - 1)}
                            className="h-9 text-xs"
                          >
                            Prev
                          </Button>

                          {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                            <Button
                              onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                              className="h-9 text-xs"
                            >
                              Next
                            </Button>
                          ) : (
                            <button
                              onClick={handleSubmitQuiz}
                              className="h-9 text-xs bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white rounded px-4 font-bold animate-pulse">
                              Submit Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>
            )}

            {/* TAB: MONTHLY LEADERBOARD */}
            {activeTab === "leaderboard" && (
              <motion.div
                key="tab-leaderboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <Card variant="glass" className="p-5 border border-yellow-500/20 dark:bg-yellow-500/5 bg-white select-none">
                  <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wider block">
                    Monthly Leaderboard Resets Monthly
                  </span>
                  <h4 className="text-sm font-heading font-extrabold text-foreground mt-1">
                    Top Peer Learners Performance Rankings
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Points are accumulated by completing quiz scores, live class attendance, assignments submissions, streaks, and tutor feedback.
                  </p>
                </Card>

                {/* Leaderboard Table list */}
                <div className="card-surface rounded-card overflow-hidden">
                  <div className="grid grid-cols-[1fr_3fr_2fr_2fr] gap-4 p-4 border-b border-border/80 text-[10px] font-black uppercase text-muted-foreground/80 select-none">
                    <span>Rank</span>
                    <span>Student Name</span>
                    <span className="text-right">Total Points</span>
                    <span className="text-right">Badges</span>
                  </div>

                  <div className="flex flex-col">
                    {[
                      { rank: 1, name: "Priya Patel", points: 1850, badges: ["🔥 7 Day Streak", "🏆 Quiz Champion"] },
                      { rank: 2, name: "Amit Verma", points: 1720, badges: ["🏆 Quiz Champion", "🤖 AI Explorer"] },
                      { rank: 3, name: "Rohan Das", points: 1650, badges: ["🎯 Perfect Attendance"] },
                      { rank: 4, name: "Surya (You)", points: 1590, badges: ["🔥 7 Day Streak", "💻 Coding Explorer"], isCurrentUser: true },
                      { rank: 5, name: "Sneha Iyer", points: 1420, badges: ["💃 Dance Performer"] },
                      { rank: 6, name: "Vikram Rathore", points: 1380, badges: ["💻 Coding Explorer"] },
                      { rank: 7, name: "Karan Malhotra", points: 1290, badges: ["🤖 AI Explorer"] },
                      { rank: 8, name: "Anjali Deshmukh", points: 1200, badges: ["📸 Photography"] },
                      { rank: 9, name: "Rahul Bose", points: 1100, badges: ["🎹 Keyboard Beginner"] },
                      { rank: 10, name: "Sophia Miller", points: 950, badges: ["🎯 Perfect Attendance"] },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-[1fr_3fr_2fr_2fr] gap-4 p-4 border-b border-border/40 items-center text-xs select-none transition-colors ${
                          row.isCurrentUser
                            ? "bg-primary/10 border-primary/20 font-bold"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <span className="flex items-center gap-1 font-extrabold text-foreground">
                          {row.rank === 1 ? "🥇 1" : row.rank === 2 ? "🥈 2" : row.rank === 3 ? "🥉 3" : row.rank}
                        </span>
                        <span className="text-foreground font-bold">{row.name}</span>
                        <span className="text-right font-extrabold text-foreground">{row.points} pts</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {row.badges.map((b, bIdx) => (
                            <Badge key={bIdx} variant="secondary" className="text-[8px] py-0 px-1.5">
                              {b}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Skill Championship */}
                <div className="space-y-3 mt-8">
                  <div className="flex items-center gap-1.5">
                    <Trophy size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                      Monthly Skill Championship
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { subject: "Coding & AI", task: "Build a chatbot widget in Next.js", reward: "500 Coins + AI Champion Badge" },
                      { subject: "Dance & Music", task: "Perform a 2-minute keyboard & gesture sync", reward: "300 Coins + Performance Certificate" },
                      { subject: "Photography & Art", task: "Submit a portrait with shallow depth of field", reward: "400 Coins + 20% Discount Coupon" }
                    ].map((comp, idx) => (
                      <Card key={idx} variant="glass" className="p-4 flex flex-col justify-between border-border text-left hover:border-primary/50 transition-all">
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-extrabold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {comp.subject}
                          </span>
                          <h4 className="text-xs font-bold text-foreground mt-1.5 leading-snug">{comp.task}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">Reward: {comp.reward}</p>
                        </div>
                        <Button size="sm" onClick={() => toast.success(`Registered for ${comp.subject} Championship!`)} className="w-full text-[10px] h-8 mt-4 shadow-soft">
                          Register Competition
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: REWARD SYSTEM */}
            {activeTab === "rewards" && (
              <motion.div
                key="tab-rewards"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Balance & actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card variant="glass" className="p-5 flex flex-col justify-between border border-primary/20 dark:bg-primary/5 bg-white select-none relative overflow-hidden h-32">
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase block">Coins Balance</span>
                      <span className="text-3xl font-heading font-extrabold text-primary mt-1 block">🪙 {coins} Coins</span>
                    </div>
                    <Button onClick={() => setRedeemOpen(true)} className="text-xs h-8 justify-center gap-1.5 self-start">
                      Redeem Coins <ArrowUpRight size={13} />
                    </Button>
                  </Card>

                  <Card variant="glass" className="p-5 flex flex-col justify-between select-none h-32">
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase block">XP Score</span>
                      <span className="text-2xl font-heading font-extrabold text-foreground mt-1 block">⭐ {xp} XP</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold">XP increases level boundaries.</span>
                  </Card>

                  <Card variant="glass" className="p-5 flex flex-col justify-between select-none h-32">
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase block">Streaks Active</span>
                      <span className="text-2xl font-heading font-extrabold text-foreground mt-1 block">🔥 {streak} Days</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold">Attempt quizzes daily to maintain streak.</span>
                  </Card>
                </div>

                {/* Redeem options section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
                    Available Redeem Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "10% Discount Coupon", cost: 100, code: "EE-SAVE-10", desc: "10% discount on any premium single subject course." },
                      { name: "AI Coding Workshop Ticket", cost: 300, code: "EE-AIWORK-300", desc: "Access ticket to Next.js 16 live masterclass." },
                      { name: "Verified Blockchain Credential", cost: 500, code: "EE-BLOCK-500", desc: "Upgrade any course certificate to verified blockchain registry." },
                    ].map((opt, idx) => {
                      const isRedeemed = redeemedCodes.includes(opt.code);
                      return (
                        <Card key={idx} variant="default" className="p-4 border-border bg-card flex flex-col justify-between gap-3 text-left">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-foreground">{opt.name}</span>
                              <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400">🪙 {opt.cost}</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground leading-relaxed">{opt.desc}</p>
                          </div>
                          <Button
                            disabled={isRedeemed || coins < opt.cost}
                            onClick={() => handleRedeem(opt.cost, opt.code, opt.name)}
                            size="sm"
                            className="w-full text-[9px] h-8 mt-2"
                          >
                            {isRedeemed ? "Already Redeemed" : coins < opt.cost ? "Insufficient Balance" : "Redeem Option"}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Rewards history */}
                <div className="space-y-3">
                  <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
                    Rewards History
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {rewardsHistory.map((item) => (
                      <div key={item.id} className="card-surface p-4 rounded-card flex items-center justify-between select-none">
                        <div>
                          <h5 className="font-bold text-foreground text-xs">{item.reason}</h5>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">{item.date}</span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                          +🪙 {item.coins}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SKILL PROGRESS */}
            {activeTab === "skills" && (
              <motion.div
                key="tab-skills"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { skill: "Python Programming", level: "Advanced", progress: 90, icon: "💻", color: "bg-primary" },
                    { skill: "Keyboard Instruments", level: "Intermediate", progress: 72, icon: "🎹", color: "bg-sky-500" },
                    { skill: "Kuchipudi Dance", level: "Beginner", progress: 40, icon: "💃", color: "bg-rose-500" },
                    { skill: "DSLR Photography", level: "Intermediate", progress: 50, icon: "📸", color: "bg-amber-500" },
                  ].map((item, idx) => (
                    <Card key={idx} variant="glass" className="p-5 flex flex-col justify-between gap-4 border-border bg-card shadow-soft text-left select-none">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-lg shadow-soft shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-[8px] font-extrabold uppercase bg-muted text-muted-foreground/80 px-2 py-0.5 rounded">
                          {item.level}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-foreground truncate">{item.skill}</h4>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                          <span>Mastery</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: CERTIFICATES */}
            {activeTab === "certificates" && (
              <motion.div
                key="tab-certs"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <Card variant="glass" className="p-5 border border-purple-500/10 dark:bg-purple-500/5 bg-white">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-purple-700 dark:text-purple-400">
                    Blockchain Verified Credentials
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1.5 pr-4">
                    Earn certificates immediately upon completing 100% of a course&apos;s syllabus and passing the final challenge. credentials can be verified via QR code.
                  </p>
                </Card>

                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="card-surface p-5 rounded-card flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-border"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 text-left">
                      {/* Course Image */}
                      <div className="relative w-24 h-16 rounded bg-muted overflow-hidden border border-border/40 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic certificate course image */}
                        <img
                          src={cert.courseImage || "/images/courses/academic-education.webp"}
                          alt={cert.courseTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-foreground leading-tight">{cert.courseTitle}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                          <span>Tutor: <strong className="text-foreground">{cert.tutorName || "Priya Patel"}</strong></span>
                          <span>•</span>
                          <span>Issued: <strong className="text-foreground">{cert.issueDate}</strong></span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground mt-1">
                          <span>ID: <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground text-[10px]">{cert.serialNumber}</code></span>
                          <span>•</span>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                            ⛓️ Blockchain Registry: {cert.blockchainHash || "0x892a...c01f"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:self-center shrink-0">
                      {/* QR Code mockup */}
                      <div className="flex items-center gap-2 border border-purple-500/20 bg-purple-500/5 px-3 py-2 rounded-lg text-[10px] font-bold text-purple-700 dark:text-purple-400 w-fit select-none">
                        <QrCode size={18} className="shrink-0" />
                        <div className="flex flex-col text-left leading-none">
                          <span className="text-[8px] uppercase tracking-wider text-muted-foreground/60">Registry QR</span>
                          <span className="font-bold text-[9px] mt-0.5">{cert.qrCode}</span>
                        </div>
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          variant="outline"
                          onClick={() => window.open(cert.blockchainHash || `/student/certificate/${cert.id}`, "_blank")}
                          className="text-[10px] h-8 font-bold px-2.5"
                        >
                          Preview
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => window.open(cert.blockchainHash || `/student/certificate/${cert.id}`, "_blank")}
                          className="text-[10px] h-8 font-bold px-2.5 gap-1"
                        >
                          <Download size={11} /> PDF
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            const url = `${window.location.origin}${cert.blockchainHash || `/student/certificate/${cert.id}`}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Shareable certificate link copied!");
                          }}
                          className="text-[10px] h-8 font-bold px-2.5"
                        >
                          Share
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            window.open("https://linkedin.com", "_blank");
                            toast.success("Redirecting to Add to LinkedIn Profile form...");
                          }}
                          className="text-[10px] h-8 font-bold px-2.5 text-blue-600 border-blue-500/20 hover:bg-blue-50/50"
                        >
                          LinkedIn
                        </Button>

                        <Button
                          onClick={() => window.open(cert.blockchainHash || `/student/certificate/${cert.id}`, "_blank")}
                          className="text-[10px] h-8 font-bold px-3"
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === "wishlist" && (
              <motion.div
                key="tab-wishlist"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {wishlist.length === 0 ? (
                  <EmptyState
                    type="wishlist"
                    title="Your wishlist is empty"
                    description="Browse student-led courses and save your favorites to your learning dashboard."
                    action={
                      <Button onClick={() => router.push("/courses")}>
                        Explore Courses
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((course) => {
                      const hasDiscount = (course as any).discount && (course as any).discount > 0;
                      const originalPrice = hasDiscount ? Math.round(course.price * (1 + (course as any).discount / 100)) : course.price;
                      return (
                        <div
                          key={course.id}
                          className="card-surface rounded-card overflow-hidden flex flex-col justify-between hover:translate-y-[-4px] hover-premium-card transition-all duration-300 border border-border"
                        >
                          {/* Course Image / Cover */}
                          <div className="relative w-full h-32 bg-gradient-to-br from-primary/10 via-sky-500/5 to-accent/5 overflow-hidden group select-none">
                            {course.thumbnail ? (
                              /* eslint-disable-next-line @next/next/no-img-element -- Dynamic course thumbnail loading */
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/courses/academic-education.webp";
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <BookOpen size={30} className="text-primary/30" />
                              </div>
                            )}
                            
                            {/* Heart bookmark icon in absolute overlay */}
                            <button
                              onClick={() => {
                                setWishlist((prev) => prev.filter((c) => c.id !== course.id));
                                toast.info("Removed from wishlist");
                              }}
                              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-red-500 shadow-soft hover:scale-110 transition-transform cursor-pointer border border-border/40"
                              title="Remove from wishlist"
                            >
                              <Heart size={12} className="fill-current" />
                            </button>

                            {/* Difficulty/Category Badge */}
                            <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                              <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/95 text-white shadow-soft">
                                {course.level || "Beginner"}
                              </span>
                              <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900/95 text-white shadow-soft">
                                {course.category}
                              </span>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 flex flex-col gap-3 text-left">
                            <div>
                              <h4 className="text-xs font-extrabold text-foreground line-clamp-2 leading-snug">
                                {course.title}
                              </h4>
                              
                              {/* Tutor Info & Rating Row */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground border border-border/40 uppercase shrink-0">
                                  {course.tutorName ? course.tutorName[0] : "T"}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-semibold truncate">{course.tutorName}</span>
                                <div className="flex items-center gap-0.5 text-amber-500 ml-auto shrink-0 font-extrabold text-[9px]">
                                  <span>⭐</span>
                                  <span>{course.rating || "4.8"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Meta Row: Duration / Students */}
                            <div className="flex items-center justify-between text-[9px] text-muted-foreground/80 border-t border-border/30 pt-2 font-bold">
                              <span>⏱️ 12 hours video</span>
                              <span>👥 {course.studentsCount || "120"} enrolled</span>
                            </div>

                            {/* Pricing and CTAs */}
                            <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-1">
                              <div className="flex flex-col text-left">
                                {hasDiscount && (
                                  <span className="text-[8px] text-muted-foreground/60 line-through font-bold">
                                    ₹{originalPrice}
                                  </span>
                                )}
                                <span className="text-xs font-black text-primary">
                                  {course.price === 0 ? "FREE" : `₹${course.price}`}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Button
                                  onClick={() => enrollWishlist(course)}
                                  size="sm"
                                  className="h-8 text-[10px] font-bold shadow-soft hover:opacity-90 transition-opacity"
                                >
                                  Enroll Now
                                </Button>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: ASSIGNMENTS */}
            {activeTab === "assignments" && (
              <motion.div
                key="tab-assignments"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3"
              >
                {assignments.length === 0 ? (
                  <EmptyState
                    type="default"
                    title="No pending assignments"
                    description="When student tutors assign homework, worksheets, or practice tasks, they will appear here."
                    action={
                      <Button onClick={() => setActiveTab("my-courses")}>
                        Go to Classroom
                      </Button>
                    }
                  />
                ) : (
                  assignments.map((assign) => {
                    const isExpanded = expandedAssignmentId === assign.id;
                    return (
                      <div
                        key={assign.id}
                        className="card-surface rounded-card overflow-hidden transition-all"
                      >
                        <div
                          onClick={() => setExpandedAssignmentId(isExpanded ? null : assign.id)}
                          className="p-4 flex items-center justify-between bg-muted/20 hover:bg-muted/40 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{assign.title}</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{assign.courseTitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              assign.status === "Graded"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : assign.status === "Submitted"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-amber-500/10 text-amber-600 animate-pulse"
                            }`}>
                              {assign.status}
                            </span>
                            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`} />
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden border-t border-border/30"
                            >
                              <div className="p-4 space-y-4 text-xs">
                                <div className="space-y-1 text-left">
                                  <span className="font-bold text-muted-foreground/80 block">Assignment instructions</span>
                                  <p className="text-foreground leading-relaxed font-semibold">{assign.prompt}</p>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground border-t border-b border-border/30 py-2.5">
                                  <span>Due Date: {assign.dueDate}</span>
                                  <button
                                    onClick={() => toast.success("Downloading resource guidelines...")}
                                    className="text-primary hover:underline flex items-center gap-0.5"
                                  >
                                    Download guidelines.pdf
                                  </button>
                                </div>

                                {assign.status === "Graded" ? (
                                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-card space-y-2 text-left">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600">
                                      <span>Submission Status: Graded</span>
                                      <span>Grade: {assign.grade}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-normal italic font-semibold">
                                      Tutor feedback: &ldquo;{assign.feedback}&rdquo;
                                    </p>
                                  </div>
                                ) : assign.status === "Submitted" ? (
                                  <div className="p-3 bg-muted/40 rounded-card text-center text-muted-foreground font-semibold">
                                    ⌛ Assignment submitted. Awaiting tutor grading.
                                  </div>
                                ) : (
                                  <div className="space-y-2 text-left">
                                    <span className="font-bold text-muted-foreground block">Submit your worksheets</span>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={selectedFile}
                                        onChange={(e) => setSelectedFile(e.target.value)}
                                        placeholder="Enter filename or URL (e.g. limit-calculations.pdf)..."
                                        className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                                      />
                                      <Button
                                        onClick={() => handleUploadAssignment(assign.id)}
                                        disabled={isUploading}
                                        className="h-auto shrink-0 flex items-center justify-center p-2.5"
                                      >
                                        {isUploading ? "Uploading..." : "Submit File"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* TAB: DOWNLOADS */}
            {activeTab === "downloads" && (
              <motion.div
                key="tab-downloads"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <Card variant="glass" className="p-5 border-border bg-card flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>Offline Storage Used</span>
                    <span className="text-foreground">16.8 MB / 10 GB</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[0.16%] rounded-full" />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setDownloads([]);
                        toast.success("All downloads deleted.");
                      }}
                      className="text-[10px] font-bold text-destructive hover:underline focus:outline-none"
                    >
                      Remove all downloads
                    </button>
                  </div>
                </Card>

                {downloads.length === 0 ? (
                  <EmptyState
                    type="default"
                    title="No offline downloads"
                    description="You can download lesson videos, audio summaries, and PDF files on mobile to study on the go."
                    action={
                      <Button onClick={() => setActiveTab("my-courses")}>
                        Go to Classroom
                      </Button>
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {downloads.map((dload) => (
                      <div
                        key={dload.id}
                        className="card-surface p-4 rounded-card flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Download size={14} />
                          </div>
                          <div className="text-left">
                            <h5 className="font-bold text-foreground text-xs pr-2">{dload.title}</h5>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">{dload.type} · {dload.size}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setDownloads((prev) => prev.filter((d) => d.id !== dload.id));
                            toast.success(`${dload.title} deleted.`);
                          }}
                          className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/60 rounded cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <motion.div
                key="tab-notifications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* NOTIFICATIONS SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2">
                      <span>🔔</span> Notifications
                      {notifications.filter((n) => !n.read).length > 0 && (
                        <span className="bg-primary text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                          {notifications.filter((n) => !n.read).length}
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-primary hover:underline focus:outline-none"
                    >
                      Mark all as read
                    </button>
                  </div>

                  {/* Categorized filter tabs */}
                  <div className="flex flex-wrap gap-1.5 border-b border-border/40 pb-3 select-none">
                    {["All", "Unread", "Read", "Course", "Assignment", "Quiz", "Certificate", "System", "Live Class", "Tutor", "Admin"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setNotificationFilter(f)}
                        className={cn(
                          "px-3 py-1 rounded text-[10px] font-bold border transition-colors",
                          notificationFilter === f
                            ? "bg-primary border-primary text-white"
                            : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Loading skeleton */}
                  {notificationsLoading && (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border p-4 rounded-card bg-card border-border animate-pulse">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-2.5 bg-muted rounded w-2/3" />
                              <div className="h-2 bg-muted rounded w-full" />
                              <div className="h-2 bg-muted rounded w-1/3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notification list */}
                  {!notificationsLoading && (
                    <div className="flex flex-col gap-3">
                      {notifications
                        .filter((n) => {
                          if (notificationFilter === "All") return true;
                          if (notificationFilter === "Unread") return !n.read;
                          if (notificationFilter === "Read") return n.read;
                          return n.type === notificationFilter;
                        })
                        .map((n) => {
                          const meta = (() => {
                            switch (n.type) {
                              case "Live Class":
                                return { emoji: "🔴", badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
                              case "Assignment":
                                return { emoji: "📝", badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
                              case "Quiz":
                                return { emoji: "🧠", badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
                              case "Course":
                                return { emoji: "📚", badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
                              case "Certificate":
                                return { emoji: "🏆", badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
                              case "Payment":
                                return { emoji: "💳", badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" };
                              case "Tutor":
                                return { emoji: "👩‍🏫", badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" };
                              case "Admin":
                                return { emoji: "🛡️", badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
                              default:
                                return { emoji: "🔔", badgeClass: "bg-muted text-muted-foreground border-border" };
                            }
                          })();
                          return (
                            <div
                              key={n.id}
                              className={cn(
                                "border p-4 rounded-card shadow-soft flex items-start justify-between gap-4 transition-all",
                                n.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"
                              )}
                            >
                              <div className="flex items-start gap-3 text-left">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm select-none",
                                  n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                                )}>
                                  <span>{meta.emoji}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="text-xs font-bold text-foreground pr-2">{n.title}</h4>
                                    {n.type && (
                                      <span className={cn("text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border select-none", meta.badgeClass)}>
                                        {n.type}
                                      </span>
                                    )}
                                    {!n.read && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.text}</p>
                                  <span className="text-[8px] text-muted-foreground/60 block mt-1">{n.time}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {!n.read && (
                                  <button
                                    onClick={() => handleMarkOneRead(n.id)}
                                    className="p-1 hover:bg-muted border border-border rounded text-[10px] font-bold hover:text-foreground cursor-pointer focus:outline-none"
                                  >
                                    Mark Read
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteNotification(n.id)}
                                  className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border rounded cursor-pointer focus:outline-none"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      {/* Empty state */}
                      {notifications.filter((n) => {
                        if (notificationFilter === "All") return true;
                        if (notificationFilter === "Unread") return !n.read;
                        if (notificationFilter === "Read") return n.read;
                        return n.type === notificationFilter;
                      }).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                          <span className="text-3xl">🔕</span>
                          <p className="text-xs font-bold text-foreground">No notifications</p>
                          <p className="text-[10px] text-muted-foreground">
                            {notificationFilter === "Unread" ? "You're all caught up!" : "Nothing to show for this filter."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ACTIVITY TIMELINE SECTION */}
                <div className="space-y-4">
                  <div className="border-t border-border/40 pt-4">
                    <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2 mb-4">
                      <span>📋</span> Activity Timeline
                    </h3>

                    {activities.length === 0 && !notificationsLoading && (
                      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                        <span className="text-3xl">📭</span>
                        <p className="text-xs font-bold text-foreground">No activity yet</p>
                        <p className="text-[10px] text-muted-foreground">Enroll in a course to start tracking your progress.</p>
                      </div>
                    )}

                    <div className="relative flex flex-col gap-0">
                      {activities.map((activity, idx) => {
                        const activityMeta = (() => {
                          switch (activity.type) {
                            case "course_enrolled":
                              return { emoji: "🎓", dotClass: "bg-indigo-500" };
                            case "lesson_completed":
                              return { emoji: "✅", dotClass: "bg-emerald-500" };
                            case "assignment_submitted":
                              return { emoji: "📝", dotClass: "bg-amber-500" };
                            case "quiz_completed":
                              return { emoji: "🧠", dotClass: "bg-blue-500" };
                            case "certificate_earned":
                              return { emoji: "🏆", dotClass: "bg-purple-500" };
                            default:
                              return { emoji: "📌", dotClass: "bg-muted-foreground" };
                          }
                        })();
                        return (
                          <div key={activity.id} className="flex gap-3 pb-4 relative">
                            {/* Timeline line */}
                            {idx < activities.length - 1 && (
                              <div className="absolute left-3 top-7 w-0.5 bottom-0 bg-border/60" />
                            )}
                            {/* Dot */}
                            <div className={cn("w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs mt-0.5 z-10", activityMeta.dotClass)}>
                              <span>{activityMeta.emoji}</span>
                            </div>
                            {/* Content */}
                            <div className="flex-1 bg-card border border-border rounded-card p-3 shadow-soft text-left">
                              <p className="text-[11px] font-bold text-foreground">{activity.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{activity.description}</p>
                              <span className="text-[8px] text-muted-foreground/60 block mt-1">
                                {new Date(activity.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: PURCHASE HISTORY */}
            {activeTab === "purchases" && (
              <motion.div
                key="tab-purchases"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
                    Purchased Course Catalog
                  </h3>
                  <div className="flex flex-col gap-3">
                    {purchaseHistoryState.map((p) => (
                      <div key={p.id} className="card-surface p-4 rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="text-left">
                          <h5 className="font-bold text-foreground text-xs">{p.courseTitle}</h5>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1 select-none">
                            <span>No: {p.invoiceNo}</span>
                            <span>·</span>
                            <span>Date: {p.date}</span>
                            <span>·</span>
                            <span className={`font-bold uppercase ${
                              p.status === "Success" ? "text-emerald-500" : p.status === "Refunded" ? "text-muted-foreground" : "text-amber-500 animate-pulse"
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 select-none">
                          <span className="text-sm font-black text-foreground mr-2">₹{p.amount}</span>
                          <Button
                            onClick={() => {
                              setSelectedInvoice(p);
                              setIsInvoiceOpen(true);
                            }}
                            variant="ghost"
                            className="h-8 text-xs hover:bg-muted"
                          >
                            View Invoice
                          </Button>
                          {p.status === "Success" && (
                            <Button
                              onClick={() => {
                                setRefundCourseId(p.courseId);
                                setRefundCourseTitle(p.courseTitle);
                                setRefundCourseAmount(p.amount);
                                setIsRefundModalOpen(true);
                              }}
                              className="h-8 text-xs bg-rose-500 hover:bg-rose-600 text-white"
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ATTENDANCE */}
            {activeTab === "attendance" && (
              <motion.div
                key="tab-attendance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Overall Attendance", value: "91.6%", sub: "Above minimum limit (75%)" },
                    { label: "Classes Attended", value: "22 Sessions", sub: "Out of 24 conducted" },
                    { label: "Scheduled Today", value: "1 Session", sub: "Google Meet link published" },
                    { label: "Check-in Status", value: "Active", sub: "Verified via Student ID" }
                  ].map((stat, idx) => (
                    <Card key={idx} variant="glass" className="p-4 border-border/80 bg-card">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">{stat.label}</span>
                      <span className="text-xl font-heading font-black text-foreground block mt-1">{stat.value}</span>
                      <span className="text-[9px] text-emerald-400 block mt-1 font-semibold">{stat.sub}</span>
                    </Card>
                  ))}
                </div>

                {enrolledCourses.length === 0 ? (
                  <EmptyState
                    type="default"
                    title="No attendance records found"
                    description="You are not enrolled in any monthly live tuition batches. Enroll in a student-led batch to track class check-in log."
                    action={
                      <Button onClick={() => router.push("/tutors")}>
                        Explore Live Batches
                      </Button>
                    }
                  />
                ) : (
                  <Card variant="glass" className="p-6 border-border bg-card">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground border-b border-border/60 pb-2.5 mb-4">
                      Monthly Tuition Batch Attendance Log
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-semibold">
                        <thead>
                          <tr className="border-b border-border/40 text-muted-foreground text-left">
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Subject Batch</th>
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Mentoring Tutor</th>
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Scheduled Time</th>
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Platform Link</th>
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {[
                            { subject: "Python Programming Batch A", tutor: "Vikram Rathore", time: "Today, 10:15 AM", platform: "Google Meet", status: "Present" },
                            { subject: "Advanced Physics Tuition", tutor: "Dr. Ravi Kumar", time: "Yesterday, 3:30 PM", platform: "Zoom", status: "Present" },
                            { subject: "Calculus Fundamentals Batch C", tutor: "Sneha Iyer", time: "08 Jul 2026, 5:00 PM", platform: "Google Meet", status: "Present" },
                            { subject: "Python Programming Batch A", tutor: "Vikram Rathore", time: "05 Jul 2026, 10:15 AM", platform: "Google Meet", status: "Present" },
                            { subject: "AI Prompt Tuning Cohort", tutor: "Karan Malhotra", time: "03 Jul 2026, 7:00 PM", platform: "Zoom", status: "Absent" }
                          ].map((log, idx) => (
                            <tr key={idx} className="hover:bg-muted/10 transition-colors">
                              <td className="py-3 text-foreground">{log.subject}</td>
                              <td className="py-3 text-muted-foreground">{log.tutor}</td>
                              <td className="py-3 text-muted-foreground font-mono">{log.time}</td>
                              <td className="py-3 text-primary underline font-sans">{log.platform}</td>
                              <td className="py-3">
                                <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                                  log.status === "Present"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/15 text-red-400 border-red-500/20"
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {/* TAB: CAREER HUB */}
            {activeTab === "career-hub" && (
              <motion.div
                key="tab-career-hub"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                {/* Header card */}
                <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 text-left">
                    <span className="text-[8px] bg-primary/15 text-primary px-2.5 py-0.5 rounded-full border border-primary/25 font-bold uppercase tracking-wider select-none">
                      Career accelerator
                    </span>
                    <h3 className="text-lg font-heading font-black text-foreground mt-2">EduEarn Career & Mentor Center</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-lg">
                      Build your resume, secure student internships, and apply to become an AI-verified tutor to teach junior students.
                    </p>
                  </div>
                  <Link href="/tutor/onboarding" className="relative z-10 shrink-0">
                    <Button size="sm" className="font-bold text-[10px] uppercase tracking-wider py-3.5 px-5 bg-primary hover:bg-primary/95 text-primary-foreground shadow-soft flex items-center gap-1">
                      Apply to Teach <ArrowUpRight size={13} />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left columns: Internships */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground">
                      Student Micro-Internships & Teaching Roles
                    </h4>

                    <div className="space-y-3">
                      {[
                        { title: "React Developer Intern", type: "Part-time (Remote)", stipend: "₹8,000/month", company: "EduEarn Engineering", desc: "Build interactive layouts and Sparky widgets under expert student leads." },
                        { title: "Academic Calculus Mentor", type: "Tuition role", stipend: "₹999/student", company: "EduEarn Academics", desc: "Teach high school calculus batches on Google Meet. Curriculum support provided." },
                        { title: "GenAI Content Creator", type: "Freelance", stipend: "₹1,200/course", company: "EduEarn Studio", desc: "Create high-quality video modules on ChatGPT, Gemini, and Prompt Engineering." }
                      ].map((job, idx) => (
                        <Card key={idx} variant="glass" className="p-4 border-border hover:border-primary/20 transition-all flex flex-col justify-between gap-3 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-bold text-foreground">{job.title}</h5>
                              <span className="text-[9px] text-muted-foreground/80 font-semibold">{job.company} • {job.type}</span>
                            </div>
                            <span className="text-[9.5px] font-bold text-primary">{job.stipend}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/90">{job.desc}</p>
                          <div className="flex justify-end pt-2 border-t border-border/30">
                            <Button size="sm" className="text-[9px] font-bold py-1 px-3 rounded-lg" onClick={() => toast.success(`Applied for ${job.title}!`)}>
                              Apply Now
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Right columns: Sparky Career Tools */}
                  <div className="space-y-5 w-full">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground">
                      Sparky AI Career Tools
                    </h4>

                    <Card variant="glass" className="p-4 border-border bg-card flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <Sparkles size={14} className="fill-current" />
                        </div>
                        <div>
                          <h5 className="text-[11px] font-bold text-foreground">AI Resume Optimization</h5>
                          <span className="text-[8px] text-muted-foreground font-semibold">Instant score evaluation</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground/90 leading-relaxed">
                        Optimize your resume for student-friendly internships and tutoring certifications. Sparky scans keywords automatically.
                      </p>
                      <Button size="sm" className="w-full text-[9px] font-bold py-2 rounded-lg" onClick={() => toast.success("Resume scanned successfully! Optimization suggestions sent to Sparky Chat.")}>
                        Optimize Resume
                      </Button>
                    </Card>

                    <Card variant="glass" className="p-4 border-border bg-card flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <Award size={14} />
                        </div>
                        <div>
                          <h5 className="text-[11px] font-bold text-foreground">Escrow Escort & Certs</h5>
                          <span className="text-[8px] text-muted-foreground font-semibold">Tutor credibility scores</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground/90 leading-relaxed">
                        Your credibility score increases when student reviews are above 4.5. Top Credibility unlocks high-paying cohort batches.
                      </p>
                      <div className="flex justify-between items-center text-[9.5px] border-t border-border/30 pt-2 font-bold">
                        <span className="text-muted-foreground">My Level:</span>
                        <span className="text-primary uppercase tracking-wider">🌱 Rising Tutor</span>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* My Applied Positions checklist */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground">
                    My Applied Positions
                  </h4>
                  {appliedJobs.length === 0 ? (
                    <EmptyState
                      type="default"
                      title="No job applications sent yet"
                      description="Your submitted micro-internships and verified tutor application records will show here."
                      action={
                        <Button onClick={() => router.push("/career")}>
                          Scan My Resume
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* We'll show applied jobs list if populated */}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: SETTINGS / PROFILE */}
            {activeTab === "settings" && (
              <motion.div
                key="tab-settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6"
              >
                <div className="space-y-6">
                  <Card variant="glass" className="p-6 shadow-soft">
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <h4 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground border-b border-border/60 pb-1.5">
                        Edit Profile Details
                      </h4>

                      <div className="flex items-center gap-4 border-b border-border/40 pb-4 mb-2 select-none">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-lg text-primary relative overflow-hidden shrink-0">
                          {avatarPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            profileForm.fullName.charAt(0)
                          )}
                        </div>
                        <div className="space-y-1.5 text-left">
                          <input
                            type="file"
                            accept="image/*"
                            id="avatar-input"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="avatar-input"
                            className="px-3 py-1.5 bg-muted hover:bg-muted/70 border border-border/80 rounded-button text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Upload Photo
                          </label>
                          <p className="text-[8px] text-muted-foreground">PNG/JPG under 2MB.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 text-xs text-left">
                          <label className="font-bold text-foreground">Full Name *</label>
                          <input
                            type="text"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                            className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 text-xs text-left">
                          <label className="font-bold text-foreground">Username *</label>
                          <input
                            type="text"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                            className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 text-xs text-left">
                          <label className="font-bold text-foreground">Country *</label>
                          <input
                            type="text"
                            value={profileForm.country}
                            onChange={(e) => setProfileForm((p) => ({ ...p, country: e.target.value }))}
                            className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 text-xs text-left">
                          <label className="font-bold text-foreground">Language *</label>
                          <input
                            type="text"
                            value={profileForm.language}
                            onChange={(e) => setProfileForm((p) => ({ ...p, language: e.target.value }))}
                            className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-left">
                        <label className="font-bold text-foreground">Short Bio *</label>
                        <textarea
                          rows={3}
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                          className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input p-3 focus:outline-none focus:border-primary/50 text-xs font-semibold text-foreground placeholder:text-muted-foreground/80 resize-none"
                        />
                      </div>

                      <Button type="submit" size="sm" className="h-10 text-xs">
                        Save Changes
                      </Button>
                    </form>
                  </Card>

                  <Card variant="glass" className="p-6 shadow-soft">
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <h4 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground border-b border-border/60 pb-1.5">
                        Update Password
                      </h4>

                      <div className="space-y-1 text-xs text-left">
                        <label className="font-bold text-foreground">Old Password *</label>
                        <input
                          type="password"
                          value={passwordForm.old}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, old: e.target.value }))}
                          className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 text-xs text-left">
                          <label className="font-bold text-foreground">New Password *</label>
                          <input
                            type="password"
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))}
                            className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 text-xs text-left">
                          <label className="font-bold text-foreground">Confirm New Password *</label>
                          <input
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                            className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          />
                        </div>
                      </div>

                      <Button type="submit" size="sm" className="h-10 text-xs">
                        Change Password
                      </Button>
                    </form>
                  </Card>
                </div>

                {/* Achievements Badges display replaced with App Preferences */}
                <div className="space-y-6">
                  <Card variant="glass" className="p-6 shadow-soft text-left">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground border-b border-border/60 pb-1.5 mb-4">
                      App Preferences
                    </h4>
                    
                    {/* Theme selector */}
                    <div className="space-y-2 select-none mb-5">
                      <label className="text-xs font-bold text-foreground block">App Theme</label>
                      <div className="flex gap-2">
                        {["light", "dark", "system"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            type="button"
                            className={`flex-1 py-2 text-xs font-bold rounded capitalize cursor-pointer border transition-all ${
                              theme === t
                                ? "bg-primary text-white border-primary"
                                : "bg-card hover:bg-muted/40 border-border text-muted-foreground"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language selector */}
                    <div className="space-y-2 select-none mb-5">
                      <label className="text-xs font-bold text-foreground block">Primary Language</label>
                      <select
                        value={profileForm.language}
                        onChange={(e) => setProfileForm((p) => ({ ...p, language: e.target.value }))}
                        className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                      </select>
                    </div>

                    {/* Notification Toggles */}
                    <div className="space-y-3 select-none border-t border-border/40 pt-4">
                      <label className="text-xs font-bold text-foreground block">Notification Preferences</label>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Email Notifications</span>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.email}
                          onChange={(e) => {
                            const updated = { ...notificationPrefs, email: e.target.checked };
                            setNotificationPrefs(updated);
                            localStorage.setItem("eduearn_notification_prefs", JSON.stringify(updated));
                            toast.success("Email preferences updated!");
                          }}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Push Notifications</span>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.push}
                          onChange={(e) => {
                            const updated = { ...notificationPrefs, push: e.target.checked };
                            setNotificationPrefs(updated);
                            localStorage.setItem("eduearn_notification_prefs", JSON.stringify(updated));
                            toast.success("Push preferences updated!");
                          }}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Weekly Reminders</span>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.reminders}
                          onChange={(e) => {
                            const updated = { ...notificationPrefs, reminders: e.target.checked };
                            setNotificationPrefs(updated);
                            localStorage.setItem("eduearn_notification_prefs", JSON.stringify(updated));
                            toast.success("Reminder preferences updated!");
                          }}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* TAB: REFER & EARN */}
            {activeTab === "referral" && (
              <motion.div
                key="tab-referral"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                {/* Referral Program Header */}
                <Card variant="glass" className="p-6 border-primary/20 bg-primary/5 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 select-none shadow-soft">
                  <div className="space-y-2 relative z-10 text-left">
                    <span className="text-[9px] bg-primary/15 text-primary px-2.5 py-0.5 rounded-full border border-primary/25 font-bold uppercase tracking-wider">
                      Referral Rewards Program
                    </span>
                    <h3 className="text-xl font-heading font-black text-foreground">Invite Friends. Earn Coins. Learn Together!</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl font-semibold">
                      Share your unique invite code with other college or school students. When they enroll, you both receive bonus coins that can be redeemed for study guides or course payouts!
                    </p>
                  </div>
                  <Gift size={54} className="text-primary/25 shrink-0 hidden sm:block relative z-10 animate-bounce" />
                </Card>

                {/* Referral stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
                  <Card variant="default" className="p-5 border-border bg-card">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">My Referral Code</span>
                    <div className="flex items-center justify-between gap-3 border border-border/80 rounded-xl px-3 py-2 mt-2 bg-slate-50 dark:bg-slate-900/45">
                      <span className="font-mono text-sm font-black text-foreground tracking-widest">EDUSPARK50</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("EDUSPARK50");
                          toast.success("Referral code copied to clipboard!");
                        }}
                        className="text-[9px] font-extrabold uppercase text-primary hover:underline focus:outline-none cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </Card>

                  <Card variant="default" className="p-5 border-border bg-card flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">Total Referred</span>
                      <span className="text-2xl font-heading font-black text-foreground block mt-1">12 Friends</span>
                    </div>
                    <span className="text-[9px] text-emerald-500 font-semibold block mt-1">✓ 8 users active this week</span>
                  </Card>

                  <Card variant="default" className="p-5 border-border bg-card flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">Coins Balance</span>
                      <span className="text-2xl font-heading font-black text-amber-500 block mt-1">{coins} Coins</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground block mt-1">Redeemable for discount rewards</span>
                  </Card>
                </div>

                {/* Rewards Info & Referral History */}
                <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
                  {/* Left block: Rewards table */}
                  <Card variant="glass" className="p-6 border-border bg-card">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground border-b border-border/60 pb-2.5 mb-4">
                      Available Coins Store Rewards
                    </h4>
                    <div className="space-y-3">
                      {[
                        { reward: "₹500 Course Discount Coupon", cost: "500 Coins", status: "Redeemable", desc: "Unlock code to get ₹500 off on any recorded marketplace course." },
                        { reward: "Sparky AI Pro Outlines (1 Month)", cost: "300 Coins", status: "Redeemable", desc: "Unlock infinite outline queries and quiz prep formats." },
                        { reward: "1-on-1 Student Tutor Doubt Session (30m)", cost: "800 Coins", status: "Redeemable", desc: "Get personalized live audio doubts clearance with any verified mentor." }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-border/60 rounded-xl flex items-center justify-between gap-4 text-left">
                          <div>
                            <span className="text-xs font-bold text-foreground block">{item.reward}</span>
                            <p className="text-[9px] text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0 font-bold">
                            <span className="text-[10px] font-black text-amber-500">{item.cost}</span>
                            <button
                              onClick={() => {
                                const costVal = parseInt(item.cost);
                                if (coins < costVal) {
                                  toast.error("Insufficient coins balance!");
                                } else {
                                  setCoins((prev) => prev - costVal);
                                  toast.success(`Successfully redeemed ${item.reward}! check your email.`);
                                }
                              }}
                              className="px-2.5 py-1 bg-primary text-white text-[8px] uppercase tracking-wider font-extrabold rounded hover:opacity-90 transition cursor-pointer border-none focus:outline-none"
                            >
                              Redeem
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Right block: Referral history log */}
                  <Card variant="glass" className="p-6 border-border bg-card">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground border-b border-border/60 pb-2.5 mb-4">
                      Referral History
                    </h4>
                    <div className="space-y-3.5 text-xs font-semibold overflow-y-auto max-h-[300px] pr-1">
                      {[
                        { name: "Pawan Kalyan", date: "09 Jul 2026", reward: "+50 Coins", status: "Joined" },
                        { name: "Allu Arjun", date: "07 Jul 2026", reward: "+50 Coins", status: "Joined" },
                        { name: "Ram Charan", date: "04 Jul 2026", reward: "+50 Coins", status: "Joined" },
                        { name: "NTR Junior", date: "02 Jul 2026", reward: "Pending", status: "Registered" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-border/10 pb-2.5 last:border-0 last:pb-0 text-left">
                          <div>
                            <span className="text-xs font-bold text-foreground block">{item.name}</span>
                            <span className="text-[9px] text-muted-foreground">{item.date} · {item.status}</span>
                          </div>
                          <span className={cn("text-[10px] font-black", item.reward.startsWith("+") ? "text-emerald-500" : "text-amber-500 animate-pulse")}>
                            {item.reward}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <InvoiceView
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        invoiceNo={selectedInvoice?.invoiceNo || ""}
        courseTitle={selectedInvoice?.courseTitle || ""}
        amount={selectedInvoice?.amount || 0}
        date={selectedInvoice?.date || ""}
        studentName={profileForm.fullName}
        studentEmail={user?.email || "surya_learner@eduearn.com"}
      />

      {/* Interactive AI Assistant Dialog Modal */}
      <AnimatePresence>
        {aiAssistantOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160]" onClick={() => setAiAssistantOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl shadow-floating z-[161] overflow-hidden p-6 flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-sm font-heading font-extrabold text-foreground flex items-center gap-2 capitalize">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  ✨ Sparky AI ({aiAssistantType?.replace("-", " ")})
                </h3>
                <button onClick={() => setAiAssistantOpen(false)} className="p-1 hover:bg-muted rounded cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {aiAssistantType === "study" && "Enter any concept, programming syntax, or vocabulary to receive study outlines."}
                {aiAssistantType === "homework" && "Enter your homework prompt to get step-by-step logic outlines."}
                {aiAssistantType === "quiz" && "Enter a topic to generate 3 custom multiple choice quiz questions."}
                {aiAssistantType === "roadmap" && "Enter a learning goal to generate a weekly roadmap schedule."}
                {aiAssistantType === "career" && "Enter your current skills to get role and salary guidance."}
              </p>

              <form onSubmit={handleAiAction} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Your Input query *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder={
                      aiAssistantType === "study" ? "Explain recursion in Python simply..." :
                      aiAssistantType === "homework" ? "Outline derivatives limits set 2.5 homework..." :
                      aiAssistantType === "quiz" ? "Generate quiz questions for ISO settings..." :
                      aiAssistantType === "roadmap" ? "How to learn React from scratch..." :
                      "Software engineering with TypeScript skills..."
                    }
                    value={aiInputText}
                    onChange={(e) => setAiInputText(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-border bg-card rounded focus:outline-none focus:border-primary/50 resize-none text-foreground"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs">
                  <Button type="button" variant="ghost" onClick={() => setAiAssistantOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={aiLoading || !aiInputText.trim()}>
                    {aiLoading ? "Generating AI..." : "Generate Insights"}
                  </Button>
                </div>
              </form>

              {/* AI results display */}
              {aiResultText && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-card text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line text-white font-semibold">
                  {aiResultText}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rewards Coupon Redeem Dialog Modal */}
      <AnimatePresence>
        {redeemOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160]" onClick={() => setRedeemOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl shadow-floating z-[161] overflow-hidden p-6 flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-sm font-heading font-extrabold text-foreground flex items-center gap-2">
                  <Wallet size={16} className="text-primary" /> Redeem EduEarn Coins
                </h3>
                <button onClick={() => setRedeemOpen(false)} className="p-1 hover:bg-muted rounded cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                  <span>Your Balance:</span>
                  <span className="text-primary font-black">🪙 {coins} Coins</span>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { name: "10% Discount Coupon", cost: 100, code: "EE-SAVE-10" },
                    { name: "AI Coding Workshop Ticket", cost: 300, code: "EE-AIWORK-300" },
                    { name: "Verified Blockchain Credential", cost: 500, code: "EE-BLOCK-500" },
                  ].map((opt, idx) => {
                    const isRedeemed = redeemedCodes.includes(opt.code);
                    return (
                      <div key={idx} className="p-3 bg-muted/40 border border-border/60 rounded-card flex items-center justify-between text-xs">
                        <div className="text-left">
                          <span className="font-bold text-foreground block">{opt.name}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">Cost: 🪙 {opt.cost} Coins</span>
                        </div>
                        <Button
                          disabled={isRedeemed || coins < opt.cost}
                          onClick={() => handleRedeem(opt.cost, opt.code, opt.name)}
                          size="sm"
                          className="h-8 text-[9px] px-3.5"
                        >
                          {isRedeemed ? "Redeemed" : coins < opt.cost ? "Locked" : "Redeem"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button variant="ghost" onClick={() => setRedeemOpen(false)} className="text-xs">Close</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Course Refund Dialog Modal */}
      <AnimatePresence>
        {isRefundModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160]" onClick={() => setIsRefundModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl shadow-floating z-[161] overflow-hidden p-6 flex flex-col gap-4 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">Request Course Refund</h3>
              <p className="text-xs text-muted-foreground">You are requesting a refund for <strong>{refundCourseTitle}</strong>. Eligible refunds are credited instantly to your wallet.</p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Reason for Refund *</label>
                <textarea rows={3} required placeholder="Tell us why you want a refund..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full text-xs font-semibold p-2 border border-border bg-card rounded focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <Button variant="ghost" onClick={() => setIsRefundModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (!refundReason.trim()) {
                    toast.error("Please provide a reason.");
                    return;
                  }
                  const res = PaymentService.requestRefund(refundCourseId, refundCourseTitle, refundCourseAmount, refundReason);
                  if (res.success) {
                    toast.success("Refund requested successfully. Pending admin review.");
                    setPurchaseHistoryState(PaymentService.getPurchaseHistory());
                    setIsRefundModalOpen(false);
                    setRefundReason("");
                  } else {
                    toast.error(res.message);
                  }
                }}>Submit Request</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
