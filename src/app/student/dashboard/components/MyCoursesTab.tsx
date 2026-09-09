"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Clock } from "lucide-react";
import { Button } from "../../../../components/ui/button";

interface Course {
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

interface MyCoursesTabProps {
  enrolledCourses: Course[];
  certificates: any[];
  courseSearch: string;
  setCourseSearch: (val: string) => void;
  courseFilter: string;
  setCourseFilter: (val: string) => void;
  handleClaimCertificate: (courseId: string) => Promise<void>;
  isUploading: boolean;
}

export function MyCoursesTab({
  enrolledCourses,
  certificates,
  courseSearch,
  setCourseSearch,
  courseFilter,
  setCourseFilter,
  handleClaimCertificate,
  isUploading,
}: MyCoursesTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 px-3 py-1.5 w-full sm:max-w-xs shadow-soft">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search enrolled courses..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 select-none scrollbar-none">
          {[
            { id: "all", label: "All" },
            { id: "in-progress", label: "In Progress" },
            { id: "completed", label: "Completed" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setCourseFilter(btn.id)}
              className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                courseFilter === btn.id
                  ? "bg-primary border-primary text-white"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrolledCourses
          .filter((c) => c.title.toLowerCase().includes(courseSearch.toLowerCase()))
          .filter((c) => {
            if (courseFilter === "in-progress") return c.progress < 100;
            if (courseFilter === "completed") return c.progress === 100;
            return true;
          })
          .map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3 hover:translate-y-[-2px] hover:shadow-soft transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 relative overflow-hidden">
                  {course.thumbnail ? (
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
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold uppercase bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-400 px-1.5 py-0.5 rounded">
                    {course.category}
                  </span>
                  <h4 className="text-xs font-bold truncate mt-1.5 text-slate-800 dark:text-slate-100" title={course.title}>
                    {course.title}
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">by {course.tutorName}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>Progress: {course.progress}%</span>
                  <span>{course.completedLessons}/{course.lessonsCount} lessons</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-1">
                <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-450 flex items-center gap-1">
                  <Clock size={11} />
                  {course.duration}
                </span>
                <div className="flex gap-1.5">
                  {course.progress === 100 && !certificates.some((cert) => cert.courseId === course.id || cert.id === course.id) && (
                    <Button
                      onClick={() => handleClaimCertificate(course.id)}
                      disabled={isUploading}
                      size="sm"
                      variant="outline"
                      className="h-8 text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold"
                    >
                      {isUploading ? "Claiming..." : "Claim Cert"}
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push(`/student/courses/${course.id}/learn`)}
                    size="sm"
                    className="h-8 gap-1 text-[10px] font-bold rounded-xl"
                  >
                    View Course
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
export default MyCoursesTab;
