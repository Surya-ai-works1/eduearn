// src/lib/services/studentProfileService.ts

import { StudentProfileRepository } from "../repositories/studentProfile";
import { StudentProfile, StudentStats } from "../types/studentProfile";
import { createClient } from "../supabase";
import { IS_MOCK } from "../config";

export class StudentProfileService {
  async getProfile(studentId: string, supabaseClient?: any): Promise<StudentProfile | null> {
    return StudentProfileRepository.getProfile(studentId, supabaseClient);
  }

  async updateProfile(studentId: string, profile: Partial<StudentProfile>, supabaseClient?: any): Promise<StudentProfile> {
    return StudentProfileRepository.updateProfile(studentId, profile, supabaseClient);
  }

  async deleteProfile(studentId: string, supabaseClient?: any): Promise<boolean> {
    return StudentProfileRepository.deleteProfile(studentId, supabaseClient);
  }

  async getStudentStats(studentId: string): Promise<StudentStats> {
    let enrollments: any[] = [];

    if (IS_MOCK) {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("eduearn_enrollments");
          if (saved) enrollments = JSON.parse(saved);
        } catch {}
      }
    } else {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("learner_id", studentId);
      if (!error && data) {
        enrollments = data;
      }
    }

    const enrolledCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => Number(e.progress || 0) === 100).length;
    const certificatesEarned = enrollments.filter((e) => !!e.certificate_url).length;

    // Calculate dynamic completion rate as average progress across all courses
    const totalProgress = enrollments.reduce((acc, curr) => acc + Number(curr.progress || 0), 0);
    const completionRate = enrolledCourses > 0 ? Math.round(totalProgress / enrolledCourses) : 0;

    // Estimate total study time based on progress
    const totalLearningHours = enrollments.reduce((acc, curr) => {
      const progressFraction = Number(curr.progress || 0) / 100;
      return acc + Math.round(progressFraction * 8); // assume 8 hrs per course
    }, 0);

    return {
      enrolledCourses,
      completedCourses,
      certificatesEarned,
      completionRate,
      currentLearningStreak: 7, // Stable mock streak
      totalLearningHours
    };
  }
}

export const studentProfileService = new StudentProfileService();
