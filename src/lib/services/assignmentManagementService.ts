// src/lib/services/assignmentManagementService.ts

import { AssignmentManagementRepository } from "../repositories/assignmentManagement";
import { AssignmentItem, AssignmentSubmissionItem, AssignmentPaginationResult } from "../types/assignmentManagement";

export class AssignmentManagementService {
  async getAssignments(
    courseId: string,
    search?: string,
    filterStatus?: string,
    page?: number,
    limit?: number
  ): Promise<AssignmentPaginationResult> {
    return AssignmentManagementRepository.getAssignments(courseId, search, filterStatus, page, limit);
  }

  async createAssignment(
    courseId: string,
    assignmentData: Omit<AssignmentItem, "id" | "courseId" | "createdAt">
  ): Promise<AssignmentItem> {
    this.validateAssignment(assignmentData);
    return AssignmentManagementRepository.createAssignment(courseId, assignmentData);
  }

  async updateAssignment(
    assignmentId: string,
    updates: Partial<AssignmentItem>
  ): Promise<AssignmentItem> {
    this.validateAssignmentPartial(updates);
    return AssignmentManagementRepository.updateAssignment(assignmentId, updates);
  }

  async deleteAssignment(assignmentId: string): Promise<boolean> {
    return AssignmentManagementRepository.deleteAssignment(assignmentId);
  }

  async getSubmissions(tutorId: string): Promise<AssignmentSubmissionItem[]> {
    if (!tutorId) throw new Error("Tutor ID is required to load submissions");
    return AssignmentManagementRepository.getSubmissions(tutorId);
  }

  async gradeSubmission(
    submissionId: string,
    grade: string,
    feedback: string
  ): Promise<AssignmentSubmissionItem> {
    if (!submissionId) throw new Error("Submission ID is required");
    if (!grade || !grade.trim()) throw new Error("Grade is required");
    if (!feedback || !feedback.trim()) throw new Error("Feedback is required");

    return AssignmentManagementRepository.gradeSubmission(submissionId, grade, feedback);
  }

  private validateAssignment(a: Omit<AssignmentItem, "id" | "courseId" | "createdAt">) {
    if (!a.title || !a.title.trim()) {
      throw new Error("Assignment title is required");
    }
    if (a.dueDate) {
      const d = new Date(a.dueDate);
      if (isNaN(d.getTime())) {
        throw new Error("Due date must be a valid date string");
      }
    }
    const allowedStatuses = ["published", "draft"];
    if (a.status && !allowedStatuses.includes(a.status)) {
      throw new Error("Invalid assignment status");
    }
  }

  private validateAssignmentPartial(a: Partial<AssignmentItem>) {
    if (a.title !== undefined && (!a.title || !a.title.trim())) {
      throw new Error("Assignment title is required");
    }
    if (a.dueDate !== undefined && a.dueDate) {
      const d = new Date(a.dueDate);
      if (isNaN(d.getTime())) {
        throw new Error("Due date must be a valid date string");
      }
    }
    if (a.status !== undefined) {
      const allowedStatuses = ["published", "draft"];
      if (!allowedStatuses.includes(a.status)) {
        throw new Error("Invalid assignment status");
      }
    }
  }
}

export const assignmentManagementService = new AssignmentManagementService();
