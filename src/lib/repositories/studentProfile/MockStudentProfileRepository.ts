// src/lib/repositories/studentProfile/MockStudentProfileRepository.ts

import { IStudentProfileRepository } from "./IStudentProfileRepository";
import { StudentProfile } from "../../types/studentProfile";

export class MockStudentProfileRepository implements IStudentProfileRepository {
  private getLocalUser(studentId: string): StudentProfile {
    if (typeof window === "undefined") {
      return {
        id: studentId,
        fullName: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        bio: "Enthusiastic developer learning keyboard, coding, and choreography.",
        country: "India",
        language: "English",
        joinedAt: "2026-07-01T12:00:00Z"
      };
    }

    try {
      const saved = localStorage.getItem("eduearn_mock_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          id: studentId,
          fullName: parsed.fullName || parsed.full_name || "Rahul Sharma",
          email: parsed.email || "rahul.sharma@example.com",
          avatarUrl: parsed.avatarUrl || parsed.avatar_url || "",
          bio: parsed.bio || "",
          country: parsed.country || "India",
          language: parsed.language || "English",
          skills: parsed.skills || ["React", "Python", "UI/UX"],
          joinedAt: parsed.joinedAt || parsed.created_at || "2026-07-01T12:00:00Z"
        };
      }
    } catch {}

    const defaultProfile: StudentProfile = {
      id: studentId,
      fullName: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      bio: "Enthusiastic developer learning keyboard, coding, and choreography.",
      country: "India",
      language: "English",
      skills: ["React", "Python", "UI/UX"],
      joinedAt: "2026-07-01T12:00:00Z"
    };

    localStorage.setItem("eduearn_mock_user", JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  private saveLocalUser(profile: StudentProfile) {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_mock_user", JSON.stringify(profile));
  }

  async getProfile(studentId: string): Promise<StudentProfile | null> {
    return this.getLocalUser(studentId);
  }

  async updateProfile(studentId: string, profile: Partial<StudentProfile>): Promise<StudentProfile> {
    const current = this.getLocalUser(studentId);
    const updated = {
      ...current,
      ...profile,
      id: studentId
    };
    this.saveLocalUser(updated);
    return updated;
  }
}
