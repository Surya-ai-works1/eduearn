// src/lib/repositories/assignmentManagement/SupabaseAssignmentManagementRepository.ts

import { IAssignmentManagementRepository } from "./IAssignmentManagementRepository";
import { AssignmentItem, AssignmentSubmissionItem, AssignmentPaginationResult } from "../../types/assignmentManagement";
import { createClient } from "../../supabase";

export class SupabaseAssignmentManagementRepository implements IAssignmentManagementRepository {
  async getAssignments(
    courseId: string,
    search?: string,
    filterStatus?: string,
    page: number = 1,
    limit: number = 6
  ): Promise<AssignmentPaginationResult> {
    const supabase = createClient();

    let query = supabase
      .from("assignments")
      .select("*", { count: "exact" })
      .eq("course_id", courseId);

    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sort by created_at descending
    query = query.order("created_at", { ascending: false });

    // Pagination bounds
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const items = (data || []).map((a: any) => ({
      id: a.id,
      courseId: a.course_id,
      title: a.title,
      description: a.description || "",
      fileUrl: a.file_url || "",
      dueDate: a.due_date || null,
      // TODO: Add status column to public.assignments table in future database migration
      status: "published" as const,
      createdAt: a.created_at,
    }));

    const total = count || 0;
    const pages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      pages,
    };
  }

  async createAssignment(
    courseId: string,
    assignmentData: Omit<AssignmentItem, "id" | "courseId" | "createdAt">
  ): Promise<AssignmentItem> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("assignments")
      .insert({
        course_id: courseId,
        title: assignmentData.title,
        description: assignmentData.description,
        file_url: assignmentData.fileUrl,
        due_date: assignmentData.dueDate,
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to create assignment in database");
    }

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description || "",
      fileUrl: data.file_url || "",
      dueDate: data.due_date || null,
      status: "published",
      createdAt: data.created_at,
    };
  }

  async updateAssignment(
    assignmentId: string,
    updates: Partial<AssignmentItem>
  ): Promise<AssignmentItem> {
    const supabase = createClient();

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.fileUrl !== undefined) dbUpdates.file_url = updates.fileUrl;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

    const { data, error } = await supabase
      .from("assignments")
      .update(dbUpdates)
      .eq("id", assignmentId)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to update assignment in database");
    }

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description || "",
      fileUrl: data.file_url || "",
      dueDate: data.due_date || null,
      status: "published",
      createdAt: data.created_at,
    };
  }

  async deleteAssignment(assignmentId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) throw error;
    return true;
  }

  async getSubmissions(tutorId: string): Promise<AssignmentSubmissionItem[]> {
    const supabase = createClient();

    // 1. Fetch all course IDs for the tutor
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("tutor_id", tutorId);

    if (coursesError) throw coursesError;
    if (!coursesData || coursesData.length === 0) return [];

    const courseIds = coursesData.map((c: any) => c.id);
    const courseTitleMap = new Map<string, string>(coursesData.map((c: any) => [c.id, c.title]));

    // 2. Fetch all assignments for those courses
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from("assignments")
      .select("id, title, course_id")
      .in("course_id", courseIds);

    if (assignmentsError) throw assignmentsError;
    if (!assignmentsData || assignmentsData.length === 0) return [];

    const assignmentIds = assignmentsData.map((a: any) => a.id);
    const assignmentTitleMap = new Map<string, string>(assignmentsData.map((a: any) => [a.id, a.title]));
    const assignmentCourseMap = new Map<string, string>(assignmentsData.map((a: any) => [a.id, a.course_id]));

    // 3. Fetch submissions for those assignments
    const { data: subsData, error: subsError } = await supabase
      .from("assignment_submissions")
      .select("*")
      .in("assignment_id", assignmentIds);

    if (subsError) throw subsError;
    if (!subsData || subsData.length === 0) return [];

    // 4. Fetch profiles of students who submitted
    const studentIds = Array.from(new Set(subsData.map((s: any) => s.student_id)));
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds);

    if (profilesError) throw profilesError;

    const studentProfileMap = new Map<string, { name: string; email: string }>(
      (profilesData || []).map((p: any) => [p.id, { name: p.full_name, email: p.email }])
    );

    // 5. Assemble submission items
    return subsData.map((s: any) => {
      const courseId = assignmentCourseMap.get(s.assignment_id) || "";
      const courseTitle = courseTitleMap.get(courseId) || "Unknown Course";
      const assignmentTitle = assignmentTitleMap.get(s.assignment_id) || "Unknown Assignment";
      const profile = studentProfileMap.get(s.student_id);

      return {
        id: s.id,
        assignmentId: s.assignment_id,
        studentId: s.student_id,
        studentName: profile?.name || "Unknown Student",
        studentEmail: profile?.email || "",
        assignmentTitle,
        courseTitle,
        content: s.content || "",
        fileUrl: s.file_url || "",
        grade: s.grade || "",
        feedback: s.feedback || "",
        createdAt: s.created_at,
      };
    });
  }

  async gradeSubmission(
    submissionId: string,
    grade: string,
    feedback: string
  ): Promise<AssignmentSubmissionItem> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("assignment_submissions")
      .update({
        grade,
        feedback,
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to update grade in database");
    }

    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      content: data.content || "",
      fileUrl: data.file_url || "",
      grade: data.grade || "",
      feedback: data.feedback || "",
      createdAt: data.created_at,
    };
  }
}
