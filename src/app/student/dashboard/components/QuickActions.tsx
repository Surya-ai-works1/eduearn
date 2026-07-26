"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, HelpCircle, Sparkles, Award, TrendingUp, ArrowUpRight } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

interface QuickActionsProps {
  setActiveTab: (tab: string) => void;
  setAiAssistantOpen: (open: boolean) => void;
  setAiAssistantType: (type: any) => void;
}

export function QuickActions({
  setActiveTab,
  setAiAssistantOpen,
  setAiAssistantType,
}: QuickActionsProps) {
  const router = useRouter();

  const actions = [
    {
      title: "Browse Courses",
      description: "Explore catalog",
      icon: BookOpen,
      color: "bg-blue-500/10 text-blue-500",
      action: () => router.push("/courses"),
    },
    {
      title: "Join Live Class",
      description: "Enter classroom",
      icon: Calendar,
      color: "bg-rose-500/10 text-rose-500",
      action: () => setActiveTab("live-classes"),
    },
    {
      title: "Practice Quiz",
      description: "Test your skills",
      icon: HelpCircle,
      color: "bg-amber-500/10 text-amber-500",
      action: () => setActiveTab("quizzes"),
    },
    {
      title: "Consult Sparky AI",
      description: "Get smart answers",
      icon: Sparkles,
      color: "bg-purple-500/10 text-purple-500",
      action: () => {
        setAiAssistantType("study");
        setAiAssistantOpen(true);
      },
    },
    {
      title: "Certificates",
      description: "View credentials",
      icon: Award,
      color: "bg-emerald-500/10 text-emerald-500",
      action: () => setActiveTab("certificates"),
    },
    {
      title: "View Progress",
      description: "Track milestones",
      icon: TrendingUp,
      color: "bg-indigo-500/10 text-indigo-500",
      action: () => setActiveTab("attendance"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
        <h4 className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Quick Shortcuts
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              onClick={act.action}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 rounded-2xl flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 hover:shadow-soft transition-all duration-300 focus:outline-none group"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${act.color}`}>
                <Icon size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-250 leading-tight block">
                {act.title}
              </span>
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block mt-1 flex items-center gap-0.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {act.description} <ArrowUpRight size={8} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default QuickActions;
