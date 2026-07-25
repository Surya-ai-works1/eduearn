// src/lib/services/quizManagementService.ts

import { QuizManagementRepository } from "../repositories/quizManagement";
import { QuizItem, QuizAttemptItem, QuizPaginationResult, QuizQuestion } from "../types/quizManagement";

export class QuizManagementService {
  async getQuizzes(
    courseId: string,
    search?: string,
    filterStatus?: string,
    page?: number,
    limit?: number
  ): Promise<QuizPaginationResult> {
    return QuizManagementRepository.getQuizzes(courseId, search, filterStatus, page, limit);
  }

  async createQuiz(
    courseId: string,
    quizData: Omit<QuizItem, "id" | "courseId" | "createdAt">
  ): Promise<QuizItem> {
    this.validateQuiz(quizData);
    return QuizManagementRepository.createQuiz(courseId, quizData);
  }

  async updateQuiz(
    quizId: string,
    updates: Partial<QuizItem>
  ): Promise<QuizItem> {
    this.validateQuizPartial(updates);
    return QuizManagementRepository.updateQuiz(quizId, updates);
  }

  async deleteQuiz(quizId: string): Promise<boolean> {
    return QuizManagementRepository.deleteQuiz(quizId);
  }

  async getAttempts(tutorId: string): Promise<QuizAttemptItem[]> {
    if (!tutorId) throw new Error("Tutor ID is required to fetch quiz attempts");
    return QuizManagementRepository.getAttempts(tutorId);
  }

  private validateQuiz(q: Omit<QuizItem, "id" | "courseId" | "createdAt">) {
    if (!q.title || !q.title.trim()) {
      throw new Error("Quiz title is required");
    }
    if (q.passingScore === undefined || q.passingScore < 0 || q.passingScore > 100) {
      throw new Error("Passing score must be between 0 and 100");
    }
    if (q.timeLimit !== undefined && q.timeLimit <= 0) {
      throw new Error("Time limit must be a positive number of minutes");
    }
    if (q.questions) {
      q.questions.forEach((question, idx) => this.validateQuestion(question, idx));
    }
  }

  private validateQuizPartial(q: Partial<QuizItem>) {
    if (q.title !== undefined && (!q.title || !q.title.trim())) {
      throw new Error("Quiz title is required");
    }
    if (q.passingScore !== undefined && (q.passingScore < 0 || q.passingScore > 100)) {
      throw new Error("Passing score must be between 0 and 100");
    }
    if (q.timeLimit !== undefined && q.timeLimit <= 0) {
      throw new Error("Time limit must be a positive number of minutes");
    }
    if (q.questions !== undefined) {
      q.questions.forEach((question, idx) => this.validateQuestion(question, idx));
    }
  }

  private validateQuestion(question: QuizQuestion, index: number) {
    if (!question.text || !question.text.trim()) {
      throw new Error(`Question #${index + 1} text is required`);
    }
    if (!question.options || question.options.length < 2) {
      throw new Error(`Question #${index + 1} must have at least 2 options`);
    }
    question.options.forEach((opt, oIdx) => {
      if (!opt || !opt.trim()) {
        throw new Error(`Option #${oIdx + 1} of question #${index + 1} cannot be empty`);
      }
    });
    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      throw new Error(`Question #${index + 1} must have at least 1 correct answer`);
    }
    question.correctAnswers.forEach((ansIdx) => {
      if (ansIdx < 0 || ansIdx >= question.options.length) {
        throw new Error(`Correct answer index ${ansIdx} in question #${index + 1} is out of bounds`);
      }
    });
    if (question.type === "single" && question.correctAnswers.length > 1) {
      throw new Error(`Question #${index + 1} is marked as single choice but has multiple correct answers`);
    }
  }
}

export const quizManagementService = new QuizManagementService();
