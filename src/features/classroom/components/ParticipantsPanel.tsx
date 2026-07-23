"use client";

import React from "react";
import { Mic, MicOff, Video, VideoOff, Hand, ShieldCheck, User } from "lucide-react";
import { useClassroom } from "../context/ClassroomContext";
import { Badge } from "../../../components/ui/badge";

export function ParticipantsPanel() {
  const { participants } = useClassroom();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden select-none">
      {/* Search/Filter block */}
      <div className="px-4 py-2 bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider flex justify-between items-center">
        <span>Participants ({participants.length})</span>
        <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Active Live</span>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700">
        {participants.map((p) => {
          const isTutor = p.role === "tutor";
          const isLocal = p.isLocal;
          const isSpeaking = p.volume > 0 && !p.muted;

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                isSpeaking 
                  ? "bg-slate-800/40 border-blue-500/30" 
                  : "bg-slate-950/20 border-border/30"
              }`}
            >
              {/* Left side: Avatar & Identity info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase shrink-0 relative ${
                  isTutor 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" 
                    : "bg-slate-800 text-muted-foreground border border-slate-700"
                }`}>
                  {p.name.charAt(0)}
                  {isSpeaking && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold truncate max-w-[110px] ${
                      isTutor ? "text-blue-400 font-bold" : "text-muted-foreground"
                    }`}>
                      {p.name}
                    </span>
                    {isLocal && (
                      <span className="text-[8px] text-muted-foreground/80 font-extrabold uppercase bg-slate-850 px-1 rounded border border-border/60 shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 select-none">
                    <Badge className={`text-[7px] font-extrabold px-1.5 py-0 uppercase shrink-0 h-3.5 flex items-center tracking-wide ${
                      isTutor 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                        : "bg-slate-800 text-muted-foreground border-border"
                    }`}>
                      {isTutor ? <ShieldCheck size={7} className="mr-0.5" /> : <User size={7} className="mr-0.5" />}
                      {isTutor ? "Tutor" : "Learner"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Right side: Active status icons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Hand Raised */}
                {p.raisedHand && (
                  <div className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 animate-pulse">
                    <Hand size={10} className="fill-current" />
                  </div>
                )}

                {/* Microphone */}
                {p.muted ? (
                  <div className="w-5 h-5 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <MicOff size={9} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded bg-slate-850 text-muted-foreground flex items-center justify-center border border-border">
                    <Mic size={9} />
                  </div>
                )}

                {/* Video */}
                {!p.cameraOn ? (
                  <div className="w-5 h-5 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <VideoOff size={9} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded bg-slate-850 text-muted-foreground flex items-center justify-center border border-border">
                    <Video size={9} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
