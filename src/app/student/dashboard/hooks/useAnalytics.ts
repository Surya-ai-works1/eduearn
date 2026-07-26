"use client";

import { useMemo } from "react";

export interface SubjectData {
  subject: string;
  percentage: number;
  color: string;
}

export interface WeeklyStudyHour {
  day: string;
  hours: number;
  prevHours: number;
}

export interface MonthlyProgress {
  month: string;
  completedLessons: number;
  hoursSpent: number;
}

export function useAnalytics(enrolledCourses: any[], stats: any) {
  // 1. Weekly study hours trends (mocked high fidelity comparative data)
  const weeklyHours = useMemo<WeeklyStudyHour[]>(() => {
    return [
      { day: "Mon", hours: 2.5, prevHours: 1.8 },
      { day: "Tue", hours: 3.2, prevHours: 2.0 },
      { day: "Wed", hours: 4.0, prevHours: 3.5 },
      { day: "Thu", hours: 1.5, prevHours: 2.2 },
      { day: "Fri", hours: 2.8, prevHours: 1.5 },
      { day: "Sat", hours: 1.0, prevHours: 3.0 },
      { day: "Sun", hours: 0.5, prevHours: 0.8 },
    ];
  }, []);

  // 2. Subject breakdown derived from enrolled courses
  const subjectDistribution = useMemo<SubjectData[]>(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      return [
        { subject: "Coding", percentage: 40, color: "bg-blue-500" },
        { subject: "Mathematics", percentage: 30, color: "bg-emerald-500" },
        { subject: "AI Hub", percentage: 20, color: "bg-purple-500" },
        { subject: "Arts", percentage: 10, color: "bg-amber-500" },
      ];
    }

    const categories: Record<string, number> = {};
    enrolledCourses.forEach((c) => {
      const cat = c.category ? c.category.replace(/[^a-zA-Z ]/g, "").trim() : "Other";
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const total = enrolledCourses.length;
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-rose-500"];
    
    return Object.keys(categories).map((cat, idx) => ({
      subject: cat,
      percentage: Math.round((categories[cat] / total) * 100),
      color: colors[idx % colors.length],
    }));
  }, [enrolledCourses]);

  // 3. Monthly study progress overview
  const monthlyProgress = useMemo<MonthlyProgress[]>(() => {
    return [
      { month: "Jan", completedLessons: 8, hoursSpent: 12 },
      { month: "Feb", completedLessons: 14, hoursSpent: 22 },
      { month: "Mar", completedLessons: 18, hoursSpent: 28 },
      { month: "Apr", completedLessons: 22, hoursSpent: 35 },
      { month: "May", completedLessons: 19, hoursSpent: 30 },
      { month: "Jun", completedLessons: 25, hoursSpent: 40 },
    ];
  }, []);

  // 4. Goal achievement calculation
  const goals = useMemo(() => {
    const hoursGoal = 15;
    const hoursLogged = weeklyHours.reduce((acc, curr) => acc + curr.hours, 0);
    const progressGoalPercent = Math.min(100, Math.round((hoursLogged / hoursGoal) * 100));

    return {
      hoursGoal,
      hoursLogged: Number(hoursLogged.toFixed(1)),
      progressGoalPercent,
      attendanceRate: 92.5,
      completedSyllabusPercent: stats?.completionRate || 59,
      nextMilestone: "Complete 3 more coding tasks to reach Level Up",
    };
  }, [weeklyHours, stats]);

  return {
    weeklyHours,
    subjectDistribution,
    monthlyProgress,
    goals,
  };
}
