"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { Assignments } from "../../../components/tutor/Assignments";
import { motion } from "framer-motion";

export default function TutorAssignmentsPage() {
  const {
    students,
    activeGradingStudentId,
    setActiveGradingStudentId,
    gradingForm,
    setGradingForm,
    handleSubmitGrade,
  } = useTutor();

  return (
    <motion.div
      key="assignments"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Assignments
        students={students}
        activeGradingStudentId={activeGradingStudentId}
        setActiveGradingStudentId={setActiveGradingStudentId}
        gradingForm={gradingForm}
        setGradingForm={setGradingForm}
        handleSubmitGrade={handleSubmitGrade}
      />
    </motion.div>
  );
}
