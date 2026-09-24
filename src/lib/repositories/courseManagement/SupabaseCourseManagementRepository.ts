// src/lib/repositories/courseManagement/SupabaseCourseManagementRepository.ts

import { ICourseManagementRepository } from "./ICourseManagementRepository";
import { CourseManagementItem, CoursePaginationResult } from "../../types/courseManagement";
import { createClient } from "../../supabase";

export class SupabaseCourseManagementRepository implements ICourseManagementRepository {
  private async getSupabase() {
    if (typeof window === "undefined") {
      const { createClient } = await import("../../supabase/server");
      const client = await createClient();
      if (client) return client;
    }
    return createClient();
  }

  async getCourses(
    tutorId: string,
    options: { search?: string; category?: string; page: number; limit: number }
  ): Promise<CoursePaginationResult> {
    const supabase = await this.getSupabase();

    let query = supabase
      .from("courses")
      .select("*", { count: "exact" })
      .eq("tutor_id", tutorId);

    if (options.category && options.category !== "All" && options.category !== "all") {
      query = query.ilike("category", options.category);
    }

    if (options.search) {
      const q = `%${options.search}%`;
      query = query.or(`title.ilike.${q},subtitle.ilike.${q},category.ilike.${q}`);
    }

    query = query.order("updated_at", { ascending: false });

    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error || !data) {
      throw error || new Error("Failed to load courses from database");
    }

    const courseIds = data.map((c: any) => c.id);
    const enrollmentCounts: Record<string, number> = {};

    if (courseIds.length > 0) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds);
      if (enrollments) {
        enrollments.forEach((e: any) => {
          enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1;
        });
      }
    }

    const courses: CourseManagementItem[] = data.map((c: any) => ({
      id: c.id,
      tutorId: c.tutor_id,
      title: c.title,
      subtitle: c.subtitle || "",
      description: c.description || "",
      category: c.category,
      level: c.level || "beginner",
      // TODO: Persist language when proper database migrations are added in a future schema version.
      language: "English",
      thumbnail: c.thumbnail || "",
      price: Number(c.price || 0),
      status: (c.status || "draft") as CourseManagementItem["status"],
      // TODO: Persist tags when proper database migrations are added in a future schema version.
      tags: [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      studentsCount: enrollmentCounts[c.id] || 0,
      rating: 5.0,
    }));

    const total = count || 0;
    const pages = Math.ceil(total / options.limit);

    return {
      courses,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages,
      },
    };
  }

  async createCourse(
    tutorId: string,
    courseData: Omit<CourseManagementItem, "id" | "tutorId" | "createdAt" | "updatedAt" | "studentsCount" | "rating">
  ): Promise<CourseManagementItem> {
    const supabase = await this.getSupabase();

    // Gracefully omit language and tags from database insert since columns are missing
    const { data, error } = await supabase
      .from("courses")
      .insert({
        tutor_id: tutorId,
        title: courseData.title,
        subtitle: courseData.subtitle,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        thumbnail: courseData.thumbnail,
        price: courseData.price,
        status: courseData.status,
        approval_status: courseData.status === "published" ? "approved" : "pending",
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to create course in database");
    }

    return {
      id: data.id,
      tutorId: data.tutor_id,
      title: data.title,
      subtitle: data.subtitle || "",
      description: data.description || "",
      category: data.category,
      level: data.level,
      language: "English", // Omitted from Supabase; defaulted in UI
      thumbnail: data.thumbnail || "",
      price: Number(data.price),
      status: data.status as CourseManagementItem["status"],
      tags: [], // Omitted from Supabase; defaulted in UI
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      studentsCount: 0,
      rating: 0,
    };
  }

  async updateCourse(
    courseId: string,
    updates: Partial<CourseManagementItem>
  ): Promise<CourseManagementItem> {
    const supabase = await this.getSupabase();

    // Map properties to database columns, gracefully omitting language and tags
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.thumbnail !== undefined) dbUpdates.thumbnail = updates.thumbnail;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("courses")
      .update(dbUpdates)
      .eq("id", courseId)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to update course in database");
    }

    return {
      id: data.id,
      tutorId: data.tutor_id,
      title: data.title,
      subtitle: data.subtitle || "",
      description: data.description || "",
      category: data.category,
      level: data.level,
      language: updates.language || "English",
      thumbnail: data.thumbnail || "",
      price: Number(data.price),
      status: data.status as CourseManagementItem["status"],
      tags: updates.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      studentsCount: 0,
      rating: 5.0,
    };
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    const supabase = await this.getSupabase();

    // Hard delete matches standard table behavior
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      throw error;
    }

    return true;
  }
}
