"use client";

import React from "react";
import { Button } from "../../../../components/ui/button";

interface DashboardEmptyStateProps {
  type: "courses" | "notifications" | "classes" | "achievements";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function DashboardEmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: DashboardEmptyStateProps) {
  // Render high-fidelity Tailwind-styled inline SVGs instead of standard images
  const renderIllustration = () => {
    switch (type) {
      case "courses":
        return (
          <svg className="w-32 h-32 text-blue-500/20 dark:text-blue-500/10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="80" height="60" rx="8" className="stroke-blue-500/40 dark:stroke-blue-500/30" strokeWidth="2.5" />
            <path d="M40 50H80M40 70H65" className="stroke-blue-500/40 dark:stroke-blue-500/30" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="95" cy="40" r="12" className="fill-blue-500/20 stroke-blue-500 dark:stroke-blue-400" strokeWidth="2.5" />
            <path d="M91 40L94 43L99 37" className="stroke-white dark:stroke-slate-900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "notifications":
        return (
          <svg className="w-32 h-32 text-amber-500/20 dark:text-amber-500/10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 20C46.2 20 35 31.2 35 45V65L25 75V80H95V75L85 65V45C85 31.2 73.8 20 60 20Z" className="stroke-amber-500/40 dark:stroke-amber-500/30" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M50 90C50 95.5 54.5 100 60 100C65.5 100 70 95.5 70 90" className="stroke-amber-500/40 dark:stroke-amber-500/30" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="90" cy="35" r="10" className="fill-amber-500" />
          </svg>
        );
      case "classes":
        return (
          <svg className="w-32 h-32 text-rose-500/20 dark:text-rose-500/10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="25" width="70" height="70" rx="12" className="stroke-rose-500/40 dark:stroke-rose-500/30" strokeWidth="2.5" />
            <path d="M25 45H95" className="stroke-rose-500/40 dark:stroke-rose-500/30" strokeWidth="2.5" />
            <circle cx="45" cy="65" r="8" className="fill-rose-500/20 stroke-rose-500" strokeWidth="2" />
            <circle cx="75" cy="65" r="8" className="fill-rose-500/20 stroke-rose-500" strokeWidth="2" />
          </svg>
        );
      case "achievements":
        return (
          <svg className="w-32 h-32 text-yellow-500/20 dark:text-yellow-500/10" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 40H80V70C80 81 71 90 60 90C49 90 40 81 40 70V40Z" className="stroke-yellow-500/40 dark:stroke-yellow-500/30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 50H25C19.5 50 15 54.5 15 60C15 65.5 19.5 70 25 70H40" className="stroke-yellow-500/40 dark:stroke-yellow-500/30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M80 50H95C100.5 50 105 54.5 105 60C105 65.5 100.5 70 95 70H80" className="stroke-yellow-500/40 dark:stroke-yellow-500/30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 105H70" className="stroke-yellow-500/40 dark:stroke-yellow-500/30" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M60 90V105" className="stroke-yellow-500/40 dark:stroke-yellow-500/30" strokeWidth="2.5" />
          </svg>
        );
    }
  };

  const getDefaults = () => {
    switch (type) {
      case "courses":
        return {
          title: "No Courses Found",
          description: "Explore our rich peer-led curriculum and start learning your favorite subjects today.",
          actionLabel: "Browse Courses",
        };
      case "notifications":
        return {
          title: "Inbox is Empty",
          description: "We'll notify you here when you receive feedback, new classes, or assignment reviews.",
          actionLabel: "Clear Filters",
        };
      case "classes":
        return {
          title: "No Classes Scheduled",
          description: "All clear! There are no upcoming classes on your agenda. Check back later or book a new session.",
          actionLabel: "Find a Tutor",
        };
      case "achievements":
        return {
          title: "No Achievements Yet",
          description: "Start attending classes, passing quizzes, and maintaining streaks to collect verified reward badges.",
          actionLabel: "Take a Quiz",
        };
    }
  };

  const defaults = getDefaults();
  const finalTitle = title || defaults.title;
  const finalDescription = description || defaults.description;
  const finalActionLabel = actionLabel || defaults.actionLabel;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-5 animate-fade-in select-none">
      <div className="bg-slate-50 dark:bg-slate-950/20 rounded-full p-6 shadow-inner">
        {renderIllustration()}
      </div>
      <div className="space-y-2">
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{finalTitle}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{finalDescription}</p>
      </div>
      {onAction && finalActionLabel && (
        <Button onClick={onAction} size="sm" className="font-bold text-xs shadow-soft transition-all duration-300">
          {finalActionLabel}
        </Button>
      )}
    </div>
  );
}
export default DashboardEmptyState;
