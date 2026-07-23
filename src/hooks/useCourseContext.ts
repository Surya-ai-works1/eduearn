import { create } from "zustand";

interface CourseContextState {
  courseTitle: string | null;
  courseDescription: string | null;
  lessonTitle: string | null;
  chapter: string | null;
  subject: string | null;
  currentPage: string | null;
  learningContext: string | null;
  activeNoteId: string | null;
  activeNoteTitle: string | null;
  activeNoteContent: string | null;
  activeAiTool: string | null;
  activeQuizTitle: string | null;
  activeAssignmentTitle: string | null;
  tutor: string | null;
  roadmap: string | null;
  difficulty: string | null;
  userLevel: string | null;
  
  setCourseContext: (context: Partial<Omit<CourseContextState, "setCourseContext" | "clearCourseContext">>) => void;
  clearCourseContext: () => void;
}

export const useCourseContext = create<CourseContextState>((set) => ({
  courseTitle: null,
  courseDescription: null,
  lessonTitle: null,
  chapter: null,
  subject: null,
  currentPage: null,
  learningContext: null,
  activeNoteId: null,
  activeNoteTitle: null,
  activeNoteContent: null,
  activeAiTool: null,
  activeQuizTitle: null,
  activeAssignmentTitle: null,
  tutor: null,
  roadmap: null,
  difficulty: null,
  userLevel: null,

  setCourseContext: (context) => set((state) => ({ ...state, ...context })),
  clearCourseContext: () => set({
    courseTitle: null,
    courseDescription: null,
    lessonTitle: null,
    chapter: null,
    subject: null,
    currentPage: null,
    learningContext: null,
    activeNoteId: null,
    activeNoteTitle: null,
    activeNoteContent: null,
    activeAiTool: null,
    activeQuizTitle: null,
    activeAssignmentTitle: null,
    tutor: null,
    roadmap: null,
    difficulty: null,
    userLevel: null,
  }),
}));
