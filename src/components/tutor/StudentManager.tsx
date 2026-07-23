"use client";

import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
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
}: StudentManagerProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);

  // Dynamic course filter options from actual myCourses data
  const courseFilterOptions = useMemo(() => {
    const titles = Array.from(new Set(students.map((s) => s.courseTitle)));
    return titles;
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.courseTitle.toLowerCase().includes(studentSearch.toLowerCase());
        const matchesCourse =
          studentFilterCourse === "All" ||
          s.courseTitle.toLowerCase().includes(studentFilterCourse.toLowerCase());
        const matchesProgress =
          studentFilterProgress === "All"
            ? true
            : studentFilterProgress === "Completed"
            ? s.progress === 100
            : s.progress < 100;
        return matchesSearch && matchesCourse && matchesProgress;
      })
      .sort((a, b) => {
        if (studentSortBy === "name-asc") return a.name.localeCompare(b.name);
        if (studentSortBy === "name-desc") return b.name.localeCompare(a.name);
        if (studentSortBy === "progress-desc") return b.progress - a.progress;
        if (studentSortBy === "progress-asc") return a.progress - b.progress;
        return 0;
      });
  }, [students, studentSearch, studentFilterCourse, studentFilterProgress, studentSortBy]);

  const handleExport = useCallback(() => {
    const headers = "Name,Course,Progress,Attendance,Assignments,Certificate\n";
    const rows = students
      .map(
        (s) =>
          `"${s.name}","${s.courseTitle}",${s.progress}%,${s.attendance}%,"${
            s.assignmentStatus
          }","${s.certificateEarned ? "Issued" : "Pending"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eduspark_students.csv";
    a.click();
    toast.success("Students exported!");
  }, [students]);

  const dropoutRisk = (progress: number) =>
    progress < 30 ? "High" : progress < 70 ? "Medium" : "Low";

  const dropoutRiskColor = (progress: number) =>
    progress < 30
      ? "text-rose-500"
      : progress < 70
      ? "text-amber-500"
      : "text-emerald-500";

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
          <h2 className="text-base font-heading font-extrabold text-foreground">Students</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {students.length} enrolled &bull; {students.filter((s) => s.certificateEarned).length} certified
          </p>
        </div>
        <Button
          onClick={handleExport}
          size="sm"
          className="h-9 gap-1.5 shadow-soft self-start sm:self-center"
        >
          <FileSpreadsheet size={13} />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search students..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="h-9 min-w-[180px] flex-1 max-w-xs rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <select
          value={studentFilterCourse}
          onChange={(e) => setStudentFilterCourse(e.target.value)}
          className="h-9 rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="All">All Courses</option>
          {courseFilterOptions.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
        <select
          value={studentFilterProgress}
          onChange={(e) => setStudentFilterProgress(e.target.value)}
          className="h-9 rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="All">All Progress</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
        </select>
        <select
          value={studentSortBy}
          onChange={(e) => setStudentSortBy(e.target.value)}
          className="h-9 rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="progress-desc">Highest Progress</option>
          <option value="progress-asc">Lowest Progress</option>
        </select>
      </div>

      {filteredStudents.length === 0 ? (
        <NoStudents onAction={() => toast.info("Share your course link to attract students!")} />
      ) : (
        <div className="w-full overflow-x-auto border border-border bg-card rounded-card shadow-soft">
          <table
            className="w-full text-xs text-left min-w-[680px]"
            role="table"
            aria-label="Student progress table"
          >
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Progress</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4 text-center">Assignment</th>
                <th className="p-4 text-center">Certificate</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-muted/10 cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-foreground font-bold">{student.name}</span>
                    </div>
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
                  <td className="p-4 text-center">
                    <span
                      className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        student.assignmentStatus === "Graded"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : student.assignmentStatus === "Submitted"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {student.assignmentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        student.certificateEarned
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {student.certificateEarned ? "Issued" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => toast.success(`Chat with ${student.name} initiated!`)}
                      size="sm"
                      variant="outline"
                      className="h-7 text-[9px] px-2 font-bold"
                    >
                      <MessageSquare size={10} className="mr-1" />
                      Chat
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Detail Drawer with AnimatePresence for proper exit animation */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setSelectedStudent(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                      <p className="text-[10px] text-muted-foreground">
                        {selectedStudent.progress === 100
                          ? "Course completed"
                          : `${selectedStudent.progress}% complete`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    aria-label="Close student details"
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded hover:bg-muted/30 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-muted/30 rounded-card border border-border/40">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Course</p>
                    <p className="font-semibold text-foreground">{selectedStudent.courseTitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Progress", value: `${selectedStudent.progress}%` },
                      { label: "Attendance", value: `${selectedStudent.attendance}%` },
                      { label: "Quiz Score", value: selectedStudent.quizScore },
                      { label: "Assignment", value: selectedStudent.assignmentStatus },
                      {
                        label: "Certificate",
                        value: selectedStudent.certificateEarned ? "Issued" : "Pending",
                      },
                      {
                        label: "Dropout Risk",
                        value: dropoutRisk(selectedStudent.progress),
                        colorClass: dropoutRiskColor(selectedStudent.progress),
                      },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-muted/20 rounded-card border border-border/40">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">
                          {item.label}
                        </p>
                        <p className={`font-bold text-foreground ${item.colorClass ?? ""}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">
                      Learning Progress
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

                  <Button
                    onClick={() =>
                      toast.success(`Chat with ${selectedStudent.name} opened!`)
                    }
                    className="w-full h-9 text-xs font-bold gap-2"
                  >
                    <MessageSquare size={13} />
                    Send Message
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
