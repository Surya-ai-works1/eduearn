"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Plus,
  Copy,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Link2,
  Trash2,
  Calendar as CalendarIcon,
  Save,
  X,
  Laptop,
  Search,
  Upload,
  Download,
  Play,
  FileText,
  TrendingUp,
  BookOpen,
  Sparkles,
  DollarSign,
  Check,
  MoreVertical,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useTutor } from "../../context/TutorContext";
import { useRouter } from "next/navigation";
import type { LiveSession } from "./types";
import { navigateToClassroom } from "../../features/classroom/utils/navigation";

interface LiveClassesProps {
  liveSessions: LiveSession[];
  setLiveSessions: React.Dispatch<React.SetStateAction<LiveSession[]>>;
  isSchedulingLive: boolean;
  setIsSchedulingLive: (v: boolean) => void;
  liveForm: {
    title: string;
    time: string;
    platform: "Google Meet" | "Zoom" | "Microsoft Teams";
    link: string;
    password?: string;
    recordingUrl?: string;
    attachments?: string;
    notes?: string;
  };
  setLiveForm: React.Dispatch<React.SetStateAction<any>>;
  handleScheduleLive: (e: React.FormEvent) => void;
  isGateTriggered: boolean;
}

export const LiveClasses = React.memo(function LiveClasses({
  liveSessions,
  setLiveSessions,
  isSchedulingLive,
  setIsSchedulingLive,
  liveForm,
  setLiveForm,
  handleScheduleLive,
}: LiveClassesProps) {
  const { myCourses = [], handleTabChange } = useTutor();
  const router = useRouter();

  // Navigation module tabs: "dashboard", "calendar", "analytics"
  const [currentModuleTab, setCurrentModuleTab] = useState<"dashboard" | "calendar" | "analytics">("dashboard");
  const [calViewMode, setCalViewMode] = useState<"month" | "week" | "day" | "agenda">("month");

  // Filters state
  const [activeFilterTab, setActiveFilterTab] = useState<"all" | "upcoming" | "live-now" | "completed" | "doubt-sessions" | "recordings">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Upcoming timeframe sorting filter
  const [upcomingTimeframe, setUpcomingTimeframe] = useState<"all" | "today" | "tomorrow" | "week">("all");

  // Modals state
  const [selectedStudentViewClass, setSelectedStudentViewClass] = useState<LiveSession | null>(null);
  const [selectedAttendanceViewClass, setSelectedAttendanceViewClass] = useState<LiveSession | null>(null);
  
  // Custom Modals
  const [showCreateDoubtModal, setShowCreateDoubtModal] = useState(false);
  const [showShortModalForSession, setShowShortModalForSession] = useState<LiveSession | null>(null);
  const [showAttachNotesModalForSession, setShowAttachNotesModalForSession] = useState<LiveSession | null>(null);
  const [showAddToCourseModalForSession, setShowAddToCourseModalForSession] = useState<LiveSession | null>(null);
  const [showRescheduleModalForSession, setShowRescheduleModalForSession] = useState<LiveSession | null>(null);

  // Shorts Modal Form State
  const [shortTitle, setShortTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [shortStart, setShortStart] = useState("00:15");
  const [shortEnd, setShortEnd] = useState("01:15");
  const [shortCourse, setShortCourse] = useState("");
  const [shortStatus, setShortStatus] = useState("Published");

  // Attach Notes Form State
  const [notesTitle, setNotesTitle] = useState("");
  const [notesFile, setNotesFile] = useState("");
  const [notesPriceType, setNotesPriceType] = useState<"free" | "paid">("free");
  const [notesPrice, setNotesPrice] = useState("99");

  // Add to Course Form State
  const [targetCourseId, setTargetCourseId] = useState("");
  const [targetModuleId, setTargetModuleId] = useState("");

  // Drawer Meeting Link Editing states
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [tempMeetingLink, setTempMeetingLink] = useState("");
  const [tempPlatform, setTempPlatform] = useState<"Google Meet" | "Zoom" | "Microsoft Teams" | "Custom Meeting Link">("Google Meet");
  const [tempMeetingId, setTempMeetingId] = useState("");
  const [tempPasscode, setTempPasscode] = useState("");

  useEffect(() => {
    if (selectedStudentViewClass) {
      setTempMeetingLink(selectedStudentViewClass.meetingLink || "");
      setTempPlatform(selectedStudentViewClass.platform || "Google Meet");
      setTempMeetingId(selectedStudentViewClass.meetingId || "");
      setTempPasscode(selectedStudentViewClass.passcode || "");
      setIsEditingLink(false);
    }
  }, [selectedStudentViewClass]);

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("10:00");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("11:30");

  // Form fields for creating live class / doubt session
  const [createClassTitle, setCreateClassTitle] = useState("");
  const [createClassDesc, setCreateClassDesc] = useState("");
  const [createClassCourse, setCreateClassCourse] = useState("");
  const [createClassBatch, setCreateClassBatch] = useState("Batch A");
  const [createClassDate, setCreateClassDate] = useState("");
  const [createClassStartTime, setCreateClassStartTime] = useState("18:00");
  const [createClassEndTime, setCreateClassEndTime] = useState("19:30");
  const [createClassMaxStudents, setCreateClassMaxStudents] = useState("30");
  const [createClassPriceType, setCreateClassPriceType] = useState<"free" | "paid">("paid");
  const [createClassPrice, setCreateClassPrice] = useState("199");
  const [createClassObjectives, setCreateClassObjectives] = useState("");
  const [createClassRecording, setCreateClassRecording] = useState(true);
  const [createClassIsDoubt, setCreateClassIsDoubt] = useState(false);
  const [createClassPlatform, setCreateClassPlatform] = useState<"Google Meet" | "Zoom" | "Microsoft Teams" | "Custom Meeting Link">("Google Meet");
  const [createClassMeetingLink, setCreateClassMeetingLink] = useState("https://meet.google.com/abc-defg-hij");
  const [createClassMeetingId, setCreateClassMeetingId] = useState("");
  const [createClassPasscode, setCreateClassPasscode] = useState("");
  const [createClassAccessScope, setCreateClassAccessScope] = useState<"course" | "package" | "batch">("course");

  // Local list of enriched sessions, initialized with prop & high-fidelity mock data
  const [localSessions, setLocalSessions] = useState<LiveSession[]>([]);

  useEffect(() => {
    const mockSessions: LiveSession[] = [
      {
        id: "live-session-now",
        title: "Python Programming Masterclass — Loops & Control",
        course: "Linear Algebra & Applications",
        batch: "Batch A",
        time: "Today · 5:30 PM",
        countdown: "Live Now",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        platform: "Google Meet",
        status: "Live Now",
        studentsCount: 32,
        attendanceCount: 24,
        duration: "90 mins",
        isDoubtSession: false,
        price: 199,
        recordingEnabled: true,
        viewsCount: 120,
      },
      {
        id: "mock-completed-1",
        title: "Python Masterclass — Class 04",
        course: "Linear Algebra & Applications",
        batch: "Batch A",
        time: "Yesterday · 4:00 PM",
        countdown: "Completed",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        platform: "Google Meet",
        status: "Completed",
        studentsCount: 40,
        attendanceCount: 32,
        duration: "1h 42m",
        isDoubtSession: false,
        price: 199,
        recordingUrl: "https://eduearn-recordings.s3.amazonaws.com/lecture_rec.mp4",
        viewsCount: 842,
        watchCompletionRate: 82,
        revenueEarned: 3200,
        attachedNotesName: "Loops_Practice_Sheet.pdf",
        attachedShortsCount: 2,
        pipelineState: {
          liveCompleted: true,
          recordingProcessed: true,
          published: true,
          shortsCreated: true,
          notesAttached: true,
          addedToCourse: true,
        }
      },
      {
        id: "mock-completed-2",
        title: "Introduction to Matrices & Vector Spaces",
        course: "Linear Algebra & Applications",
        batch: "Batch C",
        time: "Aug 12, 2026 · 10:00 AM",
        countdown: "Completed",
        meetingLink: "https://meet.google.com/xyz-pqr-stu",
        platform: "Zoom",
        status: "Completed",
        studentsCount: 30,
        attendanceCount: 28,
        duration: "90 mins",
        isDoubtSession: false,
        price: 0,
        recordingUrl: "https://eduearn-recordings.s3.amazonaws.com/lecture_matrix.mp4",
        viewsCount: 420,
        watchCompletionRate: 75,
        revenueEarned: 0,
        pipelineState: {
          liveCompleted: true,
          recordingProcessed: true,
          published: false,
          shortsCreated: false,
          notesAttached: false,
          addedToCourse: false,
        }
      },
      {
        id: "mock-doubt-1",
        title: "Weekly Doubt Session (Linear Algebra)",
        course: "Linear Algebra & Applications",
        batch: "Batch B",
        time: "Saturday · 6:00 PM",
        countdown: "Scheduled",
        meetingLink: "https://meet.google.com/xyz-pqr-stu",
        platform: "Zoom",
        status: "Scheduled",
        studentsCount: 18,
        attendanceCount: 0,
        duration: "60 mins",
        isDoubtSession: true,
        price: 0,
        learningObjectives: "Modules 1–6 doubts and assignment reviews.",
      }
    ];

    const merged = [...liveSessions];
    mockSessions.forEach(mock => {
      if (!merged.some(s => s.id === mock.id || s.title === mock.title)) {
        merged.push(mock);
      }
    });

    // Make sure we have proper defaults on all sessions
    const enriched = merged.map((s, idx) => {
      const isDoubt = s.isDoubtSession || s.title.toLowerCase().includes("doubt");
      const priceVal = s.price !== undefined ? s.price : (idx % 2 === 0 ? 199 : 0);
      const pipeState = s.pipelineState || {
        liveCompleted: s.status === "Completed",
        recordingProcessed: s.status === "Completed",
        published: s.status === "Completed" && !!s.recordingUrl,
        shortsCreated: idx === 1,
        notesAttached: idx === 1,
        addedToCourse: idx === 1,
      };

      return {
        ...s,
        isDoubtSession: isDoubt,
        price: priceVal,
        pipelineState: pipeState,
        duration: s.duration || "90 mins",
        studentsCount: s.studentsCount || 24,
        attendanceCount: s.attendanceCount || (s.status === "Completed" ? 18 : 0),
        viewsCount: s.viewsCount || (s.status === "Completed" ? 120 : 0),
        watchCompletionRate: s.watchCompletionRate || (s.status === "Completed" ? 75 : 0),
        revenueEarned: s.revenueEarned || (s.status === "Completed" ? (priceVal * (s.attendanceCount || 18)) : 0)
      };
    });

    setLocalSessions(enriched);
  }, [liveSessions]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const upcoming = localSessions.filter(s => s.status === "Scheduled").length;
    const liveNow = localSessions.filter(s => s.status === "Live Now").length;
    const completed = localSessions.filter(s => s.status === "Completed").length;
    
    // Sum total students across all sessions
    const totalLiveStudents = localSessions.reduce((acc, curr) => acc + (curr.studentsCount || 0), 0);
    
    // Avg Attendance
    const completedSessions = localSessions.filter(s => s.status === "Completed");
    const avgAttendancePct = completedSessions.length > 0 
      ? Math.round(completedSessions.reduce((acc, curr) => acc + (((curr.attendanceCount || 0) / (curr.studentsCount || 1)) * 100), 0) / completedSessions.length)
      : 88;
      
    // Live class revenue
    const totalRevenue = completedSessions.reduce((acc, curr) => acc + (curr.revenueEarned || 0), 0) + 18450; // Add standard baseline

    return {
      upcoming,
      liveNow,
      completed,
      totalLiveStudents,
      avgAttendance: `${avgAttendancePct}%`,
      totalRevenue
    };
  }, [localSessions]);

  // Filters logic
  const filteredSessions = useMemo(() => {
    return localSessions.filter(s => {
      // Tab filter
      if (activeFilterTab === "upcoming" && s.status !== "Scheduled") return false;
      if (activeFilterTab === "live-now" && s.status !== "Live Now") return false;
      if (activeFilterTab === "completed" && s.status !== "Completed") return false;
      if (activeFilterTab === "doubt-sessions" && !s.isDoubtSession) return false;
      if (activeFilterTab === "recordings" && (!s.recordingUrl && s.status !== "Completed")) return false;

      // Timeframe filter for upcoming tab
      if (activeFilterTab === "upcoming" || activeFilterTab === "all") {
        const titleL = s.title.toLowerCase();
        const timeL = s.time.toLowerCase();
        if (upcomingTimeframe === "today" && !timeL.includes("today") && !timeL.includes("5:30") && !titleL.includes("loops")) return false;
        if (upcomingTimeframe === "tomorrow" && !timeL.includes("tomorrow")) return false;
        if (upcomingTimeframe === "week" && !timeL.includes("today") && !timeL.includes("tomorrow") && !timeL.includes("saturday")) return false;
      }

      // Search query
      if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase()) && !s.course?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Course filter
      if (courseFilter !== "All" && s.course !== courseFilter) return false;

      // Date filter
      if (dateFilter && !s.time.includes(dateFilter)) return false;

      return true;
    });
  }, [localSessions, activeFilterTab, upcomingTimeframe, searchQuery, courseFilter, dateFilter]);

  // Actions handlers
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => toast.success("Meeting link copied!"));
  };

  const handleCancelSession = (id: string) => {
    setLiveSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Cancelled" } : s))
    );
    toast.success("Session marked as Cancelled.");
  };

  const handleDeleteSession = (id: string) => {
    setLiveSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session deleted successfully.");
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRescheduleModalForSession) return;

    const targetId = showRescheduleModalForSession.id;
    setLiveSessions(prev => prev.map(s => {
      if (s.id === targetId) {
        return {
          ...s,
          time: `${rescheduleDate}, ${rescheduleStartTime}`,
          duration: `${rescheduleStartTime} - ${rescheduleEndTime}`
        };
      }
      return s;
    }));
    setShowRescheduleModalForSession(null);
    toast.success("Class rescheduled successfully!");
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createClassTitle.trim()) {
      toast.error("Please enter a class title.");
      return;
    }

    const priceVal = createClassPriceType === "free" ? 0 : parseFloat(createClassPrice) || 0;
    const newSession: LiveSession = {
      id: `live-${Date.now()}`,
      title: createClassTitle,
      time: `${createClassDate}, ${createClassStartTime}`,
      countdown: "Scheduled",
      meetingLink: createClassMeetingLink || "https://meet.google.com/abc-defg-hij",
      platform: createClassPlatform,
      meetingId: createClassMeetingId || undefined,
      passcode: createClassPasscode || undefined,
      status: "Scheduled",
      course: createClassCourse || "Linear Algebra & Applications",
      batch: createClassBatch,
      description: createClassDesc || createClassObjectives,
      duration: `${createClassStartTime} - ${createClassEndTime}`,
      maxParticipants: parseInt(createClassMaxStudents) || 30,
      price: priceVal,
      isDoubtSession: createClassIsDoubt,
      recordingEnabled: createClassRecording,
      studentsCount: 0,
      attendanceCount: 0,
      pipelineState: {
        liveCompleted: false,
        recordingProcessed: false,
        published: false,
        shortsCreated: false,
        notesAttached: false,
        addedToCourse: false,
      }
    };

    setLiveSessions(prev => [newSession, ...prev]);
    setIsSchedulingLive(false);
    setShowCreateDoubtModal(false);
    toast.success(`${createClassIsDoubt ? "Doubt Session" : "Live Class"} scheduled successfully!`);
    
    // Clear form
    setCreateClassTitle("");
    setCreateClassDesc("");
    setCreateClassDate("");
    setCreateClassObjectives("");
    setCreateClassMeetingLink("https://meet.google.com/abc-defg-hij");
    setCreateClassMeetingId("");
    setCreateClassPasscode("");
  };

  // Recording pipeline actions
  const handlePublishRecording = (session: LiveSession) => {
    setLiveSessions(prev => prev.map(s => {
      if (s.id === session.id) {
        const nextPublished = !s.pipelineState?.published;
        return {
          ...s,
          pipelineState: {
            ...s.pipelineState!,
            published: nextPublished
          }
        };
      }
      return s;
    }));
    toast.success(session.pipelineState?.published ? "Recording unpublished." : "Recording published to students course outline!");
  };

  const handleShortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showShortModalForSession) return;

    setLiveSessions(prev => prev.map(s => {
      if (s.id === showShortModalForSession.id) {
        return {
          ...s,
          pipelineState: {
            ...s.pipelineState!,
            shortsCreated: true
          }
        };
      }
      return s;
    }));

    setShowShortModalForSession(null);
    toast.success(`Short "${shortTitle}" cropped and published successfully!`);
  };

  const handleAttachNotesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAttachNotesModalForSession) return;

    setLiveSessions(prev => prev.map(s => {
      if (s.id === showAttachNotesModalForSession.id) {
        return {
          ...s,
          attachedNotesName: notesTitle || "Lecture_Notes.pdf",
          pipelineState: {
            ...s.pipelineState!,
            notesAttached: true
          }
        };
      }
      return s;
    }));

    setShowAttachNotesModalForSession(null);
    toast.success(`Study handout attached to this session!`);
  };

  const handleAddToCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddToCourseModalForSession) return;

    setLiveSessions(prev => prev.map(s => {
      if (s.id === showAddToCourseModalForSession.id) {
        return {
          ...s,
          pipelineState: {
            ...s.pipelineState!,
            addedToCourse: true
          }
        };
      }
      return s;
    }));

    setShowAddToCourseModalForSession(null);
    toast.success(`Lecture added to the course module outline!`);
  };

  const downloadAttendanceCSV = (session: LiveSession) => {
    const headers = "Student Name,Attendance,Join Time,Status\n";
    const studentsList = [
      { name: "Aarav Mehta", attendance: "100%", joinTime: "05:01 PM", status: "Present" },
      { name: "Isha Sharma", attendance: "100%", joinTime: "05:00 PM", status: "Present" },
      { name: "Rohan Das", attendance: "0%", joinTime: "—", status: "Absent" },
      { name: "Ananya Iyer", attendance: "80%", joinTime: "05:15 PM", status: "Late Join" },
      { name: "Kabir Singh", attendance: "100%", joinTime: "05:02 PM", status: "Present" }
    ];
    const rows = studentsList.map(s => `"${s.name}","${s.attendance}","${s.joinTime}","${s.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.title.toLowerCase().replace(/\s+/g, "_")}_attendance.csv`;
    a.click();
    toast.success("Attendance report downloaded successfully!");
  };

  // Find active live session
  const activeLiveSession = useMemo(() => {
    return localSessions.find(s => s.status === "Live Now");
  }, [localSessions]);

  return (
    <motion.div
      key="tutor-live-system"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8 text-left pb-16"
    >
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-primary/10 via-background to-background p-6 rounded-2xl border border-primary/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
            <Sparkles size={10} /> Live Learning Studio
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">Live Classes</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Teach live, connect with your students, and turn every class into reusable learning content.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 select-none">
          <Button 
            onClick={() => {
              setCreateClassIsDoubt(false);
              setIsSchedulingLive(true);
            }} 
            size="sm" 
            className="h-8.5 text-xs bg-primary hover:bg-primary/95 text-white font-bold border-none"
          >
            + Schedule Live Class
          </Button>
          <Button 
            onClick={() => {
              setCreateClassIsDoubt(true);
              setShowCreateDoubtModal(true);
            }} 
            size="sm" 
            className="h-8.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-none"
          >
            + Schedule Doubt Session
          </Button>
          <Button 
            onClick={() => setCurrentModuleTab("calendar")} 
            size="sm" 
            variant="outline"
            className="h-8.5 text-xs font-bold border-border/80"
          >
            View Calendar
          </Button>
        </div>
      </div>

      {/* KPI Cards summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 select-none">
        {[
          { label: "Upcoming Classes", value: stats.upcoming, icon: CalendarIcon, color: "text-sky-500 bg-sky-500/10" },
          { label: "Live Now", value: stats.liveNow, icon: Video, color: stats.liveNow > 0 ? "text-rose-500 bg-rose-500/10 animate-pulse" : "text-muted-foreground bg-muted/40" },
          { label: "Completed Classes", value: stats.completed, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Total Live Students", value: stats.totalLiveStudents, icon: Users, color: "text-purple-500 bg-purple-500/10" },
          { label: "Average Attendance", value: stats.avgAttendance, icon: TrendingUp, color: "text-teal-500 bg-teal-500/10" },
          { label: "Live Class Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-500 bg-amber-500/10" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} variant="glass" className="p-3.5 border-border/60 hover:border-primary/20 transition flex items-center justify-between min-w-0">
              <div className="min-w-0 space-y-0.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider truncate">{item.label}</p>
                <h4 className="text-lg font-black text-foreground">{item.value}</h4>
              </div>
              <span className={`p-1.5 rounded-lg shrink-0 ml-2 ${item.color}`}><Icon size={14} /></span>
            </Card>
          );
        })}
      </div>

      {/* Navigation module tabs */}
      <div className="flex gap-1.5 border-b border-border/40 pb-2 font-bold select-none">
        {[
          { id: "dashboard", label: "Classes Dashboard" },
          { id: "calendar", label: "Interactive Calendar" },
          { id: "analytics", label: "Analytics & Reports" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentModuleTab(tab.id as any)}
            className={`px-4 py-2 text-xs border-b-2 transition-all cursor-pointer bg-transparent border-none ${
              currentModuleTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {currentModuleTab === "dashboard" && (
        <div className="space-y-8">
          
          {/* Section 1: LIVE NOW */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-heading select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Live Now
            </h3>
            {activeLiveSession ? (
              <Card className="p-5 border-rose-500/30 bg-rose-500/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-500 text-white rounded-full text-[8.5px] uppercase font-black tracking-widest animate-pulse px-2 py-0.5">
                      🔴 LIVE NOW
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Started 18 minutes ago</span>
                  </div>
                  <h4 className="text-sm md:text-base font-black text-foreground">{activeLiveSession.title}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1"><Users size={12} className="text-rose-500" /> 24 joined / 32 registered</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-rose-500" /> Duration: {activeLiveSession.duration}</span>
                    <span className="flex items-center gap-1"><HelpCircle size={12} className="text-rose-500" /> 4 Questions pending</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto">
                  <Button
                    onClick={() => navigateToClassroom(router, activeLiveSession.id)}
                    size="sm"
                    className="flex-1 md:flex-none h-8 text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white border-none"
                  >
                    Open Live Room
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedStudentViewClass(activeLiveSession);
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 md:flex-none h-8 text-[11px] font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5"
                  >
                    Manage Class
                  </Button>
                </div>
              </Card>
            ) : (
              <Card variant="glass" className="p-4 flex items-center justify-between border-border/40 select-none text-xs font-semibold text-muted-foreground">
                <span>No class is live right now.</span>
                <Button 
                  onClick={() => setIsSchedulingLive(true)}
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] font-bold"
                >
                  Schedule Live Class
                </Button>
              </Card>
            )}
          </div>

          {/* Section 2: FILTERS & SEARCH */}
          <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3 select-none">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search live classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-full pl-9 pr-3 rounded-xl border border-border bg-card/60 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-1 border border-border/60 p-0.5 rounded-xl bg-muted/20">
              {[
                { id: "all", label: "All" },
                { id: "upcoming", label: "Upcoming" },
                { id: "live-now", label: "Live Now" },
                { id: "completed", label: "Completed" },
                { id: "doubt-sessions", label: "Doubt Sessions" },
                { id: "recordings", label: "Recordings" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFilterTab(tab.id as any);
                    setUpcomingTimeframe("all"); // Reset timeframe on tab change
                  }}
                  className={`px-3 py-1 rounded-lg text-[10.5px] font-black uppercase transition-colors cursor-pointer border-none ${
                    activeFilterTab === tab.id
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground bg-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Courses</option>
              {myCourses.map(c => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
              <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
              <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
            </select>

            <input
              type="text"
              placeholder="Filter by date (e.g. Aug 12)..."
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
            />
          </Card>

          {/* Section 3: UPCOMING LIVE CLASSES */}
          {(activeFilterTab === "all" || activeFilterTab === "upcoming") && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-2 select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">Upcoming Live Classes</h3>
                <div className="flex gap-1">
                  {[
                    { id: "all", label: "All Upcoming" },
                    { id: "today", label: "Today" },
                    { id: "tomorrow", label: "Tomorrow" },
                    { id: "week", label: "This Week" }
                  ].map(tf => (
                    <button
                      key={tf.id}
                      onClick={() => setUpcomingTimeframe(tf.id as any)}
                      className={`px-2.5 py-1 text-[9.5px] font-black rounded transition border-none cursor-pointer uppercase tracking-wider ${
                        upcomingTimeframe === tf.id
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground bg-transparent"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.filter(s => s.status === "Scheduled" && !s.isDoubtSession).map(session => (
                  <Card key={session.id} variant="glass" className="p-5 border-border/60 hover:border-primary/20 transition flex flex-col justify-between h-[255px] text-left">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start select-none">
                        <span className="text-[10px] font-black uppercase text-rose-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                          {session.platform || "Google Meet"}
                        </span>
                        <span className="text-[9px] font-bold text-foreground bg-muted/65 px-2 py-0.5 rounded border border-border/40 uppercase">
                          {session.status || "Scheduled"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-foreground line-clamp-1 leading-snug">{session.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed truncate">{session.course} • {session.batch}</p>
                      
                      <div className="space-y-1 pt-1 text-[10px] font-bold text-muted-foreground/90 select-none">
                        <div className="flex items-center gap-1.5"><CalendarIcon size={11} className="text-primary" /> {session.time}</div>
                        <div className="flex items-center gap-1.5"><Users size={11} className="text-primary" /> {session.studentsCount || 24} / {session.maxParticipants || 30} registered</div>
                        <div className="text-[9.5px] text-indigo-500 uppercase tracking-wide">Access: {session.course} Package</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 select-none border-t border-border/20 pt-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigateToClassroom(router, session.id)}
                          size="sm"
                          className="h-9 text-xs font-extrabold flex-1 bg-primary hover:bg-primary/95 text-white border-none flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Video size={14} className="fill-current" />
                          Start Live Class
                        </Button>
                        <Button
                          onClick={() => setSelectedStudentViewClass(session)}
                          size="sm"
                          variant="outline"
                          className="h-9 text-xs px-3 font-bold border-border/60 hover:bg-muted"
                        >
                          Details
                        </Button>
                        
                        <div className="relative group/upcoming-actions">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-2.5 font-bold border-border/60"
                          >
                            <MoreVertical size={13} />
                          </Button>
                          <div className="absolute right-0 bottom-full mb-1 hidden group-hover/upcoming-actions:flex flex-col bg-card border border-border rounded-xl shadow-floating py-1.5 w-28 z-30 font-semibold text-xs">
                            <button
                              onClick={() => {
                                setRescheduleDate(session.time.split(",")[0] || "");
                                setShowRescheduleModalForSession(session);
                              }}
                              className="px-3 py-1.5 text-xs text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer bg-transparent border-none"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelSession(session.id)}
                              className="px-3 py-1.5 text-xs text-left text-amber-500 hover:text-amber-600 hover:bg-muted/50 transition cursor-pointer bg-transparent border-none"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete session "${session.title}"? This cannot be undone.`)) {
                                  handleDeleteSession(session.id);
                                }
                              }}
                              className="px-3 py-1.5 text-xs text-left text-rose-500 hover:text-rose-600 hover:bg-muted/50 transition cursor-pointer bg-transparent border-none font-bold"
                            >
                              Delete Class
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(session.meetingLink || "");
                          toast.success("Protected meeting link copied!");
                        }}
                        variant="outline"
                        size="sm"
                        className="h-7 text-[9px] font-bold border-dashed border-border"
                      >
                        Copy Meeting Link
                      </Button>
                    </div>
                  </Card>
                ))}
                {filteredSessions.filter(s => s.status === "Scheduled" && !s.isDoubtSession).length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs text-muted-foreground italic select-none">
                    No upcoming live classes found matching selected filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: LIVE DOUBT SESSIONS */}
          {(activeFilterTab === "all" || activeFilterTab === "doubt-sessions") && (
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-border/40 pb-2 select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <BookOpen size={15} className="text-indigo-500" />
                  Live Doubt Sessions
                </h3>
                <span className="text-[10px] text-muted-foreground font-semibold">Support student self-learning cohorts</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSessions.filter(s => s.isDoubtSession).map(session => (
                  <Card key={session.id} variant="glass" className="p-4 border-border/60 hover:border-indigo-500/20 transition flex flex-col justify-between h-44">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start select-none">
                        <span className="text-[9.5px] font-black uppercase text-indigo-500">Interactive Doubt Room</span>
                        <span className="text-[9.5px] text-muted-foreground font-semibold">• {session.time}</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-foreground line-clamp-1">{session.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold truncate">Topics: {session.learningObjectives || "Course Modules 1–6 Review"}</p>
                      <p className="text-[10px] text-muted-foreground/80 font-semibold">{session.studentsCount || 18} students registered</p>
                    </div>

                    <div className="flex gap-2 select-none border-t border-border/20 pt-3">
                      <Button
                        onClick={() => navigateToClassroom(router, session.id)}
                        size="sm"
                        className="h-7 text-[10px] font-bold flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                      >
                        Start Session
                      </Button>
                      <Button
                        onClick={() => setSelectedStudentViewClass(session)}
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] px-3 font-bold border-border/60 hover:bg-muted"
                      >
                        Manage Session
                      </Button>
                    </div>
                  </Card>
                ))}
                {filteredSessions.filter(s => s.isDoubtSession).length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs text-muted-foreground italic select-none">
                    No scheduled doubt sessions found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: COMPLETED CLASSES & PIPELINE */}
          {(activeFilterTab === "all" || activeFilterTab === "completed" || activeFilterTab === "recordings") && (
            <div className="space-y-6">
              <div className="border-b border-border/40 pb-2 select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">Completed Classes &amp; Recorded Assets</h3>
              </div>

              <div className="space-y-6">
                {filteredSessions.filter(s => s.status === "Completed").map(session => (
                  <Card key={session.id} variant="glass" className="p-5 border-border/60 hover:border-primary/20 transition grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    
                    {/* Lecture metadata & details */}
                    <div className="lg:col-span-4 space-y-3">
                      <div className="space-y-0.5">
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-[8.5px] uppercase font-black px-2 py-0.5 select-none">
                          ✓ COMPLETED
                        </span>
                        <h4 className="text-xs font-black text-foreground mt-1.5">{session.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed truncate">{session.course} • {session.batch}</p>
                      </div>

                      <div className="space-y-1.5 text-[10px] font-bold text-muted-foreground select-none">
                        <div>Time taught: <span className="text-foreground">{session.time} ({session.duration})</span></div>
                        <div>Turnout: <span className="text-foreground">{session.attendanceCount} attended / {session.studentsCount} registered ({Math.round(((session.attendanceCount || 0) / (session.studentsCount || 1)) * 100)}%)</span></div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border/10 select-none">
                        <Button
                          onClick={() => window.open(session.recordingUrl)}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2.5 font-bold border-border/60"
                          disabled={!session.recordingUrl}
                        >
                          Watch Recording
                        </Button>
                        <Button
                          onClick={() => setSelectedAttendanceViewClass(session)}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2.5 font-bold border-border/60"
                        >
                          Attendance
                        </Button>
                      </div>
                    </div>

                    {/* Pipeline Visual Stepper */}
                    <div className="lg:col-span-4 border-l border-r border-border/30 px-6 space-y-3">
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block select-none">Live-to-Content Pipeline</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-emerald-500 select-none">
                          <CheckCircle size={12} /> Live completed
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-500 select-none">
                          <CheckCircle size={12} /> Processed
                        </div>
                        <div className={`flex items-center gap-1.5 ${session.pipelineState?.published ? "text-emerald-500" : "opacity-60"} select-none`}>
                          {session.pipelineState?.published ? <CheckCircle size={12} /> : <span className="w-3 h-3 rounded-full border border-current" />}
                          Published
                        </div>
                        <div className={`flex items-center gap-1.5 ${session.pipelineState?.shortsCreated ? "text-emerald-500" : "opacity-60"} select-none`}>
                          {session.pipelineState?.shortsCreated ? <CheckCircle size={12} /> : <span className="w-3 h-3 rounded-full border border-current" />}
                          Shorts Created
                        </div>
                        <div className={`flex items-center gap-1.5 ${session.pipelineState?.notesAttached ? "text-emerald-500" : "opacity-60"} select-none`}>
                          {session.pipelineState?.notesAttached ? <CheckCircle size={12} /> : <span className="w-3 h-3 rounded-full border border-current" />}
                          Notes Attached
                        </div>
                        <div className={`flex items-center gap-1.5 ${session.pipelineState?.addedToCourse ? "text-emerald-500" : "opacity-60"} select-none`}>
                          {session.pipelineState?.addedToCourse ? <CheckCircle size={12} /> : <span className="w-3 h-3 rounded-full border border-current" />}
                          Added to Course
                        </div>
                      </div>
                      
                      {session.attachedNotesName && (
                        <div className="bg-muted/30 border border-border/40 p-2 rounded-lg text-[9.5px] text-foreground flex items-center justify-between select-none">
                          <span className="truncate max-w-[150px] font-bold">📚 {session.attachedNotesName}</span>
                          <span className="text-[8.5px] text-emerald-500 font-extrabold uppercase">Attached</span>
                        </div>
                      )}
                    </div>

                    {/* Content Generation Actions */}
                    <div className="lg:col-span-4 space-y-3.5 select-none">
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Reuse &amp; Monetize Assets</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <Button
                          onClick={() => handlePublishRecording(session)}
                          size="sm"
                          variant={session.pipelineState?.published ? "outline" : "primary"}
                          className={`h-8 font-bold border-none ${session.pipelineState?.published ? "bg-muted/40 hover:bg-muted text-foreground" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                        >
                          {session.pipelineState?.published ? "Unpublish" : "Publish Video"}
                        </Button>
                        <Button
                          onClick={() => {
                            setShortTitle(`${session.title} - Clip`);
                            setShortCourse(session.course || "");
                            setShowShortModalForSession(session);
                          }}
                          size="sm"
                          className="h-8 bg-primary hover:bg-primary/95 text-white border-none font-bold"
                        >
                          Create Short
                        </Button>
                        <Button
                          onClick={() => {
                            setNotesTitle(`${session.title} Study Notes`);
                            setShowAttachNotesModalForSession(session);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-8 border-border/80 text-foreground font-bold"
                        >
                          Attach Notes
                        </Button>
                        <Button
                          onClick={() => {
                            setTargetCourseId(session.course || "");
                            setShowAddToCourseModalForSession(session);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-8 border-border/80 text-foreground font-bold"
                        >
                          Add to Course
                        </Button>
                      </div>

                      {/* Performance card stats */}
                      <div className="bg-muted/20 border border-border/40 p-2.5 rounded-xl grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-muted-foreground leading-snug">
                        <div>
                          <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">VIEWS</span>
                          <span className="text-foreground font-black">{session.viewsCount}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">RETENTION</span>
                          <span className="text-foreground font-black">{session.watchCompletionRate}%</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-muted-foreground/60 uppercase block">REVENUE</span>
                          <span className="text-emerald-500 font-black">₹{session.revenueEarned?.toLocaleString() || "0"}</span>
                        </div>
                      </div>
                    </div>

                  </Card>
                ))}
                {filteredSessions.filter(s => s.status === "Completed").length === 0 && (
                  <div className="py-8 text-center text-xs text-muted-foreground italic select-none">
                    No completed sessions found matching selected filters.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: INTERACTIVE CALENDAR */}
      {currentModuleTab === "calendar" && (
        <Card className="p-5 border border-border bg-card shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 font-heading">
              <CalendarIcon size={14} className="text-primary" /> Live Classes Calendar Planner
            </h4>
            <div className="flex bg-muted/40 p-0.5 rounded-xl text-[10px] font-semibold border border-border/30">
              {["month", "week", "day", "agenda"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setCalViewMode(mode as any)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer capitalize transition-colors border-none font-bold ${calViewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground bg-transparent"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border/60 rounded-2xl overflow-hidden bg-card">
            <div className="grid grid-cols-7 bg-muted/20 p-2.5 text-center text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground border-b border-border/60">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d}</span>)}
            </div>
            
            {calViewMode === "month" && (
              <div className="grid grid-cols-7 gap-px bg-border/30">
                {Array.from({ length: 35 }).map((_, idx) => {
                  const dayNum = ((idx + 2) % 31) + 1;
                  const dateStr = `2026-08-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                  const daySessions = localSessions.filter(s => s.time.includes(dateStr) || (dayNum === 17 && s.status === "Live Now"));

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCreateClassDate(dateStr);
                        setIsSchedulingLive(true);
                      }}
                      className="bg-card min-h-[75px] p-2 hover:bg-muted/15 cursor-pointer transition-colors relative space-y-1 flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-black text-muted-foreground/60 block">{dayNum}</span>
                      <div className="space-y-1">
                        {daySessions.map(s => (
                          <div
                            key={s.id}
                            className={`text-[8.5px] font-black p-1 rounded truncate leading-tight border ${
                              s.status === "Live Now"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                : s.isDoubtSession
                                ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentViewClass(s);
                            }}
                          >
                            {s.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {calViewMode !== "month" && (
              <div className="p-8 text-center text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-2 select-none">
                <CalendarIcon size={24} className="text-primary/70" />
                <p>Showing Interactive Calendar {calViewMode} Agenda schedule.</p>
                <Button
                  onClick={() => setIsSchedulingLive(true)}
                  size="sm"
                  className="h-8 mt-2 bg-primary text-white text-[10px] font-bold border-none"
                >
                  Schedule Class on Selected Slot
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: ANALYTICS & REPORTS */}
      {currentModuleTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
          <Card className="p-5 border border-border bg-card shadow-sm space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <TrendingUp size={13} className="text-primary" /> Attendance &amp; Engagement Reports
            </h4>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between border-b border-border/10 pb-2">
                <span className="text-muted-foreground">Average Attendance Rate:</span>
                <strong className="text-foreground">92.4%</strong>
              </div>
              <div className="flex justify-between border-b border-border/10 pb-2">
                <span className="text-muted-foreground">Most Attended Course:</span>
                <strong className="text-primary">Linear Algebra &amp; Applications</strong>
              </div>
              <div className="flex justify-between border-b border-border/10 pb-2">
                <span className="text-muted-foreground">Total Cumulative Live Hours:</span>
                <strong className="text-foreground">48 hours</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recorded Completion Rate:</span>
                <strong className="text-emerald-500">82.1% average watch completion</strong>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-border bg-card shadow-sm space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <Laptop size={13} className="text-primary" /> Video Recordings &amp; Shorts Analytics
            </h4>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between border-b border-border/10 pb-2">
                <span className="text-muted-foreground">Recording Compilation Rate:</span>
                <strong className="text-foreground">100% of Completed Sessions</strong>
              </div>
              <div className="flex justify-between border-b border-border/10 pb-2">
                <span className="text-muted-foreground">Cumulative Recordings Views:</span>
                <strong className="text-foreground">1,262 views</strong>
              </div>
              <div className="flex justify-between border-b border-border/10 pb-2">
                <span className="text-muted-foreground">Educational Shorts Created:</span>
                <strong className="text-primary">4 Shorts cropped</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shorts total view counts:</span>
                <strong className="text-foreground">4,800 views</strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* STUDENT VIEW DETAILS DRAWER */}
      <AnimatePresence>
        {selectedStudentViewClass && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setSelectedStudentViewClass(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between text-left"
            >
              <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Video size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-foreground leading-tight">
                        {selectedStudentViewClass.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {selectedStudentViewClass.time}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudentViewClass(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-0.5">Course Connection</p>
                    <p className="font-bold text-foreground">{selectedStudentViewClass.course}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-0.5">Batch</p>
                      <p className="font-bold text-foreground">{selectedStudentViewClass.batch}</p>
                    </div>
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-0.5">Duration</p>
                      <p className="font-bold text-foreground">{selectedStudentViewClass.duration}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-muted/20 border border-border/40 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Meeting Details</p>
                      <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded ${selectedStudentViewClass.platform === "Zoom" ? "bg-sky-500/10 text-sky-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {selectedStudentViewClass.platform || "Google Meet"}
                      </span>
                    </div>

                    {isEditingLink ? (
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase">Platform</label>
                          <select
                            value={tempPlatform}
                            onChange={e => setTempPlatform(e.target.value as any)}
                            className="h-8 w-full rounded-lg border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                          >
                            <option value="Google Meet">Google Meet</option>
                            <option value="Zoom">Zoom</option>
                            <option value="Custom Meeting Link">Custom Meeting Link</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase">Meeting Link</label>
                          <input
                            type="text"
                            value={tempMeetingLink}
                            onChange={e => setTempMeetingLink(e.target.value)}
                            className="h-8 w-full rounded-lg border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                            placeholder="Paste meeting URL..."
                          />
                        </div>

                        {(tempPlatform === "Zoom" || tempPlatform === "Google Meet") && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase">Meeting ID</label>
                              <input
                                type="text"
                                value={tempMeetingId}
                                onChange={e => setTempMeetingId(e.target.value)}
                                className="h-8 w-full rounded-lg border border-border bg-card px-2 font-semibold text-foreground"
                                placeholder="Optional"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase">Passcode</label>
                              <input
                                type="text"
                                value={tempPasscode}
                                onChange={e => setTempPasscode(e.target.value)}
                                className="h-8 w-full rounded-lg border border-border bg-card px-2 font-semibold text-foreground"
                                placeholder="Optional"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingLink(false)}
                            className="h-7 text-[10px] px-2.5 font-bold"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (selectedStudentViewClass.status === "Live Now") {
                                const confirmChange = window.confirm("Warning: This live class is already in progress. Changing the meeting link now might disrupt active student connections. Are you sure you want to proceed?");
                                if (!confirmChange) return;
                              }
                              setLiveSessions(prev => prev.map(s => {
                                if (s.id === selectedStudentViewClass.id) {
                                  return {
                                    ...s,
                                    platform: tempPlatform,
                                    meetingLink: tempMeetingLink,
                                    meetingId: tempMeetingId || undefined,
                                    passcode: tempPasscode || undefined,
                                  };
                                }
                                return s;
                              }));
                              setSelectedStudentViewClass(prev => prev ? {
                                ...prev,
                                platform: tempPlatform,
                                meetingLink: tempMeetingLink,
                                meetingId: tempMeetingId || undefined,
                                passcode: tempPasscode || undefined,
                              } : null);
                              setIsEditingLink(false);
                              toast.success("Meeting link updated successfully.");
                            }}
                            className="h-7 text-[10px] px-3 font-bold bg-primary text-white border-none"
                          >
                            Save Link
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border border-border/20">
                          <div className="truncate">
                            <span className="text-[9.5px] font-semibold text-muted-foreground block uppercase">Secure Live URL</span>
                            <span className="text-[11px] font-mono text-muted-foreground/90 tracking-widest block truncate">
                              {selectedStudentViewClass.meetingLink ? "••••••••••••••••" : "No link set"}
                            </span>
                          </div>
                          {selectedStudentViewClass.meetingLink && (
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedStudentViewClass.meetingLink || "");
                                toast.success("Protected meeting link copied!");
                              }}
                              size="sm"
                              variant="outline"
                              className="h-6.5 text-[9px] px-2 font-bold"
                            >
                              Copy
                            </Button>
                          )}
                        </div>

                        {selectedStudentViewClass.meetingId && (
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground select-none">
                            <div>Meeting ID: <span className="text-foreground">{selectedStudentViewClass.meetingId}</span></div>
                            {selectedStudentViewClass.passcode && (
                              <div>Passcode: <span className="text-foreground">{selectedStudentViewClass.passcode}</span></div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-1 border-t border-border/10">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingLink(true)}
                            className="h-7 text-[9.5px] px-2 font-extrabold hover:bg-muted"
                          >
                            Edit Link
                          </Button>
                          {selectedStudentViewClass.meetingLink && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const confirmRemove = window.confirm("Are you sure you want to remove the meeting link? Students will not be able to join the class.");
                                if (!confirmRemove) return;
                                setLiveSessions(prev => prev.map(s => {
                                  if (s.id === selectedStudentViewClass.id) {
                                    return {
                                      ...s,
                                      meetingLink: "",
                                      meetingId: undefined,
                                      passcode: undefined,
                                    };
                                  }
                                  return s;
                                }));
                                setSelectedStudentViewClass(prev => prev ? {
                                  ...prev,
                                  meetingLink: "",
                                  meetingId: undefined,
                                  passcode: undefined,
                                } : null);
                                toast.success("Meeting link removed.");
                              }}
                              className="h-7 text-[9.5px] px-2 font-extrabold text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 border-border/60"
                            >
                              Remove Link
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student List */}
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Cohorts Student list</p>
                    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                      {["Aarav Mehta", "Isha Sharma", "Rohan Das", "Ananya Iyer", "Kabir Singh"].map((name, i) => (
                        <div key={name} className="flex items-center justify-between text-[10px] py-1 border-b border-border/20 last:border-0">
                          <span className="text-foreground">{name}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${i % 3 === 0 ? "text-emerald-500 bg-emerald-500/10 animate-pulse" : i % 4 === 0 ? "text-rose-500 bg-rose-500/10" : "text-amber-500 bg-amber-500/10"}`}>
                            {i % 3 === 0 ? "Present" : i % 4 === 0 ? "Absent" : "Late Join"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes panel */}
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Class Description</p>
                    <textarea
                      rows={3}
                      readOnly
                      value={selectedStudentViewClass.description || "No extra session details added."}
                      className="w-full bg-card border border-border rounded p-2 focus:outline-none text-[10px] font-semibold text-foreground resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-border/40 flex flex-col gap-2 bg-muted/10 select-none">
                <Button
                  onClick={() => setSelectedStudentViewClass(null)}
                  variant="outline"
                  className="w-full h-9 text-xs font-bold"
                >
                  Close Drawer
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ATTENDANCE & INSIGHTS DRAWER */}
      <AnimatePresence>
        {selectedAttendanceViewClass && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setSelectedAttendanceViewClass(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between text-left"
            >
              <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-foreground leading-tight">
                        {selectedAttendanceViewClass.title} Insights
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Attendance &amp; Engagement stats
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAttendanceViewClass(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] select-none">
                    <div className="bg-muted/30 border border-border/40 p-2 rounded-xl">
                      <p className="text-[8px] font-black uppercase opacity-85">Enrolled</p>
                      <p className="font-black text-xs mt-0.5">{selectedAttendanceViewClass.studentsCount || 40}</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-2 rounded-xl">
                      <p className="text-[8px] font-black uppercase opacity-85">Attended</p>
                      <p className="font-black text-xs mt-0.5">{selectedAttendanceViewClass.attendanceCount || 32}</p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-2 rounded-xl">
                      <p className="text-[8px] font-black uppercase opacity-85">Absent</p>
                      <p className="font-black text-xs mt-0.5">{(selectedAttendanceViewClass.studentsCount || 40) - (selectedAttendanceViewClass.attendanceCount || 32)}</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-2 rounded-xl">
                      <p className="text-[8px] font-black uppercase opacity-85">Rate</p>
                      <p className="font-black text-xs mt-0.5">{Math.round(((selectedAttendanceViewClass.attendanceCount || 32) / (selectedAttendanceViewClass.studentsCount || 40)) * 100)}%</p>
                    </div>
                  </div>

                  <div className="bg-muted/20 border border-border/40 p-3 rounded-xl space-y-2 select-none text-[10.5px]">
                    <h5 className="font-black text-foreground">Lecture Insights</h5>
                    <div className="flex justify-between border-b border-border/10 pb-1.5">
                      <span className="text-muted-foreground">Average Watch Time:</span>
                      <strong className="text-foreground">45 mins</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/10 pb-1.5">
                      <span className="text-muted-foreground">Questions Asked:</span>
                      <strong className="text-foreground">12 questions</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/10 pb-1.5">
                      <span className="text-muted-foreground">Questions Answered:</span>
                      <strong className="text-foreground">10 answers</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Student Rating:</span>
                      <strong className="text-amber-500">4.8 ★ average</strong>
                    </div>
                  </div>

                  {/* Student list detailed */}
                  <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
                    <div className="grid grid-cols-3 bg-muted/20 p-2 border-b border-border/60 text-[9px] uppercase font-extrabold text-muted-foreground select-none">
                      <span>Student</span>
                      <span className="text-center">Join Time</span>
                      <span className="text-right">Status</span>
                    </div>
                    <div className="divide-y divide-border/20 max-h-[220px] overflow-y-auto font-semibold">
                      {[
                        { name: "Aarav Mehta", time: "05:01 PM", status: "Present" },
                        { name: "Isha Sharma", time: "05:00 PM", status: "Present" },
                        { name: "Rohan Das", time: "—", status: "Absent" },
                        { name: "Ananya Iyer", time: "05:15 PM", status: "Late Join" },
                        { name: "Kabir Singh", time: "05:02 PM", status: "Present" }
                      ].map(std => (
                        <div key={std.name} className="grid grid-cols-3 p-2.5 items-center text-[10px]">
                          <span className="text-foreground font-bold">{std.name}</span>
                          <span className="text-center text-muted-foreground">{std.time}</span>
                          <span className={`text-[8px] font-bold uppercase ml-auto px-1.5 py-0.5 rounded ${std.status === "Present" ? "text-emerald-500 bg-emerald-500/10" : std.status === "Absent" ? "text-rose-500 bg-rose-500/10" : "text-amber-500 bg-amber-500/10"}`}>
                            {std.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-border/40 flex flex-col gap-2 bg-muted/10 select-none">
                <Button
                  onClick={() => downloadAttendanceCSV(selectedAttendanceViewClass)}
                  className="w-full h-9 text-xs font-bold bg-primary text-white border-none gap-1.5"
                >
                  <Download size={13} /> Download Attendance CSV
                </Button>
                <Button
                  onClick={() => setSelectedAttendanceViewClass(null)}
                  variant="outline"
                  className="w-full h-9 text-xs font-bold"
                >
                  Close Viewer
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SCHEDULE LIVE CLASS MODAL */}
      <AnimatePresence>
        {isSchedulingLive && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setIsSchedulingLive(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[90%] max-w-lg bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground">
                    Schedule Live Class
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsSchedulingLive(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Class Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Python Programming — Loops & OOP"
                      value={createClassTitle}
                      onChange={e => setCreateClassTitle(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                  
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Connect to Course / Package *</label>
                    <select
                      value={createClassCourse}
                      onChange={e => setCreateClassCourse(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="">Select Course/Package</option>
                      {myCourses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                      <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
                      <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-foreground font-heading uppercase text-[9.5px]">Live Platform *</label>
                    <select
                      value={createClassPlatform}
                      onChange={e => {
                        const plat = e.target.value as any;
                        setCreateClassPlatform(plat);
                        if (plat === "Google Meet") setCreateClassMeetingLink("https://meet.google.com/abc-defg-hij");
                        else if (plat === "Zoom") setCreateClassMeetingLink("https://zoom.us/j/1234567890");
                        else setCreateClassMeetingLink("");
                      }}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Custom Meeting Link">Custom Meeting Link</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Meeting Link *</label>
                    <input
                      type="text"
                      required
                      placeholder={createClassPlatform === "Google Meet" ? "Paste Google Meet Link..." : createClassPlatform === "Zoom" ? "Paste Zoom Link..." : "Paste Custom Link..."}
                      value={createClassMeetingLink}
                      onChange={e => setCreateClassMeetingLink(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                    />
                    <span className="text-[9.5px] text-muted-foreground italic font-semibold">Your meeting link is protected and will only be shown to eligible students.</span>
                  </div>

                  {(createClassPlatform === "Zoom" || createClassPlatform === "Google Meet") && (
                    <div className="grid grid-cols-2 gap-4 col-span-2">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Meeting ID (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 123 456 7890"
                          value={createClassMeetingId}
                          onChange={e => setCreateClassMeetingId(e.target.value)}
                          className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Passcode (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 12345"
                          value={createClassPasscode}
                          onChange={e => setCreateClassPasscode(e.target.value)}
                          className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground font-heading uppercase text-[9.5px]">Access Scope Control *</label>
                    <select
                      value={createClassAccessScope}
                      onChange={e => setCreateClassAccessScope(e.target.value as any)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="course">Course Access: Students enrolled in this course</option>
                      <option value="package">Package Access: Students enrolled in the Complete Package</option>
                      <option value="batch">Batch Access: Students in the specific batch</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Batch *</label>
                    <select
                      value={createClassBatch}
                      onChange={e => setCreateClassBatch(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Batch A">Batch A</option>
                      <option value="Batch B">Batch B</option>
                      <option value="Batch C">Batch C</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Date *</label>
                    <input
                      type="date"
                      required
                      value={createClassDate}
                      onChange={e => setCreateClassDate(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={createClassStartTime}
                      onChange={e => setCreateClassStartTime(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">End Time *</label>
                    <input
                      type="time"
                      required
                      value={createClassEndTime}
                      onChange={e => setCreateClassEndTime(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Max Students *</label>
                    <input
                      type="number"
                      required
                      value={createClassMaxStudents}
                      onChange={e => setCreateClassMaxStudents(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Price (Free or Paid) *</label>
                    <div className="flex gap-2">
                      <select
                        value={createClassPriceType}
                        onChange={e => setCreateClassPriceType(e.target.value as any)}
                        className="h-9 rounded-xl border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                      >
                        <option value="paid">Paid</option>
                        <option value="free">Free</option>
                      </select>
                      {createClassPriceType === "paid" && (
                        <input
                          type="number"
                          value={createClassPrice}
                          onChange={e => setCreateClassPrice(e.target.value)}
                          className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Learning Objectives / Description</label>
                    <textarea
                      rows={2}
                      placeholder="Objectives and syllabus covered..."
                      value={createClassObjectives}
                      onChange={e => setCreateClassObjectives(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl p-2.5 focus:outline-none font-semibold text-foreground resize-none"
                    />
                  </div>
                </div>

                {/* Auto Recording Checkbox */}
                <div className="border-t border-border/40 pt-3 space-y-2 font-bold text-foreground">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={createClassRecording}
                      onChange={e => setCreateClassRecording(e.target.checked)}
                      className="rounded border-border text-primary mt-0.5"
                    />
                    <div>
                      <span>Record this class</span>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Your recording can later be published as reusable learning content.</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSchedulingLive(false)}
                    className="h-9 text-xs"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary text-white font-bold border-none"
                  >
                    Schedule Class
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SCHEDULE LIVE DOUBT SESSION MODAL */}
      <AnimatePresence>
        {showCreateDoubtModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowCreateDoubtModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[90%] max-w-lg bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <form onSubmit={(e) => {
                setCreateClassIsDoubt(true);
                handleScheduleSubmit(e);
              }} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground flex items-center gap-1">
                    <BookOpen size={16} className="text-indigo-500" />
                    Schedule Live Doubt Session
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCreateDoubtModal(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Doubt Session Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Python Masterclass Weekly Doubt Session"
                      value={createClassTitle}
                      onChange={e => setCreateClassTitle(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                  
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Attach to Course / Course Package *</label>
                    <select
                      value={createClassCourse}
                      onChange={e => setCreateClassCourse(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="">Select Course/Package</option>
                      {myCourses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                      <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
                      <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-foreground font-heading uppercase text-[9.5px]">Live Platform *</label>
                    <select
                      value={createClassPlatform}
                      onChange={e => {
                        const plat = e.target.value as any;
                        setCreateClassPlatform(plat);
                        if (plat === "Google Meet") setCreateClassMeetingLink("https://meet.google.com/abc-defg-hij");
                        else if (plat === "Zoom") setCreateClassMeetingLink("https://zoom.us/j/1234567890");
                        else setCreateClassMeetingLink("");
                      }}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Custom Meeting Link">Custom Meeting Link</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Meeting Link *</label>
                    <input
                      type="text"
                      required
                      placeholder={createClassPlatform === "Google Meet" ? "Paste Google Meet Link..." : createClassPlatform === "Zoom" ? "Paste Zoom Link..." : "Paste Custom Link..."}
                      value={createClassMeetingLink}
                      onChange={e => setCreateClassMeetingLink(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                    />
                    <span className="text-[9.5px] text-muted-foreground italic font-semibold">Your meeting link is protected and will only be shown to eligible students.</span>
                  </div>

                  {(createClassPlatform === "Zoom" || createClassPlatform === "Google Meet") && (
                    <div className="grid grid-cols-2 gap-4 col-span-2">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Meeting ID (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 123 456 7890"
                          value={createClassMeetingId}
                          onChange={e => setCreateClassMeetingId(e.target.value)}
                          className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Passcode (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 12345"
                          value={createClassPasscode}
                          onChange={e => setCreateClassPasscode(e.target.value)}
                          className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground font-heading uppercase text-[9.5px]">Access Scope Control *</label>
                    <select
                      value={createClassAccessScope}
                      onChange={e => setCreateClassAccessScope(e.target.value as any)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="course">Course Access: Students enrolled in this course</option>
                      <option value="package">Package Access: Students enrolled in the Complete Package</option>
                      <option value="batch">Batch Access: Students in the specific batch</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Batch *</label>
                    <select
                      value={createClassBatch}
                      onChange={e => setCreateClassBatch(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Batch A">Batch A</option>
                      <option value="Batch B">Batch B</option>
                      <option value="Batch C">Batch C</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Date *</label>
                    <input
                      type="date"
                      required
                      value={createClassDate}
                      onChange={e => setCreateClassDate(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={createClassStartTime}
                      onChange={e => setCreateClassStartTime(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">End Time *</label>
                    <input
                      type="time"
                      required
                      value={createClassEndTime}
                      onChange={e => setCreateClassEndTime(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Review Topics (e.g. Modules 1-6) *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Specify topics covered for student reference..."
                      value={createClassObjectives}
                      onChange={e => setCreateClassObjectives(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl p-2.5 focus:outline-none font-semibold text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDoubtModal(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-none"
                  >
                    Schedule Doubt Session
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SHORTS MODAL FROM RECORDING */}
      <AnimatePresence>
        {showShortModalForSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowShortModalForSession(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[90%] max-w-md bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <form onSubmit={handleShortSubmit} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground flex items-center gap-1.5">
                    <Laptop size={15} className="text-primary" />
                    Crop Educational Short
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowShortModalForSession(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 leading-relaxed font-semibold text-muted-foreground select-none">
                  Select a maximum clip length of <strong className="text-primary">60 seconds</strong> to render into Shorts reels.
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Crop Start Time *</label>
                      <input
                        type="text"
                        value={shortStart}
                        onChange={e => setShortStart(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Crop End Time *</label>
                      <input
                        type="text"
                        value={shortEnd}
                        onChange={e => setShortEnd(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Short Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Python OOP structures in 60s"
                      value={shortTitle}
                      onChange={e => setShortTitle(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Short Description</label>
                    <textarea
                      rows={2}
                      placeholder="Add description and hashtags..."
                      value={shortDesc}
                      onChange={e => setShortDesc(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl p-2 focus:outline-none font-semibold text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowShortModalForSession(null)}
                    className="h-9 text-xs"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary text-white font-bold border-none"
                  >
                    Publish Short
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ATTACH NOTES MODAL */}
      <AnimatePresence>
        {showAttachNotesModalForSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowAttachNotesModalForSession(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[90%] max-w-md bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <form onSubmit={handleAttachNotesSubmit} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground">
                    Attach Resource Handouts
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAttachNotesModalForSession(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Handout Document Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Loops_OOP_Concepts_Practice.pdf"
                      value={notesTitle}
                      onChange={e => setNotesTitle(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Handout File Attachment *</label>
                    <div className="border-2 border-dashed border-border/60 hover:border-primary/40 rounded-xl p-6 text-center text-xs text-muted-foreground select-none cursor-pointer flex flex-col items-center gap-1">
                      <Upload size={20} className="text-primary" />
                      <span>Drag &amp; drop document pdf/zip, or click to browse</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Affordable Pricing Monetization *</label>
                    <div className="flex gap-2">
                      <select
                        value={notesPriceType}
                        onChange={e => setNotesPriceType(e.target.value as any)}
                        className="h-9 rounded-xl border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                      >
                        <option value="free">Free Handout</option>
                        <option value="paid">Paid Handout</option>
                      </select>
                      {notesPriceType === "paid" && (
                        <select
                          value={notesPrice}
                          onChange={e => setNotesPrice(e.target.value)}
                          className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                        >
                          <option value="50">₹50</option>
                          <option value="75">₹75</option>
                          <option value="99">₹99</option>
                          <option value="129">₹129</option>
                          <option value="149">₹149</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAttachNotesModalForSession(null)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary text-white font-bold border-none"
                  >
                    Attach Notes
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ADD TO COURSE OUTLINE MODAL */}
      <AnimatePresence>
        {showAddToCourseModalForSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowAddToCourseModalForSession(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[90%] max-w-md bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <form onSubmit={handleAddToCourseSubmit} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground">
                    Add Lecture to Course Syllabus
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddToCourseModalForSession(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Select Course Package *</label>
                    <select
                      value={targetCourseId}
                      onChange={e => setTargetCourseId(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="">Select Course Outline</option>
                      {myCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                      <option value="Linear Algebra & Applications">Linear Algebra &amp; Applications</option>
                      <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Select Target Module Section *</label>
                    <select
                      value={targetModuleId}
                      onChange={e => setTargetModuleId(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="">Select Module Section</option>
                      <option value="mod-1">Module 1: Introduction</option>
                      <option value="mod-2">Module 2: Advanced Loops</option>
                      <option value="mod-3">Module 3: Classes &amp; Objects</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddToCourseModalForSession(null)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary text-white font-bold border-none"
                  >
                    Add Lecture
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RESCHEDULE CLASS MODAL */}
      <AnimatePresence>
        {showRescheduleModalForSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setShowRescheduleModalForSession(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[90%] max-w-md bg-card border border-border rounded-2xl p-5 shadow-floating overflow-y-auto space-y-4 text-left"
            >
              <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground">
                    Reschedule Lecture
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModalForSession(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded border-none bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Reschedule Date *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aug 24, 2026"
                      value={rescheduleDate}
                      onChange={e => setRescheduleDate(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Start Time *</label>
                      <input
                        type="time"
                        required
                        value={rescheduleStartTime}
                        onChange={e => setRescheduleStartTime(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">End Time *</label>
                      <input
                        type="time"
                        required
                        value={rescheduleEndTime}
                        onChange={e => setRescheduleEndTime(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRescheduleModalForSession(null)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary text-white font-bold border-none"
                  >
                    Save Timing
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
});
