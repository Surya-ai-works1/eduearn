// src/lib/types/quiz.ts

export interface Question {
  id: string;
  quizId: string;
  type: "single" | "multiple";
  question: string;
  options: string[];
  correctAnswer: number | number[]; // index or indices (e.g. 0, or [0, 2])
  marks: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseTitle?: string;
  title: string;
  description?: string;
  duration: number; // minutes
  totalQuestions: number;
  passingScore: number; // percentage, e.g. 60
  questions: Question[];
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  startedAt: string; // ISO date
  submittedAt?: string; // ISO date
  answers: Record<string, number | number[]>; // questionId -> selected index/indices
  score: number; // earned marks
  percentage: number; // score percentage, e.g. 80
  status: "Not Started" | "In Progress" | "Submitted";
  passed?: boolean;
}
