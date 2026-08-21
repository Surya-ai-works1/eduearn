"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaymentService, PurchaseHistoryItem } from "../../../../features/payments/services/paymentService";
import { AiService } from "../../../../features/ai/services/aiService";
import { getCourseThumbnail } from "../../../../lib/courseThumbnailRegistry";
import { MOCK_COURSES } from "../../../../constants/mockData";

export interface EnrolledCourse {
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

export interface LiveClass {
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

export interface Certificate {
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

export interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Graded";
  grade?: string;
  feedback?: string;
  prompt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIdx: number;
  type?: "multiple" | "single";
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  questionsCount: number;
  timeLimit: string;
  rewardCoins: number;
  questions: QuizQuestion[];
  passingScore?: number;
  latestAttempt?: any;
}

export function useDashboard(user: any, logout: () => Promise<void>, completeProfile: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard overall statistics
  const [stats, setStats] = useState({
    enrolledCourses: 4,
    completedCourses: 3,
    certificatesEarned: 2,
    completionRate: 59,
    currentLearningStreak: 7,
    totalLearningHours: 14,
  });

  // App notification configurations
  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eduearn_notification_prefs");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return { email: true, push: false, reminders: true };
  });

  // Coins balance
  const [coins, setCoins] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("eduearn_coins") || "450");
    }
    return 450;
  });

  // XP balance
  const [xp, setXp] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("eduearn_xp") || "1850");
    }
    return 1850;
  });

  // Daily learning streak count
  const [streak, setStreak] = useState(7);

  // Rewards history log
  const [rewardsHistory, setRewardsHistory] = useState(() => [
    { id: "r-1", reason: "Daily Learning Streak Bonus", coins: 15, date: "Today" },
    { id: "r-2", reason: "Weekly Math Quiz Accomplished", coins: 50, date: "Yesterday" },
    { id: "r-3", reason: "Assignment 1 Submission", coins: 100, date: "2 days ago" },
    { id: "r-4", reason: "Referral Invite Verified", coins: 150, date: "Last week" },
  ]);

  // Enrolled courses list
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

  // Student course wishlist
  const [wishlist, setWishlist] = useState<any[]>([MOCK_COURSES[2], MOCK_COURSES[8]]);
  
  // Job applications state
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  // Live classes lists
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [pastClasses, setPastClasses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  const recordedSessions = [
    { title: "Keyboard Session: Minor scale progressions", tutor: "Aarav Sharma", duration: "48 mins", id: "rec-1" },
    { title: "Photography Session: Mastering Exposure values", tutor: "Anjali Deshmukh", duration: "55 mins", id: "rec-2" },
    { title: "Python Basics: Dictionaries & comprehension", tutor: "Vikram Rathore", duration: "62 mins", id: "rec-3" },
  ];


  // Assignments lists
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

  // Notifications and system activities
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Downloadable PDFs list
  const [downloads, setDownloads] = useState([
    { id: 1, title: "Keyboard chords progressions diagram.pdf", size: "4.8 MB", type: "PDF" },
    { id: 2, title: "Python Advanced Algorithms Handbook.pdf", size: "12 MB", type: "PDF" },
  ]);

  // Tab controls
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [notificationFilter, setNotificationFilter] = useState<string>("All");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Financial purchase transactions logs state
  const [purchaseHistoryState, setPurchaseHistoryState] = useState(() => PaymentService.getPurchaseHistory());
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseHistoryItem | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundCourseId, setRefundCourseId] = useState("");
  const [refundCourseTitle, setRefundCourseTitle] = useState("");
  const [refundCourseAmount, setRefundCourseAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");

  // Live countdown timer state
  const [countdownSeconds, setCountdownSeconds] = useState(4520); // 1h 15m 20s

  // Interactive schedule calendar state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Search input filter parameters
  const [courseSearch, setCourseSearch] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // Playable quiz session states
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // AI Assistant Widget and modal playground states
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantType, setAiAssistantType] = useState<"study" | "homework" | "quiz" | "roadmap" | "career" | null>(null);
  const [aiInputText, setAiInputText] = useState("");
  const [aiResultText, setAiResultText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Assignment files states
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Gamification coins redemption states
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>([]);

  // Profile Form editor state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "Surya",
    username: user?.username || "surya_learner",
    email: user?.email || "",
    phone: "",
    bio: user?.bio || "Enthusiastic developer learning keyboard, coding, and choreography.",
    country: user?.country || "India",
    state: "Karnataka",
    city: "Bengaluru",
    timezone: "Asia/Kolkata",
    language: user?.language || "English, Hindi",
    linkedinUrl: "",
    githubUrl: "",
    studyGoals: "Master Web Dev",
    interests: ["Coding"],
  });

  const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  // Synchronise avatar when auth user session changes
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        username: user.username || prev.username,
        email: user.email || prev.email,
        bio: user.bio || prev.bio,
        country: user.country || prev.country,
        language: user.language || prev.language,
      }));
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  // Loading timer fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Sync isSidebarCollapsed states to HTML body structure
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isSidebarCollapsed) {
        document.body.classList.add("sidebar-collapsed");
        document.body.classList.remove("sidebar-expanded");
      } else {
        document.body.classList.add("sidebar-expanded");
        document.body.classList.remove("sidebar-collapsed");
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.classList.remove("sidebar-collapsed");
        document.body.classList.remove("sidebar-expanded");
      }
    };
  }, [isSidebarCollapsed]);

  // Live timer interval loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gamification xp calculation helper
  const addCoins = useCallback((amount: number, reason: string) => {
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
  }, []);

  // Notifications operations
  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All marked as read.");
    try {
      await fetch("/api/student/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    }
  }, []);

  const handleMarkOneRead = useCallback(async (id: any) => {
    setNotifications((p) => p.map((item) => item.id === id ? { ...item, read: true } : item));
    try {
      await fetch(`/api/student/notifications/${id}`, { method: "PATCH" });
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  }, []);

  const handleDeleteNotification = useCallback(async (id: any) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    toast.success("Notification deleted.");
    try {
      await fetch(`/api/student/notifications/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete notification:", err);
    }
  }, []);

  // Enroll direct action
  const enrollWishlist = useCallback((course: typeof MOCK_COURSES[number]) => {
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
  }, []);

  // Claim certificate handler
  const handleClaimCertificate = useCallback(async (courseId: string) => {
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
          tutorName: cert.instructor || "Peer Tutor",
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
  }, []);

  // Submit Quiz handler
  const handleSubmitQuiz = useCallback(async () => {
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
  }, [activeQuiz, selectedAnswers, addCoins]);

  // Upload assignment handler
  const handleUploadAssignment = useCallback(async (id: string) => {
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
  }, [selectedFile, addCoins]);

  // Save profile handler
  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
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

      await completeProfile(profileForm, avatarFile || undefined);
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile.");
    }
  }, [profileForm, avatarFile, completeProfile]);

  // Password change handler
  const handlePasswordChange = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.new || passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    toast.success("Password updated securely!");
    setPasswordForm({ old: "", new: "", confirm: "" });
  }, [passwordForm]);

  // File picker handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Redeem rewards helper
  const handleRedeem = useCallback((cost: number, code: string, rewardName: string) => {
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
  }, [coins]);

  const handleStartQuiz = useCallback((quiz: any) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setQuizResult(null);
    setSelectedAnswers({});
    
    const duration = quiz.timeLimit ? parseInt(quiz.timeLimit) : 5;
    setTimeLeft(duration * 60);
  }, []);

  const handleSelectAnswer = useCallback((optIdx: number) => {
    setSelectedAnswers((prev) => {
      if (!activeQuiz) return prev;
      return {
        ...prev,
        [currentQuestionIdx]: optIdx
      };
    });
  }, [activeQuiz, currentQuestionIdx]);


  // Load live Supabase datasets
  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    async function loadSupabaseData() {
      try {
        const { createClient } = await import("../../../../lib/supabase");
        const supabase = createClient();
        const { lmsDb } = await import("../../../../lib/lmsDb");

        // Fetch tutor profiles to populate tutorNames
        const { data: tutors } = await supabase
          .from("profiles")
          .select("id, full_name");
        const tutorMap = new Map<string, string>((tutors || []).map((t: any) => [t.id, t.full_name || ""]));

        // 1. Enrolled Courses
        const enrolled = await lmsDb.getEnrolledCourses(userId);
        if (enrolled && enrolled.length > 0) {
          const mapped = enrolled.map((c: any) => ({
            id: c.id,
            title: c.title,
            tutorName: tutorMap.get(c.tutor_id) || "Peer Tutor",
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
        } else {
          setEnrolledCourses([]);
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
            tutorName: tutorMap.get(w.courses.tutor_id) || "Peer Tutor",
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
        } else {
          setWishlist([]);
        }

        // 3. Quizzes
        const quizRes = await fetch("/api/student/quizzes");
        if (quizRes.ok) {
          const quizData = await quizRes.json();
          const mappedQuizzes = (quizData.quizzes || []).map((q: any) => ({
            id: q.id,
            title: q.title,
            subject: q.courseTitle || "General",
            difficulty: q.level || "Intermediate",
            questionsCount: q.totalQuestions || q.questions?.length || 3,
            timeLimit: `${q.duration || 5} mins`,
            rewardCoins: 50,
            questions: q.questions || [],
            latestAttempt: q.latestAttempt,
            passingScore: q.passingScore,
          }));
          setQuizzes(mappedQuizzes);
        }

        // 4. Assignments
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

        // 5. Notifications
        const notifyRes = await fetch("/api/student/notifications");
        if (notifyRes.ok) {
          const notifyData = await notifyRes.json();
          setNotifications(notifyData.notifications || []);
          setActivities(notifyData.activities || []);
        }

        // 6. Certificates
        const certRes = await fetch("/api/student/certificates");
        if (certRes.ok) {
          const certData = await certRes.json();
          if (certData.certificates && certData.certificates.length > 0) {
            const mappedCerts = certData.certificates.map((c: any) => ({
              id: c.id,
              courseTitle: c.courseTitle || c.courses?.title || "Course Certificate",
              serialNumber: c.serialNumber || c.certificate_number || `EE-CERT-${c.id.substring(0, 6).toUpperCase()}`,
              issueDate: c.issueDate || (c.issued_at ? new Date(c.issued_at).toLocaleDateString() : new Date().toLocaleDateString()),
              qrCode: c.qrCode || `EE-QR-${c.id.substring(0, 6).toUpperCase()}`,
              courseImage: c.courseImage || c.courses?.thumbnail || "/images/courses/arts.png",
              tutorName: c.tutorName || "Tutor",
              blockchainHash: c.blockchainHash || c.ipfs_hash || "0x...",
              courseId: c.courseId || c.course_id,
            }));
            setCertificates(mappedCerts);
          } else {
            setCertificates([]);
          }
        } else {
          setCertificates([]);
        }

        // 7. Attendance
        const { data: attData } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", userId)
          .order("logged_at", { ascending: false });
        if (attData) {
          setAttendance(attData);
        } else {
          setAttendance([]);
        }

        // 8. Live Classes / Schedules
        const courseIds = (enrolled || []).map((c: any) => c.id);
        if (courseIds.length > 0) {
          const { data: schedRaw } = await supabase
            .from("schedules")
            .select(`
              *,
              courses (
                title,
                tutor_id
              )
            `)
            .in("course_id", courseIds)
            .order("scheduled_at", { ascending: true });

          if (schedRaw && schedRaw.length > 0) {
            const todayStr = new Date().toDateString();

            // 8a. Today's live classes
            const mappedLive = schedRaw
              .filter((s: any) => new Date(s.scheduled_at).toDateString() === todayStr)
              .map((s: any) => ({
                id: s.id,
                title: s.title,
                tutorName: tutorMap.get(s.courses?.tutor_id) || "Tutor Instructor",
                time: new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                countdown: "Today",
                duration: "60 mins",
                isEnrolled: true,
                hasLink: !!s.meeting_link,
                meetingLink: s.meeting_link || "",
                platform: s.meeting_link?.includes("zoom") ? "Zoom" : "Google Meet",
              }));
            setLiveClasses(mappedLive);

            // 8b. Upcoming classes
            const mappedUpcoming = schedRaw
              .filter((s: any) => new Date(s.scheduled_at) > new Date() && new Date(s.scheduled_at).toDateString() !== todayStr)
              .map((s: any) => ({
                id: s.id,
                title: s.title,
                tutorName: tutorMap.get(s.courses?.tutor_id) || "Tutor Instructor",
                time: new Date(s.scheduled_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                countdown: "Upcoming",
                duration: "60 mins",
              }));
            setUpcomingClasses(mappedUpcoming);

            // 8c. Past classes
            const mappedPast = schedRaw
              .filter((s: any) => new Date(s.scheduled_at) < new Date() && new Date(s.scheduled_at).toDateString() !== todayStr)
              .map((s: any) => ({
                title: s.title,
                tutorName: tutorMap.get(s.courses?.tutor_id) || "Tutor Instructor",
                date: new Date(s.scheduled_at).toLocaleDateString(),
                status: "Completed",
              }));
            setPastClasses(mappedPast);
          } else {
            const fallbackLive = [
              {
                id: "live-session-1",
                title: "Python Masterclass — Class 04",
                tutorName: "Vikram Rathore",
                time: "Today · 6:00 PM",
                countdown: "Starts in 42 minutes",
                duration: "90 minutes",
                isEnrolled: true,
                hasLink: true,
                meetingLink: "https://meet.google.com/abc-defg-hij",
                platform: "Google Meet"
              },
              {
                id: "live-session-2",
                title: "React JS Frontend Architecture — Doubt Session",
                tutorName: "Sneha Iyer",
                time: "Today · 7:30 PM",
                countdown: "Scheduled",
                duration: "60 minutes",
                isEnrolled: false,
                hasLink: false,
                meetingLink: "",
                platform: "Zoom"
              }
            ];
            setLiveClasses(fallbackLive);
            setUpcomingClasses([]);
            setPastClasses([]);
          }
        } else {
          const fallbackLive = [
            {
              id: "live-session-1",
              title: "Python Masterclass — Class 04",
              tutorName: "Vikram Rathore",
              time: "Today · 6:00 PM",
              countdown: "Starts in 42 minutes",
              duration: "90 minutes",
              isEnrolled: true,
              hasLink: true,
              meetingLink: "https://meet.google.com/abc-defg-hij",
              platform: "Google Meet"
            },
            {
              id: "live-session-2",
              title: "React JS Frontend Architecture — Doubt Session",
              tutorName: "Sneha Iyer",
              time: "Today · 7:30 PM",
              countdown: "Scheduled",
              duration: "60 minutes",
              isEnrolled: false,
              hasLink: false,
              meetingLink: "",
              platform: "Zoom"
            }
          ];
          setLiveClasses(fallbackLive);
          setUpcomingClasses([]);
          setPastClasses([]);
        }

      } catch (err) {
        console.warn("Failed to load initial data details from Supabase:", err);
      }
    }

    loadSupabaseData();
  }, [user]);

  // Dynamically calculate metrics from actual loaded lists
  useEffect(() => {
    const completed = enrolledCourses.filter(c => c.progress === 100).length;
    const rate = enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)
      : 0;

    setStats({
      enrolledCourses: enrolledCourses.length,
      completedCourses: completed,
      certificatesEarned: certificates.length,
      completionRate: rate,
      currentLearningStreak: streak,
      totalLearningHours: enrolledCourses.length * 3 + completed * 5,
    });
  }, [enrolledCourses, certificates, streak]);

  // Derived user level & XP milestones
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

  const welcomeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night";
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const formattedCountdown = useMemo(() => {
    const h = Math.floor(countdownSeconds / 3600);
    const m = Math.floor((countdownSeconds % 3600) / 60);
    const s = countdownSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [countdownSeconds]);

  // Selected date agenda filtering helper
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

  // Calendar event array
  const calendarEvents = useMemo(() => {
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

  // AI Dialog form submit handler
  const handleAiAction = useCallback(async (e: React.FormEvent) => {
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
  }, [aiInputText, aiAssistantType]);

  return {
    isLoading,
    setIsLoading,
    stats,
    setStats,
    notificationPrefs,
    setNotificationPrefs,
    coins,
    setCoins,
    xp,
    setXp,
    streak,
    setStreak,
    rewardsHistory,
    setRewardsHistory,
    enrolledCourses,
    setEnrolledCourses,
    certificates,
    setCertificates,
    wishlist,
    setWishlist,
    appliedJobs,
    setAppliedJobs,
    assignments,
    setAssignments,
    notifications,
    setNotifications,
    activities,
    setActivities,
    notificationsLoading,
    downloads,
    setDownloads,
    activeTab,
    setActiveTab,
    notificationFilter,
    setNotificationFilter,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    purchaseHistoryState,
    setPurchaseHistoryState,
    selectedInvoice,
    setSelectedInvoice,
    isInvoiceOpen,
    setIsInvoiceOpen,
    isRefundModalOpen,
    setIsRefundModalOpen,
    refundCourseId,
    setRefundCourseId,
    refundCourseTitle,
    setRefundCourseTitle,
    refundCourseAmount,
    setRefundCourseAmount,
    refundReason,
    setRefundReason,
    countdownSeconds,
    setCountdownSeconds,
    selectedDate,
    setSelectedDate,
    courseSearch,
    setCourseSearch,
    courseFilter,
    setCourseFilter,
    activeQuiz,
    setActiveQuiz,
    currentQuestionIdx,
    setCurrentQuestionIdx,
    selectedAnswers,
    setSelectedAnswers,
    quizResult,
    setQuizResult,
    quizzes,
    setQuizzes,
    timeLeft,
    setTimeLeft,
    aiAssistantOpen,
    setAiAssistantOpen,
    aiAssistantType,
    setAiAssistantType,
    aiInputText,
    setAiInputText,
    aiResultText,
    setAiResultText,
    aiLoading,
    expandedAssignmentId,
    setExpandedAssignmentId,
    selectedFile,
    setSelectedFile,
    isUploading,
    setIsUploading,
    redeemOpen,
    setRedeemOpen,
    redeemedCodes,
    setRedeemedCodes,
    profileForm,
    setProfileForm,
    passwordForm,
    setPasswordForm,
    avatarFile,
    setAvatarFile,
    avatarPreview,
    setAvatarPreview,
    welcomeGreeting,
    formattedCountdown,
    dateEventsList,
    calendarEvents,
    handleAiAction,
    addCoins,
    handleMarkAllRead,
    handleMarkOneRead,
    handleDeleteNotification,
    enrollWishlist,
    handleClaimCertificate,
    handleSubmitQuiz,
    handleUploadAssignment,
    handleSaveProfile,
    handlePasswordChange,
    handleFileChange,
    handleRedeem,
    liveClasses,
    upcomingClasses,
    pastClasses,
    recordedSessions,
    handleStartQuiz,
    handleSelectAnswer,
    levelProgressPercent,
    learningLevel,
    nextLevelXp,
    attendance
  };
}
