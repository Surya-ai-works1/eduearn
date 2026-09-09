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
  UserCheck,
  Notebook,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentService, PurchaseHistoryItem } from "../../../features/payments/services/paymentService";
import { EcosystemSync } from "../../../features/payments/services/marketplaceService";
import { InvoiceView } from "../../../features/payments/components/InvoiceView";
import { cn } from "../../../utils/cn";
import { AiService } from "../../../features/ai/services/aiService";

import { PageWrapper } from "../../../components/layout/PageWrapper";
import { BrandLogo } from "../../../components/shared/BrandLogo";
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
import { PREDEFINED_AVATARS } from "../../../constants/predefinedAvatars";
import { AvatarModal } from "../../../components/shared/AvatarModal";
import { Skeleton } from "../../../components/ui/skeleton";
import { EmptyState } from "../../../components/ui/empty-state";

// Modular Dashboard Components & Hooks
import { useDashboard } from "./hooks/useDashboard";
import { 
  TopNavigation, 
  DashboardHome, 
  MyCoursesTab, 
  NotificationsPanel, 
  DashboardSkeleton 
} from "./components";
import { TuitionDashboardView } from "../../../components/student/TuitionDashboardView";

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

    const dashboard = useDashboard(user, logout, completeProfile);

  const {
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
    isSubmittingProfile,
    isSubmittingPassword,
    passwordForm,
    setPasswordForm,
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
    handleRedeem,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    handleSelectPredefinedAvatar,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deleteStep,
    setDeleteStep,
    deletePassword,
    setDeletePassword,
    deleteConfirmText,
    setDeleteConfirmText,
    isDeletingAccount,
    handleDeleteAccountSubmit,
    levelProgressPercent,
    learningLevel,
    nextLevelXp,
    liveClasses,
    upcomingClasses,
    pastClasses,
    recordedSessions,
    handleStartQuiz,
    handleSelectAnswer,
    attendance
  } = dashboard;

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isConfirmRemoveAllOpen, setIsConfirmRemoveAllOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-tuition", label: "My Tuition", icon: BookOpenCheck },
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

        <div className={cn("py-4 border-b border-border/40 flex items-center min-h-[64px] h-[64px]", isSidebarCollapsed ? "justify-center px-2" : "px-4 justify-between")}>
          <BrandLogo href="/" collapsed={isSidebarCollapsed} />
        </div>

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
              <div className="p-4 border-b border-border flex items-center justify-between min-h-[64px] h-[64px]">
                <BrandLogo href="/" onClick={() => setIsMobileMenuOpen(false)} />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-button cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 border-b border-border/40 flex items-center gap-3">
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
        <TopNavigation
          user={user}
          avatarPreview={avatarPreview}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          coins={coins}
          xp={xp}
          streak={streak}
          learningLevel={learningLevel}
          notifications={notifications}
          handleMarkAllRead={handleMarkAllRead}
          handleMarkOneRead={handleMarkOneRead}
          handleDeleteNotification={handleDeleteNotification}
          setAiAssistantOpen={setAiAssistantOpen}
          setAiAssistantType={setAiAssistantType}
          courseSearch={courseSearch}
          setCourseSearch={setCourseSearch}
          welcomeGreeting={welcomeGreeting}
        />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background relative z-10 scroll-smooth">
          <AnimatePresence mode="wait">
            {/* TAB: DASHBOARD HOME (DEFAULT) */}
            {activeTab === "dashboard" && isLoading && (
              <DashboardSkeleton />
            )}

            {activeTab === "dashboard" && !isLoading && (
              <DashboardHome
                user={user}
                stats={stats}
                streak={streak}
                coins={coins}
                xp={xp}
                learningLevel={learningLevel}
                enrolledCourses={enrolledCourses}
                calendarEvents={calendarEvents}
                countdownSeconds={countdownSeconds}
                formattedCountdown={formattedCountdown}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                dateEventsList={dateEventsList}
                setActiveTab={setActiveTab}
                setAiAssistantOpen={setAiAssistantOpen}
                setAiAssistantType={setAiAssistantType}
                setAiInputText={setAiInputText}
                enrollWishlist={enrollWishlist}
                onResume={(courseId) => navigateToClassroom(router, courseId)}
                welcomeGreeting={welcomeGreeting}
              />
            )}

            {/* TAB: MY TUITION */}
            {activeTab === "my-tuition" && (
              <TuitionDashboardView user={user} />
            )}

            {/* TAB: MY COURSES */}
            {activeTab === "my-courses" && (
              <MyCoursesTab
                enrolledCourses={enrolledCourses}
                certificates={certificates}
                courseSearch={courseSearch}
                setCourseSearch={setCourseSearch}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                handleClaimCertificate={handleClaimCertificate}
                isUploading={isUploading}
              />
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
                      <Button size="sm" className="text-[10px] font-bold">Browse Online Tutoring</Button>
                    </Link>
                  </Card>
                ) : (
                  liveClasses.map((item) => {
                    const isEnrolled = item.isEnrolled;
                    const isZoom = item.platform === "Zoom";
                    const isLive = item.countdown?.toLowerCase().includes("live") || item.countdown?.toLowerCase().includes("now") || item.countdown?.toLowerCase().includes("minute");

                    return (
                      <Card key={item.id} variant="glass" className={`p-6 border ${isEnrolled ? "border-rose-500/25 bg-rose-500/[0.01]" : "border-border/80"} dark:bg-card/65 bg-card flex flex-col gap-6 relative overflow-hidden shadow-soft text-left`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isEnrolled ? "bg-rose-500/10 text-rose-500" : "bg-muted text-muted-foreground"}`}>
                                🔴 LIVE CLASS
                              </span>
                              <span className="text-[9px] font-bold text-indigo-500 font-heading uppercase">
                                Platform: {item.platform || "Google Meet"}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mt-1">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2 font-semibold">
                              <span>Tutor: {item.tutorName}</span>
                              <span>·</span>
                              <span>Duration: {item.duration || "90 minutes"}</span>
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
                                      Join Live Class
                                    </Button>
                                  </a>
                                  {item.countdown && (
                                    <span className="text-[9px] text-rose-500 font-extrabold uppercase mt-1 animate-pulse">
                                      {item.countdown}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded text-center max-w-[200px] leading-tight">
                                  Meet link will be published 10m before class
                                </span>
                              )
                            ) : (
                              <div className="text-right space-y-1.5">
                                <p className="text-[10px] text-muted-foreground/80 font-bold">Live access is included with this course.</p>
                                <Button
                                  size="sm"
                                  onClick={() => toast.info(`Directing you to course details for ${item.title}`)}
                                  className="bg-primary hover:bg-primary/95 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 shadow-soft"
                                >
                                  View Course
                                </Button>
                              </div>
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
                    {upcomingClasses.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic font-semibold col-span-2 text-center py-4">No upcoming classes</p>
                    ) : (
                      upcomingClasses.map((item) => (
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
                      ))
                    )}
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

                {certificates.length === 0 ? (
                  <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Award size={32} className="text-muted-foreground/60" />
                    <h3 className="text-xs font-bold text-foreground">No certificates yet</h3>
                    <p className="text-[10px] text-muted-foreground">Complete an eligible course to earn your first certificate.</p>
                  </Card>
                ) : (
                  certificates.map((cert) => (
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
                            onClick={() => window.open(`/student/certificate/${cert.id}`, "_blank")}
                            className="text-[10px] h-8 font-bold px-2.5"
                          >
                            Preview
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => window.open(`/student/certificate/${cert.id}`, "_blank")}
                            className="text-[10px] h-8 font-bold px-2.5 gap-1"
                          >
                            <Download size={11} /> PDF
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => {
                              const url = `${window.location.origin}/student/certificate/${cert.id}`;
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
                  ))
                )}
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <div>
                        <h3 className="text-sm font-heading font-extrabold text-foreground">
                          Saved Courses ({wishlist.length})
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-semibold">
                          Courses you saved for later enrollment
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsConfirmRemoveAllOpen(true)}
                        className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Remove All Courses
                      </Button>
                    </div>

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
              <NotificationsPanel
                notifications={notifications}
                handleMarkAllRead={handleMarkAllRead}
                handleMarkOneRead={handleMarkOneRead}
                handleDeleteNotification={handleDeleteNotification}
              />
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
            {activeTab === "attendance" && (() => {
              const presentCount = attendance.filter((a: any) => a.status === "Present").length;
              const attendancePercentage = attendance.length > 0
                ? Math.round((presentCount / attendance.length) * 100)
                : 0;
              return (
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
                      { label: "Overall Attendance", value: attendance.length > 0 ? `${attendancePercentage}%` : "—", sub: attendance.length > 0 ? (attendancePercentage >= 75 ? "Above minimum limit (75%)" : "Below minimum limit (75%)") : "No records yet" },
                      { label: "Classes Attended", value: attendance.length > 0 ? `${presentCount} Sessions` : "—", sub: attendance.length > 0 ? `Out of ${attendance.length} conducted` : "No sessions logged" },
                      { label: "Scheduled Today", value: liveClasses.length > 0 ? `${liveClasses.length} Session${liveClasses.length > 1 ? 's' : ''}` : "—", sub: liveClasses.length > 0 ? "Google Meet / Zoom link published" : "No classes today" },
                      { label: "Check-in Status", value: attendance.length > 0 ? "Active" : "—", sub: "Verified via Student ID" }
                    ].map((stat, idx) => (
                      <Card key={idx} variant="glass" className="p-4 border-border/80 bg-card">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">{stat.label}</span>
                        <span className="text-xl font-heading font-black text-foreground block mt-1">{stat.value}</span>
                        <span className="text-[9px] text-emerald-400 block mt-1 font-semibold">{stat.sub}</span>
                      </Card>
                    ))}
                  </div>

                {attendance.length === 0 ? (
                  <EmptyState
                    type="default"
                    title="No attendance records found"
                    description="You are not enrolled in any live tutoring cohorts. Enroll in a student-led cohort to track class check-in log."
                    action={
                      <Button onClick={() => router.push("/tutors")}>
                        Browse Online Tutoring
                      </Button>
                    }
                  />
                ) : (
                  <Card variant="glass" className="p-6 border-border bg-card">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground border-b border-border/60 pb-2.5 mb-4">
                      Live Tutoring Cohorts Attendance Log
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-semibold">
                        <thead>
                          <tr className="border-b border-border/40 text-muted-foreground text-left">
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Subject Batch</th>
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Mentoring Tutor</th>
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Platform Link</th>
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Scheduled Time</th>
                            <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px]">Attendance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20">
                            {attendance.map((log: any, idx: number) => (
                              <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                <td className="py-3 text-foreground">{log.entity_type === 'live_class' ? 'Live Tuition Batch' : 'Doubt Session Room'}</td>
                                <td className="py-3 text-muted-foreground">Instructor Room</td>
                                <td className="py-3 text-primary underline font-sans">Google Meet / Zoom</td>
                                <td className="py-3 text-muted-foreground font-mono">{log.logged_at ? new Date(log.logged_at).toLocaleDateString() : '—'}</td>
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
              );
            })()}

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
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setIsAvatarModalOpen(true)}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-button text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-soft"
                            >
                              CHOOSE AVATAR
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">Choose an avatar that represents your learning journey.</p>
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

                      <Button type="submit" size="sm" className="h-10 text-xs" disabled={isSubmittingProfile}>
                        {isSubmittingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
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
                        <div className="relative">
                          <input
                            type={showOldPassword ? "text" : "password"}
                            value={passwordForm.old}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, old: e.target.value }))}
                            className="h-10 w-full rounded-input border border-border bg-card pl-3 pr-10 text-xs font-semibold text-foreground focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                          >
                            {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 text-xs text-left">
                          <label className="font-bold text-foreground">New Password *</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.new}
                              onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))}
                              className="h-10 w-full rounded-input border border-border bg-card pl-3 pr-10 text-xs font-semibold text-foreground focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-left">
                          <label className="font-bold text-foreground">Confirm New Password *</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordForm.confirm}
                              onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                              className="h-10 w-full rounded-input border border-border bg-card pl-3 pr-10 text-xs font-semibold text-foreground focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" size="sm" disabled={isSubmittingPassword} className="h-10 text-xs gap-2">
                        {isSubmittingPassword ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Change Password"
                        )}
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
      {/* Confirm Remove All Wishlist Modal */}
      <AnimatePresence>
        {isConfirmRemoveAllOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160]"
              onClick={() => setIsConfirmRemoveAllOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl z-[161] overflow-hidden p-6 flex flex-col gap-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-sm font-heading font-extrabold text-foreground flex items-center gap-2">
                  <Trash2 size={16} className="text-red-500" /> Remove All Wishlisted Courses?
                </h3>
                <button
                  onClick={() => setIsConfirmRemoveAllOpen(false)}
                  className="p-1 hover:bg-muted rounded cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground font-semibold">
                <p>Are you sure you want to clear all <strong>{wishlist.length} courses</strong> from your saved wishlist?</p>
                <p className="text-[11px] text-muted-foreground/80">This action will remove all saved items. You can add them again anytime from the course catalog.</p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmRemoveAllOpen(false)}
                  className="h-8 text-xs font-bold px-4"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setWishlist([]);
                    setIsConfirmRemoveAllOpen(false);
                    toast.info("All courses removed from wishlist");
                  }}
                  className="h-8 text-xs font-bold px-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Clear All
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Learner Avatar Selection Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={handleSelectPredefinedAvatar}
        currentAvatarUrl={avatarPreview}
      />
    </div>
  );
}
