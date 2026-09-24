// src/lib/repositories/lessonManagement/SupabaseLessonManagementRepository.ts

import { ILessonManagementRepository } from "./ILessonManagementRepository";
import { LessonManagementItem } from "../../types/lessonManagement";
import { createClient } from "../../supabase";

export class SupabaseLessonManagementRepository implements ILessonManagementRepository {
  private async getSupabase() {
    if (typeof window === "undefined") {
      const { createClient } = await import("../../supabase/server");
      const client = await createClient();
      if (client) return client;
    }
    return createClient();
  }

  async getLessons(courseId: string): Promise<LessonManagementItem[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("lesson_order", { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map((l: any) => ({
      id: l.id,
      courseId: l.course_id,
      title: l.title,
      description: l.description || "",
      // TODO: Add lessonType column to public.lessons table in future database migration
      lessonType: "Video",
      videoUrl: l.video_url || "",
      duration: Number(l.duration || 0),
      order: l.lesson_order || 0,
      // TODO: Add resources column/table to public.lessons table in future database migration
      resources: [],
      // TODO: Add status column to public.lessons table in future database migration
      status: "published",
      createdAt: l.created_at,
    }));
  }

  async createLesson(
    courseId: string,
    lessonData: Omit<LessonManagementItem, "id" | "courseId" | "createdAt">
  ): Promise<LessonManagementItem> {
    const supabase = await this.getSupabase();

    // Gracefully omit lessonType, resources, and status which are not in lessons schema
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: lessonData.title,
        description: lessonData.description,
        video_url: lessonData.videoUrl,
        duration: lessonData.duration,
        lesson_order: lessonData.order,
        position: lessonData.order, // Set position same as order
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to create lesson in database");
    }

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description || "",
      lessonType: "Video", // Default
      videoUrl: data.video_url || "",
      duration: Number(data.duration || 0),
      order: data.lesson_order || 0,
      resources: [], // Default
      status: "published", // Default
      createdAt: data.created_at,
    };
  }

  async updateLesson(
    lessonId: string,
    updates: Partial<LessonManagementItem>
  ): Promise<LessonManagementItem> {
    const supabase = await this.getSupabase();

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.order !== undefined) {
      dbUpdates.lesson_order = updates.order;
      dbUpdates.position = updates.order;
    }

    const { data, error } = await supabase
      .from("lessons")
      .update(dbUpdates)
      .eq("id", lessonId)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to update lesson in database");
    }

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description || "",
      lessonType: updates.lessonType || "Video",
      videoUrl: data.video_url || "",
      duration: Number(data.duration || 0),
      order: data.lesson_order || 0,
      resources: updates.resources || [],
      status: (updates.status || "published") as LessonManagementItem["status"],
      createdAt: data.created_at,
    };
  }

  async deleteLesson(lessonId: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) {
      throw error;
    }

    return true;
  }

  async updateLessonOrder(courseId: string, orderedIds: string[]): Promise<boolean> {
    const supabase = await this.getSupabase();

    // Perform ordering updates concurrently
    const promises = orderedIds.map((id, index) =>
      supabase
        .from("lessons")
        .update({
          lesson_order: index + 1,
          position: index + 1,
        })
        .eq("id", id)
        .eq("course_id", courseId)
    );

    const results = await Promise.all(promises);
    const failed = results.find((r) => r.error);
    if (failed) {
      throw failed.error;
    }

    return true;
  }
}
