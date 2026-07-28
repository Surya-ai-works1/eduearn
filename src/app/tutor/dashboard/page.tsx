"use client";

import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useTutor } from "../../../context/TutorContext";
import { DashboardOverview } from "../../../components/tutor/DashboardOverview";
import { motion } from "framer-motion";

export default function TutorDashboardPage() {
  const { user } = useAuth();
  const {
    myCourses,
    students,
    liveSessions,
    reviews,
    earningsBalanceState,
    aiTokensUsed,
    platformConfig,
    trialDaysRemaining,
    handleTabChange,
    setIsCreatingCourse,
    setIsSchedulingLive,
    statistics,
    recentEnrollments,
    recentActivities,
  } = useTutor();

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <DashboardOverview
        user={user ? { fullName: user.fullName || "Tutor" } : null}
        myCourses={myCourses}
        students={students}
        liveSessions={liveSessions}
        reviews={reviews}
        earningsBalance={earningsBalanceState}
        aiTokensUsed={aiTokensUsed}
        platformConfig={platformConfig}
        trialDaysRemaining={trialDaysRemaining}
        onTabChange={handleTabChange}
        onCreateCourse={() => {
          handleTabChange("courses");
          setIsCreatingCourse(true);
        }}
        onScheduleLive={() => {
          handleTabChange("live-classes");
          setIsSchedulingLive(true);
        }}
        statistics={statistics || undefined}
        recentEnrollments={recentEnrollments}
        recentActivities={recentActivities}
      />
    </motion.div>
  );
}
