"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  FileText,
  ClipboardList,
  Zap,
  Brain,
  Wand2,
  Lock,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import type { TutorCourse } from "./types";
import type { PlatformConfig } from "../../features/payments/services/paymentService";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AiModalConfig {
  title: string;
  template: string;
  placeholder: string;
}

interface AIStudioProps {
  myCourses: TutorCourse[];
  aiTokensUsed: number;
  platformConfig: PlatformConfig;
  setIsAiModalOpen: (v: boolean) => void;
  setAiModalConfig: (config: AiModalConfig) => void;
}

// ─── AI Tool Definitions ──────────────────────────────────────────────────────

const AI_TOOLS = [
  {
    id: "course-outline",
    icon: BookOpen,
    label: "Course Outline Generator",
    desc: "Generate a complete course outline with modules and lessons from a topic.",
    color: "from-violet-500 to-purple-600",
    template:
      "You are an expert curriculum designer. Generate a detailed, structured course outline with modules and lessons for the following topic or description:\n\n{{INPUT}}\n\nFormat as a numbered list with sub-lessons under each module.",
    placeholder: "e.g. Introduction to Machine Learning for beginners",
  },
  {
    id: "quiz-gen",
    icon: ClipboardList,
    label: "Quiz & MCQ Generator",
    desc: "Create multiple-choice questions with answer keys for any topic.",
    color: "from-blue-500 to-cyan-600",
    template:
      "You are an expert educator. Generate 10 multiple-choice quiz questions (with 4 options each and a clear answer key) for the following topic:\n\n{{INPUT}}\n\nFormat clearly with Q1, Q2 etc.",
    placeholder: "e.g. Derivatives and Integration in Calculus",
  },
  {
    id: "lesson-plan",
    icon: FileText,
    label: "Lesson Plan Creator",
    desc: "Build a detailed lesson plan with objectives, activities, and assessments.",
    color: "from-emerald-500 to-teal-600",
    template:
      "You are an expert teacher. Create a detailed, engaging lesson plan for the following topic:\n\n{{INPUT}}\n\nInclude: Learning Objectives, Materials Needed, Introduction (5 min), Main Content (25 min), Activity (10 min), Assessment, and Homework.",
    placeholder: "e.g. Understanding React Hooks: useState and useEffect",
  },
  {
    id: "assignment",
    icon: Brain,
    label: "Assignment Designer",
    desc: "Design meaningful assignments with rubrics and grading criteria.",
    color: "from-orange-500 to-amber-600",
    template:
      "You are an experienced educator. Design a comprehensive assignment for the following topic:\n\n{{INPUT}}\n\nInclude: Assignment title, Objectives, Instructions (step-by-step), Submission Requirements, and a Grading Rubric with point distribution.",
    placeholder: "e.g. Build a responsive portfolio website using HTML & CSS",
  },
  {
    id: "description",
    icon: Wand2,
    label: "Course Description Writer",
    desc: "Write compelling, SEO-friendly course descriptions that attract students.",
    color: "from-pink-500 to-rose-600",
    template:
      "You are a professional copywriter specializing in online education. Write a compelling, SEO-friendly course description for the following:\n\n{{INPUT}}\n\nInclude: A hook, key benefits (bullet points), who it's for, what they'll learn, and a call-to-action.",
    placeholder: "e.g. Python for Data Science: Beginner to Advanced",
  },
  {
    id: "email",
    icon: Zap,
    label: "Student Email Templates",
    desc: "Generate professional email templates for student communications.",
    color: "from-indigo-500 to-blue-600",
    template:
      "You are a professional educator. Write a warm, professional email template for the following scenario:\n\n{{INPUT}}\n\nThe email should be friendly, concise, and action-oriented. Include a subject line.",
    placeholder: "e.g. Welcome email for new students enrolling in my Python course",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

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

  const openTool = (tool: (typeof AI_TOOLS)[number]) => {
    if (isTokensExhausted) return;
    setAiModalConfig({
      title: tool.label,
      template: tool.template,
      placeholder: tool.placeholder,
    });
    setIsAiModalOpen(true);
    // Token is counted via onGenerateSuccess in the modal — not here
  };

  const publishedCourses = myCourses.filter((c) => c.status === "published");

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
          <Sparkles className="h-6 w-6 text-violet-500" />
          <h2 className="text-xl font-heading font-extrabold text-foreground">AI Studio</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Supercharge your teaching with AI-powered content generation tools.
        </p>
      </div>

      {/* Token Meter */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            AI Token Usage
          </span>
          <span className="text-xs font-bold text-foreground">
            {aiTokensUsed} / {tokenLimit} used
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              tokenPct >= 90
                ? "bg-rose-500"
                : tokenPct >= 70
                ? "bg-amber-500"
                : "bg-violet-500"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${tokenPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {tokensRemaining} tokens remaining this month.{" "}
          {isTokensExhausted && (
            <span className="text-rose-500 font-semibold">
              Upgrade to Pro for unlimited tokens.
            </span>
          )}
        </p>
      </Card>

      {/* Course Context */}
      {publishedCourses.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Your Active Courses
          </p>
          <div className="flex flex-wrap gap-2">
            {publishedCourses.map((c) => (
              <span
                key={c.id}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border"
              >
                {c.title}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* AI Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isDisabled = isTokensExhausted;
          return (
            <div key={tool.id}>
              <Card
                aria-label={tool.label}
                className={`p-5 cursor-pointer transition-all border-border relative overflow-hidden group ${
                  isDisabled
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-lg hover:border-violet-500/40 hover:-translate-y-0.5"
                }`}
                onClick={() => !isDisabled && openTool(tool)}
              >
                {/* Gradient accent */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full bg-gradient-to-br ${tool.color} opacity-10 transition-opacity group-hover:opacity-20`}
                />

                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${tool.color} shadow-md`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground leading-tight mb-1">
                      {tool.label}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                {isDisabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});
