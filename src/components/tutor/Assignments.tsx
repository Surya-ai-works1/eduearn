"use client";

import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Plus,
  Search,
  Calendar,
  Award,
  BookOpen,
  Send,
  Download,
  Info,
  ChevronRight,
  User,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { EmptyState } from "./EmptyState";
import type { StudentProgress } from "./types";

interface AssignmentsProps {
  students: StudentProgress[];
  activeGradingStudentId: string | null;
  setActiveGradingStudentId: (id: string | null) => void;
  gradingForm: { grade: string; feedback: string; score: string };
  setGradingForm: React.Dispatch<
    React.SetStateAction<{ grade: string; feedback: string; score: string }>
  >;
  handleSubmitGrade: (studentId: string) => void;
}

interface AssignmentItem {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  maxScore: string;
  description: string;
  submissionsCount: number;
}

export const Assignments = React.memo(function Assignments({
  students,
  activeGradingStudentId,
  setActiveGradingStudentId,
  gradingForm,
  setGradingForm,
  handleSubmitGrade,
}: AssignmentsProps) {
  // Local list of assignments
  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    {
      id: "asg-1",
      title: "Homework 1: Vector Space Proofs",
      courseTitle: "Linear Algebra & Applications",
      dueDate: "2026-08-05",
      maxScore: "100",
      description: "Prove the 8 axioms of vector spaces for the set of polynomial functions of degree n.",
      submissionsCount: students.filter(s => s.courseTitle.includes("Algebra")).length
    },
    {
      id: "asg-2",
      title: "Lab 2: Dynamic Routing Page Configuration",
      courseTitle: "Full-Stack Web Dev Bootcamp",
      dueDate: "2026-08-10",
      maxScore: "100",
      description: "Setup custom layout routes in Next.js App Router and handle client-side context updates.",
      submissionsCount: students.filter(s => s.courseTitle.includes("Web")).length
    }
  ]);

  // Tab: "submissions" | "assignments"
  const [activeTab, setActiveTab] = useState<"submissions" | "assignments">("submissions");

  // Create Assignment Modal
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);
  const [asgForm, setAsgForm] = useState({
    title: "",
    courseTitle: "",
    dueDate: "",
    maxScore: "100",
    description: ""
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");

  const courseOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.courseTitle)));
  }, [students]);

  // Compute submission buckets
  const { submitted, graded, pending } = useMemo(() => {
    const s: StudentProgress[] = [];
    const g: StudentProgress[] = [];
    const p: StudentProgress[] = [];
    for (const st of students) {
      if (st.assignmentStatus === "Submitted") s.push(st);
      else if (st.assignmentStatus === "Graded") g.push(st);
      else p.push(st);
    }
    return { submitted: s, graded: g, pending: p };
  }, [students]);

  // Handlers
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgForm.title || !asgForm.courseTitle || !asgForm.dueDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newItem: AssignmentItem = {
      id: `asg-${Date.now()}`,
      title: asgForm.title,
      courseTitle: asgForm.courseTitle,
      dueDate: asgForm.dueDate,
      maxScore: asgForm.maxScore,
      description: asgForm.description,
      submissionsCount: 0
    };

    setAssignments((prev) => [newItem, ...prev]);
    setIsCreatingAsg(false);
    setAsgForm({
      title: "",
      courseTitle: "",
      dueDate: "",
      maxScore: "100",
      description: ""
    });
    toast.success("Assignment created and shared with students!");
  };

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submitted.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === "All" || s.courseTitle === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [submitted, searchQuery, courseFilter]);

  // Filtered assignments list
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === "All" || a.courseTitle === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [assignments, searchQuery, courseFilter]);

  return (
    <motion.div
      key="tutor-assignments"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground">Assignments Portal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {submitted.length} pending review &bull; {graded.length} graded &bull; {assignments.length} templates
          </p>
        </div>
        <Button
          onClick={() => setIsCreatingAsg(true)}
          size="sm"
          className="h-9 gap-1.5 shadow-soft bg-primary hover:bg-primary/95 text-white font-bold"
        >
          <Plus size={14} /> Create Assignment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Awaiting Review",
            count: submitted.length,
            color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          },
          {
            label: "Total Graded",
            count: graded.length,
            color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            label: "Total Templates",
            count: assignments.length,
            color: "text-primary bg-primary/10 border-primary/20",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`card-surface p-3.5 rounded-card border text-center ${stat.color} font-bold`}
          >
            <p className="text-xl font-heading font-extrabold">{stat.count}</p>
            <p className="text-[9px] font-bold uppercase mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters Card */}
      <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assignments/students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full pl-9 pr-3 rounded-button border border-border bg-card/60 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Courses</option>
          {courseOptions.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>

        {/* Tab Toggle */}
        <div className="flex bg-muted/40 p-0.5 rounded-button ml-auto">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-button transition-all cursor-pointer ${
              activeTab === "submissions"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Student Submissions ({submitted.length})
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-button transition-all cursor-pointer ${
              activeTab === "assignments"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Assignment List ({assignments.length})
          </button>
        </div>
      </Card>

      {/* TAB CONTENT: Submissions */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={<FileText size={28} />}
              title="No submissions found"
              description="Awaiting student uploads or filter is matching 0 records."
            />
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((student) => (
                <div key={student.id} className="card-surface p-4 border border-border/50 rounded-card shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        <User size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{student.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{student.courseTitle}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border bg-amber-500/10 border-amber-500/20 text-amber-500">
                      Awaiting Grading
                    </span>
                  </div>

                  {student.submittedFile && (
                    <div className="flex items-center justify-between text-[10px] bg-muted/40 p-2.5 rounded border border-border/40 font-semibold">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-primary" />
                        <span className="text-foreground">{student.submittedFile}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info(`Downloading ${student.name}'s assignment...`)}
                        className="h-6 text-[9px] px-2 font-bold gap-1 text-primary hover:bg-primary/5"
                      >
                        <Download size={11} /> Download
                      </Button>
                    </div>
                  )}

                  {activeGradingStudentId === student.id ? (
                    <div className="space-y-3 border-t border-border/40 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 text-xs">
                          <label className="font-bold text-foreground">Grade *</label>
                          <select
                            value={gradingForm.grade}
                            onChange={(e) => setGradingForm((f) => ({ ...f, grade: e.target.value }))}
                            className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          >
                            <option value="">Select grade...</option>
                            {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1 text-xs">
                          <label className="font-bold text-foreground">Score (Points) *</label>
                          <input
                            type="text"
                            placeholder="e.g. 92/100"
                            value={gradingForm.score}
                            onChange={(e) => setGradingForm((f) => ({ ...f, score: e.target.value }))}
                            className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-foreground">Constructive Feedback *</label>
                        <textarea
                          rows={3}
                          value={gradingForm.feedback}
                          onChange={(e) => setGradingForm((f) => ({ ...f, feedback: e.target.value }))}
                          placeholder="Provide specific, instructional remarks..."
                          className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-bold"
                          onClick={() => setActiveGradingStudentId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs font-bold bg-primary hover:bg-primary/95 text-white"
                          onClick={() => handleSubmitGrade(student.id)}
                        >
                          <CheckCircle size={12} className="mr-1" />
                          Submit Grade
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setGradingForm({ grade: "", feedback: "", score: "" });
                        setActiveGradingStudentId(student.id);
                      }}
                      size="sm"
                      className="h-8 text-xs font-bold bg-primary hover:bg-primary/95 text-white"
                    >
                      Grade Submission
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Graded Log */}
          {graded.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-500" />
                Graded Submissions Log ({graded.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {graded.map((student) => (
                  <Card key={student.id} className="p-3 flex items-center justify-between border-border/60">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{student.name}</h4>
                      <p className="text-[9px] text-muted-foreground truncate">{student.courseTitle}</p>
                      {student.feedback && (
                        <p className="text-[9px] text-muted-foreground italic truncate mt-1">Feedback: &quot;{student.feedback}&quot;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {student.grade}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Assignment Templates List */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={28} />}
              title="No assignments configured"
              description="Click 'Create Assignment' to distribute your first assessment."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssignments.map((asg) => (
                <div key={asg.id} className="card-surface p-4 border border-border/50 rounded-card shadow-soft flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground leading-tight">{asg.title}</h4>
                      <span className="text-[9px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 shrink-0">
                        {asg.maxScore} pts
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                      {asg.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground border-t border-border/40 pt-2.5">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> {asg.courseTitle}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> Due: {asg.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Assignment Dialog */}
      <AnimatePresence>
        {isCreatingAsg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setIsCreatingAsg(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-md bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto"
            >
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-heading font-extrabold uppercase text-foreground">
                    Create Course Assignment
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingAsg(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={asgForm.title}
                    onChange={(e) => setAsgForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Unit 3 Quiz: Complex Integrals"
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-foreground">Target Course *</label>
                    <select
                      required
                      value={asgForm.courseTitle}
                      onChange={(e) => setAsgForm((f) => ({ ...f, courseTitle: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="">Choose course...</option>
                      {courseOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-foreground">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={asgForm.dueDate}
                      onChange={(e) => setAsgForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Total Points (Max Score)</label>
                  <input
                    type="number"
                    value={asgForm.maxScore}
                    onChange={(e) => setAsgForm((f) => ({ ...f, maxScore: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Instructions & Description</label>
                  <textarea
                    rows={3}
                    value={asgForm.description}
                    onChange={(e) => setAsgForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Write details of the assignment, requirements, etc..."
                    className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingAsg(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary hover:bg-primary/95 text-white gap-1.5"
                  >
                    <Send size={13} />
                    Publish Assignment
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
