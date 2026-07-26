"use client";

import React, { useMemo } from "react";
import { Sparkles, Flame, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";

interface HeroBannerProps {
  fullName: string;
  streak: number;
  welcomeGreeting: string;
  enrolledCourses: any[];
  onResume: (courseId: string) => void;
  setActiveTab: (tab: string) => void;
  learningLevel: string;
}

export function HeroBanner({
  fullName,
  streak,
  welcomeGreeting,
  enrolledCourses,
  onResume,
  setActiveTab,
  learningLevel,
}: HeroBannerProps) {
  // Get active course to resume
  const lastActive = useMemo(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) return null;
    return enrolledCourses[0]; // Python by default
  }, [enrolledCourses]);

  // AI-generated motivational statement based on streak and progress
  const aiMotivation = useMemo(() => {
    if (!lastActive) {
      return "Welcome to EduEarn! Sparky AI recommends browsing skills to start your learning journey.";
    }
    const lessonsRemaining = lastActive.lessonsCount - lastActive.completedLessons;
    if (lessonsRemaining <= 2) {
      return `Sparky AI: You're only ${lessonsRemaining} lesson${lessonsRemaining > 1 ? "s" : ""} away from mastering ${lastActive.title.replace(" Masterclass", "")}! Let's finish it today.`;
    }
    return `Sparky AI: Keep your ${streak}-day learning streak burning! You are making 80% faster progress in ${lastActive.category} this week.`;
  }, [lastActive, streak]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Personalized Greeting Banner */}
      <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-lg border border-indigo-500/20">
        {/* Apple-style background overlay elements */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 bg-white/10 px-2.5 py-1 rounded-full inline-block">
            {welcomeGreeting}
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight leading-tight">
            {welcomeGreeting}, {fullName}! 👋
          </h2>
          <p className="text-xs text-blue-100 max-w-md font-medium leading-relaxed mt-1">
            {aiMotivation}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-6 relative z-10 pt-4 border-t border-white/10">
          {lastActive ? (
            <Button
              onClick={() => onResume(lastActive.id)}
              className="bg-white hover:bg-slate-100 text-blue-700 dark:bg-slate-100 dark:text-blue-900 font-bold text-xs h-10 px-5 rounded-xl shadow-md gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Resume learning: {lastActive.title.split(" Masterclass")[0].split(":")[0]}
            </Button>
          ) : (
            <Button
              onClick={() => setActiveTab("my-courses")}
              className="bg-white hover:bg-slate-100 text-blue-700 dark:bg-slate-100 dark:text-blue-900 font-bold text-xs h-10 px-5 rounded-xl shadow-md gap-2"
            >
              Browse My Courses
            </Button>
          )}
          <Button
            onClick={() => setActiveTab("ai-hub")}
            variant="ghost"
            className="text-white hover:bg-white/10 font-bold text-xs h-10 px-4 rounded-xl gap-1"
          >
            Consult Sparky AI <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Daily learning streak progress gauge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-soft relative overflow-hidden select-none">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Goal Progression
          </span>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" /> Level {learningLevel === "Beginner" ? "1" : learningLevel === "Intermediate" ? "2" : learningLevel === "Advanced" ? "3" : "4"}
          </span>
        </div>

        <div className="space-y-3.5 py-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Streak milestones</span>
            <span className="text-xs font-black text-primary">{streak} / 10 days</span>
          </div>
          
          {/* Animated custom progress bar */}
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100, (streak / 10) * 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Complete a lesson or pass a challenge quiz today to keep the fire burning.
          </p>
        </div>
      </div>
    </div>
  );
}
export default HeroBanner;
