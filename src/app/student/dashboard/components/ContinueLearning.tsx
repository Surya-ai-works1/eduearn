"use client";

import React from "react";
import { BookOpen, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { DashboardCard } from "./DashboardCard";

interface EnrolledCourse {
  id: string;
  title: string;
  tutorName: string;
  thumbnail: string;
  progress: number;
  lessonsCount: number;
  completedLessons: number;
  duration: string;
  estimatedCompletion: string;
  category: string;
  lastStudied: string;
}

interface ContinueLearningProps {
  enrolledCourses: EnrolledCourse[];
  onResume: (courseId: string) => void;
  setActiveTab: (tab: string) => void;
}

export function ContinueLearning({
  enrolledCourses,
  onResume,
  setActiveTab,
}: ContinueLearningProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
        <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
          Continue Learning
        </h3>
        <button
          onClick={() => setActiveTab("my-courses")}
          className="text-xs text-primary hover:underline font-bold focus:outline-none"
        >
          View all courses
        </button>
      </div>

      {enrolledCourses.length === 0 ? (
        <DashboardCard variant="glass" className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <BookOpen size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Start your learning journey</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
            You are not enrolled in any active courses yet. Discover structured curriculum modules from verified educators.
          </p>
          <Link
            href="/courses"
            className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition shadow-soft mt-1"
          >
            Explore Courses
          </Link>
        </DashboardCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrolledCourses.slice(0, 3).map((course, idx) => {
            const completedCount = course.completedLessons || 0;
            const nextLessonNum = Math.min(course.lessonsCount, completedCount + 1);
            const remainingLessons = Math.max(0, course.lessonsCount - completedCount);

            const buttonLabel = course.progress === 100
              ? "View Certificate"
              : completedCount > 0 || course.progress > 0
              ? `Continue Lesson ${nextLessonNum}`
              : "Start Course";

            const momentumText = course.progress === 100
              ? "🎉 Course Complete! Certificate unlocked."
              : remainingLessons === 1
              ? "Almost there! 1 lesson remaining."
              : remainingLessons > 0 && completedCount > 0
              ? `You're ${remainingLessons} lessons away from completing this course.`
              : "Start your first lesson to build momentum.";

            return (
              <DashboardCard
                key={course.id}
                variant="default"
                hoverEffect="lift"
                animateDelay={idx * 0.05}
                className="p-4 flex flex-col justify-between min-h-[210px] border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60"
              >
                <div className="flex items-start gap-3.5">
                  {/* Course Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 relative overflow-hidden select-none">
                    {course.thumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- Dynamic thumbnail upload preview */
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/courses/python.webp";
                        }}
                      />
                    ) : (
                      <BookOpen size={20} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg inline-block">
                      {course.category}
                    </span>
                    <h4 className="text-xs font-bold truncate mt-1 text-slate-800 dark:text-slate-100" title={course.title}>
                      {course.title}
                    </h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate">
                      Tutor: {course.tutorName} · Last studied: {course.lastStudied}
                    </p>
                  </div>
                </div>

                {/* Progress and status indicators */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-450 dark:text-slate-400">
                    <span>Progress: {course.progress}%</span>
                    <span>{completedCount}/{course.lessonsCount} lessons</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        course.progress === 100 ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">
                    {momentumText}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-3">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {course.estimatedCompletion}
                  </span>

                  <Button
                    onClick={() => {
                      if (course.progress === 100) {
                        window.location.href = `/student/certificate/${course.id}`;
                      } else {
                        onResume(course.id);
                      }
                    }}
                    size="sm"
                    className={`h-8 gap-1 font-bold text-xs shadow-soft ${
                      course.progress === 100
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : ""
                    }`}
                  >
                    <PlayCircle size={13} />
                    {buttonLabel}
                  </Button>
                </div>
              </DashboardCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default ContinueLearning;
