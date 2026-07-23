"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../hooks/useAuth";
import { lmsDb, Course, Lesson, Assignment, LiveClass } from "../../../../../lib/lmsDb";
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
  FaInfoCircle
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
  const [loading, setLoading] = useState(true);

  // Active Tab: "curriculum" | "assignments" | "live" | "settings"
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

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const data = await lmsDb.getCourseById(courseId);
      setCourse(data);
      if (data && data.title) {
        setAiTopic(data.title);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (user) {
      fetchCourse();
    }
  }, [user, fetchCourse]);

  // Handle Course status toggle
  const toggleCourseStatus = async () => {
    if (!course) return;
    const session = await getVerifiedSession();
    if (!session) return;
    const newStatus = course.status === "published" ? "draft" : "published";
    try {
      await lmsDb.updateCourse(course.id, { status: newStatus });
      setCourse({ ...course, status: newStatus });
      toast.success(`Course status updated to ${newStatus}!`);
    } catch (e) {
      toast.error("Failed to update status");
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
        
        {/* Back Link */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <Link href="/tutor/studio" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition">
            <FaArrowLeft /> Back to studio
          </Link>

          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${course.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {course.status}
            </span>
            <button
              onClick={toggleCourseStatus}
              className="px-3.5 py-1.5 bg-card border border-border hover:bg-muted/60 text-foreground text-xs font-semibold rounded-lg transition">
              Toggle {course.status === 'published' ? 'Draft' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Course Summary Card */}
        <div className="bg-card p-6 border border-border shadow-sm rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-lg font-extrabold text-foreground">{course.title}</h1>
            <p className="text-xs text-muted-foreground font-light mt-1 max-w-xl">{course.subtitle || "No subtitle provided."}</p>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground/80 block uppercase tracking-wider">Pricing</span>
            <h3 className="text-xl font-extrabold text-foreground font-mono mt-0.5">₹{course.price}</h3>
          </div>
        </div>

        {/* Tabs Menu */}
        <div className="space-y-6">
          <div className="flex border-b border-border text-xs font-semibold text-muted-foreground gap-2">
            {[
              { id: "curriculum", label: "Curriculum Syllabus" },
              { id: "assignments", label: "Assignments" },
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
