"use client";

import React from "react";
import TutorNotifications from "../../../components/tutor/TutorNotifications";
import { motion } from "framer-motion";

export default function TutorNotificationsPage() {
  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <TutorNotifications />
    </motion.div>
  );
}
