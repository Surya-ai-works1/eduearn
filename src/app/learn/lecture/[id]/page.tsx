"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLmsAuth } from "../../../../hooks/useLmsAuth";
import { lmsDb } from "../../../../lib/lmsDb";
import { createClient } from "../../../../lib/supabase";
import lmsApi from "../../../../lib/lmsApi";
import { toast } from "sonner";
import { useCourseContext } from "../../../../hooks/useCourseContext";
import {
  FaPlayCircle,
  FaCheckCircle,
  FaRegCircle,
  FaArrowLeft,
  FaAward,
  FaArrowRight,
  FaBook,
  FaCode,
  FaVideo,
  FaFileAlt
} from "react-icons/fa";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LecturePlayerPage({ params }: PageProps) {
  const { id: courseId } = use(params);
  const router = useRouter();
  const { lmsUser, isLoading: authLoading } = useLmsAuth();

  // Course & Lecture State
  const [course, setCourse] = useState<any>(null);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // Progress Tracking
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState("curriculum");

  // Certificate Modal State
  const [showCert, setShowCert] = useState(false);
  const [loadingCertUpload, setLoadingCertUpload] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  // --- AI States ---
  // Tutor
  const [tutorMessage, setTutorMessage] = useState("");
  const [tutorChat, setTutorChat] = useState<any[]>([]);
  const [loadingTutor, setLoadingTutor] = useState(false);

  // Planner
  const [studyPlan, setStudyPlan] = useState<any[] | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Notes
  const [aiNotes, setAiNotes] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Flashcards
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [aiFlashcards, setAiFlashcards] = useState<any[] | null>(null);

  // Mind Map
  const [loadingMindMap, setLoadingMindMap] = useState(false);
  const [aiMindMap, setAiMindMap] = useState<string | null>(null);

  // Quiz
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<any>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Doubt Solver
  const [doubtQuestion, setDoubtQuestion] = useState("");
  const [doubtCode, setDoubtCode] = useState("");
  const [doubtSolution, setDoubtSolution] = useState("");
  const [loadingDoubt, setLoadingDoubt] = useState(false);

  // --- Core features ---
  // Assignments
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [subContent, setSubContent] = useState("");
  const [subFileUrl, setSubFileUrl] = useState("");
  const [subStatus, setSubStatus] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(false);

  // Live Classes
  const [liveClasses, setLiveClasses] = useState<any[]>([]);

  // Fetch Course details
  const fetchCourseData = useCallback(async () => {
    try {
      setLoadingCourse(true);
      const courseData = await lmsDb.getCourseById(courseId);
      if (!courseData) {
        toast.error("Course not found");
        return;
      }

      const lessonsList = await lmsDb.getCourseLessons(courseId);
      courseData.lessons = lessonsList;

      setCourse(courseData);
      setAssignments(courseData.assignments || []);
      setLiveClasses(courseData.live_classes || []);

      if (lmsUser) {
        const supabaseClient = createClient();
        const { data: enrollment } = await supabaseClient
          .from("enrollments")
          .select("certificate_url")
          .eq("learner_id", lmsUser._id)
          .eq("course_id", courseId)
          .maybeSingle();

        if (enrollment?.certificate_url) {
          setCertificateUrl(enrollment.certificate_url);
        }
      }

      if (lessonsList && lessonsList.length > 0) {
        setSelectedLecture(lessonsList[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load course details");
    } finally {
      setLoadingCourse(false);
    }
  }, [courseId, lmsUser]);

  // Fetch Course Progress
  const fetchProgress = useCallback(async () => {
    if (!lmsUser) return;
    try {
      const { createClient } = await import("../../../../lib/supabase");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("learning_progress")
        .select("lesson_id")
        .eq("user_id", lmsUser._id)
        .eq("course_id", courseId);

      if (error) throw error;

      if (data && data.length > 0) {
        const dbCompleted = data.map((item: any) => item.lesson_id);
        setCompletedLectures(dbCompleted);
        const totalLessons = course?.lessons?.length || 0;
        setIsCompleted(totalLessons > 0 && dbCompleted.length === totalLessons);
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch progress from Supabase, trying LocalStorage fallback:", err);
    }

    try {
      const key = `eduearn_lms_progress_${lmsUser._id}_${courseId}`;
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : { completedLectures: [], isCompleted: false };
      setCompletedLectures(parsed.completedLectures || []);
      setIsCompleted(parsed.isCompleted || false);
    } catch (err) {
      console.error("Progress fetch fallback error:", err);
    }
  }, [courseId, lmsUser, course]);

  // Fetch Assignments & Live Classes (Stubbed since lmsDb fetches all in getCourseById)
  const fetchCourseDetails = async () => {};

  useEffect(() => {
    if (lmsUser) {
      fetchCourseData();
      fetchProgress();
    }
  }, [lmsUser, fetchCourseData, fetchProgress]);

  // Sync offline progress when coming online
  useEffect(() => {
    if (typeof window === "undefined" || !lmsUser) return;

    const syncOfflineProgress = async () => {
      const key = `eduearn_lms_progress_${lmsUser._id}_${courseId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return;

      try {
        const parsed = JSON.parse(stored);
        const completedList = parsed.completedLectures || [];
        if (completedList.length === 0) return;

        const { createClient } = await import("../../../../lib/supabase");
        const supabase = createClient();

        for (const lessonId of completedList) {
          await supabase
            .from("learning_progress")
            .upsert({ user_id: lmsUser._id, course_id: courseId, lesson_id: lessonId }, { onConflict: "user_id,lesson_id" });
        }

        toast.success("Synchronized offline progress with cloud!");
      } catch (err) {
        console.warn("Failed to synchronize offline progress:", err);
      }
    };

    window.addEventListener("online", syncOfflineProgress);
    if (navigator.onLine) {
      syncOfflineProgress();
    }

    return () => {
      window.removeEventListener("online", syncOfflineProgress);
    };
  }, [lmsUser, courseId]);

  const { setCourseContext, clearCourseContext } = useCourseContext();

  useEffect(() => {
    if (course) {
      setCourseContext({
        courseTitle: course.title,
        courseDescription: course.description || null,
        lessonTitle: selectedLecture?.title || null,
        chapter: selectedLecture?.section || "Syllabus Curriculum",
        subject: course.category || "Academic",
        currentPage: "Student Course Lecture Player",
        learningContext: `Active Lecture Content: ${selectedLecture?.content || ""}. Video URL: ${selectedLecture?.videoUrl || ""}.`
      });
    }
    return () => {
      clearCourseContext();
    };
  }, [course, selectedLecture, setCourseContext, clearCourseContext]);

  // Toggle Lecture Watch status
  const toggleLectureWatch = async (lectureId: string) => {
    if (!lmsUser) return;
    let completed = [...completedLectures];
    const isCurrentlyCompleted = completed.includes(lectureId);
    
    if (isCurrentlyCompleted) {
      completed = completed.filter(id => id !== lectureId);
    } else {
      completed.push(lectureId);
    }
    
    const totalLessons = course?.lessons?.length || 0;
    const isComp = totalLessons > 0 && completed.length === totalLessons;

    try {
      const { createClient } = await import("../../../../lib/supabase");
      const supabase = createClient();
      
      if (isCurrentlyCompleted) {
        const { error } = await supabase
          .from("learning_progress")
          .delete()
          .match({ user_id: lmsUser._id, course_id: courseId, lesson_id: lectureId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("learning_progress")
          .insert({ user_id: lmsUser._id, course_id: courseId, lesson_id: lectureId });
        if (error) throw error;
      }

      setCompletedLectures(completed);
      setIsCompleted(isComp);
      toast.success("Progress saved to cloud!");
    } catch (err) {
      console.warn("Supabase progress update failed, saving to LocalStorage fallback:", err);
      
      try {
        const key = `eduearn_lms_progress_${lmsUser._id}_${courseId}`;
        const progressData = { completedLectures: completed, isCompleted: isComp };
        localStorage.setItem(key, JSON.stringify(progressData));

        setCompletedLectures(completed);
        setIsCompleted(isComp);
        toast.success("Progress saved locally (offline)!");
      } catch (localErr) {
        console.error("Local progress save failed:", localErr);
        toast.error("Failed to update progress");
      }
    }
  };

  // Handle Tutor Chat Submit
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorMessage.trim()) return;

    const newMsg = { role: "user", text: tutorMessage };
    setTutorChat((prev) => [...prev, newMsg]);
    setTutorMessage("");
    setLoadingTutor(true);

    try {
      const res = await lmsApi.post("/ai/chat", {
        message: tutorMessage,
        history: tutorChat,
      });
      setTutorChat((prev) => [...prev, { role: "model", text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      toast.error("AI response failed");
    } finally {
      setLoadingTutor(false);
    }
  };

  // Generate Study Plan
  const handleGeneratePlan = async () => {
    if (!course) return;
    setLoadingPlan(true);
    try {
      const res = await lmsApi.post("/ai/generate-study-plan", {
        topic: course.title,
        commitment: "45 mins/day",
      });
      setStudyPlan(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate planner");
    } finally {
      setLoadingPlan(false);
    }
  };

  // Generate AI Notes
  const handleGenerateNotes = async () => {
    if (!selectedLecture || !course) return;
    setLoadingNotes(true);
    try {
      const res = await lmsApi.post("/ai/generate-notes", {
        topic: `${course.title} - ${selectedLecture.title}`,
      });
      setAiNotes(res.data.notes);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate notes");
    } finally {
      setLoadingNotes(false);
    }
  };

  // Generate AI Flashcards Mock
  const handleGenerateFlashcards = () => {
    if (!selectedLecture) return;
    setLoadingFlashcards(true);
    setTimeout(() => {
      setAiFlashcards([
        { front: "What is the primary function of this topic?", back: "To establish a clean, standard protocol check across modular interfaces." },
        { front: "State the key prerequisite constraint", back: "Understanding of variables and component nesting styles." },
        { front: "Which AI companion acts as the tutor?", back: "✨ Sparky AI, which runs contextual assistance prompts." }
      ]);
      setLoadingFlashcards(false);
      toast.success("Successfully generated 3 learning flashcards!");
    }, 900);
  };

  // Generate AI Mind Map Mock
  const handleGenerateMindMap = () => {
    if (!selectedLecture) return;
    setLoadingMindMap(true);
    setTimeout(() => {
      setAiMindMap(`[Topic: ${selectedLecture.title}]
 ├── 1. Core Prerequisites
 │    └── Variables & Binding
 ├── 2. Implementation details
 │    ├── Outlines Summarizer
 │    └── Self Assessment Quiz
 └── 3. Verified Certificates`);
      setLoadingMindMap(false);
      toast.success("AI Mind Map workflow processed successfully!");
    }, 900);
  };

  // Generate AI Quiz
  const handleGenerateQuiz = async () => {
    if (!selectedLecture || !course) return;
    setLoadingQuiz(true);
    setQuizSubmitted(false);
    setCurrentQuizAnswers({});
    try {
      const res = await lmsApi.post("/ai/generate-quiz", {
        topic: `${course.title} - ${selectedLecture.title}`,
      });
      setQuizQuestions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate quiz");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (currentQuizAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  // Solve Doubt
  const handleSolveDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;
    setLoadingDoubt(true);
    try {
      const res = await lmsApi.post("/ai/solve-doubt", {
        doubt: doubtQuestion,
        code: doubtCode,
      });
      setDoubtSolution(res.data.solution);
    } catch (err) {
      console.error(err);
      toast.error("AI Doubt solver failed");
    } finally {
      setLoadingDoubt(false);
    }
  };

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAssignmentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lmsUser || !selectedAssignment) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const allowedExtensions = ["pdf", "docx", "zip", "rar", "png", "jpg", "jpeg"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      toast.error("Invalid file type. Allowed: PDF, DOCX, ZIP, RAR, PNG, JPG");
      return;
    }

    setUploadProgress(0);
    setUploadError(null);

    try {
      const supabase = createClient();
      const uniqueName = `${lmsUser._id}_${selectedAssignment.id}_${Date.now()}.${ext}`;
      const filePath = `${uniqueName}`;

      const { error } = await supabase.storage
        .from("assignments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("assignments")
        .getPublicUrl(filePath);

      setSubFileUrl(publicUrl);
      setUploadProgress(100);
      toast.success("File uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Upload failed");
      toast.error("Upload failed");
    } finally {
      setTimeout(() => setUploadProgress(null), 3000);
    }
  };

  // Select assignment and check submission status
  const handleSelectAssignment = async (assign: any) => {
    setSelectedAssignment(assign);
    setSubContent("");
    setSubFileUrl("");
    setSubStatus(null);
    if (!lmsUser) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("assignment_id", assign.id)
        .eq("student_id", lmsUser._id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const sub = {
          content: data.content || "",
          fileUrl: data.file_url || "",
          submittedAt: data.created_at,
          status: "Submitted",
          grade: data.grade,
          feedback: data.feedback,
        };
        setSubStatus(sub);
        setSubContent(data.content || "");
        setSubFileUrl(data.file_url || "");
      }
    } catch (err) {
      console.error("Failed to load assignment submission:", err);
    }
  };

  // Submit Homework Assignment
  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmsUser || !selectedAssignment) return;
    setLoadingSub(true);
    try {
      const supabase = createClient();
      const subData = {
        assignment_id: selectedAssignment.id,
        student_id: lmsUser._id,
        content: subContent,
        file_url: subFileUrl,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("assignment_submissions")
        .upsert(subData, { onConflict: "assignment_id,student_id" })
        .select()
        .single();

      if (error) throw error;

      const sub = {
        content: data.content,
        fileUrl: data.file_url,
        submittedAt: data.created_at,
        status: "Submitted",
        grade: data.grade,
        feedback: data.feedback,
      };
      setSubStatus(sub);
      toast.success("Assignment submitted successfully!");

      if (lmsUser.email) {
        import("../../../../lib/email/client").then(({ emailClient }) => {
          emailClient.triggerAssignmentSubmissionEmail(
            lmsUser.email,
            lmsUser.name || "Student",
            selectedAssignment.title || "Assignment"
          );
        }).catch(err => console.error("Assignment email trigger failed:", err));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit assignment");
    } finally {
      setLoadingSub(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!lmsUser || !course) return;
    setLoadingCertUpload(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, 800, 600);

      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 15;
      ctx.strokeRect(20, 20, 760, 560);
      
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, 730, 530);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      
      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText("CERTIFICATE OF COMPLETION", 400, 120);

      ctx.font = "italic 16px serif";
      ctx.fillText("This is proudly presented to", 400, 180);

      ctx.font = "bold 36px sans-serif";
      ctx.fillStyle = "#eab308";
      ctx.fillText(lmsUser.name || "Learner Student", 400, 240);

      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText("for successfully completing the learning course", 400, 300);

      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(course.title, 400, 360);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#71717a";
      ctx.fillText(`Issued on: ${new Date().toLocaleDateString()}`, 400, 430);
      
      ctx.font = "italic 16px serif";
      ctx.fillStyle = "#eab308";
      ctx.fillText("EduSpark Academy", 400, 500);

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Canvas generation failed");
        
        const file = new File([blob], `certificate_${lmsUser._id}_${course.id}.png`, { type: "image/png" });
        const supabase = createClient();
        const uniquePath = `cert_${lmsUser._id}_${course.id}_${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("certificates")
          .upload(uniquePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("certificates")
          .getPublicUrl(uniquePath);

        const { error: dbError } = await supabase
          .from("enrollments")
          .update({ certificate_url: publicUrl })
          .match({ learner_id: lmsUser._id, course_id: course.id });

        if (dbError) throw dbError;

        setCertificateUrl(publicUrl);
        toast.success("Certificate generated and saved successfully!");

        if (lmsUser.email) {
          import("../../../../lib/email/client").then(({ emailClient }) => {
            emailClient.triggerCertificateEmail(
              lmsUser.email,
              lmsUser.name || "Student",
              course.title,
              publicUrl
            );
          }).catch(err => console.error("Certificate email failed:", err));
        }
      }, "image/png");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate certificate");
    } finally {
      setLoadingCertUpload(false);
    }
  };

  const totalLecturesCount = course?.lessons?.length || 0;
  const progressPercent =
    totalLecturesCount > 0
      ? Math.round((completedLectures.length / totalLecturesCount) * 100)
      : 0;

  if (authLoading || loadingCourse) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-lg font-bold text-red-400">Classroom Locked</h2>
          <p className="text-xs text-muted-foreground">Please enroll in this course to enter classroom.</p>
          <Link href="/learn/courses" className="text-xs text-blue-400 hover:underline">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 flex flex-col md:flex-row">
      
      {/* Main Video & Tab Content */}
      <div className="flex-1 p-6 space-y-6 md:max-w-[70%]">
        
        {/* Top bar header */}
        <div className="flex items-center justify-between bg-card p-4 border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/learn/course/${courseId}`)} className="text-muted-foreground hover:text-foreground transition">
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">{course.title}</h1>
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">{progressPercent}% Completed</p>
            </div>
          </div>

          {/* Claim Certificate if progress is 100% */}
          {progressPercent === 100 ? (
            <button
              onClick={() => setShowCert(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[10px] font-bold rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-1.5 animate-bounce"
            >
              <FaAward /> Claim Certificate
            </button>
          ) : (
            <div className="w-32 bg-slate-950 border border-border rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
            </div>
          )}
        </div>

        {/* Video Screen */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-border relative">
          {(selectedLecture?.video_url || selectedLecture?.videoUrl) ? (
            <video
              src={selectedLecture.video_url || selectedLecture.videoUrl}
              controls
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/80 text-xs font-light">
              {!course.lessons || course.lessons.length === 0
                ? "No syllabus uploaded yet."
                : "Please select a lecture topic from the syllabus to watch."}
            </div>
          )}
        </div>

        {/* Lecture description & mark complete */}
        <div className="flex items-center justify-between p-4 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl">
          <div>
            <h3 className="text-xs font-bold text-foreground">{selectedLecture?.title}</h3>
            <span className="text-[10px] text-muted-foreground/80">{course.category}</span>
          </div>

          {selectedLecture && (
            <button
              onClick={() => toggleLectureWatch(selectedLecture.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold border transition ${
                completedLectures.includes(selectedLecture.id)
                  ? "bg-green-950/20 border-green-500/30 text-green-400"
                  : "bg-slate-900 border-slate-850 text-muted-foreground hover:text-white"
              }`}
            >
              {completedLectures.includes(selectedLecture.id) ? (
                <>
                  <FaCheckCircle className="text-green-500" /> Completed
                </>
              ) : (
                <>
                  <FaRegCircle /> Mark Completed
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="space-y-4">
          <div className="flex flex-wrap border-b border-border text-xs font-medium text-muted-foreground gap-1">
            {[
              { id: "curriculum", label: "Syllabus" },
              { id: "ai-tutor", label: "🤖 AI Tutor" },
              { id: "ai-planner", label: "📅 AI Planner" },
              { id: "ai-notes", label: "✏️ AI Notes" },
              { id: "ai-quiz", label: "📝 AI Quiz" },
              { id: "doubt-solver", label: "💡 Doubt Solver" },
              { id: "assignments", label: "📂 Assignments" },
              { id: "live-classes", label: "🎥 Live Classes" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 hover:text-white border-b-2 transition ${
                  activeTab === tab.id ? "border-blue-500 text-blue-400 font-semibold" : "border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl min-h-[250px]">
            
            {/* Syllabus */}
            {activeTab === "curriculum" && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Course Outline</h3>
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {course.lessons.map((lecture: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedLecture(lecture)}
                        className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs transition ${
                          selectedLecture?.id === lecture.id
                            ? "bg-slate-900 border-blue-500/30 text-blue-400"
                            : "bg-muted/40 border-border hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <span className="truncate max-w-sm">{lecture.title}</span>
                        <span className="flex items-center gap-1.5">
                          {completedLectures.includes(lecture.id) ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaPlayCircle className="text-muted-foreground" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground/80 text-xs py-4 text-center">No syllabus uploaded yet.</p>
                )}
              </div>
            )}

            {/* AI Tutor Chat */}
            {activeTab === "ai-tutor" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Ask Sparky</h3>
                  <span className="text-[10px] bg-blue-950/30 border border-blue-500/20 px-2 py-0.5 rounded text-blue-400">Gemini 2.5 Flash</span>
                </div>

                <div className="h-64 overflow-y-auto bg-muted/40 border border-border p-4 rounded-xl space-y-4">
                  {tutorChat.length > 0 ? (
                    tutorChat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 rounded-xl max-w-md text-xs leading-relaxed ${
                          msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-muted text-foreground rounded-bl-none border border-border"
                        }`}>
                           {msg.text}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground/80 text-center py-10 text-xs">Ask questions about JavaScript variables, styling, or coding queries.</div>
                  )}
                  {loadingTutor && (
                    <div className="flex justify-start">
                      <div className="bg-muted border border-border p-3 rounded-xl rounded-bl-none flex items-center gap-2 text-xs text-foreground">
                        <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-blue-500"></div> Thinking...
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleTutorSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a doubt..."
                    className="flex-1 h-10 bg-background border border-border rounded-lg text-foreground text-xs px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    value={tutorMessage}
                    onChange={(e) => setTutorMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                    Ask
                  </button>
                </form>
              </div>
            )}

            {/* AI Study Planner */}
            {activeTab === "ai-planner" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-semibold">AI Study Roadmap</h3>
                  {!studyPlan && !loadingPlan && (
                    <button
                      onClick={handleGeneratePlan}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition">
                      Generate 7-Day Plan
                    </button>
                  )}
                </div>

                {loadingPlan && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="text-xs text-muted-foreground/80 font-light">Formulating customized planner roadmap...</span>
                  </div>
                )}

                {studyPlan && (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {studyPlan.map((d: any, index: number) => (
                      <div key={index} className="bg-muted/40 p-4 border border-border rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-blue-400">{d.day}</span>
                          <span className="text-muted-foreground/80">{d.objective}</span>
                        </div>
                        <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                          {d.tasks.map((task: string, tIdx: number) => (
                            <li key={tIdx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <button onClick={handleGeneratePlan} className="text-xs text-blue-400 hover:underline pt-2">
                      Re-generate Plan
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AI Notes */}
            {activeTab === "ai-notes" && (
              <div className="space-y-6">
                {/* 1. Outlines Summarizer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Notes Summarizer</h3>
                    <button
                      onClick={handleGenerateNotes}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition">
                      {loadingNotes ? "Summarizing..." : "Generate Notes"}
                    </button>
                  </div>

                  {loadingNotes && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="text-[10px] text-muted-foreground/80">Extracting content summaries...</span>
                    </div>
                  )}

                  {aiNotes && (
                    <div className="bg-muted/50 p-4 border border-border rounded-xl text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {aiNotes}
                    </div>
                  )}
                </div>

                {/* 2. AI Flashcards */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Flashcards</h3>
                    <button
                      onClick={handleGenerateFlashcards}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition">
                      {loadingFlashcards ? "Creating..." : "Generate Flashcards"}
                    </button>
                  </div>

                  {loadingFlashcards && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500"></div>
                      <span className="text-[10px] text-muted-foreground/80">Synthesizing study flashcards...</span>
                    </div>
                  )}

                  {aiFlashcards && (
                    <div className="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {aiFlashcards.map((card, idx) => (
                        <div key={idx} className="bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-xl space-y-1.5 text-left animate-fadeIn">
                          <span className="text-[9px] uppercase font-black text-emerald-500 block">Q{idx + 1}: {card.front}</span>
                          <p className="text-[10.5px] text-muted-foreground leading-normal font-semibold">A: {card.back}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. AI Mind Map */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Mind Map</h3>
                    <button
                      onClick={handleGenerateMindMap}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg transition">
                      {loadingMindMap ? "Generating..." : "Generate Mind Map"}
                    </button>
                  </div>

                  {loadingMindMap && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
                      <span className="text-[10px] text-muted-foreground/80">Drafting relational conceptual nodes...</span>
                    </div>
                  )}

                  {aiMindMap && (
                    <pre className="bg-purple-500/5 p-4 border border-purple-500/15 rounded-xl text-[10.5px] leading-relaxed text-muted-foreground font-mono whitespace-pre overflow-x-auto max-h-48 text-left">
                      {aiMindMap}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* AI Quiz */}
            {activeTab === "ai-quiz" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Self Assessment</h3>
                  <button
                    onClick={handleGenerateQuiz}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition">
                    {loadingQuiz ? "Analyzing..." : "Generate 5 MCQs"}
                  </button>
                </div>

                {loadingQuiz && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="text-xs text-muted-foreground/80">Generating questions...</span>
                  </div>
                )}

                {quizQuestions?.length > 0 && (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {quizQuestions.map((q: any, idx: number) => (
                      <div key={idx} className="bg-muted/40 p-4 border border-border rounded-xl space-y-2">
                        <p className="text-xs font-bold text-foreground">{idx + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt: string, oIdx: number) => (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => setCurrentQuizAnswers({ ...currentQuizAnswers, [idx]: oIdx })}
                              className={`p-2.5 rounded-lg border text-left text-xs transition ${
                                currentQuizAnswers[idx] === oIdx
                                  ? "bg-blue-600/20 border-blue-500 text-blue-400 font-semibold"
                                  : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        {quizSubmitted && (
                          <div className={`p-2 rounded-lg text-[10px] font-semibold ${q.correctIndex === currentQuizAnswers[idx] ? 'bg-green-950/20 text-green-400' : 'bg-red-950/20 text-red-400'}`}>
                            {q.correctIndex === currentQuizAnswers[idx] ? "Correct! " : `Incorrect (Correct index is: ${q.correctIndex}). `}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                        Submit Answers
                      </button>
                    ) : (
                      <div className="flex justify-between items-center text-xs bg-muted p-3 rounded-lg border border-border">
                        <span className="font-bold text-foreground font-mono">Score: {quizScore} / 5</span>
                        <button onClick={handleGenerateQuiz} className="text-blue-400 hover:underline">Try Another Quiz</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Doubt Solver */}
            {activeTab === "doubt-solver" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Doubt Debugger</h3>
                </div>

                <form onSubmit={handleSolveDoubt} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Describe your doubt</label>
                    <textarea
                      placeholder="e.g. Why does this loop execute infinitely?"
                      className="w-full bg-background border border-border rounded-lg text-foreground text-xs p-3 h-16 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                      value={doubtQuestion}
                      onChange={(e) => setDoubtQuestion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Code Snippet</label>
                    <textarea
                      placeholder="// Paste code block here..."
                      className="w-full bg-background border border-border rounded-lg text-foreground text-xs p-3 h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono resize-none"
                      value={doubtCode}
                      onChange={(e) => setDoubtCode(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                    {loadingDoubt ? "Analyzing..." : "Solve doubt"}
                  </button>
                </form>

                {doubtSolution && (
                  <div className="bg-muted/50 p-4 border border-border rounded-xl text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {doubtSolution}
                  </div>
                )}
              </div>
            )}

            {/* Assignments */}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Homework Projects</h3>
                
                {assignments?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {assignments.map((ass, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectAssignment(ass)}
                          className={`w-full p-3 rounded-lg border text-left text-xs transition ${
                            selectedAssignment?.id === ass.id
                              ? "bg-slate-900 border-blue-500/30 text-blue-400 font-semibold"
                              : "bg-muted/40 border-border hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <p className="font-bold">{ass.title}</p>
                          <span className="text-[9px] text-muted-foreground/80">Due: {ass.dueDate ? new Date(ass.dueDate).toLocaleDateString() : "No deadline"}</span>
                        </button>
                      ))}
                    </div>

                    {/* Submit Panel */}
                    <div className="bg-muted/40 p-4 border border-border rounded-xl space-y-4">
                      {selectedAssignment ? (
                        <>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{selectedAssignment.title}</h4>
                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{selectedAssignment.description}</p>
                            {selectedAssignment.fileUrl && (
                              <a href={selectedAssignment.fileUrl} target="_blank" rel="noreferrer" className="text-[9px] text-blue-400 underline block mt-2">
                                Download prompt details
                              </a>
                            )}
                          </div>

                          <form onSubmit={handleSubmissionSubmit} className="space-y-3 border-t border-border pt-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground">Answer details</label>
                              <textarea
                                placeholder="Write response notes or links..."
                                className="w-full bg-background border border-border rounded-lg text-foreground text-xs p-3 h-16 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                                value={subContent}
                                onChange={(e) => setSubContent(e.target.value)}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground">Attached Link (GitHub/Drive)</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="https://..."
                                  className="flex-1 h-8 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                  value={subFileUrl}
                                  onChange={(e) => setSubFileUrl(e.target.value)}
                                />
                                <label className="flex h-8 items-center justify-center bg-muted border border-border hover:border-primary/40 text-foreground hover:text-primary px-3 rounded-lg text-[10px] font-bold cursor-pointer select-none transition">
                                  <span>{uploadProgress !== null ? `${uploadProgress}%` : "Upload File"}</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleAssignmentFileUpload}
                                    disabled={uploadProgress !== null}
                                  />
                                </label>
                              </div>
                              {uploadError && <p className="text-[9px] text-red-500">{uploadError}</p>}
                            </div>

                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                              {loadingSub ? "Submitting..." : subStatus ? "Update Homework" : "Submit Homework"}
                            </button>
                          </form>

                          {subStatus && (
                            <div className="p-2.5 bg-muted border border-border rounded-lg text-[9px]">
                              <p className="font-bold text-foreground">Grading score: <span className="text-blue-400">{subStatus.grade || "Ungraded"}</span></p>
                              {subStatus.feedback && <p className="text-muted-foreground mt-1">Feedback: {subStatus.feedback}</p>}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground/80 text-[10px] text-center py-10">Select an assignment to view details and submit responses.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground/80 text-xs text-center py-6">No homework assignments created.</p>
                )}
              </div>
            )}

            {/* Live Classes */}
            {activeTab === "live-classes" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Live Classes</h3>
                
                {liveClasses?.length > 0 ? (
                  <div className="space-y-3">
                    {liveClasses.map((item: any, index: number) => (
                      <div key={index} className="bg-muted/40 p-4 border border-border rounded-xl flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                          <p className="text-[10px] text-muted-foreground/80">
                            {new Date(item.scheduledAt).toLocaleString()} ({item.duration || 60} mins)
                          </p>
                          <p className="text-[10px] text-muted-foreground font-light max-w-md">{item.description}</p>
                        </div>

                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Join Meeting
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground/80 text-xs text-center py-6">No live lectures scheduled.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Syllabus watch list (Desktop) */}
      <div className="hidden md:block w-[30%] bg-background border-l border-border p-6 space-y-6">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Course Syllabus</h2>
        
        <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
          {course.lessons?.length > 0 ? (
            course.lessons.map((lecture: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedLecture(lecture)}
                className={`w-full p-3 border rounded-xl text-left text-xs transition flex justify-between items-center gap-2 ${
                  selectedLecture?.id === lecture.id
                    ? "bg-slate-900 border-blue-500/30 text-blue-400"
                    : "bg-muted/40 border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <span className="truncate font-semibold">{lecture.title}</span>
                <span className="flex-shrink-0">
                  {completedLectures.includes(lecture.id) ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaPlayCircle className="text-slate-700" />
                  )}
                </span>
              </button>
            ))
          ) : (
            <p className="text-muted-foreground/80 text-xs pl-1">No syllabus uploaded yet.</p>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCert && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative">
            <h2 className="text-xl font-extrabold text-foreground">Course Completed! 🎉</h2>
            <div className="bg-background p-6 rounded-2xl border border-border flex flex-col items-center gap-3">
              <FaAward className="text-5xl text-yellow-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Certificate of Completion awarded to</p>
              <h3 className="text-lg font-bold text-foreground">{lmsUser?.name}</h3>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-light">
                For successfully completing the learning module:<br />
                <span className="font-semibold text-muted-foreground">{course.title}</span>
              </p>
            </div>
            <div className="flex gap-3">
              {certificateUrl ? (
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center"
                >
                  Download Certificate
                </a>
              ) : (
                <button
                  onClick={handleGenerateCertificate}
                  disabled={loadingCertUpload}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                  {loadingCertUpload ? "Generating..." : "Generate Certificate"}
                </button>
              )}
              <button
                onClick={() => setShowCert(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-muted-foreground text-xs font-semibold rounded-lg transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
