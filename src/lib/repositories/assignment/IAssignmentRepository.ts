// src/lib/repositories/assignment/IAssignmentRepository.ts

import { Assignment, AssignmentSubmission } from "../../types/assignment";

export interface IAssignmentRepository {
  getAssignmentsByStudent(studentId: string): Promise<Assignment[]>;
  getAssignmentById(id: string): Promise<Assignment | null>;
  getSubmissionsByStudent(studentId: string): Promise<AssignmentSubmission[]>;
  getSubmission(studentId: string, assignmentId: string): Promise<AssignmentSubmission | null>;
  submitAssignment(
    studentId: string,
    assignmentId: string,
    submissionUrl: string,
    submissionType: "file" | "url" | "text"
  ): Promise<AssignmentSubmission>;
}
