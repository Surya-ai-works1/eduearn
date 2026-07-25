// src/lib/services/assignmentService.ts

import { AssignmentRepository } from "../repositories/assignment";
import { Assignment, AssignmentSubmission } from "../types/assignment";

export class AssignmentService {
  async getStudentAssignments(studentId: string): Promise<(Assignment & { submission?: AssignmentSubmission })[]> {
    const [assignments, submissions] = await Promise.all([
      AssignmentRepository.getAssignmentsByStudent(studentId),
      AssignmentRepository.getSubmissionsByStudent(studentId)
    ]);

    return assignments.map((assign) => {
      const sub = submissions.find((s) => s.assignmentId === assign.id);
      return {
        ...assign,
        submission: sub || undefined
      };
    });
  }

  async getAssignmentDetails(id: string): Promise<Assignment | null> {
    return AssignmentRepository.getAssignmentById(id);
  }

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    submissionUrl: string,
    submissionType: "file" | "url" | "text"
  ): Promise<AssignmentSubmission> {
    if (!studentId || !assignmentId || !submissionUrl) {
      throw new Error("Missing required submission fields.");
    }

    const submission = await AssignmentRepository.submitAssignment(
      studentId,
      assignmentId,
      submissionUrl,
      submissionType
    );

    // Trigger assignment submission confirmation email asynchronously
    (async () => {
      try {
        const { createClient } = await import("../supabase");
        const supabase = createClient();
        const [profileRes, assignment] = await Promise.all([
          supabase.from("profiles").select("email, full_name").eq("id", studentId).maybeSingle(),
          AssignmentRepository.getAssignmentById(assignmentId)
        ]);

        const profile = profileRes?.data;
        if (profile?.email && assignment?.title) {
          const { emailClient } = await import("../email/client");
          await emailClient.triggerAssignmentSubmissionEmail(
            profile.email,
            profile.full_name || "Student",
            assignment.title
          );
        }
      } catch (err) {
        console.warn("Failed to trigger assignment submission email:", err);
      }
    })();

    return submission;
  }
}

export const assignmentService = new AssignmentService();
