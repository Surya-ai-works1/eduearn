// ─── SHARED TYPES FOR TUTOR PANEL ────────────────────────────────────────────

export interface TutorCourse {
  id: string;
  title: string;
  category: string;
  price: number;
  level: string;
  duration: string;
  studentsCount: number;
  rating: number;
  status: "published" | "draft" | "archived" | "pending" | "completed";
  thumbnail?: string;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  type: "Video" | "PDF" | "Quiz" | "Assignment";
  duration: string;
  preview: boolean;
}

export interface CurriculumModule {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
}

export interface MediaFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface StudentProgress {
  id: string;
  name: string;
  courseTitle: string;
  progress: number;
  assignmentStatus: "Pending" | "Submitted" | "Graded";
  submittedFile?: string;
  grade?: string;
  feedback?: string;
  attendance: number;
  quizScore: string;
  certificateEarned: boolean;
}

export interface LiveSession {
  id: string;
  title: string;
  time: string;
  countdown: string;
  meetingLink: string;
  platform: "Google Meet" | "Zoom" | "Microsoft Teams";
  password?: string;
  recordingUrl?: string;
  attachments?: string;
  notes?: string;
  studentsCount?: number;
  attendanceCount?: number;
  status?: "Scheduled" | "Completed" | "Cancelled" | "Live Now";
  course?: string;
  batch?: string;
  duration?: string;
  maxParticipants?: number;
  waitingRoom?: boolean;
  recordingEnabled?: boolean;
  attendanceTrackingEnabled?: boolean;
  instructor?: string;
  description?: string;
  endTime?: string;
  timezone?: string;
  recordingViews?: number;
}

export interface Review {
  id: string;
  courseTitle: string;
  authorName: string;
  rating: number;
  comment: string;
  reply?: string;
}

export interface EarningsBalance {
  total: number;
  available: number;
  pending: number;
  withdrawn: number;
  commission: number;
}
