"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  ClipboardList,
  Copy,
  FolderMinus,
  Archive,
  Share2,
  TrendingUp,
  Award,
  AlertCircle,
  Clock,
  Settings,
  ChevronLeft,
  PieChart,
  BellRing
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

interface LocalAssignment {
  id: string;
  title: string;
  courseTitle: string;
  batch: string;
  description: string;
  maxMarks: number;
  difficulty: "Easy" | "Medium" | "Hard";
  submissionTypes: string[];
  attachmentName?: string;
  dueDate: string; // ISO date string
  allowLate: boolean;
  latePenalty: number;
  status: "published" | "draft" | "closed";
  createdAt: string;
}

interface LocalSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt?: string;
  fileUrl?: string;
  fileType?: string;
  isLate: boolean;
  status: "Submitted" | "Late Submission" | "Not Submitted" | "Graded" | "Review Pending";
  marks?: number;
  feedback?: string;
  privateNotes?: string;
  gradedAt?: string;
}

interface NotificationLog {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  type: string;
  timestamp: string;
}

export const Assignments = React.memo(function Assignments({
  students: parentStudents,
  activeGradingStudentId,
  setActiveGradingStudentId,
  gradingForm,
  setGradingForm,
  handleSubmitGrade,
}: AssignmentsProps) {
  // ─── STATE MANAGEMENT ──────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<LocalAssignment[]>([]);
  const [submissions, setSubmissions] = useState<LocalSubmission[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  
  // Navigation: "list" | "details"
  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [selectedAsgId, setSelectedAsgId] = useState<string | null>(null);
  
  // Tabs: "assignments" | "submissions" | "analytics" | "notifications"
  const [activeTab, setActiveTab] = useState<"assignments" | "submissions" | "analytics" | "notifications">("assignments");

  // Selection state for Bulk Actions
  const [selectedAsgIds, setSelectedAsgIds] = useState<Set<string>>(new Set());

  // Create/Edit Modals
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);
  const [editingAsg, setEditingAsg] = useState<LocalAssignment | null>(null);
  
  // Review Drawer
  const [activeReviewSubmission, setActiveReviewSubmission] = useState<LocalSubmission | null>(null);
  const [reviewForm, setReviewForm] = useState({
    marks: "",
    feedback: "",
    privateNotes: "",
    isDraft: false
  });

  // Forms State
  const [asgForm, setAsgForm] = useState({
    title: "",
    courseTitle: "",
    batch: "Batch A",
    description: "",
    maxMarks: "100",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    submissionTypes: ["PDF"],
    attachmentName: "",
    dueDate: "",
    dueTime: "23:59",
    allowLate: false,
    latePenalty: "10",
    status: "published" as "published" | "draft"
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deadlineFilter, setDeadlineFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Standard fallback students list
  const fallbackStudents = useMemo(() => {
    if (parentStudents && parentStudents.length > 0) {
      return parentStudents.map(s => ({
        id: s.id,
        name: s.name,
        email: `${s.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@eduearn.edu`,
        courseTitle: s.courseTitle
      }));
    }
    return [
      { id: "std-1", name: "Aarav Mehta", email: "aarav.mehta@eduearn.edu", courseTitle: "Linear Algebra & Applications" },
      { id: "std-2", name: "Isha Sharma", email: "isha.sharma@eduearn.edu", courseTitle: "Linear Algebra & Applications" },
      { id: "std-3", name: "Rohan Das", email: "rohan.das@eduearn.edu", courseTitle: "Linear Algebra & Applications" },
      { id: "std-4", name: "Ananya Iyer", email: "ananya.iyer@eduearn.edu", courseTitle: "Linear Algebra & Applications" },
      { id: "std-5", name: "Kabir Singh", email: "kabir.singh@eduearn.edu", courseTitle: "Linear Algebra & Applications" },
      { id: "std-6", name: "Aditi Rao", email: "aditi.rao@eduearn.edu", courseTitle: "Full-Stack Web Dev Bootcamp" },
      { id: "std-7", name: "Dev Patel", email: "dev.patel@eduearn.edu", courseTitle: "Full-Stack Web Dev Bootcamp" },
      { id: "std-8", name: "Meera Nair", email: "meera.nair@eduearn.edu", courseTitle: "Full-Stack Web Dev Bootcamp" },
      { id: "std-9", name: "Kunal Kapoor", email: "kunal.kapoor@eduearn.edu", courseTitle: "Full-Stack Web Dev Bootcamp" },
      { id: "std-10", name: "Sanya Gupta", email: "sanya.gupta@eduearn.edu", courseTitle: "Full-Stack Web Dev Bootcamp" }
    ];
  }, [parentStudents]);

  // Available Course/Batch options
  const courseOptions = useMemo(() => {
    const list = new Set(fallbackStudents.map(s => s.courseTitle));
    if (list.size === 0) {
      list.add("Linear Algebra & Applications");
      list.add("Full-Stack Web Dev Bootcamp");
      list.add("Business & Entrepreneurship");
    }
    return Array.from(list);
  }, [fallbackStudents]);

  const batchOptions = ["Batch A", "Batch B", "Batch C"];

  // ─── INITIALIZATION (LOCAL STORAGE SYNC) ──────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Assignments
    const savedAsgs = localStorage.getItem("eduearn_assignments");
    let currentAsgs: LocalAssignment[] = [];
    if (savedAsgs) {
      currentAsgs = JSON.parse(savedAsgs);
    } else {
      currentAsgs = [
        {
          id: "asg-1",
          title: "Homework 1: Vector Space Proofs",
          courseTitle: "Linear Algebra & Applications",
          batch: "Batch A",
          description: "Prove the 8 axioms of vector spaces for the set of polynomial functions of degree n. Submissions must show step-by-step logic proofs.",
          maxMarks: 100,
          difficulty: "Medium",
          submissionTypes: ["PDF", "DOCX"],
          attachmentName: "vector_axioms_guide.pdf",
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days left
          allowLate: true,
          latePenalty: 10,
          status: "published",
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
        },
        {
          id: "asg-2",
          title: "Lab 2: Dynamic Routing Page Configuration",
          courseTitle: "Full-Stack Web Dev Bootcamp",
          batch: "Batch B",
          description: "Setup custom nested dynamic route patterns inside Next.js 16 App Router using search parameters and folder segmentation.",
          maxMarks: 100,
          difficulty: "Hard",
          submissionTypes: ["ZIP"],
          attachmentName: "routing_specification_doc.pdf",
          dueDate: new Date(Date.now() - 86400000).toISOString(), // Overdue by 1 day
          allowLate: false,
          latePenalty: 0,
          status: "closed",
          createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
        },
        {
          id: "asg-3",
          title: "Quiz Preparation 1: Market Research Outline",
          courseTitle: "Business & Entrepreneurship",
          batch: "Batch A",
          description: "Develop a basic pitch deck blueprint framework mapping potential market research validation queries.",
          maxMarks: 50,
          difficulty: "Easy",
          submissionTypes: ["PPT", "PDF"],
          dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days left
          allowLate: true,
          latePenalty: 15,
          status: "published",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
      localStorage.setItem("eduearn_assignments", JSON.stringify(currentAsgs));
    }
    setAssignments(currentAsgs);

    // Load Submissions
    const savedSubs = localStorage.getItem("eduearn_submissions");
    let currentSubs: LocalSubmission[] = [];
    if (savedSubs) {
      currentSubs = JSON.parse(savedSubs);
    } else {
      // Auto-populate mock submissions based on fallback students
      currentAsgs.forEach(asg => {
        const studentsForCourse = fallbackStudents.filter(s => s.courseTitle === asg.courseTitle);
        studentsForCourse.forEach((student, index) => {
          let subStatus: LocalSubmission["status"] = "Not Submitted";
          let isLate = false;
          let subDate: string | undefined;
          let fileUrl: string | undefined;
          let fileType: string | undefined;
          let marks: number | undefined;
          let feedback: string | undefined;

          // Deterministic mock generation based on index
          const isPast = new Date(asg.dueDate).getTime() < Date.now();
          if (index % 4 === 0) {
            subStatus = "Graded";
            subDate = new Date(new Date(asg.createdAt).getTime() + 86400000).toISOString();
            fileUrl = `${asg.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_submit_${student.name.replace(/\s+/g, "_")}.pdf`;
            fileType = "PDF";
            marks = Math.floor(asg.maxMarks * (0.75 + (index % 5) * 0.05));
            feedback = "Excellent conceptual demonstration of logic formulas. Well structures formatting.";
          } else if (index % 4 === 1) {
            subStatus = "Review Pending";
            subDate = new Date(new Date(asg.createdAt).getTime() + 86400000 * 2).toISOString();
            fileUrl = `${asg.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_submit_${student.name.replace(/\s+/g, "_")}.pdf`;
            fileType = "PDF";
          } else if (index % 4 === 2) {
            if (isPast) {
              if (asg.allowLate) {
                subStatus = "Late Submission";
                isLate = true;
                subDate = new Date(new Date(asg.dueDate).getTime() + 3600000 * 4).toISOString(); // 4 hours late
                fileUrl = `${asg.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_submit_${student.name.replace(/\s+/g, "_")}.zip`;
                fileType = "ZIP";
              } else {
                subStatus = "Not Submitted";
              }
            } else {
              subStatus = "Not Submitted";
            }
          } else {
            subStatus = "Submitted";
            subDate = new Date(new Date(asg.createdAt).getTime() + 86400000 * 3).toISOString();
            fileUrl = `${asg.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_submit_${student.name.replace(/\s+/g, "_")}.docx`;
            fileType = "DOCX";
          }

          currentSubs.push({
            id: `sub-${asg.id}-${student.id}`,
            assignmentId: asg.id,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            submittedAt: subDate,
            fileUrl,
            fileType,
            isLate,
            status: subStatus,
            marks,
            feedback
          });
        });
      });
      localStorage.setItem("eduearn_submissions", JSON.stringify(currentSubs));
    }
    setSubmissions(currentSubs);

    // Initial Notifications Log
    const initialLogs: NotificationLog[] = [];
    currentAsgs.forEach(asg => {
      initialLogs.push({
        id: `notif-${asg.id}-created`,
        assignmentId: asg.id,
        assignmentTitle: asg.title,
        studentName: "All Enrolled Students",
        type: "Assignment Published",
        timestamp: new Date(asg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date(asg.createdAt).toLocaleDateString()
      });
    });
    setNotifications(initialLogs);

  }, [fallbackStudents]);

  // Keep list updated if deadlines pass
  useEffect(() => {
    if (assignments.length === 0) return;
    let modified = false;
    const checkedAsgs = assignments.map(asg => {
      const isPast = new Date(asg.dueDate).getTime() < Date.now();
      if (isPast && asg.status === "published" && !asg.allowLate) {
        modified = true;
        return { ...asg, status: "closed" as const };
      }
      return asg;
    });

    if (modified) {
      setAssignments(checkedAsgs);
      localStorage.setItem("eduearn_assignments", JSON.stringify(checkedAsgs));
    }
  }, [assignments]);

  // ─── DYNAMIC STATISTICS CALCULATIONS ──────────────────────────────────────
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter((a) => a.status === "published").length;
    const closed = assignments.filter((a) => a.status === "closed").length;
    
    // Due today check
    const dueToday = assignments.filter((a) => {
      const due = new Date(a.dueDate);
      const today = new Date();
      return due.getDate() === today.getDate() &&
        due.getMonth() === today.getMonth() &&
        due.getFullYear() === today.getFullYear() &&
        a.status === "published";
    }).length;

    // Submissions pending review
    const pendingReviews = submissions.filter((s) => s.status === "Submitted" || s.status === "Late Submission" || s.status === "Review Pending").length;

    // Average Submission Rate
    let totalPossibilities = 0;
    let totalSubmits = 0;
    assignments.forEach(asg => {
      const subsForAsg = submissions.filter(s => s.assignmentId === asg.id);
      totalPossibilities += subsForAsg.length;
      totalSubmits += subsForAsg.filter(s => s.status !== "Not Submitted").length;
    });
    const subRate = totalPossibilities > 0 ? Math.round((totalSubmits / totalPossibilities) * 100) : 0;

    return { total, active, closed, dueToday, pendingReviews, subRate };
  }, [assignments, submissions]);

  // ─── FILTER & SORT LOGIC ──────────────────────────────────────────────────
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.batch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === "All" || a.courseTitle === courseFilter;
      const matchesBatch = batchFilter === "All" || a.batch === batchFilter;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      
      // Deadline filter
      let matchesDeadline = true;
      if (deadlineFilter !== "All") {
        const dueTime = new Date(a.dueDate).getTime();
        const diffDays = (dueTime - Date.now()) / (86400000);
        if (deadlineFilter === "today") {
          const due = new Date(a.dueDate);
          const today = new Date();
          matchesDeadline = due.getDate() === today.getDate() && due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
        } else if (deadlineFilter === "week") {
          matchesDeadline = diffDays >= 0 && diffDays <= 7;
        } else if (deadlineFilter === "overdue") {
          matchesDeadline = diffDays < 0 && a.status !== "closed";
        }
      }
      return matchesSearch && matchesCourse && matchesBatch && matchesStatus && matchesDeadline;
    }).sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "deadline") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === "subrate") {
        const subRateA = getAsgSubmissionRate(a.id);
        const subRateB = getAsgSubmissionRate(b.id);
        return subRateB - subRateA;
      }
      return 0;
    });
  }, [assignments, submissions, searchQuery, courseFilter, batchFilter, statusFilter, deadlineFilter, sortBy]);

  // Helper to fetch statistics for a single assignment
  function getAsgStats(asgId: string) {
    const subsForAsg = submissions.filter(s => s.assignmentId === asgId);
    const total = subsForAsg.length;
    const submitted = subsForAsg.filter(s => s.status === "Submitted" || s.status === "Graded" || s.status === "Late Submission" || s.status === "Review Pending").length;
    const pending = total - submitted;
    const late = subsForAsg.filter(s => s.status === "Late Submission" || s.isLate).length;
    const graded = subsForAsg.filter(s => s.status === "Graded").length;
    
    // Average Marks
    const gradedSubs = subsForAsg.filter(s => s.status === "Graded" && s.marks !== undefined);
    const avgMarks = gradedSubs.length > 0
      ? Math.round((gradedSubs.reduce((acc, curr) => acc + (curr.marks ?? 0), 0) / gradedSubs.length) * 10) / 10
      : 0;

    const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;
    const notStarted = subsForAsg.filter(s => s.status === "Not Submitted").length;

    return { total, submitted, pending, late, graded, avgMarks, rate, notStarted };
  }

  function getAsgSubmissionRate(asgId: string) {
    return getAsgStats(asgId).rate;
  }

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  
  // Validation checks helper
  const validateForm = () => {
    if (!asgForm.title.trim()) {
      toast.error("Assignment Title cannot be empty.");
      return false;
    }
    if (!asgForm.courseTitle) {
      toast.error("Please select a target course.");
      return false;
    }
    if (!asgForm.dueDate || !asgForm.dueTime) {
      toast.error("Please specify a valid deadline date and time.");
      return false;
    }
    const deadlineVal = new Date(`${asgForm.dueDate}T${asgForm.dueTime}`);
    if (deadlineVal.getTime() < Date.now() && asgForm.status === "published") {
      toast.error("Deadline cannot be set in the past for published assignments.");
      return false;
    }
    const marksVal = parseInt(asgForm.maxMarks);
    if (isNaN(marksVal) || marksVal <= 0) {
      toast.error("Maximum marks must be a positive integer.");
      return false;
    }
    if (asgForm.submissionTypes.length === 0) {
      toast.error("Select at least one allowed submission file type.");
      return false;
    }
    const penaltyVal = parseInt(asgForm.latePenalty);
    if (asgForm.allowLate && (isNaN(penaltyVal) || penaltyVal < 0 || penaltyVal > 100)) {
      toast.error("Late Penalty must be a percentage between 0 and 100.");
      return false;
    }
    return true;
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalDueDate = new Date(`${asgForm.dueDate}T${asgForm.dueTime}`).toISOString();
    const newAsg: LocalAssignment = {
      id: `asg-${Date.now()}`,
      title: asgForm.title.trim(),
      courseTitle: asgForm.courseTitle,
      batch: asgForm.batch,
      description: asgForm.description,
      maxMarks: parseInt(asgForm.maxMarks),
      difficulty: asgForm.difficulty,
      submissionTypes: asgForm.submissionTypes,
      attachmentName: asgForm.attachmentName || undefined,
      dueDate: finalDueDate,
      allowLate: asgForm.allowLate,
      latePenalty: asgForm.allowLate ? parseInt(asgForm.latePenalty) : 0,
      status: asgForm.status,
      createdAt: new Date().toISOString()
    };

    // Update state
    const updatedAsgs = [newAsg, ...assignments];
    setAssignments(updatedAsgs);
    localStorage.setItem("eduearn_assignments", JSON.stringify(updatedAsgs));

    // Create submissions mock mapping for enrolled students
    const studentsForCourse = fallbackStudents.filter(s => s.courseTitle === newAsg.courseTitle);
    const newSubs: LocalSubmission[] = studentsForCourse.map(student => ({
      id: `sub-${newAsg.id}-${student.id}`,
      assignmentId: newAsg.id,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      isLate: false,
      status: "Not Submitted"
    }));

    const updatedSubs = [...submissions, ...newSubs];
    setSubmissions(updatedSubs);
    localStorage.setItem("eduearn_submissions", JSON.stringify(updatedSubs));

    // Trigger Notification log
    const logId = `notif-${newAsg.id}-created-${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      assignmentId: newAsg.id,
      assignmentTitle: newAsg.title,
      studentName: "All Enrolled Students",
      type: "Assignment Published",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString()
    };
    setNotifications(prev => [newLog, ...prev]);

    // Close Modal and Reset
    setIsCreatingAsg(false);
    setAsgForm({
      title: "",
      courseTitle: "",
      batch: "Batch A",
      description: "",
      maxMarks: "100",
      difficulty: "Medium",
      submissionTypes: ["PDF"],
      attachmentName: "",
      dueDate: "",
      dueTime: "23:59",
      allowLate: false,
      latePenalty: "10",
      status: "published"
    });

    toast.success("Assignment created and notifications dispatched successfully!");
  };

  const handleStartEdit = (asg: LocalAssignment) => {
    setEditingAsg(asg);
    const d = new Date(asg.dueDate);
    const dateStr = d.toISOString().substring(0, 10);
    const timeStr = d.toTimeString().substring(0, 5);

    setAsgForm({
      title: asg.title,
      courseTitle: asg.courseTitle,
      batch: asg.batch,
      description: asg.description,
      maxMarks: String(asg.maxMarks),
      difficulty: asg.difficulty,
      submissionTypes: asg.submissionTypes,
      attachmentName: asg.attachmentName || "",
      dueDate: dateStr,
      dueTime: timeStr,
      allowLate: asg.allowLate,
      latePenalty: String(asg.latePenalty),
      status: asg.status === "closed" ? "published" : asg.status
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsg) return;
    if (!validateForm()) return;

    const finalDueDate = new Date(`${asgForm.dueDate}T${asgForm.dueTime}`).toISOString();
    
    // check closed state
    const isPast = new Date(finalDueDate).getTime() < Date.now();
    const resolvedStatus = (isPast && !asgForm.allowLate ? "closed" : (editingAsg.status === "closed" ? "published" : asgForm.status)) as LocalAssignment["status"];

    const updatedAsgs = assignments.map(a =>
      a.id === editingAsg.id
        ? {
            ...a,
            title: asgForm.title.trim(),
            courseTitle: asgForm.courseTitle,
            batch: asgForm.batch,
            description: asgForm.description,
            maxMarks: parseInt(asgForm.maxMarks),
            difficulty: asgForm.difficulty,
            submissionTypes: asgForm.submissionTypes,
            attachmentName: asgForm.attachmentName || undefined,
            dueDate: finalDueDate,
            allowLate: asgForm.allowLate,
            latePenalty: asgForm.allowLate ? parseInt(asgForm.latePenalty) : 0,
            status: resolvedStatus
          }
        : a
    );

    setAssignments(updatedAsgs);
    localStorage.setItem("eduearn_assignments", JSON.stringify(updatedAsgs));
    setEditingAsg(null);
    toast.success("Assignment updated successfully!");
  };

  const handleDeleteAssignment = (id: string) => {
    const updatedAsgs = assignments.filter((a) => a.id !== id);
    setAssignments(updatedAsgs);
    localStorage.setItem("eduearn_assignments", JSON.stringify(updatedAsgs));

    const updatedSubs = submissions.filter((s) => s.assignmentId !== id);
    setSubmissions(updatedSubs);
    localStorage.setItem("eduearn_submissions", JSON.stringify(updatedSubs));

    setSelectedAsgIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (selectedAsgId === id) {
      setViewMode("list");
      setSelectedAsgId(null);
    }
    toast.success("Assignment removed successfully.");
  };

  const handleDuplicateAssignment = (asg: LocalAssignment) => {
    const duplicated: LocalAssignment = {
      ...asg,
      id: `asg-${Date.now()}`,
      title: `${asg.title} (Copy)`,
      createdAt: new Date().toISOString()
    };
    
    const updatedAsgs = [duplicated, ...assignments];
    setAssignments(updatedAsgs);
    localStorage.setItem("eduearn_assignments", JSON.stringify(updatedAsgs));

    const studentsForCourse = fallbackStudents.filter(s => s.courseTitle === duplicated.courseTitle);
    const newSubs: LocalSubmission[] = studentsForCourse.map(student => ({
      id: `sub-${duplicated.id}-${student.id}`,
      assignmentId: duplicated.id,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      isLate: false,
      status: "Not Submitted"
    }));

    const updatedSubs = [...submissions, ...newSubs];
    setSubmissions(updatedSubs);
    localStorage.setItem("eduearn_submissions", JSON.stringify(updatedSubs));

    toast.success(`Duplicated "${asg.title}" successfully!`);
  };

  const handleCloseAssignment = (id: string) => {
    const updatedAsgs = assignments.map(a =>
      a.id === id ? { ...a, status: "closed" as const } : a
    );
    setAssignments(updatedAsgs);
    localStorage.setItem("eduearn_assignments", JSON.stringify(updatedAsgs));

    // Notify students
    const targetAsg = assignments.find(a => a.id === id);
    if (targetAsg) {
      const newLog: NotificationLog = {
        id: `notif-${id}-closed-${Date.now()}`,
        assignmentId: id,
        assignmentTitle: targetAsg.title,
        studentName: "All Enrolled Students",
        type: "Assignment Closed",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString()
      };
      setNotifications(prev => [newLog, ...prev]);
    }
    toast.success("Assignment closed to further submissions.");
  };

  // ─── BULK ACTIONS ──────────────────────────────────────────────────────────
  const toggleSelectAssignment = (id: string) => {
    setSelectedAsgIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedAsgIds.size === filteredAssignments.length) {
      setSelectedAsgIds(new Set());
    } else {
      setSelectedAsgIds(new Set(filteredAssignments.map(a => a.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedAsgIds.size === 0) return;
    const arrayIds = Array.from(selectedAsgIds);
    
    const updatedAsgs = assignments.filter(a => !selectedAsgIds.has(a.id));
    setAssignments(updatedAsgs);
    localStorage.setItem("eduearn_assignments", JSON.stringify(updatedAsgs));

    const updatedSubs = submissions.filter(s => !selectedAsgIds.has(s.assignmentId));
    setSubmissions(updatedSubs);
    localStorage.setItem("eduearn_submissions", JSON.stringify(updatedSubs));

    setSelectedAsgIds(new Set());
    toast.success(`Bulk deleted ${arrayIds.length} assignments successfully.`);
  };

  const handleBulkClose = () => {
    if (selectedAsgIds.size === 0) return;
    const updatedAsgs = assignments.map(a =>
      selectedAsgIds.has(a.id) ? { ...a, status: "closed" as const } : a
    );
    setAssignments(updatedAsgs);
    localStorage.setItem("eduearn_assignments", JSON.stringify(updatedAsgs));
    setSelectedAsgIds(new Set());
    toast.success("Selected assignments closed successfully.");
  };

  const handleBulkDuplicate = () => {
    if (selectedAsgIds.size === 0) return;
    const extraAsgs: LocalAssignment[] = [];
    const extraSubs: LocalSubmission[] = [];

    selectedAsgIds.forEach(id => {
      const original = assignments.find(a => a.id === id);
      if (original) {
        const copy: LocalAssignment = {
          ...original,
          id: `asg-${Date.now()}-${Math.random()}`,
          title: `${original.title} (Copy)`,
          createdAt: new Date().toISOString()
        };
        extraAsgs.push(copy);

        const studentsForCourse = fallbackStudents.filter(s => s.courseTitle === copy.courseTitle);
        studentsForCourse.forEach(student => {
          extraSubs.push({
            id: `sub-${copy.id}-${student.id}`,
            assignmentId: copy.id,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            isLate: false,
            status: "Not Submitted"
          });
        });
      }
    });

    const updatedAsgs = [...extraAsgs, ...assignments];
    setAssignments(updatedAsgs);
    localStorage.setItem("eduearn_assignments", JSON.stringify(updatedAsgs));

    const updatedSubs = [...submissions, ...extraSubs];
    setSubmissions(updatedSubs);
    localStorage.setItem("eduearn_submissions", JSON.stringify(updatedSubs));

    setSelectedAsgIds(new Set());
    toast.success(`Duplicated ${extraAsgs.length} assignments successfully.`);
  };

  const handleBulkExport = () => {
    if (selectedAsgIds.size === 0) return;
    const selectedList = assignments.filter(a => selectedAsgIds.has(a.id));
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Title,Course,Batch,Difficulty,Max Marks,Due Date,Status,Created At\n";
    
    selectedList.forEach(a => {
      csvContent += `"${a.id}","${a.title}","${a.courseTitle}","${a.batch}","${a.difficulty}",${a.maxMarks},"${a.dueDate}","${a.status}","${a.createdAt}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eduearn_assignments_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV spreadsheet exported successfully!");
  };

  // ─── SUBMISSION REVIEW DRAWER WORKFLOW ─────────────────────────────────────
  const handleOpenReview = (sub: LocalSubmission) => {
    setActiveReviewSubmission(sub);
    setReviewForm({
      marks: sub.marks !== undefined ? String(sub.marks) : "",
      feedback: sub.feedback || "",
      privateNotes: sub.privateNotes || "",
      isDraft: false
    });
  };

  const handleSaveReviewGrade = (isDraft: boolean) => {
    if (!activeReviewSubmission) return;
    const marksNum = parseFloat(reviewForm.marks);
    const targetAsg = assignments.find(a => a.id === activeReviewSubmission.assignmentId);
    
    if (isNaN(marksNum) || marksNum < 0) {
      toast.error("Please assign valid positive marks.");
      return;
    }

    if (targetAsg && marksNum > targetAsg.maxMarks) {
      toast.error(`Marks cannot exceed the maximum score limit of ${targetAsg.maxMarks}.`);
      return;
    }

    // Apply late penalty check if submission was late and user hasn't overridden
    const finalMarks = marksNum;
    if (activeReviewSubmission.isLate && targetAsg && targetAsg.latePenalty > 0) {
      const deduction = (targetAsg.latePenalty / 100) * targetAsg.maxMarks;
      toast.info(`Late submission: Automatic deduction penalty of ${targetAsg.latePenalty}% (${deduction} marks) has been suggested.`);
    }

    const updatedSubs = submissions.map(s => {
      if (s.id === activeReviewSubmission.id) {
        return {
          ...s,
          marks: finalMarks,
          feedback: reviewForm.feedback.trim() || undefined,
          privateNotes: reviewForm.privateNotes.trim() || undefined,
          status: (isDraft ? "Review Pending" : "Graded") as any,
          gradedAt: isDraft ? undefined : new Date().toISOString()
        };
      }
      return s;
    });

    setSubmissions(updatedSubs);
    localStorage.setItem("eduearn_submissions", JSON.stringify(updatedSubs));

    // Handle student notifications when grade is published
    if (!isDraft && targetAsg) {
      const logId = `notif-${targetAsg.id}-graded-${activeReviewSubmission.studentId}-${Date.now()}`;
      const newLog: NotificationLog = {
        id: logId,
        assignmentId: targetAsg.id,
        assignmentTitle: targetAsg.title,
        studentName: activeReviewSubmission.studentName,
        type: "Marks Published",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString()
      };
      setNotifications(prev => [newLog, ...prev]);
    }

    // Parent callback sync
    if (!isDraft) {
      // Find matching student index inside parent structure
      const parentStudent = parentStudents.find(s => s.name === activeReviewSubmission.studentName);
      if (parentStudent) {
        // Sync parent store form state first
        setGradingForm({
          grade: finalMarks >= 90 ? "A+" : finalMarks >= 80 ? "A" : finalMarks >= 70 ? "B" : "C",
          feedback: reviewForm.feedback,
          score: `${finalMarks}/${targetAsg?.maxMarks || 100}`
        });
        handleSubmitGrade(parentStudent.id);
      }
    }

    setActiveReviewSubmission(null);
    toast.success(isDraft ? "Review grade saved as draft." : "Grade marks published to student dashboard!");
  };

  // ─── COUNTDOWN TIMER RENDER ───────────────────────────────────────────────
  const renderCountdown = (dueDateStr: string, isClosed: boolean) => {
    if (isClosed) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-rose-500/20 bg-rose-500/10 text-rose-500">
          Assignment Closed
        </span>
      );
    }
    const dueTime = new Date(dueDateStr).getTime();
    const diff = dueTime - Date.now();
    if (diff < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-500">
          Deadline Passed
        </span>
      );
    }

    const diffDays = Math.floor(diff / 86400000);
    const diffHours = Math.floor((diff % 86400000) / 3600000);
    
    if (diffDays > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-500">
          <Clock size={10} /> {diffDays} {diffDays === 1 ? "Day" : "Days"} Left
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-rose-450 bg-rose-500/5 text-rose-450 animate-pulse">
        <Clock size={10} /> {diffHours} {diffHours === 1 ? "Hour" : "Hours"} Left
      </span>
    );
  };

  // ─── ASSIGNMENT SUBMISSION PROGRESS BAR COLOR ──────────────────────────────
  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500";
    if (rate >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getProgressBg = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (rate >= 40) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle: Grid List vs Detail View */}
      {viewMode === "list" ? (
        <>
          {/* Title Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-extrabold text-foreground">Assignment Manager</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor, grade, and structure all course assignments and assessments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsCreatingAsg(true)}
                size="sm"
                className="h-9 gap-1.5 shadow-soft bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer"
              >
                <Plus size={14} /> Create Assignment
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Assignments", count: stats.total, color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
              { label: "Active Assignments", count: stats.active, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
              { label: "Closed", count: stats.closed, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
              { label: "Due Today", count: stats.dueToday, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
              { label: "Pending Reviews", count: stats.pendingReviews, color: "text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse" },
              { label: "Avg Submission Rate", count: `${stats.subRate}%`, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
            ].map((item, idx) => (
              <Card key={idx} variant="glass" className={`p-3 text-center border font-bold ${item.color}`}>
                <p className="text-xl font-heading font-extrabold">{item.count}</p>
                <p className="text-[9px] font-extrabold uppercase mt-1 tracking-wider">{item.label}</p>
              </Card>
            ))}
          </div>

          {/* Tabs toggle */}
          <div className="flex border-b border-border/40 pb-2 gap-4 text-xs font-bold text-muted-foreground">
            {[
              { key: "assignments", label: "Assignments Grid" },
              { key: "submissions", label: "Submissions Inbox" },
              { key: "analytics", label: "Analytics Insights" },
              { key: "notifications", label: "Notification Logs" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setStatusFilter("All"); }}
                className={`pb-2 border-b-2 transition-all cursor-pointer ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent hover:text-foreground"}`}
              >
                {tab.label} {tab.key === "submissions" && `(${stats.pendingReviews})`}
              </button>
            ))}
          </div>

          {/* Search and Filters card */}
          {activeTab !== "analytics" && activeTab !== "notifications" && (
            <Card variant="glass" className="p-3 flex flex-wrap items-center gap-3">
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
                className="h-9 rounded-button border border-border bg-card px-2 text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="All">All Courses</option>
                {courseOptions.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="h-9 rounded-button border border-border bg-card px-2 text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="All">All Batches</option>
                {batchOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-button border border-border bg-card px-2 text-xs font-semibold text-foreground focus:outline-none"
              >
                {activeTab === "assignments" ? (
                  <>
                    <option value="All">All Statuses</option>
                    <option value="published">Active</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </>
                ) : (
                  <>
                    <option value="All">All Submissions</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Late Submission">Late Submission</option>
                    <option value="Review Pending">Review Pending</option>
                    <option value="Graded">Graded</option>
                  </>
                )}
              </select>

              {activeTab === "assignments" && (
                <>
                  <select
                    value={deadlineFilter}
                    onChange={(e) => setDeadlineFilter(e.target.value)}
                    className="h-9 rounded-button border border-border bg-card px-2 text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="All">All Deadlines</option>
                    <option value="today">Due Today</option>
                    <option value="week">Due This Week</option>
                    <option value="overdue">Overdue</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-9 rounded-button border border-border bg-card px-2 text-xs font-semibold text-foreground focus:outline-none ml-auto"
                  >
                    <option value="newest">Sort by Newest</option>
                    <option value="oldest">Sort by Oldest</option>
                    <option value="deadline">Sort by Deadline</option>
                    <option value="subrate">Highest Submit Rate</option>
                  </select>
                </>
              )}
            </Card>
          )}

          {/* Bulk Actions Floating Bar */}
          {activeTab === "assignments" && selectedAsgIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 p-3 rounded-card flex items-center justify-between text-xs font-bold text-primary"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{selectedAsgIds.size} assignment(s) selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkDuplicate} className="h-8 text-[10px] gap-1 text-primary border-primary/30">
                  <Copy size={12} /> Duplicate
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkClose} className="h-8 text-[10px] gap-1 text-primary border-primary/30">
                  <X size={12} /> Close
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkExport} className="h-8 text-[10px] gap-1 text-primary border-primary/30">
                  <Download size={12} /> Export CSV
                </Button>
                <Button size="sm" className="h-8 text-[10px] gap-1 bg-rose-600 hover:bg-rose-500 text-white" onClick={handleBulkDelete}>
                  <Trash2 size={12} /> Bulk Delete
                </Button>
              </div>
            </motion.div>
          )}

          {/* Tab Content Rendering */}
          {activeTab === "assignments" && (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden sm:block w-full overflow-x-auto border border-border bg-card rounded-card shadow-soft">
                <table className="w-full text-xs text-left min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                      <th className="p-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedAsgIds.size === filteredAssignments.length && filteredAssignments.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Assignment</th>
                      <th className="p-4">Course</th>
                      <th className="p-4">Batch</th>
                      <th className="p-4">Created On</th>
                      <th className="p-4">Deadline</th>
                      <th className="p-4 text-center">Max Marks</th>
                      <th className="p-4 text-center">Submission Status</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
                    {filteredAssignments.map((asg) => {
                      const asgStat = getAsgStats(asg.id);
                      return (
                        <tr key={asg.id} className="hover:bg-muted/15">
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedAsgIds.has(asg.id)}
                              onChange={() => toggleSelectAssignment(asg.id)}
                              className="rounded cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => { setSelectedAsgId(asg.id); setViewMode("details"); }}
                              className="font-bold text-foreground hover:underline text-left"
                            >
                              {asg.title}
                            </button>
                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">Difficulty: {asg.difficulty}</div>
                          </td>
                          <td className="p-4">{asg.courseTitle}</td>
                          <td className="p-4">{asg.batch}</td>
                          <td className="p-4">{new Date(asg.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="font-bold text-foreground">
                              {new Date(asg.dueDate).toLocaleDateString()} at {new Date(asg.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="mt-1">{renderCountdown(asg.dueDate, asg.status === "closed")}</div>
                          </td>
                          <td className="p-4 text-center text-foreground font-bold">{asg.maxMarks}</td>
                          <td className="p-4 text-center">
                            <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                              asg.status === "published" ? "bg-sky-500/10 border-sky-500/20 text-sky-500" :
                              asg.status === "closed" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                              "bg-slate-500/10 border-slate-500/20 text-slate-500"
                            }`}>
                              {asg.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1 w-28">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-foreground">{asgStat.submitted} / {asgStat.total}</span>
                                <span>{asgStat.rate}%</span>
                              </div>
                              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getProgressColor(asgStat.rate)}`}
                                  style={{ width: `${asgStat.rate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setSelectedAsgId(asg.id); setViewMode("details"); }}
                                className="h-7 w-7 p-0"
                                title="View details"
                              >
                                <Eye size={12} />
                              </Button>
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
                                onClick={() => handleDuplicateAssignment(asg)}
                                className="h-7 w-7 p-0"
                                title="Duplicate"
                              >
                                <Copy size={12} />
                              </Button>
                              {asg.status !== "closed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCloseAssignment(asg.id)}
                                  className="h-7 w-7 p-0 text-amber-500"
                                  title="Close Assignment"
                                >
                                  <X size={12} />
                                </Button>
                              )}
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
                      );
                    })}
                    {filteredAssignments.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center p-8 text-muted-foreground italic">No assignments found matching filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Grid View */}
              <div className="grid grid-cols-1 gap-4 sm:hidden">
                {filteredAssignments.map((asg) => {
                  const asgStat = getAsgStats(asg.id);
                  return (
                    <Card key={asg.id} className="p-4 border-border/50 shadow-soft space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAsgIds.has(asg.id)}
                            onChange={() => toggleSelectAssignment(asg.id)}
                            className="rounded cursor-pointer"
                          />
                          <div>
                            <button
                              onClick={() => { setSelectedAsgId(asg.id); setViewMode("details"); }}
                              className="text-xs font-bold text-foreground hover:underline text-left leading-snug"
                            >
                              {asg.title}
                            </button>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{asg.courseTitle} &bull; {asg.batch}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          asg.status === "published" ? "bg-sky-500/10 border-sky-500/20 text-sky-500" :
                          asg.status === "closed" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                          "bg-slate-500/10 border-slate-500/20 text-slate-500"
                        }`}>
                          {asg.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <p className="text-muted-foreground uppercase font-bold text-[8px]">Max Score</p>
                          <p className="text-foreground font-bold mt-0.5">{asg.maxMarks} Points</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground uppercase font-bold text-[8px]">Deadline</p>
                          <p className="text-foreground font-bold mt-0.5">{new Date(asg.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>Submission Progress</span>
                          <span className="text-foreground">{asgStat.submitted} / {asgStat.total} ({asgStat.rate}%)</span>
                        </div>
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getProgressColor(asgStat.rate)}`}
                            style={{ width: `${asgStat.rate}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                        <Button
                          size="sm"
                          onClick={() => { setSelectedAsgId(asg.id); setViewMode("details"); }}
                          className="h-8 text-[10px] flex-1 bg-primary text-white font-bold gap-1"
                        >
                          <Eye size={12} /> View Submissions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(asg)}
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAssignment(asg.id)}
                          className="h-8 w-8 p-0 text-rose-500"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                {filteredAssignments.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground italic text-xs">No assignments found matching filters.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-4">
              {/* Submissions Inbox view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submissions.filter(s => s.status !== "Not Submitted").map((student) => {
                  const targetAsg = assignments.find(a => a.id === student.assignmentId);
                  return (
                    <Card
                      key={student.id}
                      className="p-4 border-border/50 shadow-soft space-y-3 hover:border-primary/20 transition-all cursor-pointer flex flex-col justify-between"
                      onClick={() => handleOpenReview(student)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {student.studentName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{student.studentName}</h4>
                              <p className="text-[10px] text-muted-foreground">{student.studentEmail}</p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                            student.status === "Graded" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : 
                            student.status === "Late Submission" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                            "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          }`}>
                            {student.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-muted-foreground">Assignment</p>
                          <p className="text-xs font-bold text-foreground mt-0.5 truncate">{targetAsg?.title || "Unknown Assignment"}</p>
                        </div>
                        {student.submittedAt && (
                          <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> Submitted: {new Date(student.submittedAt).toLocaleString()}
                          </div>
                        )}
                        {student.fileUrl && (
                          <div className="text-[9px] bg-muted/40 p-2 border border-border/40 rounded flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText size={12} className="text-primary" />
                              <span className="text-foreground truncate">{student.fileUrl}</span>
                            </div>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">{student.fileType}</span>
                          </div>
                        )}
                        {student.status === "Graded" && (
                          <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded text-[10px]">
                            <span className="font-bold text-emerald-600">Marks Score:</span> {student.marks} / {targetAsg?.maxMarks || 100}
                          </div>
                        )}
                      </div>
                      <Button size="sm" className="w-full h-8 text-[10px] font-bold bg-primary text-white cursor-pointer mt-3">
                        {student.status === "Graded" ? "View Review Feedback" : "Review & Grade Submission"}
                      </Button>
                    </Card>
                  );
                })}
                {submissions.filter(s => s.status !== "Not Submitted").length === 0 && (
                  <div className="col-span-full">
                    <EmptyState
                      icon={<ClipboardList size={28} />}
                      title="No submissions uploaded"
                      description="Awaiting student uploads."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Submission rate chart */}
              <Card variant="glass" className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">Submission Rate Chart</h4>
                  <TrendingUp size={14} className="text-primary" />
                </div>
                <div className="space-y-4 h-64 flex flex-col justify-end">
                  {assignments.map(a => {
                    const asgStat = getAsgStats(a.id);
                    return (
                      <div key={a.id} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-foreground truncate w-48">{a.title}</span>
                          <span>{asgStat.rate}% ({asgStat.submitted} students)</span>
                        </div>
                        <div className="w-full bg-muted/40 h-3 rounded overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(asgStat.rate)}`}
                            style={{ width: `${asgStat.rate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {assignments.length === 0 && (
                    <p className="text-center italic text-xs text-muted-foreground my-auto">Create assignments to view submission statistics.</p>
                  )}
                </div>
              </Card>

              {/* General Performance Stats */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card variant="glass" className="p-4 text-center border border-border/60">
                    <p className="text-3xl font-heading font-extrabold text-emerald-500">
                      {submissions.filter(s => s.status === "Graded" && s.marks !== undefined).length > 0
                        ? `${Math.round(submissions.filter(s => s.status === "Graded" && s.marks !== undefined).reduce((acc, curr) => acc + (curr.marks ?? 0), 0) / submissions.filter(s => s.status === "Graded").length * 10) / 10}`
                        : "0"
                      }
                    </p>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1">Average Graded Marks</p>
                  </Card>
                  <Card variant="glass" className="p-4 text-center border border-border/60">
                    <p className="text-3xl font-heading font-extrabold text-rose-500">
                      {submissions.filter(s => s.status !== "Not Submitted").length > 0
                        ? `${Math.round((submissions.filter(s => s.status === "Late Submission" || s.isLate).length / submissions.filter(s => s.status !== "Not Submitted").length) * 100)}%`
                        : "0%"
                      }
                    </p>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1">Late Submissions Ratio</p>
                  </Card>
                </div>

                {/* Top/Lowest Performers */}
                <Card variant="glass" className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">Top Performing Students</h4>
                    <Award size={14} className="text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    {fallbackStudents.slice(0, 3).map((std, idx) => (
                      <div key={std.id} className="flex items-center justify-between p-2 bg-muted/20 border border-border/30 rounded text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground w-4">#{idx+1}</span>
                          <span className="font-bold text-foreground">{std.name}</span>
                        </div>
                        <span className="font-bold text-emerald-600">A+ Grade &bull; 95% Avg</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <Card variant="glass" className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">Notification Dispatch Logs</h4>
                <BellRing size={14} className="text-primary" />
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto font-semibold">
                {notifications.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 bg-muted/25 border border-border/40 rounded-card text-xs">
                    <div className="space-y-1">
                      <p className="text-foreground">
                        <span className="font-bold text-primary">{log.type}</span> notification dispatched for <span className="font-bold">{log.assignmentTitle}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">Recipient: {log.studentName}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2">{log.timestamp}</span>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center italic text-xs text-muted-foreground py-8">No notifications triggered yet.</p>
                )}
              </div>
            </Card>
          )}
        </>
      ) : (
        /* ASSIGNMENT DETAILS PAGE VIEW */
        (() => {
          const selectedAsg = assignments.find(a => a.id === selectedAsgId);
          if (!selectedAsg) return null;
          const asgStat = getAsgStats(selectedAsg.id);
          const activeSubs = submissions.filter(s => s.assignmentId === selectedAsg.id);

          return (
            <div className="space-y-6">
              {/* Details Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
                <button
                  onClick={() => { setViewMode("list"); setSelectedAsgId(null); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ChevronLeft size={14} /> Back to Assignments
                </button>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleStartEdit(selectedAsg)} className="h-8 text-xs">
                    <Edit2 size={12} className="mr-1.5" /> Edit Details
                  </Button>
                  {selectedAsg.status !== "closed" && (
                    <Button size="sm" variant="outline" onClick={() => handleCloseAssignment(selectedAsg.id)} className="h-8 text-xs text-amber-500">
                      <X size={12} className="mr-1.5" /> Close Assignment
                    </Button>
                  )}
                  <Button size="sm" className="h-8 text-xs bg-rose-600 hover:bg-rose-500 text-white" onClick={() => handleDeleteAssignment(selectedAsg.id)}>
                    <Trash2 size={12} className="mr-1.5" /> Delete
                  </Button>
                </div>
              </div>

              {/* Details Grid Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Progress Tracking */}
                <Card variant="glass" className="p-5 flex flex-col items-center justify-center text-center space-y-4">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground self-start border-b border-border/30 pb-2 w-full text-left">
                    Student Submission Rate
                  </h4>
                  
                  {/* Circular progress chart mockup */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="var(--color-primary)"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * asgStat.rate) / 100}
                        className="transition-all duration-700 ease-out"
                        style={{ stroke: "var(--color-primary, #2563eb)" }}
                      />
                    </svg>
                    <div className="absolute text-center space-y-0.5">
                      <p className="text-xl font-heading font-extrabold text-foreground">{asgStat.rate}%</p>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground">Submission Rate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full text-left pt-3 border-t border-border/40 font-semibold text-[10px]">
                    <div className="space-y-1">
                      <p className="text-muted-foreground uppercase text-[8px]">Enrolled Students</p>
                      <p className="text-foreground font-bold">{asgStat.total} Students</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground uppercase text-[8px]">Submitted</p>
                      <p className="text-emerald-500 font-bold">{asgStat.submitted} Students</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground uppercase text-[8px]">Review Pending</p>
                      <p className="text-amber-500 font-bold">{asgStat.pending} Students</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground uppercase text-[8px]">Late Submissions</p>
                      <p className="text-rose-500 font-bold">{asgStat.late} Students</p>
                    </div>
                  </div>
                </Card>

                {/* Right: Overview Details */}
                <Card variant="glass" className="p-5 lg:col-span-2 space-y-4 font-semibold text-xs">
                  <div className="flex items-start justify-between border-b border-border/40 pb-3">
                    <div>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border mr-2 ${getProgressBg(asgStat.rate)}`}>
                        {selectedAsg.difficulty}
                      </span>
                      <h3 className="text-sm font-heading font-extrabold text-foreground mt-1.5 inline-block">{selectedAsg.title}</h3>
                    </div>
                    {renderCountdown(selectedAsg.dueDate, selectedAsg.status === "closed")}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/10 p-3 rounded-card border border-border/40">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Course</p>
                      <p className="text-foreground font-bold mt-0.5 truncate">{selectedAsg.courseTitle}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Batch Target</p>
                      <p className="text-foreground font-bold mt-0.5">{selectedAsg.batch}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Max Marks</p>
                      <p className="text-foreground font-bold mt-0.5">{selectedAsg.maxMarks} Points</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Avg Score</p>
                      <p className="text-foreground font-bold mt-0.5">{asgStat.avgMarks} / {selectedAsg.maxMarks}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Instructions & Objectives</p>
                    <p className="text-muted-foreground leading-relaxed bg-card p-3 border border-border/45 rounded-card whitespace-pre-line font-medium">
                      {selectedAsg.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Allowed File Submissions</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedAsg.submissionTypes.map((type) => (
                          <span key={type} className="text-[8px] font-extrabold uppercase px-2 py-0.5 bg-muted rounded border border-border">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedAsg.attachmentName && (
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">File Attachment</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-primary font-bold hover:underline cursor-pointer">
                          <Paperclip size={11} />
                          <span>{selectedAsg.attachmentName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Student Submissions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="text-sm font-heading font-extrabold text-foreground">Student Submissions Log</h3>
                  <span className="text-xs text-muted-foreground font-bold">{activeSubs.filter(s => s.status !== "Not Submitted").length} total submissions uploaded</span>
                </div>

                {/* Submissions Table */}
                <div className="hidden sm:block w-full overflow-x-auto border border-border bg-card rounded-card shadow-soft">
                  <table className="w-full text-xs text-left min-w-[800px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/20 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                        <th className="p-4">Student</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Submission Date</th>
                        <th className="p-4">File Uploaded</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Score Marks</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
                      {activeSubs.map((sub) => (
                        <tr key={sub.id} className="hover:bg-muted/15">
                          <td className="p-4 text-foreground font-bold">{sub.studentName}</td>
                          <td className="p-4">{sub.studentEmail}</td>
                          <td className="p-4">
                            {sub.submittedAt ? (
                              <div className="space-y-0.5">
                                <p className="text-foreground">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/60 italic font-medium">Awaiting upload</span>
                            )}
                          </td>
                          <td className="p-4">
                            {sub.fileUrl ? (
                              <div className="flex items-center gap-1.5 text-primary">
                                <FileText size={12} />
                                <span className="truncate max-w-[150px] font-bold hover:underline cursor-pointer" title={sub.fileUrl}>
                                  {sub.fileUrl}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/60 italic font-medium">&mdash;</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                              sub.status === "Graded" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                              sub.status === "Late Submission" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                              sub.status === "Not Submitted" ? "bg-slate-500/10 border-slate-500/20 text-slate-500" :
                              "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-4 text-center text-foreground font-bold">
                            {sub.marks !== undefined ? `${sub.marks} / ${selectedAsg.maxMarks}` : <span className="text-muted-foreground/60 font-medium">&mdash;</span>}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {sub.status !== "Not Submitted" ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenReview(sub)}
                                  className="h-7 text-[10px] font-bold bg-primary text-white gap-1 cursor-pointer"
                                >
                                  <FileCheck size={11} /> {sub.status === "Graded" ? "Review" : "Grade"}
                                </Button>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic font-medium">No actions</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view submissions */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                  {activeSubs.map((sub) => (
                    <Card key={sub.id} className="p-4 border-border/50 shadow-soft space-y-3 font-semibold text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{sub.studentName}</h4>
                          <p className="text-[10px] text-muted-foreground">{sub.studentEmail}</p>
                        </div>
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          sub.status === "Graded" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                          sub.status === "Late Submission" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                          sub.status === "Not Submitted" ? "bg-slate-500/10 border-slate-500/20 text-slate-500" :
                          "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        }`}>
                          {sub.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <p className="text-muted-foreground uppercase font-bold text-[8px]">Submission Time</p>
                          <p className="text-foreground font-bold mt-0.5">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "Awaiting"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground uppercase font-bold text-[8px]">Marks Score</p>
                          <p className="text-foreground font-bold mt-0.5">{sub.marks !== undefined ? `${sub.marks} / ${selectedAsg.maxMarks}` : "Awaiting"}</p>
                        </div>
                      </div>

                      {sub.fileUrl && (
                        <div className="text-[10px] bg-muted/40 p-2 border border-border/40 rounded flex items-center gap-1.5 text-primary font-bold">
                          <FileText size={11} />
                          <span className="truncate">{sub.fileUrl}</span>
                        </div>
                      )}

                      {sub.status !== "Not Submitted" && (
                        <Button
                          onClick={() => handleOpenReview(sub)}
                          className="w-full h-8 text-[10px] font-bold bg-primary text-white gap-1"
                        >
                          <FileCheck size={11} /> {sub.status === "Graded" ? "View Grade & Review" : "Review & Grade Submission"}
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* CREATE / EDIT ASSIGNMENT DIALOG MODAL */}
      <AnimatePresence>
        {(isCreatingAsg || editingAsg) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => { setIsCreatingAsg(false); setEditingAsg(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[92%] max-w-lg bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto"
            >
              <form onSubmit={isCreatingAsg ? handleCreateAssignment : handleSaveEdit} className="space-y-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h4 className="text-sm font-heading font-extrabold uppercase text-foreground">
                    {isCreatingAsg ? "Create Course Assignment" : "Edit Assignment Detail"}
                  </h4>
                  <button type="button" onClick={() => { setIsCreatingAsg(false); setEditingAsg(null); }} className="text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={asgForm.title}
                    onChange={(e) => setAsgForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Unit 3 Homework Assignment"
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Target Course *</label>
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
                    <label className="font-bold text-foreground">Batch Name *</label>
                    <select
                      required
                      value={asgForm.batch}
                      onChange={(e) => setAsgForm((f) => ({ ...f, batch: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      {batchOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Max Marks score *</label>
                    <input
                      type="number"
                      required
                      value={asgForm.maxMarks}
                      onChange={(e) => setAsgForm((f) => ({ ...f, maxMarks: e.target.value }))}
                      placeholder="100"
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Difficulty Level</label>
                    <select
                      value={asgForm.difficulty}
                      onChange={(e) => setAsgForm((f) => ({ ...f, difficulty: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Instructions & Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={asgForm.description}
                    onChange={(e) => setAsgForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Provide description outline instructions here..."
                    className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                  />
                </div>

                {/* Checklist allowed file types */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Allowed Submission Formats *</label>
                  <div className="flex flex-wrap gap-4 p-3 bg-muted/15 border border-border/40 rounded-card">
                    {["PDF", "DOC", "DOCX", "PPT", "ZIP", "Image", "Video"].map((ext) => (
                      <label key={ext} className="flex items-center gap-1.5 text-xs text-foreground font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={asgForm.submissionTypes.includes(ext)}
                          onChange={() => {
                            setAsgForm(prev => {
                              const exists = prev.submissionTypes.includes(ext);
                              const list = exists
                                ? prev.submissionTypes.filter(e => e !== ext)
                                : [...prev.submissionTypes, ext];
                              return { ...prev, submissionTypes: list };
                            });
                          }}
                          className="rounded"
                        />
                        <span>{ext}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Deadline Date *</label>
                    <input
                      type="date"
                      required
                      value={asgForm.dueDate}
                      onChange={(e) => setAsgForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Deadline Time *</label>
                    <input
                      type="time"
                      required
                      value={asgForm.dueTime}
                      onChange={(e) => setAsgForm((f) => ({ ...f, dueTime: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Late Submission */}
                <div className="p-3 bg-muted/10 border border-border/40 rounded-card flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-xs leading-none">Allow Late Submission</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Allow uploads after deadline date with penalties</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAsgForm(prev => ({ ...prev, allowLate: !prev.allowLate }))}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-250 cursor-pointer ${
                        asgForm.allowLate ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-250 ${
                        asgForm.allowLate ? "translate-x-4.5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  {asgForm.allowLate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1"
                    >
                      <label className="font-bold text-foreground text-[10px]">Late Score Penalty (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={asgForm.latePenalty}
                        onChange={(e) => setAsgForm((f) => ({ ...f, latePenalty: e.target.value }))}
                        placeholder="10"
                        className="h-8 w-24 rounded border border-border bg-card px-2 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Attachment File Upload (Optional)</label>
                    <input
                      type="text"
                      value={asgForm.attachmentName}
                      onChange={(e) => setAsgForm((f) => ({ ...f, attachmentName: e.target.value }))}
                      placeholder="e.g. cheatsheet.pdf"
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Save State</label>
                    <select
                      value={asgForm.status}
                      onChange={(e) => setAsgForm(f => ({ ...f, status: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="published">Publish Assignment</option>
                      <option value="draft">Save Draft</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsCreatingAsg(false); setEditingAsg(null); }}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary hover:bg-primary/95 text-white gap-1.5 cursor-pointer"
                  >
                    <Send size={13} /> {isCreatingAsg ? "Confirm & Deploy" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SUBMISSION REVIEW & GRADING DRAWER */}
      <AnimatePresence>
        {activeReviewSubmission && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
              onClick={() => setActiveReviewSubmission(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-sm font-heading font-extrabold uppercase text-foreground">
                    Assessment Evaluation
                  </h3>
                  <button onClick={() => setActiveReviewSubmission(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-muted-foreground">
                  {/* Student Profile Card */}
                  <div className="p-3.5 bg-muted/20 border border-border/40 rounded-card space-y-1 text-left">
                    <p className="text-[8px] font-extrabold uppercase text-muted-foreground">Student profile</p>
                    <p className="text-foreground font-bold text-xs leading-none">{activeReviewSubmission.studentName}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">{activeReviewSubmission.studentEmail}</p>
                  </div>

                  {/* Submission Info */}
                  <div className="p-3.5 bg-muted/20 border border-border/40 rounded-card space-y-3">
                    <div>
                      <p className="text-[8px] font-extrabold uppercase text-muted-foreground">Submission details</p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-foreground">Upload Timestamp</span>
                        <span className="text-muted-foreground">
                          {activeReviewSubmission.submittedAt ? new Date(activeReviewSubmission.submittedAt).toLocaleString() : "N/A"}
                        </span>
                      </div>
                      {activeReviewSubmission.isLate && (
                        <div className="flex items-center gap-1.5 mt-1 text-rose-500 font-extrabold text-[9px] uppercase bg-rose-500/5 p-1 rounded border border-rose-500/10">
                          <AlertCircle size={10} />
                          <span>Late Submission Penalties Active</span>
                        </div>
                      )}
                    </div>

                    {/* File Attachment details */}
                    {activeReviewSubmission.fileUrl && (
                      <div className="space-y-2">
                        <p className="text-[8px] font-extrabold uppercase text-muted-foreground">Attached Homework File</p>
                        
                        {/* Custom visual file preview */}
                        <div className="bg-card border border-border/40 rounded-card p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-primary shrink-0" />
                              <div className="truncate max-w-[200px]">
                                <p className="text-foreground font-bold text-[11px] truncate leading-none">{activeReviewSubmission.fileUrl}</p>
                                <p className="text-[9px] text-muted-foreground font-medium mt-1">Format: {activeReviewSubmission.fileType}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info(`Downloading Submission File: ${activeReviewSubmission.fileUrl}`)}
                              className="h-7 px-2 text-primary gap-1"
                            >
                              <Download size={12} /> Download
                            </Button>
                          </div>
                          
                          {/* Simulated document visual preview box */}
                          <div className="border border-border/40 rounded bg-muted/15 h-36 flex flex-col items-center justify-center text-center p-3 text-[10px] space-y-2 font-medium">
                            <FileCheck size={28} className="text-primary/75 animate-bounce" />
                            <div>
                              <p className="text-foreground font-bold">Interactive Sandbox PDF Previewer</p>
                              <p className="text-muted-foreground mt-0.5">Static digital signatures and metadata are verified.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grading Forms input */}
                  <div className="space-y-3.5 border-t border-border/40 pt-4">
                    <h4 className="text-[10px] font-extrabold uppercase text-primary tracking-wider">Scoring and Grading Metrics</h4>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="font-bold text-foreground">Score Marks *</label>
                        <span className="text-[10px] text-muted-foreground">
                          Max: {assignments.find(a => a.id === activeReviewSubmission.assignmentId)?.maxMarks || 100}
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 90"
                        value={reviewForm.marks}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, marks: e.target.value }))}
                        className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Constructive Feedback *</label>
                      <textarea
                        rows={4}
                        value={reviewForm.feedback}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                        placeholder="Provide details and improvement criteria..."
                        className="w-full bg-card border border-border rounded-card p-2.5 focus:outline-none text-xs font-semibold text-foreground resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Private Notes (Only visible to you)</label>
                      <textarea
                        rows={2}
                        value={reviewForm.privateNotes}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, privateNotes: e.target.value }))}
                        placeholder="e.g. Student needs extra mentorship during live session..."
                        className="w-full bg-card border border-border rounded-card p-2.5 focus:outline-none text-xs font-semibold text-foreground resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 border-t border-border/40 bg-muted/15 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-9 font-bold text-xs"
                  onClick={() => handleSaveReviewGrade(true)}
                >
                  <Save size={13} className="mr-1.5" /> Save Draft
                </Button>
                <Button
                  className="flex-1 h-9 bg-primary hover:bg-primary/95 text-white font-bold text-xs gap-1.5 shadow-soft cursor-pointer"
                  onClick={() => handleSaveReviewGrade(false)}
                >
                  <CheckCircle size={13} /> Publish Grade
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});
export default Assignments;
