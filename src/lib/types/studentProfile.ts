// src/lib/types/studentProfile.ts

export interface StudentProfile {
  id: string;
  fullName: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  country?: string;
  language?: string;
  joinedAt?: string; // ISO date string
}

export interface StudentStats {
  enrolledCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  completionRate: number; // percentage, e.g. 75
  currentLearningStreak: number; // in days
  totalLearningHours?: number;
}
