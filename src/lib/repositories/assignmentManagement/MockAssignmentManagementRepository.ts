// src/lib/repositories/assignmentManagement/MockAssignmentManagementRepository.ts

import { IAssignmentManagementRepository } from "./IAssignmentManagementRepository";
import { AssignmentItem, AssignmentSubmissionItem, AssignmentPaginationResult } from "../../types/assignmentManagement";

const STORAGE_KEY_ASSIGNMENTS = "eduearn_mock_assignments";
const STORAGE_KEY_SUBMISSIONS = "eduearn_mock_assignment_submissions";

const DEFAULT_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "assign-1",
    courseId: "course-t1",
    title: "Derivatives Practice Set 1",
    description: "Solve all problems from section 4.2 in the Mathematics textbook.",
    fileUrl: "https://example.com/math-problems.pdf",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "published",
    createdAt: new Date().toISOString(),
  },
  {
    id: "assign-2",
    courseId: "course-t2",
    title: "Figma Grid Layout Assignment",
    description: "Design a clean desktop responsive layout using a 12-column grid system.",
    fileUrl: "",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "published",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SUBMISSIONS: AssignmentSubmissionItem[] = [
  {
    id: "sub-1",
    assignmentId: "assign-1",
    studentId: "student-1",
    studentName: "Rahul Verma",
    studentEmail: "rahul@eduearn.com",
    assignmentTitle: "Derivatives Practice Set 1",
    courseTitle: "Introduction to Calculus & Geometry Applications",
    content: "Here is my completed work for calculus derivatives.",
    fileUrl: "calculus_homework.pdf",
    grade: "",
    feedback: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sub-2",
    assignmentId: "assign-2",
    studentId: "student-2",
    studentName: "Pooja Sharma",
    studentEmail: "pooja@eduearn.com",
    assignmentTitle: "Figma Grid Layout Assignment",
    courseTitle: "Syllabus Clearance Quiz Overview",
    content: "Grid assignment submission. Shared Figma link.",
    fileUrl: "figma_submission_link.txt",
    grade: "A",
    feedback: "Excellent layout precision and constraints setup!",
    createdAt: new Date().toISOString(),
  },
];

export class MockAssignmentManagementRepository implements IAssignmentManagementRepository {
  private getLocalAssignments(): AssignmentItem[] {
    if (typeof window === "undefined") return DEFAULT_ASSIGNMENTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(DEFAULT_ASSIGNMENTS));
    return DEFAULT_ASSIGNMENTS;
  }

  private saveLocalAssignments(items: AssignmentItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(items));
  }

  private getLocalSubmissions(): AssignmentSubmissionItem[] {
    if (typeof window === "undefined") return DEFAULT_SUBMISSIONS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
    return DEFAULT_SUBMISSIONS;
  }

  private saveLocalSubmissions(items: AssignmentSubmissionItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(items));
  }

  async getAssignments(
    courseId: string,
    search?: string,
    filterStatus?: string,
    page: number = 1,
    limit: number = 6
  ): Promise<AssignmentPaginationResult> {
    let list = this.getLocalAssignments().filter((a) => a.courseId === courseId);

    if (search && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }

    if (filterStatus && filterStatus !== "all") {
      list = list.filter((a) => a.status === filterStatus);
    }

    // Sort by created date descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);
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
    const newItem: AssignmentItem = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
      courseId,
      createdAt: new Date().toISOString(),
    };
    const list = this.getLocalAssignments();
    list.push(newItem);
    this.saveLocalAssignments(list);
    return newItem;
  }

  async updateAssignment(
    assignmentId: string,
    updates: Partial<AssignmentItem>
  ): Promise<AssignmentItem> {
    const list = this.getLocalAssignments();
    const idx = list.findIndex((a) => a.id === assignmentId);
    if (idx === -1) {
      throw new Error("Assignment not found");
    }
    const updated: AssignmentItem = {
      ...list[idx],
      ...updates,
    };
    list[idx] = updated;
    this.saveLocalAssignments(list);
    return updated;
  }

  async deleteAssignment(assignmentId: string): Promise<boolean> {
    const list = this.getLocalAssignments();
    const filtered = list.filter((a) => a.id !== assignmentId);
    this.saveLocalAssignments(filtered);
    return true;
  }

  async getSubmissions(tutorId: string): Promise<AssignmentSubmissionItem[]> {
    // Return mock submissions. Filter in service layer or return all for mock tutor
    return this.getLocalSubmissions();
  }

  async gradeSubmission(
    submissionId: string,
    grade: string,
    feedback: string
  ): Promise<AssignmentSubmissionItem> {
    const list = this.getLocalSubmissions();
    const idx = list.findIndex((s) => s.id === submissionId);
    if (idx === -1) {
      throw new Error("Submission not found");
    }
    list[idx].grade = grade;
    list[idx].feedback = feedback;
    this.saveLocalSubmissions(list);
    return list[idx];
  }
}
