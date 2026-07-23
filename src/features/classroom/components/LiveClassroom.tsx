"use client";

import React from "react";
import { ClassroomProvider, useClassroom, ClassroomSession } from "../context/ClassroomContext";
import { ClassroomHeader } from "./ClassroomHeader";
import { ClassroomToolbar } from "./ClassroomToolbar";
import { ClassroomSidebar } from "./ClassroomSidebar";
import { VideoGrid } from "./VideoGrid";
import { WhiteboardPanel } from "./WhiteboardPanel";
import { PeerParticipant } from "../services/videoService";
import { Mic, MicOff, Hand } from "lucide-react";

function ClassroomLayout() {
  const { activeWhiteboard, sidebarOpen, participants } = useClassroom();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* 1. Header Area */}
      <ClassroomHeader />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Workspace body */}
        <div className="flex-1 flex min-w-0 bg-slate-950">
          {activeWhiteboard ? (
            /* Split layout in Whiteboard mode */
            <div className="flex-1 flex min-w-0">
              {/* Whiteboard takes most of screen */}
              <div className="flex-1 h-full min-w-0">
                <WhiteboardPanel />
              </div>
              
              {/* Vertical side videos strip (similar to Zoom/Teams whiteboard view) */}
              <div className="w-60 border-l border-border bg-slate-950 flex flex-col gap-3 p-3 overflow-y-auto shrink-0 select-none hidden md:flex">
                <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
                  Class Feed
                </div>
                {participants.map((p) => (
                  <SidebarVideoCard key={p.id} participant={p} />
                ))}
              </div>
            </div>
          ) : (
            /* Full-screen video grid */
            <div className="flex-1 h-full min-w-0">
              <VideoGrid />
            </div>
          )}
        </div>

        {/* Collapsible Sidebar (Chat / Participants) */}
        {sidebarOpen && <ClassroomSidebar />}
      </div>

      {/* 3. Bottom Toolbar */}
      <ClassroomToolbar />
    </div>
  );
}

/**
 * Small video card rendered in the side column during whiteboard sessions
 */
function SidebarVideoCard({ participant }: { participant: PeerParticipant }) {
  const isSpeaking = participant.volume > 0 && !participant.muted;
  
  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden bg-slate-900 border flex flex-col items-center justify-center shrink-0 ${
      isSpeaking ? "border-blue-500 shadow-md" : "border-border"
    }`}>
      {/* Placeholder initials */}
      <div className="text-xs font-black uppercase text-muted-foreground/80 bg-slate-950 w-8 h-8 rounded-full flex items-center justify-center border border-border select-none">
        {participant.name.charAt(0)}
      </div>

      {/* Overlays */}
      <div className="absolute top-2 left-2 flex gap-1 items-center">
        {participant.raisedHand && (
          <div className="bg-amber-500 text-slate-950 rounded-full p-0.5" title="Hand Raised">
            <Hand size={8} className="fill-current" />
          </div>
        )}
      </div>

      <div className="absolute bottom-1.5 left-2 right-2 flex justify-between items-center bg-slate-950/75 px-1.5 py-0.5 rounded text-[8px] border border-border/40 select-none pointer-events-none">
        <span className="text-muted-foreground truncate pr-1 font-semibold">{participant.name}</span>
        {participant.muted ? (
          <MicOff size={8} className="text-rose-400 shrink-0" />
        ) : (
          <Mic size={8} className="text-muted-foreground shrink-0" />
        )}
      </div>
    </div>
  );
}

export function LiveClassroom({ sessionInit }: { sessionInit: ClassroomSession }) {
  return (
    <ClassroomProvider sessionInit={sessionInit}>
      <ClassroomLayout />
    </ClassroomProvider>
  );
}
