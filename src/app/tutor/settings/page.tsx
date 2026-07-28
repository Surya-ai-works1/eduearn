"use client";

import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useTutor } from "../../../context/TutorContext";
import { Settings } from "../../../components/tutor/Settings";
import { motion } from "framer-motion";

export default function TutorSettingsPage() {
  const { completeProfile } = useAuth();
  const {
    tutorProfileForm,
    setTutorProfileForm,
    activeSettingAccordion,
    setActiveSettingAccordion,
    verificationTimeline,
    setVerificationTimeline,
    isIdUploaded,
    setIsIdUploaded,
    appStatus,
  } = useTutor();

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Settings
        tutorProfileForm={tutorProfileForm}
        setTutorProfileForm={setTutorProfileForm}
        activeSettingAccordion={activeSettingAccordion}
        setActiveSettingAccordion={setActiveSettingAccordion}
        completeProfile={completeProfile}
        verificationTimeline={verificationTimeline}
        setVerificationTimeline={setVerificationTimeline}
        isIdUploaded={isIdUploaded}
        setIsIdUploaded={setIsIdUploaded}
        appStatus={appStatus}
      />
    </motion.div>
  );
}
