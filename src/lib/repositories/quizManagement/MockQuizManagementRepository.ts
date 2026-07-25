// src/lib/repositories/quizManagement/MockQuizManagementRepository.ts

import { IQuizManagementRepository } from "./IQuizManagementRepository";
import { QuizItem, QuizAttemptItem, QuizPaginationResult } from "../../types/quizManagement";

const STORAGE_KEY_QUIZZES = "eduearn_mock_quizzes";
const STORAGE_KEY_ATTEMPTS = "eduearn_mock_quiz_attempts";

const DEFAULT_QUIZZES: QuizItem[] = [
  {
    id: "quiz-1",
    courseId: "course-t1",
    title: "Calculus Basic Fundamentals",
    description: "Test your understanding of derivative properties and chain rules.",
    passingScore: 60,
    timeLimit: 20,
    status: "published",
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: "q-1",
        text: "What is the derivative of x^2?",
        type: "single",
        options: ["x", "2x", "2", "x^2"],
        correctAnswers: [1],
        explanation: "Using the power rule, the derivative of x^n is n*x^(n-1).",
      },
      {
        id: "q-2",
        text: "Which of the following are calculus operations?",
        type: "multiple",
        options: ["Differentiation", "Addition", "Integration", "Multiplication"],
        correctAnswers: [0, 2],
        explanation: "Differentiation and Integration are the two main branches of calculus.",
      },
    ],
  },
];

const DEFAULT_ATTEMPTS: QuizAttemptItem[] = [
  {
    id: "attempt-1",
    quizId: "quiz-1",
    quizTitle: "Calculus Basic Fundamentals",
    courseTitle: "Introduction to Calculus & Geometry Applications",
    studentId: "student-1",
    studentName: "Rahul Verma",
    studentEmail: "rahul@eduearn.com",
    score: 80,
    passed: true,
    completedAt: new Date().toISOString(),
  },
];

export class MockQuizManagementRepository implements IQuizManagementRepository {
  private getLocalQuizzes(): QuizItem[] {
    if (typeof window === "undefined") return DEFAULT_QUIZZES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUIZZES);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
    return DEFAULT_QUIZZES;
  }

  private saveLocalQuizzes(items: QuizItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(items));
  }

  private getLocalAttempts(): QuizAttemptItem[] {
    if (typeof window === "undefined") return DEFAULT_ATTEMPTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(DEFAULT_ATTEMPTS));
    return DEFAULT_ATTEMPTS;
  }

  private saveLocalAttempts(items: QuizAttemptItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(items));
  }

  async getQuizzes(
    courseId: string,
    search?: string,
    filterStatus?: string,
    page: number = 1,
    limit: number = 6
  ): Promise<QuizPaginationResult> {
    let list = this.getLocalQuizzes().filter((q) => q.courseId === courseId);

    if (search && search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((q) => q.title.toLowerCase().includes(query) || q.description.toLowerCase().includes(query));
    }

    if (filterStatus && filterStatus !== "all") {
      list = list.filter((q) => q.status === filterStatus);
    }

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

  async createQuiz(
    courseId: string,
    quizData: Omit<QuizItem, "id" | "courseId" | "createdAt">
  ): Promise<QuizItem> {
    const newItem: QuizItem = {
      ...quizData,
      id: `quiz-${Date.now()}`,
      courseId,
      createdAt: new Date().toISOString(),
    };
    const list = this.getLocalQuizzes();
    list.push(newItem);
    this.saveLocalQuizzes(list);
    return newItem;
  }

  async updateQuiz(
    quizId: string,
    updates: Partial<QuizItem>
  ): Promise<QuizItem> {
    const list = this.getLocalQuizzes();
    const idx = list.findIndex((q) => q.id === quizId);
    if (idx === -1) {
      throw new Error("Quiz not found");
    }
    const updated: QuizItem = {
      ...list[idx],
      ...updates,
    };
    list[idx] = updated;
    this.saveLocalQuizzes(list);
    return updated;
  }

  async deleteQuiz(quizId: string): Promise<boolean> {
    const list = this.getLocalQuizzes();
    const filtered = list.filter((q) => q.id !== quizId);
    this.saveLocalQuizzes(filtered);
    return true;
  }

  async getAttempts(tutorId: string): Promise<QuizAttemptItem[]> {
    return this.getLocalAttempts();
  }
}
