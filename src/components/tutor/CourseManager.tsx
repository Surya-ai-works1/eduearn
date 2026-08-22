"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Archive,
  ChevronLeft,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  Video,
  Link,
  FileText,
  Sparkles,
  Star,
  MoreVertical,
  BarChart3,
  FolderOpen,
  GraduationCap,
  Clock,
  Layers,
  IndianRupee,
  Users,
  Compass,
  DollarSign,
  ChevronRight,
  Shield,
  HelpCircle,
  FileSpreadsheet,
  Globe,
  Settings2,
  AlertTriangle,
  Search,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { NoCourses } from "./EmptyState";
import type { TutorCourse, CurriculumModule, CurriculumLesson, LiveSession, MediaFile } from "./types";
import { QuizQuestion } from "../../lib/types/quizManagement";
import { MarketplaceService } from "../../features/payments/services/marketplaceService";
import { useTutor } from "../../context/TutorContext";

type CourseStatus = "all" | "published" | "draft" | "pending" | "archived" | "completed";

const STATUS_TABS: { id: CourseStatus; label: string }[] = [
  { id: "all", label: "All Courses" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "pending", label: "Under Review" },
  { id: "archived", label: "Archived" },
];

interface CourseManagerProps {
  myCourses: TutorCourse[];
  setMyCourses: React.Dispatch<React.SetStateAction<TutorCourse[]>>;
  isCreatingCourse: boolean;
  setIsCreatingCourse: (v: boolean) => void;
  activeBuilderCourseId: string | null;
  setActiveBuilderCourseId: (id: string | null) => void;
  curriculumModules: CurriculumModule[];
  setCurriculumModules: React.Dispatch<React.SetStateAction<CurriculumModule[]>>;
  newModuleName: string;
  setNewModuleName: (v: string) => void;
  activeModuleIdForLesson: string | null;
  setActiveModuleIdForLesson: (id: string | null) => void;
  lessonForm: { title: string; type: "Video" | "PDF" | "Quiz" | "Assignment"; duration: string };
  setLessonForm: React.Dispatch<React.SetStateAction<any>>;
  isAutoSaving: boolean;
  courseForm: any;
  setCourseForm: React.Dispatch<React.SetStateAction<any>>;
  editingCourseId: string | null;
  setEditingCourseId: (id: string | null) => void;
  courseSelCatId: string;
  setCourseSelCatId: (v: string) => void;
  courseSelSubName: string;
  setCourseSelSubName: (v: string) => void;
  appStatus: string;
  handleAddModule: () => void;
  handleAddLesson: (moduleId: string) => void;
  triggerAutoSave: () => void;
  courseSearch: string;
  setCourseSearch: (s: string) => void;
  courseCategoryFilter: string;
  setCourseCategoryFilter: (c: string) => void;
  coursePage: number;
  setCoursePage: (p: number) => void;
  courseTotalPages: number;
  lessons: any[];
  setLessons: React.Dispatch<React.SetStateAction<any[]>>;
  lessonsLoading: boolean;
}

export const CourseManager = React.memo(function CourseManager({
  myCourses,
  setMyCourses,
  isCreatingCourse,
  setIsCreatingCourse,
  activeBuilderCourseId,
  setActiveBuilderCourseId,
  curriculumModules,
  setCurriculumModules,
  newModuleName,
  setNewModuleName,
  activeModuleIdForLesson,
  setActiveModuleIdForLesson,
  lessonForm,
  setLessonForm,
  isAutoSaving,
  courseForm,
  setCourseForm,
  editingCourseId,
  setEditingCourseId,
  courseSelCatId,
  setCourseSelCatId,
  courseSelSubName,
  setCourseSelSubName,
  appStatus,
  handleAddModule,
  handleAddLesson,
  triggerAutoSave,
  courseSearch,
  setCourseSearch,
  courseCategoryFilter,
  setCourseCategoryFilter,
  coursePage,
  setCoursePage,
  courseTotalPages,
  lessons,
  setLessons,
  lessonsLoading,
}: CourseManagerProps) {
  const { liveSessions = [], mediaFiles = [] } = useTutor();

  // Local state for UI panels & dialogs
  const [statusFilter, setStatusFilter] = useState<CourseStatus>("all");
  const [learningModeFilter, setLearningModeFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [sortByFilter, setSortByFilter] = useState("newest");
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Custom interactive overlays
  const [selectedCourseForAnalytics, setSelectedCourseForAnalytics] = useState<TutorCourse | null>(null);
  const [selectedCourseForPreview, setSelectedCourseForPreview] = useState<TutorCourse | null>(null);
  const [showConfirmDeleteCourse, setShowConfirmDeleteCourse] = useState<TutorCourse | null>(null);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"7d" | "28d" | "90d" | "1y">("28d");

  // Multi-step Course Creation State
  const [activeStep, setActiveStep] = useState(1);
  
  // Form fields for Step 1
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLevel, setFormLevel] = useState("beginner");
  const [formDuration, setFormDuration] = useState("10 hours");
  const [formLanguage, setFormLanguage] = useState("English");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formObjectives, setFormObjectives] = useState("");
  const [formPrerequisites, setFormPrerequisites] = useState("");

  // Step 2
  const [formLearningMode, setFormLearningMode] = useState<"Live" | "Recorded" | "Live + Recorded" | "Self-Paced" | "Complete Package">("Complete Package");

  // Step 4
  const [formPriceType, setFormPriceType] = useState<"free" | "paid">("paid");
  const [formPrice, setFormPrice] = useState("999");

  // Step 5
  const [formDoubtSessions, setFormDoubtSessions] = useState(true);
  const [formCommunity, setFormCommunity] = useState(true);

  // Step 6
  const [formCertificate, setFormCertificate] = useState(true);
  const [formCertCompletionPct, setFormCertCompletionPct] = useState("80");
  const [formCertQuizReq, setFormCertQuizReq] = useState(true);
  const [formCertProjReq, setFormCertProjReq] = useState(true);

  // Local course modules curriculum (Step 3 builder)
  const [localModules, setLocalModules] = useState<CurriculumModule[]>([
    {
      id: "mod-1",
      title: "Module 1 — Introduction & Setup",
      lessons: [
        { id: "les-1-1", title: "Course Syllabus Overview", type: "Video", duration: "10 mins", preview: true },
        { id: "les-1-2", title: "Variables & Expressions Handout", type: "Resource", duration: "15 mins", preview: false }
      ]
    }
  ]);
  const [newLocalModuleName, setNewLocalModuleName] = useState("");
  const [activeModuleForLink, setActiveModuleForLink] = useState<string | null>(null);

  // Linking assets modals
  const [showLinkLiveModal, setShowLinkLiveModal] = useState(false);
  const [showLinkRecordingModal, setShowLinkRecordingModal] = useState(false);
  const [showLinkResourceModal, setShowLinkResourceModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Modal Input Forms
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentDesc, setNewAssignmentDesc] = useState("");
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizQuestions, setNewQuizQuestions] = useState("10");
  const [newQuizPassScore, setNewQuizPassScore] = useState("70");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  // Enrich initial courses data with learning packages features
  const enrichedCourses = useMemo(() => {
    return myCourses.map((c, idx) => {
      const mode = c.learningMode || (idx % 3 === 0 ? "Live + Recorded" : idx % 2 === 0 ? "Complete Package" : "Self-Paced");
      const rev = c.price * c.studentsCount * 0.7;
      
      const liveClassesCount = idx % 2 === 0 ? 12 : 6;
      const recordedLessonsCount = idx % 3 === 0 ? 18 : 10;
      const doubtSessionsCount = idx % 4 === 0 ? 4 : 2;
      const resourcesCount = idx % 2 === 0 ? 8 : 4;
      const assignmentsCount = idx % 3 === 0 ? 6 : 3;
      const projectsCount = idx % 4 === 0 ? 3 : 1;
      const certificateEnabled = idx % 2 === 0;

      return {
        ...c,
        learningMode: mode,
        revenueEarned: rev,
        liveSessionsCount: liveClassesCount,
        recordedLessonsCount,
        doubtSessionsCount,
        resourcesCount,
        assignmentsCount,
        projectsCount,
        certificateEnabled,
        subtitle: c.subtitle || "Build strong structural bases through expert creator sessions.",
        description: c.description || "A complete specialized program detailing critical workflows, interactive assignments, review modules, and structured certificate milestones."
      };
    });
  }, [myCourses]);

  // Aggregate stats for KPIs
  const kpiStats = useMemo(() => {
    const published = enrichedCourses.filter(c => c.status === "published").length;
    const drafts = enrichedCourses.filter(c => c.status === "draft").length;
    const pending = enrichedCourses.filter(c => c.status === "pending").length;
    const totalStudents = enrichedCourses.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
    const totalRevenue = enrichedCourses.reduce((sum, c) => sum + (c.revenueEarned || 0), 0) + 24500;
    const avgRating = enrichedCourses.length > 0 
      ? Number((enrichedCourses.reduce((sum, c) => sum + (c.rating || 5), 0) / enrichedCourses.length).toFixed(1))
      : 4.8;

    return {
      total: enrichedCourses.length,
      published,
      drafts,
      pending,
      totalStudents,
      totalRevenue,
      avgRating
    };
  }, [enrichedCourses]);

  // Filters logic
  const filteredCourses = useMemo(() => {
    return enrichedCourses.filter(c => {
      // Status tab
      if (statusFilter !== "all" && c.status !== statusFilter) return false;

      // Learning mode dropdown
      if (learningModeFilter !== "All" && c.learningMode !== learningModeFilter) return false;

      // Price dropdown
      if (priceFilter === "Free" && c.price > 0) return false;
      if (priceFilter === "Paid" && c.price === 0) return false;

      // Rating dropdown
      if (ratingFilter === "4.5" && c.rating < 4.5) return false;
      if (ratingFilter === "4.0" && c.rating < 4.0) return false;

      // Category filter from parent search
      if (courseCategoryFilter !== "All" && c.category !== courseCategoryFilter) return false;

      // Search query
      if (courseSearch && !c.title.toLowerCase().includes(courseSearch.toLowerCase()) && !c.category.toLowerCase().includes(courseSearch.toLowerCase())) return false;

      return true;
    }).sort((a, b) => {
      if (sortByFilter === "newest") return b.id.localeCompare(a.id);
      if (sortByFilter === "students") return b.studentsCount - a.studentsCount;
      if (sortByFilter === "revenue") return (b.revenueEarned || 0) - (a.revenueEarned || 0);
      if (sortByFilter === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [enrichedCourses, statusFilter, learningModeFilter, priceFilter, ratingFilter, courseCategoryFilter, courseSearch, sortByFilter]);

  // Handle Edit course (loads stepping wizard)
  const handleStartEdit = useCallback((c: TutorCourse) => {
    setEditingCourseId(c.id);
    setFormTitle(c.title);
    setFormSubtitle(c.subtitle || "");
    setFormDesc(c.description || "");
    setFormLevel(c.level);
    setFormDuration(c.duration || "10 hours");
    setFormLanguage(c.language || "English");
    setFormThumbnail(c.thumbnail || "");
    setFormTags(Array.isArray(c.tags) ? c.tags.join(", ") : "");
    setFormLearningMode(c.learningMode || "Complete Package");
    setFormPriceType(c.price > 0 ? "paid" : "free");
    setFormPrice(String(c.price || "999"));
    setFormDoubtSessions(c.doubtSessionsEnabled ?? true);
    setFormCommunity(c.communityEnabled ?? true);
    setFormCertificate(c.certificateEnabled ?? true);
    
    // Set mock or existing curriculum modules
    if (c.curriculumModules && c.curriculumModules.length > 0) {
      setLocalModules(c.curriculumModules);
    } else {
      setLocalModules([
        {
          id: "mod-1",
          title: "Module 1 — Core Principles",
          lessons: [
            { id: "les-1", title: "Concept Overview & Setup", type: "Video", duration: "10 mins", preview: true }
          ]
        }
      ]);
    }
    setActiveStep(1);
    setIsCreatingCourse(true);
    setOpenMenuId(null);
  }, [setEditingCourseId, setIsCreatingCourse]);

  // Handle save course from multi-step wizard
  const handleSaveCourseWizard = async () => {
    if (!formTitle.trim()) {
      toast.error("Please enter a course title.");
      return;
    }

    const priceVal = formPriceType === "free" ? 0 : parseFloat(formPrice) || 0;
    const body = {
      title: formTitle,
      subtitle: formSubtitle,
      description: formDesc,
      category: courseForm.category || "Programming",
      level: formLevel,
      language: formLanguage,
      thumbnail: formThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      price: priceVal,
      learningMode: formLearningMode,
      certificateEnabled: formCertificate,
      doubtSessionsEnabled: formDoubtSessions,
      communityEnabled: formCommunity,
      curriculumModules: localModules,
      status: editingCourseId ? courseForm.status || "published" : "draft",
      tags: formTags.split(",").map(t => t.trim()).filter(Boolean)
    };

    try {
      if (editingCourseId) {
        const res = await fetch(`/api/tutor/courses/${editingCourseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const updated = await res.json();
          setMyCourses((prev) =>
            prev.map((c) => (c.id === editingCourseId ? { ...c, ...body, id: editingCourseId } : c))
          );
          toast.success("Course details updated successfully!");
        }
      } else {
        const res = await fetch("/api/tutor/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const newCourse = await res.json();
          setMyCourses((prev) => [{ ...newCourse, ...body }, ...prev]);
          toast.success("New hybrid course package created!");
        }
      }
    } catch (err) {
      console.warn("Failed saving course wizard outline:", err);
      // Fallback local update
      if (editingCourseId) {
        setMyCourses(prev => prev.map(c => c.id === editingCourseId ? { ...c, ...body, id: editingCourseId } as any : c));
        toast.success("Course details updated locally.");
      } else {
        const fallbackId = `course-${Date.now()}`;
        setMyCourses(prev => [{ ...body, id: fallbackId, rating: 5, studentsCount: 0 } as any, ...prev]);
        toast.success("New hybrid course package created locally.");
      }
    }

    // Reset wizard
    setIsCreatingCourse(false);
    setEditingCourseId(null);
    setActiveStep(1);
    setFormTitle("");
    setFormSubtitle("");
    setFormDesc("");
  };

  const handleDuplicate = useCallback(
    async (c: TutorCourse) => {
      try {
        const body = {
          title: `${c.title} (Copy)`,
          subtitle: c.subtitle || "",
          description: c.description || "",
          category: c.category,
          level: c.level,
          language: c.language || "English",
          thumbnail: c.thumbnail || "",
          price: c.price,
          status: "draft",
          tags: c.tags || [],
        };
        const res = await fetch("/api/tutor/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const newCourse = await res.json();
          setMyCourses((prev) => [{ ...newCourse, ...body }, ...prev]);
          toast.success("Course duplicated.");
        } else {
          toast.error("Failed to duplicate course.");
        }
      } catch (err) {
        // Fallback duplicate locally
        const dup = { ...c, id: `course-${Date.now()}`, title: `${c.title} (Copy)`, status: "draft" as any };
        setMyCourses(prev => [dup, ...prev]);
        toast.success("Course duplicated locally.");
      }
    },
    [setMyCourses]
  );

  const handleArchive = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/tutor/courses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "archived" }),
        });
        if (res.ok) {
          setMyCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: "archived" } : c)));
          toast.success("Course archived.");
        } else {
          toast.error("Failed to archive course.");
        }
      } catch (err) {
        setMyCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: "archived" } : c)));
        toast.success("Course archived locally.");
      }
    },
    [setMyCourses]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/tutor/courses/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setMyCourses((prev) => prev.filter((c) => c.id !== id));
          toast.success("Course deleted successfully.");
        } else {
          toast.error("Failed to delete course.");
        }
      } catch (err) {
        setMyCourses((prev) => prev.filter((c) => c.id !== id));
        toast.success("Course deleted locally.");
      }
      setShowConfirmDeleteCourse(null);
    },
    [setMyCourses]
  );

  // Module additions
  const handleAddLocalModule = () => {
    if (!newLocalModuleName.trim()) return;
    const newMod: CurriculumModule = {
      id: `mod-${Date.now()}`,
      title: newLocalModuleName,
      lessons: []
    };
    setLocalModules(prev => [...prev, newMod]);
    setNewLocalModuleName("");
    toast.success("New module section created!");
  };

  const handleLinkLiveSubmit = (session: LiveSession) => {
    if (!activeModuleForLink) return;
    setLocalModules(prev => prev.map(m => {
      if (m.id === activeModuleForLink) {
        const newLes: CurriculumLesson = {
          id: `les-${Date.now()}`,
          title: session.title,
          type: "Live Class",
          duration: session.duration || "90 mins",
          preview: false
        };
        return { ...m, lessons: [...m.lessons, newLes] };
      }
      return m;
    }));
    setShowLinkLiveModal(false);
    toast.success("Live class linked to module outline!");
  };

  const handleLinkRecordingSubmit = (session: LiveSession) => {
    if (!activeModuleForLink) return;
    setLocalModules(prev => prev.map(m => {
      if (m.id === activeModuleForLink) {
        const newLes: CurriculumLesson = {
          id: `les-${Date.now()}`,
          title: `${session.title} (Recorded Live Class)`,
          type: "Recorded Lesson",
          duration: session.duration || "1h 42m",
          preview: false
        };
        return { ...m, lessons: [...m.lessons, newLes] };
      }
      return m;
    }));
    setShowLinkRecordingModal(false);
    toast.success("Live recording linked as recorded lesson!");
  };

  const handleLinkResourceSubmit = (file: MediaFile) => {
    if (!activeModuleForLink) return;
    setLocalModules(prev => prev.map(m => {
      if (m.id === activeModuleForLink) {
        const newLes: CurriculumLesson = {
          id: `les-${Date.now()}`,
          title: file.name,
          type: "Resource",
          duration: file.size,
          preview: false
        };
        return { ...m, lessons: [...m.lessons, newLes] };
      }
      return m;
    }));
    setShowLinkResourceModal(false);
    toast.success("Library note resource linked to module!");
  };

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleForLink || !newAssignmentTitle) return;
    setLocalModules(prev => prev.map(m => {
      if (m.id === activeModuleForLink) {
        const newLes: CurriculumLesson = {
          id: `les-${Date.now()}`,
          title: newAssignmentTitle,
          type: "Assignment",
          duration: "Due Friday",
          preview: false
        };
        return { ...m, lessons: [...m.lessons, newLes] };
      }
      return m;
    }));
    setShowCreateAssignmentModal(false);
    setNewAssignmentTitle("");
    setNewAssignmentDesc("");
    toast.success("Assignment attached to module syllabus!");
  };

  const handleCreateQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleForLink || !newQuizTitle) return;
    setLocalModules(prev => prev.map(m => {
      if (m.id === activeModuleForLink) {
        const newLes: CurriculumLesson = {
          id: `les-${Date.now()}`,
          title: `${newQuizTitle} (${newQuizQuestions} Questions)`,
          type: "Quiz",
          duration: `${newQuizPassScore}% Pass`,
          preview: false
        };
        return { ...m, lessons: [...m.lessons, newLes] };
      }
      return m;
    }));
    setShowCreateQuizModal(false);
    setNewQuizTitle("");
    toast.success("Assessment Quiz attached to module syllabus!");
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleForLink || !newProjectTitle) return;
    setLocalModules(prev => prev.map(m => {
      if (m.id === activeModuleForLink) {
        const newLes: CurriculumLesson = {
          id: `les-${Date.now()}`,
          title: `Project: ${newProjectTitle}`,
          type: "Project",
          duration: "Milestone",
          preview: false
        };
        return { ...m, lessons: [...m.lessons, newLes] };
      }
      return m;
    }));
    setShowCreateProjectModal(false);
    setNewProjectTitle("");
    setNewProjectDesc("");
    toast.success("Capstone Project outline attached to module syllabus!");
  };

  const handleDeleteLocalLesson = (moduleId: string, lessonId: string) => {
    setLocalModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
    toast.success("Item removed from curriculum outline.");
  };

  // Switch to custom view layout when flat syllabus manager is active
  if (activeBuilderCourseId) {
    const courseObj = myCourses.find(c => c.id === activeBuilderCourseId);

    return (
      <motion.div
        key="course-builder-workspace"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6 text-left"
      >
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <button
            onClick={() => setActiveBuilderCourseId(null)}
            className="text-xs font-black text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer border-none bg-transparent focus:outline-none transition-colors"
          >
            <ChevronLeft size={14} /> Back to Studio Outline
          </button>
          
          <h4 className="text-xs font-black uppercase text-muted-foreground leading-none">
            Curriculum Builder: <span className="text-foreground">{courseObj?.title}</span>
          </h4>
        </div>

        {/* Dynamic nested module curriculum display */}
        <Card variant="glass" className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Course Curriculum outline</h3>
              <p className="text-xs text-muted-foreground">Define teaching segments, assignments, doubt forums and exams.</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="New Module Title..."
                value={newLocalModuleName}
                onChange={e => setNewLocalModuleName(e.target.value)}
                className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
              <Button
                onClick={handleAddLocalModule}
                size="sm"
                className="h-8.5 text-xs bg-primary text-white font-bold border-none"
              >
                + Add Module
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {localModules.map(module => (
              <div key={module.id} className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-4">
                <div className="flex justify-between items-center select-none border-b border-border/20 pb-2">
                  <h4 className="text-xs font-black text-foreground uppercase">{module.title}</h4>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => {
                        setActiveModuleForLink(module.id);
                        setShowLinkLiveModal(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="h-6.5 text-[9.5px] px-2 font-bold border-border/60"
                    >
                      + Live Class
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveModuleForLink(module.id);
                        setShowLinkRecordingModal(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="h-6.5 text-[9.5px] px-2 font-bold border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/5"
                    >
                      + Recording
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveModuleForLink(module.id);
                        setShowLinkResourceModal(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="h-6.5 text-[9.5px] px-2 font-bold border-border/60"
                    >
                      + Note Resource
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveModuleForLink(module.id);
                        setShowCreateAssignmentModal(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="h-6.5 text-[9.5px] px-2 font-bold border-border/60"
                    >
                      + Assignment
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveModuleForLink(module.id);
                        setShowCreateQuizModal(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="h-6.5 text-[9.5px] px-2 font-bold border-border/60"
                    >
                      + Quiz
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveModuleForLink(module.id);
                        setShowCreateProjectModal(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="h-6.5 text-[9.5px] px-2 font-bold border-border/60"
                    >
                      + Project
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {module.lessons.map(les => (
                    <div key={les.id} className="p-3 bg-card border border-border/60 rounded-xl flex items-center justify-between text-xs font-semibold text-muted-foreground hover:border-primary/20 transition">
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg text-white ${
                          les.type === "Live Class"
                            ? "bg-rose-500"
                            : les.type === "Recorded Lesson" || les.type === "Video"
                            ? "bg-emerald-500"
                            : les.type === "Resource"
                            ? "bg-sky-500"
                            : les.type === "Quiz"
                            ? "bg-amber-500"
                            : "bg-indigo-500"
                        }`}>
                          {les.type === "Live Class" ? <Video size={13} /> : les.type === "Resource" ? <FolderOpen size={13} /> : <BookOpen size={13} />}
                        </span>
                        <div className="text-left">
                          <h5 className="font-extrabold text-foreground leading-tight">{les.title}</h5>
                          <span className="text-[9.5px] text-muted-foreground/80 font-black uppercase tracking-wider">{les.type} • {les.duration}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleDeleteLocalLesson(module.id, les.id)}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-none hover:bg-rose-500/5 text-rose-500"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                  {module.lessons.length === 0 && (
                    <p className="text-[10px] text-muted-foreground/75 italic text-center py-4 select-none">No lessons or support assets added yet. Use filters above to link files.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    );
  }

  // Create/Edit Form Step Wizard
  if (isCreatingCourse) {
    const learningModes = [
      { id: "Live", title: "Live Classes", desc: "Students learn through scheduled live lectures." },
      { id: "Recorded", title: "Recorded self-paced", desc: "Students learn at their own pace with videos." },
      { id: "Live + Recorded", title: "Live + Recorded learning", desc: "Combine live interaction with self-paced studies." },
      { id: "Self-Paced", title: "Self paced workspace", desc: "Fully asynchronous lessons and assignments." },
      { id: "Complete Package", title: "EduEarn Complete Package", desc: "Live + Recorded + Notes + Assignments + Doubts support + Certificates." }
    ];

    return (
      <motion.div
        key="create-course-wizard"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="max-w-2xl mx-auto space-y-6 text-left"
      >
        <Card variant="glass" className="p-6 shadow-floating space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border/40 pb-3 select-none">
            <h4 className="text-xs font-black uppercase text-foreground">
              {editingCourseId ? "Edit Course Package Studio" : "Course Creator Stepping Wizard"}
            </h4>
            <button
              onClick={() => {
                setIsCreatingCourse(false);
                setEditingCourseId(null);
                setActiveStep(1);
              }}
              className="text-[10.5px] font-bold text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
            >
              Cancel
            </button>
          </div>

          {/* Steps Horizontal Bar Indicators */}
          <div className="grid grid-cols-7 gap-1 bg-muted/30 p-1 rounded-xl text-center text-[9px] font-black uppercase tracking-wider text-muted-foreground border border-border/30 select-none">
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
              <span
                key={num}
                className={`py-1.5 rounded-lg ${activeStep === num ? "bg-primary text-white" : activeStep > num ? "text-emerald-500" : ""}`}
              >
                {activeStep > num ? "✓" : `Step ${num}`}
              </span>
            ))}
          </div>

          {/* STEP 1: Basic Info */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase select-none">Step 1 — Basic Course Details</h3>
              
              <div className="space-y-1">
                <label className="font-bold text-foreground">Course Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Python Masterclass Complete Program"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Subtitle / Catchline *</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={e => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Master backend programming and data structures"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Course Description *</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Provide exhaustive syllabus details..."
                  className="w-full bg-card border border-border rounded-xl p-3 text-xs font-semibold text-foreground focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Difficulty Level *</label>
                  <select
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Language *</label>
                  <select
                    value={formLanguage}
                    onChange={e => setFormLanguage(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Duration *</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    placeholder="e.g. 10 hours"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Thumbnail URL</label>
                  <input
                    type="text"
                    value={formThumbnail}
                    onChange={e => setFormThumbnail(e.target.value)}
                    placeholder="e.g. /images/thumbnail.png"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  placeholder="python, backend, programming"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Objectives</label>
                  <input
                    type="text"
                    value={formObjectives}
                    onChange={e => setFormObjectives(e.target.value)}
                    placeholder="e.g. Learn OOP, database operations"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Prerequisites</label>
                  <input
                    type="text"
                    value={formPrerequisites}
                    onChange={e => setFormPrerequisites(e.target.value)}
                    placeholder="e.g. Basic coding logic"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Learning Mode */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase select-none">Step 2 — Select Learning Mode</h3>
              
              <div className="space-y-3">
                {learningModes.map(mode => (
                  <label
                    key={mode.id}
                    onClick={() => setFormLearningMode(mode.id as any)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      formLearningMode === mode.id
                        ? "border-primary bg-primary/[0.02]"
                        : "border-border/60 hover:border-primary/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="learningMode"
                      checked={formLearningMode === mode.id}
                      onChange={() => {}}
                      className="rounded border-border text-primary mt-1"
                    />
                    <div className="text-left font-semibold text-xs leading-normal">
                      <span className="font-extrabold text-foreground">{mode.title}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{mode.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Curriculum Setup */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase select-none">Step 3 — Build Syllabus Curriculum</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Add modules and map structural materials, completed live session clips, homework sheets, and community forums.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Module 2 — Intermediate Loops"
                  value={newLocalModuleName}
                  onChange={e => setNewLocalModuleName(e.target.value)}
                  className="h-8.5 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                />
                <Button
                  onClick={handleAddLocalModule}
                  size="sm"
                  className="h-8.5 px-3 bg-primary text-white font-bold border-none"
                >
                  + Add Module
                </Button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {localModules.map(module => (
                  <div key={module.id} className="p-3.5 bg-muted/20 border border-border/50 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-[10.5px] font-black uppercase tracking-wider text-foreground select-none">
                      <span>{module.title}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModuleForLink(module.id);
                            setShowLinkLiveModal(true);
                          }}
                          className="px-2 py-1 text-[8.5px] bg-card border border-border rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          + Live Class
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModuleForLink(module.id);
                            setShowLinkRecordingModal(true);
                          }}
                          className="px-2 py-1 text-[8.5px] bg-indigo-500/10 text-indigo-500 rounded border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer"
                        >
                          + Recording
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModuleForLink(module.id);
                            setShowLinkResourceModal(true);
                          }}
                          className="px-2 py-1 text-[8.5px] bg-card border border-border rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          + Note Resource
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {module.lessons.map(les => (
                        <div key={les.id} className="p-2 bg-card border border-border/40 rounded-lg flex justify-between items-center text-[10.5px]">
                          <span className="font-extrabold text-foreground truncate max-w-[200px]">
                            {les.type === "Live Class" ? "🔴" : les.type === "Recorded Lesson" ? "🎥" : "📄"} {les.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteLocalLesson(module.id, les.id)}
                            className="text-rose-500 hover:text-rose-600 font-bold border-none bg-transparent cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {module.lessons.length === 0 && (
                        <p className="text-[9.5px] text-muted-foreground/60 italic text-center py-2 select-none">No curriculum assets attached.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Pricing */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase select-none">Step 4 — Configure Pricing Tiers</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Pricing Option *</label>
                  <select
                    value={formPriceType}
                    onChange={e => setFormPriceType(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="paid">Paid Package</option>
                    <option value="free">Free Access</option>
                  </select>
                </div>
                {formPriceType === "paid" && (
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Price Amount (₹) *</label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Support Options */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase select-none">Step 5 — Enable Community &amp; Doubt Support</h3>
              
              <div className="space-y-3 font-semibold text-xs text-foreground">
                <label className="flex items-start gap-2.5 p-3 bg-muted/20 border border-border/40 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formDoubtSessions}
                    onChange={e => setFormDoubtSessions(e.target.checked)}
                    className="rounded border-border text-indigo-500 mt-0.5"
                  />
                  <div>
                    <span>Enable Live Doubt Solving Classes</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Attach weekly doubt-support live sessions Saturday evenings.</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 bg-muted/20 border border-border/40 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formCommunity}
                    onChange={e => setFormCommunity(e.target.checked)}
                    className="rounded border-border text-indigo-500 mt-0.5"
                  />
                  <div>
                    <span>Enable Class Q&amp;A Community Channels</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Create community chat layers for active cohorts.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: Certificate Settings */}
          {activeStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase select-none">Step 6 — Set Certification Criteria</h3>
              
              <div className="space-y-3 font-semibold text-xs text-foreground">
                <label className="flex items-center gap-2.5 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formCertificate}
                    onChange={e => setFormCertificate(e.target.checked)}
                    className="rounded border-border text-primary"
                  />
                  Enable Student Course Completion Certificate
                </label>

                {formCertificate && (
                  <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-4 font-bold text-xs">
                    <div className="space-y-1">
                      <label className="text-muted-foreground">Required Completion Percentage (%)</label>
                      <input
                        type="number"
                        value={formCertCompletionPct}
                        onChange={e => setFormCertCompletionPct(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 text-muted-foreground">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formCertQuizReq}
                          onChange={e => setFormCertQuizReq(e.target.checked)}
                          className="rounded border-border text-primary"
                        />
                        Require passing all attached quizzes
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formCertProjReq}
                          onChange={e => setFormCertProjReq(e.target.checked)}
                          className="rounded border-border text-primary"
                        />
                        Require evaluating capstone projects
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: Review & Finalize */}
          {activeStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase select-none">Step 7 — Review Course package</h3>
              
              <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-3 font-semibold text-xs text-foreground text-left">
                <div>Course Name: <strong className="text-foreground">{formTitle}</strong></div>
                <div>Learning Mode: <strong className="text-primary uppercase">{formLearningMode}</strong></div>
                <div>Difficulty: <span className="capitalize">{formLevel}</span></div>
                <div>Pricing: <strong>{formPriceType === "free" ? "FREE" : `₹${formPrice}`}</strong></div>
                
                <div className="border-t border-border/10 pt-3 space-y-1 text-muted-foreground">
                  <p className="font-extrabold uppercase text-[10px] text-foreground mb-1 select-none">Course Package Summary</p>
                  <div>✓ Interactive live class syllabus configured</div>
                  {formDoubtSessions && <div>✓ 4 Live Doubt Sessions / month enabled</div>}
                  {formCertificate && <div>✓ Course Certificate enabled ({formCertCompletionPct}% completion milestone)</div>}
                  {formCommunity && <div>✓ Community discussion channel attached</div>}
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Navigation Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-border/40 select-none">
            <Button
              type="button"
              variant="outline"
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="h-8.5 text-xs font-bold"
            >
              Previous
            </Button>
            
            {activeStep < 7 ? (
              <Button
                type="button"
                onClick={() => setActiveStep(prev => prev + 1)}
                className="h-8.5 text-xs bg-primary text-white font-bold border-none"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSaveCourseWizard}
                className="h-8.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-none"
              >
                {editingCourseId ? "Save Changes" : "Create Package"}
              </Button>
            )}
          </div>

        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="course-listing"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 text-left pb-16"
    >
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-primary/10 via-background to-background p-6 rounded-2xl border border-primary/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
            <Sparkles size={10} /> EduEarn Package Creator
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">Courses</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create, manage and grow your learning programs.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 select-none">
          <Button
            onClick={() => {
              setEditingCourseId(null);
              setFormTitle("");
              setFormSubtitle("");
              setFormDesc("");
              setFormLevel("beginner");
              setFormDuration("10 hours");
              setFormLanguage("English");
              setFormThumbnail("");
              setFormTags("");
              setFormLearningMode("Complete Package");
              setFormPriceType("paid");
              setFormPrice("999");
              setFormDoubtSessions(true);
              setFormCommunity(true);
              setFormCertificate(true);
              setLocalModules([
                {
                  id: "mod-1",
                  title: "Module 1 — Core Principles",
                  lessons: [
                    { id: "les-1", title: "Concept Overview & Setup", type: "Video", duration: "10 mins", preview: true }
                  ]
                }
              ]);
              setActiveStep(1);
              setIsCreatingCourse(true);
            }}
            size="sm"
            className="h-8.5 text-xs bg-primary text-white font-bold border-none"
          >
            + Create Course
          </Button>
          <Button
            onClick={() => toast.success("Import course wizard launched successfully!")}
            size="sm"
            variant="outline"
            className="h-8.5 text-xs font-bold border-border/80"
          >
            Import Course
          </Button>
          <Button
            onClick={() => toast.info("Redirecting to public instructor profile...")}
            size="sm"
            variant="outline"
            className="h-8.5 text-xs font-bold border-border/80"
          >
            View Public Profile
          </Button>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 select-none">
        {[
          { label: "Total Courses", value: kpiStats.total, icon: Layers, color: "text-primary bg-primary/10" },
          { label: "Published", value: kpiStats.published, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Drafts", value: kpiStats.drafts, icon: FileText, color: "text-amber-500 bg-amber-500/10" },
          { label: "Total Students", value: kpiStats.totalStudents, icon: Users, color: "text-sky-500 bg-sky-500/10" },
          { label: "Course Revenue", value: `₹${kpiStats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-teal-500 bg-teal-500/10" },
          { label: "Average Rating", value: `${kpiStats.avgRating} ★`, icon: Star, color: "text-purple-500 bg-purple-500/10" }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} variant="glass" className="p-3.5 border-border/60 hover:border-primary/20 transition flex items-center justify-between min-w-0">
              <div className="min-w-0 space-y-0.5 text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider truncate">{kpi.label}</p>
                <h4 className="text-lg font-black text-foreground">{kpi.value}</h4>
              </div>
              <span className={`p-1.5 rounded-lg shrink-0 ml-2 ${kpi.color}`}><Icon size={14} /></span>
            </Card>
          );
        })}
      </div>

      {/* Filters & Sorting Bar */}
      <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3 select-none">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="h-8.5 w-full pl-9 pr-3 rounded-xl border border-border bg-card/60 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        {/* Status filters horizontal group */}
        <div className="flex flex-wrap gap-1 border border-border/60 p-0.5 rounded-xl bg-muted/20">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-[10.5px] font-black uppercase transition-colors cursor-pointer border-none ${
                statusFilter === tab.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground bg-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters dropdowns */}
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
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Pricing</option>
          <option value="Free">Free</option>
          <option value="Paid">Paid</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="All">All Ratings</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
        </select>

        <select
          value={sortByFilter}
          onChange={(e) => setSortByFilter(e.target.value)}
          className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none ml-auto"
        >
          <option value="newest">Newest First</option>
          <option value="students">Most Students</option>
          <option value="revenue">Highest Revenue</option>
          <option value="rating">Highest Rated</option>
        </select>

      </Card>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isMenuOpen = openMenuId === course.id;
          return (
            <Card key={course.id} variant="glass" className="border-border/60 hover:border-primary/20 transition flex flex-col justify-between h-[360px] overflow-hidden text-left relative">
              
              {/* Card Top Details */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start select-none">
                    <span className="bg-primary/10 text-primary border border-primary/20 text-[8.5px] uppercase font-black px-2 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[8.5px] font-black uppercase text-indigo-500">{course.learningMode}</span>
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${
                        course.status === "published"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : course.status === "draft"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-extrabold text-sm text-foreground line-clamp-1 leading-snug">{course.title}</h4>
                  <p className="text-[10.5px] text-muted-foreground font-semibold line-clamp-2 leading-relaxed">{course.subtitle}</p>
                </div>

                {/* Hybrid counts details */}
                <div className="bg-muted/15 border border-border/40 p-2.5 rounded-xl grid grid-cols-3 gap-1.5 text-center text-[10px] font-extrabold text-muted-foreground select-none">
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">LIVE CLASSES</span>
                    <span className="text-foreground">{course.liveSessionsCount || 12} classes</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">RECORDINGS</span>
                    <span className="text-foreground">{course.recordedLessonsCount || 18} videos</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">DOUBTS</span>
                    <span className="text-foreground">{course.doubtSessionsCount || 4} rooms</span>
                  </div>
                </div>

                {/* Performance stats row */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-muted-foreground select-none border-t border-border/10 pt-3">
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">STUDENTS</span>
                    <span className="text-foreground font-black">{course.studentsCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">RATING</span>
                    <span className="text-amber-500 font-black">⭐ {course.rating ? course.rating.toFixed(1) : "5.0"}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">REVENUE</span>
                    <span className="text-emerald-500 font-black">₹{(course.revenueEarned ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions panel */}
              <div className="p-4 border-t border-border/10 flex gap-2 bg-muted/5 items-center select-none">
                <Button
                  onClick={() => setActiveBuilderCourseId(course.id)}
                  size="sm"
                  className="h-8 text-[10.5px] font-bold flex-1 bg-primary text-white border-none"
                >
                  Manage Syllabus
                </Button>
                <Button
                  onClick={() => handleStartEdit(course)}
                  size="sm"
                  variant="outline"
                  className="h-8 text-[10.5px] font-bold border-border/60 flex-1"
                >
                  Edit Details
                </Button>
                
                <Button
                  onClick={() => setSelectedCourseForAnalytics(course)}
                  size="sm"
                  variant="outline"
                  title="View Analytics"
                  className="h-8 w-8 p-0 border-border/60 shrink-0"
                >
                  <BarChart3 size={13} className="text-muted-foreground" />
                </Button>
                
                <Button
                  onClick={() => setSelectedCourseForPreview(course)}
                  size="sm"
                  variant="outline"
                  title="Student Preview"
                  className="h-8 w-8 p-0 border-border/60 shrink-0 text-indigo-500 hover:bg-indigo-500/5"
                >
                  <Eye size={13} />
                </Button>

                {/* Card actions more dropdown */}
                <div className="relative">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : course.id);
                    }}
                    variant="outline"
                    className="h-8 w-8 p-0 border-border/60 shrink-0"
                  >
                    <MoreVertical size={13} />
                  </Button>
                  {isMenuOpen && (
                    <div className="absolute right-0 bottom-full mb-1.5 bg-card border border-border rounded-xl shadow-floating py-1.5 w-32 z-30 font-semibold text-[10px]">
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          handleDuplicate(course);
                        }}
                        className="w-full px-3 py-1.5 text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition border-none bg-transparent cursor-pointer"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          handleArchive(course.id);
                        }}
                        className="w-full px-3 py-1.5 text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition border-none bg-transparent cursor-pointer"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          setShowConfirmDeleteCourse(course);
                        }}
                        className="w-full px-3 py-1.5 text-left text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 transition border-none bg-transparent cursor-pointer font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </Card>
          );
        })}
        {filteredCourses.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-muted-foreground italic select-none">
            No courses found matching selected filters.
          </div>
        )}
      </div>

      {/* PUBLIC PREVIEW DIALOG MODAL */}
      <AnimatePresence>
        {selectedCourseForPreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setSelectedCourseForPreview(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-lg bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-black uppercase text-foreground">
                    Public Student Preview
                  </h4>
                  <button
                    onClick={() => setSelectedCourseForPreview(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="aspect-video bg-muted/30 border border-border rounded-xl flex items-center justify-center relative overflow-hidden select-none">
                  {selectedCourseForPreview.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedCourseForPreview.thumbnail} alt={selectedCourseForPreview.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={48} className="text-muted-foreground/30 animate-pulse" />
                  )}
                  <span className="absolute top-3 right-3 bg-primary text-white text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full">
                    {selectedCourseForPreview.learningMode}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-foreground">{selectedCourseForPreview.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">{selectedCourseForPreview.subtitle}</p>
                </div>

                <div className="bg-primary/5 p-3.5 border border-primary/20 rounded-xl space-y-2 select-none text-[10.5px]">
                  <p className="font-extrabold uppercase text-[9px] text-primary tracking-wider">What Students get in this package:</p>
                  <div className="grid grid-cols-2 gap-1.5 font-bold text-muted-foreground leading-snug">
                    <div>✓ {selectedCourseForPreview.liveSessionsCount || 12} Live Classes</div>
                    <div>✓ {selectedCourseForPreview.recordedLessonsCount || 18} Recorded Lessons</div>
                    <div>✓ {selectedCourseForPreview.doubtSessionsCount || 4} Doubt Sessions</div>
                    <div>✓ {selectedCourseForPreview.resourcesCount || 8} Notes / handouts</div>
                    {selectedCourseForPreview.certificateEnabled && <div>✓ Completion Certificate</div>}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border/40 select-none">
                  <span className="text-lg font-black text-foreground">
                    {selectedCourseForPreview.price > 0 ? `₹${selectedCourseForPreview.price.toLocaleString()}` : "FREE"}
                  </span>
                  
                  <Button
                    onClick={() => {
                      setSelectedCourseForPreview(null);
                      toast.info("This is the instructor preview. Student checkout is not loaded.");
                    }}
                    className="h-8.5 text-xs bg-primary text-white font-bold border-none"
                  >
                    Enroll Now (Student View)
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ANALYTICS PERFORMANCE OVERVIEW MODAL */}
      <AnimatePresence>
        {selectedCourseForAnalytics && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setSelectedCourseForAnalytics(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-lg bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h4 className="text-sm font-black uppercase text-foreground">
                    Course Performance Analytics
                  </h4>
                  <button
                    onClick={() => setSelectedCourseForAnalytics(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Time filter selectors */}
                <div className="flex justify-between items-center select-none border-b border-border/10 pb-2">
                  <span className="text-[10.5px] font-extrabold text-foreground">{selectedCourseForAnalytics.title}</span>
                  
                  <div className="flex bg-muted/40 p-0.5 rounded-xl border border-border/20 text-[9px] font-black uppercase tracking-wider">
                    {["7d", "28d", "90d", "1y"].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setAnalyticsTimeframe(tf as any)}
                        className={`px-2.5 py-1 rounded-lg cursor-pointer border-none ${analyticsTimeframe === tf ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground bg-transparent"}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid performance card metrics */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-[10.5px] select-none font-bold text-muted-foreground leading-normal">
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">VIEWS</span>
                    <span className="text-foreground text-sm font-black">2,482</span>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">STUDENTS</span>
                    <span className="text-foreground text-sm font-black">{selectedCourseForAnalytics.studentsCount}</span>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">REVENUE</span>
                    <span className="text-emerald-500 text-sm font-black">₹{(selectedCourseForAnalytics.revenueEarned ?? 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Custom SVG line chart trend performance mockup */}
                <div className="bg-muted/15 border border-border/40 rounded-2xl p-4 flex flex-col justify-center select-none">
                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block mb-3 text-left">Enrollments Performance Trend</span>
                  
                  <div className="w-full h-24 relative flex items-end">
                    <svg className="w-full h-full text-primary" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path
                        d="M 0 25 Q 20 18 40 22 T 80 5 T 100 12 L 100 30 L 0 30 Z"
                        fill="currentColor"
                        fillOpacity="0.06"
                      />
                      <path
                        d="M 0 25 Q 20 18 40 22 T 80 5 T 100 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-border/40 select-none">
                  <Button
                    onClick={() => {
                      setSelectedCourseForAnalytics(null);
                      toast.info("Navigating to comprehensive Instructor Analytics portal...");
                    }}
                    className="h-8 bg-primary text-white text-[10px] font-bold border-none"
                  >
                    View Full Analytics
                  </Button>
                  <Button
                    onClick={() => setSelectedCourseForAnalytics(null)}
                    variant="outline"
                    className="h-8 text-[10px] font-bold"
                  >
                    Close Dialog
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE COURSE DIALOG */}
      <AnimatePresence>
        {showConfirmDeleteCourse && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/45 backdrop-blur-sm"
              onClick={() => setShowConfirmDeleteCourse(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[80vh] w-[90%] max-w-sm bg-card border border-rose-500/25 rounded-2xl p-5 shadow-floating space-y-4 text-left"
            >
              <div className="space-y-4 text-xs font-semibold text-foreground leading-relaxed">
                <div className="flex items-center gap-2 text-rose-500 border-b border-border/60 pb-2">
                  <AlertTriangle size={18} />
                  <h4 className="text-sm font-black uppercase text-rose-500">Confirm Deletion</h4>
                </div>

                <p>
                  Are you absolutely sure you want to delete the course <strong className="text-foreground">"{showConfirmDeleteCourse.title}"</strong>?
                  This action is permanent and will delete all curriculum, assignments, and quizzes.
                </p>

                <div className="flex gap-2 justify-end pt-2 border-t border-border/40 select-none">
                  <Button
                    onClick={() => handleDelete(showConfirmDeleteCourse.id)}
                    className="h-8.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold border-none"
                  >
                    Delete Course
                  </Button>
                  <Button
                    onClick={() => setShowConfirmDeleteCourse(null)}
                    variant="outline"
                    className="h-8.5 text-xs font-bold"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CURRICULUM ITEM ASSETS LINKERS */}
      {/* LINK LIVE CLASS MODAL */}
      <AnimatePresence>
        {showLinkLiveModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowLinkLiveModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[75vh] w-[90%] max-w-md bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <div className="space-y-4 text-xs font-semibold text-foreground">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h4 className="text-xs font-black uppercase">Link Scheduled Live Class</h4>
                  <button onClick={() => setShowLinkLiveModal(false)} className="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {liveSessions.filter(s => s.status !== "Completed").map(session => (
                    <div
                      key={session.id}
                      onClick={() => handleLinkLiveSubmit(session)}
                      className="p-3 bg-muted/20 border border-border/60 rounded-xl cursor-pointer hover:border-primary/20 hover:bg-primary/[0.01] transition flex justify-between items-center text-left"
                    >
                      <div>
                        <h5 className="font-extrabold">{session.title}</h5>
                        <p className="text-[10px] text-muted-foreground">{session.time}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded">Link</span>
                    </div>
                  ))}
                  {liveSessions.filter(s => s.status !== "Completed").length === 0 && (
                    <p className="text-[10.5px] text-muted-foreground italic text-center py-4 select-none">No upcoming live classes scheduled. Add one in the Live Classes tab first.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LINK RECORDED CLASS MODAL */}
      <AnimatePresence>
        {showLinkRecordingModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowLinkRecordingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[75vh] w-[90%] max-w-md bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <div className="space-y-4 text-xs font-semibold text-foreground">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h4 className="text-xs font-black uppercase">Link Completed Recording</h4>
                  <button onClick={() => setShowLinkRecordingModal(false)} className="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {liveSessions.filter(s => s.status === "Completed" || s.recordingUrl).map(session => (
                    <div
                      key={session.id}
                      onClick={() => handleLinkRecordingSubmit(session)}
                      className="p-3 bg-muted/20 border border-border/60 rounded-xl cursor-pointer hover:border-indigo-500/20 hover:bg-indigo-500/[0.01] transition flex justify-between items-center text-left"
                    >
                      <div>
                        <h5 className="font-extrabold">{session.title}</h5>
                        <p className="text-[10px] text-muted-foreground">Recorded • {session.duration || "90 mins"}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">Link</span>
                    </div>
                  ))}
                  {liveSessions.filter(s => s.status === "Completed" || s.recordingUrl).length === 0 && (
                    <p className="text-[10.5px] text-muted-foreground italic text-center py-4 select-none">No completed recordings found. Upload or finalize classes first.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LINK NOTE RESOURCE MODAL */}
      <AnimatePresence>
        {showLinkResourceModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowLinkResourceModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[75vh] w-[90%] max-w-md bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <div className="space-y-4 text-xs font-semibold text-foreground">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h4 className="text-xs font-black uppercase">Link Handout Note Resource</h4>
                  <button onClick={() => setShowLinkResourceModal(false)} className="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {mediaFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => handleLinkResourceSubmit(file)}
                      className="p-3 bg-muted/20 border border-border/60 rounded-xl cursor-pointer hover:border-primary/20 hover:bg-primary/[0.01] transition flex justify-between items-center text-left"
                    >
                      <div>
                        <h5 className="font-extrabold">{file.name}</h5>
                        <p className="text-[10px] text-muted-foreground">{file.type} • {file.size}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded">Link</span>
                    </div>
                  ))}
                  {mediaFiles.length === 0 && (
                    <p className="text-[10.5px] text-muted-foreground italic text-center py-4 select-none">No resource handouts found. Add documents in the Resources tab first.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE ASSIGNMENT MODAL */}
      <AnimatePresence>
        {showCreateAssignmentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowCreateAssignmentModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-sm bg-card border border-border rounded-2xl p-5 shadow-floating space-y-4 text-left"
            >
              <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h4 className="text-xs font-black uppercase">Create Course Assignment</h4>
                  <button type="button" onClick={() => setShowCreateAssignmentModal(false)} className="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label>Assignment Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Loops & Expressions practicesheet"
                      value={newAssignmentTitle}
                      onChange={e => setNewAssignmentTitle(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label>Instructions Description</label>
                    <textarea
                      rows={3}
                      placeholder="Add homework description..."
                      value={newAssignmentDesc}
                      onChange={e => setNewAssignmentDesc(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl p-2.5 focus:outline-none text-xs font-semibold text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-border/40 select-none">
                  <Button type="submit" className="h-8 bg-primary text-white text-[10px] font-bold border-none">Attach Assignment</Button>
                  <Button type="button" onClick={() => setShowCreateAssignmentModal(false)} variant="outline" className="h-8 text-[10px] font-bold">Cancel</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE QUIZ MODAL */}
      <AnimatePresence>
        {showCreateQuizModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowCreateQuizModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-sm bg-card border border-border rounded-2xl p-5 shadow-floating space-y-4 text-left"
            >
              <form onSubmit={handleCreateQuizSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h4 className="text-xs font-black uppercase">Create Assessment Quiz</h4>
                  <button type="button" onClick={() => setShowCreateQuizModal(false)} className="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label>Quiz Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Module 1 Basics Quiz"
                      value={newQuizTitle}
                      onChange={e => setNewQuizTitle(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label>Number of Questions</label>
                      <input
                        type="number"
                        value={newQuizQuestions}
                        onChange={e => setNewQuizQuestions(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label>Passing Score (%)</label>
                      <input
                        type="number"
                        value={newQuizPassScore}
                        onChange={e => setNewQuizPassScore(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-border/40 select-none">
                  <Button type="submit" className="h-8 bg-primary text-white text-[10px] font-bold border-none">Attach Quiz</Button>
                  <Button type="button" onClick={() => setShowCreateQuizModal(false)} variant="outline" className="h-8 text-[10px] font-bold">Cancel</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {showCreateProjectModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowCreateProjectModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-sm bg-card border border-border rounded-2xl p-5 shadow-floating space-y-4 text-left"
            >
              <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h4 className="text-xs font-black uppercase">Create Capstone Project</h4>
                  <button type="button" onClick={() => setShowCreateProjectModal(false)} className="text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Build a CLI Calculator"
                      value={newProjectTitle}
                      onChange={e => setNewProjectTitle(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label>Project Requirements / Guidelines</label>
                    <textarea
                      rows={3}
                      placeholder="Enter project requirements..."
                      value={newProjectDesc}
                      onChange={e => setNewProjectDesc(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl p-2.5 focus:outline-none text-xs font-semibold text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-border/40 select-none">
                  <Button type="submit" className="h-8 bg-primary text-white text-[10px] font-bold border-none">Attach Project</Button>
                  <Button type="button" onClick={() => setShowCreateProjectModal(false)} variant="outline" className="h-8 text-[10px] font-bold">Cancel</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
});
