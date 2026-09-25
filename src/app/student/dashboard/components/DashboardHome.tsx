"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeroBanner } from "./HeroBanner";
import { DashboardStats } from "./DashboardStats";
import { ContinueLearning } from "./ContinueLearning";
import { AiAssistantWidget } from "./AiAssistantWidget";
import { UpcomingClasses } from "./UpcomingClasses";
import { RecommendedCourses } from "./RecommendedCourses";
import { LearningAnalytics } from "./LearningAnalytics";
import { AchievementsGrid } from "./AchievementsGrid";
import { QuickActions } from "./QuickActions";

interface DashboardHomeProps {
  user: any;
  stats: any;
  streak: number;
  coins: number;
  xp: number;
  learningLevel: string;
  enrolledCourses: any[];
  calendarEvents: any[];
  countdownSeconds: number;
  formattedCountdown: string;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dateEventsList: any[];
  setActiveTab: (tab: string) => void;
  setAiAssistantOpen: (open: boolean) => void;
  setAiAssistantType: (type: any) => void;
  setAiInputText: (text: string) => void;
  enrollWishlist: (course: any) => void;
  onResume: (courseId: string) => void;
  welcomeGreeting: string;
  assignments?: any[];
  quizzes?: any[];
  handleStartQuiz?: (quiz: any) => void;
}

export function DashboardHome({
  user,
  stats,
  streak,
  coins,
  xp,
  learningLevel,
  enrolledCourses,
  calendarEvents,
  countdownSeconds,
  formattedCountdown,
  selectedDate,
  setSelectedDate,
  dateEventsList,
  setActiveTab,
  setAiAssistantOpen,
  setAiAssistantType,
  setAiInputText,
  enrollWishlist,
  onResume,
  welcomeGreeting,
  assignments = [],
  quizzes = [],
  handleStartQuiz,
}: DashboardHomeProps) {
  const pendingAssignments = assignments.filter((a) => a.status === "Pending");
  const availableQuizzes = quizzes.filter((q) => !q.latestAttempt || q.latestAttempt.status !== "Submitted");

  return (
    <motion.div
      key="tab-dashboard"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 select-none"
    >
      {/* 1. Personalized Hero Banner */}
      <HeroBanner
        fullName={user?.fullName || "Student"}
        streak={streak}
        welcomeGreeting={welcomeGreeting}
        enrolledCourses={enrolledCourses}
        onResume={onResume}
        setActiveTab={setActiveTab}
        learningLevel={learningLevel}
      />

      {/* 2. Quick Actions Panel */}
      <QuickActions
        setActiveTab={setActiveTab}
        setAiAssistantOpen={setAiAssistantOpen}
        setAiAssistantType={setAiAssistantType}
      />

      {/* 3. Six Stats Overview metrics */}
      <DashboardStats stats={stats} streak={streak} />

      {/* 4. Continue Learning Course Cards (Priority 1 CTA) */}
      <ContinueLearning
        enrolledCourses={enrolledCourses}
        onResume={onResume}
        setActiveTab={setActiveTab}
      />

      {/* 4b. Pending Tasks & Practice (Priority 2 & 3: Pending Assignments & Available Quizzes) */}
      {(pendingAssignments.length > 0 || availableQuizzes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pendingAssignments.length > 0 && (
            <div className="card-surface p-4 rounded-card border border-amber-500/20 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
                  📝 Pending Assignment ({pendingAssignments.length})
                </span>
                <button
                  onClick={() => setActiveTab("assignments")}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {pendingAssignments.slice(0, 2).map((assign) => (
                  <div key={assign.id} className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{assign.title}</h5>
                      <span className="text-[9px] text-slate-400">Due: {assign.dueDate} · {assign.courseTitle}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab("assignments")}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition"
                    >
                      Submit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableQuizzes.length > 0 && (
            <div className="card-surface p-4 rounded-card border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-primary">
                  🧠 Practice Quiz Challenge ({availableQuizzes.length})
                </span>
                <button
                  onClick={() => setActiveTab("quizzes")}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {availableQuizzes.slice(0, 2).map((quiz) => (
                  <div key={quiz.id} className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{quiz.title}</h5>
                      <span className="text-[9px] text-slate-400">{quiz.questionsCount || 3} Questions · 🪙 {quiz.rewardCoins || 50} Coins</span>
                    </div>
                    <button
                      onClick={() => {
                        if (handleStartQuiz) {
                          handleStartQuiz(quiz);
                        }
                        setActiveTab("quizzes");
                      }}
                      className="px-3 py-1 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-lg transition"
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. AI Assistant Recommendations Widget */}
      <AiAssistantWidget
        stats={stats}
        setAiAssistantOpen={setAiAssistantOpen}
        setAiAssistantType={setAiAssistantType}
        setAiInputText={setAiInputText}
      />

      {/* 6. Upcoming live schedule & sessions */}
      <UpcomingClasses
        countdownSeconds={countdownSeconds}
        formattedCountdown={formattedCountdown}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        dateEventsList={dateEventsList}
        calendarEvents={calendarEvents}
        setActiveTab={setActiveTab}
      />

      {/* 7. Learning Analytics trends */}
      <LearningAnalytics enrolledCourses={enrolledCourses} stats={stats} />

      {/* 8. Achievements level milestone logs */}
      <AchievementsGrid
        xp={xp}
        coins={coins}
        streak={streak}
        learningLevel={learningLevel}
      />

      {/* 9. AI Suggested catalog items */}
      <RecommendedCourses enrollWishlist={enrollWishlist} />
    </motion.div>
  );
}
export default DashboardHome;
