"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { AIStudio } from "../../../components/tutor/AIStudio";
import { motion } from "framer-motion";

export default function TutorAIStudioPage() {
  const { myCourses, aiTokensUsed, platformConfig, setIsAiModalOpen, setAiModalConfig } = useTutor();

  return (
    <motion.div
      key="ai-studio"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <AIStudio
        myCourses={myCourses}
        aiTokensUsed={aiTokensUsed}
        platformConfig={platformConfig}
        setIsAiModalOpen={setIsAiModalOpen}
        setAiModalConfig={setAiModalConfig}
      />
    </motion.div>
  );
}
