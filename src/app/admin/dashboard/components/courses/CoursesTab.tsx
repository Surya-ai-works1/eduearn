"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit2, Check, X, Star, BookOpen, AlertCircle, Copy, Search, CheckCircle, 
  FileText, Video, Award, Brain, ExternalLink, Eye, RefreshCw, ChevronLeft, ChevronRight,
  BookOpenCheck, Calendar, GraduationCap, Users, ShieldAlert, Award as CertIcon, Clock
} from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";
import { useAuth } from "../../../../../hooks/useAuth";

import { createClient } from "@/lib/supabase";

// Academic Store Imports
import { 
  Course, Student, TutorMetrics, GradeRecord, AttendanceRecord, Exam, Question, ResourceItem, StudentRiskSummary,
  recalculateRisk
} from "./AcademicOperationsStore";

// Reusable Tabs
import CourseLifecycleTab from "./CourseLifecycleTab";
import GradebookTab from "./GradebookTab";
import AttendanceTab from "./AttendanceTab";
import ExamCenterTab from "./ExamCenterTab";
import StudentSuccessTab from "./StudentSuccessTab";
import TutorPerformanceTab from "./TutorPerformanceTab";

interface AdminCourse {
  id: string;
  title: string;
  tutorName: string;
  category: string;
  price: number;
  tutorEarnings: number;
  platformEarnings: number;
  status: "Pending" | "Approved" | "Rejected" | "Draft" | "Need Changes" | "Archived";
  featured: boolean;
  hidden: boolean;
  assignedSkill: string;
  isDynamic?: boolean;
}

interface CoursesTabProps {
  courses: AdminCourse[];
  setCourses: React.Dispatch<React.SetStateAction<AdminCourse[]>>;
  logAuditAction: (actionStr: string) => void;
  isLoading?: boolean;
}

export default function CoursesTab({
  courses: legacyCourses,
  setCourses: setLegacyCourses,
  logAuditAction,
  isLoading = false
}: CoursesTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>("lifecycle");
  const { user } = useAuth();

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Coding");
  const [formTutorId, setFormTutorId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStatus, setFormStatus] = useState("Draft");
  const [formDescription, setFormDescription] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formLevel, setFormLevel] = useState("Beginner");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formOrganization, setFormOrganization] = useState("");

  // Editing & History Drawer states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [drawerHistory, setDrawerHistory] = useState<Course | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"all" | "today" | "7days" | "30days">("all");

  // Core Shared Academic Store States
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<TutorMetrics[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [risks, setRisks] = useState<StudentRiskSummary[]>([]);

  // Sliding Contextual Drawers
  const [drawerTutor, setDrawerTutor] = useState<TutorMetrics | null>(null);
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
  const [drawerCourse, setDrawerCourse] = useState<Course | null>(null);

  // Load datasets directly from Supabase DB on mount
  useEffect(() => {
    let isMounted = true;

    async function loadAcademicData() {
      try {
        const supabase = createClient();
        if (!supabase) return;

        // 1. Courses from DB
        const { data: dbCourses } = await supabase.from("courses").select("*, profiles:tutor_id(full_name)");
        if (dbCourses && isMounted) {
          const mappedCourses: Course[] = dbCourses.map((c: any) => ({
            id: c.id,
            code: c.slug || `CRS-${c.id.slice(0, 6).toUpperCase()}`,
            title: c.title,
            category: c.category || "General",
            tutorId: c.tutor_id || "",
            tutorName: (c.profiles as any)?.full_name || "Tutor",
            price: c.price || 0,
            status: c.status === "published" || c.status === "Approved" ? "Published" : c.status === "draft" ? "Draft" : c.status === "archived" ? "Archived" : "Under Review",
            healthScore: 90,
            version: "v1.0.0",
            dependencies: [],
            completionRate: 0,
            revenue: 0,
            revisionTimeline: [
              { date: c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0], actor: "System", change: "DB Loaded" }
            ]
          }));
          setCourses(mappedCourses);
        }

        // 2. Enrollments / Students from DB
        const { data: dbEnrollments } = await supabase.from("enrollments").select("*, profiles:learner_id(full_name, email)");
        if (dbEnrollments && isMounted) {
          const mappedStudents: Student[] = dbEnrollments.map((e: any) => ({
            id: e.learner_id,
            name: (e.profiles as any)?.full_name || "Student Learner",
            email: (e.profiles as any)?.email || "",
            courseId: e.course_id,
            batch: "Batch A",
            mentorName: "Tutor",
            progress: e.progress || 0,
            certificateIssued: Boolean(e.certificate_url)
          }));
          setStudents(mappedStudents);
        }

        // 3. Tutors from DB
        const { data: dbTutors } = await supabase.from("profiles").select("*").eq("role", "tutor");
        if (dbTutors && isMounted) {
          const mappedTutors: TutorMetrics[] = dbTutors.map((t: any) => ({
            tutorId: t.id,
            tutorName: t.full_name || t.display_name || "Tutor",
            teachingHours: 0,
            courseCount: 0,
            avgRating: 5.0,
            attendanceRate: 100,
            avgReviewTime: 12,
            responseTime: 4,
            revenue: 0,
            liveClassesCount: 0,
            satisfactionRate: 100,
            lateReviewsCount: 0,
            needsImprovement: false,
            topPerformer: true
          }));
          setTutors(mappedTutors);
        }

        // 4. Attendance from DB
        const { data: dbAttendance } = await supabase.from("attendance").select("*");
        if (dbAttendance && isMounted) {
          const mappedAttendance: AttendanceRecord[] = dbAttendance.map((a: any) => ({
            studentId: a.student_id,
            courseId: a.course_id,
            date: a.date,
            status: a.status as any,
            type: "Daily"
          }));
          setAttendance(mappedAttendance);
        }

        // 5. Quizzes / Exams from DB
        const { data: dbQuizzes } = await supabase.from("quizzes").select("*");
        if (dbQuizzes && isMounted) {
          const mappedExams: Exam[] = dbQuizzes.map((q: any) => ({
            id: q.id,
            courseId: q.course_id,
            title: q.title,
            category: "Quiz",
            topic: q.title,
            difficulty: "Medium",
            maxMarks: 100,
            negativeMarking: false,
            durationMinutes: 45,
            attemptLimit: 1,
            examWindowStart: q.created_at ? new Date(q.created_at).toISOString().split("T")[0] : "",
            examWindowEnd: "",
            published: true
          }));
          setExams(mappedExams);
        }
      } catch (err) {
        console.warn("Failed to load academic data from Supabase DB:", err);
      }
    }

    loadAcademicData();
    return () => { isMounted = false; };
  }, []);

  // Save changes to localStorage + propagate course updates to legacy parent states
  useEffect(() => {
    if (typeof window === "undefined" || courses.length === 0) return;
    localStorage.setItem("eduearn_academic_courses", JSON.stringify(courses));

    // Backward compatibility sync: update page.tsx parent course array
    const mapped: AdminCourse[] = courses.map(c => ({
      id: c.id,
      title: c.title,
      tutorName: c.tutorName,
      category: c.category,
      price: c.price,
      tutorEarnings: Math.round(c.price * 0.8),
      platformEarnings: Math.round(c.price * 0.2),
      status: (c.status === "Published" ? "Approved" : c.status === "Draft" ? "Draft" : c.status === "Archived" ? "Archived" : "Pending") as any,
      featured: c.healthScore > 90,
      hidden: c.status === "Draft" || c.status === "Archived",
      assignedSkill: c.category
    }));
    setLegacyCourses(mapped);
  }, [courses, setLegacyCourses]);

  const saveState = (key: string, val: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  useEffect(() => {
    if (students.length > 0) saveState("eduearn_academic_students", students);
  }, [students]);

  useEffect(() => {
    if (tutors.length > 0) saveState("eduearn_academic_tutors", tutors);
  }, [tutors]);

  useEffect(() => {
    if (grades.length > 0) {
      saveState("eduearn_academic_grades", grades);
      // Auto triggers: Recalculate Student Success Risks
      setRisks(prev => {
        const updated = prev.map(r => {
          const fresh = recalculateRisk(r.studentId, r.courseId, grades, attendance);
          return { ...r, ...fresh };
        });
        saveState("eduearn_academic_risks", updated);
        return updated;
      });
    }
  }, [grades, attendance]);

  useEffect(() => {
    if (attendance.length > 0) saveState("eduearn_academic_attendance", attendance);
  }, [attendance]);

  useEffect(() => {
    if (exams.length > 0) saveState("eduearn_academic_exams", exams);
  }, [exams]);

  useEffect(() => {
    if (questions.length > 0) saveState("eduearn_academic_questions", questions);
  }, [questions]);

  useEffect(() => {
    if (resources.length > 0) saveState("eduearn_academic_resources", resources);
  }, [resources]);

  useEffect(() => {
    if (risks.length > 0) saveState("eduearn_academic_risks", risks);
  }, [risks]);

  // Drawer Open Actions
  const handleOpenTutorDrawer = (id: string) => {
    const t = tutors.find(item => item.tutorId === id);
    if (t) setDrawerTutor(t);
  };

  const handleOpenStudentDrawer = (id: string) => {
    const s = students.find(item => item.id === id);
    if (s) setDrawerStudent(s);
  };

  const handleOpenCourseDrawer = (course: Course) => {
    setDrawerCourse(course);
  };

  // Form field comparison helper values
  const isTitleChanged = editingCourse ? formTitle !== editingCourse.title : false;
  const isCategoryChanged = editingCourse ? formCategory !== editingCourse.category : false;
  const isOrganizationChanged = editingCourse ? formOrganization !== (editingCourse.organization || "") : false;
  const isTutorChanged = editingCourse ? formTutorId !== (editingCourse.tutorId || "") : false;
  const isDescriptionChanged = editingCourse ? formDescription !== (editingCourse.description || "") : false;
  const isPriceChanged = editingCourse ? Number(formPrice) !== editingCourse.price : false;
  const isDurationChanged = editingCourse ? formDuration !== (editingCourse.duration || "") : false;
  const isLevelChanged = editingCourse ? formLevel !== (editingCourse.level || "Beginner") : false;
  const isThumbnailUrlChanged = editingCourse ? formThumbnailUrl !== (editingCourse.thumbnailUrl || "") : false;
  const isStatusChanged = editingCourse ? formStatus !== editingCourse.status : false;

  const hasAnyFieldChanged = 
    isTitleChanged || isCategoryChanged || isOrganizationChanged || isTutorChanged ||
    isDescriptionChanged || isPriceChanged || isDurationChanged || isLevelChanged ||
    isThumbnailUrlChanged || isStatusChanged;

  const incrementPatchVersion = (ver: string): string => {
    const cleanVer = ver.startsWith("v") ? ver.substring(1) : ver;
    const parts = cleanVer.split(".");
    if (parts.length === 3) {
      const patch = parseInt(parts[2], 10);
      if (!isNaN(patch)) {
        return `v${parts[0]}.${parts[1]}.${patch + 1}`;
      }
    }
    return ver + ".1"; // fallback
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddCourseModal(false);
        setDrawerHistory(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormCategory(course.category);
    setFormTutorId(course.tutorId || "");
    setFormPrice(course.price.toString());
    setFormStatus(course.status);
    setFormDescription(course.description || "");
    setFormDuration(course.duration || "");
    setFormLevel(course.level || "Beginner");
    setFormThumbnailUrl(course.thumbnailUrl || "");
    setFormOrganization(course.organization || "");
    setShowAddCourseModal(true);
  };

  const handleOpenHistoryDrawer = (course: Course) => {
    setDrawerHistory(course);
    setHistorySearch("");
    setHistoryFilter("all");
  };

  const getAuditHistoryLogs = (): any[] => {
    if (typeof window === "undefined") return [];
    try {
      const logsStr = localStorage.getItem("eduearn_course_audit");
      if (logsStr) {
        const allLogs = JSON.parse(logsStr);
        if (drawerHistory) {
          return allLogs.filter((log: any) => log.courseId === drawerHistory.id);
        }
      }
    } catch {}
    return [];
  };

  const getFilteredAuditLogs = (): any[] => {
    return getAuditHistoryLogs().filter((log: any) => {
      // 1. Search filter
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchSearch = 
          log.adminName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          (log.changedFields && log.changedFields.join(", ").toLowerCase().includes(q)) ||
          (log.previousValues && log.previousValues.toLowerCase().includes(q)) ||
          (log.newValues && log.newValues.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      // 2. Date filter
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - logDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (historyFilter === "today") {
        return logDate.toDateString() === now.toDateString();
      } else if (historyFilter === "7days") {
        return diffDays <= 7;
      } else if (historyFilter === "30days") {
        return diffDays <= 30;
      }
      return true;
    });
  };

  const handleExportHistory = (type: "json" | "csv") => {
    if (!drawerHistory) return;
    const logs = getAuditHistoryLogs();
    if (logs.length === 0) {
      toast.error("No history records available to export.");
      return;
    }

    let dataUri = "";
    let filename = "";

    if (type === "json") {
      const jsonContent = JSON.stringify(logs, null, 2);
      dataUri = `data:text/json;charset=utf-8,${encodeURIComponent(jsonContent)}`;
      filename = `course_${drawerHistory.code}_history.json`;
    } else {
      const headers = ["Audit ID", "Course ID", "Course Code", "Course Name", "Admin ID", "Admin Name", "Timestamp", "Action", "Changed Fields", "Previous Values", "New Values"];
      const csvRows = [headers.join(",")];
      logs.forEach(log => {
        const row = [
          log.id,
          log.courseId,
          log.courseCode,
          `"${log.courseName.replace(/"/g, '""')}"`,
          log.adminId,
          `"${log.adminName.replace(/"/g, '""')}"`,
          log.timestamp,
          log.action,
          `"${(log.changedFields || []).join("; ")}"`,
          `"${(log.previousValues || "").replace(/"/g, '""')}"`,
          `"${(log.newValues || "").replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
      });
      dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvRows.join("\n"))}`;
      filename = `course_${drawerHistory.code}_history.csv`;
    }

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", filename);
    linkElement.click();
    toast.success(`Exported history successfully as ${type.toUpperCase()}`);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Course Title is required.");
      return;
    }
    if (!formCategory.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (editingCourse) {
      // Transition Confirmations
      const statusTransition = `${editingCourse.status} -> ${formStatus}`;
      const targetTransitions = [
        "Draft -> Published",
        "Published -> Archived",
        "Archived -> Published"
      ];
      if (targetTransitions.includes(statusTransition)) {
        const confirmSave = confirm(`Are you sure you want to transition this course status from ${editingCourse.status} to ${formStatus}?`);
        if (!confirmSave) return;
      }

      const changedFields: string[] = [];
      const prevVals: Record<string, any> = {};
      const newVals: Record<string, any> = {};

      if (isTitleChanged) {
        changedFields.push("title");
        prevVals.title = editingCourse.title;
        newVals.title = formTitle.trim();
      }
      if (isCategoryChanged) {
        changedFields.push("category");
        prevVals.category = editingCourse.category;
        newVals.category = formCategory.trim();
      }
      if (isOrganizationChanged) {
        changedFields.push("organization");
        prevVals.organization = editingCourse.organization || "";
        newVals.organization = formOrganization.trim();
      }
      if (isTutorChanged) {
        changedFields.push("tutor");
        prevVals.tutor = editingCourse.tutorName;
        newVals.tutor = formTutorId ? (tutors.find(t => t.tutorId === formTutorId)?.tutorName || "Unknown Tutor") : "System Administrator";
      }
      if (isDescriptionChanged) {
        changedFields.push("description");
        prevVals.description = editingCourse.description || "";
        newVals.description = formDescription.trim();
      }
      if (isPriceChanged) {
        changedFields.push("price");
        prevVals.price = editingCourse.price;
        newVals.price = Number(formPrice) || 0;
      }
      if (isDurationChanged) {
        changedFields.push("duration");
        prevVals.duration = editingCourse.duration || "";
        newVals.duration = formDuration.trim();
      }
      if (isLevelChanged) {
        changedFields.push("level");
        prevVals.level = editingCourse.level || "Beginner";
        newVals.level = formLevel;
      }
      if (isThumbnailUrlChanged) {
        changedFields.push("thumbnailUrl");
        prevVals.thumbnailUrl = editingCourse.thumbnailUrl || "";
        newVals.thumbnailUrl = formThumbnailUrl.trim();
      }
      if (isStatusChanged) {
        changedFields.push("status");
        prevVals.status = editingCourse.status;
        newVals.status = formStatus;
      }

      if (changedFields.length === 0) {
        toast.warning("Nothing to update.");
        setShowAddCourseModal(false);
        return;
      }

      const nextVer = incrementPatchVersion(editingCourse.version);

      const updatedCourse: Course = {
        ...editingCourse,
        title: formTitle.trim(),
        category: formCategory.trim(),
        tutorId: formTutorId || "system",
        tutorName: formTutorId ? (tutors.find(t => t.tutorId === formTutorId)?.tutorName || "Unknown Tutor") : "System Administrator",
        price: Number(formPrice) || 0,
        status: formStatus as any,
        version: nextVer,
        updatedAt: new Date().toISOString(),
        description: formDescription.trim(),
        duration: formDuration.trim(),
        level: formLevel,
        thumbnailUrl: formThumbnailUrl.trim(),
        organization: formOrganization.trim(),
        revisionTimeline: [
          ...editingCourse.revisionTimeline,
          {
            date: new Date().toISOString().substring(0, 10),
            actor: user?.fullName || "Super Admin",
            change: `Edited fields: ${changedFields.join(", ")} (v${nextVer})`
          }
        ]
      } as any;

      // eslint-disable-next-line react-hooks/purity
      const auditId = `aud-${Date.now()}`;
      const newAuditLog = {
        id: auditId,
        courseId: editingCourse.id,
        courseCode: editingCourse.code,
        courseName: editingCourse.title,
        adminId: user?.id || "super-admin-id",
        adminName: user?.fullName || "Super Admin",
        timestamp: new Date().toISOString(),
        action: "Updated",
        changedFields,
        previousValues: JSON.stringify(prevVals),
        newValues: JSON.stringify(newVals)
      };

      const previousCoursesList = [...courses];
      const nextCoursesList = courses.map(c => c.id === editingCourse.id ? updatedCourse : c);

      // Optimistic updates
      setCourses(nextCoursesList);

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("eduearn_academic_courses", JSON.stringify(nextCoursesList));
          
          const existingLogsStr = localStorage.getItem("eduearn_course_audit");
          const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
          localStorage.setItem("eduearn_course_audit", JSON.stringify([newAuditLog, ...existingLogs]));
        }

        logAuditAction(`Updated course ${editingCourse.code}: changed ${changedFields.join(", ")}`);
        
        toast("Course updated successfully.", {
          duration: 10000,
          action: {
            label: "Undo",
            onClick: () => {
              setCourses(previousCoursesList);
              if (typeof window !== "undefined") {
                localStorage.setItem("eduearn_academic_courses", JSON.stringify(previousCoursesList));
                const logsStr = localStorage.getItem("eduearn_course_audit");
                if (logsStr) {
                  const logs = JSON.parse(logsStr).filter((l: any) => l.id !== auditId);
                  localStorage.setItem("eduearn_course_audit", JSON.stringify(logs));
                }
              }
              toast.success("Changes reverted successfully.");
            }
          }
        });
      } catch (err) {
        setCourses(previousCoursesList);
        toast.error("Failed to persist course changes. Reverting update.");
      }

      setShowAddCourseModal(false);
      setEditingCourse(null);

    } else {
      // eslint-disable-next-line react-hooks/purity
      const newId = `c-${Date.now()}`;
      const newCode = `CS-${Math.floor(100 + Math.random() * 900)}`;

      const newCourse: Course = {
        id: newId,
        code: newCode,
        title: formTitle.trim(),
        category: formCategory.trim(),
        tutorId: formTutorId || "system",
        tutorName: formTutorId ? (tutors.find(t => t.tutorId === formTutorId)?.tutorName || "Unknown Tutor") : "System Administrator",
        price: Number(formPrice) || 0,
        status: formStatus as any,
        healthScore: 100,
        version: "v1.0.0",
        dependencies: [],
        completionRate: 0,
        revenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        revisionTimeline: [
          {
            date: new Date().toISOString().substring(0, 10),
            actor: user?.fullName || "Super Admin",
            change: "Course manually created via admin portal."
          }
        ],
        description: formDescription.trim(),
        duration: formDuration.trim(),
        level: formLevel,
        thumbnailUrl: formThumbnailUrl.trim(),
        organization: formOrganization.trim()
      } as any;

      const previousCoursesList = [...courses];
      const updatedCourses = [newCourse, ...courses];
      setCourses(updatedCourses);
      
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("eduearn_academic_courses", JSON.stringify(updatedCourses));
        }
        logAuditAction(`Created new course program: ${formTitle} (${newCode})`);
        toast.success(`Course program ${newCode} added successfully!`);
      } catch (err) {
        setCourses(previousCoursesList);
        toast.error("Failed to persist new course.");
      }

      setFormTitle("");
      setFormCategory("Coding");
      setFormTutorId("");
      setFormPrice("");
      setFormStatus("Draft");
      setFormDescription("");
      setFormDuration("");
      setFormLevel("Beginner");
      setFormThumbnailUrl("");
      setFormOrganization("");
      
      setShowAddCourseModal(false);
    }
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Subtab Navigation Selector Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: "lifecycle", label: "Course Lifecycles", icon: BookOpenCheck },
            { id: "gradebook", label: "LMS Gradebook", icon: GraduationCap },
            { id: "attendance", label: "Attendance Center", icon: Calendar },
            { id: "exam-center", label: "Exam & Quiz Console", icon: Brain },
            { id: "success-center", label: "Student Success", icon: ShieldAlert },
            { id: "tutor-performance", label: "Tutor Performance", icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-[11px] font-extrabold uppercase tracking-wider transition-all border ${
                  isSel 
                    ? "bg-primary text-white border-primary shadow-soft" 
                    : "bg-card text-muted-foreground border-border hover:bg-muted/50"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <Button
          onClick={() => { setEditingCourse(null); setShowAddCourseModal(true); }}
          className="h-9 px-4 text-xs uppercase font-extrabold tracking-wider bg-primary text-white shadow-soft shrink-0 ml-auto"
        >
          <Plus size={14} className="mr-1.5" /> Add Course
        </Button>
      </div>

      {/* Render selected workspace components */}
      <div className="mt-4">
        {activeSubTab === "lifecycle" && (
          <CourseLifecycleTab
            courses={courses}
            setCourses={setCourses}
            students={students}
            onOpenTutor={handleOpenTutorDrawer}
            onOpenStudent={handleOpenStudentDrawer}
            onOpenCourseDetails={handleOpenCourseDrawer}
            logAuditAction={logAuditAction}
            onEditCourse={handleEditCourse}
            onOpenHistory={handleOpenHistoryDrawer}
          />
        )}

        {activeSubTab === "gradebook" && (
          <GradebookTab
            courses={courses}
            students={students}
            grades={grades}
            setGrades={setGrades}
            onOpenStudent={handleOpenStudentDrawer}
            onOpenCourse={handleOpenTutorDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "attendance" && (
          <AttendanceTab
            courses={courses}
            students={students}
            attendance={attendance}
            setAttendance={setAttendance}
            onOpenStudent={handleOpenStudentDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "exam-center" && (
          <ExamCenterTab
            courses={courses}
            students={students}
            exams={exams}
            setExams={setExams}
            questions={questions}
            setQuestions={setQuestions}
            onOpenCourse={handleOpenTutorDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "success-center" && (
          <StudentSuccessTab
            courses={courses}
            students={students}
            grades={grades}
            attendance={attendance}
            risks={risks}
            setRisks={setRisks}
            onOpenStudent={handleOpenStudentDrawer}
            onOpenTutor={handleOpenTutorDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "tutor-performance" && (
          <TutorPerformanceTab
            tutorMetrics={tutors}
            onOpenTutor={handleOpenTutorDrawer}
            logAuditAction={logAuditAction}
          />
        )}
      </div>

      {/* ── CONTEXTUAL SIDE DRAWERS ── */}
      <AnimatePresence>
        {/* Tutor Details Drawer */}
        {drawerTutor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDrawerTutor(null)} className="fixed inset-0 bg-black z-45 cursor-pointer" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/80 z-50 overflow-y-auto p-6 text-left flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4">
                  <h2 className="text-sm font-extrabold font-heading text-foreground uppercase">Tutor Profile Audit Roster</h2>
                  <button onClick={() => setDrawerTutor(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                </div>
                
                <div className="space-y-6 text-xs font-semibold">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{drawerTutor.tutorName}</h3>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Tutor ID: {drawerTutor.tutorId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Teaching Hours</span>
                      <span className="text-foreground text-sm font-black">{drawerTutor.teachingHours} Hours</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Average Rating</span>
                      <span className="text-foreground text-sm font-black flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" /> {drawerTutor.avgRating}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Review Speed</span>
                      <span className="text-foreground text-sm font-black">{drawerTutor.avgReviewTime} Hrs</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">GST/TDS share</span>
                      <span className="text-emerald-500 text-sm font-black">₹{drawerTutor.revenue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Course Assignments</span>
                    <div className="p-3 border border-border/60 bg-muted/10 rounded-lg">
                      <div className="flex justify-between text-[11px] font-bold text-foreground">
                        <span>Course Count</span>
                        <span>{drawerTutor.courseCount} Courses</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-foreground mt-1">
                        <span>Live Classes Done</span>
                        <span>{drawerTutor.liveClassesCount} classes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                <Button onClick={() => setDrawerTutor(null)} className="w-full text-xs font-bold h-10">Close Audit Profile</Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Student Details Drawer */}
        {drawerStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDrawerStudent(null)} className="fixed inset-0 bg-black z-45 cursor-pointer" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/80 z-50 overflow-y-auto p-6 text-left flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4">
                  <h2 className="text-sm font-extrabold font-heading text-foreground uppercase">Student Profile Drawer</h2>
                  <button onClick={() => setDrawerStudent(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                </div>
                
                <div className="space-y-6 text-xs font-semibold">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{drawerStudent.name}</h3>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{drawerStudent.email}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Batch Group</span>
                      <span className="text-foreground text-sm font-black">{drawerStudent.batch}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Progress Rate</span>
                      <span className="text-foreground text-sm font-black">{drawerStudent.progress}% Complete</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Assigned Mentor</span>
                      <span className="text-foreground text-sm font-black">{drawerStudent.mentorName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Certificate Status</span>
                      <span className="text-foreground text-sm font-black">
                        {drawerStudent.certificateIssued ? "Issued" : "Not Eligible"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                <Button onClick={() => setDrawerStudent(null)} className="w-full text-xs font-bold h-10">Close Profile</Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Course Details Drawer */}
        {drawerCourse && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDrawerCourse(null)} className="fixed inset-0 bg-black z-45 cursor-pointer" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/80 z-50 overflow-y-auto p-6 text-left flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4">
                  <h2 className="text-sm font-extrabold font-heading text-foreground uppercase">Course Version Inspector</h2>
                  <button onClick={() => setDrawerCourse(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                </div>
                
                <div className="space-y-6 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded mr-2 uppercase tracking-widest">{drawerCourse.code}</span>
                    <span className="text-[9px] font-extrabold text-muted-foreground uppercase">Version {drawerCourse.version}</span>
                    <h3 className="text-base font-extrabold text-foreground mt-2">{drawerCourse.title}</h3>
                  </div>

                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Course Revision Logs</span>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {drawerCourse.revisionTimeline.map((item, idx) => (
                        <div key={idx} className="p-3 bg-muted/15 border border-border/40 rounded-lg text-[11px]">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{item.date}</span>
                            <span>{item.actor}</span>
                          </div>
                          <p className="text-foreground font-bold mt-1">{item.change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                <Button onClick={() => setDrawerCourse(null)} className="w-full text-xs font-bold h-10">Close Drawer</Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Add Course Modal */}
        {showAddCourseModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddCourseModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-x-4 top-10 bottom-10 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-card border border-border shadow-modal rounded-xl overflow-hidden p-6 z-50 text-left flex flex-col justify-between"
            >
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4 select-none">
                  <div>
                    <h2 className="text-sm font-heading font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      {editingCourse ? <Edit2 size={16} className="text-primary" /> : <Plus size={16} className="text-primary" />} 
                      {editingCourse ? "Edit Course" : "Create New Course Program"}
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {editingCourse ? "Modify existing curriculum profile configuration" : "Configure standard curriculum profile details"}
                    </p>
                    {editingCourse && (
                      <div className="flex flex-wrap gap-2.5 bg-muted/20 border border-border/60 rounded-lg p-2 text-[10px] font-black uppercase text-muted-foreground select-none mt-2">
                        <span>Course ID: {editingCourse.id}</span>
                        <span>Course Code: {editingCourse.code}</span>
                        <span>Version: {editingCourse.version}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowAddCourseModal(false)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                </div>

                <form onSubmit={handleSaveCourse} className="flex-grow overflow-y-auto pr-2 space-y-4 text-xs font-semibold scrollbar-thin">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Read-Only Observability Information for Editing */}
                    {editingCourse && (
                      <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-muted/25 border border-border/40 p-3 rounded-lg text-[10px] font-bold text-muted-foreground select-none mb-2">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider">Created At</span>
                          <span className="text-foreground text-[10.5px] font-extrabold">
                            {editingCourse.createdAt ? new Date(editingCourse.createdAt).toLocaleDateString() : "2026-07-24"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider">Last Updated</span>
                          <span className="text-foreground text-[10.5px] font-extrabold">
                            {editingCourse.updatedAt ? new Date(editingCourse.updatedAt).toLocaleDateString() : "Never"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider">Last Modified By</span>
                          <span className="text-foreground text-[10.5px] font-extrabold">{user?.fullName || "Super Admin"}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider">Total Enrollments</span>
                          <span className="text-foreground text-[10.5px] font-extrabold">
                            {students.filter(s => s.courseId === editingCourse.id).length} Students
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider">Revenue Earned</span>
                          <span className="text-emerald-500 text-[10.5px] font-extrabold">
                            ₹{editingCourse.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider">Certificates Issued</span>
                          <span className="text-foreground text-[10.5px] font-extrabold">
                            {students.filter(s => s.courseId === editingCourse.id && s.certificateIssued).length} Issued
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Course Title */}
                    <div className="sm:col-span-2">
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Course Title *</span>
                        {isTitleChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Advanced Next.js Architecture"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isTitleChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Category *</span>
                        {isCategoryChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <select
                        required
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isCategoryChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      >
                        <option value="Coding">Coding</option>
                        <option value="Dance">Dance</option>
                        <option value="Academics">Academics</option>
                        <option value="Design">Design</option>
                        <option value="Business">Business</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Tutor */}
                    <div>
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Assigned Tutor</span>
                        {isTutorChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <select
                        value={formTutorId}
                        onChange={(e) => setFormTutorId(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isTutorChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      >
                        <option value="">System Admin (Default)</option>
                        {tutors.map(t => (
                          <option key={t.tutorId} value={t.tutorId}>{t.tutorName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Academy/Organization */}
                    <div>
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Organization / Academy</span>
                        {isOrganizationChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Academy of Fine Arts"
                        value={formOrganization}
                        onChange={(e) => setFormOrganization(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isOrganizationChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Price (₹)</span>
                        {isPriceChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1500"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isPriceChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Duration</span>
                        {isDurationChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12 weeks"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isDurationChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      />
                    </div>

                    {/* Level */}
                    <div>
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Level</span>
                        {isLevelChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <select
                        value={formLevel}
                        onChange={(e) => setFormLevel(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isLevelChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Thumbnail URL */}
                    <div className="sm:col-span-2">
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Thumbnail URL</span>
                        {isThumbnailUrlChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. https://images.unsplash.com/..."
                        value={formThumbnailUrl}
                        onChange={(e) => setFormThumbnailUrl(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isThumbnailUrlChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Status *</span>
                        {isStatusChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className={`w-full h-9 px-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold ${
                          isStatusChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="flex items-center text-[10px] text-muted-foreground uppercase font-bold mb-1.5">
                        <span>Description</span>
                        {isDescriptionChanged && (
                          <span className="text-[9px] text-primary lowercase ml-1.5 bg-primary/10 px-1 rounded-sm font-black">(modified)</span>
                        )}
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. This course program covers modern web architectures..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className={`w-full p-3 rounded-button border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all resize-none font-bold ${
                          isDescriptionChanged ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40 select-none">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCourseModal(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={editingCourse ? !hasAnyFieldChanged : false}
                      className={`bg-primary text-white shadow-soft font-extrabold ${
                        editingCourse && !hasAnyFieldChanged ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"
                      }`}
                    >
                      {editingCourse ? "Save Changes" : "Save Course"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}

        {/* Course History Drawer */}
        {drawerHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerHistory(null)}
              className="fixed inset-0 bg-black/50 z-45 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border/80 z-50 overflow-y-auto p-6 text-left flex flex-col justify-between shadow-2xl"
            >
              <div className="flex-grow flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4 select-none">
                  <div>
                    <h2 className="text-sm font-extrabold font-heading text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={16} className="text-primary" /> Course History Audit
                    </h2>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 mr-2 uppercase tracking-widest mt-1 block w-fit">
                      {drawerHistory.code}
                    </span>
                    <p className="text-[11px] font-extrabold text-foreground mt-1 truncate">{drawerHistory.title}</p>
                  </div>
                  <button onClick={() => setDrawerHistory(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                </div>

                {/* Search and Filters Bar */}
                <div className="space-y-3 bg-muted/15 border border-border/50 p-3 rounded-xl mb-4 select-none">
                  {/* Search */}
                  <div className="flex items-center gap-2 border border-border rounded-button bg-background px-3 py-1.5">
                    <Search size={12} className="text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search history by admin or field..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="bg-transparent border-none text-[11px] text-foreground focus:outline-none w-full font-semibold"
                    />
                  </div>

                  {/* Date Filters */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Date Range</span>
                    <div className="flex gap-1.5">
                      {(["all", "today", "7days", "30days"] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setHistoryFilter(f)}
                          className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded border transition-all ${
                            historyFilter === f 
                              ? "bg-primary text-white border-primary" 
                              : "bg-card text-muted-foreground border-border hover:bg-muted/40"
                          }`}
                        >
                          {f === "all" ? "All" : f === "today" ? "Today" : f === "7days" ? "7 Days" : "30 Days"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exports actions */}
                  <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Export Records</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleExportHistory("json")} 
                        className="text-[9px] font-extrabold bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded transition-all cursor-pointer"
                      >
                        JSON
                      </button>
                      <button 
                        onClick={() => handleExportHistory("csv")} 
                        className="text-[9px] font-extrabold bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded transition-all cursor-pointer"
                      >
                        CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* History Lists */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                  {/* Revision Timeline / Version history */}
                  <div className="space-y-2 select-none">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Course Release Log</span>
                    <div className="space-y-1.5">
                      <div className="p-3 bg-muted/15 border border-border/40 rounded-lg text-[11px] font-bold">
                        <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                          <span>Created At:</span>
                          <span>{drawerHistory.createdAt ? new Date(drawerHistory.createdAt).toLocaleDateString() : "2026-07-24"}</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                          <span>Last Updated:</span>
                          <span>{drawerHistory.updatedAt ? new Date(drawerHistory.updatedAt).toLocaleDateString() : "Never"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Entries */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block select-none">
                      Security Audit History ({getFilteredAuditLogs().length} records)
                    </span>
                    <div className="space-y-3">
                      {getFilteredAuditLogs().length === 0 ? (
                        <div className="p-4 border border-dashed border-border/85 rounded-xl text-center text-muted-foreground text-[11px] font-bold select-none">
                          No audit matches found for this search or date range.
                        </div>
                      ) : (
                        getFilteredAuditLogs().map((log: any) => {
                          let prevValsObj: Record<string, any> = {};
                          let newValsObj: Record<string, any> = {};
                          try {
                            prevValsObj = JSON.parse(log.previousValues || "{}");
                            newValsObj = JSON.parse(log.newValues || "{}");
                          } catch (e) {}

                          return (
                            <div key={log.id} className="p-3.5 bg-muted/20 border border-border/60 rounded-xl text-[11px] font-semibold space-y-2.5">
                              <div className="flex items-center justify-between border-b border-border/30 pb-2 select-none">
                                <div>
                                  <span className="text-foreground font-black text-xs block">{log.adminName}</span>
                                  <span className="text-[8px] text-muted-foreground block">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                  {log.action}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block select-none">Modified Fields</span>
                                <div className="flex flex-wrap gap-1">
                                  {(log.changedFields || []).map((f: string) => (
                                    <span key={f} className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.2 rounded uppercase">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1 bg-background p-2 rounded-lg border border-border/40">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase block select-none mb-1">Value Changes</span>
                                {Object.keys(prevValsObj).map((key) => (
                                  <div key={key} className="grid grid-cols-3 gap-2 text-[10px] border-b border-border/20 last:border-0 pb-1 last:pb-0 pt-1 first:pt-0">
                                    <span className="text-muted-foreground uppercase font-black tracking-wider truncate">{key}</span>
                                    <span className="text-rose-500 line-through truncate font-bold">{String(prevValsObj[key]) || "none"}</span>
                                    <span className="text-emerald-500 font-extrabold truncate">{String(newValsObj[key]) || "none"}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border/40 select-none">
                <Button onClick={() => setDrawerHistory(null)} className="w-full text-xs font-bold h-10">Close Audit Inspector</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
