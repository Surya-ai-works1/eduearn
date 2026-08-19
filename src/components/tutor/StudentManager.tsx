"use client";

import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  Calendar,
  Info,
  Award,
  TrendingUp,
  UserCheck,
  Percent,
  AlertTriangle,
  Send,
  BarChart3,
  User,
  Phone,
  Clock,
  BookOpen,
  Filter,
  CheckCircle,
  Plus,
  Download,
  HelpCircle,
  FileCheck2,
  Tv,
  MessageCircle,
  Inbox,
  UserX,
  Sparkles,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { NoStudents } from "./EmptyState";
import type { StudentProgress, TutorCourse } from "./types";

interface StudentManagerProps {
  students: StudentProgress[];
  myCourses: TutorCourse[];
  studentSearch: string;
  setStudentSearch: (v: string) => void;
  studentFilterCourse: string;
  setStudentFilterCourse: (v: string) => void;
  studentFilterProgress: string;
  setStudentFilterProgress: (v: string) => void;
  studentSortBy: string;
  setStudentSortBy: (v: string) => void;
  onIssueCertificate?: (enrollmentId: string) => Promise<void>;
}

interface LocalStudentProgress extends StudentProgress {
  email?: string;
  enrollmentDate?: string;
  status?: string;
  batch?: string;
  assignmentsSubmitted?: string;
  avgMarks?: string;
  certificateStatus?: string;
  phone?: string;
  avatarUrl?: string;
  learningMode?: string;
  watchTime?: string;
  doubtSessionsCount?: string;
  lastActive?: string;
  engagementScore?: number;
  gradeHistory?: { name: string; score: string; date?: string; feedback?: string; status?: string }[];
  attendanceLogs?: { date: string; present: boolean; status?: string }[];
  presentClasses?: number;
  absentClasses?: number;
  lateJoins?: number;
  recentActivities?: { date: string; desc: string }[];
  liveSessions?: { title: string; status: "Attended" | "Missed" }[];
  recordedLessons?: { title: string; watchedAt: string }[];
  doubtSessions?: { question: string; status: "Answered" | "Pending" }[];
}

const MOCK_STUDENTS: LocalStudentProgress[] = [
  {
    id: "stud-1",
    name: "Aarav Kumar",
    courseTitle: "Python Complete Package",
    progress: 72,
    attendance: 80,
    quizScore: "A",
    certificateEarned: false,
    assignmentStatus: "Pending",
    email: "aarav.kumar@gmail.com",
    phone: "+91 98234 56781",
    enrollmentDate: "2026-06-15",
    status: "Active",
    batch: "Batch A",
    assignmentsSubmitted: "5/6",
    avgMarks: "92/100",
    certificateStatus: "Pending",
    learningMode: "Complete Package",
    watchTime: "14h 32m",
    doubtSessionsCount: "3/4",
    lastActive: "2 min ago",
    engagementScore: 82,
    avatarUrl: "",
    recentActivities: [
      { date: "2 mins ago", desc: "Completed Lesson 8 (Decorators)" },
      { date: "1 hour ago", desc: "Attended Doubt Session #3" },
      { date: "Yesterday", desc: "Submitted Assignment: Python Functions" }
    ],
    gradeHistory: [
      { name: "Python Functions Assignment", score: "92/100", date: "2026-07-20", feedback: "Excellent implementation of recursive loops", status: "Graded" },
      { name: "OOP Assignment", score: "Pending", date: "2026-07-28", feedback: "", status: "Pending" }
    ],
    liveSessions: [
      { title: "Python Basics", status: "Attended" },
      { title: "Functions & Closures", status: "Attended" },
      { title: "OOP Workshop", status: "Missed" }
    ],
    recordedLessons: [
      { title: "Decorators & Generators", watchedAt: "18 min ago" },
      { title: "Advanced Modules", watchedAt: "Yesterday" }
    ],
    doubtSessions: [
      { question: "Why do we use async here?", status: "Answered" },
      { question: "Can you explain decorators again?", status: "Pending" }
    ]
  },
  {
    id: "stud-2",
    name: "Meera Nair",
    courseTitle: "React JS Frontend Architecture",
    progress: 95,
    attendance: 93,
    quizScore: "A+",
    certificateEarned: false,
    assignmentStatus: "Graded",
    email: "meera.nair@outlook.com",
    phone: "+91 97432 10984",
    enrollmentDate: "2026-06-01",
    status: "Active",
    batch: "Batch B",
    assignmentsSubmitted: "8/8",
    avgMarks: "96/100",
    certificateStatus: "Eligible",
    learningMode: "Live + Recorded",
    watchTime: "24h 10m",
    doubtSessionsCount: "6/6",
    lastActive: "18 min ago",
    engagementScore: 95,
    avatarUrl: "",
    recentActivities: [
      { date: "18 mins ago", desc: "Attended the doubt session on Redux" },
      { date: "3 hours ago", desc: "Completed Quiz 3" }
    ],
    gradeHistory: [
      { name: "Redux Architecture Project", score: "98/100", date: "2026-07-22", feedback: "Flawless state machine structure", status: "Graded" }
    ],
    liveSessions: [
      { title: "Redux Toolkit", status: "Attended" },
      { title: "Custom Hooks", status: "Attended" }
    ],
    recordedLessons: [
      { title: "CSS-in-JS vs TailWind", watchedAt: "3 hours ago" }
    ],
    doubtSessions: [
      { question: "How to structure sliced folders?", status: "Answered" }
    ]
  },
  {
    id: "stud-3",
    name: "Rahul Sharma",
    courseTitle: "Python Complete Package",
    progress: 42,
    attendance: 40,
    quizScore: "B",
    certificateEarned: false,
    assignmentStatus: "Pending",
    email: "rahul.sharma@yahoo.com",
    phone: "+91 91234 09876",
    enrollmentDate: "2026-07-02",
    status: "At Risk",
    batch: "Batch A",
    assignmentsSubmitted: "2/6",
    avgMarks: "68/100",
    certificateStatus: "Pending",
    learningMode: "Live",
    watchTime: "3h 15m",
    doubtSessionsCount: "0/4",
    lastActive: "8 days ago",
    engagementScore: 35,
    avatarUrl: "",
    recentActivities: [
      { date: "8 days ago", desc: "Last accessed course dashboard" }
    ],
    gradeHistory: [
      { name: "Variables Assignment", score: "68/100", date: "2026-07-05", feedback: "Incomplete answers on floats", status: "Graded" }
    ],
    liveSessions: [
      { title: "Python Basics", status: "Attended" },
      { title: "Loops & Conditions", status: "Missed" },
      { title: "OOP Workshop", status: "Missed" }
    ],
    recordedLessons: [],
    doubtSessions: []
  },
  {
    id: "stud-4",
    name: "Priya Patel",
    courseTitle: "Fullstack Web Development",
    progress: 100,
    attendance: 100,
    quizScore: "A+",
    certificateEarned: true,
    assignmentStatus: "Graded",
    email: "priya.patel@gmail.com",
    phone: "+91 99012 34567",
    enrollmentDate: "2026-05-10",
    status: "Completed",
    batch: "Batch C",
    assignmentsSubmitted: "12/12",
    avgMarks: "98/100",
    certificateStatus: "Issued",
    learningMode: "Complete Package",
    watchTime: "45h 30m",
    doubtSessionsCount: "8/8",
    lastActive: "1 day ago",
    engagementScore: 100,
    avatarUrl: "",
    recentActivities: [
      { date: "Yesterday", desc: "Awarded course graduation certificate" }
    ],
    gradeHistory: [
      { name: "Final Portfolio Project", score: "100/100", date: "2026-07-10", feedback: "Astounding styling and performance", status: "Graded" }
    ],
    liveSessions: [
      { title: "NextJS Deployments", status: "Attended" }
    ],
    recordedLessons: [
      { title: "Docker Containerization", watchedAt: "2 days ago" }
    ],
    doubtSessions: []
  }
];

export const StudentManager = React.memo(function StudentManager({
  students,
  myCourses,
  studentSearch,
  setStudentSearch,
  studentFilterCourse,
  setStudentFilterCourse,
  studentFilterProgress,
  setStudentFilterProgress,
  studentSortBy,
  setStudentSortBy,
  onIssueCertificate,
}: StudentManagerProps) {
  const [selectedStudent, setSelectedStudent] = useState<LocalStudentProgress | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [learningModeFilter, setLearningModeFilter] = useState("All");
  const [attendanceFilter, setAttendanceFilter] = useState("All");
  const [lastActiveFilter, setLastActiveFilter] = useState("All");

  // Chat/Support state
  const [chatMessage, setChatMessage] = useState("");
  const [chatLogs, setChatLogs] = useState<Record<string, { sender: string; text: string; time: string }[]>>({
    "stud-1": [
      { sender: "student", text: "Why do we use async functions in event loops?", time: "2 hours ago" },
      { sender: "tutor", text: "Async handles concurrency without blocking execution blocks.", time: "1 hour ago" }
    ]
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Enrich students with packages details & outcomes
  const enrichedStudents = useMemo(() => {
    const sourceStudents = students.length > 0 ? students : [];

    const mappedContext = sourceStudents.map((s, idx) => {
      const mode = idx % 3 === 0 ? "Complete Package" : idx % 2 === 0 ? "Live + Recorded" : "Self-Paced";
      const status = s.progress === 100 ? "Completed" : s.progress < 30 ? "At Risk" : s.progress > 0 ? "Active" : "Inactive";
      const watchTime = `${Math.floor(s.progress * 0.3)}h ${Math.floor((s.progress % 10) * 6)}m`;
      const doubtSessionsCount = `${idx % 3 === 0 ? "3/4" : "1/2"}`;
      const lastActive = idx % 3 === 0 ? "8 days ago" : idx % 2 === 0 ? "3 hours ago" : "Yesterday";
      const engagement = Math.round(s.progress * 0.7 + s.attendance * 0.3);

      const presentClasses = Math.round((s.attendance / 100) * 10);
      const absentClasses = 10 - presentClasses;

      return {
        ...s,
        email: (s as any).email || `${s.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: (s as any).phone || `+91 98765 ${43210 - idx * 7}`,
        enrollmentDate: (s as any).enrollmentDate || `2026-07-${10 + (idx % 12)}`,
        status,
        batch: (s as any).batch || `Batch ${["A", "B", "C"][idx % 3]}`,
        assignmentsSubmitted: (s as any).assignmentsSubmitted || `${Math.min((idx % 4) + 2, 5)}/6`,
        avgMarks: (s as any).avgMarks || `${70 + ((idx * 4) % 26)}/100`,
        certificateStatus: s.certificateEarned ? "Issued" : s.progress === 100 ? "Eligible" : "Pending",
        learningMode: mode,
        watchTime,
        doubtSessionsCount,
        lastActive,
        engagementScore: engagement,
        presentClasses,
        absentClasses,
        lateJoins: idx % 3,
        recentActivities: [
          { date: "2 mins ago", desc: "Accessed syllabus dashboard page" },
          { date: "Yesterday", desc: "Attended weekly cohort lecture" }
        ],
        gradeHistory: [
          { name: "Assignment 1", score: s.assignmentStatus === "Graded" ? "90/100" : "78/100", date: "2026-07-20", feedback: "Well structured solution", status: "Graded" }
        ],
        liveSessions: [
          { title: "Core Class Basics", status: "Attended" as const },
          { title: "Functions & Closures", status: "Attended" as const }
        ],
        recordedLessons: [
          { title: "Course Introduction Video", watchedAt: "1 day ago" }
        ],
        doubtSessions: []
      };
    });

    const finalStudents: LocalStudentProgress[] = [...mappedContext];
    MOCK_STUDENTS.forEach((mock) => {
      if (!finalStudents.some((s) => s.name === mock.name)) {
        finalStudents.push(mock);
      }
    });

    return finalStudents;
  }, [students]);

  // Aggregate KPI metrics
  const kpiStats = useMemo(() => {
    if (enrichedStudents.length === 0) {
      return { total: 0, newThisMonth: 0, active: 0, atRisk: 0, completionRate: 0, avgEngagement: 0, avgAttendance: 0 };
    }
    const active = enrichedStudents.filter((s) => s.status === "Active" || s.status === "Completed").length;
    const atRisk = enrichedStudents.filter((s) => s.status === "At Risk" || (s.lastActive && s.lastActive.includes("8 days"))).length;
    const completed = enrichedStudents.filter((s) => s.progress === 100).length;
    const totalAttendance = enrichedStudents.reduce((sum, s) => sum + s.attendance, 0);
    const totalEngagement = enrichedStudents.reduce((sum, s) => sum + (s.engagementScore || 50), 0);

    return {
      total: enrichedStudents.length,
      newThisMonth: Math.max(1, Math.round(enrichedStudents.length * 0.25)),
      active,
      atRisk,
      completionRate: Math.round((completed / enrichedStudents.length) * 100),
      avgEngagement: Math.round(totalEngagement / enrichedStudents.length),
      avgAttendance: Math.round(totalAttendance / enrichedStudents.length)
    };
  }, [enrichedStudents]);

  // Filters logic
  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((s) => {
      // Search
      const searchLower = studentSearch.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(searchLower) ||
        s.courseTitle.toLowerCase().includes(searchLower) ||
        (s.email && s.email.toLowerCase().includes(searchLower));

      // Category tab
      if (statusFilter !== "All" && s.status !== statusFilter) return false;

      // Dropdowns
      if (studentFilterCourse !== "All" && !s.courseTitle.toLowerCase().includes(studentFilterCourse.toLowerCase())) return false;
      if (batchFilter !== "All" && s.batch !== batchFilter) return false;
      if (learningModeFilter !== "All" && s.learningMode !== learningModeFilter) return false;

      // Attendance filter dropdown
      if (attendanceFilter === "Low" && s.attendance >= 60) return false;
      if (attendanceFilter === "High" && s.attendance < 85) return false;

      // Last active filter dropdown
      if (lastActiveFilter === "Inactive" && s.lastActive && !s.lastActive.includes("days")) return false;
      if (lastActiveFilter === "Active" && s.lastActive && s.lastActive.includes("days")) return false;

      return matchesSearch;
    }).sort((a, b) => {
      if (studentSortBy === "recently-active") {
        return (a.lastActive || "").localeCompare(b.lastActive || "");
      }
      if (studentSortBy === "progress-desc") return b.progress - a.progress;
      if (studentSortBy === "progress-asc") return a.progress - b.progress;
      if (studentSortBy === "newest") return (b.enrollmentDate || "").localeCompare(a.enrollmentDate || "");
      if (studentSortBy === "engaged") return (b.engagementScore || 0) - (a.engagementScore || 0);
      return 0;
    });
  }, [enrichedStudents, studentSearch, statusFilter, studentFilterCourse, batchFilter, learningModeFilter, attendanceFilter, lastActiveFilter, studentSortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSendMessage = () => {
    if (!selectedStudent || !chatMessage.trim()) return;
    const studentId = selectedStudent.id;
    const newMsg = { sender: "tutor", text: chatMessage, time: "Just now" };
    setChatLogs((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), newMsg]
    }));
    setChatMessage("");
    toast.success("Message sent to student success channel!");
  };

  const handleExport = useCallback(() => {
    const headers = "Name,Email,Course,Learning Mode,Progress,Attendance,Assignments,Watch Time,Status\n";
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.name}","${s.email || ""}","${s.courseTitle}","${s.learningMode || ""}",${s.progress}%,${s.attendance}%,"${s.assignmentsSubmitted || ""}","${s.watchTime || ""}",${s.status}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eduearn_students_report.csv";
    a.click();
    toast.success("Exported students success sheets.");
  }, [filteredStudents]);

  // Identify at-risk alerts dynamically
  const atRiskStudents = useMemo(() => {
    return enrichedStudents.filter((s) => s.status === "At Risk" || (s.lastActive && s.lastActive.includes("8 days"))).slice(0, 3);
  }, [enrichedStudents]);

  return (
    <motion.div
      key="student-success-center"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 text-left pb-16"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-indigo-500/10 via-background to-background p-6 rounded-2xl border border-indigo-500/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
            <Sparkles size={10} /> Success Center
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">My Students</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Understand your learners, track progress, and support them throughout their learning journey.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 select-none">
          <Button
            onClick={() => toast.success("Invitation link copied to clipboard!")}
            size="sm"
            className="h-8.5 text-xs bg-primary text-white font-bold border-none"
          >
            <Plus size={14} className="mr-1" /> Invite Students
          </Button>
          <Button
            onClick={handleExport}
            size="sm"
            variant="outline"
            className="h-8.5 text-xs font-bold border-border/80"
          >
            <Download size={13} className="mr-1" /> Export
          </Button>
          <Button
            onClick={() => toast.info("Opening students metrics analytical dashboard...")}
            size="sm"
            variant="outline"
            className="h-8.5 text-xs font-bold border-border/80"
          >
            View Analytics
          </Button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 select-none">
        {[
          { label: "Total Students", value: kpiStats.total, icon: UserCheck, color: "text-primary bg-primary/10" },
          { label: "New This Month", value: kpiStats.newThisMonth, icon: Plus, color: "text-sky-500 bg-sky-500/10" },
          { label: "Active Learners", value: kpiStats.active, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "At Risk", value: kpiStats.atRisk, icon: AlertTriangle, color: "text-rose-500 bg-rose-500/10" },
          { label: "Completion Rate", value: `${kpiStats.completionRate}%`, icon: Award, color: "text-purple-500 bg-purple-500/10" },
          { label: "Avg Engagement", value: `${kpiStats.avgEngagement}%`, icon: TrendingUp, color: "text-amber-500 bg-amber-500/10" },
          { label: "Live Attendance", value: `${kpiStats.avgAttendance}%`, icon: Percent, color: "text-teal-500 bg-teal-500/10" }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} variant="glass" className="p-3 border-border/60 hover:border-primary/20 transition flex items-center justify-between min-w-0">
              <div className="min-w-0 space-y-0.5 text-left">
                <p className="text-[9.5px] font-black text-muted-foreground uppercase tracking-wider truncate">{kpi.label}</p>
                <h4 className="text-base font-black text-foreground">{kpi.value}</h4>
              </div>
              <span className={`p-1.5 rounded-lg shrink-0 ml-2 ${kpi.color}`}><Icon size={12} /></span>
            </Card>
          );
        })}
      </div>

      {/* At-Risk Warning Callout Section */}
      {atRiskStudents.length > 0 && (
        <Card className="border-rose-500/20 bg-rose-500/[0.02] p-4 space-y-3">
          <div className="flex items-center gap-2 text-rose-500 font-extrabold text-xs select-none">
            <AlertTriangle size={15} />
            <span>Students Who May Need Attention</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {atRiskStudents.map((risk) => (
              <div key={risk.id} className="p-3 bg-card border border-border/40 rounded-xl flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <div className="text-left space-y-1">
                  <h5 className="font-extrabold text-foreground">{risk.name}</h5>
                  <p className="text-[10px] text-muted-foreground/80">
                    {risk.status === "At Risk" ? "No activity for 8 days" : `Missed classes, Progress stuck at ${risk.progress}%`}
                  </p>
                </div>
                <div className="flex gap-1.5 select-none">
                  <Button
                    onClick={() => setSelectedStudent(risk)}
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] px-2.5 font-bold"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedStudent(risk);
                      toast.info(`Channel open for ${risk.name}`);
                    }}
                    size="sm"
                    className="h-7 text-[10px] px-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold border-none"
                  >
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search & Filters Row */}
      <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3 select-none">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="h-8.5 w-full pl-9 pr-3 rounded-xl border border-border bg-card/60 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        {/* Categories filters tabs */}
        <div className="flex flex-wrap gap-1 border border-border/60 p-0.5 rounded-xl bg-muted/20">
          {["All", "Active", "New", "At Risk", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab === "All" ? "All" : tab);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-[10.5px] font-black uppercase transition-colors cursor-pointer border-none ${
                (tab === "All" && statusFilter === "All") || statusFilter === tab
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground bg-transparent"
              }`}
            >
              {tab === "All" ? "All Students" : tab}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <select
          value={studentFilterCourse}
          onChange={(e) => setStudentFilterCourse(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Courses</option>
          {Array.from(new Set(enrichedStudents.map((s) => s.courseTitle))).map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>

        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Batches</option>
          <option value="Batch A">Batch A</option>
          <option value="Batch B">Batch B</option>
          <option value="Batch C">Batch C</option>
        </select>

        <select
          value={learningModeFilter}
          onChange={(e) => setLearningModeFilter(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Learning Modes</option>
          <option value="Live">Live</option>
          <option value="Recorded">Recorded</option>
          <option value="Live + Recorded">Live + Recorded</option>
          <option value="Self-Paced">Self-Paced</option>
          <option value="Complete Package">Complete Package</option>
        </select>

        <select
          value={attendanceFilter}
          onChange={(e) => setAttendanceFilter(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Attendance</option>
          <option value="High">High (85%+)</option>
          <option value="Low">Low (&lt;60%)</option>
        </select>

        <select
          value={lastActiveFilter}
          onChange={(e) => setLastActiveFilter(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">Last Active</option>
          <option value="Active">Active Recently</option>
          <option value="Inactive">Inactive (&gt;8 days)</option>
        </select>

        <select
          value={studentSortBy}
          onChange={(e) => setStudentSortBy(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none ml-auto"
        >
          <option value="recently-active">Recently Active</option>
          <option value="progress-desc">Highest Progress</option>
          <option value="progress-asc">Lowest Progress</option>
          <option value="newest">Newest Enrolled</option>
          <option value="engaged">Most Engaged</option>
        </select>
      </Card>

      {/* Needs response warning blocks */}
      <div className="grid grid-cols-3 gap-4 select-none">
        {[
          { label: "unanswered questions", count: 4, icon: HelpCircle, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          { label: "unread messages", count: 2, icon: MessageCircle, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
          { label: "evaluations pending", count: 3, icon: FileCheck2, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold font-heading ${item.color}`}>
              <div className="flex items-center gap-2">
                <Icon size={14} />
                <span>{item.count} {item.label}</span>
              </div>
              <button
                onClick={() => toast.info(`Directing you to ${item.label} filters...`)}
                className="text-[9px] font-black uppercase hover:underline cursor-pointer border-none bg-transparent"
              >
                Resolve
              </button>
            </div>
          );
        })}
      </div>

      {/* Student List View Grid/Table */}
      {filteredStudents.length === 0 ? (
        <NoStudents onAction={() => toast.info("Link packages to enroll students")} />
      ) : (
        <div className="space-y-4">
          
          {/* Desktop Table View */}
          <div className="hidden md:block w-full overflow-x-auto border border-border/60 bg-card rounded-2xl shadow-floating">
            <table className="w-full text-xs text-left min-w-[1200px]">
              <thead className="bg-muted/30 border-b border-border/60 text-[9px] uppercase tracking-wider font-black text-muted-foreground/80">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Course / Package</th>
                  <th className="p-3 text-center">Progress</th>
                  <th className="p-3 text-center">Live Attendance</th>
                  <th className="p-3 text-center">Watch Time</th>
                  <th className="p-3 text-center">Assignments</th>
                  <th className="p-3 text-center">Doubt Sessions</th>
                  <th className="p-3 text-center">Last Active</th>
                  <th className="p-3 text-center">Engagement</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-muted/15 cursor-pointer transition-colors"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="p-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-extrabold text-[11px] shrink-0 border border-indigo-500/20 relative overflow-hidden select-none">
                        {student.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-foreground font-bold block">{student.name}</span>
                        <span className="text-[9px] text-muted-foreground font-medium">{student.email}</span>
                      </div>
                    </td>
                    <td className="p-3 max-w-[180px] truncate text-[11px]">
                      <span className="text-foreground block font-bold leading-normal">{student.courseTitle}</span>
                      <span className="text-[8.5px] font-black uppercase text-indigo-500/80">{student.learningMode}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 justify-center max-w-[100px] mx-auto">
                        <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              student.progress === 100 ? "bg-emerald-500" : "bg-primary"
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-foreground shrink-0">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-foreground font-bold">{student.attendance}%</td>
                    <td className="p-3 text-center text-muted-foreground font-semibold">{student.watchTime || "12h 45m"}</td>
                    <td className="p-3 text-center text-foreground">{student.assignmentsSubmitted}</td>
                    <td className="p-3 text-center text-foreground">{student.doubtSessionsCount || "2/4"}</td>
                    <td className="p-3 text-center text-[10px] text-muted-foreground">{student.lastActive || "2 days ago"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5 justify-center">
                        <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (student.engagementScore || 50) > 80 ? "bg-emerald-500" : (student.engagementScore || 50) > 50 ? "bg-indigo-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${student.engagementScore || 50}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-foreground">{student.engagementScore || 50}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center select-none">
                      <span
                        className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${
                          student.status === "Completed"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : student.status === "Active"
                            ? "bg-sky-500/10 border-sky-500/20 text-sky-500"
                            : student.status === "At Risk"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="p-3 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 select-none">
                        <Button
                          onClick={() => setSelectedStudent(student)}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2 font-bold"
                        >
                          View Student
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedStudent(student);
                            toast.info(`Messaging channel open for ${student.name}`);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2 font-bold text-indigo-500 hover:bg-indigo-500/5"
                        >
                          Message
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards Grid View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedStudents.map((student) => (
              <Card
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                variant="glass"
                className="p-4 border-border/60 hover:border-primary/20 transition text-left space-y-3 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-extrabold text-[12px] shrink-0 border border-indigo-500/20 relative overflow-hidden">
                      {student.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-xs leading-none">{student.name}</h4>
                      <span className="text-[9px] text-muted-foreground/80 mt-1 block">{student.email}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                      student.status === "Completed"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        : student.status === "Active"
                        ? "bg-sky-500/10 border-sky-500/20 text-sky-500"
                        : student.status === "At Risk"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {student.status}
                  </span>
                </div>

                <div className="border-t border-border/10 pt-2.5 grid grid-cols-2 gap-2 text-[10px] font-semibold text-muted-foreground">
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">Course</span>
                    <span className="text-foreground line-clamp-1">{student.courseTitle}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">Progress</span>
                    <span className="text-foreground">{student.progress}% complete</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">Live Attendance</span>
                    <span className="text-foreground">{student.attendance}% rate</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">Watch Time</span>
                    <span className="text-foreground">{student.watchTime || "14h 32m"}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-border/10 select-none">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(student);
                    }}
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] px-2.5 font-bold"
                  >
                    View Progress
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(student);
                      toast.info(`Direct chat with ${student.name}`);
                    }}
                    size="sm"
                    className="h-7 text-[10px] px-2.5 bg-primary text-white font-bold border-none"
                  >
                    Message
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-1 select-none">
            <span className="text-[10px] text-muted-foreground font-black uppercase">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
            </span>
            <div className="flex gap-1.5 items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-[11px] font-bold text-foreground px-2">{currentPage} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>

        </div>
      )}

      {/* STUDENT SUCCESS PROFILE SIDE-DRAWER */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
              onClick={() => setSelectedStudent(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-card border-l border-border/80 z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              {/* Drawer Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
                
                {/* Profile Top bar */}
                <div className="flex items-start justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg border border-primary/20 relative overflow-hidden select-none">
                      {selectedStudent.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-full h-full object-cover" />
                      ) : (
                        selectedStudent.name.charAt(0)
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-base font-heading font-black text-foreground">{selectedStudent.name}</h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail size={10} />{selectedStudent.email}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone size={10} />{selectedStudent.phone || "+91 98234 56781"}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Package Course Purchase context details */}
                <div className="p-4 bg-primary/[0.02] border border-primary/20 rounded-2xl space-y-3 font-semibold text-xs leading-normal">
                  <div>
                    <span className="text-[8.5px] font-black uppercase text-primary/80 tracking-wider select-none">Enrolled Package Course</span>
                    <h4 className="font-extrabold text-foreground text-sm mt-0.5">{selectedStudent.courseTitle}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground leading-snug">
                    <div>Mode: <strong className="text-foreground uppercase text-[10px]">{selectedStudent.learningMode || "Complete Package"}</strong></div>
                    <div>Joined: <strong className="text-foreground">{selectedStudent.enrollmentDate}</strong></div>
                  </div>
                  <div className="border-t border-border/10 pt-2 grid grid-cols-3 gap-1 text-[10px] text-center text-muted-foreground select-none">
                    <div>
                      <span className="text-[7.5px] block font-black">LIVE CLASSES</span>
                      <span className="text-foreground font-bold">12 classes</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] block font-black">RECORDINGS</span>
                      <span className="text-foreground font-bold">18 lessons</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] block font-black">DOUBT ROOMS</span>
                      <span className="text-foreground font-bold">4 sessions</span>
                    </div>
                  </div>
                </div>

                {/* Overview engagement statistics */}
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold leading-relaxed">
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1 select-none">
                    <span className="text-[8.5px] font-black text-muted-foreground uppercase block">Watch time</span>
                    <span className="text-foreground font-black text-sm">{selectedStudent.watchTime || "14h 32m"}</span>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1 select-none">
                    <span className="text-[8.5px] font-black text-muted-foreground uppercase block">Engagement Score</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground font-black text-sm">{selectedStudent.engagementScore || 82}%</span>
                      <span className="text-[9px] text-emerald-500 font-bold">✓ High</span>
                    </div>
                  </div>
                </div>

                {/* 1. COURSE PROGRESS CHECKLIST */}
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center text-[10.5px] font-black uppercase text-foreground select-none">
                    <span className="flex items-center gap-1"><BookOpen size={13} className="text-indigo-500" /> Course Progress</span>
                    <span>{selectedStudent.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${selectedStudent.progress}%` }} />
                  </div>
                  
                  {/* Modules check indicators */}
                  <div className="p-3.5 bg-muted/20 border border-border/40 rounded-2xl space-y-2 font-bold text-muted-foreground leading-normal">
                    {[
                      { title: "Module 1 — Core Principles", status: "completed" },
                      { title: "Module 2 — Loop Mechanics", status: "completed" },
                      { title: "Module 3 — Functional Arguments", status: "completed" },
                      { title: "Module 4 — Object Oriented OOP", status: selectedStudent.progress > 75 ? "completed" : "active" },
                      { title: "Module 5 — Capstone Workspace Projects", status: selectedStudent.progress === 100 ? "completed" : "pending" }
                    ].map((mod, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10.5px]">
                        <span className={mod.status === "completed" ? "text-foreground" : "text-muted-foreground/60"}>
                          {mod.title}
                        </span>
                        <span className={`text-[8.5px] uppercase font-black px-1.5 py-0.2 rounded ${
                          mod.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : mod.status === "active"
                            ? "bg-primary/10 text-primary animate-pulse"
                            : "bg-muted text-muted-foreground/50"
                        }`}>
                          {mod.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. LIVE LEARNING ATTENDANCE PROGRESS */}
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center text-[10.5px] font-black uppercase text-foreground select-none">
                    <span className="flex items-center gap-1"><Tv size={13} className="text-rose-500" /> Live Classes timetable</span>
                    <span>{selectedStudent.attendance}% Attendance</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] select-none">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-2 rounded-xl">
                      <p className="font-extrabold uppercase text-[7.5px] opacity-80">Attended</p>
                      <p className="font-black text-sm mt-0.5">{selectedStudent.presentClasses || 8} classes</p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-2 rounded-xl">
                      <p className="font-extrabold uppercase text-[7.5px] opacity-80">Missed</p>
                      <p className="font-black text-sm mt-0.5">{selectedStudent.absentClasses || 2} classes</p>
                    </div>
                  </div>

                  {/* Recent Live sessions attended check list */}
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-2xl space-y-1.5">
                    {(selectedStudent.liveSessions || [
                      { title: "Python Basics", status: "Attended" },
                      { title: "Functions & Closures", status: "Attended" },
                      { title: "OOP Workshop", status: "Missed" }
                    ]).map((session, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px]">
                        <span className="text-foreground">{session.title}</span>
                        <span className={`font-black uppercase text-[8px] ${session.status === "Attended" ? "text-emerald-500" : "text-rose-500"}`}>
                          {session.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. RECORDED LESSONS TRACKER */}
                <div className="space-y-2 text-xs font-semibold">
                  <h4 className="text-[10.5px] font-black uppercase text-foreground flex items-center gap-1 select-none">
                    <Clock size={13} className="text-emerald-500" /> Recorded lessons watched
                  </h4>
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-2xl space-y-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold border-b border-border/10 pb-1.5 select-none">
                      <span>Lesson watched</span>
                      <span>Access status</span>
                    </div>
                    {(selectedStudent.recordedLessons || [
                      { title: "Decorators & Generators overview", watchedAt: "18 mins ago" }
                    ]).map((recorded, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px]">
                        <span className="text-foreground truncate max-w-[200px]">{recorded.title}</span>
                        <span className="text-muted-foreground/80 text-[9px]">{recorded.watchedAt}</span>
                      </div>
                    ))}
                    {(selectedStudent.recordedLessons || []).length === 0 && (
                      <p className="text-[9.5px] text-muted-foreground/60 italic text-center py-2 select-none">No recorded lessons accessed yet.</p>
                    )}
                  </div>
                </div>

                {/* 4. DOUBT SESSION ENGAGEMENT */}
                <div className="space-y-2 text-xs font-semibold">
                  <h4 className="text-[10.5px] font-black uppercase text-foreground flex items-center gap-1 select-none">
                    <HelpCircle size={13} className="text-amber-500" /> Live Doubt Solving Rooms
                  </h4>
                  
                  <div className="p-3.5 bg-muted/20 border border-border/40 rounded-2xl space-y-3 font-bold text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                      <div>
                        <span className="text-[7.5px] block font-black">SESSIONS ATTENDED</span>
                        <strong className="text-foreground">{selectedStudent.doubtSessionsCount || "3/4"} rooms</strong>
                      </div>
                      <div>
                        <span className="text-[7.5px] block font-black">QUESTIONS SOLVED</span>
                        <strong className="text-emerald-500">All resolved</strong>
                      </div>
                    </div>

                    <div className="border-t border-border/10 pt-2 space-y-2">
                      <p className="text-[8px] font-black uppercase text-foreground mb-1 select-none">Recent doubt tickets</p>
                      {(selectedStudent.doubtSessions || [
                        { question: "Why do we use async functions in event loops?", status: "Answered" }
                      ]).map((ticket, idx) => (
                        <div key={idx} className="space-y-0.5 text-[9.5px]">
                          <div className="flex justify-between font-bold text-foreground">
                            <span className="truncate max-w-[200px]">"{ticket.question}"</span>
                            <span className={ticket.status === "Answered" ? "text-emerald-500" : "text-amber-500"}>{ticket.status}</span>
                          </div>
                        </div>
                      ))}
                      {(selectedStudent.doubtSessions || []).length === 0 && (
                        <p className="text-[9.5px] text-muted-foreground/60 italic text-center py-1 select-none">No doubt tickets submitted.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. ASSIGNMENTS PROGRESS */}
                <div className="space-y-2 text-xs font-semibold">
                  <h4 className="text-[10.5px] font-black uppercase text-foreground flex items-center gap-1 select-none">
                    <FileCheck2 size={13} className="text-indigo-500" /> Attached Course Assignments
                  </h4>
                  <div className="p-3.5 bg-muted/20 border border-border/40 rounded-2xl space-y-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold border-b border-border/10 pb-1.5 select-none">
                      <span>Assignment Outline</span>
                      <span>Grading Outcome</span>
                    </div>
                    {(selectedStudent.gradeHistory || [
                      { name: "Python Functions Assignment", score: "92/100", date: "2026-07-20", feedback: "Excellent implementation of recursive loops", status: "Graded" }
                    ]).map((grade, idx) => (
                      <div key={idx} className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-foreground">{grade.name}</span>
                          <span className="text-emerald-500">{grade.score}</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-muted-foreground font-medium">
                          <span>Submitted: {grade.date}</span>
                          {grade.feedback && <span className="italic">"{grade.feedback}"</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. STUDENT ACHIEVEMENTS */}
                <div className="space-y-2 text-xs font-semibold">
                  <h4 className="text-[10.5px] font-black uppercase text-foreground flex items-center gap-1 select-none">
                    <Award size={13} className="text-purple-500" /> Milestones &amp; Outcomes
                  </h4>
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-2xl space-y-1.5 font-bold text-muted-foreground text-[10.5px]">
                    {selectedStudent.progress === 100 ? (
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Check size={13} className="text-emerald-500" />
                        <span>🏆 Python Complete Program completed successfully</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground/60">
                        <Clock size={13} />
                        <span>Course completion certificate milestone locked</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Check size={13} className="text-emerald-500" />
                      <span>💻 3 Capstone Projects completed</span>
                    </div>
                  </div>
                </div>

                {/* Conversation messaging logs within drawer */}
                <div className="border-t border-border/40 pt-4 space-y-3">
                  <h4 className="text-[10.5px] font-black uppercase text-foreground flex items-center gap-1 select-none">
                    <MessageSquare size={13} /> Conversation Logs
                  </h4>
                  
                  <div className="h-36 overflow-y-auto bg-muted/30 p-3 rounded-2xl border border-border/40 space-y-3.5 flex flex-col justify-end">
                    {(chatLogs[selectedStudent.id] || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`max-w-[85%] p-2.5 rounded-xl text-[10px] font-medium leading-relaxed text-left ${
                          msg.sender === "tutor"
                            ? "bg-primary text-white self-end rounded-tr-none"
                            : "bg-card text-foreground self-start rounded-tl-none border border-border/60"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className="text-[8px] opacity-65 block text-right mt-1">{msg.time}</span>
                      </div>
                    ))}
                    {(chatLogs[selectedStudent.id] || []).length === 0 && (
                      <p className="text-[10px] text-muted-foreground italic text-center py-6 select-none">No conversation logs. Start the thread below.</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Send response to student..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="h-8.5 flex-1 rounded-xl border border-border bg-card px-3 text-[10px] font-semibold text-foreground focus:outline-none"
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="sm"
                      className="h-8.5 bg-primary text-white text-[10.5px] font-bold border-none"
                    >
                      Send
                    </Button>
                  </div>
                </div>

              </div>

              {/* Drawer Footer actions */}
              <div className="p-6 border-t border-border/40 flex flex-col gap-2 bg-muted/10">
                {!selectedStudent.certificateEarned && selectedStudent.progress === 100 && onIssueCertificate && (
                  <Button
                    onClick={async () => {
                      setIsIssuing(true);
                      await onIssueCertificate(selectedStudent.id);
                      setIsIssuing(false);
                      setSelectedStudent((prev) => (prev ? { ...prev, certificateEarned: true, certificateStatus: "Issued" } : null));
                    }}
                    disabled={isIssuing}
                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border-none"
                  >
                    🏅 {isIssuing ? "Issuing..." : "Issue Graduation Certificate"}
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedStudent(null)}
                  variant="outline"
                  className="w-full h-9 text-xs font-bold"
                >
                  Close Profile
                </Button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
});
