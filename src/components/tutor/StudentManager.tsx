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
  CalendarDays
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
  gradeHistory?: { name: string; score: string }[];
  attendanceLogs?: { date: string; present: boolean }[];
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
      const status = s.status || (s.progress === 100 ? "Completed" : s.progress > 0 ? "Active" : "Inactive");
      
      const gradeHistory = [
        { name: "Quiz 1", score: s.quizScore === "A+" ? "95/100" : "82/100" },
        { name: "Assignment 1", score: s.assignmentStatus === "Graded" ? "90/100" : "78/100" },
        { name: "Midterm Project", score: s.progress >= 80 ? "92/100" : "70/100" }
      ];

      const attendanceLogs = [
        { date: "2026-07-20", present: true },
        { date: "2026-07-22", present: true },
        { date: "2026-07-24", present: s.attendance > 70 },
        { date: "2026-07-26", present: s.attendance > 90 }
      ];

      return {
        ...s,
        email,
        enrollmentDate,
        status,
        gradeHistory,
        attendanceLogs
      };
    });
  }, [students]);

  // Analytics aggregates
  const analytics = useMemo(() => {
    if (enrichedStudents.length === 0) return { avgProgress: 0, avgAttendance: 0, certified: 0, highRisk: 0 };
    const totalProgress = enrichedStudents.reduce((acc, s) => acc + s.progress, 0);
    const totalAttendance = enrichedStudents.reduce((acc, s) => acc + s.attendance, 0);
    const certified = enrichedStudents.filter((s) => s.certificateEarned).length;
    const highRisk = enrichedStudents.filter((s) => s.progress < 30).length;

    return {
      avgProgress: Math.round(totalProgress / enrichedStudents.length),
      avgAttendance: Math.round(totalAttendance / enrichedStudents.length),
      certified,
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
        const matchesStatus =
          statusFilter === "All" ||
          s.status.toLowerCase() === statusFilter.toLowerCase();
        
        const matchesProgress =
          studentFilterProgress === "All"
            ? true
            : studentFilterProgress === "Completed"
            ? s.progress === 100
            : s.progress < 100;

        return matchesSearch && matchesCourse && matchesStatus && matchesProgress;
      })
      .sort((a, b) => {
        if (studentSortBy === "name-asc") return a.name.localeCompare(b.name);
        if (studentSortBy === "name-desc") return b.name.localeCompare(a.name);
        if (studentSortBy === "progress-desc") return b.progress - a.progress;
        if (studentSortBy === "progress-asc") return a.progress - b.progress;
        return 0;
      });
  }, [enrichedStudents, studentSearch, studentFilterCourse, statusFilter, studentFilterProgress, studentSortBy]);

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
          <h2 className="text-xl font-heading font-extrabold text-foreground">Students Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor student enrollment metrics, attendance logs, and pedagogical achievements.
          </p>
        </div>
        <Button
          onClick={handleExport}
          size="sm"
          className="h-9 gap-1.5 shadow-soft bg-primary hover:bg-primary/95 text-white"
        >
          <FileSpreadsheet size={14} />
          Export Student List
        </Button>
      </div>

      {/* Performance Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Average Progress", value: `${analytics.avgProgress}%`, icon: TrendingUp, color: "text-violet-500" },
          { label: "Class Attendance", value: `${analytics.avgAttendance}%`, icon: Percent, color: "text-emerald-500" },
          { label: "Certificates Issued", value: analytics.certified, icon: Award, color: "text-amber-500" },
          { label: "Dropout Risk Alert", value: analytics.highRisk, icon: AlertTriangle, color: "text-rose-500" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} variant="glass" className="p-4 flex items-center gap-3.5">
              <div className={`p-2.5 rounded-lg bg-card border border-border/40 ${item.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{item.label}</p>
                <h4 className="text-lg font-heading font-extrabold text-foreground mt-0.5">{item.value}</h4>
              </div>
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
        </select>

        <select
          value={studentSortBy}
          onChange={(e) => setStudentSortBy(e.target.value)}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none ml-auto"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="progress-desc">Highest Progress</option>
          <option value="progress-asc">Lowest Progress</option>
        </select>
      </Card>

      {/* Student List Table */}
      {filteredStudents.length === 0 ? (
        <NoStudents onAction={() => toast.info("Share your course link to attract students!")} />
      ) : (
        <div className="space-y-4">
          <div className="w-full overflow-x-auto border border-border bg-card rounded-card shadow-soft">
            <table className="w-full text-xs text-left min-w-[950px]" role="table" aria-label="Student progress table">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                  <th className="p-4">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4 text-center">Attendance</th>
                  <th className="p-4 text-center">Enrollment Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-muted/10 cursor-pointer transition-colors"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-foreground font-bold">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground/80 font-medium">{student.email}</td>
                    <td className="p-4 max-w-[180px] truncate">{student.courseTitle}</td>
                    <td className="p-4 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              student.progress === 100 ? "bg-emerald-500" : "bg-primary"
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-foreground">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-foreground font-bold">{student.attendance}%</td>
                    <td className="p-4 text-center text-muted-foreground/75 font-medium">{student.enrollmentDate}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                          student.status === "Completed"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : student.status === "Active"
                            ? "bg-sky-500/10 border-sky-500/20 text-sky-500 animate-pulse"
                            : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          onClick={() => {
                            setSelectedStudent(student);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[9px] px-2.5 font-bold"
                        >
                          <MessageSquare size={10} className="mr-1" />
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
                            className="h-7 text-[9px] px-2.5 font-bold bg-primary hover:bg-primary/90 text-white shadow-soft"
                          >
                            🏅 {isIssuing ? "Issuing..." : "Issue Cert"}
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
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-heading font-bold text-foreground">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail size={10} />
                        {selectedStudent.email}
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

                {/* Subpage tabs inside drawer */}
                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-3 bg-muted/30 rounded border border-border/40">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Course Enrolled</p>
                    <p className="font-bold text-foreground">{selectedStudent.courseTitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Status", value: selectedStudent.status },
                      { label: "Attendance", value: `${selectedStudent.attendance}%` },
                      { label: "Progress", value: `${selectedStudent.progress}%` },
                      { label: "Quiz Score", value: selectedStudent.quizScore },
                      { label: "Assignment", value: selectedStudent.assignmentStatus },
                      { label: "Enrollment Date", value: selectedStudent.enrollmentDate },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-muted/20 rounded border border-border/40">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">
                          {item.label}
                        </p>
                        <p className="font-bold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Performance charts mock details */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-2.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <BarChart3 size={11} /> Performance Metrics
                    </p>
                    <div className="space-y-2">
                      {selectedStudent.gradeHistory?.map((g, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground">{g.name}</span>
                          <span className="text-foreground font-bold">{g.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Log history */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-2.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <CalendarDays size={11} /> Recent Attendance Logs
                    </p>
                    <div className="flex gap-2">
                      {selectedStudent.attendanceLogs?.map((log, idx) => (
                        <div key={idx} className="flex-1 text-center p-1 bg-card rounded border border-border/40">
                          <p className="text-[8px] text-muted-foreground">{log.date.split("-")[2]}</p>
                          <span className={`text-[8px] font-extrabold uppercase mt-1 block ${log.present ? "text-emerald-500" : "text-rose-500"}`}>
                            {log.present ? "Present" : "Absent"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk factor details */}
                  <div className="p-3 bg-muted/20 rounded border border-border/40 space-y-1.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">
                      Risk Matrix Assessment
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${dropoutRiskColor(selectedStudent.progress)}`}>
                        {dropoutRisk(selectedStudent.progress)} Risk
                      </span>
                      <span className="text-[10px] text-muted-foreground">System calculated factor</span>
                    </div>
                  </div>
                </div>

                {/* Instant Messaging section within Drawer */}
                <div className="border-t border-border/40 pt-4 space-y-3">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <MessageSquare size={11} /> Conversation with Student
                  </p>
                  <div className="h-40 overflow-y-auto bg-muted/30 p-3 rounded-card border border-border/40 space-y-2.5 flex flex-col justify-end">
                    {(chatLogs[selectedStudent.id] || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`max-w-[80%] p-2 rounded-lg text-[10px] font-medium leading-relaxed ${
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
                      <p className="text-[10px] text-muted-foreground italic text-center py-8">No message logs. Send a message to start.</p>
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
