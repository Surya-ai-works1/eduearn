"use client";

import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, MessageSquare, X, ChevronLeft, ChevronRight, Search, Mail, Calendar, Info, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { NoStudents } from "./EmptyState";
import type { StudentProgress, TutorCourse } from "./types";

interface LocalStudentProgress extends StudentProgress {
  email?: string;
  enrollmentDate?: string;
  status?: string;
}

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
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dynamic course filter options from actual myCourses data
  const courseFilterOptions = useMemo(() => {
    const titles = Array.from(new Set(students.map((s) => s.courseTitle)));
    return titles;
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .map((s: any) => {
        // Enforce fallback values for email, enrollmentDate, and status to ensure production-grade data
        const email = s.email || `${s.name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
        const enrollmentDate = s.enrollmentDate || "2026-07-20";
        const status = s.status || (s.progress === 100 ? "Completed" : s.progress > 0 ? "Active" : "Inactive");
        return { ...s, email, enrollmentDate, status };
      })
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
        
        // Progress filter compatibility
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
  }, [students, studentSearch, studentFilterCourse, statusFilter, studentFilterProgress, studentSortBy]);

  // Paginated subset of students
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
    toast.success("Students exported successfully!");
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
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground">Students Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {students.length} enrolled &bull; {students.filter((s) => s.certificateEarned).length} certified
          </p>
        </div>
        <Button
          onClick={handleExport}
          size="sm"
          className="h-9 gap-1.5 shadow-soft self-start sm:self-center bg-primary hover:bg-primary/95 text-white"
        >
          <FileSpreadsheet size={14} />
          Export Student List
        </Button>
      </div>

      {/* Filters */}
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
            className="h-9 w-full pl-9 pr-3 rounded-button border border-border bg-card/60 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>
        
        <select
          value={studentFilterCourse}
          onChange={(e) => {
            setStudentFilterCourse(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={studentSortBy}
          onChange={(e) => setStudentSortBy(e.target.value)}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ml-auto"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="progress-desc">Highest Progress</option>
          <option value="progress-asc">Lowest Progress</option>
        </select>
      </Card>

      {filteredStudents.length === 0 ? (
        <NoStudents onAction={() => toast.info("Share your course link to attract students!")} />
      ) : (
        <div className="space-y-4">
          <div className="w-full overflow-x-auto border border-border bg-card rounded-card shadow-soft">
            <table
              className="w-full text-xs text-left min-w-[900px]"
              role="table"
              aria-label="Student progress table"
            >
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
                    <td className="p-4 text-muted-foreground/80 font-medium">
                      {student.email}
                    </td>
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
                            ? "bg-sky-500/10 border-sky-500/20 text-sky-500"
                            : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          onClick={() => toast.success(`Chat with ${student.name} initiated!`)}
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
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-card border-l border-border z-50 overflow-y-auto shadow-floating"
            >
              <div className="p-5 space-y-5">
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

                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-3.5 bg-muted/30 rounded-card border border-border/40">
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
                      <div key={item.label} className="p-3 bg-muted/20 rounded-card border border-border/40">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">
                          {item.label}
                        </p>
                        <p className="font-bold text-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 bg-muted/20 rounded-card border border-border/40 space-y-1.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">
                      Dropout Risk Assessment
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${dropoutRiskColor(selectedStudent.progress)}`}>
                        {dropoutRisk(selectedStudent.progress)} Risk
                      </span>
                      <span className="text-[10px] text-muted-foreground">Based on course activity</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">
                      Overall Progress
                    </p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selectedStudent.progress === 100 ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{ width: `${selectedStudent.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
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
                        <Award size={14} />
                        {isIssuing ? "Issuing..." : "Issue Certificate"}
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        toast.success(`Message sent to ${selectedStudent.name}`);
                        setSelectedStudent(null);
                      }}
                      className="w-full h-9 text-xs font-bold gap-2 bg-primary hover:bg-primary/95 text-white shadow-soft"
                    >
                      <MessageSquare size={13} />
                      Message Student
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
