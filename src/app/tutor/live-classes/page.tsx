"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { LiveClasses } from "../../../components/tutor/LiveClasses";
import { motion } from "framer-motion";

export default function TutorLiveClassesPage() {
  const {
    liveSessions,
    setLiveSessions,
    isSchedulingLive,
    setIsSchedulingLive,
    liveForm,
    setLiveForm,
    handleScheduleLive,
    isGateTriggered,
  } = useTutor();

  return (
    <motion.div
      key="live-classes"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <LiveClasses
        liveSessions={liveSessions}
        setLiveSessions={setLiveSessions}
        isSchedulingLive={isSchedulingLive}
        setIsSchedulingLive={setIsSchedulingLive}
        liveForm={liveForm}
        setLiveForm={setLiveForm}
        handleScheduleLive={handleScheduleLive}
        isGateTriggered={isGateTriggered}
      />
    </motion.div>
  );
}
