"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { VideoService, PeerParticipant } from "../services/videoService";

export interface ChatMessage {
  id: string;
  author: string;
  role: "tutor" | "learner";
  text: string;
  time: string;
  pinned?: boolean;
  isAnnouncement?: boolean;
}

export interface ClassroomSession {
  id: string;
  title: string;
  tutorName: string;
  isTutor: boolean;
  userName: string;
}

interface ClassroomContextType {
  session: ClassroomSession | null;
  participants: PeerParticipant[];
  chatMessages: ChatMessage[];
  activeWhiteboard: boolean;
  recordingState: "idle" | "recording" | "paused";
  sidebarOpen: boolean;
  sidebarTab: "chat" | "participants";
  localStream: MediaStream | null;
  isScreenSharing: boolean;
  
  toggleMic: () => void;
  toggleCam: () => void;
  toggleScreenShare: () => void;
  toggleRaisedHand: () => void;
  toggleWhiteboard: () => void;
  toggleSidebar: (tab?: "chat" | "participants") => void;
  setSidebarTab: (tab: "chat" | "participants") => void;
  startRecording: () => void;
  pauseRecording: () => void;
  stopRecording: () => void;
  sendChatMessage: (text: string) => void;
  sendAnnouncement: (text: string) => void;
  leaveClassroom: () => void;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "msg-1", author: "Ananya Iyer (Tutor)", role: "tutor", text: "Welcome everyone! Let's get started with today's session.", time: "10:00 AM", pinned: true, isAnnouncement: true },
  { id: "msg-2", author: "Rohan Gupta", role: "learner", text: "Excited for this session! 🎉", time: "10:01 AM" },
  { id: "msg-3", author: "Sneha Sen", role: "learner", text: "Can we cover custom hooks today?", time: "10:02 AM" },
];

export const ClassroomProvider: React.FC<{
  sessionInit: ClassroomSession;
  children: React.ReactNode;
}> = ({ sessionInit, children }) => {
  const [session] = useState<ClassroomSession>(sessionInit);
  const [participants, setParticipants] = useState<PeerParticipant[]>(() =>
    VideoService.getMockPeers(sessionInit.isTutor, sessionInit.userName)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeWhiteboard, setActiveWhiteboard] = useState(false);
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused">("idle");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"chat" | "participants">("chat");
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  // Initialize participants and local stream
  useEffect(() => {
    // Initialize local camera stream
    const initLocalCamera = async () => {
      const stream = await VideoService.getLocalVideoStream();
      if (stream) {
        setLocalStream(stream);
        streamRef.current = stream;
        // Ensure local user participant is updated with cameraOn: true
        setParticipants((prev) =>
          prev.map((p) => (p.isLocal ? { ...p, cameraOn: true } : p))
        );
      } else {
        // Fallback: camera is off
        setParticipants((prev) =>
          prev.map((p) => (p.isLocal ? { ...p, cameraOn: false } : p))
        );
      }
    };

    initLocalCamera();

    return () => {
      if (streamRef.current) {
        VideoService.stopStream(streamRef.current);
      }
    };
  }, [sessionInit]);

  // Toggle local mic
  const toggleMic = () => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.isLocal) {
          const nextMuted = !p.muted;
          if (localStream) {
            localStream.getAudioTracks().forEach((track) => {
              track.enabled = !nextMuted;
            });
          }
          toast.success(nextMuted ? "Microphone muted" : "Microphone active");
          return { ...p, muted: nextMuted };
        }
        return p;
      })
    );
  };

  // Toggle local camera
  const toggleCam = () => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.isLocal) {
          const nextCamOn = !p.cameraOn;
          if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
              track.enabled = nextCamOn;
            });
          }
          toast.success(nextCamOn ? "Camera enabled" : "Camera disabled");
          return { ...p, cameraOn: nextCamOn };
        }
        return p;
      })
    );
  };

  // Toggle local screen share
  const toggleScreenShare = () => {
    setIsScreenSharing((prev) => {
      const nextState = !prev;
      toast.success(nextState ? "Screen sharing started" : "Screen sharing stopped");
      
      // Update local participant screen state representation if needed
      setParticipants((prevParticipants) =>
        prevParticipants.map((p) => {
          if (p.isLocal) {
            return { ...p, name: nextState ? `${sessionInit.userName} (Screen Share)` : `${sessionInit.userName} (You)` };
          }
          return p;
        })
      );
      
      return nextState;
    });
  };

  // Toggle raised hand
  const toggleRaisedHand = () => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.isLocal) {
          const nextRaised = !p.raisedHand;
          toast.info(nextRaised ? "Hand raised" : "Hand lowered");
          return { ...p, raisedHand: nextRaised };
        }
        return p;
      })
    );
  };

  // Toggle whiteboard
  const toggleWhiteboard = () => {
    setActiveWhiteboard((prev) => {
      const nextState = !prev;
      toast.success(nextState ? "Whiteboard mode enabled" : "Whiteboard mode disabled");
      return nextState;
    });
  };

  // Toggle sidebar
  const toggleSidebar = (tab?: "chat" | "participants") => {
    if (tab) {
      if (sidebarOpen && sidebarTab === tab) {
        setSidebarOpen(false);
      } else {
        setSidebarTab(tab);
        setSidebarOpen(true);
      }
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  // Start recording
  const startRecording = () => {
    setRecordingState("recording");
    toast.success("Class recording started.");
  };

  // Pause recording
  const pauseRecording = () => {
    setRecordingState("paused");
    toast.info("Class recording paused.");
  };

  // Stop recording
  const stopRecording = () => {
    setRecordingState("idle");
    toast.success("Class recording saved successfully.");
  };

  // Send normal message
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      author: `${session.userName} (You)`,
      role: session.isTutor ? "tutor" : "learner",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Send announcement (tutors only)
  const sendAnnouncement = (text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `ann-${Date.now()}`,
      author: `${session.userName} (Tutor)`,
      role: "tutor",
      text: `📢 ${text.trim()}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isAnnouncement: true,
      pinned: true,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    toast.success("Announcement pinned to top.");
  };

  // Leave classroom
  const leaveClassroom = () => {
    if (localStream) {
      VideoService.stopStream(localStream);
    }
    toast.info("Leaving classroom...");
    // The component wrapper will handle redirecting the user
  };

  return (
    <ClassroomContext.Provider
      value={{
        session,
        participants,
        chatMessages,
        activeWhiteboard,
        recordingState,
        sidebarOpen,
        sidebarTab,
        localStream,
        isScreenSharing,
        toggleMic,
        toggleCam,
        toggleScreenShare,
        toggleRaisedHand,
        toggleWhiteboard,
        toggleSidebar,
        setSidebarTab,
        startRecording,
        pauseRecording,
        stopRecording,
        sendChatMessage,
        sendAnnouncement,
        leaveClassroom,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error("useClassroom must be used within a ClassroomProvider");
  }
  return context;
};
