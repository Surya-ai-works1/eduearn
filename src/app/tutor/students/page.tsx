"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { StudentManager } from "../../../components/tutor/StudentManager";
import { motion } from "framer-motion";

export default function TutorStudentsPage() {
  const {
    students,
    myCourses,
    studentSearch,
    setStudentSearch,
    studentFilterCourse,
    setStudentFilterCourse,
    studentFilterProgress,
    setStudentFilterProgress,
    studentSortBy,
    setStudentSortBy,
    handleIssueCertificate,
  } = useTutor();

  return (
    <motion.div
      key="students"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <StudentManager
        students={students}
        myCourses={myCourses}
        studentSearch={studentSearch}
        setStudentSearch={setStudentSearch}
        studentFilterCourse={studentFilterCourse}
        setStudentFilterCourse={setStudentFilterCourse}
        studentFilterProgress={studentFilterProgress}
        setStudentFilterProgress={setStudentFilterProgress}
        studentSortBy={studentSortBy}
        setStudentSortBy={setStudentSortBy}
        onIssueCertificate={handleIssueCertificate}
      />
    </motion.div>
  );
}
