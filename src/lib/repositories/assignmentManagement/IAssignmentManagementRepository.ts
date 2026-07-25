// src/lib/repositories/assignmentManagement/IAssignmentManagementRepository.ts

import { AssignmentItem, AssignmentSubmissionItem, AssignmentPaginationResult } from "../../types/assignmentManagement";

export interface IAssignmentManagementRepository {
  getAssignments(
    courseId: string,
    search?: string,
    filterStatus?: string,
    page?: number,
    limit?: number
  ): Promise<AssignmentPaginationResult>;

  createAssignment(
    courseId: string,
    assignmentData: Omit<AssignmentItem, "id" | "courseId" | "createdAt">
  ): Promise<AssignmentItem>;

  updateAssignment(
    assignmentId: string,
    updates: Partial<AssignmentItem>
  ): Promise<AssignmentItem>;

  deleteAssignment(assignmentId: string): Promise<boolean>;

  getSubmissions(tutorId: string): Promise<AssignmentSubmissionItem[]>;

  gradeSubmission(
    submissionId: string,
    grade: string,
    feedback: string
  ): Promise<AssignmentSubmissionItem>;
}
