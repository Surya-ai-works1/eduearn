"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Video, Trash2, Edit2, Check, X, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

interface LiveSession {
  id: string;
  title: string;
  tutorName: string;
  meetLink: string;
  date: string;
  time: string;
  attendanceCount: number;
  recordingLink?: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  studentsCount?: number;
}

interface LiveClassesTabProps {
  adminLiveSessions: any[];
  saveAdminLiveSessions: (sessions: any[]) => void;
  logAuditAction: (actionStr: string) => void;
}

export default function LiveClassesTab({
  adminLiveSessions,
  saveAdminLiveSessions,
  logAuditAction
}: LiveClassesTabProps) {
  const [editingLiveSessionId, setEditingLiveSessionId] = useState<string | null>(null);
  const [liveEditLink, setLiveEditLink] = useState("");
  const [liveEditTime, setLiveEditTime] = useState("");

  const handleSimulateActiveJoins = () => {
    const simulated = adminLiveSessions.map(session => {
      if (session.status !== "Cancelled") {
        const newJoined = Math.floor(Math.random() * 8) + 2;
        return {
          ...session,
          studentsCount: (session.studentsCount || 0) + newJoined,
          attendanceCount: (session.attendanceCount || 0) + Math.max(1, newJoined - 1)
        };
      }
      return session;
    });
    saveAdminLiveSessions(simulated);
    toast.success("Simulated active participants checks: Updated attendee logs.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left text-xs font-semibold"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 select-none">
        <div>
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
            Platform Live Peer Classroom Monitor
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            View active meeting links, reschedule classes, and audit attendance statistics.
          </p>
        </div>
        <Button
          onClick={handleSimulateActiveJoins}
          size="sm"
          className="h-9 font-bold shadow-soft bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Simulate Active Joins
        </Button>
      </div>

      {/* SESSIONS TABLE */}
      <Card className="p-5 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                <th className="pb-3 pl-2">Session Title</th>
                <th className="pb-3 font-bold">Platform</th>
                <th className="pb-3 font-bold">Time Scheduled</th>
                <th className="pb-3 font-bold">Meeting link</th>
                <th className="pb-3 font-bold">Live Joined</th>
                <th className="pb-3 font-bold">Attendance Rate</th>
                <th className="pb-3 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminLiveSessions.map((session) => {
                const isCancelled = session.status === "Cancelled";
                const totalJoined = session.studentsCount || 0;
                const attendanceRate = totalJoined > 0 
                  ? Math.round(((session.attendanceCount || 0) / totalJoined) * 100)
                  : 0;

                return (
                  <tr key={session.id} className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                    <td className="py-3.5 pl-2 font-bold max-w-xs truncate text-foreground">
                      {session.title}
                      {isCancelled && (
                        <span className="ml-2 text-[8px] bg-red-500/10 text-red-500 font-extrabold px-1.5 py-0.5 rounded">
                          CANCELLED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">
                        {session.platform || "Google Meet"}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-muted-foreground">
                      {editingLiveSessionId === session.id ? (
                        <input
                          type="text"
                          value={liveEditTime}
                          onChange={(e) => setLiveEditTime(e.target.value)}
                          className="h-8 rounded border border-border px-2 text-[10px] text-foreground bg-card focus:outline-none"
                        />
                      ) : (
                        session.time
                      )}
                    </td>
                    <td className="py-3.5 text-primary underline truncate max-w-[150px]">
                      {editingLiveSessionId === session.id ? (
                        <input
                          type="text"
                          value={liveEditLink}
                          onChange={(e) => setLiveEditLink(e.target.value)}
                          className="h-8 rounded border border-border px-2 text-[10px] text-foreground bg-card w-full focus:outline-none"
                        />
                      ) : (
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary/80">
                          {session.meetingLink}
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 font-bold text-foreground">
                      {totalJoined} joined
                    </td>
                    <td className="py-3.5 font-bold text-foreground">
                      {attendanceRate}%
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 justify-center">
                        {editingLiveSessionId === session.id ? (
                          <>
                            <button
                              onClick={() => {
                                const updated = adminLiveSessions.map(s => 
                                  s.id === session.id 
                                    ? { ...s, meetingLink: liveEditLink, time: liveEditTime }
                                    : s
                                );
                                saveAdminLiveSessions(updated);
                                setEditingLiveSessionId(null);
                                logAuditAction(`Updated live class properties for: ${session.title}`);
                                toast.success("Live session updated.");
                              }}
                              className="p-1 hover:bg-emerald-500/10 text-emerald-500 rounded border border-border/20 cursor-pointer"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setEditingLiveSessionId(null)}
                              className="p-1 hover:bg-muted text-muted-foreground rounded border border-border/20 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingLiveSessionId(session.id);
                                setLiveEditLink(session.meetingLink);
                                setLiveEditTime(session.time);
                              }}
                              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded border border-border/20 cursor-pointer"
                              title="Edit Class details"
                            >
                              <Edit2 size={12} />
                            </button>
                            {!isCancelled && (
                              <button
                                onClick={() => {
                                  const updated = adminLiveSessions.map(s => 
                                    s.id === session.id ? { ...s, status: "Cancelled" } : s
                                  );
                                  saveAdminLiveSessions(updated);
                                  logAuditAction(`Cancelled Scheduled class: ${session.title}`);
                                  toast.error("Live session marked as cancelled.");
                                }}
                                className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded border border-border/20 cursor-pointer"
                                title="Cancel Class"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
