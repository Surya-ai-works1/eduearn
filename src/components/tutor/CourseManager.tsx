"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { NoCourses } from "./EmptyState";
import type { TutorCourse, CurriculumModule, CurriculumLesson } from "./types";
import { QuizQuestion } from "../../lib/types/quizManagement";
import { MarketplaceService } from "../../features/payments/services/marketplaceService";

type CourseStatus = "all" | "published" | "draft" | "pending" | "archived";

const STATUS_TABS: { id: CourseStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "pending", label: "Pending" },
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
  setLessonForm: React.Dispatch<React.SetStateAction<{ title: string; type: "Video" | "PDF" | "Quiz" | "Assignment"; duration: string }>>;
  isAutoSaving: boolean;
  courseForm: { title: string; category: string; price: number; level: string; duration: string; seoKeywords: string; subtitle?: string; description?: string; language?: string; thumbnail?: string; status?: string; tags?: string[] };
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
  const [statusFilter, setStatusFilter] = useState<CourseStatus>("all");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [lessonFormState, setLessonFormState] = useState({
    title: "",
    description: "",
    lessonType: "Video",
    videoUrl: "",
    duration: 10,
    order: 1,
    resources: [] as string[],
    status: "published" as "published" | "draft",
  });
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const [builderTab, setBuilderTab] = useState<"lessons" | "assignments" | "quizzes">("lessons");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [assignmentsTotalPages, setAssignmentsTotalPages] = useState(1);
  const [assignmentsSearch, setAssignmentsSearch] = useState("");
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentFormState, setAssignmentFormState] = useState({
    title: "",
    description: "",
    fileUrl: "",
    dueDate: "",
    status: "published" as "published" | "draft",
  });

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [quizzesTotalPages, setQuizzesTotalPages] = useState(1);
  const [quizzesSearch, setQuizzesSearch] = useState("");
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizFormState, setQuizFormState] = useState({
    title: "",
    description: "",
    passingScore: 60,
    timeLimit: 30,
    status: "published" as "published" | "draft",
  });

  const [activeQuestionsQuizId, setActiveQuestionsQuizId] = useState<string | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionFormState, setQuestionFormState] = useState({
    text: "",
    type: "single" as "single" | "multiple",
    options: ["Option 1", "Option 2"] as string[],
    correctAnswers: [0] as number[],
    explanation: "",
  });

  const fetchQuizzes = useCallback(async () => {
    if (!activeBuilderCourseId || builderTab !== "quizzes") return;
    try {
      setQuizzesLoading(true);
      const res = await fetch(
        `/api/tutor/courses/${activeBuilderCourseId}/quizzes?page=${quizzesPage}&search=${encodeURIComponent(quizzesSearch)}`
      );
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.items || []);
        setQuizzesTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.warn("Failed to load course quizzes:", err);
    } finally {
      setQuizzesLoading(false);
    }
  }, [activeBuilderCourseId, builderTab, quizzesPage, quizzesSearch]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const fetchAssignments = useCallback(async () => {
    if (!activeBuilderCourseId || builderTab !== "assignments") return;
    try {
      setAssignmentsLoading(true);
      const res = await fetch(
        `/api/tutor/courses/${activeBuilderCourseId}/assignments?page=${assignmentsPage}&search=${encodeURIComponent(assignmentsSearch)}`
      );
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.items || []);
        setAssignmentsTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.warn("Failed to load course assignments:", err);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [activeBuilderCourseId, builderTab, assignmentsPage, assignmentsSearch]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filteredCourses = useMemo(
    () =>
      statusFilter === "all"
        ? myCourses
        : myCourses.filter((c) => c.status === statusFilter),
    [myCourses, statusFilter]
  );

  const handleDuplicate = useCallback(
    async (c: TutorCourse) => {
      try {
        const body = {
          title: `${c.title} (Copy)`,
          subtitle: (c as any).subtitle || "",
          description: (c as any).description || "",
          category: c.category,
          level: c.level,
          language: (c as any).language || "English",
          thumbnail: (c as any).thumbnail || "",
          price: c.price,
          status: "draft",
          tags: (c as any).tags || [],
        };
        const res = await fetch("/api/tutor/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const newCourse = await res.json();
          setMyCourses((prev) => [newCourse, ...prev]);
          toast.success("Course duplicated.");
        } else {
          toast.error("Failed to duplicate course.");
        }
      } catch (err) {
        toast.error("Error duplicating course.");
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
        toast.error("Error archiving course.");
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
          toast.success("Course deleted.");
        } else {
          toast.error("Failed to delete course.");
        }
      } catch (err) {
        toast.error("Error deleting course.");
      }
    },
    [setMyCourses]
  );

  const handlePublish = useCallback(
    async (id: string, currentStatus: string) => {
      if (appStatus === "suspended") {
        toast.error("Action denied: Account suspended.");
        return;
      }
      const nextStatus = currentStatus === "draft" ? "pending" : "published";
      try {
        const res = await fetch(`/api/tutor/courses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (res.ok) {
          setMyCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus as TutorCourse["status"] } : c)));
          toast.success(nextStatus === "pending" ? "Submitted for review!" : "Course published!");
        } else {
          const errData = await res.json();
          toast.error(errData.error || "Failed to publish course.");
        }
      } catch (err) {
        toast.error("Error publishing course.");
      }
    },
    [appStatus, setMyCourses]
  );

  // ─── Lesson Management Helpers ─────────────────────────────────────────────
  const handleMoveLesson = useCallback(
    async (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= lessons.length) return;

      const newLessons = [...lessons];
      const temp = newLessons[index];
      newLessons[index] = newLessons[targetIndex];
      newLessons[targetIndex] = temp;

      // Optimistically update local state
      setLessons(newLessons);

      try {
        const orderedIds = newLessons.map((l) => l.id);
        const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/lessons`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        });
        if (!res.ok) {
          toast.error("Failed to save new lesson order.");
        }
      } catch (err) {
        toast.error("Error updating lesson order.");
      }
    },
    [lessons, activeBuilderCourseId, setLessons]
  );

  const handleDeleteLesson = useCallback(
    async (lessonId: string) => {
      try {
        const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/lessons/${lessonId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setLessons((prev) => prev.filter((l) => l.id !== lessonId));
          toast.success("Lesson deleted.");
        } else {
          toast.error("Failed to delete lesson.");
        }
      } catch (err) {
        toast.error("Error deleting lesson.");
      }
    },
    [activeBuilderCourseId, setLessons]
  );

  const handleToggleLessonStatus = useCallback(
    async (lesson: any) => {
      const nextStatus = lesson.status === "published" ? "draft" : "published";
      try {
        const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/lessons/${lesson.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (res.ok) {
          setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, status: nextStatus } : l)));
          toast.success(`Lesson status updated to ${nextStatus}.`);
        } else {
          toast.error("Failed to update status.");
        }
      } catch (err) {
        toast.error("Error updating lesson status.");
      }
    },
    [activeBuilderCourseId, setLessons]
  );
  // ─── Assignment Management Helpers ─────────────────────────────────────────
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentFormState.title.trim()) {
      toast.error("Assignment title is required.");
      return;
    }

    const body = {
      title: assignmentFormState.title,
      description: assignmentFormState.description,
      fileUrl: assignmentFormState.fileUrl,
      dueDate: assignmentFormState.dueDate || null,
      status: assignmentFormState.status,
    };

    try {
      if (editingAssignmentId) {
        const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/assignments/${editingAssignmentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success("Assignment updated successfully.");
          setEditingAssignmentId(null);
          fetchAssignments();
        } else {
          const errData = await res.json();
          toast.error(errData.error || "Failed to update assignment.");
        }
      } else {
        const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success("Assignment created successfully.");
          setIsCreatingAssignment(false);
          fetchAssignments();
        } else {
          const errData = await res.json();
          toast.error(errData.error || "Failed to create assignment.");
        }
      }
    } catch (err) {
      toast.error("Error saving assignment.");
    }
  };

  const handleDeleteAssignment = async (assignId: string) => {
    try {
      const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/assignments/${assignId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Assignment deleted.");
        fetchAssignments();
      } else {
        toast.error("Failed to delete assignment.");
      }
    } catch (err) {
      toast.error("Error deleting assignment.");
    }
  };

  // ─── Quiz Management Helpers ───────────────────────────────────────────────
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizFormState.title.trim()) {
      toast.error("Quiz title is required.");
      return;
    }

    const body = {
      title: quizFormState.title,
      description: quizFormState.description,
      passingScore: Number(quizFormState.passingScore),
      timeLimit: Number(quizFormState.timeLimit),
      status: quizFormState.status,
    };

    try {
      if (editingQuizId) {
        const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/quizzes/${editingQuizId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success("Quiz updated successfully.");
          setEditingQuizId(null);
          fetchQuizzes();
        } else {
          const errData = await res.json();
          toast.error(errData.error || "Failed to update quiz.");
        }
      } else {
        const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/quizzes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success("Quiz created successfully.");
          setIsCreatingQuiz(false);
          fetchQuizzes();
        } else {
          const errData = await res.json();
          toast.error(errData.error || "Failed to create quiz.");
        }
      }
    } catch (err) {
      toast.error("Error saving quiz.");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Quiz deleted.");
        fetchQuizzes();
      } else {
        toast.error("Failed to delete quiz.");
      }
    } catch (err) {
      toast.error("Error deleting quiz.");
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionFormState.text.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (questionFormState.options.length < 2) {
      toast.error("At least 2 options are required.");
      return;
    }
    if (questionFormState.correctAnswers.length === 0) {
      toast.error("Select at least 1 correct answer.");
      return;
    }

    const activeQuiz = quizzes.find((q) => q.id === activeQuestionsQuizId);
    if (!activeQuiz) return;

    let updatedQuestions = [...(activeQuiz.questions || [])];

    const newQuestion = {
      id: editingQuestionId || `q-${Date.now()}`,
      text: questionFormState.text,
      type: questionFormState.type,
      options: questionFormState.options,
      correctAnswers: questionFormState.correctAnswers,
      explanation: questionFormState.explanation,
    };

    if (editingQuestionId) {
      updatedQuestions = updatedQuestions.map((q: any) => (q.id === editingQuestionId ? newQuestion : q));
    } else {
      updatedQuestions.push(newQuestion);
    }

    try {
      const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/quizzes/${activeQuestionsQuizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: updatedQuestions }),
      });
      if (res.ok) {
        toast.success(editingQuestionId ? "Question updated." : "Question added.");
        setEditingQuestionId(null);
        setIsCreatingQuestion(false);
        fetchQuizzes();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to save question.");
      }
    } catch (err) {
      toast.error("Error saving question.");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    const activeQuiz = quizzes.find((q) => q.id === activeQuestionsQuizId);
    if (!activeQuiz) return;

    const updatedQuestions = (activeQuiz.questions || []).filter((q: any) => q.id !== qId);

    try {
      const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/quizzes/${activeQuestionsQuizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: updatedQuestions }),
      });
      if (res.ok) {
        toast.success("Question deleted.");
        fetchQuizzes();
      } else {
        toast.error("Failed to delete question.");
      }
    } catch (err) {
      toast.error("Error deleting question.");
    }
  };

  // Lesson & Assignment & Quiz Manager View
  if (activeBuilderCourseId) {
    const handleSaveLesson = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!lessonFormState.title.trim()) {
        toast.error("Lesson title is required.");
        return;
      }
      if (lessonFormState.order <= 0) {
        toast.error("Lesson order must be greater than 0.");
        return;
      }

      // Check duplicate order
      if (lessons.some((l) => l.id !== editingLessonId && l.order === Number(lessonFormState.order))) {
        toast.error(`Duplicate order: Lesson order ${lessonFormState.order} is already taken.`);
        return;
      }

      const body = {
        title: lessonFormState.title,
        description: lessonFormState.description,
        lessonType: lessonFormState.lessonType,
        videoUrl: lessonFormState.videoUrl,
        duration: Number(lessonFormState.duration),
        order: Number(lessonFormState.order),
        resources: lessonFormState.resources,
        status: lessonFormState.status,
      };

      try {
        if (editingLessonId) {
          const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/lessons/${editingLessonId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const updated = await res.json();
            setLessons((prev) => prev.map((l) => (l.id === editingLessonId ? updated : l)).sort((a, b) => a.order - b.order));
            toast.success("Lesson updated successfully.");
            setEditingLessonId(null);
          } else {
            const errData = await res.json();
            toast.error(errData.error || "Failed to update lesson.");
          }
        } else {
          const res = await fetch(`/api/tutor/courses/${activeBuilderCourseId}/lessons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const newLesson = await res.json();
            setLessons((prev) => [...prev, newLesson].sort((a, b) => a.order - b.order));
            toast.success("Lesson created successfully.");
            setIsCreatingLesson(false);
          } else {
            const errData = await res.json();
            toast.error(errData.error || "Failed to create lesson.");
          }
        }
      } catch (err) {
        toast.error("Error saving lesson.");
      }
    };

    const activeQuiz = quizzes.find((q) => q.id === activeQuestionsQuizId);

    return (
      <motion.div
        key="course-builder-workspace"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-5 text-left"
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <button
            onClick={() => {
              if (activeQuestionsQuizId) {
                setActiveQuestionsQuizId(null);
              } else {
                setActiveBuilderCourseId(null);
              }
            }}
            className="text-xs font-extrabold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer focus:outline-none transition-colors"
          >
            <ChevronLeft size={14} /> {activeQuestionsQuizId ? "Back to Quizzes" : "Back to Courses"}
          </button>

          {/* Tab Selector Buttons (hidden if managing quiz questions) */}
          {!activeQuestionsQuizId && (
            <div className="flex items-center gap-1 bg-muted/65 p-1 rounded-card border border-border/40">
              <button
                onClick={() => setBuilderTab("lessons")}
                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-md cursor-pointer transition-colors focus:outline-none ${
                  builderTab === "lessons" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                📚 Lessons ({lessons.length})
              </button>
              <button
                onClick={() => setBuilderTab("assignments")}
                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-md cursor-pointer transition-colors focus:outline-none ${
                  builderTab === "assignments" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                📝 Assignments
              </button>
              <button
                onClick={() => setBuilderTab("quizzes")}
                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-md cursor-pointer transition-colors focus:outline-none ${
                  builderTab === "quizzes" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ❓ Quizzes ({quizzes.length})
              </button>
            </div>
          )}
        </div>

        {/* ─── TABS VIEW 1: LESSONS ────────────────────────────────────────── */}
        {!activeQuestionsQuizId && builderTab === "lessons" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wide">
                Course Syllabus Lessons
              </h3>
              <Button
                onClick={() => {
                  const nextOrder = lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1;
                  setLessonFormState({
                    title: "",
                    description: "",
                    lessonType: "Video",
                    videoUrl: "",
                    duration: 10,
                    order: nextOrder,
                    resources: [],
                    status: "published",
                  });
                  setEditingLessonId(null);
                  setIsCreatingLesson(true);
                }}
                size="sm"
                className="h-8 text-[11px] gap-1 shadow-soft"
              >
                <Plus size={12} /> Add Lesson
              </Button>
            </div>

            {lessonsLoading ? (
              <div className="flex items-center justify-center p-12 text-xs text-muted-foreground">
                <span className="animate-spin mr-2">⏳</span> Loading course lessons...
              </div>
            ) : lessons.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground bg-card/40 border border-dashed border-border flex flex-col items-center gap-3">
                <span>📚 No lessons exist in this course.</span>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="card-surface rounded-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/50 hover:border-border transition-colors shadow-soft"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex flex-col gap-1 mt-0.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveLesson(idx, "up")}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 cursor-pointer focus:outline-none"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          disabled={idx === lessons.length - 1}
                          onClick={() => handleMoveLesson(idx, "down")}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 cursor-pointer focus:outline-none"
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold bg-muted text-foreground px-2 py-0.5 rounded border border-border/40 select-none">
                            Order #{lesson.order}
                          </span>
                          <span className="text-[9px] font-extrabold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded select-none">
                            {lesson.lessonType}
                          </span>
                          <button
                            onClick={() => handleToggleLessonStatus(lesson)}
                            className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border select-none cursor-pointer ${
                              lesson.status === "published"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                            }`}
                          >
                            {lesson.status}
                          </button>
                        </div>

                        <h4 className="text-xs font-heading font-extrabold text-foreground leading-snug mt-1 truncate">
                          {lesson.title}
                        </h4>

                        {lesson.description && (
                          <p className="text-[10px] text-muted-foreground line-clamp-1 leading-normal">
                            {lesson.description}
                          </p>
                        )}

                        {lesson.videoUrl && (
                          <span className="text-[9px] text-muted-foreground/80 flex items-center gap-1 mt-1 truncate max-w-sm">
                            <Video size={10} className="text-primary shrink-0" />
                            {lesson.videoUrl}
                          </span>
                        )}

                        {lesson.resources && lesson.resources.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[8px] font-extrabold text-muted-foreground uppercase flex items-center gap-0.5">
                              <Link size={8} /> Attachments:
                            </span>
                            {lesson.resources.map((r: string, rIdx: number) => (
                              <a
                                key={rIdx}
                                href={r}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[8px] bg-muted/60 hover:bg-muted text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5 max-w-[120px] truncate"
                              >
                                Attachment {rIdx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <span className="text-[10px] font-bold text-muted-foreground/80 pr-2 select-none">
                        ⏱️ {lesson.duration} mins
                      </span>

                      {lesson.videoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[9px] px-2"
                          onClick={() => setPreviewVideoUrl(lesson.videoUrl)}
                        >
                          <Eye size={10} className="mr-1" /> Preview
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[9px] px-2"
                        onClick={() => {
                          setLessonFormState({
                            title: lesson.title,
                            description: lesson.description || "",
                            lessonType: lesson.lessonType || "Video",
                            videoUrl: lesson.videoUrl || "",
                            duration: lesson.duration || 10,
                            order: lesson.order || 1,
                            resources: lesson.resources || [],
                            status: lesson.status || "published",
                          });
                          setEditingLessonId(lesson.id);
                          setIsCreatingLesson(false);
                        }}
                      >
                        <Edit2 size={10} className="mr-1" /> Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[9px] px-2 text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40"
                        onClick={() => handleDeleteLesson(lesson.id)}
                      >
                        <Trash2 size={10} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TABS VIEW 2: ASSIGNMENTS ────────────────────────────────────── */}
        {!activeQuestionsQuizId && builderTab === "assignments" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 max-w-sm flex-1">
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={assignmentsSearch}
                  onChange={(e) => {
                    setAssignmentsSearch(e.target.value);
                    setAssignmentsPage(1);
                  }}
                  className="h-8 w-full rounded-input border border-border bg-card px-3 text-[11px] font-semibold text-foreground focus:outline-none"
                />
              </div>

              <Button
                onClick={() => {
                  setAssignmentFormState({
                    title: "",
                    description: "",
                    fileUrl: "",
                    dueDate: "",
                    status: "published",
                  });
                  setEditingAssignmentId(null);
                  setIsCreatingAssignment(true);
                }}
                size="sm"
                className="h-8 text-[11px] gap-1 shadow-soft shrink-0"
              >
                <Plus size={12} /> Add Assignment
              </Button>
            </div>

            {assignmentsLoading ? (
              <div className="flex items-center justify-center p-12 text-xs text-muted-foreground">
                <span className="animate-spin mr-2">⏳</span> Loading course assignments...
              </div>
            ) : assignments.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground bg-card/40 border border-dashed border-border flex flex-col items-center gap-3">
                <span>📝 No assignments exist matching constraints.</span>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="card-surface rounded-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/50 hover:border-border transition-colors shadow-soft text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {assignment.dueDate && (
                          <span className="text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded select-none">
                            🗓️ Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border select-none ${
                          assignment.status === "published"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                        }`}>
                          {assignment.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-heading font-extrabold text-foreground leading-snug mt-1.5 truncate">
                        {assignment.title}
                      </h4>

                      {assignment.description && (
                        <p className="text-[10px] text-muted-foreground mt-1 leading-normal whitespace-pre-line">
                          {assignment.description}
                        </p>
                      )}

                      {assignment.fileUrl && (
                        <a
                          href={assignment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-primary/95 hover:underline flex items-center gap-1 mt-2.5 max-w-sm truncate"
                        >
                          <FileText size={11} className="shrink-0" />
                          Attachment: {assignment.fileUrl}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[9px] px-2"
                        onClick={() => {
                          setAssignmentFormState({
                            title: assignment.title,
                            description: assignment.description || "",
                            fileUrl: assignment.fileUrl || "",
                            dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 10) : "",
                            status: assignment.status || "published",
                          });
                          setEditingAssignmentId(assignment.id);
                          setIsCreatingAssignment(false);
                        }}
                      >
                        <Edit2 size={10} className="mr-1" /> Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[9px] px-2 text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        <Trash2 size={10} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {assignmentsTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-[10px] font-bold"
                      disabled={assignmentsPage === 1}
                      onClick={() => setAssignmentsPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-[10px] font-extrabold text-foreground select-none">
                      Page {assignmentsPage} of {assignmentsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-[10px] font-bold"
                      disabled={assignmentsPage === assignmentsTotalPages}
                      onClick={() => setAssignmentsPage((p) => Math.min(assignmentsTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TABS VIEW 3: QUIZZES ────────────────────────────────────────── */}
        {!activeQuestionsQuizId && builderTab === "quizzes" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 max-w-sm flex-1">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={quizzesSearch}
                  onChange={(e) => {
                    setQuizzesSearch(e.target.value);
                    setQuizzesPage(1);
                  }}
                  className="h-8 w-full rounded-input border border-border bg-card px-3 text-[11px] font-semibold text-foreground focus:outline-none"
                />
              </div>

              <Button
                onClick={() => {
                  setQuizFormState({
                    title: "",
                    description: "",
                    passingScore: 60,
                    timeLimit: 30,
                    status: "published",
                  });
                  setEditingQuizId(null);
                  setIsCreatingQuiz(true);
                }}
                size="sm"
                className="h-8 text-[11px] gap-1 shadow-soft shrink-0"
              >
                <Plus size={12} /> Add Quiz
              </Button>
            </div>

            {quizzesLoading ? (
              <div className="flex items-center justify-center p-12 text-xs text-muted-foreground">
                <span className="animate-spin mr-2">⏳</span> Loading course quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground bg-card/40 border border-dashed border-border flex flex-col items-center gap-3">
                <span>❓ No quizzes exist matching constraints.</span>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="card-surface rounded-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/50 hover:border-border transition-colors shadow-soft text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded select-none">
                          Passing: {quiz.passingScore}%
                        </span>
                        <span className="text-[10px] font-extrabold bg-muted text-foreground border border-border/40 px-2 py-0.5 rounded select-none">
                          ⏱️ {quiz.timeLimit} mins
                        </span>
                        <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded select-none">
                          💡 {quiz.questions?.length || 0} Questions
                        </span>
                      </div>

                      <h4 className="text-xs font-heading font-extrabold text-foreground leading-snug mt-1.5 truncate">
                        {quiz.title}
                      </h4>

                      {quiz.description && (
                        <p className="text-[10px] text-muted-foreground mt-1 leading-normal whitespace-pre-line">
                          {quiz.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[9px] px-2"
                        onClick={() => setActiveQuestionsQuizId(quiz.id)}
                      >
                        <Sparkles size={10} className="mr-1" /> Questions
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[9px] px-2"
                        onClick={() => {
                          setQuizFormState({
                            title: quiz.title,
                            description: quiz.description || "",
                            passingScore: quiz.passingScore || 60,
                            timeLimit: quiz.timeLimit || 30,
                            status: quiz.status || "published",
                          });
                          setEditingQuizId(quiz.id);
                          setIsCreatingQuiz(false);
                        }}
                      >
                        <Edit2 size={10} className="mr-1" /> Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[9px] px-2 text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <Trash2 size={10} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {quizzesTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-[10px] font-bold"
                      disabled={quizzesPage === 1}
                      onClick={() => setQuizzesPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-[10px] font-extrabold text-foreground select-none">
                      Page {quizzesPage} of {quizzesTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-[10px] font-bold"
                      disabled={quizzesPage === quizzesTotalPages}
                      onClick={() => setQuizzesPage((p) => Math.min(quizzesTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── NESTED VIEW: MANAGE QUESTIONS (for selected quiz) ─────────────── */}
        {activeQuestionsQuizId && activeQuiz && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <div>
                <h3 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wide">
                  Quiz Questions: {activeQuiz.title}
                </h3>
                <p className="text-[9px] text-muted-foreground">
                  Manage questions, choices, explanations, and answers.
                </p>
              </div>

              <Button
                onClick={() => {
                  setQuestionFormState({
                    text: "",
                    type: "single",
                    options: ["Option 1", "Option 2"],
                    correctAnswers: [0],
                    explanation: "",
                  });
                  setEditingQuestionId(null);
                  setIsCreatingQuestion(true);
                }}
                size="sm"
                className="h-8 text-[11px] gap-1 shadow-soft"
              >
                <Plus size={12} /> Add Question
              </Button>
            </div>

            {(!activeQuiz.questions || activeQuiz.questions.length === 0) ? (
              <Card className="p-8 text-center text-xs text-muted-foreground bg-card/40 border border-dashed border-border flex flex-col items-center gap-3">
                <span>💡 No questions have been added to this quiz.</span>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {(activeQuiz.questions as QuizQuestion[]).map((question, qIdx) => (
                  <div
                    key={question.id}
                    className="card-surface rounded-card p-4 border border-border/50 hover:border-border transition-colors shadow-soft text-left space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded select-none">
                          Q#{qIdx + 1} &bull; {question.type === "single" ? "Single Choice" : "Multiple Choice"}
                        </span>
                        <h4 className="text-xs font-bold text-foreground mt-2 leading-relaxed">
                          {question.text}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[9px] px-2"
                          onClick={() => {
                            setQuestionFormState({
                              text: question.text,
                              type: question.type || "single",
                              options: question.options || ["Option 1", "Option 2"],
                              correctAnswers: question.correctAnswers || [0],
                              explanation: question.explanation || "",
                            });
                            setEditingQuestionId(question.id);
                            setIsCreatingQuestion(false);
                          }}
                        >
                          <Edit2 size={10} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[9px] px-2 text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 size={10} className="mr-1" /> Delete
                        </Button>
                      </div>
                    </div>

                    {/* Choices Options Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                      {question.options.map((opt: string, oIdx: number) => {
                        const isCorrect = question.correctAnswers.includes(oIdx);
                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded border text-xs font-semibold transition-colors flex items-center gap-2 ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600"
                                : "bg-muted/40 border-border/40 text-muted-foreground"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
                            <span className="truncate">{opt}</span>
                            {isCorrect && <span className="ml-auto text-[9px] font-extrabold uppercase">✓ Correct</span>}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="text-[10px] text-muted-foreground bg-muted/30 p-2.5 rounded border border-border/40 leading-relaxed whitespace-pre-line">
                        <strong className="text-foreground">Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── OVERLAYS & MODALS ───────────────────────────────────────────── */}

        {/* Modal: Create/Edit Lesson Form Overlay */}
        {(isCreatingLesson || editingLessonId) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card variant="glass" className="w-full max-w-md p-6 shadow-floating border border-border/80 relative">
              <form onSubmit={handleSaveLesson} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                    {editingLessonId ? "Edit Lesson Details" : "Create New Lesson"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingLesson(false);
                      setEditingLessonId(null);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={lessonFormState.title}
                    onChange={(e) => setLessonFormState((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Overview of Calculus Derivatives"
                    className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Description</label>
                  <textarea
                    value={lessonFormState.description}
                    onChange={(e) => setLessonFormState((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe lesson objectives..."
                    rows={2}
                    className="w-full rounded-input border border-border bg-card p-3 text-xs font-semibold text-foreground focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-foreground">Type</label>
                    <select
                      value={lessonFormState.lessonType}
                      onChange={(e) => setLessonFormState((f) => ({ ...f, lessonType: e.target.value }))}
                      className="h-9 w-full rounded-input border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Video">Video</option>
                      <option value="PDF">PDF</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Assignment">Assignment</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-foreground">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={lessonFormState.duration}
                      onChange={(e) => setLessonFormState((f) => ({ ...f, duration: Number(e.target.value) }))}
                      className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-foreground">Lesson Order *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={lessonFormState.order}
                      onChange={(e) => setLessonFormState((f) => ({ ...f, order: Number(e.target.value) }))}
                      className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-foreground">Status</label>
                    <select
                      value={lessonFormState.status}
                      onChange={(e) => setLessonFormState((f) => ({ ...f, status: e.target.value as "published" | "draft" }))}
                      className="h-9 w-full rounded-input border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Video URL</label>
                  <input
                    type="text"
                    value={lessonFormState.videoUrl}
                    onChange={(e) => setLessonFormState((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                    className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Resources (comma-separated URLs)</label>
                  <input
                    type="text"
                    value={lessonFormState.resources.join(", ")}
                    onChange={(e) => {
                      const urls = e.target.value.split(",").map((u) => u.trim()).filter((u) => u !== "");
                      setLessonFormState((f) => ({ ...f, resources: urls }));
                    }}
                    placeholder="https://example.com/slide.pdf"
                    className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingLesson(false);
                      setEditingLessonId(null);
                    }}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 text-xs shadow-soft">
                    {editingLessonId ? "Save Changes" : "Create Lesson"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Create/Edit Assignment Form Overlay */}
        {(isCreatingAssignment || editingAssignmentId) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card variant="glass" className="w-full max-w-md p-6 shadow-floating border border-border/80 relative">
              <form onSubmit={handleSaveAssignment} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                    {editingAssignmentId ? "Edit Assignment Details" : "Create New Assignment"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingAssignment(false);
                      setEditingAssignmentId(null);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={assignmentFormState.title}
                    onChange={(e) => setAssignmentFormState((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Solve Derivatives Practice Set 1"
                    className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Instructions (Description)</label>
                  <textarea
                    value={assignmentFormState.description}
                    onChange={(e) => setAssignmentFormState((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Provide instructions for the assignment..."
                    rows={4}
                    className="w-full rounded-input border border-border bg-card p-3 text-xs font-semibold text-foreground focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-foreground">Due Date</label>
                    <input
                      type="date"
                      value={assignmentFormState.dueDate}
                      onChange={(e) => setAssignmentFormState((f) => ({ ...f, dueDate: e.target.value }))}
                      className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-foreground">Status</label>
                    <select
                      value={assignmentFormState.status}
                      onChange={(e) => setAssignmentFormState((f) => ({ ...f, status: e.target.value as "published" | "draft" }))}
                      className="h-9 w-full rounded-input border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Attachment Link / File URL</label>
                  <input
                    type="text"
                    value={assignmentFormState.fileUrl}
                    onChange={(e) => setAssignmentFormState((f) => ({ ...f, fileUrl: e.target.value }))}
                    placeholder="https://example.com/slide.pdf"
                    className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingAssignment(false);
                      setEditingAssignmentId(null);
                    }}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 text-xs shadow-soft">
                    {editingAssignmentId ? "Save Changes" : "Create Assignment"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Create/Edit Quiz Form Overlay */}
        {(isCreatingQuiz || editingQuizId) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card variant="glass" className="w-full max-w-md p-6 shadow-floating border border-border/80 relative">
              <form onSubmit={handleSaveQuiz} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                    {editingQuizId ? "Edit Quiz Details" : "Create New Quiz"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingQuiz(false);
                      setEditingQuizId(null);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    value={quizFormState.title}
                    onChange={(e) => setQuizFormState((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Calculus Basics Test"
                    className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Quiz Description</label>
                  <textarea
                    value={quizFormState.description}
                    onChange={(e) => setQuizFormState((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Provide overview of the quiz topics..."
                    rows={3}
                    className="w-full rounded-input border border-border bg-card p-3 text-xs font-semibold text-foreground focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 text-xs text-left col-span-2">
                    <label className="font-bold text-foreground">Passing Score (%) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={quizFormState.passingScore}
                      onChange={(e) => setQuizFormState((f) => ({ ...f, passingScore: Number(e.target.value) }))}
                      className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-foreground">Time Limit (m) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quizFormState.timeLimit}
                      onChange={(e) => setQuizFormState((f) => ({ ...f, timeLimit: Number(e.target.value) }))}
                      className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs text-left">
                  <label className="font-bold text-foreground">Status</label>
                  <select
                    value={quizFormState.status}
                    onChange={(e) => setQuizFormState((f) => ({ ...f, status: e.target.value as "published" | "draft" }))}
                    className="h-9 w-full rounded-input border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingQuiz(false);
                      setEditingQuizId(null);
                    }}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 text-xs shadow-soft">
                    {editingQuizId ? "Save Changes" : "Create Quiz"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Add/Edit Quiz Question Overlay */}
        {(isCreatingQuestion || editingQuestionId) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card variant="glass" className="w-full max-w-lg p-6 shadow-floating border border-border/80 relative text-left">
              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                    {editingQuestionId ? "Edit Question" : "Add New Question"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingQuestion(false);
                      setEditingQuestionId(null);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Question Text *</label>
                  <input
                    type="text"
                    required
                    value={questionFormState.text}
                    onChange={(e) => setQuestionFormState((f) => ({ ...f, text: e.target.value }))}
                    placeholder="e.g. What is differentiation of x^3?"
                    className="h-9 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Question Type</label>
                  <select
                    value={questionFormState.type}
                    onChange={(e) => {
                      const typeVal = e.target.value as "single" | "multiple";
                      setQuestionFormState((f) => ({
                        ...f,
                        type: typeVal,
                        // Reset correct answers if changing to single choice
                        correctAnswers: typeVal === "single" ? [0] : [0],
                      }));
                    }}
                    className="h-9 w-full rounded-input border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="single">Single Choice (Radio)</option>
                    <option value="multiple">Multiple Choice (Checkbox)</option>
                  </select>
                </div>

                {/* Options List */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-foreground">Answer Choices (options) *</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-[9px] px-1.5"
                      onClick={() =>
                        setQuestionFormState((f) => ({
                          ...f,
                          options: [...f.options, `Option ${f.options.length + 1}`],
                        }))
                      }
                    >
                      + Add Option
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {questionFormState.options.map((opt, oIdx) => {
                      const isChecked = questionFormState.correctAnswers.includes(oIdx);
                      return (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type={questionFormState.type === "single" ? "radio" : "checkbox"}
                            name="correct-answer-selection"
                            checked={isChecked}
                            onChange={() => {
                              if (questionFormState.type === "single") {
                                setQuestionFormState((f) => ({ ...f, correctAnswers: [oIdx] }));
                              } else {
                                const newAnswers = isChecked
                                  ? questionFormState.correctAnswers.filter((a) => a !== oIdx)
                                  : [...questionFormState.correctAnswers, oIdx];
                                setQuestionFormState((f) => ({ ...f, correctAnswers: newAnswers }));
                              }
                            }}
                            className="w-3.5 h-3.5 accent-primary cursor-pointer"
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...questionFormState.options];
                              newOptions[oIdx] = e.target.value;
                              setQuestionFormState((f) => ({ ...f, options: newOptions }));
                            }}
                            placeholder={`Choice ${oIdx + 1}`}
                            className="h-8 rounded border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:outline-none flex-1"
                          />
                          {questionFormState.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = questionFormState.options.filter((_, idx) => idx !== oIdx);
                                // Shift correct answer indices accordingly
                                const newCorrect = questionFormState.correctAnswers
                                  .filter((idx) => idx !== oIdx)
                                  .map((idx) => (idx > oIdx ? idx - 1 : idx));

                                setQuestionFormState((f) => ({
                                  ...f,
                                  options: newOptions,
                                  correctAnswers: newCorrect.length > 0 ? newCorrect : [0],
                                }));
                              }}
                              className="text-destructive hover:bg-destructive/10 p-1.5 rounded cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Explanation (shown to student after quiz)</label>
                  <textarea
                    value={questionFormState.explanation}
                    onChange={(e) => setQuestionFormState((f) => ({ ...f, explanation: e.target.value }))}
                    placeholder="Provide context on why these options are correct..."
                    rows={2}
                    className="w-full rounded-input border border-border bg-card p-3 text-xs font-semibold text-foreground focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingQuestion(false);
                      setEditingQuestionId(null);
                    }}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 text-xs shadow-soft">
                    {editingQuestionId ? "Save Question" : "Add Question"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Video Preview Player */}
        {previewVideoUrl && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-black border border-border/40 overflow-hidden relative shadow-floating">
              <div className="flex items-center justify-between p-3 border-b border-border/10 bg-muted/20">
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Eye size={13} className="text-primary" /> Lesson Video Preview
                </span>
                <button
                  onClick={() => setPreviewVideoUrl(null)}
                  className="text-xs text-muted-foreground hover:text-foreground font-bold focus:outline-none cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center">
                <video
                  src={previewVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    );
  }

  // Create/Edit Form
  if (isCreatingCourse) {
    return (
      <motion.div
        key="create-course"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card variant="glass" className="p-6 max-w-xl mx-auto shadow-floating">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!courseForm.title.trim()) return;

              const body = {
                title: courseForm.title,
                subtitle: (courseForm as any).subtitle || "",
                description: (courseForm as any).description || "",
                category: courseForm.category,
                level: courseForm.level,
                language: (courseForm as any).language || "English",
                thumbnail: (courseForm as any).thumbnail || "",
                price: Number(courseForm.price),
                status: (courseForm as any).status || "draft",
                tags: (courseForm as any).tags || [],
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
                      prev.map((c) => (c.id === editingCourseId ? updated : c))
                    );
                    setEditingCourseId(null);
                    setIsCreatingCourse(false);
                    setCourseForm({ title: "", category: "Programming", price: 999, level: "beginner", duration: "10 hours", seoKeywords: "", subtitle: "", description: "", language: "English", thumbnail: "", status: "draft", tags: [] } as any);
                    toast.success("Course updated.");
                  } else {
                    const errData = await res.json();
                    toast.error(errData.error || "Failed to update course.");
                  }
                } else {
                  const res = await fetch("/api/tutor/courses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  });
                  if (res.ok) {
                    const newCourse = await res.json();
                    setMyCourses((prev) => [newCourse, ...prev]);
                    setIsCreatingCourse(false);
                    setCourseForm({ title: "", category: "Programming", price: 999, level: "beginner", duration: "10 hours", seoKeywords: "", subtitle: "", description: "", language: "English", thumbnail: "", status: "draft", tags: [] } as any);
                    toast.success("Draft course created!");
                  } else {
                    const errData = await res.json();
                    toast.error(errData.error || "Failed to create course.");
                  }
                }
              } catch (err) {
                toast.error("Network error saving course.");
              }
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                {editingCourseId ? "Edit Course" : "Create New Course"}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCourse(false);
                  setEditingCourseId(null);
                  setCourseForm({ title: "", category: "Programming", price: 999, level: "beginner", duration: "10 hours", seoKeywords: "", subtitle: "", description: "", language: "English", thumbnail: "", status: "draft", tags: [] } as any);
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Course Title *</label>
              <input
                type="text"
                required
                value={courseForm.title}
                onChange={(e) => setCourseForm((f: any) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Master React Hooks from Scratch..."
                className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Subtitle</label>
              <input
                type="text"
                value={(courseForm as any).subtitle || ""}
                onChange={(e) => setCourseForm((f: any) => ({ ...f, subtitle: e.target.value }))}
                placeholder="e.g. A comprehensive guide to modern workflows..."
                className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Description</label>
              <textarea
                value={(courseForm as any).description || ""}
                onChange={(e) => setCourseForm((f: any) => ({ ...f, description: e.target.value }))}
                placeholder="Write course description detail..."
                rows={3}
                className="w-full rounded-input border border-border bg-card p-3 text-xs font-semibold text-foreground focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Category *</label>
                <select
                  value={courseSelCatId}
                  onChange={(e) => {
                    const catId = e.target.value;
                    setCourseSelCatId(catId);
                    const catObj = MarketplaceService.getCategories().find((c) => c.id === catId);
                    const firstSubName = catObj?.subcategories[0]?.name || "";
                    setCourseSelSubName(firstSubName);
                    const firstSkillName = catObj?.subcategories[0]?.skills[0]?.name || "";
                    setCourseForm((f: any) => ({ ...f, category: firstSkillName }));
                  }}
                  className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="">Select Category...</option>
                  {MarketplaceService.getCategories()
                    .filter((c) => c.status === "Enabled")
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Subcategory *</label>
                <select
                  value={courseSelSubName}
                  onChange={(e) => {
                    const subName = e.target.value;
                    setCourseSelSubName(subName);
                    const catObj = MarketplaceService.getCategories().find((c) => c.id === courseSelCatId);
                    const subObj = catObj?.subcategories.find((s) => s.name === subName);
                    const firstSkillName = subObj?.skills[0]?.name || "";
                    setCourseForm((f: any) => ({ ...f, category: firstSkillName }));
                  }}
                  disabled={!courseSelCatId}
                  className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select Subcategory...</option>
                  {courseSelCatId &&
                    MarketplaceService.getCategories()
                      .find((c) => c.id === courseSelCatId)
                      ?.subcategories.map((sub) => (
                        <option key={sub.name} value={sub.name}>{sub.name}</option>
                      ))}
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Skill / Subject *</label>
              <select
                value={courseForm.category}
                onChange={(e) => setCourseForm((f: any) => ({ ...f, category: e.target.value }))}
                disabled={!courseSelSubName}
                className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none disabled:opacity-50"
              >
                <option value="">Select Skill...</option>
                {courseSelCatId && courseSelSubName &&
                  MarketplaceService.getCategories()
                    .find((c) => c.id === courseSelCatId)
                    ?.subcategories.find((s) => s.name === courseSelSubName)
                    ?.skills.filter((sk) => !sk.isHidden)
                    .map((sk) => (
                      <option key={sk.id} value={sk.name}>{sk.name}</option>
                    ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Language</label>
                <select
                  value={(courseForm as any).language || "English"}
                  onChange={(e) => setCourseForm((f: any) => ({ ...f, language: e.target.value }))}
                  className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Thumbnail URL</label>
                <input
                  type="text"
                  value={(courseForm as any).thumbnail || ""}
                  onChange={(e) => setCourseForm((f: any) => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="e.g. /images/courses/math.png"
                  className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Price Tier (₹)</label>
                <div className="h-10 w-full rounded-input border border-border bg-muted/20 px-3 text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>₹{courseForm.price}</span>
                  <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Platform Controlled</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Status *</label>
                <select
                  value={(courseForm as any).status || "draft"}
                  onChange={(e) => setCourseForm((f: any) => ({ ...f, status: e.target.value }))}
                  className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending Review</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Level</label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm((f: any) => ({ ...f, level: e.target.value }))}
                  className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Duration</label>
                <input
                  type="text"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm((f: any) => ({ ...f, duration: e.target.value }))}
                  className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Tags (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray((courseForm as any).tags) ? ((courseForm as any).tags as string[]).join(", ") : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const parsedTags = val.split(",").map((t) => t.trim()).filter((t) => t !== "");
                  setCourseForm((f: any) => ({ ...f, tags: parsedTags }));
                }}
                placeholder="math, geometry, react..."
                className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="submit" className="h-9 text-xs shadow-soft">
                {editingCourseId ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    );
  }

  // Course Listing
  return (
    <motion.div
      key="course-listing"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-heading font-extrabold text-foreground">My Courses</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {myCourses.length} total &bull; {myCourses.filter((c) => c.status === "published").length} published
          </p>
        </div>
        <Button onClick={() => setIsCreatingCourse(true)} size="sm" className="h-9 gap-1 shadow-soft self-start sm:self-center">
          <Plus size={14} /> Create Course
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-button w-fit shrink-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id !== "all" && (
                <span className="ml-1 text-[8px]">({myCourses.filter((c) => c.status === tab.id).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Category Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full md:justify-end">
          <div className="w-full sm:max-w-[200px] relative">
            <input
              type="text"
              value={courseSearch}
              onChange={(e) => {
                setCourseSearch(e.target.value);
                setCoursePage(1);
              }}
              placeholder="Search title, subtitle..."
              className="h-8 w-full rounded-input border border-border bg-muted/20 px-3 pr-7 text-[11px] font-semibold text-foreground focus:outline-none"
            />
            {courseSearch && (
              <button
                type="button"
                onClick={() => {
                  setCourseSearch("");
                  setCoursePage(1);
                }}
                className="absolute right-2 top-2 text-[8px] text-muted-foreground hover:text-foreground focus:outline-none font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={courseCategoryFilter}
              onChange={(e) => {
                setCourseCategoryFilter(e.target.value);
                setCoursePage(1);
              }}
              className="h-8 rounded-input border border-border bg-muted/20 px-2 text-[11px] font-semibold text-foreground focus:outline-none w-full sm:min-w-[120px] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {MarketplaceService.getCategories()
                .filter((c) => c.status === "Enabled")
                .map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <NoCourses onAction={() => setIsCreatingCourse(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="card-surface rounded-card overflow-hidden flex flex-col shadow-soft hover:-translate-y-0.5 transition-transform duration-200"
            >
              {/* Thumbnail */}
              <div className="h-28 bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center">
                <BookOpen size={36} className="text-primary/30 stroke-[1.5]" />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-card/80 backdrop-blur-md ${
                      c.status === "published"
                        ? "border-emerald-500/30 text-emerald-500"
                        : c.status === "pending"
                        ? "border-sky-500/30 text-sky-500"
                        : c.status === "archived"
                        ? "border-slate-500/30 text-muted-foreground"
                        : "border-amber-500/30 text-amber-500"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <span className="absolute bottom-2 left-2 text-[9px] font-extrabold uppercase bg-foreground/40 backdrop-blur-md px-1.5 py-0.5 rounded text-background">
                  {c.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1 gap-3">
                <h4 className="text-xs font-heading font-extrabold text-foreground line-clamp-2 leading-snug">
                  {c.title}
                </h4>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] border-b border-border/40 pb-3">
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase block">Students</span>
                    <span className="font-bold text-foreground">{c.studentsCount}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase block">Revenue (70%)</span>
                    <span className="font-bold text-foreground">₹{Math.round(c.studentsCount * c.price * 0.7).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase block">Rating</span>
                    <span className="font-bold text-foreground">{c.rating ? `⭐ ${c.rating}` : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase block">Price</span>
                    <span className="font-bold text-foreground">₹{c.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[9px] px-2"
                    onClick={() => {
                      setCourseForm({
                        title: c.title,
                        category: c.category,
                        price: c.price,
                        level: c.level,
                        duration: c.duration || "10 hours",
                        seoKeywords: "",
                        subtitle: (c as any).subtitle || "",
                        description: (c as any).description || "",
                        language: (c as any).language || "English",
                        thumbnail: (c as any).thumbnail || "",
                        status: c.status,
                        tags: (c as any).tags || [],
                      } as any);
                      setEditingCourseId(c.id);
                      setIsCreatingCourse(true);

                      const categories = MarketplaceService.getCategories();
                      const matchedCat = categories.find((cat) =>
                        cat.subcategories.some((sub) =>
                          sub.skills.some((sk) => sk.name === c.category)
                        )
                      );
                      if (matchedCat) {
                        setCourseSelCatId(matchedCat.id);
                        const matchedSub = matchedCat.subcategories.find((sub) =>
                          sub.skills.some((sk) => sk.name === c.category)
                        );
                        if (matchedSub) {
                          setCourseSelSubName(matchedSub.name);
                        }
                      }
                    }}
                  >
                    <Edit2 size={10} className="mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[9px] px-2"
                    onClick={() => setActiveBuilderCourseId(c.id)}
                  >
                    <BookOpen size={10} className="mr-1" /> Curriculum
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[9px] px-2"
                    onClick={() => handleDuplicate(c)}
                  >
                    <Copy size={10} className="mr-1" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[9px] px-2"
                    onClick={() => handleArchive(c.id)}
                  >
                    <Archive size={10} className="mr-1" /> Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[9px] px-2 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 size={10} className="mr-1" /> Delete
                  </Button>
                  {(c.status === "draft" || c.status === "pending") && (
                    <Button
                      size="sm"
                      className="h-7 text-[9px] px-2"
                      onClick={() => handlePublish(c.id, c.status)}
                    >
                      <CheckCircle size={10} className="mr-1" />
                      {c.status === "draft" ? "Submit" : "In Review"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isCreatingCourse && !activeBuilderCourseId && courseTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={coursePage === 1}
            onClick={() => setCoursePage(coursePage - 1)}
            className="h-8 text-xs cursor-pointer disabled:opacity-50"
          >
            Previous
          </Button>
          <span className="text-xs font-bold text-muted-foreground px-2">
            Page {coursePage} of {courseTotalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={coursePage === courseTotalPages}
            onClick={() => setCoursePage(coursePage + 1)}
            className="h-8 text-xs cursor-pointer disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
});
