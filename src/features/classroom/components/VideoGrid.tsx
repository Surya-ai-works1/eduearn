"use client";

import React, { useRef, useEffect } from "react";
import { Mic, MicOff, Hand, Wifi, Monitor } from "lucide-react";
import { useClassroom } from "../context/ClassroomContext";
import { PeerParticipant } from "../services/videoService";

export function VideoGrid() {
  const { participants, localStream, isScreenSharing } = useClassroom();
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Bind local camera stream to local video element
  useEffect(() => {
    if (localVideoRef.current) {
      const localUser = participants.find((p) => p.isLocal);
      if (localStream && localUser?.cameraOn) {
        localVideoRef.current.srcObject = localStream;
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [localStream, participants]);

  // Determine grid columns count based on participant length
  const getGridClass = (count: number) => {
    if (count <= 1) return "grid-cols-1 md:grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    return "grid-cols-2 md:grid-cols-3";
  };

  return (
    <div className={`grid gap-4 w-full h-full p-4 overflow-y-auto ${getGridClass(participants.length)}`}>
      {participants.map((p) => {
        const isSpeaking = p.volume > 0 && !p.muted;
        
        return (
          <div
            key={p.id}
            className={`relative rounded-xl overflow-hidden bg-slate-950 border transition-all duration-300 shadow-premium flex flex-col items-center justify-center min-h-[180px] sm:min-h-[240px] ${
              isSpeaking
                ? "border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.25)] scale-[1.01]"
                : "border-border"
            }`}
          >
            {/* Video Feed */}
            {p.isLocal ? (
              // Local video node
              p.cameraOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <LocalPlaceholder participant={p} isSharing={isScreenSharing} />
              )
            ) : (
              // Peer simulated video nodes
              p.cameraOn ? (
                <PeerVideoSimulation participant={p} />
              ) : (
                <PeerPlaceholder participant={p} />
              )
            )}

            {/* Screen Share Overlay (Local user) */}
            {p.isLocal && isScreenSharing && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-10 text-xs text-muted-foreground font-semibold p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center animate-pulse">
                  <Monitor size={24} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">You are sharing your screen</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">Other participants can see your presentation</p>
                </div>
              </div>
            )}

            {/* Top Bar Overlays: Raised hand, connection info */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20 pointer-events-none select-none">
              {p.raisedHand && (
                <div className="flex items-center gap-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-bounce">
                  <Hand size={8} className="fill-current" />
                  Hand Raised
                </div>
              )}
              <div className={`ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                p.connectionQuality === "Good" 
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : p.connectionQuality === "Fair"
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                  : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
              }`}>
                <Wifi size={8} />
                {p.connectionQuality}
              </div>
            </div>

            {/* Bottom Bar Overlays: Name, Audio status */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-20 pointer-events-none select-none bg-slate-950/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-border/40">
              <span className="text-[10px] font-bold text-foreground truncate pr-2">
                {p.name}
              </span>
              <div className="shrink-0 flex items-center">
                {p.muted ? (
                  <div className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <MicOff size={10} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded bg-slate-800 text-muted-foreground flex items-center justify-center border border-border relative">
                    <Mic size={10} />
                    {isSpeaking && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Local User Placeholder (Camera Off) */
function LocalPlaceholder({ participant, isSharing }: { participant: PeerParticipant; isSharing: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center p-4">
      <div className="w-16 h-16 rounded-full bg-slate-800 text-muted-foreground flex items-center justify-center text-lg font-black border-2 border-slate-700 select-none uppercase shadow-inner">
        {participant.name.charAt(0)}
      </div>
      <div className="text-xs">
        <p className="text-muted-foreground font-bold">{isSharing ? "Sharing Screen Only" : "Your Camera is Off"}</p>
        <p className="text-[10px] text-muted-foreground/80 mt-0.5">Toggle camera below to share video</p>
      </div>
    </div>
  );
}

/* Peer User Placeholder (Camera Off) */
function PeerPlaceholder({ participant }: { participant: PeerParticipant }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center p-4">
      <div className="w-16 h-16 rounded-full bg-slate-900 text-white/90/80 flex items-center justify-center text-lg font-black border border-border select-none uppercase">
        {participant.name.charAt(0)}
      </div>
      <div className="text-xs">
        <p className="text-muted-foreground font-bold">Camera is Off</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Waiting for video stream...</p>
      </div>
    </div>
  );
}

/* Peer Video Simulation (Camera On) */
function PeerVideoSimulation({ participant }: { participant: PeerParticipant }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 select-none">
      {/* Animated canvas grid lines to simulate webcam feedback noise */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Simulation layout */}
      <div className="relative flex flex-col items-center gap-2.5 z-10">
        {/* Profile with speech pulse simulation */}
        <div className={`w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold text-muted-foreground transition-all duration-300 ${
          participant.volume > 0 && !participant.muted
            ? "border-blue-500 ring-4 ring-blue-500/20 scale-105"
            : ""
        }`}>
          {participant.name.charAt(0)}
        </div>
        
        {/* Speaking animation waves */}
        {participant.volume > 0 && !participant.muted && (
          <div className="flex items-center gap-0.5 h-3 justify-center">
            <span className="w-0.5 bg-blue-400 rounded-full animate-[pulse_0.8s_infinite] h-2" />
            <span className="w-0.5 bg-blue-400 rounded-full animate-[pulse_0.5s_infinite] h-3" />
            <span className="w-0.5 bg-blue-400 rounded-full animate-[pulse_0.7s_infinite] h-1.5" />
            <span className="w-0.5 bg-blue-400 rounded-full animate-[pulse_0.6s_infinite] h-3.5" />
            <span className="w-0.5 bg-blue-400 rounded-full animate-[pulse_0.9s_infinite] h-2" />
          </div>
        )}
      </div>

      {/* Simulated camera recording indicators */}
      <div className="absolute top-12 left-4 text-[7px] text-slate-700 font-mono tracking-widest uppercase">
        Live Feed HD 1080p
      </div>
    </div>
  );
}
