"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { CourseManager } from "../../../components/tutor/CourseManager";
import { motion } from "framer-motion";

export default function TutorCoursesPage() {
  const {
    myCourses,
    setMyCourses,
    isCreatingCourse,
    setIsCreatingCourse,
    activeBuilderCourseId,
    setActiveBuilderCourseId,
    curriculumModules,
    setCurriculumModules,
    newModuleName,
    setNewModuleName,
    activeModuleIdForLesson,
    setActiveModuleIdForLesson,
    lessonForm,
    setLessonForm,
    isAutoSaving,
    courseForm,
    setCourseForm,
    editingCourseId,
    setEditingCourseId,
    courseSelCatId,
    setCourseSelCatId,
    courseSelSubName,
    setCourseSelSubName,
    appStatus,
    handleAddModule,
    handleAddLesson,
    triggerAutoSave,
    courseSearch,
    setCourseSearch,
    courseCategoryFilter,
    setCourseCategoryFilter,
    coursePage,
    setCoursePage,
    courseTotalPages,
    lessons,
    setLessons,
    lessonsLoading,
  } = useTutor();

  return (
    <motion.div
      key="courses"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <CourseManager
        myCourses={myCourses}
        setMyCourses={setMyCourses}
        isCreatingCourse={isCreatingCourse}
        setIsCreatingCourse={setIsCreatingCourse}
        activeBuilderCourseId={activeBuilderCourseId}
        setActiveBuilderCourseId={setActiveBuilderCourseId}
        curriculumModules={curriculumModules}
        setCurriculumModules={setCurriculumModules}
        newModuleName={newModuleName}
        setNewModuleName={setNewModuleName}
        activeModuleIdForLesson={activeModuleIdForLesson}
        setActiveModuleIdForLesson={setActiveModuleIdForLesson}
        lessonForm={lessonForm}
        setLessonForm={setLessonForm}
        isAutoSaving={isAutoSaving}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        editingCourseId={editingCourseId}
        setEditingCourseId={setEditingCourseId}
        courseSelCatId={courseSelCatId}
        setCourseSelCatId={setCourseSelCatId}
        courseSelSubName={courseSelSubName}
        setCourseSelSubName={setCourseSelSubName}
        appStatus={appStatus}
        handleAddModule={handleAddModule}
        handleAddLesson={handleAddLesson}
        triggerAutoSave={triggerAutoSave}
        courseSearch={courseSearch}
        setCourseSearch={setCourseSearch}
        courseCategoryFilter={courseCategoryFilter}
        setCourseCategoryFilter={setCourseCategoryFilter}
        coursePage={coursePage}
        setCoursePage={setCoursePage}
        courseTotalPages={courseTotalPages}
        lessons={lessons}
        setLessons={setLessons}
        lessonsLoading={lessonsLoading}
      />
    </motion.div>
  );
}
