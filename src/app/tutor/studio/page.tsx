"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { lmsDb, Course, TutorEarnings, WithdrawalRequest } from "../../../lib/lmsDb";
import { toast } from "sonner";
import {
  FaGraduationCap,
  FaPlus,
  FaCog,
  FaCoins,
  FaChartLine,
  FaBookOpen,
  FaChevronRight,
  FaWallet
} from "react-icons/fa";

export default function TutorStudioDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Database State
  const [courses, setCourses] = useState<Course[]>([]);
  const [earnings, setEarnings] = useState<TutorEarnings | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [applyingCourseId, setApplyingCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // Active Tab & Sub-filters
  const [activeTab, setActiveTab] = useState("courses"); // "courses" | "templates" | "earnings"
  const [courseStatusFilter, setCourseStatusFilter] = useState<string>("all");

  const filteredCourses = React.useMemo(() => {
    return courses.filter((c) => {
      if (courseStatusFilter === "all") return true;
      if (courseStatusFilter === "draft") return c.status === "draft" && c.approval_status !== "pending" && c.approval_status !== "rejected";
      if (courseStatusFilter === "pending") return c.approval_status === "pending";
      if (courseStatusFilter === "published") return c.status === "published" || c.approval_status === "approved";
      if (courseStatusFilter === "rejected") return c.approval_status === "rejected";
      return true;
    });
  }, [courses, courseStatusFilter]);

  const fetchTutorData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const tutorCourses = await lmsDb.getCourses(user.id);
      setCourses(tutorCourses);

      const tutorEarnings = await lmsDb.getTutorEarnings(user.id);
      setEarnings(tutorEarnings);

      const tutorWithdrawals = await lmsDb.getWithdrawalRequests(user.id);
      setWithdrawals(tutorWithdrawals);

      // Fetch my course applications
      try {
        const res = await fetch("/api/tutor/courses/my-applications");
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {}

      // Fetch unassigned course templates
      try {
        const { createClient } = await import("../../../lib/supabase");
        const supabase = createClient();
        if (supabase) {
          const { data: tmplData } = await supabase
            .from("courses")
            .select("*")
            .is("tutor_id", null);
          setTemplates(tmplData || []);
        }
      } catch (err) {}
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load Tutor Studio data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTutorData();
    }
  }, [user, fetchTutorData]);

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !earnings) return;

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > earnings.available_balance) {
      toast.error("Insufficient balance");
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      await lmsDb.requestWithdrawal(user.id, amount);
      toast.success("Withdrawal request submitted successfully!");
      setWithdrawalAmount("");
      fetchTutorData(); // reload
    } catch (err: any) {
      console.error(err);
      toast.error("Withdrawal request failed");
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleApplyToTeach = async (courseId: string) => {
    if (!user) return;
    setApplyingCourseId(courseId);
    try {
      const res = await fetch("/api/tutor/courses/apply-to-teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, applicationNote: "Applied from Tutor Creator Studio." }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply to teach course template.");
      }
      toast.success("Application to teach submitted! Admin will review your credentials shortly.");
      fetchTutorData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setApplyingCourseId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "tutor") {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4 bg-card p-8 border border-border rounded-3xl shadow-sm">
          <FaGraduationCap className="text-5xl text-slate-700 mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Tutor Studio Locked</h2>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            Please register as an educator or log in with an approved tutor profile to access this dashboard.
          </p>
          <button
            onClick={() => router.push("/become-tutor")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg transition"
          >
            Become a Tutor
          </button>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const totalStudents = courses.reduce((acc, c) => acc + (c.lessons?.length || 0) * 3, 0); // simulated students based on lessons
  const totalEarnings = earnings?.total_earnings || 0;
  const balance = earnings?.available_balance || 0;

  return (
    <div className="py-6 flex justify-center">
      <div className="max-w-6xl w-full space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <FaChartLine className="text-blue-500" /> Tutor Creator Studio
            </h1>
            <p className="text-xs text-muted-foreground font-light">
              Create courses, apply to teach catalog templates, and manage student payouts.
            </p>
          </div>
          <Link
            href="/tutor/studio/create"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            <FaPlus className="text-[9px]" /> Create New Course
          </Link>
        </div>

        {/* Stats Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-xl">
              <FaBookOpen />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground/80 uppercase tracking-wider font-semibold">Total Courses</span>
              <h3 className="text-xl font-extrabold text-foreground font-mono mt-0.5">{courses.length}</h3>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xl">
              <FaGraduationCap />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground/80 uppercase tracking-wider font-semibold">Total Students</span>
              <h3 className="text-xl font-extrabold text-foreground font-mono mt-0.5">{totalStudents}</h3>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl text-xl">
              <FaCoins />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground/80 uppercase tracking-wider font-semibold">Total Earnings</span>
              <h3 className="text-xl font-extrabold text-foreground font-mono mt-0.5">₹{totalEarnings.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="space-y-6">
          <div className="flex border-b border-border text-xs font-semibold text-muted-foreground gap-2">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 border-b-2 transition ${
                activeTab === "courses" ? "border-blue-500 text-blue-400" : "border-transparent hover:text-white"
              }`}
            >
              My Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 border-b-2 transition ${
                activeTab === "templates" ? "border-blue-500 text-blue-400" : "border-transparent hover:text-white"
              }`}
            >
              Available Course Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`px-4 py-2 border-b-2 transition ${
                activeTab === "earnings" ? "border-blue-500 text-blue-400" : "border-transparent hover:text-white"
              }`}
            >
              Earnings & Payouts Ledger
            </button>
          </div>

          {/* Tab 1: Courses */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              {/* Status Sub-Filters */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                {[
                  { id: "all", label: `All (${courses.length})` },
                  { id: "draft", label: `Drafts (${courses.filter(c => c.status === "draft" && c.approval_status !== "pending" && c.approval_status !== "rejected").length})` },
                  { id: "pending", label: `Under Review (${courses.filter(c => c.approval_status === "pending").length})` },
                  { id: "published", label: `Published (${courses.filter(c => c.status === "published" || c.approval_status === "approved").length})` },
                  { id: "rejected", label: `Needs Revision (${courses.filter(c => c.approval_status === "rejected").length})` }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setCourseStatusFilter(sub.id)}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-lg border transition ${
                      courseStatusFilter === sub.id
                        ? "bg-blue-600/10 text-blue-400 border-blue-500/30"
                        : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {filteredCourses.length === 0 ? (
                <div className="bg-card border border-border shadow-md rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
                  <FaBookOpen className="text-5xl text-slate-700 mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">No Courses Found</h3>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    No courses match the selected status filter ({courseStatusFilter}).
                  </p>
                  <Link
                    href="/tutor/studio/create"
                    className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition"
                  >
                    Create Course
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => {
                    const isUnderReview = course.approval_status === "pending";
                    const isRejected = course.approval_status === "rejected";
                    const isPublished = course.status === "published" || course.approval_status === "approved";

                    return (
                      <div
                        key={course.id}
                        className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-border transition duration-300"
                      >
                        <div className="flex gap-4">
                          <div className="w-20 aspect-video rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center flex-shrink-0 border border-border">
                            {course.thumbnail ? (
                              /* eslint-disable-next-line @next/next/no-img-element -- Tutor course thumbnails are loaded dynamically from storage */
                              <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FaGraduationCap className="text-slate-800 text-2xl" />
                            )}
                          </div>
                          <div className="space-y-1.5 text-left">
                            <h4 className="text-sm font-bold text-foreground group-hover:text-blue-400 transition duration-300 truncate max-w-xs">{course.title}</h4>
                            <p className="text-[10px] text-muted-foreground font-light">
                              {course.category} • {course.level} • {course.lessons?.length || 0} Lessons
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="inline-block px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold uppercase rounded font-mono">
                                ₹{course.price}
                              </span>

                              {isUnderReview ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-bold uppercase rounded">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                  Under Review
                                </span>
                              ) : isRejected ? (
                                <span className="inline-block px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-bold uppercase rounded">
                                  Needs Revision
                                </span>
                              ) : isPublished ? (
                                <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase rounded">
                                  Published
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[9px] font-bold uppercase rounded">
                                  Draft
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push(`/tutor/studio/manage/${course.id}`)}
                          className="px-4 py-2 bg-card border border-border hover:bg-muted/60 hover:border-border text-foreground text-xs font-semibold rounded-lg transition flex items-center gap-1"
                        >
                          Manage <FaChevronRight className="text-[8px]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Available Course Templates */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="bg-card border border-border shadow-md rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
                  <FaBookOpen className="text-5xl text-slate-700 mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">No Templates Available</h3>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    All current course templates are already assigned to verified educators or under active review.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templates.map((tmpl) => {
                    const myApp = applications.find((a) => a.course_id === tmpl.id);
                    const isApplying = applyingCourseId === tmpl.id;

                    return (
                      <div
                        key={tmpl.id}
                        className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl p-5 flex flex-col justify-between gap-4 group"
                      >
                        <div className="space-y-2 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                              {tmpl.category}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase text-green-500 font-mono">
                              ₹{tmpl.selling_price || tmpl.price || 1299}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-foreground group-hover:text-blue-400 transition duration-300">
                            {tmpl.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {tmpl.subtitle || tmpl.description || "Official EduEarn curriculum template."}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
                            <span>Level: {tmpl.level || "Beginner"}</span>
                            <span>•</span>
                            <span>Duration: {tmpl.duration || "10 hours"}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <span className="text-[9.5px] text-muted-foreground italic">
                            Unassigned Catalog Template
                          </span>

                          {myApp?.status === "UNDER_REVIEW" ? (
                            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-extrabold uppercase tracking-wider rounded-lg">
                              Application Under Review
                            </span>
                          ) : myApp?.status === "APPROVED" ? (
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-extrabold uppercase tracking-wider rounded-lg">
                              Approved Educator
                            </span>
                          ) : myApp?.status === "REJECTED" ? (
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9.5px] font-bold uppercase rounded-lg">
                                Application Declined
                              </span>
                              <button
                                onClick={() => handleApplyToTeach(tmpl.id)}
                                disabled={isApplying}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                              >
                                Re-Apply
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApplyToTeach(tmpl.id)}
                              disabled={isApplying}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {isApplying ? "Submitting..." : "Apply to Teach"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Earnings Ledger */}
          {activeTab === "earnings" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Payout Balance & Request form */}
              <div className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FaWallet className="text-blue-500" /> Available Balance
                </h3>

                <div className="bg-background p-4 border border-border rounded-xl">
                  <span className="text-[9px] text-muted-foreground/80 uppercase tracking-widest font-semibold">Available for Payout</span>
                  <h2 className="text-3xl font-extrabold text-foreground font-mono mt-1">₹{balance.toLocaleString()}</h2>
                </div>

                <form onSubmit={handleWithdrawalRequest} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Request Payout Amount (INR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      min="500"
                      max={balance}
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-blue-500/10">
                    {submittingWithdrawal ? "Processing Request..." : "Request Payout"}
                  </button>
                </form>
              </div>

              {/* Right Column: Ledger Log Transactions */}
              <div className="lg:col-span-2 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Payout Withdrawal Requests History</h3>

                {withdrawals.length === 0 ? (
                  <p className="text-muted-foreground/80 text-xs text-center py-10 font-light">No withdrawal requests found.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {withdrawals.map((req) => (
                      <div key={req.id} className="bg-muted/40 p-4 border border-border rounded-xl flex justify-between items-center text-xs">
                        <div className="space-y-0.5 text-left">
                          <p className="font-bold text-foreground font-mono">₹{req.amount.toLocaleString()}</p>
                          <span className="text-[9px] text-muted-foreground/80">{new Date(req.created_at).toLocaleString()}</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            req.status === "approved"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : req.status === "rejected"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
