"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Video, 
  Circle, 
  Pause, 
  Play, 
  Square, 
  Wifi, 
  ChevronLeft, 
  ShieldCheck, 
  User 
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { useClassroom } from "../context/ClassroomContext";

export function ClassroomHeader() {
  const router = useRouter();
  const { session, recordingState, startRecording, pauseRecording, stopRecording, leaveClassroom } = useClassroom();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer ticking effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours > 0 ? String(hours).padStart(2, "0") : null,
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0")
    ].filter(Boolean).join(":");
  };

  const handleLeave = () => {
    leaveClassroom();
    if (session?.isTutor) {
      router.push("/tutor/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  };

  if (!session) return null;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-border text-white select-none shrink-0 h-16">
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          onClick={handleLeave} 
          className="h-8 px-2 text-muted-foreground hover:text-white hover:bg-slate-800/60 rounded"
        >
          <ChevronLeft size={16} className="mr-1" />
          Leave
        </Button>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded">
            <Video size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold font-heading truncate max-w-[200px] sm:max-w-[300px]">
              {session.title}
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Live Classroom
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Timer & Recording */}
      <div className="flex items-center gap-4">
        {/* Timer */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-full border border-border text-xs font-mono font-bold text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {formatTime(elapsedTime)}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-border text-[10px] font-bold">
          {session.isTutor ? (
            <>
              {recordingState === "idle" && (
                <button 
                  onClick={startRecording}
                  className="flex items-center gap-1 text-muted-foreground hover:text-rose-400 px-1.5 py-0.5 rounded hover:bg-slate-800/40 transition-colors"
                >
                  <Circle size={10} className="fill-rose-500 text-rose-500" />
                  Record
                </button>
              )}
              {recordingState === "recording" && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-rose-400 animate-pulse px-1">
                    <Circle size={10} className="fill-rose-500 text-rose-500" />
                    REC
                  </span>
                  <button 
                    onClick={pauseRecording}
                    title="Pause Recording"
                    className="p-1 text-muted-foreground hover:text-white rounded hover:bg-slate-800"
                  >
                    <Pause size={10} />
                  </button>
                  <button 
                    onClick={stopRecording}
                    title="Stop Recording"
                    className="p-1 text-muted-foreground hover:text-white rounded hover:bg-slate-800"
                  >
                    <Square size={10} />
                  </button>
                </div>
              )}
              {recordingState === "paused" && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-amber-400 px-1">
                    <Pause size={10} />
                    PAUSED
                  </span>
                  <button 
                    onClick={startRecording}
                    title="Resume Recording"
                    className="p-1 text-muted-foreground hover:text-white rounded hover:bg-slate-800"
                  >
                    <Play size={10} />
                  </button>
                  <button 
                    onClick={stopRecording}
                    title="Stop Recording"
                    className="p-1 text-muted-foreground hover:text-white rounded hover:bg-slate-800"
                  >
                    <Square size={10} />
                  </button>
                </div>
              )}
            </>
          ) : (
            // Student view of recording
            recordingState !== "idle" ? (
              <span className="flex items-center gap-1 text-rose-400 px-2 py-0.5">
                <Circle size={8} className="fill-rose-500 text-rose-500 animate-pulse" />
                {recordingState === "recording" ? "REC" : "REC PAUSED"}
              </span>
            ) : (
              <span className="text-muted-foreground/80 px-2 py-0.5">Not Recording</span>
            )
          )}
        </div>
      </div>

      {/* Right: Latency & Profile info */}
      <div className="flex items-center gap-3">
        {/* Latency */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded">
          <Wifi size={10} />
          24 ms
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-full border border-border max-w-[150px]">
          <div className="w-5 h-5 rounded-full bg-slate-800 text-muted-foreground flex items-center justify-center text-[9px] font-black uppercase shrink-0">
            {session.userName.charAt(0)}
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground truncate hidden md:inline">
            {session.userName}
          </span>
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[8px] font-extrabold px-1.5 py-0 uppercase tracking-wider shrink-0 h-4 flex items-center">
            {session.isTutor ? <ShieldCheck size={8} className="mr-0.5" /> : <User size={8} className="mr-0.5" />}
            {session.isTutor ? "Tutor" : "Student"}
          </Badge>
        </div>
      </div>
    </header>
  );
}
