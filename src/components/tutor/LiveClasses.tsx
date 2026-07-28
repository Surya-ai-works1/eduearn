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
  X
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
  
  // Edit session state
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [editForm, setEditForm] = useState<Partial<LiveSession>>({});

  // Generate current week dates for the weekly calendar bar
  const weeklyDates = useMemo(() => {
    const today = new Date();
    const dates = [];
    // Start from Monday of current week
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

  // Organize sessions into upcoming and past
  const filteredSessions = useMemo(() => {
    return liveSessions.filter((session) => {
      const isCancelled = session.status === "Cancelled";
      const isCompleted = session.status === "Completed";
      
      // Basic check: if status is Completed, it goes to past. Otherwise check date logic
      // e.g. "Today, 5:00 PM IST" or similar string check
      if (activeTab === "upcoming") {
        return !isCompleted && session.status !== "Cancelled";
      } else {
        return isCompleted || isCancelled;
      }
    });
  }, [liveSessions, activeTab]);

  // Schedule form
  if (isSchedulingLive) {
    return (
      <motion.div
        key="schedule-live"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card variant="glass" className="p-6 max-w-md mx-auto shadow-floating">
          <form onSubmit={handleScheduleLive} className="space-y-4">
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
                placeholder="e.g. Today, 5:00 PM IST"
                className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-foreground">Platform *</label>
                <select
                  value={liveForm.platform}
                  onChange={(e) => setLiveForm((f) => ({ ...f, platform: e.target.value as LiveClassesProps["liveForm"]["platform"] }))}
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

            {liveForm.platform === "Zoom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Password (Optional)</label>
                  <input
                    type="text"
                    value={liveForm.password || ""}
                    onChange={(e) => setLiveForm((f) => ({ ...f, password: e.target.value }))}
                    className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Recording URL (Optional)</label>
                  <input
                    type="text"
                    value={liveForm.recordingUrl || ""}
                    onChange={(e) => setLiveForm((f) => ({ ...f, recordingUrl: e.target.value }))}
                    className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Notes (Optional)</label>
              <textarea
                rows={3}
                value={liveForm.notes || ""}
                onChange={(e) => setLiveForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. Please read chapter 4 before joining..."
                className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
              />
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

  // Session list
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
          <h2 className="text-xl font-heading font-extrabold text-foreground">Live Classroom Manager</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {liveSessions.filter((s) => s.status === "Scheduled").length} scheduled classes &bull; {liveSessions.filter((s) => s.status === "Completed").length} completed
          </p>
        </div>
        <Button onClick={() => setIsSchedulingLive(true)} size="sm" className="h-9 gap-1 shadow-soft bg-primary hover:bg-primary/95 text-white font-bold">
          <Plus size={14} /> Schedule New Class
        </Button>
      </div>

      {/* Weekly mini calendar */}
      <Card variant="glass" className="p-4">
        <h4 className="text-[10px] font-heading font-extrabold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
          <CalendarIcon size={12} className="text-primary" />
          Weekly Calendar Overview
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {weeklyDates.map((day) => {
            // Find sessions scheduled for this day (date matches day.date)
            const daySessions = liveSessions.filter((s) => {
              const parsed = new Date(s.time);
              const sessionDate = !isNaN(parsed.getTime()) ? parsed.getDate() : new Date().getDate();
              return sessionDate === day.date;
            });
            const hasSessions = daySessions.length > 0;

            return (
              <div
                key={day.date}
                className={`p-2 rounded-xl flex flex-col items-center justify-center border text-center transition-all ${
                  day.isToday
                    ? "bg-primary/10 border-primary text-primary"
                    : hasSessions
                    ? "bg-card border-border/80 text-foreground"
                    : "bg-muted/10 border-transparent text-muted-foreground/60"
                }`}
              >
                <span className="text-[9px] font-extrabold uppercase">{day.name}</span>
                <span className="text-sm font-extrabold mt-0.5">{day.date}</span>
                {hasSessions && (
                  <div className="flex gap-0.5 mt-1.5">
                    {daySessions.map((s, idx) => (
                      <span key={idx} className="w-1.5 h-1.5 rounded-full bg-primary" title={s.title} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
          Previous Classes
        </button>
      </div>

      {filteredSessions.length === 0 ? (
        <NoClasses onAction={() => setIsSchedulingLive(true)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
          {/* Session Cards */}
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
                        : "bg-primary/10 text-primary animate-pulse"
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
                  {live.recordingUrl && (
                    <a
                      href={live.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink size={11} /> View Recording
                    </a>
                  )}
                </div>

                {live.notes && (
                  <p className="text-[10px] bg-muted/30 p-2 border border-border/40 rounded text-muted-foreground font-medium">
                    {live.notes}
                  </p>
                )}

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

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card variant="glass" className="p-4">
              <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground border-b border-border/60 pb-2 mb-3">
                Live Class Statistics
              </h4>
              <div className="space-y-2.5 text-xs font-semibold">
                {[
                  { label: "Scheduled Classes", value: liveSessions.filter((s) => s.status === "Scheduled").length },
                  { label: "Completed Classes", value: liveSessions.filter((s) => s.status === "Completed").length },
                  { label: "Cancelled Classes", value: liveSessions.filter((s) => s.status === "Cancelled").length },
                  { label: "Total Sessions Run", value: liveSessions.length },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold">{stat.label}</span>
                    <span className="text-foreground font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pro Recordings Box */}
            <Card variant="glass" className="p-4 relative overflow-hidden">
              <h4 className="text-xs font-heading font-extrabold text-foreground mb-2 flex items-center gap-1.5">
                <Clock size={12} className="text-primary" />
                Session Recordings Ledger
              </h4>
              <div className="space-y-2 mt-2">
                {liveSessions.filter(s => s.recordingUrl).map(session => (
                  <div key={session.id} className="p-2 bg-muted/40 rounded border border-border/40 flex items-center justify-between text-[10px]">
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
                {liveSessions.filter(s => s.recordingUrl).length === 0 && (
                  <p className="text-[10px] text-muted-foreground italic text-center py-4">No recording URLs saved yet.</p>
                )}
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
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded hover:bg-muted"
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
