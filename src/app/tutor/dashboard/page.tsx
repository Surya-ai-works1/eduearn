"use client";

import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import { TeacherStudioView } from "../../../components/tutor/TeacherStudioView";
import { motion } from "framer-motion";

export default function TutorDashboardPage() {
  const { user } = useAuth();

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <TeacherStudioView user={user} />
    </motion.div>
  );
}
