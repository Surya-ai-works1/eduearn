"use client";

import React, { useState, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { NoCourses } from "./EmptyState";
import type { TutorCourse, CurriculumModule, CurriculumLesson } from "./types";
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
  courseForm: { title: string; category: string; price: number; level: string; duration: string; seoKeywords: string };
  setCourseForm: React.Dispatch<React.SetStateAction<{ title: string; category: string; price: number; level: string; duration: string; seoKeywords: string }>>;
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
}: CourseManagerProps) {
  const [statusFilter, setStatusFilter] = useState<CourseStatus>("all");

  const filteredCourses = useMemo(
    () =>
      statusFilter === "all"
        ? myCourses
        : myCourses.filter((c) => c.status === statusFilter),
    [myCourses, statusFilter]
  );

  const handleDuplicate = useCallback(
    (c: TutorCourse) => {
      const cloned: TutorCourse = {
        ...c,
        id: `course-${Date.now()}`,
        title: `${c.title} (Copy)`,
        studentsCount: 0,
        status: "draft",
      };
      setMyCourses((prev) => [...prev, cloned]);
      toast.success("Course duplicated.");
    },
    [setMyCourses]
  );

  const handleArchive = useCallback(
    (id: string) => {
      setMyCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: "archived" } : c)));
      toast.success("Course archived.");
    },
    [setMyCourses]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setMyCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Course deleted.");
    },
    [setMyCourses]
  );

  const handlePublish = useCallback(
    (id: string, currentStatus: string) => {
      if (appStatus === "suspended") {
        toast.error("Action denied: Account suspended.");
        return;
      }
      const nextStatus = currentStatus === "draft" ? "pending" : "published";
      setMyCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus as TutorCourse["status"] } : c)));
      toast.success(nextStatus === "pending" ? "Submitted for review!" : "Course published!");
    },
    [appStatus, setMyCourses]
  );

  // Curriculum Builder
  if (activeBuilderCourseId) {
    return (
      <motion.div
        key="curriculum-builder"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveBuilderCourseId(null)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer focus:outline-none"
          >
            <ChevronLeft size={14} /> Back to Courses
          </button>
          <span
            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
              isAutoSaving
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600 animate-pulse"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
            }`}
          >
            {isAutoSaving ? "Saving..." : "Saved"}
          </span>
        </div>

        <div className="space-y-4">
          {curriculumModules.map((mod) => (
            <div key={mod.id} className="card-surface rounded-card p-4 space-y-3 shadow-soft">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">{mod.title}</h4>
                <button
                  onClick={() => {
                    setCurriculumModules((prev) => prev.filter((m) => m.id !== mod.id));
                    triggerAutoSave();
                  }}
                  className="text-destructive hover:bg-destructive/10 p-1.5 rounded cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="flex flex-col gap-2 pl-4 border-l border-border/60">
                {mod.lessons.map((les) => (
                  <div key={les.id} className="flex items-center justify-between p-2 bg-muted/30 border border-border/40 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {les.type}
                      </span>
                      <span className="font-bold text-foreground">{les.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{les.duration}</span>
                      <button
                        onClick={() => {
                          setCurriculumModules((prev) =>
                            prev.map((m) =>
                              m.id === mod.id
                                ? { ...m, lessons: m.lessons.filter((l) => l.id !== les.id) }
                                : m
                            )
                          );
                          triggerAutoSave();
                        }}
                        className="text-destructive hover:text-destructive/80 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {activeModuleIdForLesson === mod.id ? (
                <div className="p-3 bg-muted/20 border border-border/40 rounded-card flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Lesson Title..."
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                    className="bg-card border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none flex-1"
                  />
                  <select
                    value={lessonForm.type}
                    onChange={(e) => setLessonForm((f) => ({ ...f, type: e.target.value as "Video" | "PDF" | "Quiz" | "Assignment" }))}
                    className="bg-card border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Video">Video</option>
                    <option value="PDF">PDF</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Duration..."
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm((f) => ({ ...f, duration: e.target.value }))}
                    className="bg-card border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none w-28"
                  />
                  <Button onClick={() => handleAddLesson(mod.id)} size="sm" className="h-9">Add</Button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveModuleIdForLesson(mod.id)}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer focus:outline-none pl-4"
                >
                  + Add Lesson
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Module Title..."
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
            className="bg-card border border-border rounded-input px-3 py-2 text-xs text-foreground focus:outline-none flex-1 font-semibold"
          />
          <Button onClick={handleAddModule} size="sm">Add Module</Button>
        </div>
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
            onSubmit={(e) => {
              e.preventDefault();
              if (!courseForm.title.trim()) return;
              if (editingCourseId) {
                setMyCourses((prev) =>
                  prev.map((c) =>
                    c.id === editingCourseId
                      ? { ...c, title: courseForm.title, category: courseForm.category, price: Number(courseForm.price), level: courseForm.level, duration: courseForm.duration }
                      : c
                  )
                );
                setEditingCourseId(null);
                setIsCreatingCourse(false);
                setCourseForm({ title: "", category: "Programming", price: 499, level: "beginner", duration: "10 hours", seoKeywords: "" });
                toast.success("Course updated.");
              } else {
                const newC: TutorCourse = {
                  id: `course-${Date.now()}`,
                  title: courseForm.title,
                  category: courseForm.category,
                  price: Number(courseForm.price),
                  level: courseForm.level,
                  duration: courseForm.duration,
                  studentsCount: 0,
                  rating: 0,
                  status: "draft",
                };
                setMyCourses((prev) => [...prev, newC]);
                setIsCreatingCourse(false);
                setCourseForm({ title: "", category: "Programming", price: 499, level: "beginner", duration: "10 hours", seoKeywords: "" });
                toast.success("Draft course created!");
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
                onClick={() => { setIsCreatingCourse(false); setEditingCourseId(null); }}
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
                onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Master React Hooks from Scratch..."
                className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
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
                    setCourseForm((f) => ({ ...f, category: firstSkillName }));
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
                    setCourseForm((f) => ({ ...f, category: firstSkillName }));
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
                onChange={(e) => setCourseForm((f) => ({ ...f, category: e.target.value }))}
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

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Price Tier (₹)</label>
              <div className="h-10 w-full rounded-input border border-border bg-muted/20 px-3 text-xs font-semibold text-foreground flex items-center justify-between">
                <span>₹{courseForm.price}</span>
                <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Platform Controlled</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Level</label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm((f) => ({ ...f, level: e.target.value }))}
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
                  onChange={(e) => setCourseForm((f) => ({ ...f, duration: e.target.value }))}
                  className="h-10 w-full rounded-input border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">SEO Tags</label>
              <input
                type="text"
                value={courseForm.seoKeywords}
                onChange={(e) => setCourseForm((f) => ({ ...f, seoKeywords: e.target.value }))}
                placeholder="react, webdev, hooks..."
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
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-button w-fit">
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
                      setCourseForm({ title: c.title, category: c.category, price: c.price, level: c.level, duration: c.duration, seoKeywords: "" });
                      setEditingCourseId(c.id);
                      setIsCreatingCourse(true);
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
    </motion.div>
  );
});
