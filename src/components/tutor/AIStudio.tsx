"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  FileText,
  ClipboardList,
  Zap,
  Brain,
  Wand2,
  Lock,
  History,
  Copy,
  Download,
  Send,
  Loader2,
  MessageSquare,
  RefreshCw,
  Plus,
  Compass,
  Check,
  GraduationCap,
  MessageSquareText,
  Bookmark,
  FileQuestion,
  FileUp,
  Settings,
  User,
  Bot
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import type { TutorCourse } from "./types";
import type { PlatformConfig } from "../../features/payments/services/paymentService";

interface AIStudioProps {
  myCourses: TutorCourse[];
  aiTokensUsed: number;
  platformConfig: PlatformConfig;
  setIsAiModalOpen: (v: boolean) => void;
  setAiModalConfig: (config: any) => void;
}

interface AIHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  prompt: string;
  response: string;
  timestamp: string;
  optionsSelected: { difficulty: string; tone: string; targetGrade: string };
}

const AI_TOOLS = [
  {
    id: "lesson-plan",
    icon: FileText,
    label: "Lesson Plan Generator",
    desc: "Create comprehensive 45-minute lesson timelines and objectives.",
    color: "from-violet-500 to-purple-600",
    systemPrompt: "You are an expert curriculum designer. Draft a 45-minute lesson plan with Objectives, Hook (5m), Lecture (20m), Activity (15m), and Summary (5m).",
    placeholder: "e.g. Introduction to Newton's Laws of Motion"
  },
  {
    id: "quiz-gen",
    icon: ClipboardList,
    label: "Quiz Generator",
    desc: "Create conceptual multiple-choice questions with answer key lists.",
    color: "from-blue-500 to-cyan-600",
    systemPrompt: "You are an expert educator. Generate 5 multiple-choice quiz questions (each with 4 options labeled A, B, C, D) and a clear Answer Key at the end.",
    placeholder: "e.g. Calculus: derivatives and chain rule concepts"
  },
  {
    id: "asg-gen",
    icon: Brain,
    label: "Assignment Generator",
    desc: "Design detailed homework templates, rubrics, and criteria.",
    color: "from-orange-500 to-amber-600",
    systemPrompt: "You are an experienced college professor. Design a student homework assignment containing title, objectives, instructions, and points distribution rubric.",
    placeholder: "e.g. Building a REST API with Node.js and Express"
  },
  {
    id: "notes-gen",
    icon: FileQuestion,
    label: "Notes Generator",
    desc: "Generate concise study guides and summary slides transcript.",
    color: "from-emerald-500 to-teal-600",
    systemPrompt: "You are a study guide editor. Generate concise summaries and key bullet points explaining the core concepts of the topic clearly.",
    placeholder: "e.g. Quantum superposition explained in simple terms"
  },
  {
    id: "course-gen",
    icon: BookOpen,
    label: "Course Outline Generator",
    desc: "Build full syllabi structures with course modules.",
    color: "from-rose-500 to-pink-600",
    systemPrompt: "You are an expert curriculum designer. Generate a structured, premium course syllabus outline with module titles and 3 lesson topics under each module.",
    placeholder: "e.g. Introduction to Python programming for complete beginners"
  },
  {
    id: "ai-assistant",
    icon: MessageSquareText,
    label: "AI Chat Assistant",
    desc: "Ask any pedagogical or conceptual questions to your copilot.",
    color: "from-cyan-500 to-blue-600",
    systemPrompt: "You are Sparky, the EduEarn AI pedagogical assistant. Help the teacher with formatting, explanations, quiz ideas, or templates.",
    placeholder: "Ask me anything... e.g. How do I explain recursion to high schoolers?"
  }
];

const PROMPT_TEMPLATES = [
  { label: "Lesson Outline Preset", text: "Create an engaging lesson plan for middle school introduction to gravity." },
  { label: "React Quiz Preset", text: "Generate 5 tricky MCQs on React state hooks and side-effects lifecycle." },
  { label: "Python Curriculum Preset", text: "Design a 6-week module curriculum outline for Python basics." }
];

export const AIStudio = React.memo(function AIStudio({
  myCourses,
  aiTokensUsed,
  platformConfig,
  setIsAiModalOpen,
  setAiModalConfig,
}: AIStudioProps) {
  const tokenLimit = platformConfig.aiCredits ?? 1000;
  const tokensRemaining = Math.max(tokenLimit - aiTokensUsed, 0);
  const tokenPct = Math.min((aiTokensUsed / tokenLimit) * 100, 100);
  const isTokensExhausted = tokensRemaining <= 0;

  // Selected tool state (left side)
  const [selectedTool, setSelectedTool] = useState<(typeof AI_TOOLS)[number]>(AI_TOOLS[0]);

  // Options states
  const [difficulty, setDifficulty] = useState("Medium");
  const [tone, setTone] = useState("Engaging");
  const [targetGrade, setTargetGrade] = useState("Undergraduate");

  // Prompt input and generation states
  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");

  // AI History state
  const [historyList, setHistoryList] = useState<AIHistoryItem[]>([
    {
      id: "hist-1",
      toolId: "quiz-gen",
      toolName: "Quiz Generator",
      prompt: "5 MCQs on React state hooks",
      response: "Q1: Which hook handles local state?\nA) useEffect\nB) useState\nC) useContext\nAnswer: B",
      timestamp: "Today, 10:30 AM",
      optionsSelected: { difficulty: "Hard", tone: "Formal", targetGrade: "Undergraduate" }
    }
  ]);

  // AI Chat Section on the Right
  const [chatMessage, setChatMessage] = useState("");
  const [chatLogs, setChatLogs] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Hello! I am Sparky, your pedagogical co-pilot. How can I help you design your curriculum today?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Generate handler
  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      toast.error("Please enter a prompt topic.");
      return;
    }
    if (isTokensExhausted) {
      toast.error("AI credits exhausted. Please upgrade to Pro.");
      return;
    }

    setIsGenerating(true);
    setGeneratedOutput("");

    try {
      const fullSystemPrompt = `${selectedTool.systemPrompt} The target difficulty level is: ${difficulty}. The tone of presentation should be: ${tone}. The target audience group is: ${targetGrade}.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          module: selectedTool.id,
          systemPrompt: fullSystemPrompt
        })
      });

      if (!res.ok) throw new Error("Server responded with error status.");
      const data = await res.json();
      const text = data.text || data.response || data.content || "AI generation completed successfully.";

      setGeneratedOutput(text);

      const newItem: AIHistoryItem = {
        id: `hist-${Date.now()}`,
        toolId: selectedTool.id,
        toolName: selectedTool.label,
        prompt: promptInput,
        response: text,
        timestamp: "Just now",
        optionsSelected: { difficulty, tone, targetGrade }
      };

      setHistoryList((prev) => [newItem, ...prev]);
      localStorage.setItem("eduearn_tutor_ai_tokens_used", String(aiTokensUsed + 5));
      toast.success("Generation completed!");
    } catch (err: any) {
      console.error(err);
      toast.error("Pedagogical AI service timed out. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput).then(() => {
      toast.success("Text copied to clipboard!");
    });
  };

  const handleDownload = () => {
    if (!generatedOutput) return;
    const blob = new Blob([generatedOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eduearn_ai_${selectedTool.id}.txt`;
    a.click();
    toast.success("File exported successfully!");
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatLogs((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          module: "chat",
          systemPrompt: "You are Sparky, the EduEarn AI pedagogical assistant chatbot. Respond concisely in a helpful, encouraging tone to help the teacher design coursework."
        })
      });

      const data = await res.json();
      const botText = data.text || data.response || data.content || "I am here to assist you with your classes!";
      setChatLogs((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (err) {
      console.error(err);
      setChatLogs((prev) => [...prev, { sender: "bot", text: "Sorry, I had trouble connecting. Let's try again!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <motion.div
      key="ai-studio"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-500 animate-spin" />
          <h2 className="text-xl font-heading font-extrabold text-foreground">AI Studio</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Premium AI workspace with generators, options panel, custom chat co-pilot and prompts libraries.
        </p>
      </div>

      {/* Main split grid: Left Workspace / Right Chat section */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* Left Panel: Generators, Options, History */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tool selectors list */}
            <div className="space-y-3">
              <h3 className="text-xs font-heading font-extrabold uppercase text-muted-foreground">Generator Tools</h3>
              <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                {AI_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  const isSelected = selectedTool.id === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setSelectedTool(tool);
                        setPromptInput("");
                        setGeneratedOutput("");
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "border-violet-500 bg-violet-500/5 text-foreground shadow-soft"
                          : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white shrink-0 shadow`}>
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground leading-none">{tool.label}</h4>
                        <p className="text-[9px] text-muted-foreground leading-relaxed mt-1">{tool.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt presets / Previous prompts */}
            <div className="space-y-3">
              <h3 className="text-xs font-heading font-extrabold uppercase text-muted-foreground flex items-center gap-1">
                <Bookmark size={12} /> Prompt Templates
              </h3>
              <div className="space-y-2">
                {PROMPT_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPromptInput(tmpl.text)}
                    className="w-full p-2.5 bg-card border border-border/60 rounded-lg text-left text-[10px] font-semibold text-foreground hover:border-violet-500/40 hover:bg-violet-500/5 transition-all cursor-pointer leading-normal"
                  >
                    <span className="text-primary font-bold block mb-0.5">{tmpl.label}</span>
                    {tmpl.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Playground settings options panel */}
          <Card className="p-4 border-border/80 shadow-soft space-y-4">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Settings size={13} className="text-violet-500" />
              Playground Parameters: {selectedTool.label}
            </h3>

            <div className="grid grid-cols-3 gap-3 text-[10px] font-semibold">
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Grade Level</label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                >
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="PhD Research">PhD Research</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                >
                  <option value="Engaging">Engaging</option>
                  <option value="Formal">Formal</option>
                  <option value="Socratic">Socratic</option>
                </select>
              </div>
            </div>

            {/* Prompt input field */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground">Write prompt topic *</label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={selectedTool.placeholder}
                  className="w-full bg-card border border-border rounded-xl p-3 pr-24 focus:outline-none text-xs font-semibold text-foreground resize-none"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="absolute right-3.5 bottom-3.5 h-8 px-3 text-[10px] font-extrabold bg-violet-600 hover:bg-violet-700 text-white shadow-soft"
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : "Generate"}
                </Button>
              </div>
            </div>

            {/* Output editor with Copy, Download, Save History */}
            {(isGenerating || generatedOutput) && (
              <div className="space-y-2 border-t border-border/40 pt-4">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-violet-600 uppercase flex items-center gap-1">
                    <Sparkles size={11} className="animate-pulse" /> Output Editor
                  </span>
                  {generatedOutput && (
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 text-[9px] px-2">
                        <Copy size={11} className="mr-1" /> Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 text-[9px] px-2">
                        <Download size={11} className="mr-1" /> Export TXT
                      </Button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  {isGenerating ? (
                    <div className="p-10 bg-muted/20 border border-border/40 rounded-xl text-center flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-violet-500" size={24} />
                      <p className="text-[10px] text-muted-foreground animate-pulse">Designing coursework slides outline...</p>
                    </div>
                  ) : (
                    <textarea
                      rows={6}
                      value={generatedOutput}
                      onChange={(e) => setGeneratedOutput(e.target.value)}
                      className="w-full bg-muted/30 border border-border/40 rounded-xl p-3.5 text-xs font-semibold text-foreground leading-relaxed focus:outline-none resize-y shadow-inner"
                    />
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* AI History */}
          <div className="space-y-2">
            <h3 className="text-xs font-heading font-extrabold uppercase text-muted-foreground flex items-center gap-1">
              <History size={13} /> AI History
            </h3>
            <div className="space-y-2">
              {historyList.map((hist) => (
                <Card
                  key={hist.id}
                  onClick={() => {
                    const tool = AI_TOOLS.find(t => t.id === hist.toolId);
                    if (tool) setSelectedTool(tool);
                    setPromptInput(hist.prompt);
                    setGeneratedOutput(hist.response);
                    setDifficulty(hist.optionsSelected.difficulty);
                    setTone(hist.optionsSelected.tone);
                    setTargetGrade(hist.optionsSelected.targetGrade);
                  }}
                  className="p-3 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all cursor-pointer flex items-center justify-between border-border/50 shadow-soft"
                >
                  <div className="min-w-0">
                    <span className="text-[8px] font-extrabold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                      {hist.toolName}
                    </span>
                    <h4 className="text-xs font-bold text-foreground mt-1 truncate max-w-[280px]">{hist.prompt}</h4>
                    <p className="text-[9px] text-muted-foreground">{hist.timestamp} &bull; {hist.optionsSelected.difficulty} difficulty</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold text-primary">Load</Button>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: AI Chat Section */}
        <Card variant="glass" className="p-4 flex flex-col justify-between h-[550px] border-border/80 shadow-floating">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Bot size={18} className="text-primary animate-pulse" />
            <div>
              <h3 className="text-xs font-heading font-extrabold uppercase text-foreground leading-none">
                AI Chat Co-pilot
              </h3>
              <span className="text-[8px] text-emerald-500 font-extrabold mt-1 block">Sparky Assistant Online</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1 scrollbar-thin">
            {chatLogs.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[9px] uppercase ${
                  msg.sender === "user" ? "bg-primary text-white" : "bg-violet-500/10 text-violet-600"
                }`}>
                  {msg.sender === "user" ? <User size={10} /> : <Bot size={10} />}
                </div>
                <div className={`p-2.5 rounded-lg text-[10px] font-semibold leading-relaxed ${
                  msg.sender === "user" ? "bg-primary text-white rounded-tr-none" : "bg-card text-foreground rounded-tl-none border border-border/60"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-[10px] text-muted-foreground font-semibold">
                <Loader2 size={12} className="animate-spin text-primary" />
                <span>Sparky is formulating a response...</span>
              </div>
            )}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-border/40">
            <input
              type="text"
              placeholder="Ask Sparky for class tips..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="h-9 flex-1 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            />
            <Button type="submit" disabled={chatLoading} className="h-9 px-3.5 bg-primary text-white font-bold text-xs">
              <Send size={13} />
            </Button>
          </form>
        </Card>
      </div>
    </motion.div>
  );
});
