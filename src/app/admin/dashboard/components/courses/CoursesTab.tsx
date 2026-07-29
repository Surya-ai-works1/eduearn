"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, Star, BookOpen, AlertCircle, Copy, Search, CheckCircle, FileText, Video, Award, Brain, ExternalLink, Eye, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { createClient } from "../../../../../lib/supabase";

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
  thumbnail?: string;
  enrollmentCount?: number;
  revenue?: number;
  
  // Visibility Extensions
  trending?: boolean;
  popular?: boolean;
  recommended?: boolean;
  newest?: boolean;
  bestSeller?: boolean;
  homepageHero?: boolean;
  homepageCarousel?: boolean;
  categoryHero?: boolean;
  landingPageFeatured?: boolean;
}

interface CoursesTabProps {
  courses: AdminCourse[];
  setCourses: React.Dispatch<React.SetStateAction<AdminCourse[]>>;
  logAuditAction: (actionStr: string) => void;
  isLoading?: boolean;
}

export default function CoursesTab({
  courses,
  setCourses,
  logAuditAction,
  isLoading = false
}: CoursesTabProps) {
  const renderTableSkeletons = (colCount: number, rowCount = 5) => {
    return Array.from({ length: rowCount }).map((_, index) => (
      <tr key={`skeleton-row-${index}`} className="animate-pulse">
        {Array.from({ length: colCount }).map((_, colIndex) => (
          <td key={`skeleton-col-${colIndex}`} className="py-4 px-3">
            <div className="h-4 bg-muted-foreground/10 rounded w-4/5"></div>
          </td>
        ))}
      </tr>
    ));
  };

  const [courseSearch, setCourseSearch] = useState("");
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);

  // Curriculum review drawer states
  const [selectedCourseCurriculum, setSelectedCourseCurriculum] = useState<AdminCourse | null>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]);
  const [courseQuizzes, setCourseQuizzes] = useState<any[]>([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [changesFeedbackText, setChangesFeedbackText] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleReviewCurriculum = async (course: AdminCourse) => {
    setSelectedCourseCurriculum(course);
    setIsLoadingCurriculum(true);
    setShowFeedbackForm(false);
    setChangesFeedbackText("");
    try {
      const supabase = createClient();
      
      const { data: lessons, error: lessonsErr } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", course.id)
        .order("lesson_order", { ascending: true });
        
      const { data: assignments, error: assignmentsErr } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", course.id);
        
      const { data: quizzes, error: quizzesErr } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", course.id);
        
      if (lessonsErr) throw lessonsErr;
      if (assignmentsErr) throw assignmentsErr;
      if (quizzesErr) throw quizzesErr;
      
      setCourseLessons(lessons || []);
      setCourseAssignments(assignments || []);
      setCourseQuizzes(quizzes || []);
    } catch (err: any) {
      toast.error("Failed to load course curriculum: " + err.message);
    } finally {
      setIsLoadingCurriculum(false);
    }
  };

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formTutor, setFormTutor] = useState("");
  const [formCategory, setFormCategory] = useState("Coding");
  const [formSkill, setFormSkill] = useState("");
  const [formPrice, setFormPrice] = useState(999);
  const [formStatus, setFormStatus] = useState<AdminCourse["status"]>("Approved");
  
  // Visibility toggles
  const [formFeatured, setFormFeatured] = useState(false);
  const [formHidden, setFormHidden] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [formPopular, setFormPopular] = useState(false);
  const [formRecommended, setFormRecommended] = useState(false);
  const [formNewest, setFormNewest] = useState(false);
  const [formBestSeller, setFormBestSeller] = useState(false);
  const [formHomepageHero, setFormHomepageHero] = useState(false);
  const [formHomepageCarousel, setFormHomepageCarousel] = useState(false);
  const [formCategoryHero, setFormCategoryHero] = useState(false);
  const [formLandingPageFeatured, setFormLandingPageFeatured] = useState(false);

  const handleOpenEdit = (course: AdminCourse) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormTutor(course.tutorName);
    setFormCategory(course.category);
    setFormSkill(course.assignedSkill || "");
    setFormPrice(course.price);
    setFormStatus(course.status);
    
    setFormFeatured(!!course.featured);
    setFormHidden(!!course.hidden);
    setFormTrending(!!course.trending);
    setFormPopular(!!course.popular);
    setFormRecommended(!!course.recommended);
    setFormNewest(!!course.newest);
    setFormBestSeller(!!course.bestSeller);
    setFormHomepageHero(!!course.homepageHero);
    setFormHomepageCarousel(!!course.homepageCarousel);
    setFormCategoryHero(!!course.categoryHero);
    setFormLandingPageFeatured(!!course.landingPageFeatured);
    
    setIsNewMode(false);
  };

  const handleOpenCreate = () => {
    setEditingCourse({
      id: `c-${Date.now()}`,
      title: "",
      tutorName: "",
      category: "Coding",
      price: 999,
      tutorEarnings: 799,
      platformEarnings: 200,
      status: "Approved",
      featured: false,
      hidden: false,
      assignedSkill: ""
    });
    setFormTitle("");
    setFormTutor("");
    setFormCategory("Coding");
    setFormSkill("");
    setFormPrice(999);
    setFormStatus("Approved");
    
    setFormFeatured(false);
    setFormHidden(false);
    setFormTrending(false);
    setFormPopular(false);
    setFormRecommended(false);
    setFormNewest(false);
    setFormBestSeller(false);
    setFormHomepageHero(false);
    setFormHomepageCarousel(false);
    setFormCategoryHero(false);
    setFormLandingPageFeatured(false);
    
    setIsNewMode(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const commissionPercent = 20; // 20% commission split
    const platformShare = Math.round((formPrice * commissionPercent) / 100);
    const tutorShare = formPrice - platformShare;

    const updatedCourse: AdminCourse = {
      ...editingCourse,
      title: formTitle.trim(),
      tutorName: formTutor.trim() || "Unknown Tutor",
      category: formCategory,
      assignedSkill: formSkill.trim(),
      price: formPrice,
      tutorEarnings: tutorShare,
      platformEarnings: platformShare,
      status: formStatus,
      featured: formFeatured,
      hidden: formHidden,
      trending: formTrending,
      popular: formPopular,
      recommended: formRecommended,
      newest: formNewest,
      bestSeller: formBestSeller,
      homepageHero: formHomepageHero,
      homepageCarousel: formHomepageCarousel,
      categoryHero: formCategoryHero,
      landingPageFeatured: formLandingPageFeatured
    };

    try {
      // Save course status via PATCH
      const res = await fetch("/api/admin/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: editingCourse.id,
          status: formStatus,
          featured: formFeatured
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save course");

      // Save category via PUT
      await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: editingCourse.id,
          category: formCategory
        })
      });

      if (isNewMode) {
        setCourses(prev => [updatedCourse, ...prev]);
        logAuditAction(`Created new course: "${formTitle}"`);
        toast.success("Course created successfully!");
      } else {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? updatedCourse : c));
        logAuditAction(`Updated properties & visibility maps for course: "${formTitle}"`);
        toast.success("Course properties saved.");
      }
      setEditingCourse(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete course "${title}"?`)) return;
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id, status: "Archived" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete course");

      setCourses(prev => prev.filter(c => c.id !== id));
      logAuditAction(`Permanently deleted course: ${title}`);
      toast.success("Course deleted successfully.");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDuplicateCourse = (course: AdminCourse) => {
    const duplicated: AdminCourse = {
      ...course,
      id: `c-dup-${Date.now()}`,
      title: `${course.title} (Copy)`,
      featured: false,
      status: "Approved"
    };
    setCourses(prev => [duplicated, ...prev]);
    toast.success(`Duplicated course: ${course.title}`);
    logAuditAction(`Duplicated course template of ${course.title}`);
  };

  const handleSetQuickStatus = async (id: string, nextStatus: AdminCourse["status"], title: string) => {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id, status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update course status");

      setCourses(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
      toast.success(`Course "${title}" status set to ${nextStatus}.`);
      logAuditAction(`Quick changed course status for "${title}" to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Course Sorting, Selection and Pagination states
  const [courseSortField, setCourseSortField] = useState<string>("title");
  const [courseSortAsc, setCourseSortAsc] = useState<boolean>(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [coursePage, setCoursePage] = useState(1);
  const coursesPerPage = 10;

  // Clear selection on search
  React.useEffect(() => {
    setSelectedCourseIds([]);
  }, [courseSearch]);

  const handleCourseSort = (field: string) => {
    if (courseSortField === field) {
      setCourseSortAsc(!courseSortAsc);
    } else {
      setCourseSortField(field);
      setCourseSortAsc(true);
    }
  };

  const handleBulkCourseStatus = async (nextStatus: AdminCourse["status"]) => {
    if (selectedCourseIds.length === 0) return;
    let successCount = 0;
    const toastId = toast.loading(`Updating ${selectedCourseIds.length} courses status to ${nextStatus}...`);
    for (const id of selectedCourseIds) {
      try {
        const res = await fetch("/api/admin/courses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: id, status: nextStatus })
        });
        if (res.ok) successCount++;
      } catch {}
    }
    setCourses(prev => prev.map(c => selectedCourseIds.includes(c.id) ? { ...c, status: nextStatus } : c));
    setSelectedCourseIds([]);
    toast.success(`Successfully set ${successCount} courses to ${nextStatus}.`, { id: toastId });
    logAuditAction(`Bulk changed status of ${successCount} courses to ${nextStatus}`);
  };

  const handleBulkCoursePlacement = async (key: string, val: boolean) => {
    if (selectedCourseIds.length === 0) return;
    let successCount = 0;
    const toastId = toast.loading(`Updating placement configurations...`);
    for (const id of selectedCourseIds) {
      try {
        const res = await fetch("/api/admin/courses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: id, [key]: val })
        });
        if (res.ok) successCount++;
      } catch {}
    }
    setCourses(prev => prev.map(c => selectedCourseIds.includes(c.id) ? { ...c, [key]: val } : c));
    setSelectedCourseIds([]);
    toast.success(`Successfully updated placement tags on ${successCount} courses.`, { id: toastId });
    logAuditAction(`Bulk updated placement tags for ${successCount} courses`);
  };

  const handleBulkCoursesExportCSV = () => {
    const selected = courses.filter(c => selectedCourseIds.includes(c.id));
    const headers = "ID,Title,Category,Tutor,Price,Enrollments,Revenue,Status\n";
    const rows = selected.map(c => `${c.id},"${c.title}",${c.category},"${c.tutorName}",${c.price},${c.enrollmentCount || 0},${c.revenue || 0},${c.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `eduearn_selected_courses_${Date.now()}.csv`);
    a.click();
    toast.success("CSV export for selected courses completed.");
    setSelectedCourseIds([]);
  };

  // Sort & Filter logic
  const sortedAndFilteredCourses = React.useMemo(() => {
    const list = courses.filter(c => 
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
      c.tutorName.toLowerCase().includes(courseSearch.toLowerCase())
    );

    return [...list].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (courseSortField === "title") {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (courseSortField === "tutor") {
        valA = a.tutorName.toLowerCase();
        valB = b.tutorName.toLowerCase();
      } else if (courseSortField === "category") {
        valA = a.category.toLowerCase();
        valB = b.category.toLowerCase();
      } else if (courseSortField === "price") {
        valA = a.price;
        valB = b.price;
      } else if (courseSortField === "enrollments") {
        valA = a.enrollmentCount || 0;
        valB = b.enrollmentCount || 0;
      } else if (courseSortField === "revenue") {
        valA = a.revenue || 0;
        valB = b.revenue || 0;
      } else if (courseSortField === "status") {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      }

      if (valA < valB) return courseSortAsc ? -1 : 1;
      if (valA > valB) return courseSortAsc ? 1 : -1;
      return 0;
    });
  }, [courses, courseSearch, courseSortField, courseSortAsc]);

  const filteredCourses = sortedAndFilteredCourses;

  const paginatedCourses = React.useMemo(() => {
    return filteredCourses.slice(
      (coursePage - 1) * coursesPerPage,
      coursePage * coursesPerPage
    );
  }, [filteredCourses, coursePage]);

  const totalCoursePages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 select-none">
        <div>
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
            Platform Course Approval Pipeline &amp; Visibility Suite
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Audit educator submissions, grant featured rankings, toggle homepage hero visibility, and manage content states.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm" className="gap-1 text-xs">
          <Plus size={14} /> Create Course
        </Button>
      </div>

      {/* SEARCH BAR */}
      <Card className="p-4 border-border bg-card shadow-soft">
        <div className="flex items-center gap-2 border border-border rounded-button bg-muted/15 px-3 py-1.5 w-full sm:max-w-xs">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search course title/tutor..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-semibold"
          />
        </div>
      </Card>

      {/* EDITING FORM */}
      {editingCourse && (
        <Card className="p-5 border-primary/20 bg-primary/5 space-y-4 font-semibold text-xs">
          <h4 className="text-xs font-heading font-extrabold text-foreground uppercase border-b border-border/20 pb-2 select-none">
            {isNewMode ? "Create Platform Course" : `Edit Settings: ${editingCourse.title}`}
          </h4>
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-foreground">Course Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-9 w-full rounded border border-border bg-card px-3 focus:outline-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-foreground">Tutor Name</label>
                <input
                  type="text"
                  required
                  value={formTutor}
                  onChange={(e) => setFormTutor(e.target.value)}
                  className="h-9 w-full rounded border border-border bg-card px-3 focus:outline-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-foreground">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="h-9 w-full rounded border border-border bg-card px-3 focus:outline-none text-xs"
                >
                  <option value="Coding">Coding</option>
                  <option value="Academics">Academics</option>
                  <option value="Music">Music</option>
                  <option value="Dance">Dance</option>
                  <option value="Chess">Chess</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-foreground">Assigned Skill Tag</label>
                <input
                  type="text"
                  value={formSkill}
                  onChange={(e) => setFormSkill(e.target.value)}
                  className="h-9 w-full rounded border border-border bg-card px-3 focus:outline-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-foreground">Course Price (INR)</label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="h-9 w-full rounded border border-border bg-card px-3 focus:outline-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-foreground">Pipeline State Approval</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="h-9 w-full rounded border border-border bg-card px-3 focus:outline-none text-xs"
                >
                  <option value="Draft">Draft Status</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approved (Live)</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Need Changes">Need Changes Feedback</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* VISIBILITY MATRIX */}
            <div className="border-t border-border/20 pt-3 space-y-2 select-none">
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Visibility &amp; Promotional Placements</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "featured", label: "★ Featured Course", val: formFeatured, set: setFormFeatured },
                  { id: "trending", label: "🔥 Trending Now", val: formTrending, set: setFormTrending },
                  { id: "popular", label: "📈 Popular Choice", val: formPopular, set: setFormPopular },
                  { id: "recommended", label: "👍 Recommended", val: formRecommended, set: setFormRecommended },
                  { id: "newest", label: "✨ Newest Addition", val: formNewest, set: setFormNewest },
                  { id: "bestSeller", label: "🏆 Best Seller Tag", val: formBestSeller, set: setFormBestSeller },
                  { id: "homepageHero", label: "🖥️ Homepage Hero Placement", val: formHomepageHero, set: setFormHomepageHero },
                  { id: "homepageCarousel", label: "🎠 Homepage Carousel", val: formHomepageCarousel, set: setFormHomepageCarousel },
                  { id: "categoryHero", label: "📂 Category Hero Placement", val: formCategoryHero, set: setFormCategoryHero },
                  { id: "landingPageFeatured", label: "⭐ Landing Page Featured", val: formLandingPageFeatured, set: setFormLandingPageFeatured },
                  { id: "hidden", label: "🔒 Hide course in listing", val: formHidden, set: setFormHidden }
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-2 border border-border/50 rounded p-2 bg-card/45">
                    <input
                      type="checkbox"
                      id={`cb-${item.id}`}
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="h-3.5 w-3.5 cursor-pointer accent-primary"
                    />
                    <label htmlFor={`cb-${item.id}`} className="cursor-pointer text-[10px] text-foreground font-semibold">{item.label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingCourse(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* BULK ACTION BAR */}
      {selectedCourseIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs font-bold shadow-soft select-none"
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-primary" />
            <span className="text-foreground">Selected {selectedCourseIds.length} courses</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleBulkCourseStatus("Approved")}
              size="sm"
              className="h-8.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white uppercase font-extrabold tracking-wider"
            >
              Approve Selected
            </Button>
            <Button
              onClick={() => handleBulkCourseStatus("Rejected")}
              size="sm"
              className="h-8.5 text-[10px] bg-rose-600 hover:bg-rose-700 text-white uppercase font-extrabold tracking-wider"
            >
              Reject Selected
            </Button>
            <Button
              onClick={() => handleBulkCoursePlacement("hidden", true)}
              size="sm"
              className="h-8.5 text-[10px] bg-amber-600 hover:bg-amber-700 text-white uppercase font-extrabold tracking-wider"
            >
              Hide Selected
            </Button>
            <Button
              onClick={handleBulkCoursesExportCSV}
              size="sm"
              variant="outline"
              className="h-8.5 text-[10px] uppercase font-extrabold tracking-wider border-border bg-card hover:bg-muted"
            >
              Export Selected
            </Button>
          </div>
        </motion.div>
      )}

      {/* COURSE CARDS GRID / TABLE */}
      <Card className="bg-card border border-border/40 p-4 shadow-soft">
        {!isLoading && filteredCourses.length === 0 ? (
          <div className="text-center py-10 border border-border/60 rounded-card text-xs text-muted-foreground/60">
            No courses found matching search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider select-none">
                  <th className="py-4 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={paginatedCourses.length > 0 && paginatedCourses.every(c => selectedCourseIds.includes(c.id))}
                      onChange={() => {
                        const pageCourseIds = paginatedCourses.map(c => c.id);
                        const allSelected = pageCourseIds.every(id => selectedCourseIds.includes(id));
                        if (allSelected) {
                          setSelectedCourseIds(prev => prev.filter(id => !pageCourseIds.includes(id)));
                        } else {
                          setSelectedCourseIds(prev => Array.from(new Set([...prev, ...pageCourseIds])));
                        }
                      }}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                  </th>
                  <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleCourseSort("title")}>
                    Course Title {courseSortField === "title" ? (courseSortAsc ? "↑" : "↓") : "↕"}
                  </th>
                  <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleCourseSort("category")}>
                    Category {courseSortField === "category" ? (courseSortAsc ? "↑" : "↓") : "↕"}
                  </th>
                  <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleCourseSort("tutor")}>
                    Tutor {courseSortField === "tutor" ? (courseSortAsc ? "↑" : "↓") : "↕"}
                  </th>
                  <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleCourseSort("price")}>
                    Price {courseSortField === "price" ? (courseSortAsc ? "↑" : "↓") : "↕"}
                  </th>
                  <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleCourseSort("enrollments")}>
                    Enrollments {courseSortField === "enrollments" ? (courseSortAsc ? "↑" : "↓") : "↕"}
                  </th>
                  <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleCourseSort("revenue")}>
                    Revenue {courseSortField === "revenue" ? (courseSortAsc ? "↑" : "↓") : "↕"}
                  </th>
                  <th className="py-4 px-3">Placements</th>
                  <th className="py-4 px-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleCourseSort("status")}>
                    Pipeline State {courseSortField === "status" ? (courseSortAsc ? "↑" : "↓") : "↕"}
                  </th>
                  <th className="py-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs font-semibold">
                {isLoading ? (
                  renderTableSkeletons(10, 5)
                ) : (
                  paginatedCourses.map((course) => {
                    const hasPlacements = course.featured || course.trending || course.popular || course.recommended || course.homepageHero || course.homepageCarousel;
                    return (
                      <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-3">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={() => {
                            setSelectedCourseIds(prev =>
                              prev.includes(course.id) ? prev.filter(cid => cid !== course.id) : [...prev, course.id]
                            );
                          }}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-12 h-8 rounded object-cover border border-border/40 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary flex items-center justify-center font-bold shrink-0">
                              <BookOpen size={14} />
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block max-w-[200px] truncate" title={course.title}>
                              {course.title}
                            </span>
                            {course.hidden && (
                              <span className="inline-block text-[8px] font-bold bg-rose-500/10 text-rose-500 px-1 py-0.2 rounded">HIDDEN</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-[10px] font-extrabold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-muted-foreground font-bold">{course.tutorName}</td>
                      <td className="py-4 px-3 font-bold text-foreground">₹{course.price}</td>
                      <td className="py-4 px-3 text-primary font-bold">{course.enrollmentCount || 0}</td>
                      <td className="py-4 px-3 text-emerald-500 font-bold">₹{course.revenue?.toLocaleString() || 0}</td>
                      <td className="py-4 px-3">
                        {hasPlacements ? (
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {course.featured && <span className="text-[7px] font-extrabold bg-amber-500/15 text-amber-500 px-1 rounded uppercase">Featured</span>}
                            {course.trending && <span className="text-[7px] font-extrabold bg-rose-500/15 text-rose-500 px-1 rounded uppercase">Trending</span>}
                            {course.popular && <span className="text-[7px] font-extrabold bg-indigo-500/15 text-indigo-500 px-1 rounded uppercase">Popular</span>}
                            {course.recommended && <span className="text-[7px] font-extrabold bg-emerald-500/15 text-emerald-600 px-1 rounded uppercase">Recom.</span>}
                            {course.homepageHero && <span className="text-[7px] font-extrabold bg-cyan-500/15 text-cyan-600 px-1 rounded uppercase">Hero</span>}
                            {course.homepageCarousel && <span className="text-[7px] font-extrabold bg-purple-500/15 text-purple-600 px-1 rounded uppercase">Carousel</span>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/45 text-[10px]">None</span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded block text-center ${
                          course.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                          course.status === "Pending" ? "bg-amber-500/10 text-amber-600 animate-pulse" :
                          course.status === "Rejected" ? "bg-red-500/10 text-red-600" : "bg-slate-500/10 text-slate-500"
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right flex justify-end gap-1.5">
                        {course.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleSetQuickStatus(course.id, "Approved", course.title)}
                              className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded border border-border/20 cursor-pointer"
                              title="Quick Approve Live"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleSetQuickStatus(course.id, "Need Changes", course.title)}
                              className="p-1.5 hover:bg-amber-500/10 text-amber-500 rounded border border-border/20 cursor-pointer"
                              title="Request Changes Feedback"
                            >
                              <AlertCircle size={14} />
                            </button>
                          </>
                        )}
                        <Button variant="outline" onClick={() => handleReviewCurriculum(course)} size="sm" className="h-8 text-[9px] px-2 flex items-center gap-1">
                          <Eye size={12} /> Review
                        </Button>
                        <Button variant="outline" onClick={() => handleOpenEdit(course)} size="sm" className="h-8 text-[9px] px-2">
                          Placements
                        </Button>
                        <button
                          onClick={() => handleDuplicateCourse(course)}
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground border border-border rounded cursor-pointer"
                          title="Duplicate Course Template"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border rounded cursor-pointer"
                          title="Delete Course permanently"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
            {/* Pagination */}
            {totalCoursePages > 1 && (
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                <span className="text-xs text-muted-foreground">Showing {(coursePage - 1) * coursesPerPage + 1} to {Math.min(coursePage * coursesPerPage, filteredCourses.length)} of {filteredCourses.length} courses</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCoursePage(p => Math.max(1, p - 1))}
                    disabled={coursePage === 1}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCoursePage(p => Math.min(totalCoursePages, p + 1))}
                    disabled={coursePage === totalCoursePages}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── SLIDING CURRICULUM DRAWER ── */}
      <AnimatePresence>
        {selectedCourseCurriculum && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourseCurriculum(null)}
              className="fixed inset-0 bg-black z-45 cursor-pointer"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-background border-l border-border/80 z-50 overflow-y-auto shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/40 flex items-center justify-between bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground">{selectedCourseCurriculum.title}</h2>
                    <p className="text-xs text-muted-foreground">Tutor: {selectedCourseCurriculum.tutorName} · Category: {selectedCourseCurriculum.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                    selectedCourseCurriculum.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                    selectedCourseCurriculum.status === "Pending" ? "bg-amber-500/10 text-amber-600 animate-pulse" :
                    "bg-rose-500/10 text-rose-600"
                  }`}>
                    {selectedCourseCurriculum.status}
                  </span>
                  <button
                    onClick={() => setSelectedCourseCurriculum(null)}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 space-y-6 flex-1 text-xs font-semibold text-left">
                {isLoadingCurriculum ? (
                  <div className="space-y-6 animate-pulse">
                    {/* Overview Skeleton */}
                    <div className="space-y-2">
                      <div className="h-3.5 bg-muted rounded-md w-24"></div>
                      <div className="p-4 bg-card border border-border/40 space-y-3 rounded-xl">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <div className="h-3 bg-muted rounded w-12"></div>
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-3 bg-muted rounded w-16"></div>
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-3 bg-muted rounded w-16"></div>
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lessons list skeleton */}
                    <div className="space-y-2">
                      <div className="h-3.5 bg-muted rounded-md w-28"></div>
                      <div className="space-y-2">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="p-3.5 bg-card/50 border border-border/40 flex justify-between items-center rounded-xl">
                            <div className="space-y-1.5 flex-1">
                              <div className="h-2.5 bg-muted rounded w-14"></div>
                              <div className="h-3.5 bg-muted rounded w-3/4"></div>
                              <div className="h-2.5 bg-muted rounded w-1/2"></div>
                            </div>
                            <div className="h-5 bg-muted rounded w-10"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assignments skeleton */}
                    <div className="space-y-2">
                      <div className="h-3.5 bg-muted rounded-md w-28"></div>
                      <div className="space-y-2">
                        {[1, 2].map((n) => (
                          <div key={n} className="p-3.5 bg-card/50 border border-border/40 flex justify-between items-center rounded-xl">
                            <div className="space-y-1.5 flex-1">
                              <div className="h-3.5 bg-muted rounded w-2/3"></div>
                              <div className="h-2.5 bg-muted rounded w-3/4"></div>
                            </div>
                            <div className="h-5 bg-muted rounded w-10"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Course Summary */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Course Overview</h3>
                      <Card className="p-4 bg-card border border-border/40 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Price (INR)</span>
                            <span className="text-foreground font-bold">₹{selectedCourseCurriculum.price}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Tutor Share (80%)</span>
                            <span className="text-foreground">₹{selectedCourseCurriculum.tutorEarnings}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Platform Share (20%)</span>
                            <span className="text-foreground">₹{selectedCourseCurriculum.platformEarnings}</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Lessons list */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Video size={13} className="text-primary" /> Lessons ({courseLessons.length})
                      </h3>
                      {courseLessons.length === 0 ? (
                        <div className="text-center py-8 px-4 border border-dashed border-border/50 rounded-xl bg-muted/10 text-muted-foreground/70 flex flex-col items-center justify-center gap-1.5">
                          <Video size={18} className="text-muted-foreground/40" />
                          <span>No lessons created for this course yet.</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {courseLessons.map((lesson, idx) => (
                            <Card key={lesson.id || idx} className="p-3.5 bg-card/50 border border-border/40 flex justify-between items-center">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-extrabold block">Lesson {idx + 1}</span>
                                <span className="text-foreground font-bold text-xs mt-1 block">{lesson.title}</span>
                                {lesson.video_url && (
                                  <span className="text-[10px] text-primary truncate max-w-xs block mt-1">📺 {lesson.video_url}</span>
                                )}
                              </div>
                              <span className="text-muted-foreground text-[10px] font-extrabold bg-muted px-2 py-0.5 rounded border border-border/50">
                                {lesson.duration || 0} mins
                              </span>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Assignments */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider flex items-center gap-1">
                        <FileText size={13} className="text-indigo-500" /> Assignments ({courseAssignments.length})
                      </h3>
                      {courseAssignments.length === 0 ? (
                        <div className="text-center py-8 px-4 border border-dashed border-border/50 rounded-xl bg-muted/10 text-muted-foreground/70 flex flex-col items-center justify-center gap-1.5">
                          <FileText size={18} className="text-muted-foreground/40" />
                          <span>No assignments uploaded yet.</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {courseAssignments.map((assign, idx) => (
                            <Card key={assign.id || idx} className="p-3.5 bg-card/50 border border-border/40 flex justify-between items-center">
                              <div>
                                <span className="text-foreground font-bold text-xs block">{assign.title}</span>
                                {assign.description && (
                                  <p className="text-muted-foreground text-[10px] mt-1 line-clamp-2">{assign.description}</p>
                                )}
                              </div>
                              {assign.file_url && (
                                <a
                                  href={assign.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded bg-muted text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quizzes */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Brain size={13} className="text-purple-500" /> Quizzes ({courseQuizzes.length})
                      </h3>
                      {courseQuizzes.length === 0 ? (
                        <div className="text-center py-6 border border-border/40 rounded-card text-muted-foreground/60">
                          No quiz evaluations attached to this course.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {courseQuizzes.map((quiz, idx) => (
                            <Card key={quiz.id || idx} className="p-3.5 bg-card/50 border border-border/40 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-foreground font-bold text-xs">{quiz.title}</span>
                                <span className="text-purple-500 text-[10px] font-extrabold uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                                  Passing Score: {quiz.passing_score}%
                                </span>
                              </div>
                              {quiz.description && <p className="text-muted-foreground text-[10px]">{quiz.description}</p>}
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Feedback Input for Changes */}
                {showFeedbackForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3 text-xs"
                  >
                    <label className="text-[10px] uppercase font-extrabold text-amber-600 tracking-wider block">Changes requested feedback notes</label>
                    <textarea
                      placeholder="Specify what curriculum topics, videos, or questions need updates..."
                      value={changesFeedbackText}
                      onChange={(e) => setChangesFeedbackText(e.target.value)}
                      className="w-full text-xs p-3 bg-background border border-amber-500/20 rounded-xl resize-none text-foreground focus:outline-none"
                      rows={2.5}
                      required
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setShowFeedbackForm(false)} className="h-8 text-[10px] font-bold">Cancel</Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleSetQuickStatus(selectedCourseCurriculum.id, "Need Changes", selectedCourseCurriculum.title);
                          setSelectedCourseCurriculum(prev => prev ? { ...prev, status: "Need Changes" } : null);
                          setShowFeedbackForm(false);
                        }}
                        className="h-8 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Send Request
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Drawer Actions */}
              <div className="p-6 border-t border-border/40 bg-card flex gap-2.5 select-none">
                {selectedCourseCurriculum && selectedCourseCurriculum.status === "Pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleSetQuickStatus(selectedCourseCurriculum.id, "Approved", selectedCourseCurriculum.title);
                        setSelectedCourseCurriculum(prev => prev ? { ...prev, status: "Approved" } : null);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 flex items-center justify-center gap-1.5 rounded-xl shadow-soft"
                    >
                      <CheckCircle size={14} /> Approve &amp; Publish Course
                    </Button>
                    <Button
                      onClick={() => {
                        setShowFeedbackForm(true);
                      }}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-10 flex items-center justify-center gap-1.5 rounded-xl shadow-soft"
                    >
                      <AlertCircle size={14} /> Request Curriculum Changes
                    </Button>
                  </>
                )}
                {selectedCourseCurriculum && selectedCourseCurriculum.status !== "Pending" && (
                  <Button
                    onClick={() => {
                      handleSetQuickStatus(selectedCourseCurriculum.id, "Pending", selectedCourseCurriculum.title);
                      setSelectedCourseCurriculum(prev => prev ? { ...prev, status: "Pending" } : null);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-10 flex items-center justify-center gap-1.5 rounded-xl shadow-soft"
                  >
                    <RefreshCw size={14} /> Reset Status to Pending Review
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
