"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLmsAuth } from "../../hooks/useLmsAuth";
import { lmsDb, Course } from "../../lib/lmsDb";
import { FaArrowLeft, FaGraduationCap, FaPlay } from "react-icons/fa";

export default function MyLearnDashboard() {
  const router = useRouter();
  const { lmsUser, isLoading: authLoading, error } = useLmsAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<(Course & { progress?: number })[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    async function load() {
      if (!lmsUser) return;
      try {
        setLoadingCourses(true);
        const data = await lmsDb.getEnrolledCourses(lmsUser._id);
        setEnrolledCourses(data);
      } catch (err) {
        console.error("Failed to load enrolled courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    }
    load();
  }, [lmsUser]);

  if (authLoading || loadingCourses) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-xs text-muted-foreground/80 font-light">Loading enrolled courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4 bg-card p-8 border border-border rounded-3xl shadow-sm">
          <h2 className="text-lg font-bold text-red-400">Portal Error</h2>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!lmsUser) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4 bg-card p-8 border border-border rounded-3xl shadow-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 animate-pulse"><FaGraduationCap size={24} /></div>
          <h2 className="text-lg font-bold text-foreground">LMS Portal Locked</h2>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            Please sign in to your EduEarn account to view your learning dashboard and purchased modules.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg transition shadow-lg shadow-blue-500/20"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex justify-center">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">My Learning Dashboard</h1>
            <p className="text-xs text-muted-foreground font-light">
              Resume learning and track your progress across enrolled courses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/following"
              className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition"
            >
              Following Tutors
            </Link>
            <Link
              href="/learn/courses"
              className="px-4 py-2 bg-card border border-border hover:bg-muted/60 text-foreground text-xs font-semibold rounded-lg transition"
            >
              Browse Marketplace Catalog
            </Link>
          </div>
        </div>

        {/* Course Grid */}
        {enrolledCourses.length === 0 ? (
          <div className="bg-card border border-border shadow-md rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
            <FaGraduationCap className="text-5xl text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Enrolled Courses Found</h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              You are currently not enrolled in any learning modules. Browse our premium courses to start learning!
            </p>
            <Link
              href="/learn/courses"
              className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-border/80 rounded-2xl overflow-hidden flex flex-col justify-between group transition duration-300"
              >
                <div>
                  <div className="aspect-video w-full bg-slate-950 overflow-hidden relative border-b border-border">
                    {course.thumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- Course thumbnails are loaded dynamically from external storage */
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-background text-slate-700 text-4xl">
                        <FaGraduationCap />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md">
                      {course.category}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-blue-400 transition duration-300">
                      {course.title}
                    </h2>
                    <p className="text-[10px] text-muted-foreground font-light">
                      Level: <span className="text-muted-foreground">{course.level}</span> • Lessons: {course.lessons?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => router.push(`/learn/lecture/${course.id}`)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/5"
                  >
                    <FaPlay className="text-[9px]" /> Resume Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
