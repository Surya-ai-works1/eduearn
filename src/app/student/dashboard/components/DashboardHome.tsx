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
}: DashboardHomeProps) {
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

      {/* 4. Continue Learning Course Cards */}
      <ContinueLearning
        enrolledCourses={enrolledCourses}
        onResume={onResume}
        setActiveTab={setActiveTab}
      />

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
