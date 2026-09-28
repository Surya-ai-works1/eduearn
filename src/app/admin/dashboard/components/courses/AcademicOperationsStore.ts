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

// Initial Seed Data Functions (Consolidated: Returns empty defaults - authoritative database queries must be used)
export const seedCourses = (): Course[] => [];
export const seedStudents = (): Student[] => [];
export const seedTutorMetrics = (): TutorMetrics[] => [];
export const seedGrades = (): GradeRecord[] => [];
export const seedAttendance = (): AttendanceRecord[] => [];
export const seedExams = (): Exam[] => [];
export const seedQuestions = (): Question[] => [];
export const seedResources = (): ResourceItem[] => [];
export const seedRiskSummaries = (): StudentRiskSummary[] => [];

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
