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
  Plus
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
}

const AI_TOOLS = [
  {
    id: "course-gen",
    icon: BookOpen,
    label: "AI Course Generator",
    desc: "Generate a complete course syllabus and curriculum outline with modules.",
    color: "from-violet-500 to-purple-600",
    systemPrompt: "You are an expert curriculum designer. Generate a structured, premium course syllabus outline with module titles and 3 lesson topics under each module.",
    placeholder: "e.g. Introduction to Python programming for complete beginners"
  },
  {
    id: "quiz-gen",
    icon: ClipboardList,
    label: "AI Quiz Generator",
    desc: "Create conceptual multiple-choice questions with answer key lists.",
    color: "from-blue-500 to-cyan-600",
    systemPrompt: "You are an expert educator. Generate 5 multiple-choice quiz questions (each with 4 options labeled A, B, C, D) and a clear Answer Key at the end.",
    placeholder: "e.g. Calculus: Derivatives and chain rule concepts"
  },
  {
    id: "asg-gen",
    icon: Brain,
    label: "AI Assignment Generator",
    desc: "Design homework topics, rubrics, and submission requirements.",
    color: "from-orange-500 to-amber-600",
    systemPrompt: "You are an experienced college professor. Design a comprehensive student homework assignment containing title, objectives, step-by-step instructions, and points distribution rubric.",
    placeholder: "e.g. Build a responsive ecommerce UI using Tailwind CSS"
  },
  {
    id: "lesson-plan",
    icon: FileText,
    label: "AI Lesson Planner",
    desc: "Build timing segments, activities, objectives, and teaching guides.",
    color: "from-emerald-500 to-teal-600",
    systemPrompt: "You are a professional teacher planner. Create a detailed 45-minute lesson plan detailing: Objectives, Materials needed, Hook (5m), Lecture content (20m), Activity (15m), and Summary (5m).",
    placeholder: "e.g. Explaining asynchronous JavaScript: Promises and async/await"
  },
  {
    id: "improver",
    icon: Wand2,
    label: "AI Content Improver",
    desc: "Refine, simplify, or format your explanations for maximum clarity.",
    color: "from-pink-500 to-rose-600",
    systemPrompt: "You are an expert editor. Rewrite the following academic content to be clear, engaging, and easy to understand for students, keeping essential terms intact.",
    placeholder: "e.g. Explaining quantum superposition in simple analogical terms..."
  },
  {
    id: "chat-assist",
    icon: MessageSquare,
    label: "AI Chat Assistant",
    desc: "Ask any pedagogical or conceptual questions to your copilot.",
    color: "from-indigo-500 to-blue-600",
    systemPrompt: "You are Sparky, the EduEarn AI pedagogical assistant. Help the teacher with formatting, explanations, quiz ideas, or administrative templates.",
    placeholder: "Ask me anything... e.g. How do I explain recursion to high schoolers?"
  }
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

  // Selected tool state
  const [selectedTool, setSelectedTool] = useState<(typeof AI_TOOLS)[number]>(AI_TOOLS[0]);

  // Prompt input and generation states
  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");

  // History state list
  const [historyList, setHistoryList] = useState<AIHistoryItem[]>([
    {
      id: "hist-1",
      toolId: "quiz-gen",
      toolName: "AI Quiz Generator",
      prompt: "Introduction to HTML structure",
      response: "Q1: Which tag is the root element?\nA) <body>\nB) <html>\nC) <head>\nAnswer: B",
      timestamp: "Today, 10:30 AM"
    }
  ]);

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
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          module: selectedTool.id,
          systemPrompt: selectedTool.systemPrompt
        })
      });

      if (!res.ok) throw new Error("Server responded with error status.");
      const data = await res.json();
      const text = data.text || data.response || data.content || "AI generation completed.";

      setGeneratedOutput(text);

      // Add to history list
      const newHistoryItem: AIHistoryItem = {
        id: `hist-${Date.now()}`,
        toolId: selectedTool.id,
        toolName: selectedTool.label,
        prompt: promptInput,
        response: text,
        timestamp: "Just now"
      };
      setHistoryList((prev) => [newHistoryItem, ...prev]);
      
      // Update local storage credit count
      localStorage.setItem("eduearn_tutor_ai_tokens_used", String(aiTokensUsed + 5));

      toast.success("Content generated successfully!");
    } catch (err: any) {
      console.error("AI Studio generation failed:", err);
      toast.error("Pedagogical AI service timed out. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput).then(() => {
      toast.success("Generated text copied to clipboard!");
    });
  };

  const handleExportTxt = () => {
    if (!generatedOutput) return;
    const blob = new Blob([generatedOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTool.id}_content.txt`;
    a.click();
    toast.success("Text file exported successfully!");
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
          <h2 className="text-xl font-heading font-extrabold text-foreground">Pedagogical AI Studio</h2>
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

      {/* Main workspace splits */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-6">
        {/* Left Side: Tool options grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-heading font-extrabold uppercase text-muted-foreground">Pedagogical Tools</h3>
          <div className="grid grid-cols-1 gap-2.5">
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
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
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

        {/* Right Side: Interactive playground console */}
        <div className="space-y-4">
          <Card className="p-5 border-border shadow-floating space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Sparkles size={16} className="text-violet-500" />
              <h3 className="text-xs font-heading font-extrabold uppercase text-foreground">
                Playground Console: {selectedTool.label}
              </h3>
            </div>

            {/* Input prompt box */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-foreground">What topic or outline would you like to generate? *</label>
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

            {/* Generated output layout */}
            {isGenerating || generatedOutput ? (
              <div className="space-y-2.5 border-t border-border/40 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-violet-600 flex items-center gap-1">
                    <Sparkles size={11} className="animate-pulse" />
                    Gemini Response Output
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
                        onClick={handleExportTxt}
                        className="h-7 text-[9px] font-bold px-2"
                      >
                        <Download size={11} /> Export TXT
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted/30 border border-border/40 rounded-xl min-h-[160px] text-xs font-semibold text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Loader2 size={24} className="text-violet-500 animate-spin" />
                      <p className="text-[10px] text-muted-foreground animate-pulse">Consulting pedagogical models...</p>
                    </div>
                  ) : (
                    generatedOutput
                  )}
                </div>
              </div>
            ) : null}
          </Card>

          {/* Prompt History list */}
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
                  }}
                  className="p-3 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all cursor-pointer flex items-center justify-between border-border/50 shadow-soft"
                >
                  <div className="min-w-0">
                    <span className="text-[8px] font-extrabold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                      {hist.toolName}
                    </span>
                    <h4 className="text-xs font-bold text-foreground mt-2 truncate max-w-[320px]">{hist.prompt}</h4>
                    <p className="text-[9px] text-muted-foreground">{hist.timestamp}</p>
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
