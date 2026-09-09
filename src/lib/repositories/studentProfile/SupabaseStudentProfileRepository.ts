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

  private async getSupabaseClient(client?: any) {
    if (client) return client;
    if (typeof window === "undefined") {
      try {
        const { createClient: createServerClient } = await import("../../supabase/server");
        const serverClient = await createServerClient();
        if (serverClient) return serverClient;
      } catch {}
    }
    const { createClient: createBrowserClient } = await import("../../supabase");
    return createBrowserClient();
  }

  async getProfile(studentId: string, client?: any): Promise<StudentProfile | null> {
    const supabase = await this.getSupabaseClient(client);
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", studentId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapDbToProfile(data);
  }

  async updateProfile(studentId: string, profile: Partial<StudentProfile>, client?: any): Promise<StudentProfile> {
    const supabase = await this.getSupabaseClient(client);
    if (!supabase) {
      throw new Error("Supabase client is unavailable");
    }

    const updatePayload: any = {
      id: studentId,
    };

    if (profile.fullName !== undefined) {
      updatePayload.full_name = profile.fullName;
      updatePayload.display_name = profile.fullName;
    }
    if (profile.bio !== undefined) updatePayload.bio = profile.bio;
    if (profile.avatarUrl !== undefined) updatePayload.avatar_url = profile.avatarUrl;
    if (profile.country !== undefined) updatePayload.country = profile.country;
    if (profile.language !== undefined) updatePayload.language = profile.language;
    if (profile.skills !== undefined) updatePayload.skills = profile.skills;
    if (profile.email !== undefined && profile.email) updatePayload.email = profile.email;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .upsert(updatePayload, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Database error updating profile:", error);
      throw new Error(error.message || "Failed to update profile in database");
    }

    if (!data) {
      return {
        id: studentId,
        fullName: profile.fullName || "Student Learner",
        email: profile.email || "",
        avatarUrl: profile.avatarUrl || "",
        bio: profile.bio || "",
        skills: profile.skills || [],
        country: profile.country || "",
        language: profile.language || "",
        joinedAt: new Date().toISOString(),
      };
    }

    return this.mapDbToProfile(data);
  }

  async deleteProfile(studentId: string, client?: any): Promise<boolean> {
    const supabase = await this.getSupabaseClient(client);
    if (!supabase) return true;
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", studentId);
    if (error) throw error;
    return true;
  }
}
