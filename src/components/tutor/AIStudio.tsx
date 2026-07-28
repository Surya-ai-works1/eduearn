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
  Settings
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
    desc: "Create comprehensive 45-minute lesson timelines, hooks, and guides.",
    color: "from-violet-500 to-purple-600",
    systemPrompt: "You are a professional teacher planner. Create a detailed 45-minute lesson plan detailing: Objectives, Materials needed, Hook (5m), Lecture content (20m), Activity (15m), and Summary (5m).",
    placeholder: "e.g. Introduction to Newton's Laws of Motion"
  },
  {
    id: "quiz-gen",
    icon: ClipboardList,
    label: "Quiz Generator",
    desc: "Create multiple-choice questions with full answer keys.",
    color: "from-blue-500 to-cyan-600",
    systemPrompt: "You are an expert educator. Generate 5 multiple-choice quiz questions (each with 4 options labeled A, B, C, D) and a clear Answer Key at the end.",
    placeholder: "e.g. Basic chemistry: atoms, covalent bonds, and ionic bonds"
  },
  {
    id: "asg-gen",
    icon: Brain,
    label: "Assignment Generator",
    desc: "Design detailed homework templates, rubrics, and criteria.",
    color: "from-orange-500 to-amber-600",
    systemPrompt: "You are an experienced college professor. Design a comprehensive student homework assignment containing title, objectives, step-by-step instructions, and points distribution rubric.",
    placeholder: "e.g. Building a REST API with Node.js and Express"
  },
  {
    id: "paper-gen",
    icon: FileQuestion,
    label: "Question Paper Generator",
    desc: "Generate structured exam papers with short and long questions.",
    color: "from-emerald-500 to-teal-600",
    systemPrompt: "You are an academic examiner. Design a formal 50-mark exam paper consisting of Section A (5 MCQ questions), Section B (3 short-answer questions, 5 marks each), and Section C (2 detailed-answer questions, 15 marks each).",
    placeholder: "e.g. Midterm exam for introductory macroeconomic principles"
  },
  {
    id: "course-gen",
    icon: BookOpen,
    label: "Course Outline Generator",
    desc: "Build full syllabi structures with course modules.",
    color: "from-rose-500 to-pink-600",
    systemPrompt: "You are an expert curriculum designer. Generate a structured, premium course syllabus outline with module titles and 3 lesson topics under each module.",
    placeholder: "e.g. Full stack web development boot camp outline"
  },
  {
    id: "pres-gen",
    icon: FileUp,
    label: "Presentation Generator",
    desc: "Create slide-by-slide text transcripts, structures, and visual notes.",
    color: "from-pink-500 to-rose-600",
    systemPrompt: "You are a slide design consultant. Draft a slide-by-slide transcript outline (10 slides total) detailing Slide Title, Bullet Points, and Speaker Notes for each slide.",
    placeholder: "e.g. History of Space Exploration and Apollo Missions"
  },
  {
    id: "chat-assist",
    icon: MessageSquareText,
    label: "Teaching Assistant Chat",
    desc: "Ask Sparky, your pedagogical co-pilot, any conceptual questions.",
    color: "from-indigo-500 to-blue-600",
    systemPrompt: "You are Sparky, the EduEarn AI pedagogical assistant. Help the teacher with formatting, explanations, quiz ideas, or administrative templates.",
    placeholder: "Ask me anything... e.g. How can I explain quantum computers to a 10-year old?"
  },
  {
    id: "grammar-imp",
    icon: Wand2,
    label: "Grammar Improver",
    desc: "Fix sentence structures and polish lecture slides text.",
    color: "from-cyan-500 to-blue-600",
    systemPrompt: "You are a grammar and editorial specialist. Rewrite the following text to correct spelling errors, punctuation, run-on sentences, and ensure a highly academic tone.",
    placeholder: "Paste slides text with errors..."
  },
  {
    id: "rewriter",
    icon: RefreshCw,
    label: "Content Rewriter",
    desc: "Paraphrase or translate complex sentences for easier teaching.",
    color: "from-purple-500 to-indigo-600",
    systemPrompt: "You are an educational translator. Paraphrase the following academic material using simpler words, analogies, and real-world examples so that middle-school students can grasp it easily.",
    placeholder: "Paste complex research paper abstracts..."
  }
];

const PROMPT_LIBRARY = [
  { label: "Middle school physics intro", text: "Create an engaging lesson plan for middle school introduction to gravity." },
  { label: "React JS hooks conceptual quiz", text: "Generate 5 tricky MCQs on React state hooks and side-effects lifecycle." },
  { label: "Intro to Python syllabus outline", text: "Design a 6-week module curriculum outline for Python basics for finance experts." }
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

  // State
  const [selectedTool, setSelectedTool] = useState<(typeof AI_TOOLS)[number]>(AI_TOOLS[0]);
  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");

  // Options Panel Configs
  const [difficulty, setDifficulty] = useState("Medium");
  const [tone, setTone] = useState("Engaging");
  const [targetGrade, setTargetGrade] = useState("Undergraduate");

  // History state
  const [historyList, setHistoryList] = useState<AIHistoryItem[]>([
    {
      id: "hist-1",
      toolId: "quiz-gen",
      toolName: "Quiz Generator",
      prompt: "5 tricky MCQs on React state hooks",
      response: "Q1: Which hook handles local state?\nA) useEffect\nB) useState\nC) useContext\nAnswer: B",
      timestamp: "Today, 10:30 AM",
      optionsSelected: { difficulty: "Hard", tone: "Formal", targetGrade: "Undergraduate" }
    }
  ]);

  // Generate
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
    a.download = `eduearn_${selectedTool.id}.txt`;
    a.click();
    toast.success("Text outline downloaded.");
  };

  return (
    <motion.div
      key="ai-studio"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-500 animate-spin" />
          <h2 className="text-xl font-heading font-extrabold text-foreground">AI Workspace Cockpit</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Supercharge your curriculum builder, outlines, assessments, and lesson workflows with Gemini.
        </p>
      </div>

      {/* Credit meter banner */}
      <Card className="p-4 bg-violet-500/5 border border-violet-500/20 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-wide">
            AI Credits Limit
          </span>
          <span className="text-xs font-bold text-foreground">
            {aiTokensUsed} / {tokenLimit} credits used
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              tokenPct >= 90 ? "bg-rose-500" : "bg-violet-500"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${tokenPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </Card>

      {/* Main workspace grids */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-6">
        {/* Left column: Tool selection menu & prompt libraries */}
        <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-xs font-heading font-extrabold uppercase text-muted-foreground">Pedagogical Tools</h3>
            <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-1">
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

          {/* Prompt Library */}
          <div className="space-y-2">
            <h3 className="text-xs font-heading font-extrabold uppercase text-muted-foreground flex items-center gap-1">
              <Compass size={13} />
              Prompt Libraries
            </h3>
            <div className="space-y-2">
              {PROMPT_LIBRARY.map((lib, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptInput(lib.text)}
                  className="w-full p-2.5 bg-card border border-border/60 rounded-lg text-left text-[10px] font-semibold text-foreground hover:border-violet-500/40 hover:bg-violet-500/5 transition-all cursor-pointer"
                >
                  <span className="text-primary font-bold block mb-1">Preset #{idx + 1}: {lib.label}</span>
                  <span className="text-muted-foreground font-medium leading-relaxed">{lib.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Playground workspace, options panel, output editor */}
        <div className="space-y-4">
          <Card className="p-5 border-border shadow-floating space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Sparkles size={16} className="text-violet-500" />
              <h3 className="text-xs font-heading font-extrabold uppercase text-foreground">
                AI playground: {selectedTool.label}
              </h3>
            </div>

            {/* Options panels */}
            <div className="grid grid-cols-3 gap-3 bg-muted/30 p-3 rounded-xl border border-border/40 text-[10px]">
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase flex items-center gap-1">
                  <GraduationCap size={11} /> Grade Level
                </label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                >
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="PhD Research">PhD Research</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase flex items-center gap-1">
                  <Settings size={11} /> Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                >
                  <option value="Easy">Easy Level</option>
                  <option value="Medium">Medium Level</option>
                  <option value="Hard">Hard Level</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase flex items-center gap-1">
                  <Compass size={11} /> Tone Style
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                >
                  <option value="Engaging">Engaging / Active</option>
                  <option value="Formal">Formal / Scientific</option>
                  <option value="Socratic">Socratic Questioning</option>
                </select>
              </div>
            </div>

            {/* Prompt input field */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-foreground">Topic or instruction prompt *</label>
              <div className="relative">
                <textarea
                  rows={4}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={selectedTool.placeholder}
                  className="w-full bg-card border border-border rounded-xl p-3 focus:outline-none text-xs font-semibold text-foreground resize-none"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isTokensExhausted}
                  className="absolute right-3.5 bottom-3.5 h-8 px-3.5 text-[10px] font-extrabold gap-1 bg-violet-600 hover:bg-violet-700 text-white shadow-soft"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Generated output editor */}
            {(isGenerating || generatedOutput) && (
              <div className="space-y-2.5 border-t border-border/40 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-violet-600 flex items-center gap-1">
                    <Sparkles size={11} className="animate-pulse" />
                    Interactive Output Editor
                  </span>
                  {generatedOutput && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 text-[9px] font-bold px-2"
                      >
                        <Copy size={11} /> Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="h-7 text-[9px] font-bold px-2"
                      >
                        <Download size={11} /> Download TXT
                      </Button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  {isGenerating ? (
                    <div className="p-4 bg-muted/30 border border-border/40 rounded-xl min-h-[180px] flex flex-col items-center justify-center py-10 gap-2">
                      <Loader2 size={24} className="text-violet-500 animate-spin" />
                      <p className="text-[10px] text-muted-foreground animate-pulse">Consulting pedagogical models...</p>
                    </div>
                  ) : (
                    <textarea
                      rows={8}
                      value={generatedOutput}
                      onChange={(e) => setGeneratedOutput(e.target.value)}
                      className="w-full bg-muted/30 border border-border/40 rounded-xl p-4 text-xs font-semibold text-foreground leading-relaxed focus:outline-none resize-y min-h-[180px] shadow-inner"
                    />
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* AI history list */}
          <div className="space-y-2">
            <h3 className="text-xs font-heading font-extrabold uppercase text-muted-foreground flex items-center gap-1.5">
              <History size={13} />
              Recent Generation History
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
                    <h4 className="text-xs font-bold text-foreground mt-2 truncate max-w-[320px]">{hist.prompt}</h4>
                    <p className="text-[9px] text-muted-foreground">{hist.timestamp} &bull; {hist.optionsSelected.difficulty} difficulty</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold text-primary hover:bg-primary/5">
                    Load
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
