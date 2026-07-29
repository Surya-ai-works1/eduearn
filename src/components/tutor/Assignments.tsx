"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Plus,
  Search,
  Calendar,
  BookOpen,
  Send,
  Download,
  Trash2,
  Edit2,
  Bold,
  Italic,
  Code,
  Paperclip,
  Save,
  X,
  User,
  Filter,
  Eye,
  FileCheck,
  ClipboardList
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
  attachments?: string[];
  totalStudents: number;
  submittedCount: number;
  pendingCount: number;
  status: "Active" | "Completed";
}

export const Assignments = React.memo(function Assignments({
  students,
  activeGradingStudentId,
  setActiveGradingStudentId,
  gradingForm,
  setGradingForm,
  handleSubmitGrade,
}: AssignmentsProps) {
  // Local list of assignments templates
  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    {
      id: "asg-1",
      title: "Homework 1: Vector Space Proofs",
      courseTitle: "Linear Algebra & Applications",
      dueDate: "2026-08-05",
      maxScore: "100",
      description: "Prove the 8 axioms of vector spaces for the set of polynomial functions of degree n.",
      attachments: ["axiom_cheatsheet.pdf", "sample_proofs.pdf"],
      totalStudents: 15,
      submittedCount: 8,
      pendingCount: 7,
      status: "Active"
    },
    {
      id: "asg-2",
      title: "Lab 2: Dynamic Routing Page Configuration",
      courseTitle: "Full-Stack Web Dev Bootcamp",
      dueDate: "2026-07-20",
      maxScore: "100",
      description: "Setup custom layout routes in Next.js App Router and handle client-side context updates.",
      attachments: ["routing_spec.docx"],
      totalStudents: 20,
      submittedCount: 20,
      pendingCount: 0,
      status: "Completed"
    }
  ]);

  // Tab: "submissions" | "assignments"
  const [activeTab, setActiveTab] = useState<"assignments" | "submissions">("assignments");

  // Create Assignment State
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);
  const [asgForm, setAsgForm] = useState({
    title: "",
    courseTitle: "",
    dueDate: "",
    maxScore: "100",
    description: "",
    attachments: [] as string[]
  });

  // Edit Assignment State
  const [editingAsg, setEditingAsg] = useState<AssignmentItem | null>(null);
  const [editAsgForm, setEditAsgForm] = useState<Partial<AssignmentItem>>({});

  // Submission Drawer (Review Drawer)
  const [selectedSubmission, setSelectedSubmission] = useState<StudentProgress | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Active" | "Completed" for table; "All" | "Submitted" | "Graded" for submissions

  const courseOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.courseTitle)));
  }, [students]);

  // Compute stats
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter((a) => a.status === "Active").length;
    const pending = students.filter((s) => s.assignmentStatus === "Submitted").length;
    const completed = assignments.filter((a) => a.status === "Completed").length;

    return { total, active, pending, completed };
  }, [assignments, students]);

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
      attachments: asgForm.attachments,
      totalStudents: students.filter(s => s.courseTitle === asgForm.courseTitle).length || 10,
      submittedCount: 0,
      pendingCount: students.filter(s => s.courseTitle === asgForm.courseTitle).length || 10,
      status: "Active"
    };

    setAssignments((prev) => [newItem, ...prev]);
    setIsCreatingAsg(false);
    setAsgForm({
      title: "",
      courseTitle: "",
      dueDate: "",
      maxScore: "100",
      description: "",
      attachments: []
    });
    toast.success("Assignment created and shared with students!");
  };

  const handleStartEdit = (asg: AssignmentItem) => {
    setEditingAsg(asg);
    setEditAsgForm({
      title: asg.title,
      courseTitle: asg.courseTitle,
      dueDate: asg.dueDate,
      maxScore: asg.maxScore,
      description: asg.description,
      status: asg.status
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsg) return;

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === editingAsg.id
          ? {
              ...a,
              title: editAsgForm.title || a.title,
              courseTitle: editAsgForm.courseTitle || a.courseTitle,
              dueDate: editAsgForm.dueDate || a.dueDate,
              maxScore: editAsgForm.maxScore || a.maxScore,
              description: editAsgForm.description || a.description,
              status: editAsgForm.status || a.status
            }
          : a
      )
    );

    setEditingAsg(null);
    toast.success("Assignment updated successfully!");
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Assignment deleted successfully.");
  };

  // Filters for Table
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === "All" || a.courseTitle === courseFilter;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [assignments, searchQuery, courseFilter, statusFilter]);

  // Filters for Submissions
  const filteredSubmissions = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === "All" || s.courseTitle === courseFilter;
      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Submitted"
          ? s.assignmentStatus === "Submitted"
          : s.assignmentStatus === "Graded";
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [students, searchQuery, courseFilter, statusFilter]);

  const handleToolbarClick = (action: string) => {
    toast.info(`Rich text styling [${action}] applied to description.`);
  };

  const handleGradeSubmit = (studentId: string) => {
    handleSubmitGrade(studentId);
    setSelectedSubmission(null);
  };

  return (
    <motion.div
      key="tutor-assignments"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground">Assignment Manager</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor, edit, delete, and grade all student assessments.
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assignments", count: stats.total, color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
          { label: "Active Assignments", count: stats.active, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
          { label: "Pending Review", count: stats.pending, color: "text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse" },
          { label: "Completed", count: stats.completed, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
        ].map((item, idx) => (
          <Card key={idx} variant="glass" className={`p-4 text-center border font-bold ${item.color}`}>
            <p className="text-2xl font-heading font-extrabold">{item.count}</p>
            <p className="text-[10px] font-extrabold uppercase mt-1">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs toggle between templates and submissions list */}
      <div className="flex border-b border-border/40 pb-2 gap-4 text-xs font-bold text-muted-foreground">
        <button
          onClick={() => { setActiveTab("assignments"); setStatusFilter("All"); }}
          className={`pb-2 border-b-2 transition-all cursor-pointer ${activeTab === "assignments" ? "border-primary text-primary" : "border-transparent hover:text-foreground"}`}
        >
          Assignments Grid
        </button>
        <button
          onClick={() => { setActiveTab("submissions"); setStatusFilter("All"); }}
          className={`pb-2 border-b-2 transition-all cursor-pointer ${activeTab === "submissions" ? "border-primary text-primary" : "border-transparent hover:text-foreground"}`}
        >
          Submissions Inbox ({students.filter(s => s.assignmentStatus !== "Pending").length})
        </button>
      </div>

      {/* Search and Filters card */}
      <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeTab === "assignments" ? "Search assignments..." : "Search students..."}
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          {activeTab === "assignments" ? (
            <>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </>
          ) : (
            <>
              <option value="All">All Submissions</option>
              <option value="Submitted">Awaiting Review</option>
              <option value="Graded">Graded</option>
            </>
          )}
        </select>
      </Card>

      {/* Tab contents */}
      {activeTab === "assignments" ? (
        <div className="w-full overflow-x-auto border border-border bg-card rounded-card shadow-soft">
          <table className="w-full text-xs text-left min-w-[800px]" role="table">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                <th className="p-4">Assignment Name</th>
                <th className="p-4">Course</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-center">Total Students</th>
                <th className="p-4 text-center">Submitted</th>
                <th className="p-4 text-center">Pending</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
              {filteredAssignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-muted/15">
                  <td className="p-4 font-bold text-foreground">{asg.title}</td>
                  <td className="p-4">{asg.courseTitle}</td>
                  <td className="p-4">{asg.dueDate}</td>
                  <td className="p-4 text-center text-foreground font-bold">{asg.totalStudents}</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">{asg.submittedCount}</td>
                  <td className="p-4 text-center text-amber-600 font-bold">{asg.pendingCount}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      asg.status === "Active" ? "bg-sky-500/10 border-sky-500/20 text-sky-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    }`}>
                      {asg.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(asg)}
                        className="h-7 w-7 p-0"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAssignment(asg.id)}
                        className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/5"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground italic">No assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Submissions Inbox view */
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="No submissions found"
              description="Awaiting student uploads."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubmissions.map((student) => (
                <Card
                  key={student.id}
                  className="p-4 border-border/50 shadow-soft space-y-3 hover:border-primary/20 transition-all cursor-pointer"
                  onClick={() => setSelectedSubmission(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{student.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{student.courseTitle}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                      student.assignmentStatus === "Graded" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    }`}>
                      {student.assignmentStatus}
                    </span>
                  </div>
                  {student.submittedFile && (
                    <div className="text-[9px] bg-muted/40 p-2 border border-border/40 rounded flex items-center gap-1.5">
                      <FileText size={12} className="text-primary" />
                      <span className="text-foreground truncate">{student.submittedFile}</span>
                    </div>
                  )}
                  {student.assignmentStatus === "Graded" && (
                    <p className="text-[10px] text-muted-foreground italic">Grade Score: {student.grade} &bull; Marks assigned</p>
                  )}
                  <Button size="sm" className="w-full h-8 text-[10px] font-bold bg-primary text-white">
                    {student.assignmentStatus === "Graded" ? "View Review Feedback" : "Review & Grade Submission"}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE ASSIGNMENT DIALOG MODAL */}
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
                  <button type="button" onClick={() => setIsCreatingAsg(false)} className="text-muted-foreground">
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
                    placeholder="e.g. Unit 3 Homework Assignment"
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Course *</label>
                    <select
                      required
                      value={asgForm.courseTitle}
                      onChange={(e) => setAsgForm((f) => ({ ...f, courseTitle: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="">Select course...</option>
                      {courseOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={asgForm.dueDate}
                      onChange={(e) => setAsgForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
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
                  <label className="font-bold text-foreground">Instructions & Description *</label>
                  <div className="flex gap-1 bg-muted p-1 border border-b-0 border-border rounded-t">
                    <button type="button" onClick={() => handleToolbarClick("bold")} className="p-1 hover:bg-card rounded text-muted-foreground"><Bold size={11} /></button>
                    <button type="button" onClick={() => handleToolbarClick("italic")} className="p-1 hover:bg-card rounded text-muted-foreground"><Italic size={11} /></button>
                    <button type="button" onClick={() => handleToolbarClick("code")} className="p-1 hover:bg-card rounded text-muted-foreground"><Code size={11} /></button>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={asgForm.description}
                    onChange={(e) => setAsgForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Write instructions..."
                    className="w-full bg-card border border-border border-t-0 rounded-b p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreatingAsg(false)} className="h-9 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 text-xs bg-primary hover:bg-primary/95 text-white gap-1.5">
                    <Send size={13} /> Publish Assignment
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EDIT TEMPLATE DIALOG MODAL */}
      <AnimatePresence>
        {editingAsg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setEditingAsg(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-md bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto"
            >
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-heading font-extrabold uppercase text-foreground">
                    Edit Assignment Detail
                  </h4>
                  <button type="button" onClick={() => setEditingAsg(null)} className="text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={editAsgForm.title || ""}
                    onChange={(e) => setEditAsgForm((f) => ({ ...f, title: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Course *</label>
                    <select
                      required
                      value={editAsgForm.courseTitle || ""}
                      onChange={(e) => setEditAsgForm((f) => ({ ...f, courseTitle: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      {courseOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={editAsgForm.dueDate || ""}
                      onChange={(e) => setEditAsgForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Max Score</label>
                    <input
                      type="text"
                      value={editAsgForm.maxScore || ""}
                      onChange={(e) => setEditAsgForm((f) => ({ ...f, maxScore: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Status</label>
                    <select
                      value={editAsgForm.status || "Active"}
                      onChange={(e) => setEditAsgForm((f) => ({ ...f, status: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Description</label>
                  <textarea
                    rows={3}
                    value={editAsgForm.description || ""}
                    onChange={(e) => setEditAsgForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingAsg(null)} className="h-9 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 text-xs bg-primary hover:bg-primary/95 text-white gap-1.5">
                    <Save size={13} /> Save Template
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SUBMISSION REVIEW & GRADING DRAWER */}
      <AnimatePresence>
        {selectedSubmission && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setSelectedSubmission(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-sm font-heading font-extrabold uppercase text-foreground">
                    Review Submission
                  </h3>
                  <button onClick={() => setSelectedSubmission(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-1">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Student Name</p>
                    <p className="text-foreground font-bold">{selectedSubmission.name}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedSubmission.courseTitle}</p>
                  </div>

                  {selectedSubmission.submittedFile && (
                    <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-2">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground">Uploaded Document</p>
                      <div className="flex items-center justify-between bg-card p-2 rounded border border-border/40">
                        <span className="text-foreground truncate">{selectedSubmission.submittedFile}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Downloading: ${selectedSubmission.submittedFile}`)}
                          className="h-6 text-[9px] px-2 text-primary"
                        >
                          <Download size={11} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.assignmentStatus === "Graded" ? (
                    <div className="p-3 bg-muted/30 border border-border/40 rounded space-y-2 text-foreground font-semibold">
                      <p className="text-[9px] font-extrabold uppercase text-emerald-600">Graded Details</p>
                      <div>
                        <span className="text-muted-foreground">Assigned Grade:</span> {selectedSubmission.grade}
                      </div>
                      {selectedSubmission.feedback && (
                        <div>
                          <p className="text-muted-foreground">Feedback:</p>
                          <p className="italic text-muted-foreground/90 font-medium mt-0.5">
                            &quot;{selectedSubmission.feedback}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Grade Form */
                    <div className="space-y-3 border-t border-border/40 pt-3">
                      <p className="text-[10px] font-extrabold uppercase text-primary">Score Assessment</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-foreground">Grade Mark *</label>
                          <select
                            value={gradingForm.grade}
                            onChange={(e) => setGradingForm((f) => ({ ...f, grade: e.target.value }))}
                            className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          >
                            <option value="">Choose...</option>
                            {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-foreground">Score Marks *</label>
                          <input
                            type="text"
                            placeholder="e.g. 95/100"
                            value={gradingForm.score}
                            onChange={(e) => setGradingForm((f) => ({ ...f, score: e.target.value }))}
                            className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Constructive Feedback *</label>
                        <textarea
                          rows={4}
                          value={gradingForm.feedback}
                          onChange={(e) => setGradingForm((f) => ({ ...f, feedback: e.target.value }))}
                          placeholder="Provide descriptive feedback notes..."
                          className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                        />
                      </div>
                      <Button
                        onClick={() => handleGradeSubmit(selectedSubmission.id)}
                        className="w-full h-9 bg-primary hover:bg-primary/95 text-white font-bold gap-1 mt-2 shadow-soft"
                      >
                        <CheckCircle size={13} />
                        Submit Grade
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-border/40 bg-muted/10">
                <Button variant="outline" className="w-full h-9" onClick={() => setSelectedSubmission(null)}>
                  Close Review Panel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
