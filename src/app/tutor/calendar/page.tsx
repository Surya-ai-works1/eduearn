"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { CalendarView } from "../../../components/tutor/Calendar";
import { motion } from "framer-motion";

export default function TutorCalendarPage() {
  const { handleTabChange, setIsSchedulingLive, liveSessions } = useTutor();

  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <CalendarView
        onScheduleLive={() => {
          handleTabChange("live-classes");
          setIsSchedulingLive(true);
        }}
        liveSessions={liveSessions}
      />
    </motion.div>
  );
}
