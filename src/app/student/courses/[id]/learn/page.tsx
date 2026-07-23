"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  CheckCircle,
  Lock,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Bookmark,
  FileText,
  Clock,
  ArrowLeft,
  ChevronDown,
  Info,
  Layers,
  Edit2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { PageWrapper } from "../../../../../components/layout/PageWrapper";
import { Button } from "../../../../../components/ui/button";
import { RequireLearner } from "../../../../../features/auth/components/RouteGuard";
import { MOCK_COURSES } from "../../../../../constants/mockData";
import { useCourseContext } from "../../../../../hooks/useCourseContext";

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Note {
  id: string;
  lessonId: string;
  timestamp: string; // "MM:SS"
  timestampSeconds: number;
  text: string;
}

interface CourseBookmark {
  id: string;
  lessonId: string;
  lessonTitle: string;
  timestamp: string;
  timestampSeconds: number;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function CourseLearnPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  // Retrieve course data
  const course = MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];

  // Video playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds
  const [duration] = useState<number>(360); // 6 mins total
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);

  // Curriculum and Lesson selection
  const [activeLessonId, setActiveLessonId] = useState<string>("lesson-1");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "module-1": true,
  });

  // Tools panels tabs
  const [activeToolTab, setActiveToolTab] = useState<"overview" | "resources" | "notes" | "bookmarks">("overview");

  // Notes state
  const [notes, setNotes] = useState<Note[]>([
    { id: "note-1", lessonId: "lesson-1", timestamp: "01:15", timestampSeconds: 75, text: "Important review on state updates vs memoization." },
  ]);
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>("");

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<CourseBookmark[]>([
    { id: "bmark-1", lessonId: "lesson-1", lessonTitle: "Introduction to Syllabus Modules", timestamp: "00:45", timestampSeconds: 45 },
  ]);

  // ID counters for purity
  const [noteIdCounter, setNoteIdCounter] = useState(10);
  const [bookmarkIdCounter, setBookmarkIdCounter] = useState(10);

  // Video reference
  const videoProgressRef = useRef<HTMLDivElement>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── MOCK CURRICULUM DATA ──────────────────────────────────────────────────

  const modules: Module[] = [
    {
      id: "module-1",
      title: "Module 1: Getting Started & Setup",
      lessons: [
        { id: "lesson-1", title: "Introduction to Syllabus Modules", duration: "06:00", completed: true, locked: false },
        { id: "lesson-2", title: "Setting Up Your Workspace & Tools", duration: "12:15", completed: true, locked: false },
        { id: "lesson-3", title: "Hello World: First Coding Exercise", duration: "08:45", completed: false, locked: false },
      ],
    },
    {
      id: "module-2",
      title: "Module 2: Advanced Core Concepts",
      lessons: [
        { id: "lesson-4", title: "Data Bindings and State Handlers", duration: "15:30", completed: false, locked: false },
        { id: "lesson-5", title: "API Integrations and Hooks", duration: "18:20", completed: false, locked: true },
        { id: "lesson-6", title: "Syllabus Clearance Quiz Overview", duration: "05:10", completed: false, locked: true },
      ],
    },
  ];

  const activeLesson = modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === activeLessonId) || modules[0].lessons[0];

  // ─── PLAYBACK SIMULATION TIMER ─────────────────────────────────────────────

  useEffect(() => {
    if (isPlaying) {
      videoIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (videoIntervalRef.current) {
              clearInterval(videoIntervalRef.current);
            }
            return duration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
      }
    }
    return () => {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
      }
    };
  }, [isPlaying, duration, playbackSpeed]);

  const { setCourseContext, clearCourseContext } = useCourseContext();

  useEffect(() => {
    if (course) {
      setCourseContext({
        courseTitle: course.title,
        courseDescription: course.description || null,
        lessonTitle: activeLesson?.title || null,
        chapter: "Module 1",
        subject: course.category || "Academic",
        currentPage: "Student Course Learn Workspace",
        learningContext: `Currently watching: ${activeLesson?.title || ""}. Duration: ${activeLesson?.duration || ""}.`
      });
    }
    return () => {
      clearCourseContext();
    };
  }, [course, activeLesson, setCourseContext, clearCourseContext]);

  // Format time (seconds to MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Jump to specific time
  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    toast.info(`Seeking timeline to ${formatTime(seconds)}`);
  };

  // Click timeline handler
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoProgressRef.current) {
      const rect = videoProgressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      seekTo(Math.floor(percentage * duration));
    }
  };

  // ─── ADDING NOTES & BOOKMARKS ──────────────────────────────────────────────

  const handleAddNote = () => {
    if (!newNoteText.trim()) {
      toast.error("Please enter a note.");
      return;
    }
    const timestampStr = formatTime(currentTime);
    const nextId = noteIdCounter + 1;
    setNoteIdCounter(nextId);
    
    const newNote: Note = {
      id: `note-${nextId}`,
      lessonId: activeLessonId,
      timestamp: timestampStr,
      timestampSeconds: currentTime,
      text: newNoteText,
    };
    setNotes((prev) => [...prev, newNote]);
    setNewNoteText("");
    toast.success(`Note captured at ${timestampStr}`);
  };

  const handleAddBookmark = () => {
    const timestampStr = formatTime(currentTime);
    const isAlreadyBookmarked = bookmarks.some(
      (b) => b.lessonId === activeLessonId && Math.abs(b.timestampSeconds - currentTime) < 2
    );

    if (isAlreadyBookmarked) {
      toast.error("A bookmark already exists at this timestamp.");
      return;
    }

    const nextId = bookmarkIdCounter + 1;
    setBookmarkIdCounter(nextId);

    const newBookmark: CourseBookmark = {
      id: `bmark-${nextId}`,
      lessonId: activeLessonId,
      lessonTitle: activeLesson.title,
      timestamp: timestampStr,
      timestampSeconds: currentTime,
    };

    setBookmarks((prev) => [...prev, newBookmark]);
    toast.success(`Bookmark saved at ${timestampStr}`);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success("Note removed.");
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast.success("Bookmark removed.");
  };

  const handleSaveEditNote = (id: string) => {
    if (!editingNoteText.trim()) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text: editingNoteText } : n))
    );
    setEditingNoteId(null);
    setEditingNoteText("");
    toast.success("Note updated.");
  };

  return (
    <RequireLearner>
      <PageWrapper>
        <div className="min-h-[92vh] bg-background text-foreground flex flex-col lg:flex-row relative">
          
          {/* LEFT COLUMN: Video Player & Tools Panel */}
          <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 gap-6">
            
            {/* Nav Header breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground select-none">
              <button
                onClick={() => router.push("/student/dashboard")}
                className="flex items-center gap-1 hover:text-foreground cursor-pointer focus:outline-none"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </button>
              <span>/</span>
              <span className="text-foreground truncate max-w-[200px]" title={course.title}>
                {course.title}
              </span>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video w-full rounded-card border border-border bg-slate-950 overflow-hidden shadow-floating group select-none">
              {/* Fake Video Screen Graphic */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 text-center p-6">
                <BookOpen size={48} className="text-primary/20 animate-pulse mb-3" />
                <span className="text-xs font-heading font-extrabold text-foreground tracking-wide">
                  {course.title}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1.5 max-w-xs">
                  Currently playing: <strong className="text-white">{activeLesson.title}</strong>
                </p>

                {/* Subtitles Overlay */}
                {showCaptions && isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-4 py-2 rounded-lg backdrop-blur border border-white/10 text-center max-w-md pointer-events-none"
                  >
                    {currentTime < 10
                      ? "[Instructor] Welcome back! In this section we will setup our development workflow."
                      : currentTime < 25
                        ? "Ensure you have the latest packages installed from package.json."
                        : "[Instructor] Let's type out our first hello world sandbox module."}
                  </motion.div>
                )}
              </div>

              {/* Play Pause Screen Click Trigger */}
              <div
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 cursor-pointer z-10"
              />

              {/* VIDEO CONTROLS OVERLAY BAR */}
              <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                
                {/* Timeline slider progress */}
                <div
                  ref={videoProgressRef}
                  onClick={handleTimelineClick}
                  className="h-1.5 w-full bg-white/20 hover:h-2 rounded-full cursor-pointer overflow-hidden transition-all relative"
                >
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Buttons controls row */}
                <div className="flex items-center justify-between text-foreground text-xs">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    >
                      {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>

                    {/* Mute/Volume */}
                    <div className="flex items-center gap-1.5 group/volume">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="cursor-pointer focus:outline-none"
                      >
                        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-16 h-1 bg-white/30 rounded-lg cursor-pointer accent-primary focus:outline-none hidden group-hover/volume:block"
                      />
                    </div>

                    {/* Time count */}
                    <span className="font-semibold select-none">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 relative">
                    {/* Speed menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="font-bold cursor-pointer hover:text-primary transition-colors focus:outline-none"
                      >
                        {playbackSpeed}x
                      </button>
                      <AnimatePresence>
                        {showSpeedMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute bottom-6 right-0 bg-slate-900 border border-white/10 rounded p-1 flex flex-col gap-1 w-20 text-center"
                          >
                            {[0.5, 1, 1.25, 1.5, 2].map((sp) => (
                              <button
                                key={sp}
                                onClick={() => {
                                  setPlaybackSpeed(sp);
                                  setShowSpeedMenu(false);
                                }}
                                className={`text-[10px] py-1 font-bold rounded hover:bg-white/10 cursor-pointer ${
                                  playbackSpeed === sp ? "text-primary" : "text-white"
                                }`}
                              >
                                {sp}x
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Captions Toggle */}
                    <button
                      onClick={() => setShowCaptions(!showCaptions)}
                      className={`font-semibold cursor-pointer hover:text-primary transition-colors focus:outline-none ${
                        showCaptions ? "text-primary" : "text-white"
                      }`}
                    >
                      CC
                    </button>

                    {/* Bookmark Trigger */}
                    <button
                      onClick={handleAddBookmark}
                      className="cursor-pointer hover:text-primary transition-colors focus:outline-none"
                      title="Bookmark current timestamp"
                    >
                      <Bookmark size={16} />
                    </button>

                    {/* Fullscreen */}
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="cursor-pointer hover:text-primary transition-colors focus:outline-none"
                    >
                      {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* LEARNING TOOLS PANEL TABS */}
            <div className="flex flex-col gap-4">
              <div className="flex border-b border-border/40 pb-2 gap-4 text-sm font-heading font-extrabold text-muted-foreground overflow-x-auto scrollbar-none select-none">
                {[
                  { id: "overview", label: "Overview", icon: Info },
                  { id: "resources", label: "Resources", icon: Layers },
                  { id: "notes", label: "Notes", icon: FileText },
                  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeToolTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveToolTab(tab.id as "overview" | "resources" | "notes" | "bookmarks")}
                      className={`flex items-center gap-1.5 pb-1 border-b-2 cursor-pointer transition-all focus:outline-none ${
                        isActive
                          ? "border-primary text-foreground"
                          : "border-transparent hover:text-foreground"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TABS BODY RENDERING */}
              <div className="min-h-[200px] text-xs">
                
                {/* tab: Overview */}
                {activeToolTab === "overview" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 text-muted-foreground leading-relaxed"
                  >
                    <div>
                      <h4 className="text-sm font-heading font-extrabold text-foreground">About this Course</h4>
                      <p className="mt-2 text-justify font-medium">{course.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-4 text-foreground">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Tutor</span>
                        <p className="font-bold text-xs">{course.tutorName}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Language</span>
                        <p className="font-bold text-xs">{course.language}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* tab: Resources */}
                {activeToolTab === "resources" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-3"
                  >
                    {[
                      { title: "Course Workbook (Syllabus Checklist).pdf", size: "2.4 MB", type: "PDF" },
                      { title: "Hello-World-Module-Sandbox-src.zip", size: "1.8 MB", type: "Zip" },
                      { title: "Official Documentation Reference", size: "External Link", type: "Link", url: "https://react.dev" },
                    ].map((res, idx) => (
                      <div
                        key={idx}
                        className="border border-border bg-card/65 p-4 rounded-card flex items-center justify-between shadow-soft"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText size={16} />
                          </div>
                          <div>
                            <h5 className="font-bold text-foreground">{res.title}</h5>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">{res.size}</span>
                          </div>
                        </div>

                        {res.url ? (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-muted border border-border/80 rounded-button text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                          >
                            Go
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <button
                            onClick={() => toast.success(`Downloading ${res.title}...`)}
                            className="p-2 hover:bg-muted border border-border/80 rounded-button text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* tab: Notes */}
                {activeToolTab === "notes" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Add note input area */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground select-none">
                        <span>Create note at current timestamp ({formatTime(currentTime)})</span>
                        <span className="text-primary font-extrabold">* Rich Text Placeholder active</span>
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Type notes and click Add..."
                          className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input p-3 focus:outline-none focus:border-primary/50 text-xs font-semibold text-foreground placeholder:text-muted-foreground/80 resize-none"
                        />
                        <Button
                          onClick={handleAddNote}
                          className="h-auto shrink-0 flex items-center justify-center p-3"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Notes listing */}
                    <div className="flex flex-col gap-3">
                      {notes
                        .filter((n) => n.lessonId === activeLessonId)
                        .map((note) => (
                          <div
                            key={note.id}
                            className="border border-border bg-card/65 p-4 rounded-card flex flex-col gap-2.5 shadow-soft"
                          >
                            <div className="flex items-center justify-between select-none">
                              {/* Timestamp link */}
                              <button
                                onClick={() => seekTo(note.timestampSeconds)}
                                className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer focus:outline-none"
                              >
                                <Clock size={10} />
                                {note.timestamp}
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteText(note.text);
                                  }}
                                  className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded cursor-pointer"
                                  title="Edit note"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 hover:bg-muted text-destructive hover:bg-destructive/10 rounded cursor-pointer"
                                  title="Delete note"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Editing states */}
                            {editingNoteId === note.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                                />
                                <Button
                                  onClick={() => handleSaveEditNote(note.id)}
                                  className="h-8 py-0 px-2 gap-1 text-[10px]"
                                >
                                  <Save size={12} />
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <p className="text-foreground leading-relaxed font-semibold">{note.text}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}

                {/* tab: Bookmarks */}
                {activeToolTab === "bookmarks" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground select-none">
                      <span>Saved timestamps list</span>
                      <button
                        onClick={handleAddBookmark}
                        className="text-primary font-extrabold hover:underline focus:outline-none"
                      >
                        + Add Bookmark at {formatTime(currentTime)}
                      </button>
                    </div>

                    {bookmarks.map((bmark) => (
                      <div
                        key={bmark.id}
                        className="border border-border bg-card/65 p-4 rounded-card flex items-center justify-between shadow-soft"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => seekTo(bmark.timestampSeconds)}
                            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 cursor-pointer focus:outline-none"
                          >
                            <Bookmark size={14} className="fill-current" />
                          </button>
                          <div>
                            <h5 className="font-bold text-foreground">{bmark.lessonTitle}</h5>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">
                              Bookmarked timestamp: <strong className="text-primary">{bmark.timestamp}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteBookmark(bmark.id)}
                          className="p-2 hover:bg-muted text-destructive hover:bg-destructive/10 rounded-button cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Collapsible Sidebar Curriculum */}
          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/40 bg-card/60 backdrop-blur-md p-4 lg:p-6 select-none relative z-30 shrink-0">
            <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground mb-4">
              Course Curriculum
            </h3>

            <div className="flex flex-col gap-3">
              {modules.map((mod) => {
                const isExpanded = expandedModules[mod.id];
                return (
                  <div key={mod.id} className="border border-border rounded-card bg-card/75 overflow-hidden shadow-soft">
                    {/* Module Accordion Header */}
                    <button
                      onClick={() =>
                        setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))
                      }
                      className="w-full p-3 flex items-center justify-between bg-muted/40 hover:bg-muted/60 text-left font-bold text-xs cursor-pointer focus:outline-none"
                    >
                      <span className="truncate pr-2">{mod.title}</span>
                      <ChevronDown
                        size={14}
                        className={`text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Lessons list */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-2 flex flex-col gap-1 border-t border-border/30">
                            {mod.lessons.map((lesson) => {
                              const isActive = activeLessonId === lesson.id;
                              return (
                                <button
                                  key={lesson.id}
                                  disabled={lesson.locked}
                                  onClick={() => {
                                    setActiveLessonId(lesson.id);
                                    setCurrentTime(0);
                                    setIsPlaying(false);
                                    toast.info(`Loaded lesson: ${lesson.title}`);
                                  }}
                                  className={`w-full p-2.5 rounded text-left flex items-start justify-between gap-2.5 transition-colors focus:outline-none ${
                                    isActive
                                      ? "bg-primary/10 text-primary border border-primary/20"
                                      : lesson.locked
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-muted/50 cursor-pointer text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <div className="flex items-start gap-2 min-w-0">
                                    <div className="mt-0.5 shrink-0">
                                      {lesson.completed ? (
                                        <CheckCircle size={14} className="text-emerald-500 fill-current bg-white rounded-full" />
                                      ) : (
                                        <Play size={13} className="text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="text-[11px] font-bold leading-normal truncate">
                                        {lesson.title}
                                      </h5>
                                      <span className="text-[9px] text-muted-foreground/80 mt-0.5 block">
                                        {lesson.duration}
                                      </span>
                                    </div>
                                  </div>

                                  {lesson.locked && (
                                    <Lock size={12} className="text-muted-foreground shrink-0 mt-1" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </aside>

        </div>
      </PageWrapper>
    </RequireLearner>
  );
}
