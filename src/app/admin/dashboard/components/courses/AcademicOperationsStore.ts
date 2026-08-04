"use client";

// Shared Academic Operations Store Types
export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  tutorId: string;
  tutorName: string;
  price: number;
  status: "Draft" | "Under Review" | "Approved" | "Published" | "Scheduled" | "Archived" | "Rejected" | "Expired";
  healthScore: number;
  version: string;
  publishDate?: string;
  dependencies: string[]; // List of course codes
  completionRate: number; // calculated average
  revenue: number;
  revisionTimeline: { date: string; actor: string; change: string }[];
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  duration?: string;
  level?: string;
  thumbnailUrl?: string;
  organization?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  courseId: string;
  batch: string;
  mentorName: string;
  progress: number; // 0-100
  certificateIssued: boolean;
}

export interface TutorMetrics {
  tutorId: string;
  tutorName: string;
  teachingHours: number;
  courseCount: number;
  avgRating: number;
  attendanceRate: number;
  avgReviewTime: number; // in hours
  responseTime: number; // in hours
  revenue: number;
  liveClassesCount: number;
  satisfactionRate: number;
  lateReviewsCount: number;
  needsImprovement: boolean;
  topPerformer: boolean;
}

export interface GradeRecord {
  studentId: string;
  courseId: string;
  assignmentScore: number; // max 100
  quizScore: number; // max 100
  projectScore: number; // max 100
  midtermScore: number; // max 100
  finalScore: number; // max 100
  attendanceScore: number; // max 100
  bonusPoints: number;
  penaltyPoints: number;
  overrideScore?: number;
  remarks: string;
  rubricFeedback?: string;
  gradeHistory: { date: string; actor: string; oldGrade: string; newGrade: string; reason: string }[];
}

export interface AttendanceRecord {
  studentId: string;
  courseId: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Excused" | "Holiday";
  type: "Daily" | "Live";
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  category: string; // e.g. Midterm, Final, Quiz
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  maxMarks: number;
  negativeMarking: boolean;
  durationMinutes: number;
  attemptLimit: number;
  examWindowStart: string;
  examWindowEnd: string;
  published: boolean;
}

export interface Question {
  id: string;
  examId: string;
  category: string;
  topic: string;
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  tags: string[];
}

export interface ResourceItem {
  id: string;
  courseId: string;
  name: string;
  type: string; // e.g. pdf, mp4
  sizeBytes: number;
  downloads: number;
}

export interface StudentRiskSummary {
  studentId: string;
  courseId: string;
  attendanceRisk: "Low" | "Medium" | "High";
  assignmentRisk: "Low" | "Medium" | "High";
  examRisk: "Low" | "Medium" | "High";
  dropoutPrediction: "Low" | "Medium" | "High";
  certificateEligibility: boolean;
  interventionHistory: { date: string; notes: string; tutor: string }[];
}

// Initial Seed Data Functions
export const seedCourses = (): Course[] => [
  {
    id: "c-1",
    code: "CS-101",
    title: "Mastering React Native Hooks & Layouts",
    category: "Coding",
    tutorId: "t-1",
    tutorName: "Amit Verma",
    price: 1200,
    status: "Published",
    healthScore: 94,
    version: "v1.2.0",
    dependencies: [],
    completionRate: 85,
    revenue: 24000,
    revisionTimeline: [
      { date: "2026-07-01", actor: "Amit Verma", change: "Initial Draft created" },
      { date: "2026-07-05", actor: "Surya (Admin)", change: "Course Approved & Published" }
    ]
  },
  {
    id: "c-2",
    code: "DN-201",
    title: "Kuchipudi Mudras & Coordination Masterclass",
    category: "Dance",
    tutorId: "t-2",
    tutorName: "Priya Patel",
    price: 1500,
    status: "Published",
    healthScore: 88,
    version: "v1.0.4",
    dependencies: [],
    completionRate: 78,
    revenue: 45000,
    revisionTimeline: [
      { date: "2026-07-10", actor: "Priya Patel", change: "Initial Draft" },
      { date: "2026-07-15", actor: "Surya (Admin)", change: "Approved" }
    ]
  },
  {
    id: "c-3",
    code: "AC-301",
    title: "Double-Entry Accounting & Taxation Basics",
    category: "Academics",
    tutorId: "t-2",
    tutorName: "Priya Patel",
    price: 999,
    status: "Under Review",
    healthScore: 72,
    version: "v0.9.0",
    dependencies: [],
    completionRate: 0,
    revenue: 0,
    revisionTimeline: [
      { date: "2026-07-20", actor: "Priya Patel", change: "Submitted for Review" }
    ]
  }
];

export const seedStudents = (): Student[] => [
  { id: "s-1", name: "Rahul Verma", email: "rahul@eduearn.com", courseId: "c-1", batch: "Batch A", mentorName: "Amit Verma", progress: 92, certificateIssued: false },
  { id: "s-2", name: "Surya K", email: "surya@learner.com", courseId: "c-1", batch: "Batch A", mentorName: "Amit Verma", progress: 45, certificateIssued: false },
  { id: "s-3", name: "Ananya Rao", email: "ananya@eduearn.com", courseId: "c-2", batch: "Batch B", mentorName: "Priya Patel", progress: 100, certificateIssued: true },
  { id: "s-4", name: "Vikram Sen", email: "vikram@eduearn.com", courseId: "c-2", batch: "Batch B", mentorName: "Priya Patel", progress: 15, certificateIssued: false }
];

export const seedTutorMetrics = (): TutorMetrics[] => [
  {
    tutorId: "t-1",
    tutorName: "Amit Verma",
    teachingHours: 120,
    courseCount: 1,
    avgRating: 4.8,
    attendanceRate: 98,
    avgReviewTime: 12,
    responseTime: 4,
    revenue: 19200,
    liveClassesCount: 15,
    satisfactionRate: 96,
    lateReviewsCount: 1,
    needsImprovement: false,
    topPerformer: true
  },
  {
    tutorId: "t-2",
    tutorName: "Priya Patel",
    teachingHours: 240,
    courseCount: 2,
    avgRating: 4.6,
    attendanceRate: 94,
    avgReviewTime: 36,
    responseTime: 18,
    revenue: 36000,
    liveClassesCount: 32,
    satisfactionRate: 92,
    lateReviewsCount: 5,
    needsImprovement: false,
    topPerformer: false
  }
];

export const seedGrades = (): GradeRecord[] => [
  { studentId: "s-1", courseId: "c-1", assignmentScore: 88, quizScore: 92, projectScore: 90, midtermScore: 85, finalScore: 94, attendanceScore: 95, bonusPoints: 2, penaltyPoints: 0, remarks: "Excellent performance throughout", gradeHistory: [] },
  { studentId: "s-2", courseId: "c-1", assignmentScore: 40, quizScore: 50, projectScore: 35, midtermScore: 45, finalScore: 42, attendanceScore: 55, bonusPoints: 0, penaltyPoints: 2, remarks: "Needs to submit pending tasks", gradeHistory: [] },
  { studentId: "s-3", courseId: "c-2", assignmentScore: 95, quizScore: 98, projectScore: 96, midtermScore: 94, finalScore: 98, attendanceScore: 100, bonusPoints: 5, penaltyPoints: 0, remarks: "Perfect marks", gradeHistory: [] },
  { studentId: "s-4", courseId: "c-2", assignmentScore: 20, quizScore: 30, projectScore: 15, midtermScore: 25, finalScore: 22, attendanceScore: 20, bonusPoints: 0, penaltyPoints: 5, remarks: "Critical risk of failing", gradeHistory: [] }
];

export const seedAttendance = (): AttendanceRecord[] => {
  const dates = ["2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31", "2026-08-01"];
  const records: AttendanceRecord[] = [];
  
  // s-1 is mostly present
  dates.forEach(d => {
    records.push({ studentId: "s-1", courseId: "c-1", date: d, status: "Present", type: "Daily" });
  });
  // s-2 is irregular
  dates.forEach((d, idx) => {
    const status: AttendanceRecord["status"] = idx % 2 === 0 ? "Present" : idx === 1 ? "Absent" : "Late";
    records.push({ studentId: "s-2", courseId: "c-1", date: d, status, type: "Daily" });
  });
  // s-3 is perfect present
  dates.forEach(d => {
    records.push({ studentId: "s-3", courseId: "c-2", date: d, status: "Present", type: "Daily" });
  });
  // s-4 is mostly absent
  dates.forEach((d, idx) => {
    const status: AttendanceRecord["status"] = idx === 0 ? "Late" : "Absent";
    records.push({ studentId: "s-4", courseId: "c-2", date: d, status, type: "Daily" });
  });

  return records;
};

export const seedExams = (): Exam[] => [
  { id: "e-1", courseId: "c-1", title: "React Native Hooks Assessment", category: "Quiz", topic: "Hooks", difficulty: "Medium", maxMarks: 100, negativeMarking: true, durationMinutes: 45, attemptLimit: 2, examWindowStart: "2026-07-01", examWindowEnd: "2026-08-31", published: true },
  { id: "e-2", courseId: "c-2", title: "Classical Indian Mudras Exam", category: "Final Exam", topic: "Coordination", difficulty: "Hard", maxMarks: 100, negativeMarking: false, durationMinutes: 120, attemptLimit: 1, examWindowStart: "2026-07-15", examWindowEnd: "2026-08-15", published: true }
];

export const seedQuestions = (): Question[] => [
  { id: "q-1", examId: "e-1", category: "Coding", topic: "Hooks", text: "What is the primary purpose of useEffect cleanup functions?", difficulty: "Medium", marks: 10, tags: ["React", "Hooks"] },
  { id: "q-2", examId: "e-1", category: "Coding", topic: "Hooks", text: "Why must custom React hooks start with the word 'use'?", difficulty: "Easy", marks: 5, tags: ["Naming Rules"] },
  { id: "q-3", examId: "e-2", category: "Dance", topic: "Mudras", text: "Explain the anatomical alignment required for Samyukta Hastas.", difficulty: "Hard", marks: 20, tags: ["Samyukta"] }
];

export const seedResources = (): ResourceItem[] => [
  { id: "res-1", courseId: "c-1", name: "react_native_hooks_guide.pdf", type: "pdf", sizeBytes: 2450000, downloads: 84 },
  { id: "res-2", courseId: "c-1", name: "navigation_video_lesson.mp4", type: "mp4", sizeBytes: 52000000, downloads: 140 },
  { id: "res-3", courseId: "c-2", name: "mudras_cheatsheet.pdf", type: "pdf", sizeBytes: 1200000, downloads: 45 }
];

export const seedRiskSummaries = (): StudentRiskSummary[] => [
  { studentId: "s-1", courseId: "c-1", attendanceRisk: "Low", assignmentRisk: "Low", examRisk: "Low", dropoutPrediction: "Low", certificateEligibility: false, interventionHistory: [] },
  { studentId: "s-2", courseId: "c-1", attendanceRisk: "Medium", assignmentRisk: "High", examRisk: "Medium", dropoutPrediction: "Medium", certificateEligibility: false, interventionHistory: [{ date: "2026-07-30", notes: "Called student to ask for pending assignments.", tutor: "Amit Verma" }] },
  { studentId: "s-3", courseId: "c-2", attendanceRisk: "Low", assignmentRisk: "Low", examRisk: "Low", dropoutPrediction: "Low", certificateEligibility: true, interventionHistory: [] },
  { studentId: "s-4", courseId: "c-2", attendanceRisk: "High", assignmentRisk: "High", examRisk: "High", dropoutPrediction: "High", certificateEligibility: false, interventionHistory: [{ date: "2026-07-28", notes: "Sent warning email due to 80% absenteeism.", tutor: "Priya Patel" }] }
];

// Calculation Functions
export const calculateGradeStatistics = (grades: GradeRecord) => {
  const base = 
    (grades.assignmentScore * 0.2) +
    (grades.quizScore * 0.15) +
    (grades.projectScore * 0.25) +
    (grades.midtermScore * 0.15) +
    (grades.finalScore * 0.25);
  
  let total = base + grades.bonusPoints - grades.penaltyPoints;
  if (grades.overrideScore !== undefined) {
    total = grades.overrideScore;
  }
  
  const percentage = Math.min(100, Math.max(0, Math.round(total)));
  
  let letterGrade = "F";
  let status: "Pass" | "Fail" | "Incomplete" = "Fail";
  let cgpa = 0.0;

  if (percentage >= 90) { letterGrade = "A"; status = "Pass"; cgpa = 4.0; }
  else if (percentage >= 80) { letterGrade = "B"; status = "Pass"; cgpa = 3.0; }
  else if (percentage >= 70) { letterGrade = "C"; status = "Pass"; cgpa = 2.0; }
  else if (percentage >= 60) { letterGrade = "D"; status = "Pass"; cgpa = 1.0; }
  else { letterGrade = "F"; status = "Fail"; cgpa = 0.0; }

  return { percentage, letterGrade, status, cgpa };
};

export const recalculateRisk = (
  studentId: string,
  courseId: string,
  gradesList: GradeRecord[],
  attendanceList: AttendanceRecord[]
): StudentRiskSummary => {
  // 1. Attendance Risk
  const courseAtt = attendanceList.filter(a => a.studentId === studentId && a.courseId === courseId);
  const totalClasses = courseAtt.length;
  const presentClasses = courseAtt.filter(a => a.status === "Present" || a.status === "Late" || a.status === "Excused").length;
  const attRate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

  let attendanceRisk: "Low" | "Medium" | "High" = "Low";
  if (attRate < 60) attendanceRisk = "High";
  else if (attRate < 80) attendanceRisk = "Medium";

  // 2. Exam/Assignment Risk
  const grade = gradesList.find(g => g.studentId === studentId && g.courseId === courseId);
  let assignmentRisk: "Low" | "Medium" | "High" = "Low";
  let examRisk: "Low" | "Medium" | "High" = "Low";

  if (grade) {
    if (grade.assignmentScore < 50) assignmentRisk = "High";
    else if (grade.assignmentScore < 70) assignmentRisk = "Medium";

    const avgExam = (grade.midtermScore + grade.finalScore) / 2;
    if (avgExam < 50) examRisk = "High";
    else if (avgExam < 70) examRisk = "Medium";
  }

  // 3. Dropout Prediction
  let dropoutPrediction: "Low" | "Medium" | "High" = "Low";
  if (attendanceRisk === "High" || assignmentRisk === "High" || examRisk === "High") {
    dropoutPrediction = "High";
  } else if (attendanceRisk === "Medium" || assignmentRisk === "Medium" || examRisk === "Medium") {
    dropoutPrediction = "Medium";
  }

  // 4. Certificate Eligibility
  const progress = attRate >= 80 && grade && calculateGradeStatistics(grade).status === "Pass" ? 100 : 50;
  const certificateEligibility = progress === 100;

  return {
    studentId,
    courseId,
    attendanceRisk,
    assignmentRisk,
    examRisk,
    dropoutPrediction,
    certificateEligibility,
    interventionHistory: []
  };
};
