"use client";

import React from "react";
import { motion } from "framer-motion";
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

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => toast.success("Meeting link copied!"));
  };

  const handleCancelSession = (id: string) => {
    setLiveSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Cancelled" } : s))
    );
    toast.success("Session cancelled.");
  };

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
              <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                Schedule Live Class
              </h4>
              <button
                type="button"
                onClick={() => setIsSchedulingLive(false)}
                className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
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
              <Button type="submit" className="h-9 text-xs">
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
          <h2 className="text-base font-heading font-extrabold text-foreground">Live Classes</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {liveSessions.filter((s) => s.status !== "Cancelled").length} active sessions
          </p>
        </div>
        <Button onClick={() => setIsSchedulingLive(true)} size="sm" className="h-9 gap-1 shadow-soft">
          <Plus size={14} /> Schedule Class
        </Button>
      </div>

      {/* Pro upgrade inline notice */}
      {isGateTriggered && (
        <div className="relative rounded-card overflow-hidden border border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-foreground">Upgrade to unlock recording & analytics</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Get access to session recordings, attendance tracking, and student engagement insights.
            </p>
          </div>
          <Button size="sm" className="h-8 shrink-0 text-[10px] font-bold" onClick={() => router.push("/pricing")}>
            Upgrade
          </Button>
        </div>
      )}

      {liveSessions.length === 0 ? (
        <NoClasses onAction={() => setIsSchedulingLive(true)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Session cards */}
          <div className="space-y-3">
            {liveSessions.map((live) => (
              <div
                key={live.id}
                className={`card-surface p-4 rounded-card shadow-soft space-y-3 transition-opacity ${
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
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
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

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Link2 size={11} /> {live.platform}
                  </span>
                  {live.studentsCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {live.studentsCount} students
                    </span>
                  )}
                </div>

                {live.status !== "Cancelled" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigateToClassroom(router, live.id)}
                      className="h-7 text-[10px] font-bold flex-1"
                    >
                      Launch Class
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(live.meetingLink)}
                      className="h-7 text-[10px] font-bold px-2"
                    >
                      <Copy size={11} />
                    </Button>
                    {live.status !== "Completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelSession(live.id)}
                        className="h-7 text-[10px] font-bold px-2 text-destructive hover:bg-destructive/5"
                      >
                        <XCircle size={11} />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="space-y-3">
            <Card variant="glass" className="p-4">
              <h4 className="text-xs font-heading font-extrabold uppercase text-muted-foreground border-b border-border/60 pb-2 mb-3">
                Session Stats
              </h4>
              <div className="space-y-2.5 text-xs font-semibold">
                {[
                  { label: "Total Scheduled", value: liveSessions.filter((s) => s.status !== "Cancelled").length },
                  { label: "Completed", value: liveSessions.filter((s) => s.status === "Completed").length },
                  { label: "Cancelled", value: liveSessions.filter((s) => s.status === "Cancelled").length },
                  { label: "Total Attendance", value: liveSessions.reduce((acc, s) => acc + (s.attendanceCount || 0), 0) },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-foreground font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pro-gated recording */}
            <div className="relative rounded-card border border-border/40 overflow-hidden">
              <div className="p-4 blur-sm pointer-events-none select-none">
                <h4 className="text-xs font-bold text-foreground mb-2">Session Recordings</h4>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-10 bg-muted/40 rounded" />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-card/95 border border-border rounded-card p-3 text-center shadow-floating">
                  <Lock size={14} className="text-muted-foreground mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-foreground mb-2">Pro Only</p>
                  <Button
                    size="sm"
                    className="h-7 text-[9px] font-bold"
                    onClick={() => router.push("/pricing")}
                  >
                    Upgrade to unlock
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
});
