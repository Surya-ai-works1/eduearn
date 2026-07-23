"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User, Sparkles, Loader2, MinusSquare, Save, Volume2, VolumeX, Trash2, Mic, BookOpen, FileText, HelpCircle, Layers, Map, Briefcase, Award, LineChart, Search, Clock } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { AiService, PROMPT_LIBRARY } from "../services/aiService";
import { MarkdownViewer } from "./MarkdownViewer";
import { VoiceOrb } from "./VoiceOrb";
import { useSpeech } from "../hooks/useSpeech";
import { lmsHubsDb } from "../../../lib/lmsHubsDb";
import { useAuth } from "../../../hooks/useAuth";
import { useCourseContext } from "../../../hooks/useCourseContext";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

export function AiChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname() || "";
  const contextStore = useCourseContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 2200);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic context retrieval
  const activeCourseTitle = contextStore.courseTitle;
  const activeCourseDescription = contextStore.courseDescription;
  const activeLessonTitle = contextStore.lessonTitle;
  const activeSubject = contextStore.subject;

  // Listen for global toggle events
  useEffect(() => {
    const handleOpen = (e: Event) => {
      setIsOpen(true);
      setIsMinimized(false);
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail === "object" && "prompt" in customEvent.detail) {
        setInput(customEvent.detail.prompt);
      }
    };
    window.addEventListener("open-sparky-chat", handleOpen as EventListener);
    return () => {
      window.removeEventListener("open-sparky-chat", handleOpen as EventListener);
    };
  }, []);

  // Load chat session from Supabase (with LocalStorage offline fallback)
  useEffect(() => {
    setMounted(true);
    async function loadSession() {
      if (typeof window === "undefined") return;

      if (user) {
        try {
          const sessions = await lmsHubsDb.getChatSessions(user.id);
          // Look for an active Sparky chat session
          const active = sessions.find(s => s.module === "sparky-chat" && s.course_id === (contextStore.courseTitle || null));
          if (active) {
            setSessionId(active.id);
            if (active.messages && active.messages.length > 0) {
              const mapped = active.messages.map((m: any, idx: number) => ({
                id: `msg-db-${idx}-${Date.now()}`,
                role: m.role as "user" | "ai",
                content: m.content
              }));
              setMessages(mapped);
              setHasGreeted(true);
              return;
            }
          } else {
            // Create a new session in database
            const created = await lmsHubsDb.saveChatSession({
              user_id: user.id,
              title: activeCourseTitle ? `Sparky Course Chat: ${activeCourseTitle}` : "Sparky Chat Session",
              module: "sparky-chat",
              messages: [],
              is_pinned: false,
              course_id: contextStore.courseTitle || undefined
            });
            setSessionId(created.id);
          }
        } catch (err) {
          console.warn("Supabase chat session load failed, falling back to LocalStorage:", err);
        }
      }

      // LocalStorage fallback
      const saved = localStorage.getItem("eduearn_sparky_chat_messages");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setHasGreeted(true);
            return;
          }
        } catch { /* parse failure */ }
      }
    }
    loadSession();
  }, [user, contextStore.courseTitle, activeCourseTitle]);



  // Save/Update chat session when messages update
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    localStorage.setItem("eduearn_sparky_chat_messages", JSON.stringify(messages));

    if (user && sessionId) {
      const cleanMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      }));
      lmsHubsDb.updateChatSession(sessionId, { messages: cleanMessages }).catch(() => {});
    }
  }, [messages, sessionId, user, mounted]);

  // ─── SMART GREETINGS & DESCRIPTIONS ────────────────────────────────────────
  const smartGreeting = useMemo(() => {
    if (pathname.includes("/tutor")) {
      return "Hi! 👋 I'm Sparky, your AI teaching assistant. I can draft course outlines, generate quizzes, or write announcement updates!";
    }
    if (pathname.includes("/admin")) {
      return "Hi! 👋 I'm Sparky, your Platform Management assistant. I can help analyze metrics, suggest categories, or assist with CMS updates!";
    }
    if (pathname.includes("/categories")) {
      return "Hi! 👋 I'm Sparky, your Course Advisor. Looking for learning recommendations? I can guide you to top syllabus modules!";
    }
    if (pathname.includes("/student/dashboard")) {
      return "Hi! 👋 I'm Sparky, your EduEarn AI companion. Ready to continue learning today?";
    }
    if (pathname.includes("/student/courses") || pathname.includes("/learn/lecture")) {
      return `Hi! 👋 I'm Sparky, your AI learning companion for **${activeCourseTitle || "this course"}**${
        activeLessonTitle ? ` — currently on *${activeLessonTitle}*` : ""
      }. How can I help you understand today's lesson?`;
    }
    if (pathname.includes("/notes")) {
      return "Hi! 👋 I'm Sparky. I can summarize, improve, or expand your study notes. Let's make learning easier!";
    }
    if (pathname.includes("/career") || pathname.includes("/careers")) {
      return "Hi! 👋 I'm Sparky, your career mentor. Let's practice behavioral mock interviews or optimize your resume details!";
    }
    if (pathname.includes("/ai-hub")) {
      return "Hi! 👋 I'm Sparky, your Study Suite assistant. Choose any AI tool below or ask me any question directly!";
    }
    if (pathname.includes("/community")) {
      return "Hi! 👋 I'm Sparky, your Peer Community helper. I can help you draft polished posts, ask questions, or write replies!";
    }
    return "Hi! 👋 I'm Sparky, your EduEarn AI learning companion. Ask me to explain a concept, help with homework, or generate a quiz!";
  }, [pathname, activeCourseTitle, activeLessonTitle]);

  // Reset to default greeting if empty
  useEffect(() => {
    if (mounted && messages.length === 0) {
      setMessages([
        {
          id: "msg-init",
          role: "ai",
          content: smartGreeting,
        },
      ]);
    }
  }, [messages, smartGreeting, mounted]);

  // ─── IDLE SUGGESTIONS & WELCOME SCREEN CHIPS ───────────────────────────────
  const quickActions = useMemo(() => {
    // Admin specific chips
    if (pathname.includes("/admin")) {
      return [
        { label: "📊 Analytics", prompt: "Explain standard platform metrics (enrollment rates, tutor earnings, coin payouts) and suggest growth insights.", icon: <LineChart size={12} /> },
        { label: "🔍 SEO", prompt: "Give me 5 search engine optimization suggestions for the homepage to rank for 'peer-to-peer tutoring'.", icon: <Search size={12} /> },
        { label: "📂 CMS", prompt: "Suggest category hierarchy improvements and new subject tags for the curriculum catalog.", icon: <Layers size={12} /> },
        { label: "📄 Reports", prompt: "Draft a template outline for weekly moderation activity reports and system audit tasks.", icon: <FileText size={12} /> }
      ];
    }
    // Tutor specific chips
    if (pathname.includes("/tutor")) {
      return [
        { label: "🎓 Course", prompt: "Draft a comprehensive course outline for a syllabus on Introduction to React JS.", icon: <BookOpen size={12} /> },
        { label: "📝 Assignment", prompt: "Create a coding assignment sheet with three practice questions on JavaScript arrays.", icon: <FileText size={12} /> },
        { label: "⏰ Lesson", prompt: "Build a detailed 45-minute lesson plan for a lecture on CSS Flexbox basics.", icon: <Clock size={12} /> },
        { label: "❓ Quiz", prompt: "Generate a 3-question MCQ quiz on advanced Python functions.", icon: <HelpCircle size={12} /> },
        { label: "📢 Announcement", prompt: "Write a professional announcement welcome post for new students enrolling in my course.", icon: <Volume2 size={12} /> }
      ];
    }
    // Categories specific chips
    if (pathname.includes("/categories")) {
      return [
        { label: "📚 Recommendations", prompt: "Recommend the best starting courses or learning modules for Web Development.", icon: <BookOpen size={12} /> },
        { label: "🧭 Roadmap Advice", prompt: "What subjects should I study to master UI/UX designing from scratch?", icon: <Map size={12} /> },
      ];
    }

    const defaultActions = [
      { label: "📚 Explain", prompt: "Explain the core concepts of this topic in simple terms with real-world examples.", icon: <BookOpen size={12} /> },
      { label: "📝 Summarize", prompt: "Create a brief bulleted summary of this topic.", icon: <FileText size={12} /> },
      { label: "❓ Quiz", prompt: "Generate a 3-question MCQ quiz based on this topic to test my knowledge.", icon: <HelpCircle size={12} /> },
      { label: "📝 Notes", prompt: "Create detailed structured study notes with key takeaways for this topic.", icon: <FileText size={12} /> },
      { label: "🎯 Flashcards", prompt: "Create 4 active-recall Q&A flashcards for this topic.", icon: <Layers size={12} /> },
    ];

    if (pathname.includes("/student/courses") || pathname.includes("/learn/lecture")) {
      return [
        { label: "📚 Explain Lesson", prompt: `Explain the active lesson: "${activeLessonTitle || activeCourseTitle || "this lesson"}" in detail.`, icon: <BookOpen size={12} /> },
        { label: "📝 Summarize Lesson", prompt: `Create a brief bulleted summary of active lesson: "${activeLessonTitle || activeCourseTitle || "this lesson"}".`, icon: <FileText size={12} /> },
        { label: "❓ Create Quiz", prompt: `Generate a 3-question MCQ practice quiz based on the lesson "${activeLessonTitle || activeCourseTitle || ""}".`, icon: <HelpCircle size={12} /> },
        { label: "📝 Generate Notes", prompt: `Create detailed structured study notes with key takeaways for active lesson: "${activeLessonTitle || activeCourseTitle || "this lesson"}".`, icon: <FileText size={12} /> },
        { label: "🎯 Flashcards", prompt: `Create 4 active-recall Q&A flashcards for the lesson "${activeLessonTitle || activeCourseTitle || ""}".`, icon: <Layers size={12} /> },
      ];
    }
    if (pathname.includes("/notes")) {
      return [
        { label: "📝 Summarize Notes", prompt: `Summarize the current note: "${contextStore.activeNoteTitle || "My Study Notes"}" in bullet points.`, icon: <FileText size={12} /> },
        { label: "💡 Improve Notes", prompt: "Expand my current study notes with helpful details and key concepts.", icon: <Sparkles size={12} /> },
        { label: "🌍 Translate Notes", prompt: "Translate the core points of my active notes into French / Spanish / Hindi.", icon: <Sparkles size={12} className="text-yellow-300 fill-current animate-pulse" /> },
      ];
    }
    if (pathname.includes("/career") || pathname.includes("/careers")) {
      return [
        { label: "💼 Career Advice", prompt: "Suggest high-paying career pathways for someone with React and photo editing skills.", icon: <Briefcase size={12} /> },
        { label: "📄 Resume Review", prompt: "Review my resume details and write bullet points to stand out for student developer roles.", icon: <FileText size={12} /> },
        { label: "🎙 Mock Interview", prompt: "Simulate a mock behavioral interview for a peer tutor role. Ask me 1 question to start.", icon: <Sparkles size={12} className="text-yellow-300 fill-current animate-pulse" /> },
        { label: "🗺 Study Planner", prompt: "Create a 7-day revision roadmap to prepare for interview screening questions.", icon: <Map size={12} /> },
      ];
    }
    if (pathname.includes("/community")) {
      return [
        { label: "📝 Write a Post", prompt: "Help me write a clear, polite forum post asking for advice on studying React JS vs Next JS.", icon: <FileText size={12} /> },
        { label: "💡 Suggest Topic", prompt: "Give me 3 engaging discussion topic ideas about AI learning or photography.", icon: <Sparkles size={12} /> },
      ];
    }
    return defaultActions;
  }, [pathname, activeCourseTitle, activeLessonTitle, contextStore]);

  // Course context string injected automatically in AI prompt
  const courseContext = useMemo(() => {
    return [
      activeCourseTitle ? `Course: ${activeCourseTitle}` : "",
      activeCourseDescription ? `Description: ${activeCourseDescription}` : "",
      activeLessonTitle ? `Current lesson: ${activeLessonTitle}` : "",
      activeSubject ? `Subject: ${activeSubject}` : "",
      contextStore.currentPage ? `Page Context: ${contextStore.currentPage}` : "",
      contextStore.learningContext ? `Learning Context: ${contextStore.learningContext}` : "",
      contextStore.activeNoteTitle ? `Notes Context - Title: ${contextStore.activeNoteTitle}` : "",
      contextStore.activeNoteContent ? `Notes Context - Content: ${contextStore.activeNoteContent}` : "",
      contextStore.activeQuizTitle ? `Quiz Context: ${contextStore.activeQuizTitle}` : "",
      contextStore.activeAssignmentTitle ? `Assignment Context: ${contextStore.activeAssignmentTitle}` : "",
      contextStore.tutor ? `Tutor Context: ${contextStore.tutor}` : "",
      contextStore.roadmap ? `Roadmap Context: ${contextStore.roadmap}` : "",
      contextStore.difficulty ? `Difficulty Context: ${contextStore.difficulty}` : "",
      contextStore.userLevel ? `User Level Context: ${contextStore.userLevel}` : "",
    ].filter(Boolean).join("\n");
  }, [activeCourseTitle, activeCourseDescription, activeLessonTitle, activeSubject, contextStore]);

  // Ref to hold the speech object — needed because handleSend references speech before its hook declaration
  const speechRef = React.useRef<ReturnType<typeof useSpeech> | null>(null);

  const handleSend = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || isStreaming) return;

    const userMsgId = `msg-user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: textToSend }]);
    setInput("");
    setIsStreaming(true);

    const aiMsgId = `msg-ai-${Date.now()}`;
    setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: "" }]);

    let fullResponse = "";

    await AiService.streamChatCompletion(
      PROMPT_LIBRARY.STUDY_ASSISTANT_V1,
      textToSend,
      (chunk) => {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((m) => m.id === aiMsgId ? { ...m, content: m.content + chunk } : m)
        );
      },
      () => {
        setIsStreaming(false);
        // Automatically speak responses aloud if Voice Mode or text-to-speech output is enabled
        if (voiceOutputEnabled || showVoice) {
          speechRef.current?.speak(fullResponse);
        }

        // Persistent database session logging in background
        if (user) {
          lmsHubsDb.saveAiLog(user.id, "sparky-assistant", textToSend, fullResponse).catch(() => {});
        }
      },
      { module: "study", courseContext: courseContext || undefined }
    );
  }, [isStreaming, voiceOutputEnabled, showVoice, courseContext, user]);

  // Speech recognition helper hook
  const speech = useSpeech({
    onTranscript: (text) => {
      if (text.trim()) {
        setInput(text);
        // Hands-free: auto send the transcribed speech text!
        handleSend(text);
      }
    },
    onError: (msg) => toast.error(msg),
  });
  // Keep ref in sync with latest speech object (must be in effect, not render phase)
  React.useEffect(() => { speechRef.current = speech; });

  // Handle open assistant
  const handleOpen = () => {
    setIsOpen(true);
    if (!hasGreeted) {
      setHasGreeted(true);
      // Wait for UI slide-in, then speak greeting via TTS
      setTimeout(() => {
        speech.speak("Hi! I'm Sparky, your AI learning companion. How can I help you today?");
      }, 600);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming, isOpen, isMinimized]);

  const handleSaveNote = async (content: string) => {
    if (!user) { toast.error("Please login to save notes"); return; }
    try {
      await lmsHubsDb.saveNote(
        user.id,
        `Sparky Notes: ${activeCourseTitle ?? "Study Session"}`,
        content,
        "study"
      );
      toast.success("Saved to Notes Library!");
    } catch {
      toast.error("Failed to save note. Run Supabase migrations.");
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("eduearn_sparky_chat_messages");
    if (user && sessionId) {
      lmsHubsDb.deleteChatSession(sessionId).catch(() => {});
      setSessionId(null);
    }
    setHasGreeted(false);
    toast.success("Sparky chat history cleared!");
  };

  // Determine active voice state text
  const voiceStateText = useMemo(() => {
    if (speech.isListening) return "🎤 Sparky is listening...";
    if (isStreaming) return "✨ Sparky is thinking...";
    if (speech.isSpeaking) return "🔊 Sparky is speaking...";
    return "Voice Mode Active";
  }, [speech.isListening, isStreaming, speech.isSpeaking]);

  // Check if we are showing the welcome dashboard screen (only greeting is present)
  const showWelcomeDashboard = useMemo(() => {
    return messages.length <= 1;
  }, [messages]);

  if (!mounted) return null;

  // React Portal overlay mounting directly under document.body
  return createPortal(
    <>
      {/* Premium Floating Pill Trigger Button */}
      {!isOpen && (
        <motion.button
          onClick={handleOpen}
          initial={{ scale: 0, opacity: 0 }}
          animate={shouldPulse ? { 
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 10px 25px -5px rgba(124, 58, 237, 0.45), 0 0 0px 0px rgba(139, 92, 246, 0)",
              "0 10px 25px -5px rgba(124, 58, 237, 0.45), 0 0 16px 5px rgba(139, 92, 246, 0.35)",
              "0 10px 25px -5px rgba(124, 58, 237, 0.45), 0 0 0px 0px rgba(139, 92, 246, 0)"
            ]
          } : { scale: 1 }}
          transition={shouldPulse ? {
            duration: 2.2,
            ease: "easeInOut"
          } : { type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[99999] px-4 py-3 rounded-full text-white flex items-center gap-2 cursor-pointer border border-violet-400/20 group backdrop-blur-md font-heading font-black select-none"
          style={{
            background: "linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(124, 58, 237, 0.95))",
          }}
          aria-label="Open ✨ Sparky AI"
        >
          <Sparkles size={15} className="text-yellow-300 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
          <span className="text-[11px] font-black tracking-widest uppercase">✨ Ask Sparky</span>
        </motion.button>
      )}

      {/* Main Sparky AI Floating Panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[99999] max-w-[calc(100vw-2rem)] w-[370px] rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md flex flex-col overflow-hidden transition-all duration-300 shadow-2xl"
          style={{
            maxHeight: isMinimized ? "52px" : "550px",
            height: isMinimized ? "52px" : "550px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-indigo-500/10 via-primary/10 to-violet-600/10 border-b border-border/60 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                <Sparkles size={15} className="text-white animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black text-foreground tracking-wide leading-none flex items-center gap-1">
                  ✨ Sparky AI
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5 font-semibold truncate max-w-[160px]">
                  {activeCourseTitle ? `Course: ${activeCourseTitle}` : "✨ Sparky AI Study Companion"}
                </p>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-white/90 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={() => {
                  setVoiceOutputEnabled(!voiceOutputEnabled);
                  if (speech.isSpeaking) speech.stopSpeaking();
                }}
                className={`p-1.5 rounded-lg transition cursor-pointer ${voiceOutputEnabled ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                title={voiceOutputEnabled ? "Mute responses" : "Read responses aloud"}
              >
                {voiceOutputEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
              <button
                onClick={() => {
                  setShowVoice(!showVoice);
                  if (speech.isListening) speech.stopListening();
                }}
                className={`p-1.5 rounded-lg transition cursor-pointer ${showVoice ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                title="Voice input"
              >
                🎤
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <MinusSquare size={13} />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  speech.stopSpeaking();
                  speech.stopListening();
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Voice input waveform panel */}
              <AnimatePresence>
                {showVoice && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col items-center justify-center py-4 border-b border-border/30 bg-muted/20 gap-2 shrink-0 select-none"
                  >
                    <VoiceOrb
                      isListening={speech.isListening}
                      isSpeaking={speech.isSpeaking}
                      onToggle={speech.toggleListening}
                      size="sm"
                    />
                    <span className="text-[9px] text-primary/95 font-bold tracking-wider uppercase animate-pulse">
                      {voiceStateText}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages feed */}
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                {showWelcomeDashboard ? (
                  // GORGEOUS WELCOME DASHBOARD
                  <div className="flex flex-col items-center py-6 text-center select-none space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-md animate-pulse" />
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center relative border border-white/10 shadow-lg">
                        <Sparkles size={20} className="text-yellow-300" />
                      </div>
                    </div>
                    
                    <div className="space-y-1 max-w-[280px]">
                      <h4 className="text-sm font-heading font-black text-foreground tracking-tight">
                        ✨ Hi, I&apos;m Sparky AI 👋
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        I&apos;m your AI learning companion across EduEarn. Select a quick action below to start learning faster!
                      </p>
                    </div>

                    {/* Quick suggestion cards */}
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[300px] mt-2">
                      {quickActions.map((act) => (
                        <button
                          key={act.label}
                          onClick={() => handleSend(act.prompt)}
                          disabled={isStreaming}
                          className="flex flex-col items-start p-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted text-left transition hover:shadow-soft active:scale-[0.98] group cursor-pointer"
                        >
                          <div className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                            {act.icon}
                          </div>
                          <span className="text-[10px] font-bold text-foreground mt-2 leading-tight">
                            {act.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // STANDARD CHAT MESSAGES
                  messages.map((msg, msgIdx) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        msg.role === "ai"
                          ? "bg-gradient-to-br from-indigo-500 to-violet-600"
                          : "bg-muted border border-border"
                      }`}>
                        {msg.role === "ai"
                          ? <Sparkles size={11} className="text-yellow-300 fill-current animate-pulse" />
                          : <User size={11} className="text-muted-foreground" />
                        }
                      </div>
                      <div className={`max-w-[84%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                        <div className={`rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed shadow-soft ${
                          msg.role === "user"
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-muted border border-border/50 text-foreground rounded-tl-sm"
                        }`}>
                          {msg.role === "ai" && msg.content ? (
                            <MarkdownViewer content={msg.content} className="text-[11px]" />
                          ) : msg.role === "ai" && !msg.content ? (
                            <div className="flex items-center gap-1.5 text-muted-foreground py-0.5 select-none">
                              <Loader2 size={11} className="animate-spin text-primary" />
                              <span className="font-semibold tracking-wider text-[9px] uppercase animate-pulse">✨ Sparky is thinking...</span>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        {msg.role === "ai" && msg.content && (
                          <div className="flex gap-2.5 ml-1">
                            <button
                              onClick={() => handleSaveNote(msg.content)}
                              className="text-[9px] text-muted-foreground hover:text-primary transition flex items-center gap-1 cursor-pointer font-semibold"
                            >
                              <Save size={9} /> Save to Notes
                            </button>
                            {msg.content.includes("temporarily unavailable") && (
                              <button
                                onClick={() => {
                                  const userMsg = msgIdx > 0 ? messages[msgIdx - 1]?.content : "";
                                  if (userMsg) handleSend(userMsg);
                                }}
                                className="text-[9px] text-rose-400 hover:text-rose-500 transition flex items-center gap-1 cursor-pointer font-semibold"
                              >
                                🔄 Retry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dynamic scrollable quick suggestions bar if message list is populated */}
              {!showWelcomeDashboard && (
                <div className="px-3 py-1.5 border-t border-border/30 bg-muted/10 shrink-0 overflow-x-auto flex gap-1.5 scrollbar-thin select-none">
                  {quickActions.map((act) => (
                    <button
                      key={act.label}
                      onClick={() => handleSend(act.prompt)}
                      disabled={isStreaming}
                      className="shrink-0 px-2.5 py-1 text-[9px] font-bold border border-border rounded-full bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input form */}
              <div className="p-3 border-t border-border/50 bg-muted/20 shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={activeCourseTitle ? `Ask Sparky about ${activeCourseTitle}...` : "Ask Sparky anything..."}
                    disabled={isStreaming}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="submit"
                    disabled={isStreaming || !input.trim()}
                    className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-40 transition hover:bg-primary/90 cursor-pointer">
                    {isStreaming ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
    , document.body);
}

export default AiChatWidget;
