"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../hooks/useAuth";
import { lmsDb, Course, Lesson, Assignment, LiveClass } from "../../../../../lib/lmsDb";
import { quizManagementService } from "../../../../../lib/services/quizManagementService";
import { QuizItem } from "../../../../../lib/types/quizManagement";
import { createClient } from "../../../../../lib/supabase";
import lmsApi from "../../../../../lib/lmsApi";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaPlus,
  FaBookOpen,
  FaFileAlt,
  FaVideo,
  FaTrash,
  FaEdit,
  FaCloudUploadAlt,
  FaMagic,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaPaperPlane,
  FaQuestionCircle,
  FaShieldAlt,
  FaExclamationTriangle
} from "react-icons/fa";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManageCoursePage({ params }: PageProps) {
  const { id: courseId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  // Database State
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: "curriculum" | "assignments" | "quizzes" | "live"
  const [activeTab, setActiveTab] = useState("curriculum");

  // Form State: Add Lecture
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureVideo, setLectureVideo] = useState<File | null>(null);
  const [lectureVideoUrl, setLectureVideoUrl] = useState("");
  const [lectureDuration, setLectureDuration] = useState("");
  const [submittingLecture, setSubmittingLecture] = useState(false);

  // Form State: Add Assignment
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Form State: Add Quiz Creator
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassScore, setQuizPassScore] = useState("70");
  const [quizTimeLimit, setQuizTimeLimit] = useState("20");
  const [quizQText, setQuizQText] = useState("");
  const [quizOptA, setQuizOptA] = useState("");
  const [quizOptB, setQuizOptB] = useState("");
  const [quizOptC, setQuizOptC] = useState("");
  const [quizOptD, setQuizOptD] = useState("");
  const [quizCorrectIdx, setQuizCorrectIdx] = useState(0);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Form State: Add Live Class
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDesc, setLiveDesc] = useState("");
  const [liveDate, setLiveDate] = useState("");
  const [liveDur, setLiveDur] = useState("60");
  const [liveLink, setLiveLink] = useState("");
  const [submittingLive, setSubmittingLive] = useState(false);

  // AI Course Builder Outline
  const [aiTopic, setAiTopic] = useState("");
  const [generatingOutline, setGeneratingOutline] = useState(false);

  const getVerifiedSession = async () => {
    const supabase = createClient();
    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          return null;
        }
        return refreshData.session;
      }
      return session;
    } catch {
      toast.error("Authentication check failed.");
      return null;
    }
  };

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await quizManagementService.getQuizzes(courseId);
      setQuizzes(res.items || []);
    } catch (err) {
      console.warn("Failed to fetch quizzes:", err);
    }
  }, [courseId]);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const data = await lmsDb.getCourseById(courseId);
      setCourse(data);
      if (data && data.title) {
        setAiTopic(data.title);
      }
      fetchQuizzes();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  }, [courseId, fetchQuizzes]);

  useEffect(() => {
    if (user) {
      fetchCourse();
    }
  }, [user, fetchCourse]);

  // Review Readiness Checklist Calculation
  const hasTitle = Boolean(course?.title && course.title.trim().length >= 3);
  const hasSubtitle = Boolean(course?.subtitle && course.subtitle.trim().length >= 5);
  const hasCategoryLevel = Boolean(course?.category && course?.level);
  const hasLessons = Boolean((course?.lessons?.length || 0) > 0);
  const hasAssessment = Boolean((course?.assignments?.length || 0) > 0 || (quizzes?.length || 0) > 0);
  const hasTutor = Boolean(user && user.role === "tutor");

  const checklistItems = [
    { label: "Course Title & Overview", ok: hasTitle },
    { label: "Category & Complexity Level", ok: hasCategoryLevel },
    { label: "Short Subtitle Summary", ok: hasSubtitle },
    { label: "Curriculum Lecture Video(s)", ok: hasLessons },
    { label: "Homework Assignment or Quiz", ok: hasAssessment },
    { label: "Verified Educator Profile", ok: hasTutor },
  ];

  const completedCount = checklistItems.filter((i) => i.ok).length;
  const isReadyForReview = completedCount === checklistItems.length;

  // Handle Course submission for admin review
  const handleSubmitForReview = async () => {
    if (!course) return;
    const session = await getVerifiedSession();
    if (!session) return;

    if (!isReadyForReview) {
      toast.error("Please complete all course readiness checklist items before submitting for review.");
      return;
    }

    try {
      await lmsDb.updateCourse(course.id, { approval_status: "pending" });
      setCourse({ ...course, approval_status: "pending" });
      toast.success("Submitted for Admin Review! EduEarn administrators will inspect your course before publishing.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit course for review");
    }
  };

  // Upload Video File to Supabase
  const uploadVideo = async (file: File): Promise<string> => {
    try {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video size must be less than 50MB");
        throw new Error("File size limit exceeded");
      }

      const allowedExts = ["mp4", "webm", "ogg", "avi", "mkv"];
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (!fileExt || !allowedExts.includes(fileExt)) {
        toast.error("Invalid video format. Allowed: MP4, WEBM, OGG, AVI, MKV");
        throw new Error("Invalid file extension");
      }

      const supabase = createClient();
      const session = await getVerifiedSession();
      if (!session) throw new Error("Unauthenticated session");

      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from("course-videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("course-videos")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (e: any) {
      console.warn("Storage upload failed, falling back to local file preview:", e);
      return URL.createObjectURL(file); // fallback to object URL
    }
  };

  // Add Lecture
  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    const session = await getVerifiedSession();
    if (!session) return;

    if (!lectureTitle.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    setSubmittingLecture(true);
    try {
      let finalVideoUrl = lectureVideoUrl;
      if (lectureVideo) {
        finalVideoUrl = await uploadVideo(lectureVideo);
      }

      const nextOrder = (course.lessons?.length || 0) + 1;
      await lmsDb.addLesson(course.id, {
        title: lectureTitle,
        video_url: finalVideoUrl || undefined,
        duration: parseFloat(lectureDuration) || 0,
        lesson_order: nextOrder,
        position: nextOrder,
      });

      toast.success("Lecture lesson added successfully!");
      setLectureTitle("");
      setLectureVideo(null);
      setLectureVideoUrl("");
      setLectureDuration("");
      fetchCourse(); // reload
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to add lecture");
    } finally {
      setSubmittingLecture(false);
    }
  };

  // Delete Lecture
  const handleDeleteLecture = async (lessonId: string) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    const session = await getVerifiedSession();
    if (!session) return;

    try {
      await lmsDb.deleteLesson(lessonId);
      toast.success("Lecture deleted successfully");
      fetchCourse();
    } catch (err) {
      toast.error("Failed to delete lecture");
    }
  };

  // Add Assignment
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    const session = await getVerifiedSession();
    if (!session) return;

    if (!assignTitle.trim()) {
      toast.error("Assignment title is required");
      return;
    }

    setSubmittingAssign(true);
    try {
      await lmsDb.addAssignment(course.id, {
        title: assignTitle,
        description: assignDesc || undefined,
        due_date: assignDueDate ? new Date(assignDueDate).toISOString() : undefined,
      });

      toast.success("Homework assignment created successfully!");
      setAssignTitle("");
      setAssignDesc("");
      setAssignDueDate("");
      fetchCourse();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to create assignment");
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Add Quiz Creator
  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    const session = await getVerifiedSession();
    if (!session) return;

    if (!quizTitle.trim() || !quizQText.trim() || !quizOptA.trim() || !quizOptB.trim()) {
      toast.error("Quiz title, question text, and at least 2 options are required.");
      return;
    }

    setSubmittingQuiz(true);
    try {
      const options = [quizOptA, quizOptB, quizOptC, quizOptD].filter((o) => o.trim().length > 0);
      await quizManagementService.createQuiz(course.id, {
        title: quizTitle,
        description: `Assessment quiz for ${course.title}`,
        passingScore: parseFloat(quizPassScore) || 70,
        timeLimit: parseFloat(quizTimeLimit) || 20,
        status: "published",
        questions: [
          {
            id: `q-${Date.now()}`,
            text: quizQText,
            type: "single",
            options,
            correctAnswers: [quizCorrectIdx],
          },
        ],
      });

      toast.success("Quiz assessment created successfully!");
      setQuizTitle("");
      setQuizQText("");
      setQuizOptA("");
      setQuizOptB("");
      setQuizOptC("");
      setQuizOptD("");
      fetchCourse();
      fetchQuizzes();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to create quiz assessment");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Add Live Class
  const handleAddLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    const session = await getVerifiedSession();
    if (!session) return;

    if (!liveTitle.trim() || !liveDate || !liveLink.trim()) {
      toast.error("Required fields missing");
      return;
    }

    setSubmittingLive(true);
    try {
      await lmsDb.addLiveClass(course.id, session.user.id, {
        title: liveTitle,
        description: liveDesc || undefined,
        scheduled_at: new Date(liveDate).toISOString(),
        duration: parseFloat(liveDur) || 60,
        meeting_link: liveLink,
      });

      toast.success("Live class scheduled successfully!");
      setLiveTitle("");
      setLiveDesc("");
      setLiveDate("");
      setLiveLink("");
      fetchCourse();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to schedule live class");
    } finally {
      setSubmittingLive(false);
    }
  };

  // AI Syllabus Outline Generator
  const handleAiCourseBuilder = async () => {
    if (!course || !aiTopic.trim()) return;

    const session = await getVerifiedSession();
    if (!session) return;

    setGeneratingOutline(true);
    try {
      const res = await lmsApi.post("/ai/generate-study-plan", {
        topic: aiTopic,
        commitment: "Full Syllabus",
      });

      const generatedPlan = res.data || [];
      if (generatedPlan.length > 0) {
        // Automatically insert the generated days as lessons/lectures into database!
        for (let i = 0; i < Math.min(generatedPlan.length, 7); i++) {
          const plan = generatedPlan[i];
          await lmsDb.addLesson(course.id, {
            title: `${plan.day}: ${plan.objective}`,
            description: plan.topics?.join(", ") || "",
            duration: 45,
            lesson_order: i + 1,
            position: i + 1,
          });
        }
        toast.success("AI generated course outline created successfully in syllabus!");
        fetchCourse();
      } else {
        toast.error("Failed to parse AI structure");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI Course Builder failed");
    } finally {
      setGeneratingOutline(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-bold text-red-400">Course Not Found</h2>
          <Link href="/tutor/studio" className="text-xs text-blue-400 hover:underline">
            Back to Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex justify-center">
      <div className="max-w-5xl w-full space-y-8">
        
        {/* Back Link & Review Readiness Action Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <Link href="/tutor/studio" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition">
            <FaArrowLeft /> Back to studio
          </Link>

          <div className="flex items-center gap-3">
            {course.approval_status === "pending" ? (
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5">
                <FaClock className="animate-pulse text-xs" /> Under Admin Review
              </span>
            ) : course.status === "published" || course.approval_status === "approved" ? (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5">
                <FaCheckCircle className="text-xs" /> Published & Live
              </span>
            ) : course.approval_status === "rejected" ? (
              <button
                onClick={handleSubmitForReview}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
              >
                <FaPaperPlane className="text-xs" /> Re-submit for Review
              </button>
            ) : (
              <button
                onClick={handleSubmitForReview}
                disabled={!isReadyForReview}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  isReadyForReview
                    ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-500/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                }`}
              >
                <FaPaperPlane className="text-xs" /> Submit for Admin Review
              </button>
            )}
          </div>
        </div>

        {/* Review Status Banner */}
        {course.approval_status === "pending" && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-amber-400 text-xs">
            <FaClock className="text-base mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Course Under Admin Moderation</p>
              <p className="text-[11px] text-amber-300/80 leading-normal mt-0.5">
                Your syllabus and course materials have been submitted to EduEarn administration. Administrators review content completeness at <span className="font-mono text-white">/admin/dashboard?tab=courses</span> before making the course live to students.
              </p>
            </div>
          </div>
        )}

        {course.approval_status === "rejected" && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-start gap-3 text-rose-400 text-xs">
            <FaExclamationTriangle className="text-base mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Revisions Requested by Administrator</p>
              <p className="text-[11px] text-rose-300/80 leading-normal mt-0.5">
                The EduEarn moderation team requested updates before this course can be approved. Please review your lectures, video links, or assessments, and click <strong>Re-submit for Review</strong> above.
              </p>
            </div>
          </div>
        )}

        {/* Course Summary & Review Readiness Checklist Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 bg-card p-6 border border-border shadow-sm rounded-3xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-lg font-extrabold text-foreground">{course.title}</h1>
                <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  ₹{course.price}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">{course.subtitle || "No subtitle provided."}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold pt-2">
                <span className="px-2 py-0.5 bg-muted rounded border border-border">{course.category}</span>
                <span className="px-2 py-0.5 bg-muted rounded border border-border">{course.level} Level</span>
                <span>{course.lessons?.length || 0} Lectures</span>
              </div>
            </div>
          </div>

          {/* Review Readiness Checklist Widget */}
          <div className="bg-card p-5 border border-border shadow-sm rounded-3xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FaShieldAlt className="text-blue-500" /> Review Readiness
              </h3>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono ${isReadyForReview ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {completedCount}/{checklistItems.length} Ready
              </span>
            </div>

            {/* Readiness progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isReadyForReview ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
              ></div>
            </div>

            <div className="space-y-1.5 pt-1">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate max-w-[80%]">{item.label}</span>
                  {item.ok ? (
                    <FaCheckCircle className="text-emerald-500 text-xs flex-shrink-0" />
                  ) : (
                    <span className="text-[9px] text-amber-500 font-bold uppercase">Missing</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Menu */}
        <div className="space-y-6">
          <div className="flex border-b border-border text-xs font-semibold text-muted-foreground gap-2">
            {[
              { id: "curriculum", label: "Curriculum Syllabus" },
              { id: "assignments", label: "Assignments" },
              { id: "quizzes", label: `Quizzes & Assessments (${quizzes.length})` },
              { id: "live", label: "Live Classrooms" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 border-b-2 transition ${
                  activeTab === t.id ? "border-blue-500 text-blue-400" : "border-transparent hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: CURRICULUM SYLLABUS */}
          {activeTab === "curriculum" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Syllabus Lists */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Course Syllabus Lectures</h3>

                {course.lessons?.length === 0 ? (
                  <div className="bg-card p-8 border border-border rounded-2xl text-center text-muted-foreground/80 text-xs font-light shadow-sm">
                    No lectures uploaded. Use the outline form or AI builder to get started.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {course.lessons?.map((lec) => (
                      <div key={lec.id} className="bg-muted/40 p-4 border border-border rounded-xl flex justify-between items-center text-xs">
                        <div className="truncate max-w-[70%]">
                          <p className="font-bold text-foreground truncate">{lec.title}</p>
                          {lec.video_url && <span className="text-[10px] text-blue-400 block mt-1 underline truncate">{lec.video_url}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteLecture(lec.id)}
                            className="p-2 bg-muted border border-border hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500/30 text-foreground hover:text-red-500 rounded-lg transition"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Course Builder card */}
                <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:to-slate-900/10 p-6 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-4 relative overflow-hidden shadow-sm dark:shadow-none">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FaMagic className="text-yellow-500" /> Sparky AI Course Builder
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-1 max-w-md">
                      Enter a topic and automatically generate a structured, 7-day module outline directly in your syllabus timeline.
                    </p>
                  </div>
                  <div className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder="e.g. Intermediate Python structures"
                      className="flex-grow h-9 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                    />
                    <button
                      onClick={handleAiCourseBuilder}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
                      {generatingOutline ? "Creating..." : "Build Syllabus"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Lecture Form */}
              <div className="bg-card p-6 border border-border rounded-2xl space-y-4 text-left shadow-sm">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FaVideo className="text-blue-500" /> Upload Lecture
                </h3>

                <form onSubmit={handleAddLecture} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Lecture Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. 1. Introduction to state hooks"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={lectureTitle}
                      onChange={(e) => setLectureTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Lesson Duration (minutes)</label>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                      value={lectureDuration}
                      onChange={(e) => setLectureDuration(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Lecture Video File</label>
                    <div className="relative h-10 border border-border bg-background rounded-lg flex items-center justify-center text-xs font-semibold hover:border-border transition cursor-pointer">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <FaCloudUploadAlt className="text-sm" /> {lectureVideo ? lectureVideo.name : "Select Video File"}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => e.target.files && setLectureVideo(e.target.files[0])}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
                    {submittingLecture ? "Adding Lecture..." : "Add Lecture"}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: ASSIGNMENTS */}
          {activeTab === "assignments" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Assignment list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Homework Projects</h3>

                {course.assignments?.length === 0 ? (
                  <p className="text-muted-foreground/80 text-xs text-center py-10 font-light">No assignments created yet.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {course.assignments?.map((ass) => (
                      <div key={ass.id} className="bg-muted/40 p-4 border border-border rounded-xl text-xs space-y-1.5 text-left">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-foreground">{ass.title}</p>
                          <span className="text-[10px] text-muted-foreground/80">Due: {ass.due_date ? new Date(ass.due_date).toLocaleDateString() : "No deadline"}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-light leading-normal">{ass.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Assignment form */}
              <div className="bg-card p-6 border border-border rounded-2xl space-y-4 text-left shadow-sm">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FaFileAlt className="text-blue-500" /> Create Assignment
                </h3>

                <form onSubmit={handleAddAssignment} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Assignment Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Build dynamic calculator"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={assignTitle}
                      onChange={(e) => setAssignTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Description instructions</label>
                    <textarea
                      placeholder="Specify homework constraints..."
                      className="w-full h-16 bg-background border border-border rounded-lg text-foreground text-xs p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      value={assignDesc}
                      onChange={(e) => setAssignDesc(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Due Deadline Date</label>
                    <input
                      type="date"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
                    {submittingAssign ? "Creating..." : "Create Assignment"}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 3: QUIZZES & ASSESSMENTS */}
          {activeTab === "quizzes" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* Quizzes List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Course Quizzes & Assessments</h3>

                {quizzes.length === 0 ? (
                  <div className="bg-card p-8 border border-border rounded-2xl text-center text-muted-foreground/80 text-xs font-light shadow-sm">
                    No quizzes created yet. Use the assessment builder form on the right to add interactive quizzes.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {quizzes.map((q) => (
                      <div key={q.id} className="bg-muted/40 p-5 border border-border rounded-xl text-xs space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                            <FaQuestionCircle className="text-blue-500" /> {q.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded">
                              {q.timeLimit || 20} Mins
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">
                              Pass: {q.passingScore}%
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{q.description}</p>
                        {q.questions && q.questions.length > 0 && (
                          <div className="pt-2 border-t border-border/50 text-[11px] text-foreground font-medium">
                            <span className="text-muted-foreground font-light">Questions count:</span> {q.questions.length} • Sample: &quot;{q.questions[0].text}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Quiz Creator Form */}
              <div className="bg-card p-6 border border-border rounded-2xl space-y-4 text-left shadow-sm">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FaQuestionCircle className="text-blue-500" /> Create Quiz Assessment
                </h3>

                <form onSubmit={handleAddQuiz} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Quiz Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Unit 1 Mastery Check"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground font-bold uppercase">Passing Score (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                        value={quizPassScore}
                        onChange={(e) => setQuizPassScore(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground font-bold uppercase">Time Limit (Mins)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                        value={quizTimeLimit}
                        onChange={(e) => setQuizTimeLimit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-border">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Question #1 Text *</label>
                    <textarea
                      placeholder="Enter question text..."
                      className="w-full h-14 bg-background border border-border rounded-lg text-foreground text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      value={quizQText}
                      onChange={(e) => setQuizQText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Options & Correct Selection *</label>
                    <div className="space-y-1.5">
                      {[
                        { val: quizOptA, set: setQuizOptA, idx: 0, label: "Option A" },
                        { val: quizOptB, set: setQuizOptB, idx: 1, label: "Option B" },
                        { val: quizOptC, set: setQuizOptC, idx: 2, label: "Option C" },
                        { val: quizOptD, set: setQuizOptD, idx: 3, label: "Option D" },
                      ].map((opt) => (
                        <div key={opt.idx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={quizCorrectIdx === opt.idx}
                            onChange={() => setQuizCorrectIdx(opt.idx)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder={`${opt.label}...`}
                            className="flex-grow h-9 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={opt.val}
                            onChange={(e) => opt.set(e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-muted-foreground">Select radio button for the correct answer index.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
                    {submittingQuiz ? "Saving Quiz..." : "Save Quiz Assessment"}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 3: LIVE CLASSROOMS */}
          {activeTab === "live" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Live listing */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Scheduled Live Sessions</h3>

                {course.live_classes?.length === 0 ? (
                  <p className="text-muted-foreground/80 text-xs text-center py-10 font-light">No live classrooms scheduled.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {course.live_classes?.map((item) => (
                      <div key={item.id} className="bg-muted/40 p-4 border border-border rounded-xl text-xs flex justify-between items-center text-left">
                        <div className="space-y-1 max-w-[70%]">
                          <p className="font-bold text-foreground">{item.title}</p>
                          <span className="text-[10px] text-muted-foreground/80 block">
                            {new Date(item.scheduled_at).toLocaleString()} ({item.duration} mins)
                          </span>
                          <span className="text-[10px] text-blue-400 block underline truncate">{item.meeting_link}</span>
                        </div>
                        <a href={item.meeting_link} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 bg-card border border-border hover:bg-muted/60 hover:border-border text-foreground font-bold rounded-lg transition">
                          Launch
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule Live form */}
              <div className="bg-card p-6 border border-border rounded-2xl space-y-4 text-left shadow-sm">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FaVideo className="text-blue-500" /> Schedule Live Class
                </h3>

                <form onSubmit={handleAddLiveClass} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Class Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Q&A and doubt resolving"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Meeting Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={liveDate}
                      onChange={(e) => setLiveDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground font-bold uppercase">Duration (mins)</label>
                      <input
                        type="number"
                        className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                        value={liveDur}
                        onChange={(e) => setLiveDur(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground font-bold uppercase">Meeting Link *</label>
                      <input
                        type="text"
                        placeholder="https://zoom.us/..."
                        className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={liveLink}
                        onChange={(e) => setLiveLink(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
                    {submittingLive ? "Scheduling..." : "Schedule Session"}
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
