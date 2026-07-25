// src/lib/repositories/quiz/MockQuizRepository.ts

import { IQuizRepository } from "./IQuizRepository";
import { Quiz, QuizAttempt } from "../../types/quiz";

const MOCK_QUIZZES: Quiz[] = [
  {
    id: "wq-python",
    courseId: "course-python",
    courseTitle: "Python Programming Masterclass",
    title: "Python Control Flow & Loops",
    description: "Test your knowledge of Python conditionals, while/for loops, and list comprehensions.",
    duration: 5,
    totalQuestions: 3,
    passingScore: 60,
    questions: [
      {
        id: "q-py-1",
        quizId: "wq-python",
        type: "single",
        question: "Which keyword is used to loop over a sequence (list, tuple, string) in Python?",
        options: ["for", "while", "loop", "foreach"],
        correctAnswer: 0,
        marks: 10
      },
      {
        id: "q-py-2",
        quizId: "wq-python",
        type: "single",
        question: "How do you break out of a loop prematurely in Python?",
        options: ["exit", "break", "stop", "return"],
        correctAnswer: 1,
        marks: 10
      },
      {
        id: "q-py-3",
        quizId: "wq-python",
        type: "multiple",
        question: "Which of the following are valid loop constructs natively supported in Python? (Select all that apply)",
        options: ["do-while loops", "for loops", "while loops", "until loops"],
        correctAnswer: [1, 2],
        marks: 10
      }
    ]
  },
  {
    id: "wq-photo",
    courseId: "course-keyboard",
    courseTitle: "UI/UX Figma Design: Layouts & Grids Essentials",
    title: "Figma Autolayout and responsive grids",
    description: "Test your understanding of Figma autolayout properties, wrapping, and grid settings.",
    duration: 5,
    totalQuestions: 2,
    passingScore: 50,
    questions: [
      {
        id: "q-fig-1",
        quizId: "wq-photo",
        type: "single",
        question: "Which property in Figma autolayout controls the spacing between items?",
        options: ["Padding", "Gap", "Margin", "Alignment"],
        correctAnswer: 1,
        marks: 10
      },
      {
        id: "q-fig-2",
        quizId: "wq-photo",
        type: "single",
        question: "To make an autolayout container expand vertically based on content, which resizing option should you set?",
        options: ["Fixed height", "Fill container", "Hug contents", "Wrap"],
        correctAnswer: 2,
        marks: 10
      }
    ]
  },
  {
    id: "wq-ai",
    courseId: "course-prompt",
    courseTitle: "AI & Prompt Engineering Basics",
    title: "AI Prompt Engineering Basics Homework",
    description: "A short quiz covering prompt patterns, zero-shot/few-shot prompts, and system instructions.",
    duration: 5,
    totalQuestions: 2,
    passingScore: 60,
    questions: [
      {
        id: "q-ai-1",
        quizId: "wq-ai",
        type: "single",
        question: "What is zero-shot prompting?",
        options: [
          "Providing no examples to the model",
          "Providing one example to the model",
          "Providing many examples to the model",
          "Refusing to prompt the model"
        ],
        correctAnswer: 0,
        marks: 10
      },
      {
        id: "q-ai-2",
        quizId: "wq-ai",
        type: "single",
        question: "Which prompt pattern is best suited for generating structural data format?",
        options: ["Persona Pattern", "Template Pattern", "Recipe Pattern", "Flipped Interaction Pattern"],
        correctAnswer: 1,
        marks: 10
      }
    ]
  }
];

export class MockQuizRepository implements IQuizRepository {
  private getLocalEnrollmentCourseIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("eduearn_enrollments");
      if (saved) {
        const list = JSON.parse(saved);
        return list.map((e: any) => e.courseId);
      }
    } catch {}
    // Fallback to python, keyboard, and prompt courses
    return ["course-python", "course-keyboard", "course-prompt"];
  }

  private getLocalAttempts(): QuizAttempt[] {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("eduearn_quiz_attempts");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }

  private saveLocalAttempts(attempts: QuizAttempt[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_quiz_attempts", JSON.stringify(attempts));
  }

  async getQuizzesByStudent(_studentId: string): Promise<Quiz[]> {
    const enrolledIds = this.getLocalEnrollmentCourseIds();
    return MOCK_QUIZZES.filter((q) => enrolledIds.includes(q.courseId));
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const found = MOCK_QUIZZES.find((q) => q.id === id);
    return found || null;
  }

  async getAttemptsByStudent(studentId: string): Promise<QuizAttempt[]> {
    const list = this.getLocalAttempts();
    return list.filter((a) => a.studentId === studentId);
  }

  async getAttempt(studentId: string, quizId: string): Promise<QuizAttempt | null> {
    const list = this.getLocalAttempts();
    // Return latest attempt
    const found = list
      .filter((a) => a.studentId === studentId && a.quizId === quizId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return found[0] || null;
  }

  async saveAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
    const list = this.getLocalAttempts();
    const existingIdx = list.findIndex((a) => a.id === attempt.id);

    if (existingIdx >= 0) {
      list[existingIdx] = attempt;
    } else {
      list.push(attempt);
    }

    this.saveLocalAttempts(list);
    return attempt;
  }
}
