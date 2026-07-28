"use client";

import React from "react";
import { Community } from "../../../components/tutor/Community";
import { motion } from "framer-motion";

export default function TutorCommunityPage() {
  return (
    <motion.div
      key="community"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Community />
    </motion.div>
  );
}
