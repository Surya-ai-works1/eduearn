"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Hand, 
  PenTool, 
  MessageSquare, 
  Users, 
  LogOut 
} from "lucide-react";
import { useClassroom } from "../context/ClassroomContext";
import { Button } from "../../../components/ui/button";

export function ClassroomToolbar() {
  const router = useRouter();
  const { 
    session,
    participants, 
    activeWhiteboard, 
    sidebarOpen, 
    sidebarTab,
    isScreenSharing,
    toggleMic, 
    toggleCam, 
    toggleScreenShare,
    toggleRaisedHand, 
    toggleWhiteboard, 
    toggleSidebar,
    leaveClassroom
  } = useClassroom();

  const localUser = participants.find((p) => p.isLocal);
  const isMuted = localUser?.muted ?? true;
  const isCamOn = localUser?.cameraOn ?? false;
  const isHandRaised = localUser?.raisedHand ?? false;

  const handleLeave = () => {
    leaveClassroom();
    if (session?.isTutor) {
      router.push("/tutor/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  };

  return (
    <div className="bg-slate-900 border-t border-border px-6 py-4 flex items-center justify-between select-none shrink-0 h-20 text-white">
      {/* Left section: Secondary controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={toggleRaisedHand}
          className={`h-10 px-3 rounded-button text-xs gap-1.5 border transition-all ${
            isHandRaised 
              ? "bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600 hover:text-slate-950" 
              : "text-muted-foreground border-border hover:text-white hover:bg-slate-800"
          }`}
        >
          <Hand size={15} className={isHandRaised ? "fill-current" : ""} />
          <span className="hidden sm:inline">Raise Hand</span>
        </Button>

        <Button
          variant="ghost"
          onClick={toggleWhiteboard}
          className={`h-10 px-3 rounded-button text-xs gap-1.5 border transition-all ${
            activeWhiteboard
              ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
              : "text-muted-foreground border-border hover:text-white hover:bg-slate-800"
          }`}
        >
          <PenTool size={15} />
          <span className="hidden sm:inline">{activeWhiteboard ? "Show Video Grid" : "Open Whiteboard"}</span>
        </Button>
      </div>

      {/* Center section: Core stream toggles */}
      <div className="flex items-center gap-3">
        {/* Mic */}
        <button
          onClick={toggleMic}
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
            isMuted
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30"
              : "bg-slate-800 text-foreground border-slate-700 hover:bg-slate-700 hover:text-white"
          }`}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Video */}
        <button
          onClick={toggleCam}
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
            !isCamOn
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30"
              : "bg-slate-800 text-foreground border-slate-700 hover:bg-slate-700 hover:text-white"
          }`}
          title={isCamOn ? "Stop Camera" : "Start Camera"}
        >
          {isCamOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
            isScreenSharing
              ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
              : "bg-slate-800 text-muted-foreground border-slate-700 hover:bg-slate-700 hover:text-foreground"
          }`}
          title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
        >
          <Monitor size={18} />
        </button>
      </div>

      {/* Right section: Sidebar toggle & Leave */}
      <div className="flex items-center gap-2">
        {/* Chat tab toggle */}
        <button
          onClick={() => toggleSidebar("chat")}
          className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all relative ${
            sidebarOpen && sidebarTab === "chat"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
              : "text-muted-foreground border-border hover:text-white hover:bg-slate-800"
          }`}
          title="Toggle Chat"
        >
          <MessageSquare size={16} />
        </button>

        {/* Participants tab toggle */}
        <button
          onClick={() => toggleSidebar("participants")}
          className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all relative ${
            sidebarOpen && sidebarTab === "participants"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
              : "text-muted-foreground border-border hover:text-white hover:bg-slate-800"
          }`}
          title="Toggle Participants"
        >
          <Users size={16} />
          <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-[8px] font-black text-white px-1 rounded-full border border-border select-none">
            {participants.length}
          </span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Leave call */}
        <Button
          onClick={handleLeave}
          className="h-10 px-4 rounded-button text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 border border-rose-700 shadow-soft"
        >
          <LogOut size={14} />
          Leave
        </Button>
      </div>
    </div>
  );
}
