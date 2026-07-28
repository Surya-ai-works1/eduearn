"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { Analytics } from "../../../components/tutor/Analytics";
import { motion } from "framer-motion";

export default function TutorAnalyticsPage() {
  const { myCourses, students, earningsBalanceState } = useTutor();

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Analytics
        myCourses={myCourses}
        students={students}
        earningsBalance={earningsBalanceState}
      />
    </motion.div>
  );
}
