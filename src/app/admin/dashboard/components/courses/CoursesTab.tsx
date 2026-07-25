"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, Star, BookOpen, AlertCircle, Copy, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

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
}

export default function CoursesTab({
  courses,
  setCourses,
  logAuditAction
}: CoursesTabProps) {
  const [courseSearch, setCourseSearch] = useState("");
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);

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

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
    c.tutorName.toLowerCase().includes(courseSearch.toLowerCase())
  );

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

      {/* COURSE CARDS GRID */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-10 border border-border/60 rounded-card text-xs text-muted-foreground/60">
            No courses found matching search.
          </div>
        ) : (
          filteredCourses.map((course) => {
            const hasPlacements = course.featured || course.trending || course.popular || course.recommended || course.homepageHero || course.homepageCarousel;
            return (
              <div
                key={course.id}
                className="border border-border bg-card p-4 rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft text-xs font-semibold"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {course.category} · Skill: {course.assignedSkill || "General"}
                      </span>
                      {course.hidden && (
                        <span className="text-[8px] font-bold bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded">HIDDEN</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-foreground mt-2 leading-snug">{course.title}</h4>
                    <p className="text-[10px] text-muted-foreground">Tutor: {course.tutorName} · Cost: ₹{course.price}</p>
                    
                    {/* Placements Badges */}
                    {hasPlacements && (
                      <div className="flex flex-wrap gap-1 mt-1.5 max-w-lg">
                        {course.featured && <span className="text-[7px] font-extrabold bg-amber-500/15 text-amber-500 px-1 rounded uppercase">★ Featured</span>}
                        {course.trending && <span className="text-[7px] font-extrabold bg-rose-500/15 text-rose-500 px-1 rounded uppercase">🔥 Trending</span>}
                        {course.popular && <span className="text-[7px] font-extrabold bg-indigo-500/15 text-indigo-500 px-1 rounded uppercase">📈 Popular</span>}
                        {course.recommended && <span className="text-[7px] font-extrabold bg-emerald-500/15 text-emerald-500 px-1 rounded uppercase">👍 Recommended</span>}
                        {course.homepageHero && <span className="text-[7px] font-extrabold bg-cyan-500/15 text-cyan-500 px-1 rounded uppercase">🖥️ Hero Banner</span>}
                        {course.homepageCarousel && <span className="text-[7px] font-extrabold bg-purple-500/15 text-purple-500 px-1 rounded uppercase">🎠 Carousel</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pipeline & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center select-none">
                  <div className="text-right">
                    <span className="text-[8px] uppercase text-muted-foreground block font-bold">Pipeline state</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded block mt-0.5 ${
                      course.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                      course.status === "Pending" ? "bg-amber-500/10 text-amber-600 animate-pulse" :
                      course.status === "Rejected" ? "bg-red-500/10 text-red-600" : "bg-slate-500/10 text-slate-500"
                    }`}>
                      {course.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
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
                    
                    <Button variant="outline" onClick={() => handleOpenEdit(course)} size="sm" className="h-8 text-[9px] px-2">
                      Edit placements
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
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  );
}
