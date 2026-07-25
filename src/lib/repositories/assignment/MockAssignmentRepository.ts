// src/lib/repositories/assignment/MockAssignmentRepository.ts

import { IAssignmentRepository } from "./IAssignmentRepository";
import { Assignment, AssignmentSubmission } from "../../types/assignment";

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-python-1",
    courseId: "course-python",
    courseTitle: "Python Programming Masterclass",
    title: "Build a Web Crawler",
    description: "Write a crawler that fetches headings from a news website and outputs them in JSON format.",
    dueDate: "2026-08-10",
    maxMarks: 100,
    attachments: ["https://example.com/crawler-guidelines.pdf"],
    createdAt: "2026-07-20T10:00:00Z"
  },
  {
    id: "asg-figma-1",
    courseId: "course-keyboard",
    courseTitle: "UI/UX Figma Design: Layouts & Grids Essentials",
    title: "Create Figma Navigation Sidebar",
    description: "Design a clean, glassmorphic layout for a sidebar navigation component in Figma.",
    dueDate: "2026-08-15",
    maxMarks: 100,
    createdAt: "2026-07-21T10:00:00Z"
  },
  {
    id: "asg-ai-1",
    courseId: "course-prompt",
    courseTitle: "AI & Prompt Engineering Basics",
    title: "AI Prompt Engineering Basics Homework",
    description: "Complete the prompt engineering tasks in the PDF and submit your answers.",
    dueDate: "2026-08-20",
    maxMarks: 100,
    createdAt: "2026-07-22T10:00:00Z"
  }
];

export class MockAssignmentRepository implements IAssignmentRepository {
  private getLocalEnrollmentCourseIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("eduearn_enrollments");
      if (saved) {
        const list = JSON.parse(saved);
        return list.map((e: any) => e.courseId);
      }
    } catch {}
    // Default to all mock courses if no enrollment is found to keep fallback safe
    return ["course-python", "course-keyboard", "course-prompt"];
  }

  private getLocalSubmissions(): AssignmentSubmission[] {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("eduearn_assignment_submissions");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }

  private saveLocalSubmissions(submissions: AssignmentSubmission[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_assignment_submissions", JSON.stringify(submissions));
  }

  async getAssignmentsByStudent(_studentId: string): Promise<Assignment[]> {
    const enrolledIds = this.getLocalEnrollmentCourseIds();
    return MOCK_ASSIGNMENTS.filter((a) => enrolledIds.includes(a.courseId));
  }

  async getAssignmentById(id: string): Promise<Assignment | null> {
    const found = MOCK_ASSIGNMENTS.find((a) => a.id === id);
    return found || null;
  }

  async getSubmissionsByStudent(studentId: string): Promise<AssignmentSubmission[]> {
    const list = this.getLocalSubmissions();
    return list.filter((s) => s.studentId === studentId);
  }

  async getSubmission(studentId: string, assignmentId: string): Promise<AssignmentSubmission | null> {
    const list = this.getLocalSubmissions();
    const found = list.find((s) => s.studentId === studentId && s.assignmentId === assignmentId);
    return found || null;
  }

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    submissionUrl: string,
    submissionType: "file" | "url" | "text"
  ): Promise<AssignmentSubmission> {
    const list = this.getLocalSubmissions();
    const existingIndex = list.findIndex(
      (s) => s.studentId === studentId && s.assignmentId === assignmentId
    );

    const submission: AssignmentSubmission = {
      id: existingIndex >= 0 ? list[existingIndex].id : `sub-${Date.now()}`,
      assignmentId,
      studentId,
      submittedAt: new Date().toISOString(),
      submissionType,
      submissionUrl,
      status: "Submitted",
      grade: existingIndex >= 0 ? list[existingIndex].grade : undefined,
      feedback: existingIndex >= 0 ? list[existingIndex].feedback : undefined,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = submission;
    } else {
      list.push(submission);
    }

    this.saveLocalSubmissions(list);
    return submission;
  }
}
