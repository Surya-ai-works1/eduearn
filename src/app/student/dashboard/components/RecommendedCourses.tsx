"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Star, ArrowUpRight, Sparkles, BookOpen } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { DashboardCard } from "./DashboardCard";
import { MOCK_COURSES } from "../../../../constants/mockData";

interface RecommendedCoursesProps {
  enrollWishlist: (course: any) => void;
}

export function RecommendedCourses({ enrollWishlist }: RecommendedCoursesProps) {
  const router = useRouter();

  // Three high-fidelity courses recommended for the student
  const recommendations = [
    { 
      id: "course-drawing",
      title: "Pencil Sketching & Drawing", 
      category: "🎨 Creative Arts", 
      tutor: "Priya Patel", 
      reason: "Based on your interests in Creative Arts", 
      subjectId: "drawing",
      rating: 4.9,
      duration: "9 hours",
      level: "Beginner"
    },
    { 
      id: "course-photography",
      title: "Advanced DSLR Photography", 
      category: "📸 Photography", 
      tutor: "Anjali Deshmukh", 
      reason: "Because you completed Pencil Sketching & Drawing", 
      subjectId: "photography",
      rating: 4.8,
      duration: "8 hours",
      level: "Intermediate"
    },
    { 
      id: "course-python",
      title: "Advanced Python Algorithms", 
      category: "💻 Python Programming", 
      tutor: "Vikram Rathore", 
      reason: "Because you enrolled in AI Prompt Engineering", 
      subjectId: "python",
      rating: 4.9,
      duration: "10 hours",
      level: "Advanced"
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-2">
        <Sparkles size={14} className="text-primary fill-current animate-pulse" />
        <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
          AI Suggested Courses
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.map((item, idx) => {
          const matchedCourse = MOCK_COURSES.find((c) => c.subjectId === item.subjectId) || MOCK_COURSES[0];
          
          return (
            <DashboardCard
              key={idx}
              variant="glass"
              hoverEffect="lift"
              animateDelay={idx * 0.05}
              className="p-4 shadow-soft border border-slate-200/50 dark:border-slate-800/60 hover:border-primary/45 flex flex-col justify-between min-h-[195px] bg-white/70 dark:bg-slate-900/60"
            >
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-500">
                    <Star size={10} className="fill-current" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                <h3 className="font-heading font-bold text-xs text-slate-800 dark:text-slate-100 mt-2 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">Tutor: {item.tutor} · Level: {item.level}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 italic mt-2.5 font-semibold">
                  {item.reason}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                <Button
                  onClick={() => router.push(`/courses/${matchedCourse.id}`)}
                  variant="outline"
                  className="flex-1 text-[10px] h-8 rounded-xl font-bold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350"
                >
                  Details
                </Button>
                <Button
                  onClick={() => enrollWishlist(matchedCourse)}
                  className="flex-1 text-[10px] h-8 rounded-xl font-bold gap-0.5 shadow-soft"
                >
                  Quick Enroll <ArrowUpRight size={12} />
                </Button>
              </div>
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}
export default RecommendedCourses;
