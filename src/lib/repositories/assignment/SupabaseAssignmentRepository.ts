// src/lib/repositories/assignment/SupabaseAssignmentRepository.ts

import { IAssignmentRepository } from "./IAssignmentRepository";
import { Assignment, AssignmentSubmission } from "../../types/assignment";
import { createClient } from "../../supabase";

export class SupabaseAssignmentRepository implements IAssignmentRepository {
  async getAssignmentsByStudent(studentId: string): Promise<Assignment[]> {
    const supabase = createClient();

    // 1. Fetch enrolled course IDs
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("learner_id", studentId);

    if (enrollError) throw enrollError;
    if (!enrollments || enrollments.length === 0) return [];

    const courseIds = enrollments.map((e: any) => e.course_id);

    // 2. Fetch assignments matching these courses
    const { data: assignments, error: asgError } = await supabase
      .from("assignments")
      .select("*, courses(title)")
      .in("course_id", courseIds);

    if (asgError) throw asgError;
    if (!assignments) return [];

    return assignments.map((item: any) => ({
      id: item.id,
      courseId: item.course_id,
      courseTitle: item.courses?.title || "Enrolled Course",
      title: item.title,
      description: item.description || "",
      dueDate: item.due_date,
      maxMarks: item.max_marks || 100,
      attachments: item.file_url ? [item.file_url] : [],
      createdAt: item.created_at,
    }));
  }

  async getAssignmentById(id: string): Promise<Assignment | null> {
    const supabase = createClient();
    const { data: item, error } = await supabase
      .from("assignments")
      .select("*, courses(title)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!item) return null;

    return {
      id: item.id,
      courseId: item.course_id,
      courseTitle: item.courses?.title || "Enrolled Course",
      title: item.title,
      description: item.description || "",
      dueDate: item.due_date,
      maxMarks: item.max_marks || 100,
      attachments: item.file_url ? [item.file_url] : [],
      createdAt: item.created_at,
    };
  }

  async getSubmissionsByStudent(studentId: string): Promise<AssignmentSubmission[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("student_id", studentId);

    if (error) throw error;
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      assignmentId: item.assignment_id,
      studentId: item.student_id,
      submittedAt: item.created_at,
      submissionType: (item.submission_type || "file") as "file" | "url" | "text",
      submissionUrl: item.file_url || item.content || "",
      status: item.grade ? "Graded" : "Submitted",
      grade: item.grade,
      feedback: item.feedback,
    }));
  }

  async getSubmission(studentId: string, assignmentId: string): Promise<AssignmentSubmission | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("student_id", studentId)
      .eq("assignment_id", assignmentId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      submittedAt: data.created_at,
      submissionType: (data.submission_type || "file") as "file" | "url" | "text",
      submissionUrl: data.file_url || data.content || "",
      status: data.grade ? "Graded" : "Submitted",
      grade: data.grade,
      feedback: data.feedback,
    };
  }

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    submissionUrl: string,
    submissionType: "file" | "url" | "text"
  ): Promise<AssignmentSubmission> {
    const supabase = createClient();

    const subData = {
      assignment_id: assignmentId,
      student_id: studentId,
      content: submissionType === "text" ? submissionUrl : "",
      file_url: submissionType !== "text" ? submissionUrl : "",
      submission_type: submissionType,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("assignment_submissions")
      .upsert(subData, { onConflict: "assignment_id,student_id" })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      submittedAt: data.created_at,
      submissionType: (data.submission_type || "file") as "file" | "url" | "text",
      submissionUrl: data.file_url || data.content || "",
      status: data.grade ? "Graded" : "Submitted",
      grade: data.grade,
      feedback: data.feedback,
    };
  }
}
