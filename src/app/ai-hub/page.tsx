"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { lmsHubsDb, AiHistoryLog } from "../../lib/lmsHubsDb";
import { AiService } from "../../features/ai/services/aiService";
import { MarkdownViewer } from "../../features/ai/components/MarkdownViewer";
import { toast } from "sonner";
import {
  FaMagic,
  FaCalendarAlt,
  FaFileAlt,
  FaPenSquare,
  FaGraduationCap,
  FaCode,
  FaGlobe,
  FaUserTie,
  FaHistory,
  FaStar,
  FaServer,
  FaShieldAlt
} from "react-icons/fa";

export default function AiHubDashboard() {
  const { user } = useAuth();

  // Active Role and Tool ID
  const [activeRole, setActiveRole] = useState<"student" | "tutor" | "admin">("student");
  const [activeTool, setActiveTool] = useState("tutor"); // defaults to tutor Q&A

  // AI Prompts / Responses States
  const [promptInput, setPromptInput] = useState("");
  const [promptContext, setPromptContext] = useState(""); // extra context like code snippet or commitment details
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState<AiHistoryLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Tool listings per role
  const studentTools = useMemo(() => [
    { id: "tutor", name: "✨ Ask Sparky", desc: "Ask questions on coding, academic subjects, or doubt solving.", icon: FaMagic },
    { id: "planner", name: "✨ Syllabus Planner", desc: "Generate custom 3-day study roadmaps for any topic.", icon: FaCalendarAlt },
    { id: "notes", name: "✨ Notes Summarizer", desc: "Convert text outlines into detailed summary bullet points.", icon: FaFileAlt },
    { id: "quiz", name: "✨ Quiz Generator", desc: "Generate practice multiple choice questions.", icon: FaPenSquare },
    { id: "coder", name: "✨ Code Debugger", desc: "Paste coding scripts to find syntax errors and logic bugs.", icon: FaCode },
    { id: "translator", name: "✨ Language Translator", desc: "Translate text across multiple regional languages.", icon: FaGlobe },
    { id: "coach", name: "✨ Interview Coach", desc: "Simulate tech job screening questions and answers.", icon: FaUserTie }
  ], []);

  const tutorTools = useMemo(() => [
    { id: "content-gen", name: "✨ Course Content Gen", desc: "Generate SEO-friendly descriptions and outlines.", icon: FaGraduationCap },
    { id: "quiz-creator", name: "✨ Course Quiz Creator", desc: "Compile structured MCQs based on course lecture transcripts.", icon: FaPenSquare },
    { id: "lesson-plan", name: "✨ Lesson Planner", desc: "Build comprehensive step-by-step instruction guides.", icon: FaCalendarAlt },
    { id: "feedback-gen", name: "✨ Student Feedback Gen", desc: "Draft encouraging, helpful reviews for students.", icon: FaMagic },
    { id: "assignment-gen", name: "✨ Assignment Creator", desc: "Suggest homework projects, instructions, and tests.", icon: FaFileAlt }
  ], []);

  const adminTools = useMemo(() => [
    { id: "analytics-summary", name: "✨ Analytics Insight Summary", desc: "Compile running growth, DAU/WAU, and drop-off summaries.", icon: FaFileAlt },
    { id: "moderation-check", name: "✨ Safety Content Moderator", desc: "Filter bad language, profanity, and toxicity.", icon: FaShieldAlt },
    { id: "system-health", name: "✨ Telemetry Health Checker", desc: "Verify active LLM connectors and prompt cache health status.", icon: FaServer }
  ], []);

  const toolsList = useMemo(() => {
    if (activeRole === "tutor") return tutorTools;
    if (activeRole === "admin") return adminTools;
    return studentTools;
  }, [activeRole, studentTools, tutorTools, adminTools]);

  // Adjust active tool automatically when role shifts
  useEffect(() => {
    setActiveTool(toolsList[0]?.id || "tutor");
    setPromptInput("");
    setPromptContext("");
    setAiResponse("");
  }, [activeRole, toolsList]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingHistory(true);
      const data = await lmsHubsDb.getAiHistory(user.id);
      setHistoryList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTool === "history") {
      fetchHistory();
    }
  }, [activeTool, fetchHistory]);

  const handleAiCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to use AI features");
      return;
    }
    if (!promptInput.trim()) return;

    setLoadingAi(true);
    setAiResponse("");

    try {
      // Build prompt query parameters based on role and active tool
      let fullPrompt = promptInput;
      let aiModule = activeTool;

      if (activeTool === "planner") {
        fullPrompt = `Create a detailed study plan for: ${promptInput}. Daily commitment: ${promptContext || "45 mins/day"}`;
        aiModule = "roadmap";
      } else if (activeTool === "notes") {
        aiModule = "notes";
      } else if (activeTool === "quiz" || activeTool === "quiz-creator") {
        fullPrompt = `Generate a 3-question MCQ quiz for: ${promptInput}. Extra instructions: ${promptContext || "None"}`;
        aiModule = "quiz";
      } else if (activeTool === "coder") {
        fullPrompt = promptContext
          ? `Debug and fix this code:\n\`\`\`\n${promptContext}\n\`\`\`\nQuestion: ${promptInput}`
          : `Explain and fix: ${promptInput}`;
        aiModule = "programming";
      } else if (activeTool === "translator") {
        fullPrompt = `Translate to ${promptContext || "Hindi"}: "${promptInput}"\nAlso give pronunciation guide and usage examples.`;
        aiModule = "translator";
      } else if (activeTool === "coach") {
        fullPrompt = `Simulate a mock interview for this role/topic: ${promptInput}`;
        aiModule = "interview";
      } else if (activeTool === "content-gen") {
        fullPrompt = `Suggest descriptions, prerequisites, and outline modules for: ${promptInput}`;
        aiModule = "tutor-assessment";
      } else if (activeTool === "lesson-plan") {
        fullPrompt = `Draft a detailed study step lecture guide for: ${promptInput}. Lesson context: ${promptContext || "General"}`;
        aiModule = "study-plan";
      } else if (activeTool === "feedback-gen") {
        fullPrompt = `Write encouraging and constructive feedback for: ${promptInput}. Student score context: ${promptContext || "80/100"}`;
        aiModule = "doubt";
      } else if (activeTool === "assignment-gen") {
        fullPrompt = `Design a coding assignment about: ${promptInput}. Complexity: ${promptContext || "Intermediate"}`;
        aiModule = "study";
      } else if (activeTool === "analytics-summary") {
        fullPrompt = `Summarize platform growth analytics: ${promptInput}`;
        aiModule = "doubt";
      } else if (activeTool === "moderation-check") {
        fullPrompt = `Scan the following text for toxic content, jailbreaks, or inappropriate language: "${promptInput}"`;
        aiModule = "moderation";
      } else if (activeTool === "system-health") {
        fullPrompt = `Check health for service: ${promptInput}`;
        aiModule = "doubt";
      }

      setLoadingAi(false); // Disable spin loader to start streaming immediately
      setIsStreaming(true);

      let streamedText = "";
      await AiService.streamChatCompletion(
        "",
        fullPrompt,
        (chunk) => {
          streamedText += chunk;
          setAiResponse(streamedText);
        },
        async () => {
          setIsStreaming(false);
          try {
            // Save completion log to history
            await lmsHubsDb.saveAiLog(user.id, activeTool, promptInput, streamedText);
            toast.success("Response streaming complete!");
          } catch (logErr) {
            console.error("Could not write AI logs:", logErr);
          }
        },
        { module: aiModule }
      );

    } catch (err: any) {
      console.error(err);
      toast.error("AI request failed. Check API key configuration.");
      setLoadingAi(false);
      setIsStreaming(false);
    }
  };

  const handleToggleFavorite = async (logId: string) => {
    try {
      const nextVal = await lmsHubsDb.toggleFavorite(logId);
      setHistoryList(
        historyList.map((h) => (h.id === logId ? { ...h, is_favorite: nextVal } : h))
      );
      toast.success(nextVal ? "Added to favorites!" : "Removed from favorites");
    } catch (e) {
      toast.error("Failed to update favorite");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex justify-center">
      <div className="max-w-6xl w-full space-y-8">
        
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <FaMagic className="text-yellow-500" /> Sparky AI Hub
            </h1>
            <p className="text-xs text-muted-foreground font-light">
              Access customized study buddies, roadmap planners, MCQ testing, and administration monitors.
            </p>
          </div>
          <button
            onClick={() => setActiveTool(activeTool === "history" ? "tutor" : "history")}
            className="px-4 py-2 bg-card border border-border hover:bg-muted/60 text-foreground text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <FaHistory /> {activeTool === "history" ? "Back to AI Tools" : "View Chat History"}
          </button>
        </div>

        {/* Role Select Bar (if not viewing history) */}
        {activeTool !== "history" && (
          <div className="flex bg-muted/40 p-1 border border-border rounded-xl max-w-sm">
            {(["student", "tutor", "admin"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`flex-1 text-center py-2 text-xs font-bold capitalize rounded-lg transition ${
                  activeRole === role
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        {activeTool === "history" ? (
          /* HISTORY PANEL */
          <div className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">AI Study History</h3>
            
            {loadingHistory ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : historyList.length === 0 ? (
              <div className="bg-card border border-border shadow-md rounded-2xl p-10 text-center space-y-3 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1 animate-pulse">📝</div>
                <p className="text-foreground text-xs font-bold">No logs saved yet</p>
                <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-light">Generate responses to populate logs.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {historyList.map((log) => (
                  <div key={log.id} className="bg-muted/50 p-4 border border-border rounded-xl space-y-3 text-left">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-blue-400 uppercase">{log.tool_type} tool</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground/80">{new Date(log.created_at).toLocaleString()}</span>
                        <button onClick={() => handleToggleFavorite(log.id)} className={`text-xs ${log.is_favorite ? 'text-yellow-500' : 'text-muted-foreground/80 hover:text-yellow-500'}`}>
                          <FaStar />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground font-bold">Prompt:</p>
                      <p className="text-xs text-foreground font-light">{log.prompt}</p>
                    </div>
                    <div className="space-y-1 border-t border-border/60 pt-2">
                      <p className="text-[11px] text-muted-foreground font-bold">Response:</p>
                      <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">{log.response}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* DUAL-COLUMN WORKSPACE: LEFT TOOLS SELECTION, RIGHT ACTIVE WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Sidebar Tools */}
            <div className="lg:sticky lg:top-32 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl p-5 space-y-3 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto scrollbar-none">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 pb-2 border-b border-border">AI Study Suite</h3>
              
              <div className="flex flex-col gap-1.5">
                {toolsList.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTool(t.id);
                        setPromptInput("");
                        setPromptContext("");
                        setAiResponse("");
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 group ${
                        activeTool === t.id
                          ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                          : "bg-muted/40 border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Icon className="text-lg mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold group-hover:text-blue-400 transition">{t.name}</p>
                        <p className="text-[9px] text-muted-foreground/80 mt-0.5 leading-normal font-light">{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Active Workspace Panel */}
            <div className="lg:col-span-2 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl p-6 space-y-6 text-left">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {toolsList.find(t => t.id === activeTool)?.name} Workspace
              </h3>

              {/* Form Input prompt */}
              <form onSubmit={handleAiCall} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase">
                    {activeTool === "planner" ? "Syllabus / Topic *" : activeTool === "notes" ? "Lecture topic *" : "Query Details *"}
                  </label>
                  <textarea
                    placeholder={
                      activeTool === "planner"
                        ? "e.g. Docker and Kubernetes containers"
                        : activeTool === "coder"
                        ? "e.g. Why is this API call throwing JSON error?"
                        : "Ask Sparky anything..."
                    }
                    className="w-full h-16 bg-background border border-border rounded-lg text-foreground text-xs p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    required
                  />
                </div>

                {/* Extra Context fields */}
                {(activeTool === "planner" || activeTool === "coder" || activeTool === "translator" || activeTool === "quiz" || activeTool === "quiz-creator" || activeTool === "lesson-plan" || activeTool === "feedback-gen" || activeTool === "assignment-gen") && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">
                      {activeTool === "planner"
                        ? "Commitment rate (e.g. 1 hour/day)"
                        : activeTool === "coder"
                        ? "Code block context (Optional)"
                        : activeTool === "translator"
                        ? "Target language (e.g. Hindi, French)"
                        : activeTool === "lesson-plan"
                        ? "Lesson constraints context"
                        : activeTool === "feedback-gen"
                        ? "Student score (e.g. 85/100)"
                        : activeTool === "assignment-gen"
                        ? "Complexity (e.g. Intermediate)"
                        : "Extra context"}
                    </label>
                    <textarea
                      placeholder={activeTool === "coder" ? "// Paste code block here..." : "e.g. Hindi"}
                      className="w-full h-20 bg-background border border-border rounded-lg text-foreground text-xs p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono resize-none"
                      value={promptContext}
                      onChange={(e) => setPromptContext(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingAi || isStreaming}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-blue-500/10 cursor-pointer">
                  {loadingAi || isStreaming ? "✨ Sparky is thinking..." : "Generate response with Sparky"}
                </button>
              </form>

              {/* Loader */}
              {loadingAi && (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="text-xs text-muted-foreground/80">✨ Sparky is thinking...</span>
                </div>
              )}

              {/* Prompt Output Response Display */}
              {aiResponse && (
                <div className="bg-muted/50 p-5 border border-border rounded-xl space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-[10px] text-muted-foreground/80 font-bold uppercase">✨ Sparky Response Output</p>
                  <MarkdownViewer content={aiResponse} className="text-xs" />
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
