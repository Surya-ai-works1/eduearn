"use client";

import React, { useState } from "react";
import { MessageSquare, Users, BarChart2, X, Plus, Sparkles, Brain, BookOpen } from "lucide-react";
import { useClassroom } from "../context/ClassroomContext";
import { ChatPanel } from "./ChatPanel";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { Button } from "../../../components/ui/button";
import { AiService } from "../../../features/ai/services/aiService";

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  isActive: boolean;
}

export function ClassroomSidebar() {
  const { sidebarOpen, sidebarTab, setSidebarTab, toggleSidebar } = useClassroom();
  
  // Local state for tabs so we can support "polls" and "ai" without breaking typescript context signatures
  const [localTab, setLocalTab] = useState<"chat" | "participants" | "polls" | "ai">("chat");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiType, setAiType] = useState<"notes" | "summary" | null>(null);

  const handleGenerateAi = async (type: "notes" | "summary") => {
    setAiLoading(true);
    setAiType(type);
    setAiOutput("");

    // Simulated classroom transcript payload
    const simulatedTranscript = `
      [Tutor]: Welcome back everyone! Today we are discussing Next.js routing.
      [Learner Rahul]: Sir, is App Router layout nested by default?
      [Tutor]: Yes, Rahul! Nested folders represent nested segments, and layout.js wraps page.js automatically.
      [Learner Priya]: Awesome! What about loading states?
      [Tutor]: You can create loading.js in the segment folder which uses React Suspense internally.
    `;

    const prompt = type === "notes"
      ? `Generate clean, bulleted learning notes from this classroom transcript:\n${simulatedTranscript}`
      : `Generate a concise, 1-paragraph summary and action points from this classroom transcript:\n${simulatedTranscript}`;

    try {
      const response = await AiService.chat(prompt, { module: "study" });
      setAiOutput(response);
    } catch (err) {
      console.error(err);
      setAiOutput("⚠️ Failed to generate AI insights. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Keep local tab in sync with context updates
  React.useEffect(() => {
    if (sidebarTab === "chat" || sidebarTab === "participants") {
      setLocalTab(sidebarTab);
    }
  }, [sidebarTab]);

  // Polls state
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "poll-1",
      question: "Which CSS grid strategy is preferred for standard galleries?",
      options: ["CSS grid-template-columns", "Flexbox wraps with widths", "Inline blocks"],
      votes: [12, 4, 1],
      isActive: true,
    }
  ]);

  const [newQuestion, setNewQuestion] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

  const handleVote = (pollId: string, optionIdx: number) => {
    setPolls(prev => prev.map(p => {
      if (p.id === pollId && p.isActive) {
        const nextVotes = [...p.votes];
        nextVotes[optionIdx] += 1;
        return { ...p, votes: nextVotes };
      }
      return p;
    }));
  };

  const handleCreatePoll = () => {
    if (!newQuestion.trim() || !opt1.trim() || !opt2.trim()) return;
    const nextPoll: Poll = {
      id: `poll-${Date.now()}`,
      question: newQuestion,
      options: [opt1, opt2],
      votes: [0, 0],
      isActive: true
    };
    setPolls(prev => [nextPoll, ...prev]);
    setNewQuestion("");
    setOpt1("");
    setOpt2("");
    setIsCreatingPoll(false);
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="w-80 h-full bg-slate-900 border-l border-border flex flex-col shrink-0 text-white select-none">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-850 px-2 shrink-0 h-14 bg-slate-950/20">
        <div className="flex items-center gap-1.5 p-1 flex-1">
          {/* Chat Tab Button */}
          <button
            onClick={() => {
              setLocalTab("chat");
              setSidebarTab("chat");
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-semibold transition-all focus:outline-none ${
              localTab === "chat"
                ? "bg-slate-800 text-white border border-slate-700/60 shadow-inner font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-850/40"
            }`}
          >
            <MessageSquare size={12} />
            Chat
          </button>
          
          {/* Participants Tab Button */}
          <button
            onClick={() => {
              setLocalTab("participants");
              setSidebarTab("participants");
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-semibold transition-all focus:outline-none ${
              localTab === "participants"
                ? "bg-slate-800 text-white border border-slate-700/60 shadow-inner font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-850/40"
            }`}
          >
            <Users size={12} />
            Peers
          </button>

          {/* Polls Tab Button */}
          <button
            onClick={() => setLocalTab("polls")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-semibold transition-all focus:outline-none ${
              localTab === "polls"
                ? "bg-slate-800 text-white border border-slate-700/60 shadow-inner font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-850/40"
            }`}
          >
            <BarChart2 size={12} />
            Polls
          </button>

          {/* AI Tab Button */}
          <button
            onClick={() => setLocalTab("ai")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-semibold transition-all focus:outline-none ${
              localTab === "ai"
                ? "bg-slate-800 text-white border border-slate-700/60 shadow-inner font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-850/40"
            }`}
          >
            <Sparkles size={12} className="text-primary animate-pulse" />
            AI Notes
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={() => toggleSidebar()}
          className="p-2 text-muted-foreground hover:text-white rounded hover:bg-slate-850/50 transition-colors focus:outline-none ml-1 mr-2"
          title="Close Sidebar"
        >
          <X size={15} />
        </button>
      </div>

      {/* Content panel */}
      <div className="flex-1 flex flex-col overflow-hidden text-left">
        {localTab === "chat" && <ChatPanel />}
        {localTab === "participants" && <ParticipantsPanel />}
        {localTab === "polls" && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Classroom Polls</span>
              {!isCreatingPoll && (
                <button
                  onClick={() => setIsCreatingPoll(true)}
                  className="text-[10px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded flex items-center gap-0.5 hover:bg-primary/30 transition-colors"
                >
                  <Plus size={10} /> Create Poll
                </button>
              )}
            </div>

            {isCreatingPoll && (
              <div className="border border-border bg-muted/40 rounded-lg p-3 space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground/80 font-bold uppercase">Poll Question</label>
                  <input
                    type="text"
                    placeholder="e.g. Which logic fits best?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-slate-900 px-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground/80 font-bold uppercase">Option A</label>
                    <input
                      type="text"
                      placeholder="Option 1"
                      value={opt1}
                      onChange={(e) => setOpt1(e.target.value)}
                      className="h-8 w-full rounded border border-border bg-slate-900 px-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground/80 font-bold uppercase">Option B</label>
                    <input
                      type="text"
                      placeholder="Option 2"
                      value={opt2}
                      onChange={(e) => setOpt2(e.target.value)}
                      className="h-8 w-full rounded border border-border bg-slate-900 px-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => setIsCreatingPoll(false)} variant="ghost" size="sm" className="h-8 text-[10px]">
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePoll} size="sm" className="h-8 text-[10px]">
                    Launch
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {polls.map((poll) => {
                const totalVotes = poll.votes.reduce((a, b) => a + b, 0) || 1;
                return (
                  <div key={poll.id} className="border border-border bg-slate-950/20 p-3 rounded-lg space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-foreground block">{poll.question}</span>
                      <span className="text-[9px] text-muted-foreground/80 mt-0.5 block">{poll.isActive ? "Active Poll" : "Closed"} · {totalVotes} votes</span>
                    </div>

                    <div className="space-y-2">
                      {poll.options.map((opt, oIdx) => {
                        const votesCount = poll.votes[oIdx];
                        const pct = Math.round((votesCount / totalVotes) * 100);
                        return (
                          <button
                            key={oIdx}
                            disabled={!poll.isActive}
                            onClick={() => handleVote(poll.id, oIdx)}
                            className="w-full text-left relative overflow-hidden border border-border/80 bg-card rounded p-2 text-[10px] hover:bg-slate-850/50 transition-colors focus:outline-none"
                          >
                            {/* Progress bar fill */}
                            <div className="absolute top-0 bottom-0 left-0 bg-primary/10 transition-all" style={{ width: `${pct}%` }} />
                            <div className="relative flex justify-between items-center font-semibold">
                              <span className="truncate pr-4">{opt}</span>
                              <span className="text-muted-foreground shrink-0">{votesCount} ({pct}%)</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {localTab === "ai" && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary select-none">
              <Sparkles size={14} className="animate-pulse" />
              <span>Sparky AI Classroom Copilot</span>
            </div>
            
            <p className="text-[10px] text-muted-foreground leading-relaxed select-none">
              Sparky analyzes the live classroom chat and whiteboard transcription stream to generate instant summaries or concept notes.
            </p>

            <div className="grid grid-cols-2 gap-2 select-none">
              <button
                onClick={() => handleGenerateAi("notes")}
                disabled={aiLoading}
                className="py-2.5 px-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <BookOpen size={14} className="text-blue-400" />
                <span>Class Notes</span>
              </button>
              <button
                onClick={() => handleGenerateAi("summary")}
                disabled={aiLoading}
                className="py-2.5 px-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Brain size={14} className="text-indigo-400" />
                <span>Session Summary</span>
              </button>
            </div>

            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-xs text-muted-foreground select-none">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Sparky is analyzing transcription...</span>
              </div>
            )}

            {!aiLoading && aiOutput && (
              <div className="p-3 bg-slate-950/40 border border-border/80 rounded-lg text-[10px] leading-relaxed whitespace-pre-line text-foreground overflow-y-auto max-h-80 scrollbar-thin">
                <span className="font-extrabold text-[9px] uppercase tracking-wider text-primary block mb-2 select-none">
                  ✨ Generated {aiType === "notes" ? "Class Notes" : "Session Summary"}
                </span>
                {aiOutput}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
