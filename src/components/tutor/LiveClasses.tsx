"use client";

import React, { useMemo, useState } from "react";
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
  Edit3,
  Calendar as CalendarIcon,
  ExternalLink,
  Save,
  Bell,
  X,
  Laptop,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  Play,
  FileText,
  Settings,
  AlertTriangle,
  TrendingUp,
  Share2,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { NoClasses } from "./EmptyState";
import type { LiveSession } from "./types";
import { navigateToClassroom } from "../../features/classroom/utils/navigation";
import { useRouter } from "next/navigation";

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
  setLiveForm: React.Dispatch<React.SetStateAction<LiveClassesProps["liveForm"]>>;
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
  const router = useRouter();

  // Navigation module tabs
  const [currentModuleTab, setCurrentModuleTab] = useState<"dashboard" | "calendar" | "analytics">("dashboard");
  const [calViewMode, setCalViewMode] = useState<"month" | "week" | "day" | "agenda">("month");
  
  // Modal/Drawer details
  const [selectedStudentViewClass, setSelectedStudentViewClass] = useState<LiveSession | null>(null);
  const [selectedAttendanceViewClass, setSelectedAttendanceViewClass] = useState<LiveSession | null>(null);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [editForm, setEditForm] = useState<Partial<LiveSession>>({});

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [sortBy, setSortBy] = useState("upcoming");

  // Create class form enhancements
  const [sendReminder, setSendReminder] = useState(true);
  const [createForm, setCreateForm] = useState({
    title: "",
    course: "Linear Algebra & Applications",
    batch: "Batch A",
    instructor: "Tutor",
    description: "",
    date: "",
    startTime: "09:00",
    endTime: "10:30",
    timezone: "IST",
    platform: "Google Meet" as "Google Meet" | "Zoom" | "Microsoft Teams",
    meetingLink: "",
    password: "",
    maxParticipants: 100,
    waitingRoom: true,
    recordingEnabled: true,
    attendanceTrackingEnabled: true
  });

  // Enrich Sessions Data
  const enrichedSessions = useMemo(() => {
    return liveSessions.map((session, idx) => {
      const course = session.course || (idx % 2 === 0 ? "Linear Algebra & Applications" : "Full-Stack Web Dev Bootcamp");
      const batch = session.batch || `Batch ${["A", "B", "C"][idx % 3]}`;
      const duration = session.duration || "90 mins";
      const maxParticipants = session.maxParticipants || 100;
      const waitingRoom = session.waitingRoom ?? true;
      const recordingEnabled = session.recordingEnabled ?? true;
      const attendanceTrackingEnabled = session.attendanceTrackingEnabled ?? true;
      const instructor = session.instructor || "Tutor";
      const description = session.description || "In-depth interactive discussion covering key modules.";
      
      let status: "Scheduled" | "Completed" | "Cancelled" | "Live Now" = "Scheduled";
      if (session.status) {
        status = session.status;
      } else {
        status = idx % 4 === 0 ? "Live Now" : idx % 3 === 0 ? "Completed" : idx % 5 === 0 ? "Cancelled" : "Scheduled";
      }

      const recordingViews = session.recordingViews || (session.recordingUrl ? 15 + (idx * 4) % 19 : 0);
      const attendanceCount = session.attendanceCount || (status === "Completed" ? 18 + (idx * 2) % 6 : 0);
      const studentsCount = session.studentsCount || 24;

      return {
        ...session,
        course,
        batch,
        duration,
        maxParticipants,
        waitingRoom,
        recordingEnabled,
        attendanceTrackingEnabled,
        instructor,
        description,
        status,
        recordingViews,
        attendanceCount,
        studentsCount
      };
    });
  }, [liveSessions]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayClasses = enrichedSessions.filter(s => {
      const d = new Date(s.time);
      return !isNaN(d.getTime()) && d.toDateString() === today;
    }).length;

    const upcoming = enrichedSessions.filter(s => s.status === "Scheduled" || s.status === "Live Now").length;
    const completed = enrichedSessions.filter(s => s.status === "Completed").length;
    const recorded = enrichedSessions.filter(s => s.recordingUrl).length;
    const totalHours = completed * 1.5;

    return {
      todayClasses,
      upcoming,
      completed,
      totalHours,
      avgAttendance: "92%",
      recorded
    };
  }, [enrichedSessions]);

  // Filters logic
  const filteredSessions = useMemo(() => {
    return enrichedSessions
      .filter((s) => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              s.course?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = courseFilter === "All" || s.course === courseFilter;
        const matchesBatch = batchFilter === "All" || s.batch === batchFilter;
        const matchesStatus = statusFilter === "All" || s.status === statusFilter;
        const matchesPlatform = platformFilter === "All" || s.platform === platformFilter;
        return matchesSearch && matchesCourse && matchesBatch && matchesStatus && matchesPlatform;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.time.localeCompare(a.time);
        if (sortBy === "oldest") return a.time.localeCompare(b.time);
        if (sortBy === "upcoming") return a.status === "Scheduled" ? -1 : 1;
        if (sortBy === "completed") return b.status === "Completed" ? -1 : 1;
        return 0;
      });
  }, [enrichedSessions, searchQuery, courseFilter, batchFilter, statusFilter, platformFilter, sortBy]);

  // Helper actions
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

  const handleStartEdit = (session: LiveSession) => {
    setEditingSession(session);
    setEditForm({
      title: session.title,
      time: session.time,
      platform: session.platform,
      meetingLink: session.meetingLink,
      password: session.password || "",
      recordingUrl: session.recordingUrl || "",
      notes: session.notes || "",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    setLiveSessions((prev) =>
      prev.map((s) =>
        s.id === editingSession.id
          ? {
              ...s,
              title: editForm.title || s.title,
              time: editForm.time || s.time,
              platform: editForm.platform || s.platform,
              meetingLink: editForm.meetingLink || s.meetingLink,
              password: editForm.password,
              recordingUrl: editForm.recordingUrl,
              notes: editForm.notes,
            }
          : s
      )
    );

    setEditingSession(null);
    toast.success("Session updated successfully!");
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: LiveSession = {
      id: `live-${Date.now()}`,
      title: createForm.title,
      time: `${createForm.date}, ${createForm.startTime} ${createForm.timezone}`,
      countdown: "Starts soon",
      meetingLink: createForm.meetingLink || "https://meet.google.com/abc-defg-hij",
      platform: createForm.platform,
      password: createForm.password,
      course: createForm.course,
      batch: createForm.batch,
      instructor: createForm.instructor,
      description: createForm.description,
      duration: `${Math.abs(parseFloat(createForm.endTime) - parseFloat(createForm.startTime)) || 1.5} hours`,
      status: "Scheduled"
    };

    setLiveSessions(prev => [newSession, ...prev]);
    setIsSchedulingLive(false);
    toast.success("Live class scheduled successfully!");

    if (sendReminder) {
      toast.success("Student email alerts scheduled: 1 day, 1 hour, and 15 mins before start.");
    }
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

  const handleUploadRecording = (sessionId: string) => {
    setLiveSessions(prev => prev.map(s => s.id === sessionId ? { ...s, recordingUrl: "https://eduearn-recordings.s3.amazonaws.com/lecture_rec.mp4" } : s));
    toast.success("Recording uploaded successfully!");
  };

  const handleDeleteRecording = (sessionId: string) => {
    setLiveSessions(prev => prev.map(s => s.id === sessionId ? { ...s, recordingUrl: undefined } : s));
    toast.success("Recording deleted successfully.");
  };

  return (
    <motion.div
      key="tutor-live-system"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Live Classes Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure calendar events, record virtual sessions, and download attendance audits.
          </p>
        </div>
        <Button onClick={() => setIsSchedulingLive(true)} size="sm" className="h-9 gap-1.5 bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm">
          <Plus size={14} /> Schedule New Class
        </Button>
      </div>

      {/* KPI Cards summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Today's Classes", value: stats.todayClasses, icon: Laptop },
          { label: "Upcoming Classes", value: stats.upcoming, icon: CalendarIcon },
          { label: "Completed Classes", value: stats.completed, icon: CheckCircle },
          { label: "Teaching Hours", value: `${stats.totalHours} hrs`, icon: Clock },
          { label: "Avg Attendance", value: stats.avgAttendance, icon: Users },
          { label: "Recorded Sessions", value: stats.recorded, icon: Video }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-3 border border-border bg-card shadow-sm flex items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground truncate">{item.label}</p>
                <h4 className="text-xl font-extrabold text-foreground mt-0.5">{item.value}</h4>
              </div>
              <Icon size={16} className="text-primary shrink-0 ml-2" />
            </Card>
          );
        })}
      </div>

      {/* Module tab buttons */}
      <div className="flex gap-1.5 border-b border-border/40 pb-2 font-semibold">
        {[
          { id: "dashboard", label: "Classes Dashboard" },
          { id: "calendar", label: "Interactive Calendar" },
          { id: "analytics", label: "Analytics & Reports" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentModuleTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs border-b-2 transition-all cursor-pointer ${
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
        <div className="space-y-6">
          {/* Filters Bar */}
          <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search class or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-3 rounded-button border border-border bg-card/60 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Courses</option>
              <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
              <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
            </select>

            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Batches</option>
              <option value="Batch A">Batch A</option>
              <option value="Batch B">Batch B</option>
              <option value="Batch C">Batch C</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Upcoming</option>
              <option value="Live Now">Live Now</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Platforms</option>
              <option value="Google Meet">Google Meet</option>
              <option value="Zoom">Zoom</option>
              <option value="Microsoft Teams">Microsoft Teams</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none ml-auto"
            >
              <option value="upcoming">Upcoming First</option>
              <option value="completed">Completed First</option>
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
            </select>
          </Card>

          {/* Splitted Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Left Column: Live Class Table */}
            <div className="w-full overflow-x-auto border border-border bg-card rounded-card shadow-sm">
              <table className="w-full text-xs text-left min-w-[1200px]">
                <thead className="bg-muted/30 border-b border-border text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                  <tr>
                    <th className="p-3">Class Title</th>
                    <th className="p-3">Course</th>
                    <th className="p-3 text-center">Batch</th>
                    <th className="p-3 text-center">Date & Time</th>
                    <th className="p-3 text-center">Duration</th>
                    <th className="p-3 text-center">Platform</th>
                    <th className="p-3 text-center">Meeting Link</th>
                    <th className="p-3 text-center">Attendance</th>
                    <th className="p-3 text-center">Recording</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-muted/15 cursor-pointer transition-colors"
                      onClick={() => setSelectedStudentViewClass(session)}
                    >
                      <td className="p-3 text-foreground font-bold text-xs">{session.title}</td>
                      <td className="p-3 text-muted-foreground/80 max-w-[180px] truncate">{session.course}</td>
                      <td className="p-3 text-center text-foreground">{session.batch}</td>
                      <td className="p-3 text-center text-muted-foreground/75 font-medium">{session.time}</td>
                      <td className="p-3 text-center text-foreground">{session.duration}</td>
                      <td className="p-3 text-center text-foreground">
                        <span className="bg-muted/50 border border-border/40 px-2 py-0.5 rounded text-[10px]">
                          {session.platform}
                        </span>
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopyLink(session.meetingLink)}
                          className="text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
                        >
                          <Link2 size={12} /> Copy URL
                        </button>
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {session.status === "Completed" ? (
                          <button
                            onClick={() => setSelectedAttendanceViewClass(session)}
                            className="text-foreground hover:underline font-bold"
                          >
                            View ({session.attendanceCount}/{session.studentsCount})
                          </button>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {session.status === "Completed" ? (
                          session.recordingUrl ? (
                            <div className="flex items-center justify-center gap-1 text-emerald-500">
                              <Play size={11} className="fill-emerald-500" /> Recorded
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUploadRecording(session.id)}
                              className="text-primary hover:underline text-[10px]"
                            >
                              Upload
                            </button>
                          )
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                            session.status === "Completed"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : session.status === "Cancelled"
                              ? "bg-muted border-border text-muted-foreground"
                              : session.status === "Live Now"
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse"
                              : "bg-sky-500/10 border-sky-500/20 text-sky-500"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {session.status === "Live Now" || session.status === "Scheduled" ? (
                            <Button
                              onClick={() => navigateToClassroom(router, session.id)}
                              size="sm"
                              className="h-7 text-[10px] px-2 bg-primary hover:bg-primary/95 text-white font-bold"
                            >
                              Join Now
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(session)}
                            className="h-7 text-[10px] px-2 font-bold"
                          >
                            Edit
                          </Button>
                          {session.status !== "Completed" && session.status !== "Cancelled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelSession(session.id)}
                              className="h-7 text-[10px] px-2 font-bold text-amber-600"
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            className="h-7 text-[10px] px-2 font-bold text-rose-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Column: Today's Schedule panel */}
            <div className="space-y-4">
              <Card variant="glass" className="p-4 space-y-4">
                <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/60 pb-2">
                  Today&apos;s Schedule
                </h4>
                <div className="space-y-3">
                  {enrichedSessions.filter(s => {
                    const d = new Date(s.time);
                    return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
                  }).map(session => (
                    <div key={session.id} className="p-3 bg-muted/30 border border-border/40 rounded-card space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold text-foreground leading-tight">{session.title}</h5>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{session.time}</p>
                        </div>
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          session.status === "Live Now" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-sky-500/10 border-sky-500/20 text-sky-500"
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                        <span>Platform: {session.platform}</span>
                        {session.status === "Live Now" && (
                          <span className="text-rose-500 flex items-center gap-1 animate-pulse">
                            <Clock size={11} /> Live Now
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigateToClassroom(router, session.id)}
                          size="sm"
                          className="h-7 text-[10px] font-bold flex-1 bg-primary text-white font-semibold"
                        >
                          Join Meeting
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStartEdit(session)}
                          className="h-7 text-[10px] px-2.5 font-semibold text-foreground"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  {enrichedSessions.filter(s => {
                    const d = new Date(s.time);
                    return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
                  }).length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic text-center py-6">No classes scheduled for today.</p>
                  )}
                </div>
              </Card>

              {/* Recorded Uploads List */}
              <Card variant="glass" className="p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <Laptop size={12} className="text-primary animate-pulse" /> Live Recordings
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {enrichedSessions.filter(s => s.status === "Completed").map(session => (
                    <div key={session.id} className="p-2.5 bg-muted/40 rounded border border-border/40 space-y-2 text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground truncate max-w-[150px]">{session.title}</span>
                        <span className="text-muted-foreground/70">{session.recordingViews} views</span>
                      </div>
                      <div className="flex gap-2 justify-end">
                        {session.recordingUrl ? (
                          <>
                            <Button
                              onClick={() => window.open(session.recordingUrl)}
                              variant="outline"
                              className="h-6 text-[9px] px-2 font-bold gap-1 text-foreground"
                            >
                              <Play size={10} className="fill-foreground" /> Play
                            </Button>
                            <Button
                              onClick={() => handleDeleteRecording(session.id)}
                              variant="outline"
                              className="h-6 text-[9px] px-2 font-bold text-rose-500"
                            >
                              Delete
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleUploadRecording(session.id)}
                            variant="outline"
                            className="h-6 text-[9px] px-2 font-bold text-primary w-full"
                          >
                            <Upload size={10} /> Upload Recording
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INTERACTIVE CALENDAR */}
      {currentModuleTab === "calendar" && (
        <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 font-heading">
              <CalendarIcon size={13} className="text-primary" /> Calendar View Mode
            </h4>
            <div className="flex bg-muted/40 p-0.5 rounded-button text-[10px] font-semibold">
              {["month", "week", "day", "agenda"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setCalViewMode(mode as any)}
                  className={`px-2.5 py-1 rounded-button cursor-pointer capitalize transition-colors ${calViewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid Render mock */}
          <div className="border border-border/60 rounded-card overflow-hidden">
            <div className="grid grid-cols-7 bg-muted/30 p-2 text-center text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80 border-b border-border/60">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d}</span>)}
            </div>
            
            {/* Monthly view rendering */}
            {calViewMode === "month" && (
              <div className="grid grid-cols-7 gap-px bg-border/40">
                {Array.from({ length: 35 }).map((_, idx) => {
                  const dayNum = ((idx + 2) % 31) + 1;
                  const dateStr = `2026-07-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                  const daySessions = enrichedSessions.filter(s => s.time.includes(dateStr));

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCreateForm(f => ({ ...f, date: dateStr }));
                        setIsSchedulingLive(true);
                      }}
                      className="bg-card min-h-[70px] p-2 hover:bg-muted/15 cursor-pointer transition-colors relative space-y-1"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground/60">{dayNum}</span>
                      <div className="space-y-1">
                        {daySessions.map(s => (
                          <div
                            key={s.id}
                            draggable
                            onDragEnd={() => toast.success(`Rescheduled "${s.title}" automatically!`)}
                            className="bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold p-1 rounded truncate leading-tight cursor-grab"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentViewClass(s);
                            }}
                            title="Drag card to reschedule"
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

            {/* Weekly/Day view placeholders */}
            {calViewMode !== "month" && (
              <div className="p-8 text-center text-xs text-muted-foreground italic bg-card flex flex-col items-center justify-center gap-2">
                <CalendarIcon size={24} className="text-primary/70" />
                <p>Showing Interactive Calendar {calViewMode} Agenda schedule.</p>
                <Button
                  onClick={() => setIsSchedulingLive(true)}
                  size="sm"
                  className="h-8 mt-2 bg-primary text-white text-[10px] font-bold"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <TrendingUp size={13} className="text-primary" /> Attendance & Engagement
            </h4>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Attendance Rate</span>
                <span className="text-foreground font-bold text-foreground">92.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Most Attended Course</span>
                <span className="text-foreground font-bold text-primary">Linear Algebra & Applications</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Least Attended Course</span>
                <span className="text-foreground font-bold text-foreground">Full-Stack Web Dev Bootcamp</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Cumulative Teaching Hours</span>
                <span className="text-foreground font-bold text-foreground">48 hours</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <Laptop size={13} className="text-primary" /> Video Recordings & Cancellations
            </h4>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recording Upload Rate</span>
                <span className="text-foreground font-bold text-foreground">100% of Completed Sessions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recording View Counts</span>
                <span className="text-foreground font-bold text-foreground">148 cumulative views</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cancelled Classes</span>
                <span className="text-rose-500 font-bold">1 session this month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Recording Retention</span>
                <span className="text-foreground font-bold text-foreground">Unlimited</span>
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
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Video size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground leading-tight">
                        {selectedStudentViewClass.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {selectedStudentViewClass.time}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudentViewClass(null)}
                    aria-label="Close"
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-muted/20 border border-border/40 rounded">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Course</p>
                    <p className="font-bold text-foreground">{selectedStudentViewClass.course}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Batch</p>
                      <p className="font-bold text-foreground">{selectedStudentViewClass.batch}</p>
                    </div>
                    <div className="p-3 bg-muted/20 border border-border/40 rounded">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Duration</p>
                      <p className="font-bold text-foreground">{selectedStudentViewClass.duration}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/20 border border-border/40 rounded">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Meeting Platform</p>
                    <p className="font-bold text-foreground">{selectedStudentViewClass.platform}</p>
                    <button
                      onClick={() => handleCopyLink(selectedStudentViewClass.meetingLink)}
                      className="text-primary hover:underline text-[10px] flex items-center gap-1 mt-1 font-bold"
                    >
                      <Link2 size={11} /> Copy Meeting URL
                    </button>
                  </div>

                  {/* Student List */}
                  <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-2">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Class Attendance list</p>
                    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                      {["Aarav Mehta", "Isha Sharma", "Rohan Das", "Ananya Iyer", "Kabir Singh"].map((name, i) => (
                        <div key={name} className="flex items-center justify-between text-[10px] py-1 border-b border-border/20 last:border-0">
                          <span className="text-foreground">{name}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${i % 3 === 0 ? "text-emerald-500 bg-emerald-500/10" : i % 4 === 0 ? "text-rose-500 bg-rose-500/10" : "text-amber-500 bg-amber-500/10"}`}>
                            {i % 3 === 0 ? "Present" : i % 4 === 0 ? "Absent" : "Late Join"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes panel */}
                  <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-1.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Class Notes</p>
                    <textarea
                      rows={3}
                      defaultValue={selectedStudentViewClass.notes || "No extra session notes added."}
                      className="w-full bg-card border border-border rounded p-2 focus:outline-none text-[10px] font-semibold text-foreground resize-none"
                    />
                  </div>

                  {/* Recording play options */}
                  {selectedStudentViewClass.recordingUrl && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded flex items-center justify-between">
                      <span className="font-bold">Recorded Session Available</span>
                      <Button
                        onClick={() => window.open(selectedStudentViewClass.recordingUrl)}
                        className="h-7 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        Play Video
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 border-t border-border/40 flex flex-col gap-2 bg-muted/10">
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

      {/* ATTENDANCE PREVIEW DETAILS DRAWER */}
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
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground leading-tight">
                        {selectedAttendanceViewClass.title} Attendance
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Audit records
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAttendanceViewClass(null)}
                    aria-label="Close"
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-muted/30 border border-border/40 p-2 rounded">
                      <p className="text-[8px] font-bold uppercase opacity-85">Enrolled</p>
                      <p className="font-bold text-xs mt-0.5">24</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-2 rounded">
                      <p className="text-[8px] font-bold uppercase opacity-85">Present</p>
                      <p className="font-bold text-xs mt-0.5">20</p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-2 rounded">
                      <p className="text-[8px] font-bold uppercase opacity-85">Absent</p>
                      <p className="font-bold text-xs mt-0.5">2</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-2 rounded">
                      <p className="text-[8px] font-bold uppercase opacity-85">Late</p>
                      <p className="font-bold text-xs mt-0.5">2</p>
                    </div>
                  </div>

                  {/* Student list detailed */}
                  <div className="border border-border/60 rounded-card overflow-hidden">
                    <div className="grid grid-cols-3 bg-muted/30 p-2 border-b border-border/60 text-[9px] uppercase font-extrabold text-muted-foreground">
                      <span>Student</span>
                      <span className="text-center">Join Time</span>
                      <span className="text-right">Status</span>
                    </div>
                    <div className="divide-y divide-border/20 max-h-[300px] overflow-y-auto font-semibold">
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
              <div className="p-5 border-t border-border/40 flex flex-col gap-2 bg-muted/10">
                <Button
                  onClick={() => downloadAttendanceCSV(selectedAttendanceViewClass)}
                  className="w-full h-9 text-xs font-bold bg-primary text-white gap-1.5"
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

      {/* CREATE LIVE CLASS MODAL */}
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
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[90%] max-w-lg bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto space-y-4"
            >
              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground">
                    Schedule Live Class
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsSchedulingLive(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
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
                      placeholder="e.g. Advanced Linear Algebra Concepts"
                      value={createForm.title}
                      onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Course *</label>
                    <select
                      value={createForm.course}
                      onChange={e => setCreateForm(f => ({ ...f, course: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
                      <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Batch *</label>
                    <select
                      value={createForm.batch}
                      onChange={e => setCreateForm(f => ({ ...f, batch: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Batch A">Batch A</option>
                      <option value="Batch B">Batch B</option>
                      <option value="Batch C">Batch C</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Instructor *</label>
                    <input
                      type="text"
                      required
                      value={createForm.instructor}
                      onChange={e => setCreateForm(f => ({ ...f, instructor: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Date Picker *</label>
                    <input
                      type="date"
                      required
                      value={createForm.date}
                      onChange={e => setCreateForm(f => ({ ...f, date: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={createForm.startTime}
                      onChange={e => setCreateForm(f => ({ ...f, startTime: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">End Time *</label>
                    <input
                      type="time"
                      required
                      value={createForm.endTime}
                      onChange={e => setCreateForm(f => ({ ...f, endTime: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Enter description..."
                      value={createForm.description}
                      onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full bg-card border border-border rounded p-2 focus:outline-none font-semibold text-foreground resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Platform *</label>
                    <select
                      value={createForm.platform}
                      onChange={e => setCreateForm(f => ({ ...f, platform: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Meeting URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://meet.google.com/..."
                      value={createForm.meetingLink}
                      onChange={e => setCreateForm(f => ({ ...f, meetingLink: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Password (Optional)</label>
                    <input
                      type="text"
                      placeholder="Meeting passcode"
                      value={createForm.password}
                      onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Max Participants</label>
                    <input
                      type="number"
                      value={createForm.maxParticipants}
                      onChange={e => setCreateForm(f => ({ ...f, maxParticipants: parseInt(e.target.value) || 100 }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Additional Settings Checkboxes */}
                <div className="border-t border-border/40 pt-3 grid grid-cols-2 gap-2 font-bold text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.waitingRoom}
                      onChange={e => setCreateForm(f => ({ ...f, waitingRoom: e.target.checked }))}
                      className="rounded border-border text-primary"
                    />
                    Enable Waiting Room
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.recordingEnabled}
                      onChange={e => setCreateForm(f => ({ ...f, recordingEnabled: e.target.checked }))}
                      className="rounded border-border text-primary"
                    />
                    Enable Auto Recording
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer col-span-2">
                    <input
                      type="checkbox"
                      checked={createForm.attendanceTrackingEnabled}
                      onChange={e => setCreateForm(f => ({ ...f, attendanceTrackingEnabled: e.target.checked }))}
                      className="rounded border-border text-primary"
                    />
                    Enable Auto Attendance Tracking
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer col-span-2 text-primary mt-1">
                    <input
                      type="checkbox"
                      checked={sendReminder}
                      onChange={e => setSendReminder(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    Send Automated Attendance/Email alerts
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40">
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
                    className="h-9 text-xs bg-primary text-white font-bold"
                  >
                    Publish Live Class
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EDIT SESSION DIALOG */}
      <AnimatePresence>
        {editingSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setEditingSession(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-md bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto space-y-4"
            >
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground">
                    Edit Live Class Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingSession(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Session Title *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Date & Time *</label>
                  <input
                    type="text"
                    required
                    value={editForm.time || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, time: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Platform *</label>
                    <select
                      value={editForm.platform || "Google Meet"}
                      onChange={(e) => setEditForm((f) => ({ ...f, platform: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Meeting Link *</label>
                    <input
                      type="text"
                      required
                      value={editForm.meetingLink || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, meetingLink: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Password (Optional)</label>
                    <input
                      type="text"
                      value={editForm.password || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Recording URL (Optional)</label>
                    <input
                      type="text"
                      value={editForm.recordingUrl || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, recordingUrl: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={editForm.notes || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSession(null)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary hover:bg-primary/95 text-white gap-1.5 font-bold"
                  >
                    <Save size={13} />
                    Save Changes
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
