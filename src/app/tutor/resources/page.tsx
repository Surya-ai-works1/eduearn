"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { Resources } from "../../../components/tutor/Resources";
import { motion } from "framer-motion";

export default function TutorResourcesPage() {
  const { mediaFiles, setMediaFiles, platformConfig, calculateTotalMediaSizeMB } = useTutor();

  return (
    <motion.div
      key="resources"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Resources
        mediaFiles={mediaFiles}
        setMediaFiles={setMediaFiles}
        platformConfig={platformConfig}
        calculateTotalMediaSizeMB={calculateTotalMediaSizeMB}
      />
    </motion.div>
  );
}
