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
  CalendarDays,
  User,
  Phone,
  Clock,
  ExternalLink,
  BookOpen,
  Filter,
  CheckCircle,
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
  gradeHistory?: { name: string; score: string; date?: string; feedback?: string; status?: string }[];
  attendanceLogs?: { date: string; present: boolean; status?: string }[];
  presentClasses?: number;
  absentClasses?: number;
  lateJoins?: number;
  recentActivities?: { date: string; desc: string }[];
}

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
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  // Chat message state
  const [chatMessage, setChatMessage] = useState("");
  const [chatLogs, setChatLogs] = useState<Record<string, { sender: string; text: string; time: string }[]>>({
    "1": [
      { sender: "student", text: "Hello professor, is the quiz deadline extended?", time: "Yesterday, 2:40 PM" },
      { sender: "tutor", text: "Hi! Yes, I extended it to this Friday.", time: "Yesterday, 3:00 PM" }
    ]
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add mock historical data for profile analytics
  const enrichedStudents = useMemo(() => {
    return students.map((s: any, idx) => {
      const email = s.email || `${s.name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
      const enrollmentDate = s.enrollmentDate || `2026-07-${10 + (idx % 12)}`;
      const status = s.status || (s.progress === 100 ? "Completed" : s.progress < 30 ? "At Risk" : s.progress > 0 ? "Active" : "Inactive");
      const batch = s.batch || `Batch ${["A", "B", "C"][idx % 3]}`;
      const assignmentsSubmitted = s.assignmentsSubmitted || `${Math.min(idx % 4 + 2, 5)}/5`;
      const avgMarks = s.avgMarks || `${70 + (idx * 4) % 26}/100`;
      const certificateStatus = s.certificateEarned ? "Issued" : s.progress === 100 ? "Eligible" : "Pending";
      const phone = s.phone || `+91 98765 ${43210 - idx * 7}`;
      
      const gradeHistory = [
        { name: "Quiz 1", score: s.quizScore === "A+" ? "95/100" : "82/100", date: "2026-07-15", feedback: "Excellent performance", status: "Graded" },
        { name: "Assignment 1", score: s.assignmentStatus === "Graded" ? "90/100" : "78/100", date: "2026-07-20", feedback: "Well structured code", status: "Graded" },
        { name: "Midterm Project", score: s.progress >= 80 ? "92/100" : "70/100", date: "2026-07-25", feedback: "Good effort overall", status: "Graded" }
      ];

      const attendanceLogs = [
        { date: "2026-07-20", present: true, status: "Present" },
        { date: "2026-07-22", present: true, status: "Present" },
        { date: "2026-07-24", present: s.attendance > 70, status: s.attendance > 70 ? "Present" : "Absent" },
        { date: "2026-07-26", present: s.attendance > 90, status: s.attendance > 90 ? "Present" : "Absent" },
        { date: "2026-07-28", present: true, status: idx % 4 === 0 ? "Late Join" : "Present" }
      ];

      const presentClasses = Math.round((s.attendance / 100) * 15);
      const absentClasses = 15 - presentClasses;
      const lateJoins = idx % 3;

      const recentActivities = [
        { date: "2026-07-29", desc: "Submitted Assignment 2" },
        { date: "2026-07-27", desc: "Joined live lecture on React Router" },
        { date: "2026-07-25", desc: "Completed Quiz 1" }
      ];

      return {
        ...s,
        email,
        enrollmentDate,
        status,
        batch,
        assignmentsSubmitted,
        avgMarks,
        certificateStatus,
        phone,
        gradeHistory,
        attendanceLogs,
        presentClasses,
        absentClasses,
        lateJoins,
        recentActivities
      };
    });
  }, [students]);

  // Analytics aggregates
  const analytics = useMemo(() => {
    if (enrichedStudents.length === 0) return { totalStudents: 0, activeStudents: 0, completedCourses: 0, certified: 0, avgAttendance: 0, avgProgress: 0, avgQuizScore: 85, highRisk: 0 };
    const totalProgress = enrichedStudents.reduce((acc, s) => acc + s.progress, 0);
    const totalAttendance = enrichedStudents.reduce((acc, s) => acc + s.attendance, 0);
    const certified = enrichedStudents.filter((s) => s.certificateEarned).length;
    const activeStudents = enrichedStudents.filter((s) => s.status === "Active").length;
    const completedCourses = enrichedStudents.filter((s) => s.status === "Completed").length;
    const highRisk = enrichedStudents.filter((s) => s.status === "At Risk").length;

    return {
      totalStudents: enrichedStudents.length,
      activeStudents,
      completedCourses,
      certified,
      avgProgress: Math.round(totalProgress / enrichedStudents.length),
      avgAttendance: Math.round(totalAttendance / enrichedStudents.length),
      avgQuizScore: 84,
      highRisk
    };
  }, [enrichedStudents]);

  const courseFilterOptions = useMemo(() => {
    const titles = Array.from(new Set(students.map((s) => s.courseTitle)));
    return titles;
  }, [students]);

  const filteredStudents = useMemo(() => {
    return enrichedStudents
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.courseTitle.toLowerCase().includes(studentSearch.toLowerCase());
        const matchesCourse =
          studentFilterCourse === "All" ||
          s.courseTitle.toLowerCase().includes(studentFilterCourse.toLowerCase());
        const matchesBatch =
          batchFilter === "All" ||
          s.batch.toLowerCase() === batchFilter.toLowerCase();
        const matchesStatus =
          statusFilter === "All" ||
          s.status.toLowerCase() === statusFilter.toLowerCase();
        
        const matchesProgress =
          studentFilterProgress === "All"
            ? true
            : studentFilterProgress === "Completed"
            ? s.progress === 100
            : s.progress < 100;

        return matchesSearch && matchesCourse && matchesBatch && matchesStatus && matchesProgress;
      })
      .sort((a, b) => {
        if (studentSortBy === "newest") return b.enrollmentDate.localeCompare(a.enrollmentDate);
        if (studentSortBy === "progress-desc") return b.progress - a.progress;
        if (studentSortBy === "progress-asc") return a.progress - b.progress;
        if (studentSortBy === "recently-active") return b.enrollmentDate.localeCompare(a.enrollmentDate);
        if (studentSortBy === "name-asc") return a.name.localeCompare(b.name);
        if (studentSortBy === "name-desc") return b.name.localeCompare(a.name);
        return 0;
      });
  }, [enrichedStudents, studentSearch, studentFilterCourse, batchFilter, statusFilter, studentFilterProgress, studentSortBy]);

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
    toast.success("Message sent to student!");
  };

  const handleExport = useCallback(() => {
    const headers = "Name,Email,Course,Progress,Attendance,Enrollment Date,Status,Certificate\n";
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.name}","${s.email}","${s.courseTitle}",${s.progress}%,${s.attendance}%,"${s.enrollmentDate}","${s.status}","${
            s.certificateEarned ? "Issued" : "Pending"
          }"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eduearn_students.csv";
    a.click();
    toast.success("Student directory exported successfully!");
  }, [filteredStudents]);

  const dropoutRisk = (progress: number) =>
    progress < 30 ? "High" : progress < 70 ? "Medium" : "Low";

  const dropoutRiskColor = (progress: number) =>
    progress < 30
      ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
      : progress < 70
      ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
      : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";

  return (
    <motion.div
      key="tutor-students"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Students Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor enrollment metrics, attendance logs, and student achievements.
          </p>
        </div>
        <Button
          onClick={handleExport}
          size="sm"
          className="h-9 gap-1.5 bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm"
        >
          <FileSpreadsheet size={14} />
          Export Students
        </Button>
      </div>

      {/* Performance Analytics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Total Students", value: analytics.totalStudents, icon: UserCheck },
          { label: "Active Students", value: analytics.activeStudents, icon: Clock },
          { label: "Completed Courses", value: analytics.completedCourses, icon: CheckCircle },
          { label: "Certificates Issued", value: analytics.certified, icon: Award },
          { label: "Average Attendance", value: `${analytics.avgAttendance}%`, icon: Percent },
          { label: "Average Progress", value: `${analytics.avgProgress}%`, icon: TrendingUp }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-3 border border-border bg-card shadow-sm flex items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground truncate">{item.label}</p>
                <h4 className="text-xl font-extrabold text-foreground mt-0.5">{item.value}</h4>
              </div>
              <Icon size={16} className="text-primary shrink-0 ml-2" />
            </Card>
          );
        })}
      </div>

      {/* Filters Card */}
      <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, email, course..."
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 w-full pl-9 pr-3 rounded-button border border-border bg-card/60 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
        
        <select
          value={studentFilterCourse}
          onChange={(e) => {
            setStudentFilterCourse(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Courses</option>
          {courseFilterOptions.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>

        <select
          value={batchFilter}
          onChange={(e) => {
            setBatchFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Batches</option>
          <option value="Batch A">Batch A</option>
          <option value="Batch B">Batch B</option>
          <option value="Batch C">Batch C</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Inactive">Inactive</option>
          <option value="At Risk">At Risk</option>
        </select>

        <select
          value={studentSortBy}
          onChange={(e) => setStudentSortBy(e.target.value)}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none ml-auto"
        >
          <option value="newest">Newest</option>
          <option value="progress-desc">Highest Progress</option>
          <option value="progress-asc">Lowest Progress</option>
          <option value="recently-active">Recently Active</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </Card>

      {/* Student List Table */}
      {filteredStudents.length === 0 ? (
        <NoStudents onAction={() => toast.info("Share your course link to attract students!")} />
      ) : (
        <div className="space-y-4">
          <div className="w-full overflow-x-auto border border-border bg-card rounded-card shadow-sm">
            <table className="w-full text-xs text-left min-w-[1200px]" role="table" aria-label="Student progress table">
              <thead className="bg-muted/30 border-b border-border text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                <tr>
                  <th className="p-3 w-10">Photo</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 max-w-[150px]">Course</th>
                  <th className="p-3 text-center">Batch</th>
                  <th className="p-3 text-center">Enrolled</th>
                  <th className="p-3 text-center">Attendance</th>
                  <th className="p-3 min-w-[110px]">Progress</th>
                  <th className="p-3 text-center">Assignments</th>
                  <th className="p-3 text-center">Avg Marks</th>
                  <th className="p-3 text-center">Certificate</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-muted/15 cursor-pointer transition-colors"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="p-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-[11px] shrink-0 border border-primary/20 relative overflow-hidden select-none">
                        {student.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={student.avatarUrl} alt="Student avatar" className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                    </td>
                    <td className="p-2.5">
                      <span className="text-foreground font-bold text-xs">{student.name}</span>
                    </td>
                    <td className="p-2.5 text-muted-foreground/70 text-[11px] font-medium max-w-[150px] truncate">{student.email}</td>
                    <td className="p-2.5 max-w-[150px] truncate text-[11px]" title={student.courseTitle}>{student.courseTitle}</td>
                    <td className="p-2.5 text-center text-foreground">{student.batch}</td>
                    <td className="p-2.5 text-center text-muted-foreground/70 text-[11px]">{student.enrollmentDate}</td>
                    <td className="p-2.5 text-center text-foreground font-bold">{student.attendance}%</td>
                    <td className="p-2.5 min-w-[100px]">
                      <div className="flex items-center gap-2">
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
                    <td className="p-2.5 text-center text-foreground">{student.assignmentsSubmitted}</td>
                    <td className="p-2.5 text-center text-foreground font-bold">{student.avgMarks}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          student.certificateStatus === "Issued"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : student.certificateStatus === "Eligible"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-550"
                            : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {student.certificateStatus}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
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
                    <td className="p-2.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => setSelectedStudent(student)}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2 cursor-pointer font-semibold"
                        >
                          <MessageSquare size={11} className="mr-1" />
                          Message
                        </Button>
                        {!student.certificateEarned && student.progress === 100 && onIssueCertificate && (
                          <Button
                            onClick={async () => {
                              setIsIssuing(true);
                              await onIssueCertificate(student.id);
                              setIsIssuing(false);
                            }}
                            disabled={isIssuing}
                            size="sm"
                            className="h-7 text-[10px] px-2 bg-primary hover:bg-primary/95 text-white cursor-pointer font-semibold"
                          >
                            🏅 {isIssuing ? "Issuing..." : "Cert"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-muted-foreground font-semibold">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of{" "}
              {filteredStudents.length} students
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft size={14} />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                  className={`h-8 w-8 text-xs font-bold ${
                    currentPage === i + 1 ? "bg-primary text-white" : ""
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Drawer */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setSelectedStudent(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* Header Profile Section */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base border border-primary/20 relative overflow-hidden select-none">
                      {selectedStudent.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedStudent.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        selectedStudent.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-heading font-bold text-foreground">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail size={10} />
                        {selectedStudent.email}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone size={10} />
                        {selectedStudent.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    aria-label="Close details"
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded hover:bg-muted/30 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Info Grid */}
                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-3 bg-muted/30 rounded border border-border/40">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Course Enrolled</p>
                    <p className="font-bold text-foreground">{selectedStudent.courseTitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Status", value: selectedStudent.status },
                      { label: "Batch", value: selectedStudent.batch },
                      { label: "Enrollment Date", value: selectedStudent.enrollmentDate },
                      { label: "Certificate", value: selectedStudent.certificateStatus },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-muted/20 rounded border border-border/40">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">
                          {item.label}
                        </p>
                        <p className="font-bold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Attendance Section */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                        <Percent size={11} className="text-primary" /> Attendance Log
                      </p>
                      <span className="text-[11px] font-bold text-foreground">{selectedStudent.attendance}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-1.5 rounded">
                        <p className="text-[8px] font-bold uppercase opacity-85">Present</p>
                        <p className="font-bold text-xs mt-0.5">{selectedStudent.presentClasses} classes</p>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-1.5 rounded">
                        <p className="text-[8px] font-bold uppercase opacity-85">Absent</p>
                        <p className="font-bold text-xs mt-0.5">{selectedStudent.absentClasses} classes</p>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-1.5 rounded">
                        <p className="text-[8px] font-bold uppercase opacity-85">Late Join</p>
                        <p className="font-bold text-xs mt-0.5">{selectedStudent.lateJoins} classes</p>
                      </div>
                    </div>
                    {/* Monthly Attendance Chart mockup */}
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold uppercase text-muted-foreground">Monthly Attendance Rate</p>
                      <div className="flex items-end gap-1.5 h-12 pt-2 border-b border-border/40">
                        {["May", "Jun", "Jul"].map((m, i) => (
                          <div key={m} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                              style={{ height: `${[80, 92, selectedStudent.attendance][i]}%` }}
                            />
                            <span className="text-[8px] text-muted-foreground font-semibold uppercase">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Course Progress */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                        <TrendingUp size={11} className="text-primary" /> Course Progress
                      </p>
                      <span className="text-[10px] font-bold text-foreground">{selectedStudent.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${selectedStudent.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Assignment History */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-2">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <BarChart3 size={11} className="text-primary" /> Assignment History
                    </p>
                    <div className="space-y-2 border-t border-border/40 pt-2">
                      {selectedStudent.gradeHistory?.slice(0, 2).map((g, idx) => (
                        <div key={idx} className="space-y-0.5 text-[10px]">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-foreground">{g.name}</span>
                            <span className="text-emerald-500">{g.score}</span>
                          </div>
                          <div className="flex justify-between items-center text-[8px] text-muted-foreground">
                            <span>Submitted: {g.date}</span>
                            <span className="italic">Feedback: {g.feedback}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quiz Scores */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-2">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Info size={11} className="text-primary" /> Quiz Scores
                    </p>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground">Quiz 1 (Linear Algebra Basics)</span>
                      <span className="text-foreground font-bold bg-muted/40 px-2 py-0.5 rounded border border-border/40">
                        {selectedStudent.quizScore}
                      </span>
                    </div>
                  </div>

                  {/* Certificate Status Section */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                        <Award size={11} className="text-primary" /> Certificate Status
                      </p>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        selectedStudent.certificateStatus === "Issued"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : selectedStudent.certificateStatus === "Eligible"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-550 animate-pulse"
                          : "bg-muted border-border text-muted-foreground"
                      }`}>
                        {selectedStudent.certificateStatus}
                      </span>
                    </div>
                    {selectedStudent.certificateStatus === "Issued" && (
                      <Button
                        onClick={() => {
                          toast.success("Certificate download started!");
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-[10px] font-bold gap-1 mt-1 cursor-pointer"
                      >
                        <Award size={12} className="text-emerald-500" /> Download Certificate
                      </Button>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-2">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Clock size={11} className="text-primary" /> Recent Activity
                    </p>
                    <div className="space-y-1.5 text-[9px] text-muted-foreground">
                      {selectedStudent.recentActivities?.map((act, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="font-bold shrink-0">{act.date}</span>
                          <span className="text-foreground/90">{act.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instant Messaging section within Drawer */}
                <div className="border-t border-border/40 pt-4 space-y-3">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <MessageSquare size={11} /> Conversation
                  </p>
                  <div className="h-32 overflow-y-auto bg-muted/30 p-2.5 rounded-card border border-border/40 space-y-2.5 flex flex-col justify-end">
                    {(chatLogs[selectedStudent.id] || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`max-w-[85%] p-2 rounded-lg text-[10px] font-medium leading-relaxed ${
                          msg.sender === "tutor"
                            ? "bg-primary text-white self-end rounded-tr-none"
                            : "bg-card text-foreground self-start rounded-tl-none border border-border/60"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className="text-[8px] opacity-60 block text-right mt-1">{msg.time}</span>
                      </div>
                    ))}
                    {(chatLogs[selectedStudent.id] || []).length === 0 && (
                      <p className="text-[10px] text-muted-foreground italic text-center py-6">No message logs. Send a message to start.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="h-8 flex-1 rounded border border-border bg-card px-2.5 text-[10px] font-semibold text-foreground focus:outline-none"
                    />
                    <Button onClick={handleSendMessage} className="h-8 px-3 bg-primary text-white text-[10px] font-bold">
                      Send
                    </Button>
                  </div>
                </div>

                {/* Communication panel */}
                <div className="border-t border-border/40 pt-4 space-y-2.5">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">More Actions</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <Button
                      onClick={() => {
                        toast.success(`Announcement sent to ${selectedStudent.name}!`);
                      }}
                      variant="outline"
                      className="h-8 gap-1.5 cursor-pointer font-bold text-foreground"
                    >
                      <Send size={12} className="text-primary" /> Send Announcement
                    </Button>
                    <Button
                      onClick={() => {
                        window.open(`mailto:${selectedStudent.email}`);
                        toast.success(`Opening email editor for ${selectedStudent.email}`);
                      }}
                      variant="outline"
                      className="h-8 gap-1.5 cursor-pointer font-bold text-foreground"
                    >
                      <Mail size={12} className="text-primary" /> Email Student
                    </Button>
                    <Button
                      onClick={() => {
                        toast.success(`Mentoring session invite scheduled for ${selectedStudent.name}!`);
                      }}
                      variant="outline"
                      className="h-8 gap-1.5 cursor-pointer font-bold text-foreground col-span-2"
                    >
                      <Calendar size={12} className="text-primary" /> Schedule Mentoring Session
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-5 border-t border-border/40 flex flex-col gap-2 bg-muted/10">
                {!selectedStudent.certificateEarned && selectedStudent.progress === 100 && onIssueCertificate && (
                  <Button
                    onClick={async () => {
                      setIsIssuing(true);
                      await onIssueCertificate(selectedStudent.id);
                      setIsIssuing(false);
                      setSelectedStudent((prev) => prev ? { ...prev, certificateEarned: true } : null);
                    }}
                    disabled={isIssuing}
                    className="w-full h-9 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft"
                  >
                    🏅 {isIssuing ? "Issuing..." : "Issue Certificate"}
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
