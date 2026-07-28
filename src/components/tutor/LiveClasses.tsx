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
  Laptop
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
  isGateTriggered,
}: LiveClassesProps) {
  const router = useRouter();

  // Active Tab: "upcoming" | "past"
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  // Calendar view mode inside page: "week" | "month"
  const [calMode, setCalMode] = useState<"week" | "month">("week");
  
  // Selected calendar day filtering
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  // Edit session state
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [editForm, setEditForm] = useState<Partial<LiveSession>>({});

  // Additional reminder configs in form
  const [sendReminder, setSendReminder] = useState(true);

  // Generate current week dates for the weekly calendar bar
  const weeklyDates = useMemo(() => {
    const today = new Date();
    const dates = [];
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push({
        name: nextDate.toLocaleDateString("en-US", { weekday: "short" }),
        date: nextDate.getDate(),
        fullDate: nextDate,
        isToday: nextDate.toDateString() === new Date().toDateString()
      });
    }
    return dates;
  }, []);

  // Simple monthly cells for rendering
  const monthlyDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      dates.push({
        date: i,
        isToday: i === new Date().getDate()
      });
    }
    return dates;
  }, []);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => toast.success("Meeting link copied!"));
  };

  const handleCancelSession = (id: string) => {
    setLiveSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Cancelled" } : s))
    );
    toast.success("Session status set to Cancelled.");
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
    handleScheduleLive(e);
    if (sendReminder) {
      toast.success("Notifications scheduled to send 15 minutes before class starts.");
    }
  };

  // Organize sessions into filtered lists
  const filteredSessions = useMemo(() => {
    return liveSessions.filter((session) => {
      const isCompleted = session.status === "Completed";
      
      // Filter by selected day on mini calendars
      if (selectedCalendarDay !== null) {
        const parsed = new Date(session.time);
        const sessionDay = !isNaN(parsed.getTime()) ? parsed.getDate() : new Date().getDate();
        if (sessionDay !== selectedCalendarDay) return false;
      }

      if (activeTab === "upcoming") {
        return !isCompleted && session.status !== "Cancelled";
      } else {
        return isCompleted || session.status === "Cancelled";
      }
    });
  }, [liveSessions, activeTab, selectedCalendarDay]);

  // Schedule form layout
  if (isSchedulingLive) {
    return (
      <motion.div
        key="schedule-live"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card variant="glass" className="p-6 max-w-md mx-auto shadow-floating">
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h4 className="text-sm font-heading font-extrabold uppercase text-foreground">
                Schedule Live Class
              </h4>
              <button
                type="button"
                onClick={() => setIsSchedulingLive(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Session Title *</label>
              <input
                type="text"
                required
                value={liveForm.title}
                onChange={(e) => setLiveForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Calculus Doubts Session..."
                className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Date & Time *</label>
              <input
                type="text"
                required
                value={liveForm.time}
                onChange={(e) => setLiveForm((f) => ({ ...f, time: e.target.value }))}
                placeholder="e.g. 2026-07-30, 5:00 PM IST"
                className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Platform *</label>
                <select
                  value={liveForm.platform}
                  onChange={(e) => setLiveForm((f) => ({ ...f, platform: e.target.value as any }))}
                  className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                </select>
              </div>
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Meeting Link *</label>
                <input
                  type="text"
                  required
                  value={liveForm.link}
                  onChange={(e) => setLiveForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Notes (Optional)</label>
              <textarea
                rows={2}
                value={liveForm.notes || ""}
                onChange={(e) => setLiveForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. Read chapter 4 beforehand..."
                className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <input
                type="checkbox"
                id="sendReminder"
                checked={sendReminder}
                onChange={(e) => setSendReminder(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="sendReminder" className="flex items-center gap-1.5 cursor-pointer">
                <Bell size={12} className="text-primary" />
                Send automated email reminder to all enrolled students
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="submit" className="h-9 text-xs bg-primary hover:bg-primary/95 text-white">
                Schedule Session
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    );
  }

  // Session list dashboard
  return (
    <motion.div
      key="tutor-live"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground">Live Sessions Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, manage, and audit your virtual interactive sessions.
          </p>
        </div>
        <Button onClick={() => setIsSchedulingLive(true)} size="sm" className="h-9 gap-1 shadow-soft bg-primary hover:bg-primary/95 text-white font-bold">
          <Plus size={14} /> Schedule New Class
        </Button>
      </div>

      {/* Mini Calendars Controllers */}
      <Card variant="glass" className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-heading font-extrabold uppercase text-muted-foreground flex items-center gap-1.5">
            <CalendarIcon size={12} className="text-primary" />
            Class Calendars View
          </h4>
          <div className="flex bg-muted/40 p-0.5 rounded-button text-[9px] font-bold">
            <button
              onClick={() => { setCalMode("week"); setSelectedCalendarDay(null); }}
              className={`px-2.5 py-1 rounded-button cursor-pointer ${calMode === "week" ? "bg-card text-foreground" : "text-muted-foreground"}`}
            >
              Weekly Bar
            </button>
            <button
              onClick={() => { setCalMode("month"); setSelectedCalendarDay(null); }}
              className={`px-2.5 py-1 rounded-button cursor-pointer ${calMode === "month" ? "bg-card text-foreground" : "text-muted-foreground"}`}
            >
              Monthly Mini Grid
            </button>
          </div>
        </div>

        {/* Weekly Bar Layout */}
        {calMode === "week" && (
          <div className="grid grid-cols-7 gap-2">
            {weeklyDates.map((day) => {
              const daySessions = liveSessions.filter((s) => {
                const parsed = new Date(s.time);
                const sessionDate = !isNaN(parsed.getTime()) ? parsed.getDate() : new Date().getDate();
                return sessionDate === day.date;
              });
              const hasSessions = daySessions.length > 0;
              const isSelected = selectedCalendarDay === day.date;

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedCalendarDay(isSelected ? null : day.date)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center border text-center transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : day.isToday
                      ? "bg-primary/10 border-primary text-primary"
                      : hasSessions
                      ? "bg-card border-border/80 text-foreground"
                      : "bg-muted/10 border-transparent text-muted-foreground/60 hover:bg-muted/20"
                  }`}
                >
                  <span className="text-[9px] font-extrabold uppercase">{day.name}</span>
                  <span className="text-xs font-extrabold mt-0.5">{day.date}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Monthly Grid Layout */}
        {calMode === "month" && (
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
            {monthlyDates.map((day) => {
              const daySessions = liveSessions.filter((s) => {
                const parsed = new Date(s.time);
                const sessionDate = !isNaN(parsed.getTime()) ? parsed.getDate() : new Date().getDate();
                return sessionDate === day.date;
              });
              const hasSessions = daySessions.length > 0;
              const isSelected = selectedCalendarDay === day.date;

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedCalendarDay(isSelected ? null : day.date)}
                  className={`h-8 rounded-lg flex items-center justify-center border text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : day.isToday
                      ? "bg-primary/10 border-primary text-primary"
                      : hasSessions
                      ? "bg-card border-border/80 text-foreground"
                      : "bg-muted/15 border-transparent text-muted-foreground/50 hover:bg-muted/25"
                  }`}
                >
                  {day.date}
                  {hasSessions && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary absolute mt-4" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedCalendarDay !== null && (
          <div className="flex items-center justify-between text-[10px] font-bold text-primary bg-primary/5 p-2 rounded">
            <span>Filtering sessions for Day: {selectedCalendarDay} of this month</span>
            <button onClick={() => setSelectedCalendarDay(null)} className="hover:underline cursor-pointer">Clear Filter</button>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "upcoming"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Upcoming Classes
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "past"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed & Previous Classes
        </button>
      </div>

      {filteredSessions.length === 0 ? (
        <NoClasses onAction={() => setIsSchedulingLive(true)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Classes Cards List */}
          <div className="space-y-4">
            {filteredSessions.map((live) => (
              <div
                key={live.id}
                className={`card-surface p-4 rounded-card border border-border/60 shadow-soft space-y-3 transition-opacity ${
                  live.status === "Cancelled" ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      live.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : live.status === "Cancelled"
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    }`}>
                      <Video size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{live.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{live.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                      live.status === "Completed"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        : live.status === "Cancelled"
                        ? "bg-muted border-border text-muted-foreground"
                        : "bg-sky-500/10 border-sky-500/20 text-sky-500"
                    }`}>
                      {live.status || "Scheduled"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center text-[10px] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Link2 size={11} /> {live.platform}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {live.studentsCount || 0} enrolled
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle size={11} /> {live.attendanceCount || 0} attended
                  </span>
                </div>

                {live.notes && (
                  <p className="text-[10px] bg-muted/30 p-2.5 border border-border/40 rounded text-muted-foreground font-medium">
                    Notes: {live.notes}
                  </p>
                )}

                {/* Display mock integration credentials */}
                <div className="grid grid-cols-2 gap-3 text-[9px] bg-card p-2 rounded border border-border/40 font-semibold text-muted-foreground">
                  <div>
                    <span className="text-foreground font-bold">Integration:</span> {live.platform === "Zoom" ? "Zoom API Client" : "Google Calendar Sync"}
                  </div>
                  <div>
                    <span className="text-foreground font-bold">Attendee Reminders:</span> Enabled (Email/SMS)
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {live.status !== "Cancelled" && (
                    <Button
                      size="sm"
                      onClick={() => navigateToClassroom(router, live.id)}
                      className="h-7 text-[10px] font-bold flex-1 bg-primary hover:bg-primary/95 text-white"
                    >
                      Join Class
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(live.meetingLink)}
                    className="h-7 text-[10px] font-bold px-2.5"
                    title="Copy meeting URL"
                  >
                    <Copy size={12} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartEdit(live)}
                    className="h-7 text-[10px] font-bold px-2.5"
                    title="Edit Session"
                  >
                    <Edit3 size={12} />
                  </Button>
                  {live.status !== "Completed" && live.status !== "Cancelled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelSession(live.id)}
                      className="h-7 text-[10px] font-bold px-2.5 text-amber-600 hover:bg-amber-500/5"
                      title="Cancel Session"
                    >
                      <XCircle size={12} />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSession(live.id)}
                    className="h-7 text-[10px] font-bold px-2.5 text-rose-600 hover:bg-rose-500/5"
                    title="Delete Session"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Side stats & Recordings */}
          <div className="space-y-4">
            <Card variant="glass" className="p-4">
              <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground border-b border-border/60 pb-2 mb-3">
                Class stats
              </h4>
              <div className="space-y-2.5 text-xs font-semibold">
                {[
                  { label: "Active Upcoming", value: liveSessions.filter((s) => s.status === "Scheduled").length },
                  { label: "Completed Classes", value: liveSessions.filter((s) => s.status === "Completed").length },
                  { label: "Average Attendance", value: "94%" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-foreground font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <h4 className="text-xs font-heading font-extrabold text-foreground mb-2 flex items-center gap-1.5">
                <Laptop size={12} className="text-primary animate-pulse" />
                Completed Session Recordings
              </h4>
              <div className="space-y-2 mt-2">
                {liveSessions.filter(s => s.recordingUrl).map(session => (
                  <div key={session.id} className="p-2.5 bg-muted/40 rounded border border-border/40 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-foreground truncate max-w-[130px]">{session.title}</span>
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-extrabold flex items-center gap-0.5"
                    >
                      Play <ExternalLink size={10} />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Session Dialog */}
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
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-md bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto"
            >
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-heading font-extrabold uppercase text-foreground">
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

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Session Title *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
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
                  <div className="space-y-1 text-xs">
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
                  <div className="space-y-1 text-xs">
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
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-foreground">Password (Optional)</label>
                    <input
                      type="text"
                      value={editForm.password || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-foreground">Recording URL (Optional)</label>
                    <input
                      type="text"
                      value={editForm.recordingUrl || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, recordingUrl: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={editForm.notes || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
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
                    className="h-9 text-xs bg-primary hover:bg-primary/95 text-white gap-1.5"
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
