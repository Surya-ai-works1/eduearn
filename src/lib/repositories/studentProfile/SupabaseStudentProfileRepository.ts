// src/lib/repositories/studentProfile/SupabaseStudentProfileRepository.ts

import { IStudentProfileRepository } from "./IStudentProfileRepository";
import { StudentProfile } from "../../types/studentProfile";
import { createClient } from "../../supabase";

export class SupabaseStudentProfileRepository implements IStudentProfileRepository {
  private mapDbToProfile(row: any): StudentProfile {
    return {
      id: row.id,
      fullName: row.full_name || row.display_name || "Student Learner",
      email: row.email || "",
      avatarUrl: row.avatar_url || "",
      bio: row.bio || "",
      skills: row.skills || [],
      country: row.country || "",
      language: row.language || "",
      joinedAt: row.created_at || row.updated_at || new Date().toISOString(),
    };
  }

  async getProfile(studentId: string): Promise<StudentProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", studentId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapDbToProfile(data);
  }

  async updateProfile(studentId: string, profile: Partial<StudentProfile>): Promise<StudentProfile> {
    const supabase = createClient();
    const updatePayload: any = {};

    if (profile.fullName !== undefined) updatePayload.full_name = profile.fullName;
    if (profile.bio !== undefined) updatePayload.bio = profile.bio;
    if (profile.avatarUrl !== undefined) updatePayload.avatar_url = profile.avatarUrl;
    if (profile.country !== undefined) updatePayload.country = profile.country;
    if (profile.language !== undefined) updatePayload.language = profile.language;
    if (profile.skills !== undefined) updatePayload.skills = profile.skills;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", studentId)
      .select()
      .single();

    if (error) throw error;
    return this.mapDbToProfile(data);
  }
}
